
import React, { useMemo, useState, useEffect } from 'react';
import { TeacherRecord, SupervisionStatus, AppSettings } from '../types';

interface AdminSupervisionViewProps {
  records: TeacherRecord[];
  onUpdateRecords: (records: TeacherRecord[]) => void;
  settings: AppSettings;
  onSelect: (record: TeacherRecord) => void;
  setSettings: (settings: AppSettings) => void;
}

const formatIndonesianDate = (dateStr: string) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

const toTitleCase = (str: string) => {
  if (!str) return '';
  return str.toLowerCase().split(' ').map(word => {
    return (word.charAt(0).toUpperCase() + word.slice(1));
  }).join(' ');
};

const AdminSupervisionView: React.FC<AdminSupervisionViewProps> = ({ records, onUpdateRecords, settings, onSelect, setSettings }) => {
  const activeSemester = settings.semester;
  
  // Local state for configuration inputs
  const [sup1, setSup1] = useState(settings.namaKepalaSekolah);
  const [sup2, setSup2] = useState(settings.supervisors?.[1] || '');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [assignedToSup1, setAssignedToSup1] = useState<number[]>([]);
  const [assignedToSup2, setAssignedToSup2] = useState<number[]>([]);
  const [tempat1, setTempat1] = useState('Ruang Kepala Sekolah');
  const [tempat2, setTempat2] = useState('Ruang Guru');

  // Initialize state from settings
  useEffect(() => {
    const range = activeSemester === 'Ganjil' ? settings.rangeAdmGuruGanjil : settings.rangeAdmGuruGenap;
    if (range) {
      setStartDate(range.from);
      setEndDate(range.to);
    }
    // Default Sup 1 is Principal if empty
    if (!sup1) setSup1(settings.namaKepalaSekolah);
  }, [settings, activeSemester]);

  const teacherList = useMemo(() => {
    const names = Array.from(new Set(records.map(r => r.namaGuru))).sort();
    return names;
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records
      .filter(r => r.semester === activeSemester)
      .sort((a, b) => {
        if (!a.tanggalAdm) return 1;
        if (!b.tanggalAdm) return -1;
        return new Date(a.tanggalAdm).getTime() - new Date(b.tanggalAdm).getTime();
      });
  }, [records, activeSemester]);

  const toggleAssignment = (teacherId: number, supervisorNum: 1 | 2) => {
    if (supervisorNum === 1) {
      setAssignedToSup1(prev => prev.includes(teacherId) ? prev.filter(id => id !== teacherId) : [...prev, teacherId]);
      setAssignedToSup2(prev => prev.filter(id => id !== teacherId));
    } else {
      setAssignedToSup2(prev => prev.includes(teacherId) ? prev.filter(id => id !== teacherId) : [...prev, teacherId]);
      setAssignedToSup1(prev => prev.filter(id => id !== teacherId));
    }
  };

  const handleGenerateAdmin = () => {
    if (!startDate || !endDate) { alert('Harap isi tanggal mulai dan selesai!'); return; }
    
    // Update settings with new range and supervisors
    const newSettings = { ...settings, supervisors: [sup1, sup2] };
    if (activeSemester === 'Ganjil') {
      newSettings.rangeAdmGuruGanjil = { from: startDate, to: endDate };
    } else {
      newSettings.rangeAdmGuruGenap = { from: startDate, to: endDate };
    }
    setSettings(newSettings);

    const start = new Date(startDate);
    const end = new Date(endDate);
    let currentDate = new Date(start);
    
    // Get master list of teachers (unique by name) to handle empty semesters
    // Fix: Explicitly type masterTeachers as TeacherRecord[] to avoid 'unknown' type inference errors
    const masterTeachers: TeacherRecord[] = Array.from(new Map<string, TeacherRecord>(records.map(r => [r.namaGuru, r])).values());
    const otherSemesterRecords = records.filter(r => r.semester !== activeSemester);
    
    const updated = masterTeachers.map((tpl, index) => {
      // Skip Sundays
      while (currentDate.getDay() === 0) currentDate.setDate(currentDate.getDate() + 1); 
      // Reset if past end date
      if (currentDate > end) currentDate = new Date(start);
      
      const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      const dayNameStr = dayNames[currentDate.getDay()];
      
      // Determine Supervisor and Place
      let supervisor = assignedToSup1.includes(tpl.id) ? sup1 : (assignedToSup2.includes(tpl.id) ? sup2 : sup1);
      let loc = assignedToSup1.includes(tpl.id) ? tempat1 : (assignedToSup2.includes(tpl.id) ? tempat2 : tempat1);
      
      // For Genap, we use a new ID if it's a clone
      const newId = activeSemester === 'Genap' ? (tpl.no + 1000) : tpl.id;

      const res: TeacherRecord = { 
        ...tpl, 
        id: newId,
        semester: activeSemester,
        tanggalAdm: currentDate.toISOString().split('T')[0], 
        hari: dayNameStr, 
        pukul: '08.00 - 09.30', 
        pewawancara: supervisor, 
        tempat: loc, 
        status: SupervisionStatus.PENDING 
      };
      
      // Increment date for next teacher (assuming 1 per day or handle logic as needed)
      currentDate.setDate(currentDate.getDate() + 1);
      return res;
    });
    
    onUpdateRecords([...otherSemesterRecords, ...updated]);
    alert(`Jadwal Administrasi Guru semester ${activeSemester} berhasil disusun ulang!`);
  };

  const exportPDF = () => {
    const element = document.getElementById('admin-supervision-export');
    // @ts-ignore
    html2pdf().from(element).save(`Jadwal_Adm_Guru_${activeSemester}.pdf`);
  };

  const exportWord = () => {
    const content = document.getElementById('admin-supervision-export')?.innerHTML;
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid black; padding: 5px; font-size: 10pt; text-align: left; }</style></head><body>";
    const footer = "</body></html>";
    const blob = new Blob([header + content + footer], { type: 'application/msword' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Jadwal_Adm_Guru_${activeSemester}.doc`;
    link.click();
  };

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="bg-slate-50 p-6 rounded-2xl shadow-sm border border-slate-200 no-print space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Pengaturan Jadwal Supervisi Administrasi</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase">Semester {activeSemester} • TP {settings.tahunPelajaran}</p>
          </div>
          <div className="flex gap-2">
             <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200 mr-2">
               <button onClick={() => setSettings({...settings, semester: 'Ganjil'})} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold ${activeSemester === 'Ganjil' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500'}`}>Ganjil</button>
               <button onClick={() => setSettings({...settings, semester: 'Genap'})} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold ${activeSemester === 'Genap' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500'}`}>Genap</button>
             </div>
            <button onClick={handleGenerateAdmin} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-[10px] uppercase transition-all shadow-lg hover:bg-blue-700">Generate Jadwal</button>
          </div>
        </div>

        {/* Configuration Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase">Tanggal Mulai</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500" />
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase">Tanggal Selesai</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500" />
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase">Supervisor 1 (Utama)</label>
              <input type="text" value={sup1} onChange={e => setSup1(e.target.value)} className="w-full px-4 py-2 border rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nama Kepala Sekolah..." />
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase">Supervisor 2 (Guru Senior)</label>
              <select value={sup2} onChange={e => setSup2(e.target.value)} className="w-full px-4 py-2 border rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">-- Tidak Ada --</option>
                {teacherList.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
           </div>
        </div>

        {/* Assignment Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="space-y-2 bg-white p-4 rounded-xl border border-blue-100">
            <h4 className="text-[10px] font-black text-blue-600 uppercase flex justify-between">
               <span>Daftar Guru (Supervisor 1: {sup1})</span>
               <input type="text" value={tempat1} onChange={e => setTempat1(e.target.value)} className="text-right border-b border-blue-200 outline-none text-[10px] w-24 bg-transparent" />
            </h4>
            <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar">
                {records.filter(r => r.semester === activeSemester).map(teacher => (
                  <label key={teacher.id} className="flex items-center p-1.5 hover:bg-slate-50 rounded cursor-pointer text-[10px] font-medium">
                    <input type="checkbox" checked={assignedToSup1.includes(teacher.id)} onChange={() => toggleAssignment(teacher.id, 1)} className="mr-2 rounded text-blue-600 focus:ring-blue-500" />
                    {teacher.namaGuru}
                  </label>
                ))}
                {records.filter(r => r.semester === activeSemester).length === 0 && (
                   <p className="text-[10px] text-slate-400 italic">Generate jadwal terlebih dahulu untuk memunculkan daftar.</p>
                )}
            </div>
          </div>
          <div className="space-y-2 bg-white p-4 rounded-xl border border-emerald-100">
            <h4 className="text-[10px] font-black text-emerald-600 uppercase flex justify-between">
               <span>Daftar Guru (Supervisor 2: {sup2 || '-'})</span>
               <input type="text" value={tempat2} onChange={e => setTempat2(e.target.value)} className="text-right border-b border-emerald-200 outline-none text-[10px] w-24 bg-transparent" />
            </h4>
            <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar">
                {records.filter(r => r.semester === activeSemester).map(teacher => (
                  <label key={teacher.id} className="flex items-center p-1.5 hover:bg-slate-50 rounded cursor-pointer text-[10px] font-medium">
                    <input type="checkbox" checked={assignedToSup2.includes(teacher.id)} onChange={() => toggleAssignment(teacher.id, 2)} className="mr-2 rounded text-emerald-600 focus:ring-emerald-500" />
                    {teacher.namaGuru}
                  </label>
                ))}
                {records.filter(r => r.semester === activeSemester).length === 0 && (
                   <p className="text-[10px] text-slate-400 italic">Generate jadwal terlebih dahulu untuk memunculkan daftar.</p>
                )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 no-print">
         <button onClick={exportWord} className="px-4 py-2 bg-blue-800 text-white rounded-lg font-bold text-[10px] uppercase shadow-md hover:bg-blue-900">Download Word</button>
         <button onClick={exportPDF} className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold text-[10px] uppercase shadow-md hover:bg-red-700">Download PDF</button>
      </div>

      <div id="admin-supervision-export" className="bg-white rounded-2xl shadow-xl border border-slate-200 p-10 font-serif">
        <div className="text-center border-b-2 border-slate-900 mb-6 pb-2">
           <h1 className="text-xl font-bold uppercase tracking-tight">Jadwal Supervisi Administrasi Guru</h1>
           <h2 className="text-lg font-bold uppercase">{settings.namaSekolah}</h2>
           <p className="text-xs font-bold mt-1 uppercase">Semester {activeSemester} • TP {settings.tahunPelajaran}</p>
        </div>
        <table className="w-full text-left border-collapse table-auto border border-slate-800 text-[10px]">
          <thead>
            <tr className="bg-slate-100 text-center uppercase font-bold">
              <th className="px-2 py-3 border border-slate-800 w-10">No</th>
              <th className="px-4 py-3 border border-slate-800 w-32">Hari, Tanggal</th>
              <th className="px-4 py-3 border border-slate-800">Nama Guru</th>
              <th className="px-4 py-3 border border-slate-800 text-left">Pewawancara</th>
              <th className="px-4 py-3 border border-slate-800 text-left">Tempat</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length > 0 ? filteredRecords.map((r, i) => (
              <tr key={r.id}>
                <td className="px-2 py-2 border border-slate-800 text-center">{i + 1}</td>
                <td className="px-4 py-2 border border-slate-800 font-bold text-center">{r.hari}, {formatIndonesianDate(r.tanggalAdm || '')}</td>
                <td className="px-4 py-2 border border-slate-800 font-bold uppercase">{toTitleCase(r.namaGuru)}</td>
                <td className="px-4 py-2 border border-slate-800 font-bold">{r.pewawancara || '-'}</td>
                <td className="px-4 py-2 border border-slate-800">{r.tempat || '-'}</td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="py-20 text-center italic text-slate-400 uppercase tracking-widest">Jadwal belum tersedia for semester ini. Atur tanggal and klik "Generate Jadwal".</td></tr>
            )}
          </tbody>
        </table>

        {/* SIGNATURE BLOCK */}
        <div className="mt-12 flex justify-between items-start text-xs font-bold uppercase tracking-tight px-4">
          <div className="text-center w-64 invisible">
             <p className="mb-20 uppercase">Petugas Supervisi</p>
             <p className="underline font-black">................................................</p>
          </div>
          <div className="text-center w-64">
             <p className="mb-20 uppercase">
                Mojokerto, {activeSemester === 'Ganjil' ? settings.tanggalCetakGanjil : settings.tanggalCetakGenap}<br/>
                Kepala {settings.namaSekolah}
             </p>
             <p className="font-black underline">{settings.namaKepalaSekolah}</p>
             <p className="text-[10px] font-mono tracking-tighter">NIP. {settings.nipKepalaSekolah}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSupervisionView;
