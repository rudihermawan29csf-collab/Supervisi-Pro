
import React from 'react';
import { TeacherRecord, SupervisionStatus } from '../types';

interface Props {
  records: TeacherRecord[];
  onEdit: (record: TeacherRecord) => void;
  onDelete: (id: number) => void;
}

const toTitleCase = (str: string) => {
  if (!str) return '';
  return str.toLowerCase().split(' ').map(word => {
    return (word.charAt(0).toUpperCase() + word.slice(1));
  }).join(' ');
};

const SupervisionTable: React.FC<Props> = ({ records, onEdit, onDelete }) => {
  const getStatusColor = (status: SupervisionStatus) => {
    switch (status) {
      case SupervisionStatus.COMPLETED: return 'bg-emerald-100 text-emerald-700';
      case SupervisionStatus.RESCHEDULED: return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-slideDown">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-16 text-center">No</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hari</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Guru</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mata Pelajaran</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right no-print">Opsi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.map((r, i) => (
              <tr key={r.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4 text-sm text-slate-400 font-bold text-center">{i + 1}</td>
                <td className="px-6 py-4 text-sm font-black text-slate-700 uppercase">{r.hari || '-'}</td>
                <td className="px-6 py-4 text-sm text-slate-600 font-medium">{formatDate(r.tanggal)}</td>
                <td className="px-6 py-4 text-sm font-black text-slate-800 uppercase tracking-tight">{toTitleCase(r.namaGuru)}</td>
                <td className="px-6 py-4 text-sm text-blue-600 font-black italic">{r.mataPelajaran}</td>
                <td className="px-6 py-4">
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(r.status)}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right no-print">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(r)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all shadow-sm bg-white border border-slate-100">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </button>
                    <button onClick={() => onDelete(r.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm bg-white border border-slate-100">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr><td colSpan={7} className="px-6 py-20 text-center text-slate-400 italic font-medium uppercase tracking-widest">Belum ada data supervisi yang terdaftar.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SupervisionTable;
