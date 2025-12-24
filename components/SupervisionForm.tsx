
import React, { useState, useEffect, useMemo } from 'react';
import { TeacherRecord, SupervisionStatus } from '../types';
import { FULL_SCHEDULE, SCHEDULE_TEACHERS } from '../constants';

interface Props {
  record: TeacherRecord;
  onSave: (updatedRecord: TeacherRecord) => void;
  onClose: () => void;
}

const SupervisionForm: React.FC<Props> = ({ record, onSave, onClose }) => {
  const [formData, setFormData] = useState<TeacherRecord>(record);

  // Auto-detect Day from Date
  useEffect(() => {
    if (formData.tanggal) {
      const date = new Date(formData.tanggal);
      const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      setFormData(prev => ({ ...prev, hari: dayNames[date.getDay()] }));
    }
  }, [formData.tanggal]);

  const teacherCode = useMemo(() => {
    return SCHEDULE_TEACHERS.find(t => t.nama === formData.namaGuru)?.kode || '';
  }, [formData.namaGuru]);

  const availableClasses = useMemo(() => {
    if (!formData.hari) return [];
    const dayData = FULL_SCHEDULE.find(s => s.day === formData.hari);
    if (!dayData) return [];
    
    const classes = new Set<string>();
    dayData.rows.forEach(row => {
      if (row.classes) {
        Object.entries(row.classes).forEach(([className, code]) => {
          if (code === teacherCode) classes.add(className);
        });
      }
    });
    return Array.from(classes);
  }, [formData.hari, teacherCode]);

  const availablePeriods = useMemo(() => {
    if (!formData.hari || !formData.kelas) return [];
    const dayData = FULL_SCHEDULE.find(s => s.day === formData.hari);
    if (!dayData) return [];

    return dayData.rows
      .filter(row => row.classes?.[formData.kelas as any] === teacherCode)
      .map(row => String(row.ke));
  }, [formData.hari, formData.kelas, teacherCode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden">
        <div className="px-8 py-6 border-b bg-slate-50 flex justify-between items-center">
          <h2 className="text-lg font-black text-slate-800 uppercase">Update Jadwal Supervisi</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2"/></svg>
          </button>
        </div>

        <div className="p-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Nama Guru</label>
              <div className="w-full px-4 py-2 bg-slate-100 border rounded-xl font-bold">{formData.namaGuru}</div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Mata Pelajaran</label>
              <div className="w-full px-4 py-2 bg-slate-100 border rounded-xl italic">{formData.mataPelajaran}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Tanggal Supervisi</label>
              <input type="date" name="tanggal" value={formData.tanggal} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Hari (Otomatis)</label>
              <input type="text" value={formData.hari} readOnly className="w-full px-4 py-2 bg-slate-50 border rounded-xl font-bold text-blue-600" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Kelas (Sesuai Jadwal)</label>
              <select name="kelas" value={formData.kelas} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl font-bold outline-none">
                <option value="">-- Pilih Kelas --</option>
                {availableClasses.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Jam Ke-</label>
              <select name="jamKe" value={formData.jamKe} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl font-bold outline-none">
                <option value="">-- Jam --</option>
                {availablePeriods.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Status Pelaksanaan</label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl font-bold">
              <option value={SupervisionStatus.PENDING}>Belum Terlaksana</option>
              <option value={SupervisionStatus.COMPLETED}>Terlaksana</option>
              <option value={SupervisionStatus.RESCHEDULED}>Dijadwal Ulang</option>
            </select>
          </div>
        </div>

        <div className="px-8 py-6 bg-slate-50 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 text-xs font-bold text-slate-500 uppercase">Batal</button>
          <button onClick={() => onSave(formData)} className="px-8 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase shadow-lg hover:bg-blue-700">Simpan Perubahan</button>
        </div>
      </div>
    </div>
  );
};

export default SupervisionForm;
