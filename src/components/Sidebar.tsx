import React from 'react';
import { Smartphone, MessageSquare, Send, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { Tab, User } from '../types';

interface SidebarProps {
  user: User;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  onLogout: () => void;
  wsConnected: boolean;
  requestNotificationPermission: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onLogout,
  wsConnected,
  requestNotificationPermission,
}) => {
  return (
    <div className="w-16 md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col h-full flex-shrink-0 transition-all">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-center md:justify-start space-x-3">
        <img
          src={user.image_url || 'https://picsum.photos/200'}
          alt="User"
          className="w-8 h-8 rounded-full object-cover"
        />
        <div className="hidden md:block overflow-hidden">
          <h2 className="font-semibold text-slate-800 dark:text-slate-200 truncate text-sm">
            {user.name}
          </h2>
          <button
            onClick={requestNotificationPermission}
            className="flex items-center space-x-1 hover:opacity-75 transition-opacity"
          >
            <div
              className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-400'}`}
            />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {wsConnected ? 'Live' : 'Offline'}
            </span>
          </button>
        </div>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        <button
          onClick={() => setActiveTab(Tab.DEVICES)}
          title="Devices"
          className={`w-full flex items-center justify-center md:justify-start md:space-x-3 px-2 md:px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === Tab.DEVICES ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        >
          <Smartphone className="w-5 h-5" />
          <span className="hidden md:inline">Devices</span>
        </button>
        <button
          onClick={() => setActiveTab(Tab.PUSHES)}
          title="Pushes"
          className={`w-full flex items-center justify-center md:justify-start md:space-x-3 px-2 md:px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === Tab.PUSHES ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        >
          <Send className="w-5 h-5" />
          <span className="hidden md:inline">Pushes</span>
        </button>
        <button
          onClick={() => setActiveTab(Tab.SMS)}
          title="SMS"
          className={`w-full flex items-center justify-center md:justify-start md:space-x-3 px-2 md:px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === Tab.SMS ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="hidden md:inline">SMS</span>
        </button>
        <button
          aria-label="Settings"
          type="button"
          onClick={() => setActiveTab(Tab.SETTINGS)}
          title="Settings"
          className={`w-full flex items-center justify-center md:justify-start md:space-x-3 px-2 md:px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === Tab.SETTINGS ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        >
          <SettingsIcon className="w-5 h-5" />
          <span className="hidden md:inline">Settings</span>
        </button>
      </nav>
      <div className="p-2 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center md:justify-start md:space-x-3 px-2 md:px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-red-600 text-sm font-medium transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="hidden md:inline">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
