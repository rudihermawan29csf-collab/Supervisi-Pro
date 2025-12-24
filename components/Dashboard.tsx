
import React from 'react';
import { TeacherRecord, SupervisionStatus } from '../types';

interface DashboardProps {
  records: TeacherRecord[];
}

const Dashboard: React.FC<DashboardProps> = ({ records }) => {
  const total = records.length;
  const completed = records.filter(r => r.status === SupervisionStatus.COMPLETED).length;
  const pending = records.filter(r => r.status === SupervisionStatus.PENDING).length;
  const rescheduled = records.filter(r => r.status === SupervisionStatus.RESCHEDULED).length;

  const stats = [
    { label: 'Total Guru', value: total, color: 'bg-indigo-600', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197' },
    { label: 'Terlaksana', value: completed, color: 'bg-emerald-500', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Belum Terlaksana', value: pending, color: 'bg-slate-400', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Jadwal Ulang', value: rescheduled, color: 'bg-amber-500', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
  ];

  return (
    <div className="space-y-8 animate-slideDown">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-start transition-all hover:shadow-md hover:-translate-y-1">
            <div className={`p-2 rounded-lg ${stat.color} text-white mb-4 shadow-sm`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon}/></svg>
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
            <span className="text-3xl font-black mt-1 text-slate-800">{stat.value}</span>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
              <div className={`h-full ${stat.color}`} style={{ width: total > 0 ? `${(stat.value / total) * 100}%` : '0%' }} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-4">
        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shadow-inner">
           <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-800">Sistem Informasi Supervisi</h3>
          <p className="text-sm text-slate-500 max-w-md mt-2 leading-relaxed font-medium italic">Gunakan menu di sidebar untuk mengelola jadwal supervisi guru Anda secara praktis dan teratur.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
