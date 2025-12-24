
import React, { useMemo } from 'react';
import { TeacherRecord, AppSettings } from '../types';

interface Props {
  title: string;
  type: string;
  scoreKey: keyof TeacherRecord;
  maxScore: number;
  records: TeacherRecord[];
  settings: AppSettings;
  onUpdate: (records: TeacherRecord[]) => void;
  onRefresh: () => void;
  setSettings: (settings: AppSettings) => void;
}

const getAutoResults = (score: number) => {
  if (score >= 91) return {
    c: "Sangat Baik, dokumen lengkap dan sesuai standar.",
    tl: "Pertahankan konsistensi kinerja profesional.",
    r: "Berlanjut secara mandiri di semester depan.",
    s: "Dijadikan model praktik baik bagi guru lain."
  };
  if (score >= 81) return {
    c: "Baik, komponen inti terpenuhi namun perlu variasi media.",
    tl: "Workshop internal pembuatan media inovatif.",
    r: "Dilaksanakan 1 kali dalam bulan berjalan.",
    s: "Gunakan aplikasi interaktif dalam setiap sesi."
  };
  if (score >= 71) return {
    c: "Cukup, instrumen penilaian kurang beragam.",
    tl: "Diskusi kolaboratif di MGMP sekolah.",
    r: "Dalam proses perbaikan dokumen.",
    s: "Lengkapi perangkat modul ajar dengan rubrik."
  };
  return {
    c: "Kurang, banyak administrasi yang belum tersedia.",
    tl: "Supervisi klinis intensif oleh supervisor.",
    r: "Revisi total dokumen administrasi.",
    s: "Ikuti diklat pedagogik dasar secara daring/luring."
  };
};

const FollowUpResultsView: React.FC<Props> = ({ title, scoreKey, records, settings, onUpdate, setSettings }) => {
  const activeSemester = settings.semester;
  
  const filteredRecords = useMemo(() => {
    return records.filter(r => r.semester === activeSemester).map(r => {
      const score = Number(r[scoreKey]) || 0;
      const auto = getAutoResults(score);
      return { ...r, catatan: auto.c, tindakLanjut: auto.tl, realisasi: auto.r, saran: auto.s };
    });
  }, [records, activeSemester, scoreKey]);

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex justify-between items-center no-print">
        <h2 className="text-xl font-bold uppercase tracking-tight text-slate-800">{title}</h2>
        <div className="flex bg-slate-200 p-1 rounded-xl">
           <button onClick={() => setSettings({...settings, semester: 'Ganjil'})} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${activeSemester === 'Ganjil' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>Ganjil</button>
           <button onClick={() => setSettings({...settings, semester: 'Genap'})} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${activeSemester === 'Genap' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>Genap</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden p-8">
        <div className="text-center border-b-2 border-slate-900 mb-6 pb-2">
           <h1 className="text-lg font-bold uppercase">Rekapitulasi Tindak Lanjut Hasil Supervisi</h1>
           <p className="text-xs font-bold opacity-75 uppercase">Tahun Pelajaran {settings.tahunPelajaran} • Semester {activeSemester}</p>
        </div>
        <table className="w-full border-collapse text-[9px] border border-slate-800">
          <thead>
            <tr className="bg-slate-900 text-white uppercase text-center">
              <th className="border border-slate-800 p-2 w-8">No</th>
              <th className="border border-slate-800 p-2 text-left">Nama Guru</th>
              <th className="border border-slate-800 p-2 w-10">Skor</th>
              <th className="border border-slate-800 p-2 text-left">Analisis Hasil</th>
              <th className="border border-slate-800 p-2 text-left">Tindak Lanjut</th>
              <th className="border border-slate-800 p-2 text-left">Realisasi</th>
              <th className="border border-slate-800 p-2 text-left">Saran</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((r, i) => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="border border-slate-800 p-2 text-center font-bold">{i + 1}</td>
                <td className="border border-slate-800 p-2 font-bold uppercase">{r.namaGuru}</td>
                <td className="border border-slate-800 p-2 text-center font-black text-blue-600 bg-blue-50/20">{Number(r[scoreKey]) || '-'}</td>
                <td className="border border-slate-800 p-2 italic">{r.catatan}</td>
                <td className="border border-slate-800 p-2 italic font-medium">{r.tindakLanjut}</td>
                <td className="border border-slate-800 p-2 italic">{r.realisasi}</td>
                <td className="border border-slate-800 p-2 italic text-blue-800">{r.saran}</td>
              </tr>
            ))}
            {filteredRecords.length === 0 && (
              <tr><td colSpan={7} className="p-10 text-center italic text-slate-400 border border-slate-800">Data hasil supervisi belum tersedia.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FollowUpResultsView;
