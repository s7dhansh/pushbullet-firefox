import React, { useState, useEffect } from 'react';
import { ShieldCheck, Key } from 'lucide-react';

interface LoginProps {
  onLogin: (key: string) => void;
  error?: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, error }) => {
  const [key, setKey] = useState('');

  useEffect(() => {
    // Auto-fill from env if available (for dev/preview)
    const envKey = import.meta.env.VITE_PB_API_KEY;
    if (envKey) {
      setKey(envKey);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      onLogin(key.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-slate-100 dark:border-slate-700">
        <div className="bg-emerald-500 p-6 text-center">
          <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">BulletBase</h1>
          <p className="text-emerald-100 mt-2">Secure Client for Pushbullet</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Access Token / API Key
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="o.xxxxxxxxxxxxxxxx"
                />
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Go to Pushbullet.com &gt; Settings &gt; Create Access Token
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center shadow-sm hover:shadow"
            >
              Connect Account
            </button>
          </form>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900 px-8 py-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400 dark:text-slate-500">
          Your API key is stored locally on your device.
        </div>
      </div>
    </div>
  );
};

export default Login;
