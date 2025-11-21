import React from 'react';
import { Smartphone, Laptop } from 'lucide-react';
import { Device } from '../types';

interface DeviceListProps {
  devices: Device[];
}

const DeviceList: React.FC<DeviceListProps> = ({ devices }) => {
  return (
    <div className="p-4 md:p-8 w-full">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center">
        <Smartphone className="mr-3 text-emerald-600" /> Connected Devices
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {devices.map((d) => (
          <div
            key={d.iden}
            className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg shrink-0">
                {d.icon === 'desktop' || d.icon === 'browser' ? (
                  <Laptop className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                ) : (
                  <Smartphone className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-semibold text-slate-900 dark:text-white truncate text-sm">
                    {d.nickname || d.model}
                  </h3>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${d.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}
                  >
                    {d.active ? 'Active' : 'Off'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {d.manufacturer} {d.model}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeviceList;
