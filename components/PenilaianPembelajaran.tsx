
import React, { useState, useMemo, useEffect } from 'react';
import { AppSettings, TeacherRecord, InstrumentResult } from '../types';

const ITEMS = [ 
  "Tersedianya Buku Daftar Nilai yang lengkap.", 
  "Melaksanakan Penilaian Formatif (Awal dan Proses).", 
  "Melaksanakan Penilaian Sumatif (Akhir Lingkup Materi).",
  "Tersedianya kisi-kisi soal untuk setiap asesmen.",
  "Memberikan Penugasan Terstruktur (Tugas Mandiri/Kelompok).", 
  "Melaksanakan penilaian aspek Sikap/Profil Pelajar Pancasila.", 
  "Melaksanakan penilaian aspek Keterampilan (Projek/Produk).",
  "Melaksanakan Analisis Hasil Belajar setelah penilaian.", 
  "Melaksanakan Program Remedial bagi siswa belum kompeten.", 
  "Melaksanakan Program Pengayaan bagi siswa yang sudah kompeten.",
  "Dokumentasi Portofolio hasil belajar siswa tertata rapi.",
  "Memberikan umpan balik yang membangun pada hasil kerja siswa."
];

const formatIndonesianDate = (dateStr?: string) => {
  if (!dateStr) return '..............................';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

const getAutoFeedback = (percentage: number) => {
  if (percentage >= 91) return { catatan: "Sistem penilaian sangat komprehensif, mencakup seluruh aspek (kognitif, afektif, psikomotorik). Analisis hasil belajar dan tindak lanjut remedial/pengayaan terdokumentasi dengan sangat rapi.", tindakLanjut: "Pertahankan konsistensi dan kembangkan bank soal berbasis literasi-numerasi (HOTS)." };
  if (percentage >= 81) return { catatan: "Pelaksanaan penilaian sudah baik dan sesuai prosedur. Buku nilai dan analisis hasil belajar tersedia.", tindakLanjut: "Tingkatkan variasi umpan balik (feedback) tertulis pada hasil karya siswa agar lebih bermakna." };
  if (percentage >= 71) return { catatan: "Cukup baik, penilaian formatif dan sumatif terlaksana. Namun, administrasi remedial dan pengayaan perlu ditertibkan.", tindakLanjut: "Lengkapi dokumen analisis butir soal dan program perbaikan bagi siswa yang belum tuntas." };
  return { catatan: "Administrasi penilaian masih kurang lengkap. Kisi-kisi dan analisis hasil belajar belum tersedia secara memadai.", tindakLanjut: "Wajib mengikuti pendampingan penyusunan instrumen asesmen Kurikulum Merdeka." };
};

interface Props {
  settings: AppSettings; setSettings: (s: AppSettings) => void; records: TeacherRecord[]; instrumentResults: Record<string, InstrumentResult>; onSave: (teacherId: number, type: string, semester: string, data: InstrumentResult) => void;
}

const PenilaianPembelajaran: React.FC<Props> = ({ settings, setSettings, records, instrumentResults, onSave }) => {
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | ''>('');
  const [scores, setScores] = useState<Record<number, number>>({});
  const [catatan, setCatatan] = useState('');
  const [tindakLanjut, setTindakLanjut] = useState('');

  const selectedTeacher = useMemo(() => records.find(t => t.id === selectedTeacherId), [selectedTeacherId, records]);

  const stats = useMemo(() => {
    const scoreValues = Object.values(scores).filter(v => typeof v === 'number') as number[];
    const total = scoreValues.reduce((sum, s) => sum + s, 0);
    const maxScore = ITEMS.length * 4; 
    const perc = Math.round((total / maxScore) * 100);
    let kriteria = perc >= 91 ? 'Sangat Baik' : perc >= 81 ? 'Baik' : perc >= 71 ? 'Cukup' : 'Kurang';
    return { total, perc, kriteria };
  }, [scores]);

  useEffect(() => {
    if (Object.keys(scores).length > 0) {
      const feedback = getAutoFeedback(stats.perc);
      setCatatan(feedback.catatan); 
      setTindakLanjut(feedback.tindakLanjut);
    }
  }, [stats.perc]);

  useEffect(() => {
    if (selectedTeacherId !== '') {
      const key = `${selectedTeacherId}-penilaian-${settings.semester}`;
      const saved = instrumentResults[key];
      if (saved) {
        setScores(saved.scores as any || {}); 
        if (saved.catatan) setCatatan(saved.catatan);
        if (saved.tindakLanjut) setTindakLanjut(saved.tindakLanjut);
      } else {
        setScores({}); setCatatan(''); setTindakLanjut('');
      }
    }
  }, [selectedTeacherId, settings.semester, instrumentResults]);

  const handleScore = (idx: number, val: number) => setScores(p => ({ ...p, [idx]: val }));

  const exportPDF = () => {
    const element = document.getElementById('penilaian-export-area');
    // @ts-ignore
    html2pdf().from(element).save(`Penil_Pemb_${selectedTeacher?.namaGuru || 'Guru'}_${settings.semester}.pdf`);
  };

  const exportWord = () => {
    const content = document.getElementById('penilaian-export-area')?.innerHTML;
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid black; padding: 5px; font-size: 10pt; }</style></head><body>";
    const footer = "</body></html>";
    const blob = new Blob([header + content + footer], { type: 'application/msword' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Penilaian_Pembelajaran_${selectedTeacher?.namaGuru || 'Guru'}_${settings.semester}.doc`;
    link.click();
  };

  const supervisorName = selectedTeacher?.pewawancara || settings.namaKepalaSekolah;
  const supervisorNIP = records.find(r => r.namaGuru === supervisorName)?.nip || (supervisorName === settings.namaKepalaSekolah ? settings.nipKepalaSekolah : '....................');

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center no-print bg-white p-4 rounded-2xl shadow-sm border border-slate-100 gap-4">
        <div className="flex items-center gap-3">
          <select value={selectedTeacherId} onChange={(e) => setSelectedTeacherId(Number(e.target.value))} className="px-4 py-2 border rounded-xl font-bold text-blue-600 outline-none uppercase text-xs">
            <option value="">-- PILIH GURU --</option>
            {records.map(t => <option key={t.id} value={t.id}>{t.namaGuru}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={exportPDF} className="px-4 py-2 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg">PDF</button>
          <button onClick={exportWord} className="px-4 py-2 bg-indigo-800 text-white rounded-xl font-black text-[10px] uppercase shadow-lg">Word</button>
          <button onClick={() => onSave(selectedTeacherId as number, 'penilaian', settings.semester, { scores, remarks: {}, catatan, tindakLanjut })} disabled={!selectedTeacherId} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg">Simpan</button>
        </div>
      </div>

      <div id="penilaian-export-area" className="bg-white shadow-xl border border-slate-300 p-12 max-w-5xl mx-auto text-gray-900 font-serif">
        <div className="text-center mb-10 border-b-4 border-double border-slate-900 pb-4 uppercase">
          <h1 className="text-xl font-black leading-none tracking-widest">INSTRUMEN EVALUASI PENILAIAN</h1>
          <h2 className="text-lg font-bold mt-1">SISTEM PENILAIAN HASIL BELAJAR (GURU)</h2>
          <p className="text-[11px] font-bold mt-1 italic tracking-widest opacity-75">{settings.namaSekolah} • Semester {settings.semester} • TP {settings.tahunPelajaran}</p>
        </div>

        <div className="grid grid-cols-1 gap-y-1 text-sm font-bold mb-8">
           <div className="flex items-start"><span className="w-40 uppercase">Nama Guru</span><span className="mr-4">:</span><span className="uppercase text-blue-800">{selectedTeacher?.namaGuru || '...................'}</span></div>
           <div className="flex items-start"><span className="w-40 uppercase">Mata Pelajaran</span><span className="mr-4">:</span><span className="italic">{selectedTeacher?.mataPelajaran || '...................'}</span></div>
           <div className="flex items-start"><span className="w-40 uppercase">Semester</span><span className="mr-4">:</span><span>{settings.semester}</span></div>
        </div>

        <table className="w-full border-collapse border-2 border-slate-900 text-[11px]">
          <thead>
            <tr className="bg-slate-100 text-center font-black uppercase">
              <th className="border-2 border-slate-900 p-3 w-12">No</th>
              <th className="border-2 border-slate-900 p-3 text-left">Aspek Penilaian Pembelajaran</th>
              <th className="border-2 border-slate-900 p-1 w-48">Kualitas Skor (0-4)</th>
              <th className="border-2 border-slate-900 p-3 w-32">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {ITEMS.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="border-2 border-slate-900 p-2 text-center font-bold text-slate-500">{idx + 1}.</td>
                <td className="border-2 border-slate-900 p-2 font-bold text-slate-800">{item}</td>
                <td className="border-2 border-slate-900 p-1">
                   <div className="flex justify-center gap-1 no-print">
                      {[0,1,2,3,4].map(v => (
                         <button key={v} onClick={() => handleScore(idx, v)} className={`w-7 h-7 rounded border font-bold text-[10px] transition-all ${scores[idx] === v ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400'}`}>{v}</button>
                      ))}
                   </div>
                   <div className="hidden print:block text-center font-black text-lg">{scores[idx] !== undefined ? scores[idx] : '-'}</div>
                </td>
                <td className="border-2 border-slate-900 p-2 text-center italic text-slate-500 text-[10px]">
                   {scores[idx] >= 4 ? "Sangat Baik" : scores[idx] >= 3 ? "Baik" : scores[idx] >= 2 ? "Cukup" : scores[idx] >= 1 ? "Kurang" : "Tidak Ada"}
                </td>
              </tr>
            ))}
            <tr className="bg-slate-900 text-white font-black">
              <td colSpan={2} className="border-2 border-slate-800 p-3 text-right uppercase italic tracking-widest text-xs">Skor Rata-rata Kinerja (%)</td>
              <td colSpan={3} className="border-2 border-slate-800 p-2 text-center text-xl bg-blue-700">{stats.perc}%</td>
              <td className="border-2 border-slate-800 p-2 text-center uppercase tracking-tighter text-[10px]">{stats.kriteria}</td>
            </tr>
          </tbody>
        </table>

        <div className="mt-8 space-y-4">
           <div className="border-b border-slate-400 pb-1">
              <h3 className="text-sm font-black uppercase tracking-tight text-blue-800">Catatan/Analisis Temuan:</h3>
              <textarea value={catatan} onChange={e => setCatatan(e.target.value)} className="w-full bg-transparent border-0 italic text-sm no-print h-16 outline-none resize-none" placeholder="Otomatis terisi..." />
              <div className="hidden print:block text-sm italic min-h-[40px] whitespace-pre-wrap">{catatan || '................................................'}</div>
           </div>
           <div className="border-b border-slate-400 pb-1">
              <h3 className="text-sm font-black uppercase tracking-tight text-emerald-800">Saran Tindak Lanjut:</h3>
              <textarea value={tindakLanjut} onChange={e => setTindakLanjut(e.target.value)} className="w-full bg-transparent border-0 italic text-sm no-print h-16 outline-none resize-none" placeholder="Otomatis terisi..." />
              <div className="hidden print:block text-sm italic min-h-[40px] whitespace-pre-wrap">{tindakLanjut || '................................................'}</div>
           </div>
        </div>

        {/* Tanda Tangan: 3 Kolom (Principal, Supervisor, Teacher) */}
        <div className="mt-16 grid grid-cols-3 gap-4 text-xs font-bold uppercase tracking-tight text-center px-4 break-inside-avoid">
          <div className="flex flex-col justify-between h-32">
             <p className="uppercase">
                Mengetahui,<br/>
                Kepala Sekolah
             </p>
             <div>
               <p className="font-black underline text-sm uppercase">{settings.namaKepalaSekolah}</p>
               <p className="text-[10px] font-mono tracking-tighter uppercase">NIP. {settings.nipKepalaSekolah}</p>
             </div>
          </div>
          <div className="flex flex-col justify-between h-32">
            {supervisorName !== settings.namaKepalaSekolah ? (
              <>
                <p className="uppercase">Supervisor</p>
                <div>
                  <p className="font-black underline text-sm uppercase">{supervisorName}</p>
                  <p className="text-[10px] font-mono tracking-tighter uppercase">NIP. {supervisorNIP}</p>
                </div>
              </>
            ) : <div></div>}
          </div>
          <div className="flex flex-col justify-between h-32">
             <p className="uppercase">
                Mojokerto, {formatIndonesianDate(selectedTeacher?.tanggalPemb)}<br/>
                Guru yang di Supervisi
             </p>
             <div>
               <p className="font-black underline text-sm uppercase">{selectedTeacher?.namaGuru || '....................'}</p>
               <p className="text-[10px] font-mono tracking-tighter uppercase">NIP. {selectedTeacher?.nip || '....................'}</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PenilaianPembelajaran;
