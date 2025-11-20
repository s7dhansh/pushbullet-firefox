import React, { useState } from 'react';
import { 
  Send, 
  RefreshCw, 
  Link as LinkIcon, 
  FileText, 
  Trash2,
  Globe,
  MessageSquare
} from 'lucide-react';
import { Push } from '../types';
import * as service from '../services/pushbulletService';

interface PushHistoryProps {
  apiKey: string;
  pushes: Push[];
  loading: boolean;
  onRefresh: () => void;
  setLoading: (loading: boolean) => void;
}

const PushHistory: React.FC<PushHistoryProps> = ({ apiKey, pushes, loading, onRefresh, setLoading }) => {
  const [pushTitle, setPushTitle] = useState('');
  const [pushBody, setPushBody] = useState('');
  const [pushUrl, setPushUrl] = useState('');
  const [pushType, setPushType] = useState<'note' | 'link'>('note');
  // Local state for optimistic updates or just to trigger re-render if needed, 
  // though props update is main driver.
  const [localPushes, setLocalPushes] = useState<Push[]>([]);

  // Sync local pushes with props when props change
  React.useEffect(() => {
    setLocalPushes(pushes);
  }, [pushes]);

  const handleSendPush = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
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
      onRefresh(); // Refresh list
    } catch (err) {
      alert('Failed to send push');
      setLoading(false);
    }
  };

  const handleDeletePush = async (iden: string) => {
    if (!window.confirm('Delete this push?')) return;
    try {
      await service.deletePush(apiKey, iden);
      setLocalPushes(prev => prev.filter(p => p.iden !== iden));
    } catch (err) {
      alert('Failed to delete');
    }
  };

  return (
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
        <button onClick={onRefresh} className="p-2 text-slate-500 hover:text-emerald-600 rounded-full transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-3">
        {localPushes.map(push => (
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
};

export default PushHistory;
