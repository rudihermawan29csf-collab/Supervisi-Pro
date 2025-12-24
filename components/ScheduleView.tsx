
import React, { useState } from 'react';
import { FULL_SCHEDULE, SCHEDULE_TEACHERS, CLASS_LIST } from '../constants';
import { AppSettings } from '../types';

interface ScheduleViewProps {
  settings: AppSettings;
}

const ScheduleView: React.FC<ScheduleViewProps> = ({ settings }) => {
  const [activeTab, setActiveTab] = useState(0);

  const getTeacherColor = (code: string) => {
    if (!code || code === '---') return 'bg-slate-50 border-transparent text-slate-300';
    let hash = 0;
    for (let i = 0; i < code.length; i++) hash = code.charCodeAt(i) + ((hash << 5) - hash);
    const colors = ['bg-blue-100 text-blue-800 border-blue-200', 'bg-emerald-100 text-emerald-800 border-emerald-200', 'bg-rose-100 text-rose-800 border-rose-200', 'bg-amber-100 text-amber-800 border-amber-200', 'bg-purple-100 text-purple-800 border-purple-200', 'bg-cyan-100 text-cyan-800 border-cyan-200'];
    return colors[Math.abs(hash) % colors.length];
  };

  const exportPDF = () => {
    const element = document.getElementById('schedule-export');
    // @ts-ignore
    html2pdf().from(element).save(`Jadwal_Sekolah_${FULL_SCHEDULE[activeTab].day}.pdf`);
  };

  const exportExcel = () => {
    const day = FULL_SCHEDULE[activeTab];
    const headers = "Waktu," + CLASS_LIST.join(",");
    // Fix: Cast r to any to resolve 'Property activity does not exist' error on inferred row type
    const rows = day.rows.map((r: any) => r.activity ? `"${r.waktu}","${r.activity}"` : `"${r.waktu}",${CLASS_LIST.map(c => r.classes?.[c] || '-').join(",")}`).join("\n");
    const blob = new Blob([headers + "\n" + rows], { type: 'text/csv' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Jadwal_${day.day}.csv`;
    link.click();
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center no-print">
        <h2 className="text-xl font-black uppercase">Jadwal Pelajaran</h2>
        <div className="flex gap-2">
            <button onClick={exportPDF} className="px-3 py-1.5 bg-red-600 text-white rounded-lg font-bold text-[9px] uppercase">PDF</button>
            <button onClick={exportExcel} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold text-[9px] uppercase">Excel</button>
            <button onClick={() => alert('Konfigurasi jadwal sekolah disimpan!')} className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg font-bold text-[9px] uppercase">Simpan Perubahan</button>
        </div>
      </div>

      <div id="schedule-export" className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex border-b bg-slate-50 no-print">
          {FULL_SCHEDULE.map((day, idx) => (
            <button key={day.day} onClick={() => setActiveTab(idx)} className={`px-8 py-4 text-xs font-black uppercase transition-all border-b-4 ${activeTab === idx ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-slate-400'}`}>
              {day.day}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white uppercase text-[10px]">
                <th className="px-4 py-3 border-r border-slate-700 text-center">Ke</th>
                <th className="px-4 py-3 border-r border-slate-700 text-center">Waktu</th>
                {CLASS_LIST.map(cls => <th key={cls} className="px-4 py-3 border-r border-slate-700 text-center">{cls}</th>)}
              </tr>
            </thead>
            <tbody>
              {/* Fix: Cast row to any to resolve 'Property activity does not exist' error on inferred row type */}
              {FULL_SCHEDULE[activeTab].rows.map((row: any, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-3 text-xs font-bold border-b border-r text-center">{row.ke}</td>
                  <td className="px-4 py-3 text-xs border-b border-r text-center font-mono">{row.waktu}</td>
                  {row.activity ? (
                    <td colSpan={CLASS_LIST.length} className="px-4 py-3 text-xs font-bold text-blue-600 text-center bg-blue-50/20 border-b uppercase">{row.activity}</td>
                  ) : (
                    CLASS_LIST.map(cls => {
                      const code = row.classes?.[cls] || '---';
                      return <td key={cls} className="px-2 py-3 border-b border-r text-center"><span className={`px-1 py-1 rounded block text-[9px] font-black ${getTeacherColor(code)}`}>{code}</span></td>;
                    })
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ScheduleView;
