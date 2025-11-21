import React, { useState } from 'react';
import { Send, RefreshCw, Trash2, ExternalLink } from 'lucide-react';
import { Device, Push } from '../types';
import * as service from '../services/pushbulletService';

interface SendPushProps {
  apiKey: string;
  devices: Device[];
  pushes: Push[];
  loading: boolean;
  onRefresh: () => void;
  setLoading: (loading: boolean) => void;
}

const SendPush: React.FC<SendPushProps> = ({ apiKey, devices, pushes, loading, onRefresh, setLoading }) => {
  const [message, setMessage] = useState('');
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isUrl = (text: string) => {
    try {
      new URL(text);
      return true;
    } catch {
      return false;
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Please enter a message or URL');
      return;
    }

    setSending(true);
    setError(null);
    setSuccess(false);

    try {
      const pushData: any = selectedDevice ? { device_iden: selectedDevice } : {};

      if (isUrl(message.trim())) {
        pushData.type = 'link';
        pushData.url = message.trim();
      } else {
        pushData.type = 'note';
        pushData.body = message.trim();
      }

      await service.sendPush(apiKey, pushData);
      
      setSuccess(true);
      setMessage('');
      
      setTimeout(() => {
        setSuccess(false);
        onRefresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to send push');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (pushIden: string) => {
    setLoading(true);
    try {
      await service.deletePush(apiKey, pushIden);
      onRefresh();
    } catch (err) {
      console.error('Failed to delete push:', err);
    }
  };

  const pushableDevices = devices.filter(d => d.pushable);

  return (
    <div className="flex flex-col h-full">
      {/* Send Form */}
      <div className="p-4 bg-white border-b border-slate-200">
        <form onSubmit={handleSend} className="space-y-3">
          <div className="flex gap-2">
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">All Devices</option>
              {pushableDevices.map(device => (
                <option key={device.iden} value={device.iden}>
                  {device.nickname || device.model}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="p-2 text-slate-500 hover:text-emerald-600 rounded-lg"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type message or paste URL..."
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={sending || !message.trim()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
              Send
            </button>
          </div>

          {error && (
            <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
              {error}
            </div>
          )}

          {success && (
            <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-xs">
              Sent successfully!
            </div>
          )}
        </form>
      </div>

      {/* Push History */}
      <div className="flex-1 overflow-y-auto">
        {loading && pushes.length === 0 ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : pushes.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            No pushes yet. Send your first message above!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pushes.map((push) => (
              <div key={push.iden} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {push.title && (
                      <h4 className="font-semibold text-slate-800 text-sm mb-1 truncate">
                        {push.title}
                      </h4>
                    )}
                    {push.body && (
                      <p className="text-slate-600 text-sm mb-2 line-clamp-2">
                        {push.body}
                      </p>
                    )}
                    {push.url && (
                      <a
                        href={push.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:text-emerald-700 text-sm flex items-center gap-1 mb-2"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span className="truncate">{push.url}</span>
                      </a>
                    )}
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>{new Date(push.created * 1000).toLocaleString()}</span>
                      <span className="capitalize">{push.type}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(push.iden)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded transition-colors"
                    title="Delete push"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SendPush;
