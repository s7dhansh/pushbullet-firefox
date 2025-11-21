import React, { useEffect, useState } from 'react';

type ThemeMode = 'system' | 'light' | 'dark';

interface SettingsProps {
  initialMode?: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
}

const Settings: React.FC<SettingsProps> = ({ initialMode = 'system', onThemeChange }) => {
  const [mode, setMode] = useState<ThemeMode>(initialMode);
  const [systemDark, setSystemDark] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (!window.matchMedia) return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const handleChange = (next: ThemeMode) => {
    setMode(next);
    try {
      localStorage.setItem('pb_theme', next);
    } catch (e) {
      void 0;
    }
    onThemeChange(next);
  };

  return (
    <div className="p-6 md:p-8 w-full h-full overflow-y-auto">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">Settings</h2>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Theme Mode
        </label>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="radio"
              name="theme-mode"
              value="system"
              checked={mode === 'system'}
              onChange={() => handleChange('system')}
            />
            System
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="radio"
              name="theme-mode"
              value="light"
              checked={mode === 'light'}
              onChange={() => handleChange('light')}
            />
            Light
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="radio"
              name="theme-mode"
              value="dark"
              checked={mode === 'dark'}
              onChange={() => handleChange('dark')}
            />
            Dark
          </label>
        </div>
        <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
          {mode === 'system'
            ? systemDark
              ? 'Effective: Dark (from system)'
              : 'Effective: Light (from system)'
            : mode === 'dark'
              ? 'Effective: Dark'
              : 'Effective: Light'}
        </div>
      </div>
    </div>
  );
};

export default Settings;
