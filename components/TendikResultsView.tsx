
import React, { useMemo } from 'react';
import { AppSettings, AdminRecord, InstrumentResult } from '../types';

interface Props {
  adminRecords: AdminRecord[];
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

const TendikResultsView: React.FC<Props> = ({ adminRecords, settings, instrumentResults, setSettings }) => {
  const activeSemester = settings.semester;

  const categories = [
    { label: 'Administrasi Sekolah', id: 'sekolah' },
    { label: 'Administrasi Ketenagaan', id: 'ketenagaan' },
    { label: 'Administrasi Perlengkapan', id: 'perlengkapan' },
    { label: 'Administrasi Perpustakaan', id: 'perpustakaan' },
    { label: 'Laboratorium IPA', id: 'lab-ipa' },
    { label: 'Laboratorium Komputer', id: 'lab-komputer' },
    { label: 'Administrasi Kesiswaan', id: 'kesiswaan' },
  ];

  const getAutoDetailedFollowUp = (score: number, catName: string) => {
    const s = score * 100;
    if (s >= 91) return {
      catatan: `Sangat Profesional. Pengelolaan ${catName} berjalan dengan standar tinggi.`,
      tindakLanjut: "Pengembangan sistem digitalisasi (E-Filling) berkelanjutan.",
      saran: "Dijadikan sebagai standar percontohan unit lainnya."
    };
    if (s >= 76) return {
      catatan: `Baik. Komponen utama ${catName} tersedia.`,
      tindakLanjut: "Verifikasi dokumen berkala agar data tetap relevan.",
      saran: "Meningkatkan ketelitian dalam pengarsipan rutin."
    };
    return {
      catatan: `Cukup. Administrasi ${catName} perlu perbaikan sistem pengarsipan.`,
      tindakLanjut: "Bimbingan teknis mengenai standar SOP administrasi.",
      saran: "Wajib studi banding internal."
    };
  };

  const resultsData = useMemo(() => {
    return categories.map((cat, idx) => {
      const schedule = adminRecords.find(r => 
        r.semester === activeSemester && 
        (r.kegiatan.toLowerCase().includes(cat.label.toLowerCase()) || 
         r.kegiatan.toLowerCase().includes(cat.id.toLowerCase()))
      );

      const resKey = `tendik-${cat.id}-${activeSemester}`;
      const result = instrumentResults[resKey];
      
      let avgScore = 0;
      if (result && result.scores) {
        const vals = Object.values(result.scores).map(v => parseFloat(v as string)).filter(v => !isNaN(v));
        if (vals.length > 0) avgScore = parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2));
      }

      const auto = getAutoDetailedFollowUp(avgScore, cat.label);

      return {
        no: idx + 1,
        instrumen: cat.label,
        pembina: schedule ? toTitleCase(schedule.nama) : '-',
        tgl: schedule ? `${schedule.hari}, ${schedule.tgl}` : '-',
        rawDate: schedule?.tgl, // used for finding max date
        skor: (avgScore * 100).toFixed(0),
        ...auto
      };
    });
  }, [adminRecords, activeSemester, instrumentResults]);

  const overallStats = useMemo(() => {
    const scores = resultsData.map(r => parseFloat(r.skor) || 0);
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    return avg;
  }, [resultsData]);

  const latestSupervisionDate = useMemo(() => {
    const dates = resultsData.map(r => r.rawDate).filter(Boolean);
    if (dates.length === 0) return null;
    // We need to parse the dates (assuming format dd Month yyyy or similar from input, but here it depends on how it's stored. 
    // In ScheduleAdminView it's stored as formatted string. We might need a more robust parsing or store ISO date in record.)
    // For now assuming we can parse or rely on the last added. 
    // Ideally we should use ISO date from the record if available. 
    // Let's check adminRecords for the raw ISO date or similar if we added it. 
    // Looking at ScheduleAdminView, it stores `tgl` as localized string. It's better to find the record in adminRecords and use id or something.
    // However, `MainDashboardView` implies adminRecords are the source.
    // Let's try to parse the localized date or fallback to current date if parsing fails.
    // A better approach: find the admin record object corresponding to the result and if it has a real date object use it.
    // But `adminRecord` has `tgl` as string.
    // Let's just find the last one in the list for now or use current date if complex. 
    // Wait, `ScheduleAdminView` generates `tgl` as `toLocaleDateString('id-ID', ...`.
    // It is safer to rely on user setting range or just use "today" if we can't parse easily. 
    // But the prompt asks for "4 days after supervision schedule". 
    // I will try to parse the Indonesian date string to a Date object.
    
    // Simple parser for "20 Oktober 2025"
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
        return new Date(); // Fallback
    };

    const validDates = dates.map(d => parseIndonesianDate(d as string).getTime());
    const maxDate = new Date(Math.max(...validDates));
    return maxDate.toISOString();
  }, [resultsData]);

  const exportPDF = () => {
    const element = document.getElementById('tendik-results-export-area');
    // @ts-ignore
    html2pdf().from(element).save(`Hasil_Supervisi_Tendik_${activeSemester}.pdf`);
  };

  const exportWord = () => {
    const content = document.getElementById('tendik-results-export-area')?.innerHTML;
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid black; padding: 5px; font-size: 8pt; }</style></head><body>";
    const footer = "</body></html>";
    const blob = new Blob([header + content + footer], { type: 'application/msword' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Hasil_Supervisi_Tendik_${activeSemester}.doc`;
    link.click();
  };

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex justify-between items-center no-print">
        <div>
           <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Laporan Hasil Supervisi Tendik</h2>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rekapitulasi Capaian Administrasi Tenaga Kependidikan</p>
        </div>
        <div className="flex gap-2">
           <div className="flex bg-slate-200 p-1 rounded-xl shadow-inner mr-2">
             <button onClick={() => setSettings({...settings, semester: 'Ganjil'})} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold ${activeSemester === 'Ganjil' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}>Ganjil</button>
             <button onClick={() => setSettings({...settings, semester: 'Genap'})} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold ${activeSemester === 'Genap' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}>Genap</button>
           </div>
           <button onClick={exportPDF} className="px-4 py-2 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg">PDF</button>
           <button onClick={exportWord} className="px-4 py-2 bg-blue-800 text-white rounded-xl font-black text-[10px] uppercase shadow-lg">Word</button>
        </div>
      </div>

      <div id="tendik-results-export-area" className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden p-10 font-serif">
        <div className="text-center border-b-2 border-slate-900 mb-8 pb-4 uppercase">
          <h1 className="text-lg font-black tracking-widest">HASIL DAN TINDAK LANJUT SUPERVISI TENDIK</h1>
          <h2 className="text-md font-bold mt-1 uppercase">{settings.namaSekolah}</h2>
          <p className="text-[10px] font-bold mt-1 italic uppercase">Tahun Pelajaran {settings.tahunPelajaran} • Semester {activeSemester}</p>
        </div>

        <table className="w-full border-collapse text-[9px] border-2 border-slate-800">
          <thead>
            <tr className="bg-slate-900 text-white font-black text-center uppercase">
              <th className="border border-slate-800 p-2 w-8">No</th>
              <th className="border border-slate-800 p-2 text-left">Unit Administrasi</th>
              <th className="border border-slate-800 p-2 text-left">Nama Petugas</th>
              <th className="border border-slate-800 p-2 w-14">Skor (%)</th>
              <th className="border border-slate-800 p-2 text-left w-1/4">Analisis Temuan</th>
              <th className="border border-slate-800 p-2 text-left">Rencana Tindak Lanjut</th>
              <th className="border border-slate-800 p-2 text-left">Saran Supervisor</th>
            </tr>
          </thead>
          <tbody>
            {resultsData.map((row) => (
              <tr key={row.no} className="align-top hover:bg-slate-50 transition-colors">
                <td className="border border-slate-800 p-2 text-center font-bold text-slate-400">{row.no}</td>
                <td className="border border-slate-800 p-2 font-black uppercase text-slate-700">{row.instrumen}</td>
                <td className="border border-slate-800 p-2 italic font-medium">{row.pembina}</td>
                <td className="border border-slate-800 p-2 text-center font-black text-blue-700 bg-blue-50/20">{row.skor}%</td>
                <td className="border border-slate-800 p-2 italic text-slate-600">{row.catatan}</td>
                <td className="border border-slate-800 p-2 font-bold text-blue-900">{row.tindakLanjut}</td>
                <td className="border border-slate-800 p-2 text-slate-500 italic">{row.saran}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 border-t-4 border-slate-900 pt-6">
           <div className="space-y-4">
              <div>
                 <h3 className="text-xs font-black uppercase bg-slate-900 text-white px-3 py-1 inline-block">1. Analisis Kekuatan (Strengths)</h3>
                 <div className="mt-2 text-[10px] leading-relaxed text-slate-700 space-y-2 text-justify">
                    <p>• <strong>Ketersediaan Dokumen Standar:</strong> {overallStats >= 80 ? "Sebagian besar unit kerja (Tata Usaha, Perpustakaan, Laboratorium) telah melengkapi dokumen administrasi utama sesuai standar ISO manajemen mutu sekolah." : "Dokumen dasar operasional telah tersedia di hampir seluruh unit."}</p>
                    <p>• <strong>Standar Pelayanan Prima:</strong> Pelayanan administrasi kepada siswa, guru, dan tamu sekolah berjalan dengan ramah, cepat, dan sesuai Prosedur Operasional Standar (POS) yang ditetapkan.</p>
                    <p>• <strong>Inventarisasi Aset:</strong> Pencatatan barang masuk dan inventaris ruang telah dilakukan secara berkala, memudahkan tracking aset sekolah.</p>
                 </div>
              </div>
              <div>
                 <h3 className="text-xs font-black uppercase bg-slate-900 text-white px-3 py-1 inline-block">2. Analisis Kelemahan (Weaknesses)</h3>
                 <div className="mt-2 text-[10px] leading-relaxed text-slate-700 space-y-2 text-justify">
                    <p>• <strong>Integrasi Digitalisasi (E-Arsip):</strong> Sistem pengarsipan dokumen fisik ke digital (cloud storage) belum merata di semua unit. Risiko kehilangan data fisik masih cukup tinggi akibat manajemen filing yang manual.</p>
                    <p>• <strong>Pemutakhiran Data Real-time:</strong> {overallStats < 90 ? "Update data mutasi siswa dan data kepegawaian di papan data dinding sering mengalami keterlambatan dibandingkan data di aplikasi Dapodik." : "Sinkronisasi data antar unit terkadang masih mengalami jeda waktu."}</p>
                    <p>• <strong>Perawatan Sarana Penunjang:</strong> Jadwal perawatan (maintenance) berkala untuk perangkat laboratorium komputer dan IPA perlu lebih disiplin untuk mencegah kerusakan alat.</p>
                 </div>
              </div>
           </div>
           <div className="space-y-4">
              <div className="bg-blue-50 p-4 border-2 border-blue-200 rounded-xl">
                 <h3 className="text-xs font-black uppercase text-blue-900 mb-2">3. Rekomendasi Peningkatan Kedepan</h3>
                 <div className="text-[10px] leading-relaxed text-blue-800 space-y-2 text-justify">
                    <p><strong>A. Transformasi Digital Terpadu (One Data):</strong> Membangun sistem database sekolah terpusat yang dapat diakses oleh semua unit kerja untuk meminimalisir redundansi input data dan mempercepat akses informasi.</p>
                    <p><strong>B. Peningkatan Kompetensi Teknis:</strong> Mengikutsertakan tenaga kependidikan dalam pelatihan manajemen kearsipan modern dan penggunaan aplikasi perkantoran berbasis cloud secara berkala.</p>
                    <p><strong>C. Audit Internal Berkala:</strong> Melakukan audit silang antar unit kerja setiap triwulan untuk memastikan kepatuhan terhadap SOP dan menjaga akurasi data administrasi.</p>
                 </div>
              </div>
           </div>
        </div>

        <div className="mt-12 flex justify-end items-start text-xs font-bold uppercase tracking-tight px-4">
          <div className="text-center w-64">
             <p className="mb-20 uppercase">
                Mojokerto, {addWorkDays(latestSupervisionDate || new Date().toISOString(), 4)}<br/>
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

export default TendikResultsView;
