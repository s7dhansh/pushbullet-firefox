import { Device, Push, User, WebSocketMessage } from '../types';

const API_BASE = 'https://api.pushbullet.com/v2';

const getHeaders = (apiKey: string) => ({
  'Access-Token': apiKey,
  'Content-Type': 'application/json',
});

export const getCurrentUser = async (apiKey: string): Promise<User> => {
  const res = await fetch(`${API_BASE}/users/me`, {
    headers: getHeaders(apiKey),
  });
  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json();
};

export const getDevices = async (apiKey: string): Promise<Device[]> => {
  const res = await fetch(`${API_BASE}/devices`, {
    headers: getHeaders(apiKey),
  });
  if (!res.ok) throw new Error('Failed to fetch devices');
  const data = await res.json();
  return data.devices.filter((d: Device) => d.active);
};

export const getPushes = async (apiKey: string, limit = 20): Promise<Push[]> => {
  const res = await fetch(`${API_BASE}/pushes?limit=${limit}`, {
    headers: getHeaders(apiKey),
  });
  if (!res.ok) throw new Error('Failed to fetch pushes');
  const data = await res.json();
  return (data.pushes || []).filter((p: Push) => p.active !== false && !p.dismissed);
};

export const sendPush = async (
  apiKey: string,
  data: { type: string; title?: string; body?: string; url?: string; device_iden?: string }
): Promise<Push> => {
  const res = await fetch(`${API_BASE}/pushes`, {
    method: 'POST',
    headers: getHeaders(apiKey),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to send push');
  return res.json();
};

// Generic ephemeral sender
const sendEphemeral = async (apiKey: string, payload: any) => {
  const res = await fetch(`${API_BASE}/ephemerals`, {
    method: 'POST',
    headers: getHeaders(apiKey),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Ephemeral request failed:', errorText);
    throw new Error(`Failed to send ephemeral: ${res.status} - ${errorText}`);
  }
  return res.json(); // Return response to allow better debugging
};

export const sendSMS = async (
  apiKey: string,
  userIden: string,
  sourceDeviceIden: string,
  phoneNumber: string,
  message: string
): Promise<void> => {
  const payload = {
    push: {
      type: 'messaging_extension_reply',
      package_name: 'com.pushbullet.android',
      source_user_iden: userIden,
      target_device_iden: sourceDeviceIden,
      conversation_iden: phoneNumber,
      message: message,
    },
    type: 'push',
  };
  await sendEphemeral(apiKey, payload);
};

export const fetchSMSThreads = async (
  apiKey: string,
  userIden: string,
  deviceIden: string
): Promise<any> => {
  const payload = {
    type: 'push',
    push: {
      type: 'messaging_extension_list_threads',
      package_name: 'com.pushbullet.android',
      source_user_iden: userIden,
      target_device_iden: deviceIden,
    },
  };
  return await sendEphemeral(apiKey, payload);
};

export const fetchThreadMessages = async (
  apiKey: string,
  userIden: string,
  deviceIden: string,
  threadId: string
): Promise<any> => {
  const payload = {
    type: 'push',
    push: {
      type: 'messaging_extension_list_messages',
      package_name: 'com.pushbullet.android',
      source_user_iden: userIden,
      target_device_iden: deviceIden,
      conversation_iden: threadId,
    },
  };
  return await sendEphemeral(apiKey, payload);
};

export const deletePush = async (apiKey: string, pushIden: string): Promise<void> => {
  const res = await fetch(`${API_BASE}/pushes/${pushIden}`, {
    method: 'DELETE',
    headers: getHeaders(apiKey),
  });
  if (!res.ok) {
    let details = '';
    try {
      details = await res.text();
    } catch (e) {
      details = '';
    }
    console.error('Delete push failed', { status: res.status, pushIden, details });
    throw new Error('Failed to delete push');
  }
};

export const createWebSocket = (apiKey: string, onMessage: (data: WebSocketMessage) => void) => {
  const ws = new WebSocket(`wss://stream.pushbullet.com/websocket/${apiKey}`);

  ws.onopen = () => {
    console.log('Pushbullet Stream Connected');
  };

  ws.onmessage = (event: MessageEvent) => {
    try {
      const rawData = event.data;
      if (typeof rawData === 'string') {
        const data = JSON.parse(rawData);
        onMessage(data);
      }
    } catch (e) {
      console.error('Error parsing WS message', e);
    }
  };

  ws.onerror = (e) => {
    console.error('WebSocket error', e);
  };

  return ws;
};
