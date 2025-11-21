
import {Push, SmsThread, SmsMessage} from './types';

declare const chrome: any;

let socket: WebSocket | null = null;
let apiKey: string | null = null;
let userIden: string | null = null;
let reconnectAttempts = 0;
const maxReconnectDelay = 60000; // Maximum 60 seconds between reconnection attempts
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let intentionalClose = false;
let isConnecting = false;
let pendingSmsTimer: ReturnType<typeof setTimeout> | null = null;

if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.get(['pb_api_key','pb_user_iden'], (result: any) => {
        if (result.pb_api_key) {
            apiKey = result.pb_api_key;
            reconnectAttempts = 0;
            connectWebSocket();
        }
        if (result.pb_user_iden) {
            userIden = result.pb_user_iden;
        }
    });

	chrome.storage.onChanged.addListener((changes: any, namespace: string) => {
		if (namespace === 'local' && changes.pb_api_key) {
			const nextKey = changes.pb_api_key.newValue;
			const prevKey = changes.pb_api_key.oldValue;
			if (nextKey === apiKey || nextKey === prevKey) return;
			apiKey = nextKey;
			if (apiKey) {
				reconnectAttempts = 0;
				connectWebSocket();
			} else {
				intentionalClose = true;
				if (socket) socket.close();
			}
		}
        if (namespace === 'local' && changes.pb_user_iden) {
            userIden = changes.pb_user_iden.newValue;
        }
    });
}

function connectWebSocket() {
	if (isConnecting) return;
	if (!apiKey) return;
	if (reconnectTimer) {
		clearTimeout(reconnectTimer);
		reconnectTimer = null;
	}
	if (socket) {
		intentionalClose = true;
		socket.close();
	}
	console.log('Connecting to Pushbullet Stream...');
	isConnecting = true;
	socket = new WebSocket(`wss://stream.pushbullet.com/websocket/${apiKey}`);

	socket.onopen = () => {
		console.log('Pushbullet Stream Connected (Background)');
		reconnectAttempts = 0;
		isConnecting = false;
		intentionalClose = false;
		if (reconnectTimer) {
			clearTimeout(reconnectTimer);
			reconnectTimer = null;
		}
	};

	socket.onmessage = (event) => {
		try {
			const data = JSON.parse(event.data);
            if (data.type === 'push' && data.push) {
                const p = data.push as Push & { data?: { threads?: SmsThread[]; messages?: SmsMessage[] } };
                handlePush(p);
                if (p.type === 'sms_changed' && apiKey && userIden && (p as any).source_device_iden) {
                    fetchSMSThreads(apiKey, userIden, (p as any).source_device_iden).catch(() => {});
                }
                if (p.type === 'messaging_extension_reply' && p.data) {
                    if (pendingSmsTimer) { clearTimeout(pendingSmsTimer); pendingSmsTimer = null; }
                    if (p.data.messages && p.data.messages.length > 0) {
                        const msgs: SmsMessage[] = [...p.data.messages].sort((a,b) => a.timestamp - b.timestamp);
                        const last = msgs[msgs.length - 1];
                        createNotification(p.title || 'SMS', last.body || '', undefined, (p as any).notification_id);
                    } else if (p.data.threads && p.data.threads.length > 0) {
                        const ths: SmsThread[] = [...p.data.threads].sort((a,b) => b.timestamp - a.timestamp);
                        const t = ths[0];
                        const r: any = t.recipients && t.recipients.length > 0 ? t.recipients[0] : { name: 'SMS', address: '' };
                        const title = r.name || r.address || 'SMS';
                        createNotification(title, t.latest_message || '', undefined, undefined);
                    }
                }
            } else if (data.type === 'tickle') {
            }
		} catch (e) {
			console.error('Error parsing WS message', e);
		}
	};

	socket.onclose = () => {
		isConnecting = false;
		const shouldReconnect = apiKey && !intentionalClose;
		intentionalClose = false;
		if (shouldReconnect) {
			const delay = Math.min(5000 * Math.pow(2, reconnectAttempts), maxReconnectDelay);
			reconnectAttempts++;
			console.log(`Stream disconnected, retrying in ${delay/1000}s... (attempt ${reconnectAttempts})`);
			if (reconnectTimer) clearTimeout(reconnectTimer);
			reconnectTimer = setTimeout(connectWebSocket, delay);
		}
	};

	socket.onerror = (e) => {
		console.error('WebSocket error', e);
	};
}

function createNotification(title: string, body: string, iconBase64?: string, id?: string) {
    chrome.notifications.create(id || `sms-${Date.now()}`, {
        type: 'basic',
        iconUrl: iconBase64 ? `data:image/png;base64,${iconBase64}` : 'icon.svg',
        title,
        message: body || '',
        priority: 2
    });
}

function handlePush(push: Push) {
    if (push.type === 'mirror') {
        createNotification(push.title || (push as any).application_name || 'Notification', push.body || '', (push as any).icon, (push as any).notification_id);
        if (apiKey && userIden && (push as any).source_device_iden) {
            fetchSMSThreads(apiKey, userIden, (push as any).source_device_iden).catch(() => {});
        }
    } else if (push.type === 'link' || push.type === 'note') {
            createNotification(push.title || 'New Push', push.body || (push as any).url ? 'Link received' : '', undefined, `push-${push.iden}`);
    }
}

// Minimal ephemeral helpers (avoid imports in MV2 background)
const API_BASE = 'https://api.pushbullet.com/v2';
const getHeaders = (key: string) => ({ 'Access-Token': key, 'Content-Type': 'application/json' });
const sendEphemeral = async (key: string, payload: any) => {
    const res = await fetch(`${API_BASE}/ephemerals`, {
        method: 'POST',
        headers: getHeaders(key),
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Failed ephemeral: ${res.status}`);
    return res.json();
};
const fetchSMSThreads = async (key: string, user: string, device: string) => {
    return sendEphemeral(key, {
        type: 'push',
        push: {
            type: 'messaging_extension_list_threads',
            package_name: 'com.pushbullet.android',
            source_user_iden: user,
            target_device_iden: device,
        },
    });
};

export { };
