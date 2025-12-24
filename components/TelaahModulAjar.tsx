
import React, { useState, useMemo, useEffect } from 'react';
import { AppSettings, TeacherRecord, InstrumentResult } from '../types';

interface ModulItem { id: number; label: string; subs?: string[]; }
interface ModulGroup { category: string; title: string; legend?: { 0: string; 1: string; 2: string }; items: ModulItem[]; }

const formatIndonesianDate = (dateStr?: string) => {
  if (!dateStr) return '..............................';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

const getAutoFeedback = (percentage: number) => {
  if (percentage >= 91) return { catatan: "Modul ajar disusun dengan sangat lengkap, kreatif, and berpusat pada siswa.", tindakLanjut: "Implementasikan rencana pembelajaran ini di kelas and lakukan refleksi berkelanjutan." };
  if (percentage >= 81) return { catatan: "Komponen inti modul ajar sudah terpenuhi dengan baik. Pertanyaan pemantik sudah merangsang minat siswa.", tindakLanjut: "Lengkapi bagian lampiran dengan glosarium and daftar pustaka yang lebih variatif." };
  if (percentage >= 71) return { catatan: "Struktur modul ajar sudah ada, namun bagian langkah-langkah pembelajaran perlu diuraikan lebih mendetail.", tindakLanjut: "Fokus pada pengembangan asesmen formatif yang lebih terintegrasi." };
  return { catatan: "Modul ajar belum mencerminkan karakteristik Kurikulum Merdeka.", tindakLanjut: "Ikuti pembinaan penyusunan Modul Ajar oleh tim kurikulum." };
};

const MODUL_GROUPS: ModulGroup[] = [
  { category: "A", title: "Identitas Mata Pelajaran", legend: { 0: "Tidak Ada", 1: "Kurang Lengkap", 2: "Sudah Lengkap" }, items: [{ id: 1, label: "Terdapat: Nama penyusun, institusi, tahun, kelas, alokasi waktu" }] },
  { category: "B", title: "Kompetensi & PPP", items: [ { id: 2, label: "Kompetensi Awal" }, { id: 3, label: "Profil Pelajar Pancasila" } ] },
  { category: "C", title: "Sarana dan Prasarana", items: [ { id: 4, label: "Kesesuaian penggunaan fasilitas penunjang kegiatan" }, { id: 5, label: "Kesesuaian materi ajar" } ] },
  { category: "E", title: "Model Pembelajaran", items: [ { id: 6, label: "Model pembelajaran tatap muka/blended" } ] },
  { category: "F", title: "Komponen Pembelajaran", items: [ { id: 8, label: "Ketepatan Tujuan Pembelajaran" }, { id: 9, label: "Pemahaman Bermakna" }, { id: 10, label: "Pertanyaan Pemantik" }, { id: 11, label: "Persiapan Pembelajaran" } ] },
  { category: "G", title: "Skenario Pembelajaran", items: [ { id: 12, label: "Kegiatan pendahuluan: Motivasi and Apersepsi" }, { id: 13, label: "Kegiatan inti: pengamatan, eksplorasi, sintesa" }, { id: 14, label: "Kegiatan penutup: rangkuman, refleksi" } ] },
  { category: "H", title: "Rancangan Penilaian", items: [ { id: 15, label: "Kesesuaian instrumen dengan tujuan" }, { id: 16, label: "Penilaian Sikap, Pengetahuan, Keterampilan" } ] },
  { category: "I", title: "Remedial & Pengayaan", items: [ { id: 19, label: "Kegiatan remedial yang sesuai karakteristik siswa" } ] },
  { category: "K", title: "Lampiran", items: [ { id: 21, label: "LKPD, Bahan Bacaan, Glosarium, Daftar Pustaka" } ] }
];

interface Props {
  settings: AppSettings; setSettings: (s: AppSettings) => void; records: TeacherRecord[]; instrumentResults: Record<string, InstrumentResult>; onSave: (teacherId: number, type: string, semester: string, data: InstrumentResult) => void;
}

const TelaahModulAjar: React.FC<Props> = ({ settings, setSettings, records, instrumentResults, onSave }) => {
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | ''>('');
  const [scores, setScores] = useState<Record<number, number>>({});
  const [remarks, setRemarks] = useState<Record<number, string>>({});
  const [catatan, setCatatan] = useState('');
  const [tindakLanjut, setTindakLanjut] = useState('');

  const selectedTeacher = useMemo(() => records.find(t => t.id === selectedTeacherId), [selectedTeacherId, records]);

  const stats = useMemo(() => {
    const allItems = MODUL_GROUPS.flatMap(g => g.items);
    const totalItems = allItems.length;
    const maxScore = totalItems * 2; 
    const totalScore = allItems.reduce((sum, item) => sum + (scores[item.id] || 0), 0);
    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    let kriteria = percentage >= 91 ? 'Sangat Baik' : percentage >= 81 ? 'Baik' : percentage >= 71 ? 'Cukup' : 'Kurang';
    return { totalScore, maxScore, percentage, kriteria };
  }, [scores]);

  useEffect(() => {
    if (Object.keys(scores).length > 0) {
      const feedback = getAutoFeedback(stats.percentage);
      setCatatan(feedback.catatan); setTindakLanjut(feedback.tindakLanjut);
    }
  }, [stats.percentage]);

  useEffect(() => {
    if (selectedTeacherId !== '') {
      const key = `${selectedTeacherId}-modul-${settings.semester}`;
      const saved = instrumentResults[key];
      if (saved) {
        setScores(saved.scores as any || {}); setRemarks(saved.remarks || {}); setCatatan(saved.catatan || ''); setTindakLanjut(saved.tindakLanjut || '');
      } else {
        setScores({}); setRemarks({}); setCatatan(''); setTindakLanjut('');
      }
    }
  }, [selectedTeacherId, settings.semester, instrumentResults]);

  const handleScoreChange = (id: number, val: number) => { 
    setScores(prev => ({ ...prev, [id]: val })); 
    setRemarks(prev => ({ ...prev, [id]: val === 2 ? "Lengkap" : val === 1 ? "Revisi" : "Tidak Ada" }));
  };

  const handleSave = () => {
    if (selectedTeacherId === '') return alert('Pilih guru terlebih dahulu');
    onSave(selectedTeacherId, 'modul', settings.semester, { scores, remarks, catatan, tindakLanjut });
    alert('Hasil telaah modul ajar berhasil disimpan!');
  };

  const exportPDF = () => {
    const element = document.getElementById('modul-export-area');
    // @ts-ignore
    html2pdf().from(element).save(`Telaah_Modul_${selectedTeacher?.namaGuru || 'Guru'}_${settings.semester}.pdf`);
  };

  const exportWord = () => {
    const content = document.getElementById('modul-export-area')?.innerHTML;
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid black; padding: 5px; font-size: 10pt; }</style></head><body>";
    const footer = "</body></html>";
    const blob = new Blob([header + content + footer], { type: 'application/msword' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Telaah_Modul_${selectedTeacher?.namaGuru || 'Guru'}_${settings.semester}.doc`;
    link.click();
  };

  const supervisorName = selectedTeacher?.pewawancara || settings.namaKepalaSekolah;
  const supervisorNIP = records.find(r => r.namaGuru === supervisorName)?.nip || (supervisorName === settings.namaKepalaSekolah ? settings.nipKepalaSekolah : '....................');

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center no-print bg-white p-4 rounded-2xl shadow-sm border border-slate-100 gap-4">
        <div className="flex items-center gap-3">
          <select value={selectedTeacherId} onChange={(e) => setSelectedTeacherId(Number(e.target.value))} className="px-4 py-2 border rounded-xl font-bold text-blue-600 outline-none">
            <option value="">-- Pilih Guru --</option>
            {records.map(t => <option key={t.id} value={t.id}>{t.namaGuru}</option>)}
          </select>
          <div className="flex bg-slate-200 p-1 rounded-xl shadow-inner">
             <button onClick={() => setSettings({...settings, semester: 'Ganjil'})} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold ${settings.semester === 'Ganjil' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>Ganjil</button>
             <button onClick={() => setSettings({...settings, semester: 'Genap'})} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold ${settings.semester === 'Genap' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>Genap</button>
           </div>
        </div>
        <div className="flex gap-2">
          <button onClick={exportPDF} className="px-4 py-2 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase">PDF</button>
          <button onClick={exportWord} className="px-4 py-2 bg-indigo-800 text-white rounded-xl font-black text-[10px] uppercase">Word</button>
          <button onClick={handleSave} disabled={!selectedTeacher} className="px-6 py-2 bg-purple-600 text-white rounded-lg font-black text-[10px] uppercase shadow-lg">Simpan</button>
        </div>
      </div>

      <div id="modul-export-area" className="bg-white shadow-xl border border-slate-300 p-12 max-w-5xl mx-auto text-gray-900 font-serif">
        <div className="text-center mb-8 border-b-4 border-double border-slate-900 pb-2 font-black uppercase">
          <h1 className="leading-none text-lg">Instrumen Supervisi Akademik</h1>
          <h2 className="text-xl tracking-widest mt-1">Telaah Modul Ajar</h2>
        </div>
        <div className="mb-4 text-sm font-bold flex flex-col gap-1">
           <div className="flex"><span className="w-40">Nama Guru</span><span>: {selectedTeacher?.namaGuru || '..........'}</span></div>
           <div className="flex"><span className="w-40">Mata Pelajaran</span><span>: {selectedTeacher?.mataPelajaran || '..........'}</span></div>
           <div className="flex"><span className="w-40">Semester</span><span>: {settings.semester}</span></div>
        </div>

        <table className="w-full border-collapse border-2 border-slate-900 text-[10px]">
          <thead>
            <tr className="bg-slate-100 font-black text-center uppercase">
              <th className="border-2 border-slate-900 p-2 w-10">No</th>
              <th className="border-2 border-slate-900 p-2 text-left">Komponen Modul Ajar</th>
              <th colSpan={3} className="border-2 border-slate-900 p-1">Penilaian</th>
              <th className="border-2 border-slate-900 p-2 w-32">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {MODUL_GROUPS.map((group, gIdx) => (
              <React.Fragment key={gIdx}>
                <tr className="bg-slate-50 font-black"><td className="border-2 border-slate-900 p-2 text-center italic">{group.category}.</td><td colSpan={5} className="border-2 border-slate-900 p-2 uppercase italic">{group.title}</td></tr>
                {group.items.map((item) => (
                  <tr key={item.id}>
                    <td className="border-2 border-slate-900 p-2 text-center font-bold">{item.id}</td><td className="border-2 border-slate-900 p-2">{item.label}</td>
                    {[2, 1, 0].map(val => (
                      <td key={val} className="border-2 border-slate-900 p-1 text-center cursor-pointer no-print font-bold" onClick={() => handleScoreChange(item.id, val)}>
                        <div className={`w-4 h-4 mx-auto border border-slate-900 flex items-center justify-center ${scores[item.id] === val ? 'bg-slate-800 text-white' : 'bg-white'}`}>{scores[item.id] === val && "v"}</div>
                      </td>
                    ))}
                    {[2, 1, 0].map(val => <td key={`p-${val}`} className="border-2 border-slate-900 p-1 text-center hidden print:table-cell font-bold">{scores[item.id] === val ? 'v' : ''}</td>)}
                    <td className="border-2 border-slate-900 p-1 italic text-[9px]">{remarks[item.id]}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
            <tr className="bg-slate-100 font-black">
              <td colSpan={2} className="border-2 border-slate-900 p-2 text-right uppercase">Nilai Akhir</td>
              <td colSpan={3} className="border-2 border-slate-900 p-2 text-center text-blue-700">{stats.percentage}%</td>
              <td className="border-2 border-slate-900 text-center uppercase">{stats.kriteria}</td>
            </tr>
          </tbody>
        </table>

        <div className="mt-8 space-y-4">
           <div className="border-b border-slate-400 pb-1">
              <h3 className="text-sm font-bold uppercase tracking-tighter text-blue-700">Analisis Hasil Telaah :</h3>
              <p className="text-sm italic min-h-[40px]">{catatan || '................................'}</p>
           </div>
           <div className="border-b border-slate-400 pb-1">
              <h3 className="text-sm font-bold uppercase tracking-tighter text-emerald-700">Tindak Lanjut & Saran :</h3>
              <p className="text-sm italic min-h-[40px]">{tindakLanjut || '................................'}</p>
           </div>
        </div>

        {/* Tanda Tangan: 3 Kolom (Principal, Supervisor, Teacher) */}
        <div className="mt-12 grid grid-cols-3 gap-4 text-xs font-bold uppercase tracking-tight text-center px-4 break-inside-avoid">
            <div className="flex flex-col justify-between h-36">
               <p className="uppercase leading-tight">
                 Mengetahui,<br/>
                 Kepala Sekolah
               </p>
               <div>
                 <p className="underline uppercase font-black">{settings.namaKepalaSekolah}</p>
                 <p className="text-[10px] font-mono tracking-tighter mt-1 uppercase">NIP. {settings.nipKepalaSekolah}</p>
               </div>
            </div>
            <div className="flex flex-col justify-between h-36">
              {supervisorName !== settings.namaKepalaSekolah ? (
                <>
                   <p className="leading-tight uppercase">Supervisor</p>
                   <div>
                     <p className="underline uppercase font-black">{supervisorName}</p>
                     <p className="text-[10px] font-mono tracking-tighter mt-1 uppercase">NIP. {supervisorNIP}</p>
                   </div>
                </>
              ) : <div></div>}
            </div>
            <div className="flex flex-col justify-between h-36">
               <p className="uppercase leading-tight">
                 Mojokerto, {formatIndonesianDate(selectedTeacher?.tanggalAdm)}<br/>
                 Guru yang di Supervisi
               </p>
               <div>
                 <p className="underline uppercase font-black">{selectedTeacher?.namaGuru || '....................'}</p>
                 <p className="text-[10px] font-mono tracking-tighter mt-1 uppercase">NIP. {selectedTeacher?.nip || '....................'}</p>
               </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TelaahModulAjar;
