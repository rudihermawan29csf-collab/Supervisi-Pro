
import React, { useState, useMemo, useEffect } from 'react';
import { AppSettings, ExtraRecord, TeacherRecord } from '../types';

interface Props {
  settings: AppSettings;
  setSettings: (s: AppSettings) => void;
  extraRecords: ExtraRecord[];
  setExtraRecords: (recs: ExtraRecord[]) => void;
  teacherRecords: TeacherRecord[];
}

const DEFAULT_EXTRA_TEMPLATES = [
  { nama: 'Fahmi Wahyuni, S.Pd', nip: '-', ekstra: 'OSN Bahasa Indonesia', pukul: '10.00 - 11.00', tempat: 'Ruang Kepala Sekolah' },
  { nama: 'Rudi Hermawan, S.Pd.I', nip: '19891029 202012 1 003', ekstra: 'TBTQ', pukul: '11.00 - 12.30', tempat: 'Ruang Kepala Sekolah' },
  { nama: 'Eka Hariyati, S.Pd.', nip: '-', ekstra: 'Pembina PMR/UKS', pukul: '11.00 - 12.00', tempat: 'Ruang Kepala Sekolah' },
  { nama: 'Fery Agus Pujianto', nip: '-', ekstra: 'Pembina Pramuka', pukul: '11.00 - 12.30', tempat: 'Ruang Kepala Sekolah' },
  { nama: 'Moch. Husain Rifai Hamzah, S.Pd.', nip: '19920316 202012 1 011', ekstra: 'Pembina Futsal', pukul: '11.00 - 12.30', tempat: 'Ruang Kepala Sekolah' },
  { nama: 'Fakhita Madury, S.Sn.', nip: '-', ekstra: 'Seni', pukul: '11.00 - 12.00', tempat: 'Ruang Kelas' },
  { nama: 'Rebby Dwi Prataopu, S.Si.', nip: '-', ekstra: 'OSN IPA', pukul: '09.00 - 10.30', tempat: 'Laboratorium IPA' },
  { nama: 'Mukhamad Yunus, S.Pd', nip: '-', ekstra: 'OSN Matematika', pukul: '11.00 - 12.00', tempat: 'Ruang Kelas' },
  { nama: 'Retno Nawangwulan, S.Pd.', nip: '19850703 202521 2 006', ekstra: 'English Club', pukul: '12.00 - 13.30', tempat: 'Ruang Kelas' },
];

const ScheduleExtraView: React.FC<Props> = ({ settings, setSettings, extraRecords, setExtraRecords, teacherRecords }) => {
  const activeSemester = settings.semester;
  const filteredData = useMemo(() => extraRecords.filter(r => r.semester === activeSemester), [extraRecords, activeSemester]);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [supervisorName, setSupervisorName] = useState(settings.namaKepalaSekolah);

  useEffect(() => {
    const range = activeSemester === 'Ganjil' ? settings.rangeExtraGanjil : settings.rangeExtraGenap;
    if (range) {
      setStartDate(range.from);
      setEndDate(range.to);
    }
    setSupervisorName(settings.namaKepalaSekolah);
  }, [settings, activeSemester]);

  const teacherList = useMemo(() => {
    const names: string[] = Array.from(new Set(teacherRecords.map(r => r.namaGuru))).sort() as string[];
    const list: { name: string; nip: string }[] = names.map((name: string) => {
      const record = teacherRecords.find(r => r.namaGuru === name);
      return { name, nip: record?.nip || '-' };
    });
    if (!names.includes('Fery Agus Pujianto')) {
      list.push({ name: 'Fery Agus Pujianto', nip: '-' });
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [teacherRecords]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Omit<ExtraRecord, 'id' | 'semester'>>({
    nama: '', nip: '', hari: '', tgl: '', pukul: '', ekstra: '', tempat: '', supervisor: settings.namaKepalaSekolah
  });

  const handleOpenModal = (record?: ExtraRecord) => {
    if (record) {
      setEditingId(record.id);
      setFormData({
        nama: record.nama, nip: record.nip, hari: record.hari, tgl: record.tgl, pukul: record.pukul, ekstra: record.ekstra, tempat: record.tempat, supervisor: record.supervisor
      });
    } else {
      setEditingId(null);
      setFormData({
        nama: '', nip: '', hari: '', tgl: '', pukul: '', ekstra: '', tempat: '', supervisor: supervisorName
      });
    }
    setIsModalOpen(true);
  };

  const handleGenerateExtra = () => {
    if (!startDate || !endDate) { alert('Tentukan rentang tanggal terlebih dahulu!'); return; }
    
    const newSettings = { ...settings };
    if (activeSemester === 'Ganjil') newSettings.rangeExtraGanjil = { from: startDate, to: endDate };
    else newSettings.rangeExtraGenap = { from: startDate, to: endDate };
    setSettings(newSettings);

    const start = new Date(startDate);
    const end = new Date(endDate);
    let currentDate = new Date(start);
    
    const otherSemesterRecords = extraRecords.filter(r => r.semester !== activeSemester);
    const generated: ExtraRecord[] = DEFAULT_EXTRA_TEMPLATES.map((tpl, index) => {
      if (currentDate.getDay() === 0) currentDate.setDate(currentDate.getDate() + 1);
      if (currentDate > end) currentDate = new Date(start);
      const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      const dayNameStr = dayNames[currentDate.getDay()];
      const tglStr = currentDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      const res = { id: index + 1 + (otherSemesterRecords.length > 0 ? Math.max(...otherSemesterRecords.map(o => o.id)) : 0),
        nama: tpl.nama, nip: tpl.nip, hari: dayNameStr, tgl: tglStr, pukul: tpl.pukul, ekstra: tpl.ekstra, tempat: tpl.tempat, supervisor: supervisorName, semester: activeSemester
      };
      currentDate.setDate(currentDate.getDate() + 1);
      return res;
    });
    setExtraRecords([...otherSemesterRecords, ...generated]);
  };

  const exportPDF = () => {
    const element = document.getElementById('extra-export-content');
    // @ts-ignore
    html2pdf().from(element).save(`Jadwal_Ekstra_${activeSemester}.pdf`);
  };

  const exportWord = () => {
    const content = document.getElementById('extra-export-content')?.innerHTML;
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid black; padding: 5px; font-size: 10pt; text-align: left; }</style></head><body>";
    const footer = "</body></html>";
    const blob = new Blob([header + content + footer], { type: 'application/msword' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Jadwal_Ekstra_${activeSemester}.doc`;
    link.click();
  };

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 no-print bg-slate-50 p-6 rounded-2xl border border-slate-200">
        <div className="space-y-3 w-full md:w-auto">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Supervisi Ekstrakurikuler</h2>
            <p className="text-xs font-bold text-slate-500 uppercase">Jadwal Pembinaan Kegiatan Siswa</p>
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
                <label className="text-[10px] font-black text-slate-500 uppercase">Supervisor</label>
                <input type="text" value={supervisorName} onChange={e => setSupervisorName(e.target.value)} className="w-64 px-4 py-2 border rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Nama Supervisor..." />
             </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200 mr-2">
             <button onClick={() => setSettings({...settings, semester: 'Ganjil'})} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${activeSemester === 'Ganjil' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500'}`}>Ganjil</button>
             <button onClick={() => setSettings({...settings, semester: 'Genap'})} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${activeSemester === 'Genap' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500'}`}>Genap</button>
          </div>
          <button onClick={handleGenerateExtra} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-[10px] uppercase shadow-md transition-all hover:bg-indigo-700">Generate</button>
          <button onClick={exportWord} className="px-4 py-2 bg-blue-800 text-white rounded-xl font-black text-[10px] uppercase shadow-md transition-all hover:bg-blue-900">Word</button>
          <button onClick={exportPDF} className="px-4 py-2 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase shadow-md transition-all hover:bg-red-700">PDF</button>
        </div>
      </div>

      <section id="extra-export-content" className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden p-8 font-serif">
        <div className="text-center mb-6 border-b-2 border-slate-900 pb-2">
          <h2 className="text-xl font-black uppercase tracking-tight">Jadwal Supervisi Kegiatan Ekstrakurikuler</h2>
          <p className="text-xs font-bold uppercase">Semester {activeSemester} • TP {settings.tahunPelajaran}</p>
        </div>
        <table className="w-full text-xs border-collapse border border-slate-800 text-[10px]">
          <thead className="bg-slate-100">
            <tr className="uppercase font-bold">
              <th className="px-2 py-3 border border-slate-800">No</th>
              <th className="px-4 py-3 border border-slate-800 text-left">Nama Pembina</th>
              <th className="px-4 py-3 border border-slate-800">Hari / Tanggal</th>
              <th className="px-4 py-3 border border-slate-800 text-left">Ekstrakurikuler</th>
              <th className="px-4 py-3 border border-slate-800 text-left">Supervisor</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((d, i) => (
              <tr key={d.id}>
                <td className="px-2 py-2 text-center border border-slate-800">{i + 1}</td>
                <td className="px-4 py-2 border border-slate-800 font-bold uppercase">{d.nama}</td>
                <td className="px-4 py-2 text-center border border-slate-800 font-bold">{d.hari}, {d.tgl}</td>
                <td className="px-4 py-2 italic border border-slate-800 uppercase">{d.ekstra}</td>
                <td className="px-4 py-2 font-bold border border-slate-800 uppercase">{d.supervisor}</td>
              </tr>
            ))}
            {filteredData.length === 0 && (
               <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400 italic">Belum ada jadwal ekstra. Atur tanggal dan klik "Generate".</td></tr>
            )}
          </tbody>
        </table>

        {/* SIGNATURE BLOCK */}
        <div className="mt-12 flex justify-between items-start text-xs font-bold uppercase tracking-tight px-4">
          <div className="text-center w-64 invisible">
             <p className="mb-20 uppercase">Waka Kesiswaan</p>
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
      </section>
    </div>
  );
};

export default ScheduleExtraView;
