
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

const getLogPersiapanText = (score: number) => {
  if (score >= 12) return "Perangkat pendahuluan sangat lengkap, motivasi dan apersepsi sinkron dengan CP.";
  if (score >= 8) return "Perangkat pendahuluan memadai, tujuan pembelajaran sudah disampaikan.";
  return "Perangkat pendahuluan kurang lengkap, perlu penguatan pada aspek motivasi siswa.";
};

const getLogPelaksanaanText = (score: number) => {
  if (score >= 40) return "Sangat inovatif, manajemen kelas prima, interaksi 4C (Abad 21) terlihat nyata.";
  if (score >= 30) return "Langkah pembelajaran runut, penguasaan materi baik, media digunakan secara relevan.";
  return "Cenderung konvensional (ceramah), partisipasi aktif siswa masih perlu didorong.";
};

const getLogHasilText = (totalScore: number) => {
  if (totalScore >= 70) return "Target kompetensi tercapai optimal. Siswa sangat antusias dan mandiri.";
  if (totalScore >= 55) return "Target kompetensi tercapai. Perlu penguatan pada asesmen formatif.";
  return "Capaian belum optimal. Direkomendasikan untuk bimbingan teknis modul ajar.";
};

const toTitleCase = (str: string) => {
  if (!str) return '';
  return str.toLowerCase().split(' ').map(word => {
    return (word.charAt(0).toUpperCase() + word.slice(1));
  }).join(' ');
};

const SupervisionLogView: React.FC<Props> = ({ settings, records, instrumentResults, setSettings, onSave }) => {
  const activeSemester = settings.semester;
  const analysisKey = `0-log-analysis-${activeSemester}`;

  // State for detailed analysis footer
  const [kekuatan, setKekuatan] = useState('');
  const [kelemahan, setKelemahan] = useState('');
  const [rekomendasi, setRekomendasi] = useState('');

  // Load existing analysis
  useEffect(() => {
    const saved = instrumentResults[analysisKey];
    if (saved) {
      setKekuatan(saved.catatan || '');
      setKelemahan(saved.kesanUmum || ''); // kesanUmum used for Weaknesses
      setRekomendasi(saved.tindakLanjut || ''); // tindakLanjut used for Recommendations
    } else {
      setKekuatan('');
      setKelemahan('');
      setRekomendasi('');
    }
  }, [analysisKey, instrumentResults]);

  const logData = useMemo(() => {
    return records
      .filter(r => r.semester === activeSemester)
      .map((teacher) => {
        const key = `${teacher.id}-pembelajaran-${activeSemester}`;
        const result = instrumentResults[key];
        
        let pScore = 0; let lScore = 0; let eScore = 0;
        if (result && result.scores) {
          const s = result.scores as Record<number, number>;
          for(let i=1; i<=7; i++) pScore += (s[i] || 0);
          for(let i=8; i<=30; i++) lScore += (s[i] || 0);
          for(let i=31; i<=38; i++) eScore += (s[i] || 0);
        }

        return {
          ...teacher,
          pScore, lScore, eScore,
          total: pScore + lScore + eScore,
          persiapanLog: getLogPersiapanText(pScore),
          pelaksanaanLog: getLogPelaksanaanText(lScore),
          hasilLog: getLogHasilText(pScore + lScore + eScore)
        };
      });
  }, [records, activeSemester, instrumentResults]);

  const latestSupervisionDate = useMemo(() => {
    if (logData.length === 0) return null;
    const sorted = [...logData].sort((a, b) => {
        if (!a.tanggalPemb) return 1;
        if (!b.tanggalPemb) return -1;
        return new Date(b.tanggalPemb).getTime() - new Date(a.tanggalPemb).getTime();
    });
    return sorted[0].tanggalPemb;
  }, [logData]);

  const generateAnalysis = () => {
    if (logData.length > 0) {
      const highPerformers = logData.filter(d => d.total >= 70).map(d => toTitleCase(d.namaGuru));
      const moderatePerformers = logData.filter(d => d.total >= 55 && d.total < 70).map(d => toTitleCase(d.namaGuru));
      const lowPerformers = logData.filter(d => d.total < 55).map(d => toTitleCase(d.namaGuru));
      
      if (highPerformers.length > 0) {
          setKekuatan(`Sebanyak ${highPerformers.length} guru menunjukkan kinerja sangat baik dalam pelaksanaan pembelajaran, antara lain: ${highPerformers.slice(0, 3).join(', ')}${highPerformers.length > 3 ? ' dst.' : '.'} Interaksi 4C dan manajemen kelas sudah optimal.`);
        } else if (moderatePerformers.length > 0) {
          setKekuatan(`Sebagian besar guru (${moderatePerformers.length} orang) menunjukkan kinerja yang cukup baik, antara lain: ${moderatePerformers.slice(0, 3).join(', ')}. Indikator persiapan dan pelaksanaan pembelajaran sudah memenuhi standar minimal.`);
        } else {
          setKekuatan("Meskipun capaian nilai belum optimal, motivasi guru untuk melaksanakan pembelajaran sesuai jadwal patut diapresiasi sebagai modal awal perbaikan.");
        }

      if (lowPerformers.length > 0) {
          setKelemahan(`Terdapat ${lowPerformers.length} guru yang masih perlu bimbingan intensif dalam pengelolaan kelas dan penggunaan metode variatif. Pembelajaran masih cenderung satu arah.`);
        } else {
          setKelemahan("Secara umum proses pembelajaran berjalan lancar. Kelemahan minor hanya pada variasi penggunaan media digital yang belum merata.");
        }

      if (lowPerformers.length > 0) {
          setRekomendasi("Perlu diadakan workshop pembuatan media ajar interaktif dan supervisi klinis lanjutan bagi guru yang belum mencapai standar kompetensi minimal.");
        } else {
          setRekomendasi("Mempertahankan konsistensi kualitas pembelajaran dan melaksanakan Peer Coaching (Guru Teman Sejawat) untuk berbagi praktik baik.");
        }
    }
  };

  // Auto-fill logic
  useEffect(() => {
    if (logData.length > 0 && (!kekuatan || !kelemahan || !rekomendasi)) {
      generateAnalysis();
    }
  }, [logData]);

  const handleRefresh = () => {
    generateAnalysis();
    alert('Catatan analisis diperbarui!');
  };

  const exportPDF = () => {
    const element = document.getElementById('log-export-area');
    // @ts-ignore
    html2pdf().from(element).save(`Catatan_Supervisi_${activeSemester}.pdf`);
  };

  const exportWord = () => {
    const content = document.getElementById('log-export-area')?.innerHTML;
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid black; padding: 5px; font-size: 8pt; }</style></head><body>";
    const footer = "</body></html>";
    const blob = new Blob([header + content + footer], { type: 'application/msword' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Catatan_Supervisi_${activeSemester}.doc`;
    link.click();
  };

  return (
    <div className="animate-fadeIn space-y-6 pb-20">
      <div className="flex justify-between items-center no-print">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight">Catatan Pelaksanaan Supervisi</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jurnal Evaluasi Naratif Performa Guru</p>
        </div>
        <div className="flex gap-2">
           <div className="flex bg-slate-200 p-1 rounded-xl shadow-inner">
             <button onClick={() => setSettings({...settings, semester: 'Ganjil'})} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold ${activeSemester === 'Ganjil' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}>Ganjil</button>
             <button onClick={() => setSettings({...settings, semester: 'Genap'})} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold ${activeSemester === 'Genap' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}>Genap</button>
           </div>
           <button onClick={handleRefresh} className="px-4 py-2 bg-cyan-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg ml-2 flex items-center gap-2 hover:bg-cyan-700 transition-all">
             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
             Refresh Data
           </button>
           <button onClick={exportPDF} className="px-4 py-2 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg ml-2">PDF</button>
           <button onClick={exportWord} className="px-4 py-2 bg-blue-800 text-white rounded-xl font-black text-[10px] uppercase shadow-lg ml-2">Word</button>
        </div>
      </div>

      <div id="log-export-area" className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden p-10 font-serif">
        <div className="text-center border-b-2 border-slate-900 mb-8 pb-4 uppercase">
          <h1 className="text-lg font-black tracking-widest leading-none">CATATAN PELAKSANAAN SUPERVISI GURU</h1>
          <h2 className="text-md font-bold mt-1 uppercase">{settings.namaSekolah}</h2>
          <p className="text-[10px] font-bold mt-1 italic uppercase tracking-tight">TP {settings.tahunPelajaran} • Semester {activeSemester}</p>
        </div>

        <table className="w-full border-collapse text-[9px] border-2 border-slate-800">
          <thead>
            <tr className="bg-slate-50 text-slate-900 uppercase text-center font-black">
              <th className="border border-slate-800 p-2 w-8">No</th>
              <th className="border border-slate-800 p-2 text-left">Nama Guru</th>
              <th className="border border-slate-800 p-2">Hari / Tanggal</th>
              <th className="border border-slate-800 p-2 w-10">Jam</th>
              <th className="border border-slate-800 p-2 text-left">Mata Pelajaran</th>
              <th className="border border-slate-800 p-2 w-12">Kelas</th>
              <th className="border border-slate-800 p-2 text-left w-1/4">Evaluasi Persiapan</th>
              <th className="border border-slate-800 p-2 text-left w-1/4">Evaluasi Pelaksanaan</th>
              <th className="border border-slate-800 p-2 text-left">Hasil / Kesimpulan</th>
            </tr>
          </thead>
          <tbody>
            {logData.map((d, i) => (
              <tr key={d.id} className="hover:bg-slate-50 transition-colors align-top">
                <td className="border border-slate-800 p-2 text-center font-bold text-slate-400">{i + 1}</td>
                <td className="border border-slate-800 p-2 font-black uppercase text-slate-800 leading-tight">{toTitleCase(d.namaGuru)}</td>
                <td className="border border-slate-800 p-2 text-center text-slate-600">{d.hari}, {d.tanggalPemb || '-'}</td>
                <td className="border border-slate-800 p-2 text-center font-black">{d.jamKe || '-'}</td>
                <td className="border border-slate-800 p-2 italic text-blue-800">{d.mataPelajaran}</td>
                <td className="border border-slate-800 p-2 text-center">{d.kelas || '-'}</td>
                <td className="border border-slate-800 p-2 italic leading-relaxed">{d.persiapanLog}</td>
                <td className="border border-slate-800 p-2 italic leading-relaxed">{d.pelaksanaanLog}</td>
                <td className="border border-slate-800 p-2 font-bold text-blue-900 leading-snug">{d.hasilLog}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Detailed Analysis Footer */}
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

export default SupervisionLogView;
