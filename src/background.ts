declare const chrome: any;

let socket: WebSocket | null = null;
let apiKey: string | null = null;

if (typeof chrome !== 'undefined' && chrome.storage) {
  chrome.storage.local.get(['pb_api_key'], (result: any) => {
    if (result.pb_api_key) {
      apiKey = result.pb_api_key;
      connectWebSocket();
    }
  });

  chrome.storage.onChanged.addListener((changes: any, namespace: string) => {
    if (namespace === 'local' && changes.pb_api_key) {
      apiKey = changes.pb_api_key.newValue;
      if (apiKey) {
        connectWebSocket();
      } else {
        if (socket) socket.close();
      }
    }
  });
}

function connectWebSocket() {
  if (socket) {
    socket.close();
  }

  if (!apiKey) return;

  console.log('Connecting to Pushbullet Stream...');
  socket = new WebSocket(`wss://stream.pushbullet.com/websocket/${apiKey}`);

  socket.onopen = () => {
    console.log('Pushbullet Stream Connected (Background)');
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'push' && data.push) {
        handlePush(data.push);
      }
    } catch (e) {
      console.error('Error parsing WS message', e);
    }
  };

  socket.onclose = () => {
    console.log('Stream disconnected, retrying in 5s...');
    setTimeout(connectWebSocket, 5000);
  };

  socket.onerror = (e) => {
    console.error('WebSocket error', e);
  };
}

function handlePush(push: any) {
  if (push.type === 'mirror') {
    chrome.notifications.create(push.notification_id || `mirror-${Date.now()}`, {
      type: 'basic',
      iconUrl: push.icon ? `data:image/png;base64,${push.icon}` : 'https://www.pushbullet.com/img/header-logo.png',
      title: push.title || push.application_name || 'Notification',
      message: push.body || '',
      contextMessage: push.application_name
    });
  } else if (push.type === 'link' || push.type === 'note') {
      chrome.notifications.create(`push-${push.iden}`, {
          type: 'basic',
          iconUrl: 'https://www.pushbullet.com/img/header-logo.png',
          title: push.title || 'New Push',
          message: push.body || (push.url ? 'Link received' : ''),
      });
  }
}

export {};
