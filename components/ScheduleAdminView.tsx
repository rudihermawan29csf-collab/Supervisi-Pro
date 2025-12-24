
import React, { useState, useMemo, useEffect } from 'react';
import { AppSettings, AdminRecord, TeacherRecord } from '../types';
import { DATA_PTT } from '../constants';

interface Props {
  settings: AppSettings;
  setSettings: (s: AppSettings) => void;
  adminRecords: AdminRecord[];
  setAdminRecords: (recs: AdminRecord[]) => void;
  teacherRecords: TeacherRecord[];
}

const DEFAULT_ADMIN_TEMPLATES = [
  { nama: "Imam Safi'i", nip: '-', kegiatan: 'Administrasi Sekolah', pukul: '07.30 - 08.30', tempat: 'Kantor Tata Usaha' },
  { nama: "Imam Safi'i", nip: '-', kegiatan: 'Administrasi Kesiswaan', pukul: '08.30 - 09.30', tempat: 'Ruang OSIS' },
  { nama: 'Rayi Putri Lestari, S.Pd.', nip: '-', kegiatan: 'Administrasi Ketenagaan', pukul: '07.30 - 08.30', tempat: 'Kantor Tata Usaha' },
  { nama: 'Mansyur Rohmad', nip: '-', kegiatan: 'Administrasi Perlengkapan / sarpras', pukul: '08.30 - 09.30', tempat: 'Ruang Guru' },
  { nama: 'Mansyur Rohmad', nip: '-', kegiatan: 'Laboratorium Komputer', pukul: '10.00 - 11.00', tempat: 'Ruang Lab. Komputer' },
  { nama: 'Mochamad Ansori', nip: '-', kegiatan: 'Administrasi Perpustakaan', pukul: '07.30 - 08.30', tempat: 'Ruang Perpustakaan' },
  { nama: 'Mansyur Rohmad', nip: '-', kegiatan: 'Laboratorium IPA', pukul: '08.30 - 09.30', tempat: 'Ruang Lab. IPA' },
];

const ScheduleAdminView: React.FC<Props> = ({ settings, setSettings, adminRecords, setAdminRecords, teacherRecords }) => {
  const activeSemester = settings.semester;
  const filteredData = useMemo(() => adminRecords.filter(r => r.semester === activeSemester), [adminRecords, activeSemester]);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [supervisorName, setSupervisorName] = useState(settings.namaKepalaSekolah);

  useEffect(() => {
    const range = activeSemester === 'Ganjil' ? settings.rangeTendikGanjil : settings.rangeTendikGenap;
    if (range) {
      setStartDate(range.from);
      setEndDate(range.to);
    }
    setSupervisorName(settings.namaKepalaSekolah);
  }, [settings, activeSemester]);

  // Selection candidate names
  const candidateNames = useMemo(() => {
    const pttNames = DATA_PTT.map(r => ({ name: r.nama, nip: r.nip || '-' }));
    const teachersHoldingExtra = teacherRecords
      .filter(t => adminRecords.some(ar => ar.nama === t.namaGuru))
      .map(t => ({ name: t.namaGuru, nip: t.nip || '-' }));
    
    const combined = [...pttNames, ...teachersHoldingExtra];
    const uniqueMap = new Map();
    combined.forEach(item => {
      if (!uniqueMap.has(item.name)) {
        uniqueMap.set(item.name, item.nip);
      }
    });
    
    return Array.from(uniqueMap.entries()).map(([name, nip]) => ({ name, nip })).sort((a, b) => a.name.localeCompare(b.name));
  }, [teacherRecords, adminRecords]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Omit<AdminRecord, 'id' | 'semester'>>({
    nama: '',
    nip: '',
    hari: '',
    tgl: '',
    pukul: '',
    kegiatan: '',
    tempat: '',
    supervisor: settings.namaKepalaSekolah
  });

  const handleOpenModal = (record?: AdminRecord) => {
    if (record) {
      setEditingId(record.id);
      setFormData({
        nama: record.nama,
        nip: record.nip,
        hari: record.hari,
        tgl: record.tgl,
        pukul: record.pukul,
        kegiatan: record.kegiatan,
        tempat: record.tempat,
        supervisor: record.supervisor
      });
    } else {
      setEditingId(null);
      setFormData({
        nama: '',
        nip: '',
        hari: '',
        tgl: '',
        pukul: '',
        kegiatan: '',
        tempat: '',
        supervisor: supervisorName
      });
    }
    setIsModalOpen(true);
  };

  const handleNameChange = (name: string) => {
    const selected = candidateNames.find(c => c.name === name);
    setFormData({
      ...formData,
      nama: name,
      nip: selected ? selected.nip : '-'
    });
  };

  const handleGenerateAdmin = () => {
    if (!startDate || !endDate) { alert('Harap isi tanggal mulai dan selesai!'); return; }
    
    const newSettings = { ...settings };
    if (activeSemester === 'Ganjil') newSettings.rangeTendikGanjil = { from: startDate, to: endDate };
    else newSettings.rangeTendikGenap = { from: startDate, to: endDate };
    setSettings(newSettings);

    const start = new Date(startDate);
    const end = new Date(endDate);
    let currentDate = new Date(start);
    
    const otherSemesterRecords = adminRecords.filter(r => r.semester !== activeSemester);
    const generated: AdminRecord[] = DEFAULT_ADMIN_TEMPLATES.map((tpl, index) => {
      if (currentDate.getDay() === 0) currentDate.setDate(currentDate.getDate() + 1);
      if (currentDate > end) currentDate = new Date(start);
      
      const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      const dayNameStr = dayNames[currentDate.getDay()];
      const tglStr = currentDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      
      const res = {
        id: index + 1 + (otherSemesterRecords.length > 0 ? Math.max(...otherSemesterRecords.map(o => o.id)) : 0),
        nama: tpl.nama,
        nip: tpl.nip,
        hari: dayNameStr,
        tgl: tglStr,
        pukul: tpl.pukul,
        kegiatan: tpl.kegiatan,
        tempat: tpl.tempat,
        supervisor: supervisorName, // Use the input supervisor name
        semester: activeSemester
      };
      
      if (index % 2 === 1) currentDate.setDate(currentDate.getDate() + 1); // Group 2 tasks per day
      return res;
    });

    setAdminRecords([...otherSemesterRecords, ...generated]);
    alert(`Berhasil generate ${generated.length} jadwal supervisi tendik!`);
  };

  const handleSaveRecord = () => {
    if (editingId !== null) {
      setAdminRecords(adminRecords.map(r => r.id === editingId ? { ...formData, id: r.id, semester: r.semester } : r));
    } else {
      const nextId = adminRecords.length > 0 ? Math.max(...adminRecords.map(r => r.id)) + 1 : 1;
      setAdminRecords([...adminRecords, { ...formData, id: nextId, semester: activeSemester }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus jadwal tendik ini?')) {
      setAdminRecords(adminRecords.filter(r => r.id !== id));
    }
  };

  const exportPDF = () => {
    const element = document.getElementById('tendik-export-content');
    const opt = {
      margin: 10,
      filename: `Jadwal_Tendik_${activeSemester}.pdf`,
      jsPDF: { orientation: 'landscape' }
    };
    // @ts-ignore
    html2pdf().set(opt).from(element).save();
  };

  const exportWord = () => {
    const content = document.getElementById('tendik-export-content')?.innerHTML;
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid black; padding: 5px; font-size: 10pt; text-align: left; }</style></head><body>";
    const footer = "</body></html>";
    const blob = new Blob([header + content + footer], { type: 'application/msword' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Jadwal_Tendik_${activeSemester}.doc`;
    link.click();
  };

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 no-print bg-slate-50 p-6 rounded-2xl border border-slate-200">
        <div className="space-y-3 w-full md:w-auto">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Supervisi Tendik</h2>
            <p className="text-xs font-bold text-slate-500 uppercase">Manajemen Jadwal Supervisi Tenaga Kependidikan</p>
          </div>
          <div className="flex gap-4">
             <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase">Rentang Tanggal</label>
                <div className="flex items-center gap-2">
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="px-3 py-2 border rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
                    <span className="font-bold text-slate-400">-</span>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="px-3 py-2 border rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase">Supervisor</label>
                <input type="text" value={supervisorName} onChange={e => setSupervisorName(e.target.value)} className="w-64 px-4 py-2 border rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Nama Supervisor..." />
             </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200 mr-2">
             <button onClick={() => setSettings({...settings, semester: 'Ganjil'})} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${activeSemester === 'Ganjil' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500'}`}>Ganjil</button>
             <button onClick={() => setSettings({...settings, semester: 'Genap'})} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${activeSemester === 'Genap' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500'}`}>Genap</button>
          </div>
          <button onClick={handleGenerateAdmin} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-[10px] shadow-md transition-all hover:bg-blue-700">Generate Jadwal</button>
          <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-[10px] shadow-md transition-all hover:bg-emerald-700">+ Tambah</button>
          <button onClick={exportWord} className="px-3 py-2 bg-blue-800 text-white rounded-xl font-bold text-[10px] shadow-md transition-all hover:bg-blue-900">Word</button>
          <button onClick={exportPDF} className="px-3 py-2 bg-red-600 text-white rounded-xl font-bold text-[10px] shadow-md transition-all hover:bg-red-700">PDF</button>
        </div>
      </div>

      <section id="tendik-export-content" className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden p-8 font-serif">
        <div className="text-center mb-8 border-b-2 border-slate-900 pb-2">
          <h2 className="text-xl font-bold uppercase">Jadwal Supervisi Administrasi Tendik</h2>
          <p className="text-sm font-medium mt-1 uppercase">TAHUN PELAJARAN {settings.tahunPelajaran} • SEMESTER {activeSemester}</p>
        </div>
        <div className="overflow-x-auto" id="tendik-table-content">
          <table id="tendik-table-content-real" className="w-full text-xs border border-slate-800 border-collapse">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="px-4 py-4 border border-slate-700">No</th>
                <th className="px-6 py-4 border border-slate-700 text-left">Nama Pembina / Petugas</th>
                <th className="px-4 py-4 border border-slate-700">Hari / Tanggal</th>
                <th className="px-4 py-4 border border-slate-700">Pukul</th>
                <th className="px-6 py-4 border border-slate-700 text-left">Kegiatan</th>
                <th className="px-4 py-4 border border-slate-700">Tempat</th>
                <th className="px-4 py-4 border border-slate-700 text-left">Supervisor</th>
                <th className="px-4 py-4 border border-slate-700 text-center no-print">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-[11px]">
              {filteredData.length > 0 ? filteredData.map((d, i) => (
                <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-4 text-center font-bold border border-slate-100">{i + 1}</td>
                  <td className="px-6 py-4 border border-slate-100">
                    <div className="font-bold text-slate-800 uppercase">{d.nama}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">NIP. {d.nip}</div>
                  </td>
                  <td className="px-4 py-4 text-center border border-slate-100">
                    <div className="font-bold text-emerald-600 uppercase">{d.hari}</div>
                    <div className="text-[10px] text-slate-500">{d.tgl}</div>
                  </td>
                  <td className="px-4 py-4 text-center font-bold text-slate-700 border border-slate-100">{d.pukul}</td>
                  <td className="px-6 py-4 font-medium italic text-slate-700 border border-slate-100 uppercase">{d.kegiatan}</td>
                  <td className="px-4 py-4 text-center text-slate-600 border border-slate-100 uppercase">{d.tempat}</td>
                  <td className="px-4 py-4 text-left font-bold text-slate-900 border border-slate-100 uppercase">{d.supervisor}</td>
                  <td className="px-4 py-4 text-center no-print border border-slate-100">
                    <div className="flex justify-center gap-1">
                      <button onClick={() => handleOpenModal(d)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                      </button>
                      <button onClick={() => handleDelete(d.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-400 italic">Belum ada jadwal tendik. Atur tanggal dan klik "Generate Jadwal" untuk mengisi otomatis.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* SIGNATURE BLOCK */}
        <div className="mt-12 flex justify-between items-start text-xs font-bold uppercase tracking-tight px-4">
          <div className="text-center w-64 invisible">
             <p className="mb-20 uppercase">Koordinator TU</p>
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

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-6 py-5 bg-emerald-600 text-white flex justify-between items-center">
              <h3 className="font-bold">{editingId ? 'Edit Jadwal Tendik' : 'Tambah Jadwal Tendik'}</h3>
              <button onClick={() => setIsModalOpen(false)}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">NAMA PETUGAS</label>
                  <select 
                    value={formData.nama} 
                    onChange={e => handleNameChange(e.target.value)} 
                    className="w-full px-4 py-2 bg-slate-50 border rounded-xl outline-none text-xs font-bold transition-all focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- Pilih Staf TU (PTT) --</option>
                    {candidateNames.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div><label className="block text-[10px] font-bold text-slate-400 mb-1">NIP</label><input type="text" value={formData.nip} readOnly className="w-full px-4 py-2 bg-slate-100 border rounded-xl outline-none text-xs text-slate-500 font-mono" /></div>
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 mb-1">HARI</label>
                   <select value={formData.hari} onChange={e => setFormData({...formData, hari: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border rounded-xl text-xs">
                     <option value="">Pilih Hari</option>{['Senin','Selasa','Rabu','Kamis',"Jum'at",'Sabtu'].map(h => <option key={h} value={h}>{h}</option>)}
                   </select>
                </div>
                <div><label className="block text-[10px] font-bold text-slate-400 mb-1">TANGGAL</label><input type="text" value={formData.tgl} onChange={e => setFormData({...formData, tgl: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border rounded-xl text-xs" placeholder="Contoh: 27 Oktober 2025" /></div>
                <div><label className="block text-[10px] font-bold text-slate-400 mb-1">PUKUL</label><input type="text" value={formData.pukul} onChange={e => setFormData({...formData, pukul: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border rounded-xl text-xs" placeholder="Contoh: 07.30 - 08.30" /></div>
                <div className="col-span-2"><label className="block text-[10px] font-bold text-slate-400 mb-1">KEGIATAN</label><input type="text" value={formData.kegiatan} onChange={e => setFormData({...formData, kegiatan: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border rounded-xl text-xs italic" placeholder="Contoh: Administrasi Sekolah" /></div>
                <div><label className="block text-[10px] font-bold text-slate-400 mb-1">TEMPAT</label><input type="text" value={formData.tempat} onChange={e => setFormData({...formData, tempat: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border rounded-xl text-xs" placeholder="Contoh: Kantor TU" /></div>
                <div><label className="block text-[10px] font-bold text-slate-400 mb-1">SUPERVISOR</label><input type="text" value={formData.supervisor} onChange={e => setFormData({...formData, supervisor: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border rounded-xl text-xs font-bold" /></div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-white border rounded-2xl text-xs font-bold text-slate-600">Batal</button>
              <button onClick={handleSaveRecord} className="flex-1 py-3 bg-emerald-600 rounded-2xl text-xs font-bold text-white">Simpan Jadwal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleAdminView;
