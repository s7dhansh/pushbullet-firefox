import { Device, Push, User } from '../types';

const API_BASE = 'https://api.pushbullet.com/v2';

const getHeaders = (apiKey: string) => ({
  // Basic Auth with empty password is more robust for browser extensions to avoid header stripping
  'Authorization': 'Basic ' + btoa(apiKey + ':'),
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
  return data.pushes;
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

export const sendSMS = async (
  apiKey: string,
  sourceDeviceIden: string,
  phoneNumber: string,
  message: string
): Promise<void> => {
  const payload = {
    push: {
      type: 'messaging_extension_reply',
      package_name: 'com.pushbullet.android',
      source_user_iden: 'target_user_iden_placeholder',
      target_device_iden: sourceDeviceIden,
      conversation_iden: phoneNumber,
      message: message,
    },
    type: 'push',
  };
  
  const res = await fetch(`${API_BASE}/ephemerals`, {
    method: 'POST',
    headers: getHeaders(apiKey),
    body: JSON.stringify(payload),
  });
  
  if (!res.ok) throw new Error('Failed to send SMS');
};

export const deletePush = async (apiKey: string, pushIden: string): Promise<void> => {
  const res = await fetch(`${API_BASE}/pushes/${pushIden}`, {
    method: 'DELETE',
    headers: getHeaders(apiKey),
  });
  if (!res.ok) throw new Error('Failed to delete push');
};

export const createWebSocket = (apiKey: string, onMessage: (data: any) => void) => {
  const ws = new WebSocket(`wss://stream.pushbullet.com/websocket/${apiKey}`);
  
  ws.onopen = () => {
    console.log('Pushbullet Stream Connected');
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (e) {
      console.error('Error parsing WS message', e);
    }
  };

  ws.onerror = (e) => {
    console.error('WebSocket error', e);
  };
  
  return ws;
};