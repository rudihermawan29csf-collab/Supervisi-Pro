
import React, { useState, useMemo, useEffect } from 'react';
import { TeacherRecord, AppSettings, ScoreSettings, InstrumentResult } from '../types';

interface Props {
  settings: AppSettings;
  records: TeacherRecord[];
  instrumentResults: Record<string, InstrumentResult>;
  setSettings: (s: AppSettings) => void;
  onSave?: (teacherId: number, type: string, semester: string, data: InstrumentResult) => void;
}

const addWorkDays = (startDateStr: string | undefined, days: number): string => {
  if (!startDateStr) return '................';
  const date = new Date(startDateStr);
  if (isNaN(date.getTime())) return '................';
  
  let added = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() !== 0) { // 0 is Sunday
      added++;
    }
  }
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

const getPredikat = (nilai: number, scoreSettings: ScoreSettings) => {
  if (nilai >= scoreSettings.excellent) return { p: 'A', label: `${scoreSettings.excellent} - 100`, color: 'text-emerald-700', bg: 'bg-emerald-50/30' };
  if (nilai >= scoreSettings.good) return { p: 'B', label: `${scoreSettings.good} - ${scoreSettings.excellent - 1}`, color: 'text-blue-700', bg: 'bg-blue-50/30' };
  if (nilai >= scoreSettings.fair) return { p: 'C', label: `${scoreSettings.fair} - ${scoreSettings.good - 1}`, color: 'text-amber-700', bg: 'bg-amber-50/30' };
  return { p: 'D', label: `< ${scoreSettings.fair}`, color: 'text-red-700', bg: 'bg-red-50/30' };
};

const getAutoProgramText = (nilai: number, scoreSettings: ScoreSettings) => {
  if (nilai >= scoreSettings.excellent) return { ha: "Kinerja unggul, standar kualitas terpenuhi sangat baik.", rtl: "Pertahankan kinerja dan berikan pengimbasan/mentoring sejawat." };
  if (nilai >= scoreSettings.good) return { ha: "Kinerja baik, dokumen lengkap namun media perlu variasi.", rtl: "Workshop internal pembuatan media interaktif digital." };
  if (nilai >= scoreSettings.fair) return { ha: "Kinerja cukup, pemahaman implementasi kurikulum merdeka masih perlu dikuatkan.", rtl: "Supervisi klinis mandiri dan pendampingan oleh guru senior (teman sejawat)." };
  return { ha: "Kinerja kurang, administrasi dan proses belajar belum terarah.", rtl: "Pelatihan intensif khusus penyusunan perangkat ajar dan manajemen kelas." };
};

const ProgramTindakLanjutView: React.FC<Props> = ({ settings, records, instrumentResults, setSettings, onSave }) => {
  const activeSemester = settings.semester;
  const analysisKey = `0-ptl-analysis-${activeSemester}`;

  const [kekuatan, setKekuatan] = useState('');
  const [kelemahan, setKelemahan] = useState('');
  const [rekomendasi, setRekomendasi] = useState('');

  useEffect(() => {
    const saved = instrumentResults[analysisKey];
    if (saved) {
      setKekuatan(saved.catatan || '');
      setKelemahan(saved.kesanUmum || '');
      setRekomendasi(saved.tindakLanjut || '');
    } else {
      setKekuatan('');
      setKelemahan('');
      setRekomendasi('');
    }
  }, [analysisKey, instrumentResults]);

  const data = useMemo(() => {
    return records
      .filter(r => r.semester === activeSemester)
      .map((r, i) => {
        const getScore = (type: string, maxScore: number): number => {
          const key = `${r.id}-${type}-${activeSemester}`;
          const res = instrumentResults[key];
          if (!res || !res.scores) return 0;
          const vals = Object.values(res.scores).filter(v => typeof v === 'number') as number[];
          const sum = vals.reduce((a, b) => a + b, 0);
          return maxScore > 0 ? Math.round((sum / maxScore) * 100) : 0;
        };

        const sAdm = getScore('administrasi', 26);
        const sATP = getScore('atp', 24);
        const sModul = getScore('modul', 34); 
        const sPBM = getScore('pembelajaran', 46); 
        const sPenilaian = getScore('penilaian', 48); 

        const avg = Math.round((sAdm + sATP + sModul + sPBM + sPenilaian) / 5);
        const pred = getPredikat(avg, settings.scoreSettings);
        const auto = getAutoProgramText(avg, settings.scoreSettings);
        
        return { ...r, no: i + 1, avg, pred, ...auto };
      });
  }, [records, activeSemester, settings.scoreSettings, instrumentResults]);

  const latestSupervisionDate = useMemo(() => {
    if (data.length === 0) return null;
    const sorted = [...data].sort((a, b) => {
        if (!a.tanggalPemb) return 1;
        if (!b.tanggalPemb) return -1;
        return new Date(b.tanggalPemb).getTime() - new Date(a.tanggalPemb).getTime();
    });
    return sorted[0].tanggalPemb;
  }, [data]);

  const generateAnalysis = () => {
    if (data.length > 0) {
      const needsMentoring = data.filter(d => d.avg < settings.scoreSettings.good).length;
      const readyForPeerCoaching = data.filter(d => d.avg >= settings.scoreSettings.excellent).length;

      setKekuatan(`Sebanyak ${readyForPeerCoaching} guru telah memiliki kualifikasi kinerja 'Sangat Baik' dan siap menjadi model/mentor bagi rekan sejawat dalam program Peer Coaching.`);
      setKelemahan(`Masih ditemukan ${needsMentoring} guru yang membutuhkan bimbingan teknis lebih lanjut, khususnya pada aspek variasi metode pembelajaran dan kelengkapan administrasi digital.`);
      setRekomendasi("Menyusun jadwal kegiatan Peer Coaching (Guru Penggerak) dan menjadwalkan ulang supervisi klinis bagi guru dengan predikat C dan D.");
    }
  };

  useEffect(() => {
    if (!kekuatan && !kelemahan && !rekomendasi && data.length > 0) {
      generateAnalysis();
    }
  }, [data]);

  const handleRefresh = () => {
    generateAnalysis();
    alert('Analisa berhasil direfresh!');
  };

  const exportPDF = () => {
    const element = document.getElementById('ptl-export-area');
    // @ts-ignore
    html2pdf().from(element).save(`Program_Tindak_Lanjut_Guru_${activeSemester}.pdf`);
  };

  return (
    <div className="animate-fadeIn space-y-6 pb-20">
      <div className="flex justify-between items-center no-print">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight text-slate-800">Program Tindak Lanjut Supervisi</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rencana Strategis Pasca Evaluasi</p>
        </div>
        <div className="flex gap-2">
           <div className="flex bg-slate-200 p-1 rounded-xl shadow-inner">
             <button onClick={() => setSettings({...settings, semester: 'Ganjil'})} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold ${activeSemester === 'Ganjil' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'}`}>Ganjil</button>
             <button onClick={() => setSettings({...settings, semester: 'Genap'})} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold ${activeSemester === 'Genap' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'}`}>Genap</button>
           </div>
           <button onClick={handleRefresh} className="px-4 py-2 bg-cyan-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg ml-2 flex items-center gap-2 hover:bg-cyan-700 transition-all">
             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
             Refresh Data
           </button>
           <button onClick={exportPDF} className="px-4 py-2 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg ml-2">PDF</button>
        </div>
      </div>

      <div id="ptl-export-area" className="bg-white rounded-2xl shadow-xl border border-slate-200 p-10 font-serif">
        <div className="text-center border-b-2 border-slate-900 mb-8 pb-4 uppercase">
          <h1 className="text-lg font-black tracking-widest leading-none">PROGRAM TINDAK LANJUT HASIL SUPERVISI AKADEMIK</h1>
          <h2 className="text-md font-bold mt-1 uppercase">{settings.namaSekolah}</h2>
          <p className="text-[10px] font-bold mt-1 italic">TP {settings.tahunPelajaran} • Semester {activeSemester}</p>
        </div>

        <table className="w-full border-collapse text-[9px] border-2 border-slate-800 mb-8">
          <thead>
            <tr className="bg-slate-900 text-white uppercase text-center font-black">
              <th className="border border-slate-800 p-2 w-8">No</th>
              <th className="border border-slate-800 p-2 text-left">Nama Lengkap</th>
              <th className="border border-slate-800 p-2 text-left">Mata Pelajaran</th>
              <th className="border border-slate-800 p-2 w-16">Nilai</th>
              <th className="border border-slate-800 p-2 w-16">Predikat</th>
              <th className="border border-slate-800 p-2 text-left">Hasil Analisis</th>
              <th className="border border-slate-800 p-2 text-left">Rencana Tindak Lanjut</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                <td className="border border-slate-800 p-2 text-center font-bold text-slate-400">{d.no}</td>
                <td className="border border-slate-800 p-2 font-black uppercase text-slate-800 leading-tight">{d.namaGuru}</td>
                <td className="border border-slate-800 p-2 italic text-blue-800">{d.mataPelajaran}</td>
                <td className="border border-slate-800 p-2 text-center font-black text-sm">{d.avg}</td>
                <td className={`border border-slate-800 p-2 text-center font-black text-lg ${d.pred.color} ${d.pred.bg}`}>{d.pred.p}</td>
                <td className="border border-slate-800 p-2 italic leading-relaxed text-slate-600">{d.ha}</td>
                <td className="border border-slate-800 p-2 font-bold leading-relaxed text-slate-700 bg-slate-50/30">{d.rtl}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 border-t-4 border-slate-900 pt-6 break-inside-avoid">
           <div className="space-y-4">
              <div>
                 <h3 className="text-xs font-black uppercase bg-slate-900 text-white px-3 py-1 inline-block">1. Analisis Kekuatan (Strengths)</h3>
                 <textarea value={kekuatan} onChange={e => setKekuatan(e.target.value)} className="w-full mt-2 p-2 border-2 border-slate-200 rounded-xl text-[10px] h-24 outline-none focus:border-blue-500 no-print" placeholder="Tulis analisis kekuatan..." />
                 <div className="hidden print:block mt-2 text-[10px] leading-relaxed text-slate-700 border border-slate-200 p-2 min-h-[60px] whitespace-pre-wrap">{kekuatan || '................................'}</div>
              </div>
              <div>
                 <h3 className="text-xs font-black uppercase bg-slate-900 text-white px-3 py-1 inline-block">2. Analisis Kelemahan (Weaknesses)</h3>
                 <textarea value={kelemahan} onChange={e => setKelemahan(e.target.value)} className="w-full mt-2 p-2 border-2 border-slate-200 rounded-xl text-[10px] h-24 outline-none focus:border-blue-500 no-print" placeholder="Tulis analisis kelemahan..." />
                 <div className="hidden print:block mt-2 text-[10px] leading-relaxed text-slate-700 border border-slate-200 p-2 min-h-[60px] whitespace-pre-wrap">{kelemahan || '................................'}</div>
              </div>
           </div>
           <div className="space-y-4">
              <div className="bg-blue-50 p-4 border-2 border-blue-200 rounded-xl h-full">
                 <h3 className="text-xs font-black uppercase text-blue-900 mb-2">3. Rekomendasi & Tindak Lanjut</h3>
                 <textarea value={rekomendasi} onChange={e => setRekomendasi(e.target.value)} className="w-full bg-white p-2 border border-blue-200 rounded-lg text-[10px] h-48 outline-none focus:ring-2 focus:ring-blue-300 no-print" placeholder="Tulis rekomendasi..." />
                 <div className="hidden print:block text-[10px] leading-relaxed text-blue-800 whitespace-pre-wrap">{rekomendasi || '................................'}</div>
              </div>
           </div>
        </div>

        <div className="mt-12 flex justify-end items-start text-xs font-bold uppercase tracking-tight px-4 text-center">
          <div className="text-center w-64">
             <p className="mb-20 uppercase">
                Mojokerto, {addWorkDays(latestSupervisionDate || new Date().toISOString(), 5)}<br/>
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

export default ProgramTindakLanjutView;
