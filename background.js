// Background script for BulletBase
// Handles persistent WebSocket connection for notifications

let socket = null;
let apiKey = null;

// Initialize
if (typeof chrome !== 'undefined' && chrome.storage) {
  chrome.storage.local.get(['pb_api_key'], (result) => {
    if (result.pb_api_key) {
      apiKey = result.pb_api_key;
      connectWebSocket();
    }
  });

  // Listen for login/logout from Popup
  chrome.storage.onChanged.addListener((changes, namespace) => {
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
      } else if (data.type === 'nop') {
        // Keep alive, do nothing
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

function handlePush(push) {
  // Handle Notification Mirroring and SMS
  if (push.type === 'mirror') {
    chrome.notifications.create(push.notification_id || `mirror-${Date.now()}`, {
      type: 'basic',
      iconUrl: push.icon ? `data:image/png;base64,${push.icon}` : 'https://www.pushbullet.com/img/header-logo.png',
      title: push.title || push.application_name || 'Notification',
      message: push.body || '',
      contextMessage: push.application_name
    });
  } else if (push.type === 'sms_changed') {
    // Optional: Notify user that SMS sync happened or new SMS arrived
    // Validating if it's an incoming SMS is harder without parsing the full object, 
    // but usually 'sms_changed' just means refresh the UI.
    // We trigger a generic alert if needed, or rely on 'mirror' for the actual SMS notification.
  } else if (push.type === 'link' || push.type === 'note') {
      chrome.notifications.create(`push-${push.iden}`, {
          type: 'basic',
          iconUrl: 'https://www.pushbullet.com/img/header-logo.png',
          title: push.title || 'New Push',
          message: push.body || (push.url ? 'Link received' : ''),
      });
  }
}