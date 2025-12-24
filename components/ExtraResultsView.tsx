
import React, { useMemo } from 'react';
import { AppSettings, ExtraRecord, InstrumentResult } from '../types';

interface Props {
  extraRecords: ExtraRecord[];
  settings: AppSettings;
  instrumentResults: Record<string, InstrumentResult>;
  setSettings: (s: AppSettings) => void;
}

const toTitleCase = (str: string) => {
  if (!str) return '';
  return str.toLowerCase().split(' ').map(word => {
    return (word.charAt(0).toUpperCase() + word.slice(1));
  }).join(' ');
};

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

const ExtraResultsView: React.FC<Props> = ({ extraRecords, settings, instrumentResults, setSettings }) => {
  const activeSemester = settings.semester;

  const resultsData = useMemo(() => {
    return extraRecords
      .filter(r => r.semester === activeSemester)
      .map((r, idx) => {
        const resKey = `extra-${r.id}-${activeSemester}`;
        const result = instrumentResults[resKey];
        
        let perc = 0;
        if (result && result.scores) {
          const vals = Object.values(result.scores).map(v => {
            // Match logic from InstrumentExtraView.tsx
            if (v === 'B') return 3; 
            if (v === 'C') return 2; 
            if (v === 'K') return 1; 
            if (v === 'T') return 0;
            if (v === 'YA') return 3; 
            if (v === 'TIDAK') return 0;
            return 0;
          });
          
          // Total Items in Instrument = 18 (excluding headers)
          // Max Score per Item = 3
          // Total Max Score = 18 * 3 = 54
          const maxScore = 54;
          const totalScore = vals.reduce((a, b) => a + b, 0);
          
          if (maxScore > 0) {
            perc = Math.round((totalScore / maxScore) * 100);
          }
        }

        return {
          no: idx + 1,
          nama: toTitleCase(r.nama),
          ekstra: r.ekstra,
          rawDate: r.tgl, // Assuming tgl is localized string, need parser like in Tendik
          skor: perc,
          catatan: perc >= 91 ? "Sangat Memuaskan. Pembina sangat inovatif." : perc >= 76 ? "Baik. Perlu pengayaan materi latihan." : "Cukup. Perlu perbaikan manajemen.",
          tindakLanjut: perc >= 91 ? "Pertahankan prestasi." : "Workshop variasi metode latihan.",
          saran: perc >= 91 ? "Fokus pada persiapan lomba tingkat lanjut." : "Evaluasi program latihan rutin."
        };
      });
  }, [extraRecords, activeSemester, instrumentResults]);

  const overallStats = useMemo(() => {
    const scores = resultsData.map(r => r.skor);
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    return avg;
  }, [resultsData]);

  const latestSupervisionDate = useMemo(() => {
    const dates = resultsData.map(r => r.rawDate).filter(Boolean);
    if (dates.length === 0) return null;
    
    // Simple parser for "20 Oktober 2025" or ISO
    const parseIndonesianDate = (str: string) => {
        const months: {[key:string]: number} = {
            'Januari': 0, 'Februari': 1, 'Maret': 2, 'April': 3, 'Mei': 4, 'Juni': 5,
            'Juli': 6, 'Agustus': 7, 'September': 8, 'Oktober': 9, 'November': 10, 'Desember': 11
        };
        const parts = str.split(' ');
        if (parts.length === 3) {
            const day = parseInt(parts[0]);
            const month = months[parts[1]];
            const year = parseInt(parts[2]);
            return new Date(year, month, day);
        }
        return new Date(); 
    };

    const validDates = dates.map(d => parseIndonesianDate(d as string).getTime());
    const maxDate = new Date(Math.max(...validDates));
    return maxDate.toISOString();
  }, [resultsData]);

  const exportPDF = () => {
    const element = document.getElementById('extra-results-export-area');
    // @ts-ignore
    html2pdf().from(element).save(`Hasil_Supervisi_Ekstra_${activeSemester}.pdf`);
  };

  const exportWord = () => {
    const content = document.getElementById('extra-results-export-area')?.innerHTML;
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid black; padding: 5px; font-size: 8pt; }</style></head><body>";
    const footer = "</body></html>";
    const blob = new Blob([header + content + footer], { type: 'application/msword' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Hasil_Supervisi_Ekstra_${activeSemester}.doc`;
    link.click();
  };

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex justify-between items-center no-print">
        <div>
           <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Hasil Supervisi Ekstrakurikuler</h2>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Laporan Kinerja Pembinaan Bakat Siswa</p>
        </div>
        <div className="flex gap-2">
           <div className="flex bg-slate-200 p-1 rounded-xl shadow-inner mr-2">
             <button onClick={() => setSettings({...settings, semester: 'Ganjil'})} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold ${activeSemester === 'Ganjil' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'}`}>Ganjil</button>
             <button onClick={() => setSettings({...settings, semester: 'Genap'})} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold ${activeSemester === 'Genap' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'}`}>Genap</button>
           </div>
           <button onClick={exportPDF} className="px-4 py-2 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg">PDF</button>
           <button onClick={exportWord} className="px-4 py-2 bg-blue-800 text-white rounded-xl font-black text-[10px] uppercase shadow-lg">Word</button>
        </div>
      </div>

      <div id="extra-results-export-area" className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden p-10 font-serif">
        <div className="text-center border-b-2 border-slate-900 mb-8 pb-4 uppercase">
          <h1 className="text-lg font-black tracking-widest">REKAPITULASI HASIL SUPERVISI EKSTRAKURIKULER</h1>
          <h2 className="text-md font-bold mt-1 uppercase">{settings.namaSekolah}</h2>
          <p className="text-[10px] font-bold mt-1 italic uppercase">Tahun Pelajaran {settings.tahunPelajaran} • Semester {activeSemester}</p>
        </div>

        <table className="w-full border-collapse text-[9px] border-2 border-slate-800">
          <thead>
            <tr className="bg-slate-900 text-white font-black text-center uppercase">
              <th className="border border-slate-800 p-2 w-8">No</th>
              <th className="border border-slate-800 p-2 text-left">Nama Pembina</th>
              <th className="border border-slate-800 p-2 text-left">Unit Ekstra</th>
              <th className="border border-slate-800 p-2 w-14">Hasil (%)</th>
              <th className="border border-slate-800 p-2 text-left w-1/4">Analisis Kinerja</th>
              <th className="border border-slate-800 p-2 text-left">Langkah Tindak Lanjut</th>
              <th className="border border-slate-800 p-2 text-left">Saran Pengembangan</th>
            </tr>
          </thead>
          <tbody>
            {resultsData.map((row) => (
              <tr key={row.no} className="align-top hover:bg-slate-50 transition-colors">
                <td className="border border-slate-800 p-2 text-center font-bold text-slate-400">{row.no}</td>
                <td className="border border-slate-800 p-2 font-black uppercase text-slate-700">{row.nama}</td>
                <td className="border border-slate-800 p-2 italic font-medium uppercase text-blue-800">{row.ekstra}</td>
                <td className="border border-slate-800 p-2 text-center font-black text-blue-700 bg-blue-50/20">{row.skor}%</td>
                <td className="border border-slate-800 p-2 italic text-slate-600">{row.catatan}</td>
                <td className="border border-slate-800 p-2 font-bold text-blue-900">{row.tindakLanjut}</td>
                <td className="border border-slate-800 p-2 text-slate-500 italic">{row.saran}</td>
              </tr>
            ))}
            {resultsData.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center italic text-slate-400">Belum ada data supervisi ekstrakurikuler.</td></tr>
            )}
          </tbody>
        </table>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 border-t-4 border-slate-900 pt-6">
           <div className="space-y-4">
              <div>
                 <h3 className="text-xs font-black uppercase bg-slate-900 text-white px-3 py-1 inline-block">1. Analisis Kekuatan (Strengths)</h3>
                 <div className="mt-2 text-[10px] leading-relaxed text-slate-700 space-y-2 text-justify">
                    <p>• <strong>Partisipasi Siswa:</strong> {overallStats >= 80 ? "Tingkat kehadiran dan antusiasme siswa dalam kegiatan sangat tinggi, menunjukkan keberhasilan pembina dalam membangun motivasi." : "Minat siswa terhadap kegiatan ekstrakurikuler cukup baik, meski fluktuatif di beberapa pertemuan."}</p>
                    <p>• <strong>Kinerja Pembina:</strong> Dedikasi pembina dalam mendampingi latihan rutin sudah berjalan optimal sesuai jadwal, dengan materi latihan yang terstruktur dan variatif.</p>
                    <p>• <strong>Prestasi Kompetisi:</strong> Beberapa cabang ekstrakurikuler telah menunjukkan potensi kompetitif yang menjanjikan untuk level kabupaten maupun provinsi.</p>
                 </div>
              </div>
              <div>
                 <h3 className="text-xs font-black uppercase bg-slate-900 text-white px-3 py-1 inline-block">2. Analisis Kelemahan (Weaknesses)</h3>
                 <div className="mt-2 text-[10px] leading-relaxed text-slate-700 space-y-2 text-justify">
                    <p>• <strong>Tertib Administrasi:</strong> {overallStats < 90 ? "Kelengkapan jurnal kegiatan, program kerja tertulis, dan presensi harian siswa seringkali tertunda pengisiannya atau kurang lengkap." : "Dokumentasi kegiatan (foto/video) belum terarsip rapi secara digital sebagai bank data portofolio siswa."}</p>
                    <p>• <strong>Sarana Prasarana:</strong> Keterbatasan dan kondisi alat peraga/latihan yang mulai dimakan usia menghambat variasi metode pembinaan di beberapa cabang olahraga dan seni.</p>
                    <p>• <strong>Regenerasi:</strong> Kaderisasi peserta didik untuk melanjutkan tongkat estafet kepemimpinan dalam organisasi ekstrakurikuler belum berjalan mulus.</p>
                 </div>
              </div>
           </div>
           <div className="space-y-4">
              <div className="bg-blue-50 p-4 border-2 border-blue-200 rounded-xl">
                 <h3 className="text-xs font-black uppercase text-blue-900 mb-2">3. Rekomendasi Peningkatan Kedepan</h3>
                 <div className="text-[10px] leading-relaxed text-blue-800 space-y-2 text-justify">
                    <p><strong>A. Manajemen Jadwal Terpadu:</strong> Penataan ulang jadwal penggunaan fasilitas bersama (lapangan, aula, lab) agar tidak terjadi benturan antar ekstrakurikuler dan efisiensi waktu latihan.</p>
                    <p><strong>B. Target Prestasi Terukur:</strong> Menetapkan KPI (Key Performance Indicator) berupa target juara minimal tingkat kabupaten untuk setiap cabang unggulan pada tahun ajaran mendatang.</p>
                    <p><strong>C. Apresiasi & Reward:</strong> Memberikan penghargaan khusus bagi siswa dan pembina yang berprestasi untuk memacu semangat kompetisi yang sehat.</p>
                 </div>
              </div>
           </div>
        </div>

        <div className="mt-12 flex justify-end items-start text-xs font-bold uppercase tracking-tight px-4">
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

export default ExtraResultsView;
