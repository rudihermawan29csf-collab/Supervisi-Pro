import React, { useState, useMemo, useEffect } from 'react';
import { TeacherRecord, AppSettings, InstrumentResult } from '../types';

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

const getCatatanRecap = (avg: number) => {
  if (avg >= 91) return "Sangat Memuaskan. Perangkat lengkap, PBM interaktif, dan asesmen variatif.";
  if (avg >= 75) return "Baik. Kinerja memenuhi standar, perlu sedikit pengayaan pada media digital.";
  if (avg >= 55) return "Cukup. Administrasi tersedia, namun pengelolaan kelas perlu pendampingan rutin.";
  return "Kurang. Diperlukan supervisi klinis dan penataan ulang seluruh perangkat ajar.";
};

const toTitleCase = (str: string) => {
  if (!str) return '';
  return str.toLowerCase().split(' ').map(word => {
    return (word.charAt(0).toUpperCase() + word.slice(1));
  }).join(' ');
};

const SupervisionRecapView: React.FC<Props> = ({ settings, records, instrumentResults, setSettings, onSave }) => {
  const activeSemester = settings.semester;
  const analysisKey = `0-recap-analysis-${activeSemester}`;

  const [kekuatan, setKekuatan] = useState('');
  const [kelemahan, setKelemahan] = useState('');
  const [rekomendasi, setRekomendasi] = useState('');

  // Fix: Load existing analysis from instrumentResults state
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

  const recapData = useMemo(() => {
    return records
      .filter(r => r.semester === activeSemester)
      .map(r => {
        const getScore = (type: string, maxScore: number): number => {
          const key = `${r.id}-${type}-${activeSemester}`;
          const res = instrumentResults[key];
          if (!res || !res.scores) return 0;
          const vals = Object.values(res.scores).filter(v => typeof v === 'number') as number[];
          const sum = vals.reduce((a: number, b: number) => a + b, 0);
          return maxScore > 0 ? Math.round((sum / maxScore) * 100) : 0;
        };

        const sAdm = getScore('administrasi', 26);
        const sATP = getScore('atp', 24);
        const sModul = getScore('modul', 34);
        const sPBM = getScore('pembelajaran', 46);
        const sPenilaian = getScore('penilaian', 48);

        const avg = Math.round((sAdm + sATP + sModul + sPBM + sPenilaian) / 5);

        return {
          ...r,
          scoreAdm: sAdm,
          scoreATP: sATP,
          scoreModul: sModul,
          scorePBM: sPBM,
          scorePenilaian: sPenilaian,
          nilaiAkhir: avg,
          catatanRecap: getCatatanRecap(avg)
        };
      });
  }, [records, activeSemester, instrumentResults]);

  const latestSupervisionDate = useMemo(() => {
    if (recapData.length === 0) return null;
    const sorted = [...recapData].sort((a, b) => {
        if (!a.tanggalPemb) return 1;
        if (!b.tanggalPemb) return -1;
        return new Date(b.tanggalPemb).getTime() - new Date(a.tanggalPemb).getTime();
    });
    return sorted[0].tanggalPemb;
  }, [recapData]);

  const generateAnalysis = () => {
    if (recapData.length > 0) {
      const avgTotal = recapData.reduce((s, r) => s + r.nilaiAkhir, 0) / recapData.length;
      const excellentCount = recapData.filter(r => r.nilaiAkhir >= 91).length;
      const poorCount = recapData.filter(r => r.nilaiAkhir < 75).length;

      setKekuatan(`Secara umum, rata-rata kinerja guru mencapai ${avgTotal.toFixed(1)}. Terdapat ${excellentCount} guru dengan kualifikasi Sangat Baik yang konsisten dalam administrasi dan pelaksanaan pembelajaran.`);
      
      if (poorCount > 0) {
        setKelemahan(`Masih terdapat ${poorCount} guru yang berada di bawah standar kompetensi yang diharapkan, terutama pada aspek variasi metode mengajar dan kelengkapan dokumen penilaian.`);
        setRekomendasi("Meningkatkan frekuensi Diskusi MGMP Sekolah dan mewajibkan guru dengan nilai rendah untuk mengikuti program mentoring sebaya.");
      } else {
        setKelemahan("Kelemahan minor terlihat pada inovasi penggunaan teknologi digital yang belum merata di semua mapel.");
        setRekomendasi("Pelatihan lanjutan mengenai pemanfaatan AI dalam pembelajaran untuk efisiensi administrasi.");
      }
    }
  };

  useEffect(() => {
    if (!kekuatan && !kelemahan && !rekomendasi && recapData.length > 0) {
      generateAnalysis();
    }
  }, [recapData]);

  const handleRefresh = () => {
    generateAnalysis();
    alert('Analisis berhasil diperbarui berdasarkan data instrumen terbaru.');
  };

  // Fix: Handle manual save of the global analysis fields
  const handleSave = () => {
    if (onSave) {
      onSave(0, 'recap-analysis', activeSemester, {
        scores: {},
        remarks: {},
        catatan: kekuatan,
        kesanUmum: kelemahan,
        tindakLanjut: rekomendasi
      });
      alert('Analisis rekapitulasi berhasil disimpan!');
    }
  };

  const exportPDF = () => {
    const element = document.getElementById('recap-export-area');
    // @ts-ignore
    html2pdf().from(element).save(`Rekapitulasi_Supervisi_${activeSemester}.pdf`);
  };

  const exportWord = () => {
    const content = document.getElementById('recap-export-area')?.innerHTML;
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid black; padding: 5px; font-size: 8pt; }</style></head><body>";
    const footer = "</body></html>";
    const blob = new Blob([header + content + footer], { type: 'application/msword' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Rekapitulasi_Supervisi_${activeSemester}.doc`;
    link.click();
  };

  return (
    <div className="animate-fadeIn space-y-6 pb-20">
      <div className="flex justify-between items-center no-print">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight text-slate-800">Rekapitulasi Supervisi Akademik</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Konsolidasi Seluruh Instrumen Penilaian</p>
        </div>
        <div className="flex gap-2">
           <div className="flex bg-slate-200 p-1 rounded-xl shadow-inner">
             <button onClick={() => setSettings({...settings, semester: 'Ganjil'})} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold ${activeSemester === 'Ganjil' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'}`}>Ganjil</button>
             <button onClick={() => setSettings({...settings, semester: 'Genap'})} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold ${activeSemester === 'Genap' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'}`}>Genap</button>
           </div>
           <button onClick={handleRefresh} className="px-4 py-2 bg-cyan-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg ml-2 flex items-center gap-2 hover:bg-cyan-700 transition-all">
             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
             Refresh
           </button>
           <button onClick={handleSave} className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg ml-2">Simpan</button>
           <button onClick={exportPDF} className="px-4 py-2 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg ml-2">PDF</button>
           <button onClick={exportWord} className="px-4 py-2 bg-blue-800 text-white rounded-xl font-black text-[10px] uppercase shadow-lg ml-2">Word</button>
        </div>
      </div>

      <div id="recap-export-area" className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden p-8 font-serif">
        <div className="text-center border-b-2 border-slate-900 mb-8 pb-4 uppercase">
          <h1 className="text-lg font-black tracking-widest leading-none">REKAPITULASI HASIL SUPERVISI AKADEMIK GURU</h1>
          <h2 className="text-md font-bold mt-1 uppercase">{settings.namaSekolah}</h2>
          <p className="text-[10px] font-bold mt-1 italic uppercase tracking-widest">Tahun Pelajaran {settings.tahunPelajaran} • Semester {activeSemester}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[9px] border-2 border-slate-800">
            <thead>
              <tr className="bg-slate-900 text-white uppercase text-center font-black">
                <th className="border border-slate-800 p-2 w-32 text-left">Nama Guru</th>
                <th className="border border-slate-800 p-2 text-left">Mata Pelajaran</th>
                <th className="border border-slate-800 p-2 w-12">Kelas</th>
                <th className="border border-slate-800 p-2">Adm. Pem</th>
                <th className="border border-slate-800 p-2">Telaah ATP</th>
                <th className="border border-slate-800 p-2">Telaah MA</th>
                <th className="border border-slate-800 p-2">Pelaks. Pemb</th>
                <th className="border border-slate-800 p-2">Penilaian Pemb</th>
                <th className="border border-slate-800 p-2">Rata-rata (%)</th>
                <th className="border border-slate-800 p-2 text-left">Catatan / Analisis</th>
              </tr>
            </thead>
            <tbody>
              {recapData.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50 transition-colors align-top">
                  <td className="border border-slate-800 p-2 font-black uppercase text-slate-800">{toTitleCase(d.namaGuru)}</td>
                  <td className="border border-slate-800 p-2 italic text-blue-800">{d.mataPelajaran}</td>
                  <td className="border border-slate-800 p-2 text-center font-bold">{d.kelas || '-'}</td>
                  <td className="border border-slate-800 p-2 text-center">{d.scoreAdm}%</td>
                  <td className="border border-slate-800 p-2 text-center">{d.scoreATP}%</td>
                  <td className="border border-slate-800 p-2 text-center">{d.scoreModul}%</td>
                  <td className="border border-slate-800 p-2 text-center">{d.scorePBM}%</td>
                  <td className="border border-slate-800 p-2 text-center">{d.scorePenilaian}%</td>
                  <td className="border border-slate-800 p-2 text-center font-black text-blue-700 bg-blue-50/20">{d.nilaiAkhir}%</td>
                  <td className="border border-slate-800 p-2 italic text-slate-600 leading-snug">{d.catatanRecap}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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

export default SupervisionRecapView;
