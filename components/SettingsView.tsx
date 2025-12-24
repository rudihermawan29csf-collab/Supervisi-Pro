
import React, { useState, useCallback, useMemo } from 'react';
import { AppSettings, DateRange, TeacherRecord, SupervisionStatus, ScoreSettings } from '../types';
import { FULL_SCHEDULE, CLASS_LIST, SCHEDULE_TEACHERS } from '../constants';

interface SettingsViewProps {
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
  records: TeacherRecord[];
  setRecords: (records: TeacherRecord[]) => void;
  uploadedSchedules: Record<string, any[]>;
  setUploadedSchedules: (recs: Record<string, any[]>) => void;
  pttRecords: any[];
  setPttRecords: (records: any[]) => void;
}

type SettingTab = 'identitas' | 'tim-supervisi' | 'konfigurasi-jadwal' | 'database' | 'tugas-tu' | 'jadwal-sekolah' | 'predikat';

const toTitleCase = (str: string) => {
  if (!str) return '';
  return str.toLowerCase().split(' ').map(word => {
    return (word.charAt(0).toUpperCase() + word.slice(1));
  }).join(' ');
};

/* --- SUB-COMPONENT: TU Staff Management --- */
const TugasTambahanTU = ({ pttRecords, setPttRecords }: { pttRecords: any[], setPttRecords: (recs: any[]) => void }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nama: '', nip: '', jabatan: 'PTT', tugas: [{ label: '', detail: '' }]
  });

  const handleAddStaff = () => {
    setEditingIndex(null);
    setFormData({ nama: '', nip: '', jabatan: 'PTT', tugas: [{ label: '', detail: '' }] });
    setIsModalOpen(true);
  };

  const handleEditStaff = (index: number) => {
    setEditingIndex(index);
    setFormData(JSON.parse(JSON.stringify(pttRecords[index])));
    setIsModalOpen(true);
  };

  const handleDeleteStaff = (index: number) => {
    if (confirm('Hapus data petugas ini?')) {
      const newRecs = [...pttRecords];
      newRecs.splice(index, 1);
      setPttRecords(newRecs);
    }
  };

  const handleSaveStaff = () => {
    if (!formData.nama) return alert('Nama wajib diisi');
    const newRecs = [...pttRecords];
    if (editingIndex !== null) {
      newRecs[editingIndex] = formData;
    } else {
      newRecs.push({ ...formData, no: newRecs.length + 1 });
    }
    setPttRecords(newRecs);
    setIsModalOpen(false);
  };

  const updateTask = (tIdx: number, field: 'label' | 'detail', val: string) => {
    const newTasks = [...formData.tugas];
    newTasks[tIdx] = { ...newTasks[tIdx], [field]: val };
    setFormData({ ...formData, tugas: newTasks });
  };

  const addTask = () => setFormData({ ...formData, tugas: [...formData.tugas, { label: '', detail: '' }] });
  const removeTask = (tIdx: number) => {
    const newTasks = [...formData.tugas];
    newTasks.splice(tIdx, 1);
    setFormData({ ...formData, tugas: newTasks });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-700 uppercase">Data Tenaga Kependidikan (TU)</h3>
        <button onClick={handleAddStaff} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold uppercase shadow-lg hover:bg-emerald-700">+ Tambah Petugas</button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 uppercase font-black text-slate-500">
            <tr>
              <th className="p-3">No</th>
              <th className="p-3">Nama / NIP</th>
              <th className="p-3">Tugas Utama</th>
              <th className="p-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pttRecords.map((staff, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="p-3 font-bold text-center w-10">{idx + 1}</td>
                <td className="p-3">
                  <div className="font-bold text-slate-800 uppercase">{staff.nama}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{staff.nip}</div>
                </td>
                <td className="p-3">
                  <ul className="list-disc pl-4 space-y-1">
                    {staff.tugas.map((t: any, i: number) => (
                      <li key={i}><strong>{t.label}</strong>: {t.detail}</li>
                    ))}
                  </ul>
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => handleEditStaff(idx)} className="text-blue-600 font-bold mr-3 hover:underline">Edit</button>
                  <button onClick={() => handleDeleteStaff(idx)} className="text-red-600 font-bold hover:underline">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-5 border-b bg-slate-50 font-bold uppercase text-slate-700">Form Data Tendik</div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nama Lengkap</label><input type="text" value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} className="w-full border rounded-lg p-2 text-xs font-bold" /></div>
              <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">NIP</label><input type="text" value={formData.nip} onChange={e => setFormData({...formData, nip: e.target.value})} className="w-full border rounded-lg p-2 text-xs font-mono" /></div>
              <div>
                <div className="flex justify-between items-center mb-2"><label className="text-[10px] font-bold text-slate-400 uppercase">Rincian Tugas</label><button onClick={addTask} className="text-[10px] text-blue-600 font-bold hover:underline">+ Item</button></div>
                <div className="space-y-2">
                  {formData.tugas.map((t, i) => (
                    <div key={i} className="flex gap-2">
                      <input type="text" value={t.label} onChange={e => updateTask(i, 'label', e.target.value)} placeholder="Nama Tugas" className="flex-1 border rounded p-1.5 text-xs font-bold" />
                      <input type="text" value={t.detail} onChange={e => updateTask(i, 'detail', e.target.value)} placeholder="Detail Pekerjaan" className="flex-[2] border rounded p-1.5 text-xs" />
                      <button onClick={() => removeTask(i)} className="text-red-500 font-bold px-2">×</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 border-t bg-slate-50 flex justify-end gap-2">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-white border rounded-lg text-xs font-bold text-slate-600">Batal</button>
              <button onClick={handleSaveStaff} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold uppercase">Simpan</button>
            </div>
          </div>
        </div>
      )}
      <div className="flex justify-end pt-4 border-t border-slate-100">
        <button onClick={() => alert('Data Tenaga Kependidikan berhasil disimpan!')} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold uppercase shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
          Simpan Perubahan
        </button>
      </div>
    </div>
  );
};

const SettingsView: React.FC<SettingsViewProps> = ({ settings, setSettings, records, setRecords, uploadedSchedules, setUploadedSchedules, pttRecords, setPttRecords }) => {
  const [activeTab, setActiveTab] = useState<SettingTab>('identitas');
  
  // Teachers Management State
  const [teacherForm, setTeacherForm] = useState<Partial<TeacherRecord>>({});
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState<number | null>(null);

  // Schedule Upload State
  const [uploadYear, setUploadYear] = useState(settings.tahunPelajaran);
  const [uploadSemester, setUploadSemester] = useState(settings.semester);
  const [activeScheduleTab, setActiveScheduleTab] = useState(0);

  // Determine current schedule data based on settings
  const currentSchedule = useMemo(() => {
    const key = `${uploadYear}-${uploadSemester}`;
    if (uploadedSchedules[key]) {
      return uploadedSchedules[key];
    }
    return FULL_SCHEDULE;
  }, [uploadedSchedules, settings.tahunPelajaran, settings.semester, uploadYear, uploadSemester]);

  const handleEditTeacher = (teacher: TeacherRecord) => {
    setEditingTeacherId(teacher.id);
    setTeacherForm(teacher);
    setIsTeacherModalOpen(true);
  };

  const handleAddTeacher = () => {
    setEditingTeacherId(null);
    setTeacherForm({ namaGuru: '', nip: '', mataPelajaran: '', pangkatGolongan: '-', kode: '' });
    setIsTeacherModalOpen(true);
  };

  const handleDeleteTeacher = (id: number) => {
    if (confirm('Yakin ingin menghapus data guru ini? Data supervisi terkait juga akan hilang.')) {
      setRecords(records.filter(r => r.id !== id));
    }
  };

  const handleSaveTeacher = () => {
    if (!teacherForm.namaGuru) return alert('Nama Guru harus diisi');
    
    if (editingTeacherId) {
      setRecords(records.map(r => r.id === editingTeacherId ? { ...r, ...teacherForm } : r));
    } else {
      const newId = records.length > 0 ? Math.max(...records.map(r => r.id)) + 1 : 1;
      const newRecord: TeacherRecord = {
        id: newId,
        no: newId,
        namaGuru: teacherForm.namaGuru || '',
        nip: teacherForm.nip || '-',
        mataPelajaran: teacherForm.mataPelajaran || '',
        pangkatGolongan: teacherForm.pangkatGolongan || '-',
        kode: teacherForm.kode || '',
        hari: '', tanggal: '', kelas: '', jamKe: '', status: SupervisionStatus.PENDING, semester: settings.semester,
        ...teacherForm
      } as TeacherRecord;
      setRecords([...records, newRecord]);
    }
    setIsTeacherModalOpen(false);
  };

  const handleUpdateScheduleConfig = (key: keyof AppSettings, field: 'from' | 'to', value: string) => {
    const currentRange = settings[key] as DateRange;
    setSettings({ ...settings, [key]: { ...currentRange, [field]: value } });
  };

  const handleSaveSettings = () => {
    alert('Pengaturan dan data berhasil disimpan!');
  };

  // Helper to process uploaded JSON into schedule structure
  const processExcelData = (jsonData: any[]): any[] => {
    const daysOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu'];
    const grouped: Record<string, any[]> = {};
    
    jsonData.forEach((row: any) => {
      const day = row['Hari'] || row['hari'];
      if (!day) return;
      
      if (!grouped[day]) grouped[day] = [];
      
      const newRow: any = {
        ke: row['Jam Ke'] || row['Ke'] || row['jam'],
        waktu: row['Waktu'] || row['waktu'],
      };

      if (row['Kegiatan'] || row['Activity']) {
        newRow.activity = row['Kegiatan'] || row['Activity'];
      } else {
        newRow.classes = {};
        CLASS_LIST.forEach(cls => {
          if (row[cls]) newRow.classes[cls] = row[cls];
        });
      }
      grouped[day].push(newRow);
    });

    const result = daysOrder.map(day => ({
      day,
      rows: grouped[day] || []
    })).filter(d => d.rows.length > 0);

    return result.length > 0 ? result : FULL_SCHEDULE; 
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      // @ts-ignore
      const wb = window.XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      // @ts-ignore
      const data = window.XLSX.utils.sheet_to_json(ws);
      
      const processed = processExcelData(data);
      const key = `${uploadYear}-${uploadSemester}`;
      setUploadedSchedules({ ...uploadedSchedules, [key]: processed });
      alert(`Jadwal untuk ${key} berhasil diupload!`);
    };
    reader.readAsBinaryString(file);
  };

  const handleDownloadTemplate = () => {
    const headers = ['Hari', 'Jam Ke', 'Waktu', 'Kegiatan', ...CLASS_LIST];
    const sampleRows = [
      ['Senin', 1, '07.00-07.40', '', 'MAT-PU', 'BIN-SH', 'IPA-RB', '...'],
      ['Senin', 2, '07.40-08.20', '', 'MAT-PU', 'BIN-SH', 'IPA-RB', '...'],
      ['Senin', 0, '06.30-07.00', 'Upacara Bendera', '', '', '', '...'],
    ];
    
    // @ts-ignore
    if (typeof window.XLSX !== 'undefined') {
      // @ts-ignore
      const ws = window.XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
      // @ts-ignore
      const wb = window.XLSX.utils.book_new();
      // @ts-ignore
      window.XLSX.utils.book_append_sheet(wb, ws, "Template Jadwal");
      // @ts-ignore
      window.XLSX.writeFile(wb, "Template_Jadwal_Pelajaran.xlsx");
    } else {
      alert("Fitur download Excel belum siap. Silakan coba lagi nanti.");
    }
  };

  const getTeacherColor = (code: string) => {
    if (!code || code === '-' || code === '') return 'text-slate-300 bg-slate-50';
    let hash = 0;
    for (let i = 0; i < code.length; i++) hash = code.charCodeAt(i) + ((hash << 5) - hash);
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-emerald-100 text-emerald-800',
      'bg-rose-100 text-rose-800',
      'bg-amber-100 text-amber-800',
      'bg-purple-100 text-purple-800',
      'bg-cyan-100 text-cyan-800',
      'bg-indigo-100 text-indigo-800',
      'bg-teal-100 text-teal-800'
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  const getTeacherNameByCode = (code: string) => {
    if (!code || code === '-') return '';
    const fromRecords = records.find(r => r.kode === code);
    if (fromRecords) return fromRecords.namaGuru;
    const fromConst = SCHEDULE_TEACHERS.find(t => t.kode === code);
    return fromConst ? fromConst.nama : '';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[80vh] flex flex-col md:flex-row">
      {/* Sidebar Navigation for Settings */}
      <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-4 flex flex-col gap-1">
        <div className="px-4 py-3 mb-2 text-xs font-black text-slate-400 uppercase tracking-widest">Menu Pengaturan</div>
        {[
          { id: 'identitas', label: 'Identitas Sekolah', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
          { id: 'tim-supervisi', label: 'Tim Supervisi Internal', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
          { id: 'konfigurasi-jadwal', label: 'Konfigurasi Jadwal', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
          { id: 'database', label: 'Database Guru', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197' },
          { id: 'tugas-tu', label: 'Tugas Tambahan TU', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
          { id: 'jadwal-sekolah', label: 'Jadwal Pelajaran', icon: 'M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
          { id: 'predikat', label: 'Predikat Nilai', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
        ].map(item => (
          <button 
            key={item.id}
            onClick={() => setActiveTab(item.id as SettingTab)}
            className={`flex items-center px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${activeTab === item.id ? 'bg-white text-blue-600 shadow-md ring-1 ring-slate-100' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <svg className="w-4 h-4 mr-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}/></svg>
            {item.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 overflow-y-auto">
        
        {/* TAB 1: IDENTITAS SEKOLAH */}
        {activeTab === 'identitas' && (
          <div className="space-y-6 max-w-3xl animate-fadeIn">
            <div>
              <h2 className="text-lg font-black text-slate-800 uppercase">Identitas Sekolah & Pejabat</h2>
              <p className="text-xs text-slate-500 mt-1">Informasi dasar yang akan tampil pada kop laporan dan dokumen.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Nama Sekolah</label><input type="text" value={settings.namaSekolah} onChange={e => setSettings({...settings, namaSekolah: e.target.value})} className="w-full px-4 py-2 border rounded-xl font-bold" /></div>
              <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Tahun Pelajaran</label><input type="text" value={settings.tahunPelajaran} onChange={e => setSettings({...settings, tahunPelajaran: e.target.value})} className="w-full px-4 py-2 border rounded-xl font-bold" /></div>
              
              <div className="md:col-span-2 border-t pt-4 mt-2"><h3 className="text-xs font-black uppercase text-blue-600 mb-4">Kepala Sekolah</h3></div>
              <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Nama Kepala Sekolah</label><input type="text" value={settings.namaKepalaSekolah} onChange={e => setSettings({...settings, namaKepalaSekolah: e.target.value})} className="w-full px-4 py-2 border rounded-xl font-bold" /></div>
              <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">NIP Kepala Sekolah</label><input type="text" value={settings.nipKepalaSekolah} onChange={e => setSettings({...settings, nipKepalaSekolah: e.target.value})} className="w-full px-4 py-2 border rounded-xl font-mono" /></div>

              <div className="md:col-span-2 border-t pt-4 mt-2"><h3 className="text-xs font-black uppercase text-emerald-600 mb-4">Pengawas Pembina</h3></div>
              <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Nama Pengawas</label><input type="text" value={settings.namaPengawas} onChange={e => setSettings({...settings, namaPengawas: e.target.value})} className="w-full px-4 py-2 border rounded-xl font-bold" /></div>
              <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">NIP Pengawas</label><input type="text" value={settings.nipPengawas} onChange={e => setSettings({...settings, nipPengawas: e.target.value})} className="w-full px-4 py-2 border rounded-xl font-mono" /></div>

              <div className="md:col-span-2 border-t pt-4 mt-2"><h3 className="text-xs font-black uppercase text-slate-600 mb-4">Tanggal Cetak Dokumen (Default)</h3></div>
              <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Tanggal Cetak (Ganjil)</label><input type="text" value={settings.tanggalCetakGanjil} onChange={e => setSettings({...settings, tanggalCetakGanjil: e.target.value})} className="w-full px-4 py-2 border rounded-xl font-bold" /></div>
              <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Tanggal Cetak (Genap)</label><input type="text" value={settings.tanggalCetakGenap} onChange={e => setSettings({...settings, tanggalCetakGenap: e.target.value})} className="w-full px-4 py-2 border rounded-xl font-bold" /></div>
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-100">
                <button onClick={handleSaveSettings} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold uppercase shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                  Simpan Perubahan
                </button>
            </div>
          </div>
        )}

        {/* TAB 2: TIM SUPERVISI */}
        {activeTab === 'tim-supervisi' && (
          <div className="space-y-6 max-w-2xl animate-fadeIn">
            <div>
              <h2 className="text-lg font-black text-slate-800 uppercase">Tim Supervisi Internal</h2>
              <p className="text-xs text-slate-500 mt-1">Daftar guru senior yang ditunjuk sebagai supervisor pembantu.</p>
            </div>
            <div className="space-y-3">
              {settings.supervisors.map((sup, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <span className="text-xs font-bold text-slate-400 w-8">#{idx + 1}</span>
                  <input 
                    type="text" 
                    value={sup} 
                    onChange={e => {
                      const newSups = [...settings.supervisors];
                      newSups[idx] = e.target.value;
                      setSettings({...settings, supervisors: newSups});
                    }}
                    placeholder={`Nama Supervisor ${idx + 1}`}
                    className="flex-1 px-4 py-2 border rounded-xl font-bold text-sm" 
                  />
                  <button onClick={() => {
                    const newSups = settings.supervisors.filter((_, i) => i !== idx);
                    setSettings({...settings, supervisors: newSups});
                  }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              ))}
              <button 
                onClick={() => setSettings({...settings, supervisors: [...settings.supervisors, '']})}
                className="mt-2 text-xs font-bold text-blue-600 hover:underline uppercase"
              >
                + Tambah Anggota Tim
              </button>
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-100">
                <button onClick={handleSaveSettings} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold uppercase shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                  Simpan Perubahan
                </button>
            </div>
          </div>
        )}

        {/* TAB 3: KONFIGURASI JADWAL */}
        {activeTab === 'konfigurasi-jadwal' && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <h2 className="text-lg font-black text-slate-800 uppercase">Konfigurasi Jadwal Pelaksanaan</h2>
              <p className="text-xs text-slate-500 mt-1">Atur rentang tanggal pelaksanaan supervisi untuk setiap kategori dan semester.</p>
            </div>

            {/* Administrasi Guru */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
               <h3 className="text-sm font-black uppercase text-blue-800 mb-4 flex items-center gap-2">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 00-2-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                 Supervisi Administrasi Guru
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <span className="text-[10px] font-bold uppercase text-slate-500 block">Semester Ganjil</span>
                     <div className="flex items-center gap-2">
                        <input type="date" value={settings.rangeAdmGuruGanjil?.from} onChange={e => handleUpdateScheduleConfig('rangeAdmGuruGanjil', 'from', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-xs font-bold" />
                        <span className="text-slate-400">-</span>
                        <input type="date" value={settings.rangeAdmGuruGanjil?.to} onChange={e => handleUpdateScheduleConfig('rangeAdmGuruGanjil', 'to', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-xs font-bold" />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <span className="text-[10px] font-bold uppercase text-slate-500 block">Semester Genap</span>
                     <div className="flex items-center gap-2">
                        <input type="date" value={settings.rangeAdmGuruGenap?.from} onChange={e => handleUpdateScheduleConfig('rangeAdmGuruGenap', 'from', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-xs font-bold" />
                        <span className="text-slate-400">-</span>
                        <input type="date" value={settings.rangeAdmGuruGenap?.to} onChange={e => handleUpdateScheduleConfig('rangeAdmGuruGenap', 'to', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-xs font-bold" />
                     </div>
                  </div>
               </div>
            </div>

            {/* PBM Guru */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
               <h3 className="text-sm font-black uppercase text-emerald-800 mb-4 flex items-center gap-2">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                 Supervisi PBM (Pembelajaran)
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <span className="text-[10px] font-bold uppercase text-slate-500 block">Semester Ganjil</span>
                     <div className="flex items-center gap-2">
                        <input type="date" value={settings.rangePembelajaranGuru?.from} onChange={e => handleUpdateScheduleConfig('rangePembelajaranGuru', 'from', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-xs font-bold" />
                        <span className="text-slate-400">-</span>
                        <input type="date" value={settings.rangePembelajaranGuru?.to} onChange={e => handleUpdateScheduleConfig('rangePembelajaranGuru', 'to', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-xs font-bold" />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <span className="text-[10px] font-bold uppercase text-slate-500 block">Semester Genap</span>
                     <div className="flex items-center gap-2">
                        <input type="date" value={settings.rangePembelajaranGuruGenap?.from} onChange={e => handleUpdateScheduleConfig('rangePembelajaranGuruGenap', 'from', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-xs font-bold" />
                        <span className="text-slate-400">-</span>
                        <input type="date" value={settings.rangePembelajaranGuruGenap?.to} onChange={e => handleUpdateScheduleConfig('rangePembelajaranGuruGenap', 'to', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-xs font-bold" />
                     </div>
                  </div>
               </div>
            </div>

            {/* Tendik */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
               <h3 className="text-sm font-black uppercase text-purple-800 mb-4 flex items-center gap-2">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                 Supervisi Tenaga Kependidikan (Tendik)
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <span className="text-[10px] font-bold uppercase text-slate-500 block">Semester Ganjil</span>
                     <div className="flex items-center gap-2">
                        <input type="date" value={settings.rangeTendikGanjil?.from} onChange={e => handleUpdateScheduleConfig('rangeTendikGanjil', 'from', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-xs font-bold" />
                        <span className="text-slate-400">-</span>
                        <input type="date" value={settings.rangeTendikGanjil?.to} onChange={e => handleUpdateScheduleConfig('rangeTendikGanjil', 'to', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-xs font-bold" />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <span className="text-[10px] font-bold uppercase text-slate-500 block">Semester Genap</span>
                     <div className="flex items-center gap-2">
                        <input type="date" value={settings.rangeTendikGenap?.from} onChange={e => handleUpdateScheduleConfig('rangeTendikGenap', 'from', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-xs font-bold" />
                        <span className="text-slate-400">-</span>
                        <input type="date" value={settings.rangeTendikGenap?.to} onChange={e => handleUpdateScheduleConfig('rangeTendikGenap', 'to', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-xs font-bold" />
                     </div>
                  </div>
               </div>
            </div>

            {/* Ekstrakurikuler */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
               <h3 className="text-sm font-black uppercase text-rose-800 mb-4 flex items-center gap-2">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                 Supervisi Ekstrakurikuler
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <span className="text-[10px] font-bold uppercase text-slate-500 block">Semester Ganjil</span>
                     <div className="flex items-center gap-2">
                        <input type="date" value={settings.rangeExtraGanjil?.from} onChange={e => handleUpdateScheduleConfig('rangeExtraGanjil', 'from', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-xs font-bold" />
                        <span className="text-slate-400">-</span>
                        <input type="date" value={settings.rangeExtraGanjil?.to} onChange={e => handleUpdateScheduleConfig('rangeExtraGanjil', 'to', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-xs font-bold" />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <span className="text-[10px] font-bold uppercase text-slate-500 block">Semester Genap</span>
                     <div className="flex items-center gap-2">
                        <input type="date" value={settings.rangeExtraGenap?.from} onChange={e => handleUpdateScheduleConfig('rangeExtraGenap', 'from', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-xs font-bold" />
                        <span className="text-slate-400">-</span>
                        <input type="date" value={settings.rangeExtraGenap?.to} onChange={e => handleUpdateScheduleConfig('rangeExtraGenap', 'to', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-xs font-bold" />
                     </div>
                  </div>
               </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-100">
                <button onClick={handleSaveSettings} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold uppercase shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                  Simpan Perubahan
                </button>
            </div>
          </div>
        )}

        {/* TAB 4: DATABASE GURU */}
        {activeTab === 'database' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-black text-slate-800 uppercase">Database Guru</h2>
              <div className="flex gap-2">
                <button onClick={handleSaveSettings} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold uppercase shadow-lg hover:bg-indigo-700">Simpan Perubahan</button>
                <button onClick={handleAddTeacher} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold uppercase shadow-lg hover:bg-blue-700">+ Tambah Guru</button>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 uppercase font-black text-slate-500">
                  <tr>
                    <th className="p-3 w-10 text-center">No</th>
                    <th className="p-3">Kode</th>
                    <th className="p-3">Nama Lengkap</th>
                    <th className="p-3">NIP</th>
                    <th className="p-3">Mata Pelajaran</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.map((t, i) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-bold text-slate-400 text-center">{i + 1}</td>
                      <td className="p-3 font-mono text-emerald-600 font-bold">{t.kode || '-'}</td>
                      <td className="p-3 font-bold text-slate-800 uppercase">{toTitleCase(t.namaGuru)}</td>
                      <td className="p-3 font-mono text-slate-500">{t.nip}</td>
                      <td className="p-3 italic text-blue-600">{t.mataPelajaran}</td>
                      <td className="p-3 text-right">
                        <button onClick={() => handleEditTeacher(t)} className="text-blue-600 font-bold mr-3 hover:underline">Edit</button>
                        <button onClick={() => handleDeleteTeacher(t.id)} className="text-red-600 font-bold hover:underline">Hapus</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: TUGAS TAMBAHAN TU */}
        {activeTab === 'tugas-tu' && (
          <div className="animate-fadeIn">
            <TugasTambahanTU pttRecords={pttRecords} setPttRecords={setPttRecords} />
          </div>
        )}

        {/* TAB 6: JADWAL PELAJARAN */}
        {activeTab === 'jadwal-sekolah' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-800 uppercase">Jadwal Pelajaran Sekolah</h2>
                <p className="text-xs text-slate-500 mt-1">Jadwal ini digunakan sebagai acuan otomatis saat generate jadwal supervisi PBM.</p>
              </div>
              <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 flex flex-col gap-2 w-full md:w-auto">
                 <h4 className="text-[10px] font-black uppercase text-slate-500 flex justify-between items-center">
                    <span>Upload Jadwal Excel (.xlsx)</span>
                    <button onClick={handleDownloadTemplate} className="text-blue-600 hover:text-blue-800 text-[9px] font-bold uppercase underline">Download Template</button>
                 </h4>
                 <div className="flex gap-2">
                    <input type="text" value={uploadYear} onChange={e => setUploadYear(e.target.value)} className="w-24 px-2 py-1.5 text-[10px] border rounded font-bold" placeholder="TP 2025/2026" />
                    <select value={uploadSemester} onChange={e => setUploadSemester(e.target.value as 'Ganjil' | 'Genap')} className="w-24 px-2 py-1.5 text-[10px] border rounded font-bold">
                       <option value="Ganjil">Ganjil</option>
                       <option value="Genap">Genap</option>
                    </select>
                 </div>
                 <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="w-full text-[10px] text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="flex border-b bg-slate-50 overflow-x-auto no-scrollbar">
                {currentSchedule.map((day, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveScheduleTab(idx)}
                    className={`px-6 py-3 text-[10px] font-black uppercase whitespace-nowrap transition-colors border-b-2 ${activeScheduleTab === idx ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-slate-400 hover:bg-slate-100'}`}
                  >
                    {day.day}
                  </button>
                ))}
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-[10px] text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white uppercase">
                      <th className="p-3 border border-slate-800 w-12 text-center">Jam</th>
                      <th className="p-3 border border-slate-800 w-24 text-center">Waktu</th>
                      {CLASS_LIST.map(cls => (
                        <th key={cls} className="p-3 border border-slate-800 text-center min-w-[60px]">{cls}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentSchedule[activeScheduleTab]?.rows.map((row: any, rIdx: number) => (
                      <tr key={rIdx} className="hover:bg-slate-50">
                        <td className="p-2 border border-slate-200 text-center font-bold">{row.ke || '-'}</td>
                        <td className="p-2 border border-slate-200 text-center font-mono">{row.waktu}</td>
                        {row.activity ? (
                          <td colSpan={CLASS_LIST.length} className="p-2 border border-slate-200 text-center font-bold text-blue-600 uppercase bg-blue-50/30">
                            {row.activity}
                          </td>
                        ) : (
                          CLASS_LIST.map(cls => {
                            const code = row.classes?.[cls] || '-';
                            const teacherName = getTeacherNameByCode(code);
                            
                            return (
                              <td key={cls} className="p-1 border border-slate-200 text-center align-top">
                                {code !== '-' ? (
                                  <div className="flex flex-col items-center gap-1">
                                    <div className={`py-1 px-2 rounded text-[9px] font-black ${getTeacherColor(code)} w-full`}>
                                      {code}
                                    </div>
                                    <div className="text-[8px] font-medium text-slate-500 leading-tight line-clamp-2">
                                      {teacherName}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-slate-200">-</span>
                                )}
                              </td>
                            );
                          })
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-100">
                <button onClick={handleSaveSettings} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold uppercase shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                  Simpan Perubahan
                </button>
            </div>
          </div>
        )}

        {/* TAB 7: PREDIKAT NILAI */}
        {activeTab === 'predikat' && (
          <div className="space-y-6 max-w-xl animate-fadeIn">
            <div>
              <h2 className="text-lg font-black text-slate-800 uppercase">Konfigurasi Predikat Nilai</h2>
              <p className="text-xs text-slate-500 mt-1">Batas nilai minimum untuk setiap kategori predikat.</p>
            </div>
            
            <div className="space-y-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
               <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                  <span className="font-bold text-emerald-800 text-sm">Sangat Baik (A)</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">Minimal:</span>
                    <input type="number" value={settings.scoreSettings.excellent} onChange={e => setSettings({...settings, scoreSettings: {...settings.scoreSettings, excellent: parseInt(e.target.value)}})} className="w-20 px-2 py-1 border rounded font-bold text-center" />
                  </div>
               </div>
               <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <span className="font-bold text-blue-800 text-sm">Baik (B)</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">Minimal:</span>
                    <input type="number" value={settings.scoreSettings.good} onChange={e => setSettings({...settings, scoreSettings: {...settings.scoreSettings, good: parseInt(e.target.value)}})} className="w-20 px-2 py-1 border rounded font-bold text-center" />
                  </div>
               </div>
               <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <span className="font-bold text-amber-800 text-sm">Cukup (C)</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">Minimal:</span>
                    <input type="number" value={settings.scoreSettings.fair} onChange={e => setSettings({...settings, scoreSettings: {...settings.scoreSettings, fair: parseInt(e.target.value)}})} className="w-20 px-2 py-1 border rounded font-bold text-center" />
                  </div>
               </div>
               <div className="p-3 bg-red-50 rounded-lg border border-red-100 text-center">
                  <span className="font-bold text-red-800 text-sm">Kurang (D) : Di bawah {settings.scoreSettings.fair}</span>
               </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-100">
                <button onClick={handleSaveSettings} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold uppercase shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                  Simpan Perubahan
                </button>
            </div>
          </div>
        )}
      </div>

      {/* Teacher Modal */}
      {isTeacherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b bg-slate-50 font-bold uppercase text-slate-700">
              {editingTeacherId ? 'Edit Data Guru' : 'Tambah Guru Baru'}
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nama Lengkap</label>
                <input 
                  type="text" 
                  value={teacherForm.namaGuru || ''} 
                  onChange={e => setTeacherForm({...teacherForm, namaGuru: e.target.value})} 
                  className="w-full border rounded-lg p-2 text-xs font-bold uppercase" 
                  placeholder="Nama beserta gelar..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Kode Mapel</label>
                  <input 
                    type="text" 
                    value={teacherForm.kode || ''} 
                    onChange={e => setTeacherForm({...teacherForm, kode: e.target.value})} 
                    className="w-full border rounded-lg p-2 text-xs font-bold font-mono uppercase" 
                    placeholder="CONTOH: MAT-AB"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">NIP</label>
                  <input 
                    type="text" 
                    value={teacherForm.nip || ''} 
                    onChange={e => setTeacherForm({...teacherForm, nip: e.target.value})} 
                    className="w-full border rounded-lg p-2 text-xs font-mono" 
                    placeholder="NIP..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Mata Pelajaran</label>
                <input 
                  type="text" 
                  value={teacherForm.mataPelajaran || ''} 
                  onChange={e => setTeacherForm({...teacherForm, mataPelajaran: e.target.value})} 
                  className="w-full border rounded-lg p-2 text-xs font-bold" 
                  placeholder="Mata Pelajaran..."
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Pangkat / Golongan</label>
                <input 
                  type="text" 
                  value={teacherForm.pangkatGolongan || ''} 
                  onChange={e => setTeacherForm({...teacherForm, pangkatGolongan: e.target.value})} 
                  className="w-full border rounded-lg p-2 text-xs font-bold" 
                  placeholder="Contoh: Pembina, IV/a"
                />
              </div>
            </div>
            <div className="p-4 border-t bg-slate-50 flex justify-end gap-2">
              <button onClick={() => setIsTeacherModalOpen(false)} className="px-4 py-2 bg-white border rounded-lg text-xs font-bold text-slate-600">Batal</button>
              <button onClick={handleSaveTeacher} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold uppercase">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsView;
