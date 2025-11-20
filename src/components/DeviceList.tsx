import React from 'react';
import { Smartphone, Laptop } from 'lucide-react';
import { Device } from '../types';

interface DeviceListProps {
  devices: Device[];
}

const DeviceList: React.FC<DeviceListProps> = ({ devices }) => {
  return (
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
};

export default DeviceList;
