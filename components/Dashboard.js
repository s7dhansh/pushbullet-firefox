import React, { useState, useEffect } from 'react';
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
  Laptop
} from 'lucide-react';
import { Tab } from '../types.js';
import * as service from '../services/pushbulletService.js';

const Dashboard = ({ apiKey, user, onLogout }) => {
  const [activeTab, setActiveTab] = useState(Tab.DEVICES);
  const [devices, setDevices] = useState([]);
  const [pushes, setPushes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  
  // SMS State
  const [smsPhone, setSmsPhone] = useState('');
  const [smsMessage, setSmsMessage] = useState('');
  const [selectedDevice, setSelectedDevice] = useState('');

  // New Push State
  const [pushTitle, setPushTitle] = useState('');
  const [pushBody, setPushBody] = useState('');
  const [pushUrl, setPushUrl] = useState('');
  const [pushType, setPushType] = useState('note');

  // Notification Log (Mirroring)
  const [notifications, setNotifications] = useState([]);

  // Check if running as extension
  const isExtension = typeof chrome !== 'undefined' && !!chrome.runtime && !!chrome.runtime.id;

  const loadData = async () => {
    setLoading(true);
    try {
      const [d, p] = await Promise.all([
        service.getDevices(apiKey),
        service.getPushes(apiKey)
      ]);
      setDevices(d);
      setPushes(p);
      
      // Auto-select first phone for SMS
      const phone = d.find(device => device.has_sms);
      if (phone && !selectedDevice) {
        setSelectedDevice(phone.iden);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    const ws = service.createWebSocket(apiKey, (data) => {
      if (data.type === 'tickle') {
        // Refresh data on tickle
        if (data.subtype === 'push') {
            service.getPushes(apiKey).then(setPushes);
        } else if (data.subtype === 'device') {
            service.getDevices(apiKey).then(setDevices);
        }
      } else if (data.type === 'push' && data.push) {
        // Live mirroring event
        const pushData = data.push;
        
        if (pushData.type === 'mirror' || pushData.type === 'sms_changed') {
           setNotifications(prev => [pushData, ...prev]);
           
           // Only trigger browser notification if NOT running as extension
           // (Background script handles it in extension mode)
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

    if (!isExtension && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      ws.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  const handleSendSMS = async (e) => {
    e.preventDefault();
    if (!selectedDevice || !smsPhone || !smsMessage) return;

    try {
      await service.sendSMS(apiKey, selectedDevice, smsPhone, smsMessage);
      setSmsMessage('');
      // Don't alert in popup, just clear
    } catch (err) {
      alert('Failed to send SMS');
    }
  };

  const handleSendPush = async (e) => {
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

  const handleDeletePush = async (iden) => {
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
        <img src={user.image_url || "https://picsum.photos/200"} alt="User" className="w-8 h-8 rounded-full" />
        <div className="hidden md:block overflow-hidden">
            <h2 className="font-semibold text-slate-800 truncate text-sm">{user.name}</h2>
            <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-400'}`} />
                <span className="text-xs text-slate-500">{wsConnected ? 'Live' : 'Offline'}</span>
            </div>
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
          title="SMS & Mirroring"
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

  const renderSMS = () => (
    <div className="flex flex-col h-full">
      {/* Config Header */}
      <div className="p-4 border-b border-slate-200 bg-white">
        <select 
            value={selectedDevice} 
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-slate-50"
        >
            <option value="" disabled>Select Source Device</option>
            {devices.filter(d => d.has_sms).map(d => (
              <option key={d.iden} value={d.iden}>{d.nickname || d.model}</option>
            ))}
        </select>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
        {notifications.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-xs">
              No recent notifications mirrored.
            </div>
        )}
        {notifications.map((notif, idx) => (
            <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 text-sm shadow-sm">
              <div className="flex items-center mb-1">
                  {notif.icon ? (
                      <img src={`data:image/png;base64,${notif.icon}`} alt="icon" className="w-4 h-4 mr-2" />
                  ) : <Bell className="w-3 h-3 mr-2 text-slate-400" />}
                  <span className="font-semibold text-slate-700 text-xs">{notif.application_name || notif.title}</span>
              </div>
              <p className="text-slate-600 text-xs">{notif.body}</p>
            </div>
        ))}
      </div>

      {/* Composer */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleSendSMS} className="space-y-3">
            <input 
                type="tel"
                required
                value={smsPhone}
                onChange={(e) => setSmsPhone(e.target.value)}
                placeholder="To: +1 234 567 8900"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
            />
            <div className="flex space-x-2">
                <input
                    type="text"
                    required
                    value={smsMessage}
                    onChange={(e) => setSmsMessage(e.target.value)}
                    placeholder="SMS Message..."
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                />
                <button 
                    type="submit" 
                    disabled={!selectedDevice}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                    <Send className="w-4 h-4" />
                </button>
            </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {renderSidebar()}
      <main className="flex-1 overflow-y-auto h-full relative no-scrollbar">
        {activeTab === Tab.DEVICES && renderDevices()}
        {activeTab === Tab.PUSHES && renderPushes()}
        {activeTab === Tab.SMS && renderSMS()}
      </main>
    </div>
  );
};

export default Dashboard;