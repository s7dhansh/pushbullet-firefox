import React, { useState, useEffect, useRef } from 'react';
import { Smartphone, Send, RefreshCw, ArrowLeft, PenSquare, AlertCircle } from 'lucide-react';
import { Device, SmsThread, SmsMessage, Push, User } from '../types';
import * as service from '../services/pushbulletService';

interface SmsClientProps {
  apiKey: string;
  user: User;
  devices: Device[];
  wsPush: Push | null;
}

const SmsClient: React.FC<SmsClientProps> = ({ apiKey, user, devices, wsPush }) => {
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [threads, setThreads] = useState<SmsThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SmsMessage[]>([]);
  const [smsDraft, setSmsDraft] = useState('');

  // Loading States
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [timeoutError, setTimeoutError] = useState<string | null>(null);
  const [fallbackNotifications, setFallbackNotifications] = useState<Push[]>([]);
  const [usingFallback, setUsingFallback] = useState(false);

  const [isComposing, setIsComposing] = useState(false);
  const [newSmsRecipient, setNewSmsRecipient] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Helper to manage loading with timeout
  const startLoadingTimeout = (type: 'threads' | 'messages') => {
    setTimeoutError(null);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      if (type === 'threads') setLoadingThreads(false);
      if (type === 'messages') setLoadingMessages(false);
      setTimeoutError('Request timed out. Showing recent SMS notifications as fallback.');
      // Fallback: load recent SMS-like pushes
      try {
        const recent = await service.getPushes(apiKey, 50);
        const smsLike = recent
          .filter((p) => p.type === 'sms_changed' || p.type === 'mirror')
          .filter((p) => !selectedDevice || p.source_device_iden === selectedDevice);
        // Deduplicate by title+body+timestamp
        const keySet = new Set<string>();
        const deduped: Push[] = [];
        smsLike
          .sort((a, b) => (b.modified || b.created) - (a.modified || a.created))
          .forEach((p) => {
            const k = `${p.title || ''}|${p.body || ''}|${p.created}`;
            if (!keySet.has(k)) {
              keySet.add(k);
              deduped.push(p);
            }
          });
        setFallbackNotifications(deduped);
        setUsingFallback(true);
      } catch (e) {
        console.error('Fallback load error:', e);
      }
    }, 5000);
  };

  // Auto-select first phone if none selected
  useEffect(() => {
    if (!selectedDevice && devices.length > 0) {
      const phone = devices.find((d) => d.has_sms);
      if (phone) setSelectedDevice(phone.iden);
    }
  }, [devices, selectedDevice]);

  // Process incoming WS data
  useEffect(() => {
    if (!wsPush) return;

    if (wsPush.type === 'messaging_extension_reply') {
      const data = wsPush.data;

      if (!data) return;

      // Update threads list
      if (data.threads) {
        setThreads(data.threads);
        setLoadingThreads(false);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setTimeoutError(null);
      }

      // Update messages list
      if (data.messages) {
        const msgs = data.messages;
        const newMessages = [...msgs].reverse();
        setMessages(newMessages);
        setLoadingMessages(false);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setTimeoutError(null);
      }
    }

    // Handle SMS-specific pushes for notifications and refresh
    if (wsPush.type === 'sms_changed') {
      const src = wsPush.source_device_iden;
      const notifs = (wsPush as any).notifications || [];
      if (selectedDevice && src === selectedDevice && Array.isArray(notifs) && notifs.length > 0) {
        const byThread: Record<string, { title: string; body: string; timestamp: number }> = {};
        notifs.forEach((n: any) => {
          if (!byThread[n.thread_id] || byThread[n.thread_id].timestamp < n.timestamp) {
            byThread[n.thread_id] = { title: n.title, body: n.body, timestamp: n.timestamp };
          }
        });
        const minimalThreads: SmsThread[] = Object.keys(byThread)
          .map((tid) => {
            const latest = byThread[tid];
            return {
              id: tid,
              address: '',
              recipients: [{ name: latest.title, address: '', number: '' }],
              latest_message: latest.body,
              timestamp: latest.timestamp,
            };
          })
          .sort((a, b) => b.timestamp - a.timestamp);
        setThreads(minimalThreads);
        setLoadingThreads(false);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setTimeoutError(null);
        setUsingFallback(false);
      }

      if (selectedDevice) {
        service.fetchSMSThreads(apiKey, user.iden, selectedDevice);
        if (selectedThreadId) {
          service.fetchThreadMessages(apiKey, user.iden, selectedDevice, selectedThreadId);
        }
      }
    }
  }, [wsPush, apiKey, user.iden, selectedDevice, selectedThreadId]);

  // Fetch threads when device changes
  useEffect(() => {
    if (selectedDevice) {
      setLoadingThreads(true);
      startLoadingTimeout('threads');
      service
        .fetchSMSThreads(apiKey, user.iden, selectedDevice)
        .then(() => {
          setUsingFallback(false);
          setFallbackNotifications([]);
        })
        .catch((err) => {
          console.error(err);
          setLoadingThreads(false);
        });
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [selectedDevice, apiKey, user.iden]);

  // Fetch messages when thread selected
  useEffect(() => {
    if (selectedDevice && selectedThreadId) {
      setLoadingMessages(true);
      startLoadingTimeout('messages');
      service
        .fetchThreadMessages(apiKey, user.iden, selectedDevice, selectedThreadId)
        .catch((err) => {
          console.error(err);
          setLoadingMessages(false);
        });
    }
  }, [selectedDevice, selectedThreadId, apiKey, user.iden]);

  // Scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Poll for updates periodically as a fallback - only when no recent WebSocket activity
  useEffect(() => {
    if (!selectedDevice) return; // Don't poll if no device selected

    const interval = setInterval(() => {
      // Only poll if we haven't received recent WebSocket updates
      if (selectedThreadId) {
        service
          .fetchThreadMessages(apiKey, user.iden, selectedDevice, selectedThreadId)
          .catch((err) => {
            console.error('Polling error (messages):', err);
          });
      } else {
        service.fetchSMSThreads(apiKey, user.iden, selectedDevice).catch((err) => {
          console.error('Polling error (threads):', err);
        });
      }
    }, 30000); // Poll every 30 seconds as a fallback

    return () => clearInterval(interval);
  }, [selectedDevice, selectedThreadId, apiKey, user.iden]);

  const handleSendSMS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDevice || (!selectedThreadId && !newSmsRecipient) || !smsDraft.trim()) return;

    const target = selectedThreadId || newSmsRecipient;

    // Optimistic update
    const tempMsg: SmsMessage = {
      id: Date.now().toString(),
      direction: '2',
      body: smsDraft,
      timestamp: Date.now() / 1000,
      status: 'sending',
    };

    if (selectedThreadId) {
      setMessages((prev) => [...prev, tempMsg]);
    }

    const msgToSend = smsDraft;
    setSmsDraft('');

    if (isComposing) {
      setIsComposing(false);
      setNewSmsRecipient('');
      setLoadingThreads(true);
      startLoadingTimeout('threads');
    }

    try {
      await service.sendSMS(apiKey, user.iden, selectedDevice, target, msgToSend);
      // Refresh after a delay to allow sync
      setTimeout(() => {
        if (selectedThreadId) {
          service.fetchThreadMessages(apiKey, user.iden, selectedDevice, selectedThreadId);
        } else {
          service.fetchSMSThreads(apiKey, user.iden, selectedDevice);
        }
      }, 2000);
    } catch (err) {
      alert('Failed to send SMS. Check connection.');
      if (selectedThreadId) {
        setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id));
      }
    }
  };

  const handleRetry = () => {
    if (selectedThreadId && selectedDevice) {
      setLoadingMessages(true);
      startLoadingTimeout('messages');
      setTimeoutError(null); // Clear previous timeout error
      service
        .fetchThreadMessages(apiKey, user.iden, selectedDevice, selectedThreadId)
        .catch((err) => {
          console.error('Retry error:', err);
          setLoadingMessages(false);
        });
    } else if (selectedDevice) {
      setLoadingThreads(true);
      startLoadingTimeout('threads');
      setTimeoutError(null); // Clear previous timeout error
      service.fetchSMSThreads(apiKey, user.iden, selectedDevice).catch((err) => {
        console.error('Retry error:', err);
        setLoadingThreads(false);
      });
    }
  };

  if (!selectedDevice) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <Smartphone className="w-12 h-12 mb-4 opacity-20" />
        <p>Please select a phone to view SMS</p>
        <select
          id="device-select"
          aria-label="Select Device"
          className="mt-4 p-2 border rounded-lg"
          onChange={(e) => setSelectedDevice(e.target.value)}
          defaultValue=""
        >
          <option value="" disabled>
            Select Device
          </option>
          {devices
            .filter((d) => d.has_sms)
            .map((d) => (
              <option key={d.iden} value={d.iden}>
                {d.nickname || d.model}
              </option>
            ))}
        </select>
      </div>
    );
  }

  if (isComposing) {
    return (
      <div className="flex flex-col h-full bg-slate-50">
        <div className="flex items-center p-3 bg-white border-b border-slate-200 shadow-sm">
          <button
            aria-label="Go back to SMS list"
            type="button"
            onClick={() => setIsComposing(false)}
            className="mr-3 p-1 hover:bg-slate-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h3 className="font-semibold text-slate-800">New Message</h3>
        </div>
        <div className="p-4">
          <label className="block text-xs font-medium text-slate-500 mb-1">Recipient</label>
          <input
            type="tel"
            value={newSmsRecipient}
            onChange={(e) => setNewSmsRecipient(e.target.value)}
            placeholder="+1 234 567 8900"
            className="w-full p-3 border border-slate-300 rounded-lg mb-4 focus:ring-2 focus:ring-emerald-500"
          />
          <label className="block text-xs font-medium text-slate-500 mb-1">Message</label>
          <textarea
            value={smsDraft}
            onChange={(e) => setSmsDraft(e.target.value)}
            placeholder="Type your message..."
            rows={4}
            className="w-full p-3 border border-slate-300 rounded-lg mb-4 focus:ring-2 focus:ring-emerald-500"
          />
          <button
            aria-label="Send message"
            type="submit"
            onClick={handleSendSMS}
            disabled={!newSmsRecipient || !smsDraft}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white p-3 rounded-lg font-medium flex items-center justify-center"
          >
            <Send className="w-4 h-4 mr-2" /> Send
          </button>
        </div>
      </div>
    );
  }

  if (selectedThreadId) {
    const currentThread = threads.find((t) => t.id === selectedThreadId);
    return (
      <div className="flex flex-col h-full bg-slate-50">
        <div className="flex items-center p-3 bg-white border-b border-slate-200 shadow-sm">
          <button
            aria-label="Go back to SMS list"
            type="button"
            onClick={() => setSelectedThreadId(null)}
            className="mr-3 p-1 hover:bg-slate-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex-1 overflow-hidden">
            <h3 className="font-semibold text-slate-800 truncate">
              {currentThread?.recipients[0]?.name ||
                currentThread?.recipients[0]?.address ||
                'Unknown'}
            </h3>
            <p className="text-xs text-slate-500 truncate">
              {currentThread?.recipients[0]?.number}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {timeoutError && (
            <div className="p-4 text-center text-xs text-amber-600 bg-amber-50 rounded-lg border border-amber-100 mb-4">
              <AlertCircle className="w-4 h-4 mx-auto mb-1" />
              {timeoutError}
              <button
                aria-label="Retry fetching messages"
                type="button"
                onClick={handleRetry}
                className="block w-full mt-2 text-amber-700 font-bold hover:underline"
              >
                Retry
              </button>
            </div>
          )}
          {loadingMessages ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
            </div>
          ) : messages.length === 0 && !timeoutError ? (
            <div className="text-center text-slate-400 text-sm py-10">No messages found</div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={msg.id || idx}
                className={`flex ${msg.direction === '2' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2 rounded-xl text-sm ${
                    msg.direction === '2'
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                  }`}
                >
                  {msg.body}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 bg-white border-t border-slate-200">
          <form onSubmit={handleSendSMS} className="flex items-center space-x-2">
            <input
              type="text"
              value={smsDraft}
              onChange={(e) => setSmsDraft(e.target.value)}
              placeholder="Text message"
              className="flex-1 px-4 py-2 border border-slate-300 rounded-full text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            />
            <button
              aria-label="Send message"
              type="submit"
              className="p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center shadow-sm z-10">
        <select
          aria-label="Select SMS device"
          value={selectedDevice}
          onChange={(e) => setSelectedDevice(e.target.value)}
          className="max-w-[200px] p-1.5 border border-slate-300 rounded-lg text-sm bg-slate-50 outline-none"
        >
          {devices
            .filter((d) => d.has_sms)
            .map((d) => (
              <option key={d.iden} value={d.iden}>
                {d.nickname || d.model}
              </option>
            ))}
        </select>
        <button
          aria-label="Refresh SMS threads"
          type="button"
          onClick={() => service.fetchSMSThreads(apiKey, user.iden, selectedDevice)}
          className="p-2 text-slate-500 hover:text-emerald-600 rounded-full"
        >
          <RefreshCw className={`w-4 h-4 ${loadingThreads ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {timeoutError && (
          <div className="m-4 p-4 text-center text-xs text-amber-600 bg-amber-50 rounded-lg border border-amber-100">
            <AlertCircle className="w-4 h-4 mx-auto mb-1" />
            {timeoutError}
            <button
              aria-label="Retry fetching SMS threads"
              type="button"
              onClick={handleRetry}
              className="block w-full mt-2 text-amber-700 font-bold hover:underline"
            >
              Retry
            </button>
          </div>
        )}
        {loadingThreads && threads.length === 0 ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : threads.length === 0 && !timeoutError && !usingFallback ? (
          <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-sm px-6">
            No SMS threads found. Make sure your Android device is on.
          </div>
        ) : usingFallback ? (
          <div className="p-4">
            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Recent SMS notifications
            </h4>
            <div className="space-y-2">
              {fallbackNotifications.map((p, idx) => (
                <div
                  key={p.iden || idx}
                  className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                >
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {p.title || 'SMS'}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">{p.body}</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                    {new Date((p.modified || p.created) * 1000).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              Try the Retry button above once your phone is awake.
            </div>
          </div>
        ) : (
          threads.map((thread) => {
            const recipient =
              thread.recipients && thread.recipients.length > 0
                ? thread.recipients[0]
                : { name: 'Unknown', address: 'Unknown', number: '' };
            return (
              <button
                key={thread.id}
                onClick={() => setSelectedThreadId(thread.id)}
                className="w-full p-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-start text-left transition-colors"
              >
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center shrink-0 mr-3 text-slate-500 dark:text-slate-300 font-semibold">
                  {recipient.name ? recipient.name[0].toUpperCase() : '#'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm truncate pr-2">
                      {recipient.name || recipient.address}
                    </h4>
                    {thread.timestamp && (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
                        {new Date(thread.timestamp * 1000).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {thread.latest_message}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Floating Action Button */}
      <button
        aria-label="Compose new message"
        type="button"
        onClick={() => setIsComposing(true)}
        className="absolute bottom-6 right-6 w-12 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105"
      >
        <PenSquare className="w-6 h-6" />
      </button>
    </div>
  );
};

export default SmsClient;
