
import React, { useState, useMemo, useEffect } from 'react';
import { TeacherRecord, AppSettings, InstrumentResult } from '../types';

interface Props {
  settings: AppSettings;
  records: TeacherRecord[];
  setSettings: (s: AppSettings) => void;
  instrumentResults: Record<string, InstrumentResult>;
  onSaveAction: (teacherId: number, actions: any) => void;
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

const getAutoActionRTL = (avg: number, fairThreshold: number) => {
  if (avg < fairThreshold) return "Supervisi klinis intensif dan evaluasi harian perangkat.";
  return "Bimbingan teknis tatap muka mengenai asesmen kurikulum merdeka.";
};

const FollowUpActionView: React.FC<Props> = ({ settings, records, setSettings, instrumentResults, onSaveAction, onSave }) => {
  const activeSemester = settings.semester;
  const targetThreshold = settings.scoreSettings.good;
  const analysisKey = `0-action-analysis-${activeSemester}`;

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
      .map(r => {
        // Dynamic score calculation identical to PTL
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
        
        const key = `${r.id}-followup-actions-${activeSemester}`;
        const savedActions = instrumentResults[key]?.actions || {
          contoh: false, tanyaJawab: false, diskusi: false, konsultasi: false, pelatihan: false
        };

        const rtl = getAutoActionRTL(avg, settings.scoreSettings.fair);
        return { ...r, avg, rtl, actions: savedActions };
      })
      .filter(r => r.avg < targetThreshold);
  }, [records, activeSemester, instrumentResults, settings.scoreSettings, targetThreshold]);

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
       setKekuatan(`Sebagian guru (${Math.round((records.length - data.length) / records.length * 100)}%) telah mencapai ambang batas kompetensi dan tidak memerlukan tindakan perbaikan intensif.`);
       setKelemahan(`Terdapat ${data.length} guru yang memerlukan intervensi khusus karena nilai rata-rata di bawah standar (${targetThreshold}). Fokus kelemahan pada konsistensi penyusunan dokumen dan manajemen waktu.`);
       setRekomendasi("Segera laksanakan program 'Pemberian Contoh' dan 'Pelatihan' terfokus untuk kelompok guru ini dalam 2 minggu ke depan.");
    } else {
       setKekuatan("Seluruh guru telah memenuhi standar minimal yang ditetapkan sekolah. Budaya mutu berjalan baik.");
       setKelemahan("Tidak ditemukan kelemahan mayor yang memerlukan tindakan perbaikan massal.");
       setRekomendasi("Fokus dialihkan ke program pengembangan prestasi dan inovasi pembelajaran (Advanced Training).");
    }
  };

  useEffect(() => {
    if (!kekuatan && !kelemahan && !rekomendasi) {
      generateAnalysis();
    }
  }, [data]);

  const handleRefresh = () => {
    generateAnalysis();
    alert('Analisis Action Plan diperbarui!');
  };

  const handleToggle = (teacherId: number, field: string) => {
    const teacherData = data.find(d => d.id === teacherId);
    const current = (teacherData?.actions || {}) as any;
    const updated = { ...current, [field]: !current[field] };
    onSaveAction(teacherId, updated);
  };

  const exportPDF = () => {
    const element = document.getElementById('action-export-area');
    // @ts-ignore
    html2pdf().from(element).save(`Laporan_Action_TL_Guru_${activeSemester}.pdf`);
  };

  return (
    <div className="animate-fadeIn space-y-6 pb-20">
      <div className="flex justify-between items-center no-print">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight">Tindak Lanjut Action (Skor {"<"} {targetThreshold}%)</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Intervensi Langsung Supervisor</p>
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

      <div id="action-export-area" className="bg-white rounded-2xl shadow-xl border border-slate-200 p-10 font-serif">
        <div className="text-center border-b-2 border-slate-900 mb-8 pb-4 uppercase">
          <h1 className="text-lg font-black tracking-widest leading-none">LAPORAN HASIL TINDAK LANJUT ACTION SUPERVISI AKADEMIK</h1>
          <h2 className="text-md font-bold mt-1 uppercase">{settings.namaSekolah}</h2>
          <p className="text-[10px] font-bold mt-1 italic uppercase opacity-75">TP {settings.tahunPelajaran} • Target Skor di bawah {targetThreshold}%</p>
        </div>

        <table className="w-full border-collapse text-[9px] border-2 border-slate-800">
          <thead>
            <tr className="bg-slate-900 text-white uppercase text-center font-black">
              <th className="border border-slate-800 p-2 w-8">No</th>
              <th className="border border-slate-800 p-2 text-left">Nama Lengkap Guru</th>
              <th className="border border-slate-800 p-2 w-14 bg-slate-800 text-yellow-400">Skor (%)</th>
              <th className="border border-slate-800 p-2 text-left">Rencana Tindak Lanjut (RTL)</th>
              <th className="border border-slate-800 p-1 w-16">Pemberian Contoh</th>
              <th className="border border-slate-800 p-1 w-16">Tanya Jawab</th>
              <th className="border border-slate-800 p-1 w-16">Diskusi</th>
              <th className="border border-slate-800 p-1 w-16">Konsultasi</th>
              <th className="border border-slate-800 p-1 w-16">Pelatihan</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                <td className="border border-slate-800 p-2 text-center font-bold text-slate-400">{i + 1}</td>
                <td className="border border-slate-800 p-2 font-black uppercase text-slate-800 leading-tight">{d.namaGuru}</td>
                <td className="border border-slate-800 p-2 text-center font-black text-rose-600 bg-rose-50/10 text-sm tracking-tighter">{d.avg}%</td>
                <td className="border border-slate-800 p-2 italic leading-relaxed text-slate-600">{d.rtl}</td>
                {['contoh', 'tanyaJawab', 'diskusi', 'konsultasi', 'pelatihan'].map(field => (
                  <td key={field} className="border border-slate-800 p-1 text-center cursor-pointer no-print" onClick={() => handleToggle(d.id, field)}>
                    <div className={`w-5 h-5 mx-auto border-2 rounded flex items-center justify-center ${(d.actions as any)[field] ? 'bg-slate-800 border-slate-800 text-white' : 'border-slate-300'}`}>
                      {(d.actions as any)[field] && <span className="font-black text-[8px]">v</span>}
                    </div>
                  </td>
                ))}
                {['contoh', 'tanyaJawab', 'diskusi', 'konsultasi', 'pelatihan'].map(field => (
                  <td key={`print-${field}`} className="border border-slate-800 p-1 text-center hidden print:table-cell font-black">{(d.actions as any)[field] ? 'v' : ''}</td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={9} className="p-10 text-center italic text-slate-400 font-bold uppercase">Tidak ada guru dengan skor di bawah ambang batas.</td></tr>
            )}
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

export default FollowUpActionView;
