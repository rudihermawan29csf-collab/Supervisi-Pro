
import React, { useMemo, useState, useEffect } from 'react';
import { TeacherRecord, SupervisionStatus, AppSettings } from '../types';
import { FULL_SCHEDULE, SCHEDULE_TEACHERS } from '../constants';

interface SupervisionViewProps {
  records: TeacherRecord[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelect: (record: TeacherRecord) => void;
  onUpdateRecords: (records: TeacherRecord[]) => void;
  settings: AppSettings;
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

const SupervisionView: React.FC<SupervisionViewProps> = ({ records, searchQuery, onUpdateRecords, settings, setSettings }) => {
  const activeSemester = settings.semester;
  
  // Local state for dates and supervisor
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [supervisorName, setSupervisorName] = useState(settings.namaKepalaSekolah);

  useEffect(() => {
    const range = activeSemester === 'Ganjil' ? settings.rangePembelajaranGuru : settings.rangePembelajaranGuruGenap;
    if (range) {
      setStartDate(range.from);
      setEndDate(range.to);
    }
    setSupervisorName(settings.namaKepalaSekolah);
  }, [settings, activeSemester]);

  const filteredRecords = useMemo(() => {
    return records
      .filter(r => r.semester === activeSemester)
      .filter(record => 
        record.namaGuru.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.mataPelajaran.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        if (!a.tanggalPemb) return 1;
        if (!b.tanggalPemb) return -1;
        return new Date(a.tanggalPemb).getTime() - new Date(b.tanggalPemb).getTime();
      });
  }, [records, searchQuery, activeSemester]);

  const handleGenerateSchedule = () => {
    if (!startDate || !endDate) {
      alert("Harap atur rentang tanggal pelaksanaan supervisi terlebih dahulu!");
      return;
    }

    // Save date range back to settings
    const newSettings = { ...settings };
    if (activeSemester === 'Ganjil') {
      newSettings.rangePembelajaranGuru = { from: startDate, to: endDate };
    } else {
      newSettings.rangePembelajaranGuruGenap = { from: startDate, to: endDate };
    }
    setSettings(newSettings);

    const start = new Date(startDate);
    const end = new Date(endDate);
    let currentDate = new Date(start);
    
    // Master list of teachers (unique by name)
    // Fix: Explicitly type masterTeachers as TeacherRecord[] to resolve 'unknown' type errors during mapping.
    const masterTeachers: TeacherRecord[] = Array.from(new Map<string, TeacherRecord>(records.map(r => [r.namaGuru, r])).values());
    const otherSemesterRecords = records.filter(r => r.semester !== activeSemester);
    
    const generated: TeacherRecord[] = masterTeachers.map((teacherTemplate) => {
      const teacherData = SCHEDULE_TEACHERS.find(t => t.nama === teacherTemplate.namaGuru);
      const teacherInitials = teacherData?.kode || '';
      
      let foundSlot = false;
      let safetyCounter = 0; 

      while (!foundSlot && safetyCounter < 365) {
        if (currentDate > end) currentDate = new Date(start);

        if (currentDate.getDay() !== 0) { 
          const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
          const dayNameStr = dayNames[currentDate.getDay()];
          const daySched = FULL_SCHEDULE.find(s => s.day.toUpperCase() === dayNameStr.toUpperCase());
          
          if (daySched) {
            for (const row of daySched.rows) {
              if (row.classes) {
                const teachingEntry = Object.entries(row.classes as Record<string, string>).find(([_, code]) => code === teacherInitials);
                if (teachingEntry) {
                  const [className] = teachingEntry;
                  foundSlot = true;
                  const dateStr = currentDate.toISOString().split('T')[0];
                  
                  // For Genap, we use a new ID if it's a clone
                  const newId = activeSemester === 'Genap' ? (teacherTemplate.no + 2000) : teacherTemplate.id;

                  const res: TeacherRecord = { 
                    ...teacherTemplate, 
                    id: newId,
                    semester: activeSemester,
                    tanggalPemb: dateStr, 
                    hari: dayNameStr, 
                    kelas: className, 
                    jamKe: String(row.ke), 
                    pewawancara: supervisorName,
                    status: SupervisionStatus.PENDING 
                  };
                  currentDate.setDate(currentDate.getDate() + 1);
                  return res;
                }
              }
            }
          }
        }
        currentDate.setDate(currentDate.getDate() + 1);
        safetyCounter++;
      }
      return { ...teacherTemplate, id: activeSemester === 'Genap' ? (teacherTemplate.no + 2000) : teacherTemplate.id, semester: activeSemester, pewawancara: supervisorName };
    });

    onUpdateRecords([...otherSemesterRecords, ...generated]);
    alert(`Jadwal PBM semester ${activeSemester} berhasil disusun ulang secara otomatis berdasarkan Jadwal Pelajaran!`);
  };

  const exportPDF = () => {
    const element = document.getElementById('supervision-export-content');
    // @ts-ignore
    html2pdf().from(element).save(`Jadwal_Supervisi_PBM_${activeSemester}.pdf`);
  };

  const exportWord = () => {
    const content = document.getElementById('supervision-export-content')?.innerHTML;
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid black; padding: 5px; font-size: 10pt; text-align: left; }</style></head><body>";
    const footer = "</body></html>";
    const blob = new Blob([header + content + footer], { type: 'application/msword' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Jadwal_Supervisi_PBM_${activeSemester}.doc`;
    link.click();
  };

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="bg-slate-50 p-6 rounded-2xl shadow-sm border border-slate-200 no-print flex flex-col md:flex-row justify-between items-end gap-4">
        <div className="space-y-3 w-full md:w-auto">
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-800">Pengaturan Jadwal Supervisi PBM</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">SMPN 3 PACET • {activeSemester}</p>
          </div>
          <div className="flex gap-4">
             <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase">Rentang Tanggal</label>
                <div className="flex items-center gap-2">
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="px-3 py-2 border rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
                    <span className="font-bold text-slate-400">-</span>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="px-3 py-2 border rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase">Supervisor (Pewawancara)</label>
                <input type="text" value={supervisorName} onChange={e => setSupervisorName(e.target.value)} className="w-64 px-4 py-2 border rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Nama Supervisor..." />
             </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
           <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200 mr-2">
             <button onClick={() => setSettings({...settings, semester: 'Ganjil'})} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold ${activeSemester === 'Ganjil' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500'}`}>Ganjil</button>
             <button onClick={() => setSettings({...settings, semester: 'Genap'})} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold ${activeSemester === 'Genap' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500'}`}>Genap</button>
           </div>
          <button onClick={handleGenerateSchedule} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg transition-all hover:bg-blue-700">Generate Otomatis</button>
          <button onClick={exportWord} className="px-4 py-2 bg-blue-800 text-white rounded-xl font-black text-[10px] uppercase shadow-lg transition-all hover:bg-blue-900">Word</button>
          <button onClick={exportPDF} className="px-4 py-2 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg transition-all hover:bg-red-700">PDF</button>
        </div>
      </div>

      <div id="supervision-export-content" className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden p-8 font-serif">
        <div className="text-center mb-8 border-b-2 border-slate-900 pb-4">
           <h1 className="text-xl font-black uppercase tracking-tight">Jadwal Pelaksanaan Supervisi Akademik (PBM)</h1>
           <h2 className="text-md font-bold uppercase">{settings.namaSekolah}</h2>
           <p className="text-[10px] font-bold mt-1 italic uppercase tracking-widest opacity-75">Tahun Pelajaran {settings.tahunPelajaran} • Semester {activeSemester}</p>
        </div>

        <table className="w-full text-left border-collapse border border-slate-800">
          <thead>
            <tr className="bg-slate-900 text-white uppercase text-center font-black">
              <th className="px-2 py-4 border border-slate-800 text-[11px] w-10">No</th>
              <th className="px-4 py-4 border border-slate-800 text-[11px] w-32">Hari, Tanggal</th>
              <th className="px-6 py-4 border border-slate-800 text-[11px] text-left">Nama Guru</th>
              <th className="px-6 py-4 border border-slate-800 text-[11px] text-left">Mata Pelajaran</th>
              <th className="px-4 py-4 border border-slate-800 text-[11px] w-24">Kelas</th>
              <th className="px-4 py-4 border border-slate-800 text-[11px] w-16">Jam</th>
              <th className="px-4 py-4 border border-slate-800 text-[11px] text-left">Supervisor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[11px]">
            {filteredRecords.length > 0 ? filteredRecords.map((r, i) => (
              <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-2 py-4 text-center border border-slate-800 font-bold text-slate-400">{i + 1}</td>
                <td className="px-4 py-4 text-center border border-slate-800 font-bold text-slate-700">{r.hari || '-'}, {formatIndonesianDate(r.tanggalPemb || '')}</td>
                <td className="px-6 py-4 border border-slate-800 font-black text-slate-900 uppercase leading-none">{toTitleCase(r.namaGuru)}</td>
                <td className="px-6 py-4 border border-slate-800 italic text-blue-700 font-medium">{r.mataPelajaran}</td>
                <td className="px-4 py-4 text-center border border-slate-800 font-black text-slate-700">{r.kelas || '-'}</td>
                <td className="px-4 py-4 text-center border border-slate-800 font-bold text-slate-900">{r.jamKe || '-'}</td>
                <td className="px-4 py-4 border border-slate-800 font-medium uppercase text-slate-600">{r.pewawancara || '-'}</td>
              </tr>
            )) : (
              <tr><td colSpan={7} className="text-center py-20 italic text-slate-400 border border-slate-800 uppercase tracking-widest">Jadwal belum tersedia. Silahkan atur tanggal and klik generate.</td></tr>
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

export default SupervisionView;
