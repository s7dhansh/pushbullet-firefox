import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Tab, Device, Push, User, WebSocketMessage } from '../types';
import * as service from '../services/pushbulletService';
import Sidebar from './Sidebar';
import DeviceList from './DeviceList';
import SmsClient from './SmsClient';
import SendPush from './SendPush';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const chrome: any;

interface DashboardProps {
  apiKey: string;
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ apiKey, user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.PUSHES);
  const [devices, setDevices] = useState<Device[]>([]);
  const [pushes, setPushes] = useState<Push[]>([]);
  const [loading, setLoading] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Pass WS updates to children
  const [wsPush, setWsPush] = useState<Push | null>(null);

  // Check if running as extension
  const isExtension = typeof chrome !== 'undefined' && !!chrome.runtime && !!chrome.runtime.id;

  const loadData = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const [d, p] = await Promise.all([service.getDevices(apiKey), service.getPushes(apiKey)]);
      setDevices(d);
      setPushes(p);
    } catch (error: any) {
      console.error('Data load error:', error);
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        setApiError(
          'Network Error: CORS blocked or Offline. If using Web Preview, the Pushbullet API will be blocked by the browser. Please install as an Extension to function.'
        );
      } else {
        setApiError(`Error: ${error.message || 'Failed to load data'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    let ws: WebSocket | null = null;
    try {
      ws = service.createWebSocket(apiKey, (data: WebSocketMessage) => {
        if (data.type === 'tickle') {
          if (data.subtype === 'push') {
            service.getPushes(apiKey).then(setPushes).catch(console.error);
          } else if (data.subtype === 'device') {
            service.getDevices(apiKey).then(setDevices).catch(console.error);
          }
        } else if (data.type === 'push' && data.push) {
          const pushData = data.push;

          setWsPush(pushData);

          if (pushData.type === 'mirror') {
            if (!isExtension && 'Notification' in window && Notification.permission === 'granted') {
              new Notification(pushData.title || 'New Notification', {
                body: pushData.body,
                icon: pushData.icon ? `data:image/png;base64,${pushData.icon}` : undefined,
              });
            }
          }
        }
      });

      ws.onopen = () => setWsConnected(true);
      ws.onclose = () => setWsConnected(false);
    } catch (e) {
      console.error('WS Setup failed', e);
    }

    return () => {
      if (ws) ws.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  const requestNotificationPermission = () => {
    if (!isExtension && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  return (
    <div className="flex h-full bg-slate-50 overflow-hidden relative">
      {/* Error Banner */}
      {apiError && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-red-600 text-white px-4 py-2 text-xs flex items-center justify-between shadow-md">
          <span className="flex items-center truncate pr-2">
            <AlertTriangle className="w-4 h-4 mr-2 shrink-0" />
            {apiError}
          </span>
          <button title="Close error banner" onClick={() => setApiError(null)}>
            <X className="w-4 h-4 shrink-0" />
          </button>
        </div>
      )}

      <Sidebar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={onLogout}
        wsConnected={wsConnected}
        requestNotificationPermission={requestNotificationPermission}
      />

      <main className="flex-1 overflow-hidden h-full relative bg-white md:bg-slate-50 flex flex-col">
        {activeTab === Tab.DEVICES && (
          <div className="h-full overflow-y-auto no-scrollbar">
            <DeviceList devices={devices} />
          </div>
        )}

        {activeTab === Tab.PUSHES && (
          <div className="h-full overflow-hidden">
            <SendPush
              apiKey={apiKey}
              devices={devices}
              pushes={pushes}
              loading={loading}
              onRefresh={loadData}
              setLoading={setLoading}
            />
          </div>
        )}

        {activeTab === Tab.SMS && (
          <div className="h-full overflow-hidden">
            <SmsClient apiKey={apiKey} user={user} devices={devices} wsPush={wsPush} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
