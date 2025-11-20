import React, { useState, useEffect, useRef } from 'react';
import { 
  Smartphone, 
  MessageSquare, 
  Bell, 
  Send, 
  LogOut, 
  RefreshCw, 
  Link as LinkIcon, 
  FileText, 
  Trash2,
  Globe,
  Laptop,
  ArrowLeft,
  PenSquare,
  AlertTriangle,
  X
} from 'lucide-react';
import { Tab, Device, Push, User, WebSocketMessage, SmsThread, SmsMessage } from '../types';
import * as service from '../services/pushbulletService';

declare const chrome: any;

interface DashboardProps {
  apiKey: string;
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ apiKey, user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DEVICES);
  const [devices, setDevices] = useState<Device[]>([]);
  const [pushes, setPushes] = useState<Push[]>([]);
  const [loading, setLoading] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // SMS Client State
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [threads, setThreads] = useState<SmsThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SmsMessage[]>([]);
  const [smsDraft, setSmsDraft] = useState('');
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [newSmsRecipient, setNewSmsRecipient] = useState('');

  // New Push State
  const [pushTitle, setPushTitle] = useState('');
  const [pushBody, setPushBody] = useState('');
  const [pushUrl, setPushUrl] = useState('');
  const [pushType, setPushType] = useState<'note' | 'link'>('note');

  // Check if running as extension
  const isExtension = typeof chrome !== 'undefined' && !!chrome.runtime && !!chrome.runtime.id;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const [d, p] = await Promise.all([
        service.getDevices(apiKey),
        service.getPushes(apiKey)
      ]);
      setDevices(d);
      setPushes(p);
      
      // Auto-select first phone for SMS if not set
      const phone = d.find(device => device.has_sms);
      if (phone && !selectedDevice) {
        setSelectedDevice(phone.iden);
      }
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes('Failed to fetch')) {
          setApiError("Connection failed. If you are in a web preview, this is likely due to CORS blocking the Pushbullet API. Please install the extension to test fully.");
      } else {
          setApiError("Failed to load data. Please check your network.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Fetch threads when device changes or tab changes to SMS
  useEffect(() => {
    if (activeTab === Tab.SMS && selectedDevice) {
        setLoadingThreads(true);
        service.fetchSMSThreads(apiKey, selectedDevice).catch(err => {
            console.error(err);
            setLoadingThreads(false);
        });
    }
  }, [activeTab, selectedDevice, apiKey]);

  // Fetch messages when thread selected
  useEffect(() => {
    if (activeTab === Tab.SMS && selectedDevice && selectedThreadId) {
        setLoadingMessages(true);
        service.fetchThreadMessages(apiKey, selectedDevice, selectedThreadId).catch(err => {
             console.error(err);
             setLoadingMessages(false);
        });
    }
  }, [activeTab, selectedDevice, selectedThreadId, apiKey]);

  useEffect(() => {
    loadData();
    
    const ws = service.createWebSocket(apiKey, (data: WebSocketMessage) => {
      if (data.type === 'tickle') {
        if (data.subtype === 'push') {
            service.getPushes(apiKey).then(setPushes);
        } else if (data.subtype === 'device') {
            service.getDevices(apiKey).then(setDevices);
        }
      } else if (data.type === 'push' && data.push) {
        const pushData = data.push;
        
        // Handle SMS Thread List
        if (pushData.type === 'messaging_extension_reply' && pushData.data?.threads) {
            setThreads(pushData.data.threads);
            setLoadingThreads(false);
        }
        
        // Handle Messages List
        if (pushData.type === 'messaging_extension_reply' && pushData.data?.messages) {
             // Pushbullet returns messages in reverse chrono usually
             setMessages(pushData.data.messages.reverse());
             setLoadingMessages(false);
        }

        // Handle Mirroring & Incoming SMS Notification
        if (pushData.type === 'mirror' || pushData.type === 'sms_changed') {
           // If we are in the SMS tab and viewing the relevant thread, update?
           if (pushData.type === 'sms_changed' && selectedDevice) {
             service.fetchSMSThreads(apiKey, selectedDevice);
             if (selectedThreadId) {
                 service.fetchThreadMessages(apiKey, selectedDevice, selectedThreadId);
             }
           }

           if (!isExtension && Notification.permission === 'granted' && pushData.type === 'mirror') {
             new Notification(pushData.title || 'New Notification', {
               body: pushData.body,
               icon: pushData.icon ? `data:image/png;base64,${pushData.icon}` : undefined
             });
           }
        }
      }
    });
    
    ws.onopen = () => setWsConnected(true);
    ws.onclose = () => setWsConnected(false);

    return () => {
      ws.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  const requestNotificationPermission = () => {
      if (!isExtension && Notification.permission === 'default') {
        Notification.requestPermission();
      }
  }

  const handleSendSMS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDevice || (!selectedThreadId && !newSmsRecipient) || !smsDraft.trim()) return;

    const target = selectedThreadId || newSmsRecipient;

    // Optimistic update if in a thread
    const tempMsg: SmsMessage = {
        id: Date.now().toString(),
        direction: '2',
        body: smsDraft,
        timestamp: Date.now() / 1000,
        status: 'sending'
    };

    if (selectedThreadId) {
        setMessages(prev => [...prev, tempMsg]);
    }

    const msgToSend = smsDraft;
    setSmsDraft('');
    
    // If composing new, clear state to show thread list or loading
    if (isComposing) {
        setIsComposing(false);
        setNewSmsRecipient('');
        setLoadingThreads(true); // Expect a refresh
    }

    try {
      await service.sendSMS(apiKey, selectedDevice, target, msgToSend);
      // Trigger a refresh after a delay to get the real message status
      setTimeout(() => {
          if (selectedThreadId) {
             service.fetchThreadMessages(apiKey, selectedDevice, selectedThreadId);
          } else {
             // If it was a new thread, refresh thread list
             service.fetchSMSThreads(apiKey, selectedDevice);
          }
      }, 2000);
    } catch (err) {
      alert('Failed to send SMS. Check connection.');
      if (selectedThreadId) {
          setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
      }
    }
  };

  const handleSendPush = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await service.sendPush(apiKey, {
        type: pushType,
        title: pushTitle,
        body: pushBody,
        url: pushType === 'link' ? pushUrl : undefined,
      });
      setPushTitle('');
      setPushBody('');
      setPushUrl('');
      loadData();
    } catch (err) {
      alert('Failed to send push');
    }
  };

  const handleDeletePush = async (iden: string) => {
    if (!window.confirm('Delete this push?')) return;
    try {
      await service.deletePush(apiKey, iden);
      setPushes(pushes.filter(p => p.iden !== iden));
    } catch (err) {
      alert('Failed to delete');
    }
  };

  // --- Render Helpers ---

  const renderSidebar = () => (
    <div className="w-16 md:w-64 bg-white border-r border-slate-200 flex flex-col h-full flex-shrink-0 transition-all">
      <div className="p-4 border-b border-slate-100 flex items-center justify-center md:justify-start space-x-3">
        <img src={user.image_url || "https://picsum.photos/200"} alt="User" className="w-8 h-8 rounded-full object-cover" />
        <div className="hidden md:block overflow-hidden">
            <h2 className="font-semibold text-slate-800 truncate text-sm">{user.name}</h2>
            <button onClick={requestNotificationPermission} className="flex items-center space-x-1 hover:opacity-75 transition-opacity">
                <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-400'}`} />
                <span className="text-xs text-slate-500">{wsConnected ? 'Live' : 'Offline'}</span>
            </button>
        </div>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        <button 
          onClick={() => setActiveTab(Tab.DEVICES)}
          title="Devices"
          className={`w-full flex items-center justify-center md:justify-start md:space-x-3 px-2 md:px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === Tab.DEVICES ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <Smartphone className="w-5 h-5" />
          <span className="hidden md:inline">Devices</span>
        </button>
        <button 
          onClick={() => setActiveTab(Tab.PUSHES)}
          title="History"
          className={`w-full flex items-center justify-center md:justify-start md:space-x-3 px-2 md:px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === Tab.PUSHES ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <Bell className="w-5 h-5" />
          <span className="hidden md:inline">History</span>
        </button>
        <button 
          onClick={() => setActiveTab(Tab.SMS)}
          title="SMS"
          className={`w-full flex items-center justify-center md:justify-start md:space-x-3 px-2 md:px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === Tab.SMS ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="hidden md:inline">SMS</span>
        </button>
      </nav>
      <div className="p-2 border-t border-slate-100">
        <button onClick={onLogout} className="w-full flex items-center justify-center md:justify-start md:space-x-3 px-2 md:px-4 py-2 text-slate-500 hover:text-red-600 text-sm font-medium transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="hidden md:inline">Sign Out</span>
        </button>
      </div>
    </div>
  );

  const renderDevices = () => (
    <div className="p-4 md:p-8 w-full">
      <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
        <Smartphone className="mr-3 text-emerald-600" /> Connected Devices
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {devices.map(d => (
          <div key={d.iden} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-slate-100 rounded-lg shrink-0">
                {d.icon === 'desktop' || d.icon === 'browser' ? <Laptop className="w-5 h-5 text-slate-600" /> : <Smartphone className="w-5 h-5 text-slate-600" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between items-center mb-1">
                    <h3 className="font-semibold text-slate-900 truncate text-sm">{d.nickname || d.model}</h3>
                    <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${d.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {d.active ? 'Active' : 'Off'}
                    </span>
                </div>
                <p className="text-xs text-slate-500 truncate">{d.manufacturer} {d.model}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPushes = () => (
    <div className="p-4 md:p-8 w-full max-w-4xl mx-auto">
      <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Send a Push</h3>
        <form onSubmit={handleSendPush} className="space-y-3">
          <div className="flex space-x-2 mb-2">
            <button 
              type="button"
              onClick={() => setPushType('note')}
              className={`flex-1 py-1.5 rounded text-xs font-medium border ${pushType === 'note' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600'}`}
            >
              Note
            </button>
            <button 
              type="button"
              onClick={() => setPushType('link')}
              className={`flex-1 py-1.5 rounded text-xs font-medium border ${pushType === 'link' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600'}`}
            >
              Link
            </button>
          </div>
          <input
            type="text"
            value={pushTitle}
            onChange={(e) => setPushTitle(e.target.value)}
            placeholder="Title"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
          />
          {pushType === 'link' && (
             <input
             type="url"
             value={pushUrl}
             onChange={(e) => setPushUrl(e.target.value)}
             placeholder="https://example.com"
             className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
           />
          )}
          <textarea
            value={pushBody}
            onChange={(e) => setPushBody(e.target.value)}
            placeholder="Message..."
            rows={2}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
          />
          <div className="flex justify-end">
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium flex items-center">
              <Send className="w-3 h-3 mr-2" /> Push
            </button>
          </div>
        </form>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-800">History</h2>
        <button onClick={loadData} className="p-2 text-slate-500 hover:text-emerald-600 rounded-full transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-3">
        {pushes.map(push => (
          <div key={push.iden} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 group hover:border-emerald-200 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="mt-1 p-1.5 bg-slate-50 rounded-lg shrink-0">
                  {push.type === 'link' ? <LinkIcon className="w-4 h-4 text-blue-500" /> : 
                   push.type === 'file' ? <FileText className="w-4 h-4 text-orange-500" /> :
                   <MessageSquare className="w-4 h-4 text-emerald-500" />}
                </div>
                <div className="min-w-0">
                  {push.title && <h4 className="font-semibold text-slate-900 text-sm truncate">{push.title}</h4>}
                  {push.body && <p className="text-slate-600 text-xs mt-1 line-clamp-2">{push.body}</p>}
                  {push.url && (
                    <a href={push.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs mt-1 flex items-center truncate">
                      <Globe className="w-3 h-3 mr-1 shrink-0" /> {push.url}
                    </a>
                  )}
                </div>
              </div>
              <button 
                onClick={() => handleDeletePush(push.iden)}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 transition-all"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // New SMS Client UI
  const renderSMS = () => {
      if (!selectedDevice) {
          return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <Smartphone className="w-12 h-12 mb-4 opacity-20" />
                <p>Please select a phone to view SMS</p>
                <select 
                    className="mt-4 p-2 border rounded-lg"
                    onChange={(e) => setSelectedDevice(e.target.value)}
                    defaultValue=""
                >
                    <option value="" disabled>Select Device</option>
                    {devices.filter(d => d.has_sms).map(d => (
                        <option key={d.iden} value={d.iden}>{d.nickname || d.model}</option>
                    ))}
                </select>
            </div>
          );
      }

      // New Message View
      if (isComposing) {
          return (
              <div className="flex flex-col h-full bg-slate-50">
                   <div className="flex items-center p-3 bg-white border-b border-slate-200 shadow-sm">
                      <button onClick={() => setIsComposing(false)} className="mr-3 p-1 hover:bg-slate-100 rounded-full">
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
                        onClick={handleSendSMS}
                        disabled={!newSmsRecipient || !smsDraft}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white p-3 rounded-lg font-medium flex items-center justify-center"
                       >
                           <Send className="w-4 h-4 mr-2" /> Send
                       </button>
                  </div>
              </div>
          )
      }

      // Message Thread View
      if (selectedThreadId) {
          const currentThread = threads.find(t => t.id === selectedThreadId);
          return (
              <div className="flex flex-col h-full bg-slate-50">
                  <div className="flex items-center p-3 bg-white border-b border-slate-200 shadow-sm">
                      <button onClick={() => setSelectedThreadId(null)} className="mr-3 p-1 hover:bg-slate-100 rounded-full">
                          <ArrowLeft className="w-5 h-5 text-slate-600" />
                      </button>
                      <div className="flex-1 overflow-hidden">
                          <h3 className="font-semibold text-slate-800 truncate">
                              {currentThread?.recipients[0]?.name || currentThread?.recipients[0]?.address || 'Unknown'}
                          </h3>
                          <p className="text-xs text-slate-500 truncate">{currentThread?.recipients[0]?.number}</p>
                      </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {loadingMessages ? (
                          <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div></div>
                      ) : messages.length === 0 ? (
                          <div className="text-center text-slate-400 text-sm py-10">No messages found</div>
                      ) : (
                          messages.map((msg, idx) => (
                              <div key={msg.id || idx} className={`flex ${msg.direction === '2' ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`max-w-[75%] px-4 py-2 rounded-xl text-sm ${
                                      msg.direction === '2' 
                                      ? 'bg-emerald-600 text-white rounded-tr-none' 
                                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                                  }`}>
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
                          <button type="submit" className="p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors">
                              <Send className="w-5 h-5" />
                          </button>
                      </form>
                  </div>
              </div>
          );
      }

      // Thread List View
      return (
        <div className="flex flex-col h-full relative">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center shadow-sm z-10">
                <select 
                    value={selectedDevice} 
                    onChange={(e) => setSelectedDevice(e.target.value)}
                    className="max-w-[200px] p-1.5 border border-slate-300 rounded-lg text-sm bg-slate-50 outline-none"
                >
                    {devices.filter(d => d.has_sms).map(d => (
                    <option key={d.iden} value={d.iden}>{d.nickname || d.model}</option>
                    ))}
                </select>
                <button onClick={() => service.fetchSMSThreads(apiKey, selectedDevice)} className="p-2 text-slate-500 hover:text-emerald-600 rounded-full">
                    <RefreshCw className={`w-4 h-4 ${loadingThreads ? 'animate-spin' : ''}`} />
                </button>
            </div>
            
            {/* List */}
            <div className="flex-1 overflow-y-auto">
                {loadingThreads && threads.length === 0 ? (
                    <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div>
                ) : threads.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-sm px-6">
                        No SMS threads found. Make sure your Android device is on.
                    </div>
                ) : (
                    threads.map(thread => {
                        const recipient = thread.recipients && thread.recipients.length > 0 ? thread.recipients[0] : { name: 'Unknown', address: 'Unknown', number: ''};
                        return (
                            <button 
                                key={thread.id} 
                                onClick={() => setSelectedThreadId(thread.id)}
                                className="w-full p-4 border-b border-slate-100 hover:bg-slate-50 flex items-start text-left transition-colors"
                            >
                                <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center shrink-0 mr-3 text-slate-500 font-semibold">
                                    {recipient.name ? recipient.name[0].toUpperCase() : '#'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className="font-semibold text-slate-800 text-sm truncate pr-2">
                                            {recipient.name || recipient.address}
                                        </h4>
                                        {thread.timestamp && (
                                            <span className="text-[10px] text-slate-400 shrink-0">
                                                {new Date(thread.timestamp * 1000).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 truncate">{thread.latest_message}</p>
                                </div>
                            </button>
                        );
                    })
                )}
            </div>

             {/* Floating Action Button */}
             <button 
                onClick={() => setIsComposing(true)}
                className="absolute bottom-6 right-6 w-12 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105"
            >
                <PenSquare className="w-6 h-6" />
            </button>
        </div>
      );
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      {/* Error Banner */}
      {apiError && (
          <div className="absolute top-0 left-0 right-0 z-50 bg-red-600 text-white px-4 py-2 text-xs flex items-center justify-between">
              <span className="flex items-center"><AlertTriangle className="w-4 h-4 mr-2" /> {apiError}</span>
              <button onClick={() => setApiError(null)}><X className="w-4 h-4" /></button>
          </div>
      )}

      {renderSidebar()}
      <main className="flex-1 overflow-hidden h-full relative bg-white md:bg-slate-50">
        {activeTab === Tab.DEVICES && <div className="h-full overflow-y-auto no-scrollbar">{renderDevices()}</div>}
        {activeTab === Tab.PUSHES && <div className="h-full overflow-y-auto no-scrollbar">{renderPushes()}</div>}
        {activeTab === Tab.SMS && <div className="h-full overflow-hidden">{renderSMS()}</div>}
      </main>
    </div>
  );
};

export default Dashboard;