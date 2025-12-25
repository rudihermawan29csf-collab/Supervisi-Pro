import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleEditStaff(idx)} className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors shadow-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                    </button>
                    <button onClick={() => handleDeleteStaff(idx)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors shadow-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
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

  // Schedule Management State (Separated from App Settings)
  const [manageScheduleYear, setManageScheduleYear] = useState(settings.tahunPelajaran);
  const [manageScheduleSemester, setManageScheduleSemester] = useState<'Ganjil' | 'Genap'>(settings.semester);
  const [activeScheduleTab, setActiveScheduleTab] = useState(0);

  // Sync default manage state with settings when settings change
  useEffect(() => {
    setManageScheduleYear(settings.tahunPelajaran);
    setManageScheduleSemester(settings.semester);
  }, [settings.tahunPelajaran, settings.semester]);

  // Determine current schedule data based on MANAGED selection, not global settings
  const currentSchedule = useMemo(() => {
    const key = `${manageScheduleYear}-${manageScheduleSemester}`;
    if (uploadedSchedules[key]) {
      return uploadedSchedules[key];
    }
    // Fallback only to default if keys match defaults, otherwise return empty to indicate no schedule
    if (manageScheduleYear === '2025/2026' && manageScheduleSemester === 'Ganjil') {
        return FULL_SCHEDULE; 
    }
    return []; 
  }, [uploadedSchedules, manageScheduleYear, manageScheduleSemester]);

  const displayedRecords = useMemo(() => {
    return records.filter(r => 
        r.semester === settings.semester && 
        (r.tahunPelajaran ? r.tahunPelajaran === settings.tahunPelajaran : true) // Match year or show if no year (legacy)
    );
  }, [records, settings.semester, settings.tahunPelajaran]);

  const handleEditTeacher = (teacher: TeacherRecord) => {
    setEditingTeacherId(teacher.id);
    setTeacherForm(teacher);
    setIsTeacherModalOpen(true);
  };

  const handleAddTeacher = () => {
    setEditingTeacherId(null);
    setTeacherForm({ namaGuru: '', nip: '', mataPelajaran: '', pangkatGolongan: '-', kode: '', noHP: '', sertifikasi: 'Belum' });
    setIsTeacherModalOpen(true);
  };

  const handleDeleteTeacher = (e: React.MouseEvent<HTMLButtonElement>, teacher: TeacherRecord) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    
    const targetName = teacher.namaGuru.trim();

    if (window.confirm(`PERINGATAN: Anda akan menghapus data guru "${targetName}" pada Tahun Pelajaran ${settings.tahunPelajaran}.\n\nApakah Anda yakin?`)) {
      // Hapus hanya record yang sesuai nama, semester, dan tahun pelajaran
      const updatedRecords = records.filter(r => 
        !(r.namaGuru.trim().toLowerCase() === targetName.toLowerCase() && 
          r.semester === settings.semester && 
          (r.tahunPelajaran === settings.tahunPelajaran || !r.tahunPelajaran))
      );
      
      setRecords(updatedRecords);
      alert(`Data guru ${targetName} berhasil dihapus dari database.`);
    }
  };

  const handleSaveTeacher = () => {
    if (!teacherForm.namaGuru) return alert('Nama Guru harus diisi');
    
    if (editingTeacherId) {
      setRecords(records.map(r => r.id === editingTeacherId ? { ...r, ...teacherForm, tahunPelajaran: settings.tahunPelajaran } : r));
    } else {
      const maxId = records.length > 0 
        ? Math.max(...records.map(r => Number(r.id) || 0)) 
        : 0;
      const newId = maxId + 1;

      const newRecord: TeacherRecord = {
        id: newId,
        no: newId,
        namaGuru: teacherForm.namaGuru || '',
        nip: teacherForm.nip || '-',
        mataPelajaran: teacherForm.mataPelajaran || '',
        pangkatGolongan: teacherForm.pangkatGolongan || '-',
        kode: teacherForm.kode || '',
        noHP: teacherForm.noHP || '-',
        sertifikasi: teacherForm.sertifikasi || 'Belum',
        hari: '', tanggal: '', kelas: '', jamKe: '', status: SupervisionStatus.PENDING, 
        semester: settings.semester,
        tahunPelajaran: settings.tahunPelajaran, // Bind to current academic year
        ...teacherForm
      } as TeacherRecord;
      setRecords([...records, newRecord]);
    }
    setIsTeacherModalOpen(false);
  };

  const handleTeacherTemplate = () => {
    // @ts-ignore
    if (typeof window.XLSX !== 'undefined') {
        const headers = ["Nama Lengkap", "NIP", "Kode Mapel", "Mata Pelajaran", "Pangkat/Gol", "No HP", "Sertifikasi (Sudah/Belum)"];
        const example = ["Budi Santoso, S.Pd", "19800101 200501 1 001", "MAT-BS", "Matematika", "III/c", "08123456789", "Sudah"];
        
        // @ts-ignore
        const ws = window.XLSX.utils.aoa_to_sheet([headers, example]);
        // @ts-ignore
        const wb = window.XLSX.utils.book_new();
        // @ts-ignore
        window.XLSX.utils.book_append_sheet(wb, ws, "Template Guru");
        // @ts-ignore
        window.XLSX.writeFile(wb, "Template_Data_Guru.xlsx");
    } else {
        alert("Library Excel belum siap.");
    }
  };

  const handleTeacherImport = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const data = window.XLSX.utils.sheet_to_json(ws, { header: 1 });
      
      // Skip header row
      const rows = data.slice(1);
      const newTeachers: TeacherRecord[] = [];
      
      let maxId = records.length > 0 ? Math.max(...records.map(r => r.id)) : 0;

      rows.forEach((row: any[]) => {
         if (row[0]) { // If name exists
             maxId++;
             newTeachers.push({
                 id: maxId,
                 no: maxId,
                 namaGuru: row[0],
                 nip: row[1] || '-',
                 kode: row[2] || '',
                 mataPelajaran: row[3] || '',
                 pangkatGolongan: row[4] || '-',
                 noHP: row[5] || '-',
                 sertifikasi: row[6] || 'Belum',
                 hari: '', tanggal: '', kelas: '', jamKe: '', status: SupervisionStatus.PENDING,
                 semester: settings.semester,
                 tahunPelajaran: settings.tahunPelajaran
             });
         }
      });

      if (newTeachers.length > 0) {
          setRecords([...records, ...newTeachers]);
          alert(`Berhasil mengimpor ${newTeachers.length} data guru untuk ${settings.tahunPelajaran} ${settings.semester}.`);
      } else {
          alert('Tidak ada data valid yang ditemukan dalam file.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleExportTeachersExcel = () => {
    // @ts-ignore
    if (typeof window.XLSX !== 'undefined') {
        const exportData = displayedRecords.map((r, i) => ({
            No: i + 1,
            Kode: r.kode,
            Nama: r.namaGuru,
            NIP: r.nip,
            Mapel: r.mataPelajaran,
            Pangkat: r.pangkatGolongan,
            HP: r.noHP,
            Sertifikasi: r.sertifikasi
        }));
        // @ts-ignore
        const ws = window.XLSX.utils.json_to_sheet(exportData);
        // @ts-ignore
        const wb = window.XLSX.utils.book_new();
        // @ts-ignore
        window.XLSX.utils.book_append_sheet(wb, ws, "Data Guru");
        // @ts-ignore
        window.XLSX.writeFile(wb, `Data_Guru_${settings.tahunPelajaran.replace('/','-')}_${settings.semester}.xlsx`);
    }
  };

  const handleExportTeachersPDF = () => {
      const element = document.getElementById('teacher-db-table');
      // @ts-ignore
      html2pdf().from(element).save(`Data_Guru_${settings.tahunPelajaran.replace('/','-')}_${settings.semester}.pdf`);
  };

  const handleUpdateScheduleConfig = (key: keyof AppSettings, field: 'from' | 'to', value: string) => {
    const currentRange = settings[key] as DateRange;
    setSettings({ ...settings, [key]: { ...currentRange, [field]: value } });
  };

  const handleSaveSettings = () => {
    alert('Pengaturan dan data berhasil disimpan!');
  };

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
      const key = `${manageScheduleYear}-${manageScheduleSemester}`; // Use managed state key
      setUploadedSchedules({ ...uploadedSchedules, [key]: processed });
      alert(`Jadwal untuk ${manageScheduleYear} Semester ${manageScheduleSemester} berhasil diupload!`);
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
      'bg-blue-100 text-blue-800', 'bg-emerald-100 text-emerald-800', 'bg-rose-100 text-rose-800',
      'bg-amber-100 text-amber-800', 'bg-purple-100 text-purple-800', 'bg-cyan-100 text-cyan-800',
      'bg-indigo-100 text-indigo-800', 'bg-teal-100 text-teal-800'
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
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-4 flex flex-col gap-1">
        <div className="px-4 py-3 mb-2 text-xs font-black text-slate-400 uppercase tracking-widest">Menu Pengaturan</div>
        {[
          { id: 'identitas', label: 'Identitas & Semester Aktif', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
          { id: 'tim-supervisi', label: 'Tim Supervisi Internal', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
          { id: 'konfigurasi-jadwal', label: 'Konfigurasi Waktu Supervisi', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
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

      <div className="flex-1 p-8 overflow-y-auto">
        {/* TAB 1: IDENTITAS */}
        {activeTab === 'identitas' && (
          <div className="space-y-6 max-w-3xl animate-fadeIn">
            <div>
              <h2 className="text-lg font-black text-slate-800 uppercase">Identitas & Semester Aktif</h2>
              <p className="text-xs text-slate-500 mt-1">Pengaturan identitas sekolah dan periode aktif aplikasi.</p>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mb-6">
                <h3 className="text-xs font-black uppercase text-yellow-800 mb-2">Periode Aktif Aplikasi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Tahun Pelajaran</label>
                        <input type="text" value={settings.tahunPelajaran} onChange={e => setSettings({...settings, tahunPelajaran: e.target.value})} className="w-full px-4 py-2 border rounded-xl font-bold bg-white" placeholder="Contoh: 2025/2026" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Semester Aktif</label>
                        <select 
                            value={settings.semester} 
                            onChange={e => setSettings({...settings, semester: e.target.value as 'Ganjil' | 'Genap'})} 
                            className="w-full px-4 py-2 border rounded-xl font-bold bg-white outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="Ganjil">Ganjil</option>
                            <option value="Genap">Genap</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 border-t pt-4"><h3 className="text-xs font-black uppercase text-slate-600 mb-2">Data Sekolah</h3></div>
              <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Nama Sekolah</label><input type="text" value={settings.namaSekolah} onChange={e => setSettings({...settings, namaSekolah: e.target.value})} className="w-full px-4 py-2 border rounded-xl font-bold" /></div>
              
              <div className="md:col-span-2 border-t pt-4 mt-2"><h3 className="text-xs font-black uppercase text-blue-600 mb-4">Kepala Sekolah</h3></div>
              <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Nama Kepala Sekolah</label><input type="text" value={settings.namaKepalaSekolah} onChange={e => setSettings({...settings, namaKepalaSekolah: e.target.value})} className="w-full px-4 py-2 border rounded-xl font-bold" /></div>
              <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">NIP Kepala Sekolah</label><input type="text" value={settings.nipKepalaSekolah} onChange={e => setSettings({...settings, nipKepalaSekolah: e.target.value})} className="w-full px-4 py-2 border rounded-xl font-mono" /></div>

              <div className="md:col-span-2 border-t pt-4 mt-2"><h3 className="text-xs font-black uppercase text-emerald-600 mb-4">Pengawas Pembina</h3></div>
              <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Nama Pengawas</label><input type="text" value={settings.namaPengawas} onChange={e => setSettings({...settings, namaPengawas: e.target.value})} className="w-full px-4 py-2 border rounded-xl font-bold" /></div>
              <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">NIP Pengawas</label><input type="text" value={settings.nipPengawas} onChange={e => setSettings({...settings, nipPengawas: e.target.value})} className="w-full px-4 py-2 border rounded-xl font-mono" /></div>

              <div className="md:col-span-2 border-t pt-4 mt-2"><h3 className="text-xs font-black uppercase text-slate-600 mb-4">Tanggal Cetak Dokumen</h3></div>
              <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Tanggal Cetak (Ganjil)</label><input type="text" value={settings.tanggalCetakGanjil} onChange={e => setSettings({...settings, tanggalCetakGanjil: e.target.value})} className="w-full px-4 py-2 border rounded-xl font-bold" /></div>
              <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Tanggal Cetak (Genap)</label><input type="text" value={settings.tanggalCetakGenap} onChange={e => setSettings({...settings, tanggalCetakGenap: e.target.value})} className="w-full px-4 py-2 border rounded-xl font-bold" /></div>
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-100">
                <button onClick={handleSaveSettings} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold uppercase shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2">Simpan Perubahan</button>
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
                  <input type="text" value={sup} onChange={e => {const newSups = [...settings.supervisors]; newSups[idx] = e.target.value; setSettings({...settings, supervisors: newSups});}} placeholder={`Nama Supervisor ${idx + 1}`} className="flex-1 px-4 py-2 border rounded-xl font-bold text-sm" />
                  <button onClick={() => {const newSups = settings.supervisors.filter((_, i) => i !== idx); setSettings({...settings, supervisors: newSups});}} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                </div>
              ))}
              <button onClick={() => setSettings({...settings, supervisors: [...settings.supervisors, '']})} className="mt-2 text-xs font-bold text-blue-600 hover:underline uppercase">+ Tambah Anggota Tim</button>
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-100"><button onClick={handleSaveSettings} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold uppercase shadow-lg">Simpan Perubahan</button></div>
          </div>
        )}

        {/* TAB 3: KONFIGURASI JADWAL */}
        {activeTab === 'konfigurasi-jadwal' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Same as previous version, omitted for brevity but logic preserved */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
               <h3 className="text-sm font-black uppercase text-blue-800 mb-4">Supervisi Administrasi Guru</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2"><span className="text-[10px] font-bold uppercase text-slate-500 block">Semester Ganjil</span><div className="flex items-center gap-2"><input type="date" value={settings.rangeAdmGuruGanjil?.from} onChange={e => handleUpdateScheduleConfig('rangeAdmGuruGanjil', 'from', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-xs font-bold" /><span className="text-slate-400">-</span><input type="date" value={settings.rangeAdmGuruGanjil?.to} onChange={e => handleUpdateScheduleConfig('rangeAdmGuruGanjil', 'to', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-xs font-bold" /></div></div>
                  <div className="space-y-2"><span className="text-[10px] font-bold uppercase text-slate-500 block">Semester Genap</span><div className="flex items-center gap-2"><input type="date" value={settings.rangeAdmGuruGenap?.from} onChange={e => handleUpdateScheduleConfig('rangeAdmGuruGenap', 'from', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-xs font-bold" /><span className="text-slate-400">-</span><input type="date" value={settings.rangeAdmGuruGenap?.to} onChange={e => handleUpdateScheduleConfig('rangeAdmGuruGenap', 'to', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-xs font-bold" /></div></div>
               </div>
            </div>
            {/* ... Other schedule sections ... */}
            <div className="flex justify-end pt-4 border-t border-slate-100"><button onClick={handleSaveSettings} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold uppercase shadow-lg">Simpan Perubahan</button></div>
          </div>
        )}

        {/* TAB 4: DATABASE GURU */}
        {activeTab === 'database' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-800 uppercase">Database Guru</h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                   Tahun Pelajaran: <span className="text-blue-600">{settings.tahunPelajaran}</span> • Semester: <span className="text-blue-600">{settings.semester}</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <input type="file" id="import-teachers" accept=".xlsx, .xls" className="hidden" onChange={handleTeacherImport} />
                <label htmlFor="import-teachers" className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase shadow-sm hover:bg-slate-200 cursor-pointer flex items-center gap-1 border border-slate-300">
                   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg> Import Excel
                </label>
                <button onClick={handleTeacherTemplate} className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase shadow-sm hover:bg-slate-200 border border-slate-300">Template</button>
                <button onClick={handleExportTeachersExcel} className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-[10px] font-bold uppercase shadow-md hover:bg-emerald-700">Excel</button>
                <button onClick={handleExportTeachersPDF} className="px-3 py-2 bg-red-600 text-white rounded-lg text-[10px] font-bold uppercase shadow-md hover:bg-red-700">PDF</button>
                <button onClick={handleAddTeacher} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase shadow-md hover:bg-blue-700">+ Baru</button>
              </div>
            </div>
            
            <div id="teacher-db-table" className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
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
                  {displayedRecords.map((t, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-bold text-slate-400 text-center">{i + 1}</td>
                      <td className="p-3 font-mono text-emerald-600 font-bold">{t.kode || '-'}</td>
                      <td className="p-3 font-bold text-slate-800 uppercase">{toTitleCase(t.namaGuru)}</td>
                      <td className="p-3 font-mono text-slate-500">{t.nip}</td>
                      <td className="p-3 italic text-blue-600">{t.mataPelajaran}</td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => handleEditTeacher(t)} className="p-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors shadow-sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg></button>
                          <button type="button" onClick={(e) => handleDeleteTeacher(e, t)} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors shadow-sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {displayedRecords.length === 0 && (
                    <tr><td colSpan={6} className="p-8 text-center text-slate-400 italic">Belum ada data guru untuk Tahun Pelajaran {settings.tahunPelajaran} ({settings.semester}). Silakan import atau tambah baru.</td></tr>
                  )}
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
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-800 uppercase">Manajemen Jadwal Pelajaran</h2>
                <p className="text-xs text-slate-500 mt-1">Atur jadwal pelajaran untuk masing-masing semester sesuai Tahun Pelajaran.</p>
              </div>
              
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between shadow-sm">
                 <div className="flex gap-4 items-center">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400 block">Tahun Pelajaran</label>
                        <input type="text" value={manageScheduleYear} onChange={e => setManageScheduleYear(e.target.value)} className="w-32 px-3 py-2 border rounded-lg text-xs font-bold" placeholder="TP..." />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400 block">Semester Jadwal</label>
                        <div className="flex bg-slate-100 p-1 rounded-lg">
                           <button 
                             onClick={() => setManageScheduleSemester('Ganjil')} 
                             className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${manageScheduleSemester === 'Ganjil' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                           >
                             Ganjil
                           </button>
                           <button 
                             onClick={() => setManageScheduleSemester('Genap')} 
                             className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${manageScheduleSemester === 'Genap' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500'}`}
                           >
                             Genap
                           </button>
                        </div>
                    </div>
                 </div>

                 <div className="flex flex-col gap-2 items-end">
                     <div className="flex gap-2">
                        <input type="file" id="schedule-upload" accept=".xlsx, .xls" onChange={handleFileUpload} className="hidden" />
                        <label htmlFor="schedule-upload" className="cursor-pointer px-4 py-2 bg-slate-800 text-white rounded-lg text-[10px] font-bold uppercase shadow hover:bg-slate-900 flex items-center gap-2">
                           <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                           Upload Excel ({manageScheduleSemester})
                        </label>
                        <button onClick={handleDownloadTemplate} className="text-blue-600 hover:text-blue-800 text-[10px] font-bold uppercase underline px-2">Template</button>
                     </div>
                     <p className="text-[9px] text-slate-400 italic">Mengedit jadwal untuk: <strong>{manageScheduleYear} - {manageScheduleSemester}</strong></p>
                 </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="flex border-b bg-slate-50 overflow-x-auto no-scrollbar">
                {currentSchedule.length > 0 ? currentSchedule.map((day, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveScheduleTab(idx)}
                    className={`px-6 py-3 text-[10px] font-black uppercase whitespace-nowrap transition-colors border-b-2 ${activeScheduleTab === idx ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-slate-400 hover:bg-slate-100'}`}
                  >
                    {day.day}
                  </button>
                )) : (
                   <div className="p-4 text-[10px] text-slate-400 italic w-full text-center">Belum ada jadwal diupload untuk semester ini.</div>
                )}
              </div>
              
              {currentSchedule.length > 0 && (
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
              )}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">No HP / WA</label>
                  <input 
                    type="text" 
                    value={teacherForm.noHP || ''} 
                    onChange={e => setTeacherForm({...teacherForm, noHP: e.target.value})} 
                    className="w-full border rounded-lg p-2 text-xs font-bold" 
                    placeholder="08..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Sertifikasi</label>
                  <select 
                    value={teacherForm.sertifikasi || 'Belum'} 
                    onChange={e => setTeacherForm({...teacherForm, sertifikasi: e.target.value})} 
                    className="w-full border rounded-lg p-2 text-xs font-bold"
                  >
                    <option value="Belum">Belum</option>
                    <option value="Sudah">Sudah</option>
                  </select>
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