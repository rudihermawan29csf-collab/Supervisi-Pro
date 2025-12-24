
import React, { useMemo } from 'react';
import { AppSettings, TeacherRecord, AdminRecord, ExtraRecord, InstrumentResult } from '../types';

interface Props {
  type: 'akademik' | 'tendik' | 'extra';
  settings: AppSettings;
  records?: TeacherRecord[];
  adminRecords?: AdminRecord[];
  extraRecords?: ExtraRecord[];
  instrumentResults?: Record<string, InstrumentResult>;
}

const LaporanDocView: React.FC<Props> = ({ type, settings, records, adminRecords, extraRecords, instrumentResults }) => {
  const exportPDF = () => {
    const element = document.getElementById('report-doc-export');
    // @ts-ignore
    html2pdf().from(element).save(`Laporan_Supervisi_${type}_${settings.semester}.pdf`);
  };

  const stats = useMemo(() => {
    if (type === 'akademik' && records) {
      const data = records.filter(r => r.semester === settings.semester && r.nilai && r.nilai > 0);
      const avg = data.length > 0 ? (data.reduce((s, r) => s + (r.nilai || 0), 0) / data.length).toFixed(1) : 0;
      return { count: data.length, total: records.length, avg };
    }
    return { count: 0, total: 0, avg: 0 };
  }, [type, records, settings.semester]);

  const reportTitle = type === 'akademik' ? 'LAPORAN HASIL SUPERVISI AKADEMIK' : 
                      type === 'tendik' ? 'LAPORAN HASIL SUPERVISI TENAGA KEPENDIDIKAN' : 
                      'LAPORAN HASIL SUPERVISI EKSTRAKURIKULER';

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      <div className="flex justify-end no-print">
        <button onClick={exportPDF} className="px-6 py-2 bg-rose-600 text-white rounded-xl font-bold text-xs shadow-lg flex items-center transition-all hover:bg-rose-700">
           <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" strokeWidth="2"/></svg>
           Download Laporan (PDF)
        </button>
      </div>

      <div id="report-doc-export" className="bg-white shadow-xl border border-slate-300 p-16 max-w-5xl mx-auto text-gray-900 font-serif leading-relaxed">
        <div className="text-center mb-10 border-b-4 border-double border-slate-900 pb-4">
          <h1 className="text-2xl font-black uppercase tracking-tight">{reportTitle}</h1>
          <h2 className="text-xl font-bold uppercase mt-1">{settings.namaSekolah}</h2>
          <p className="text-sm font-bold mt-1 italic uppercase underline">REKAPITULASI DAN EVALUASI HASIL PELAKSANAAN</p>
        </div>

        {type === 'akademik' && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-50 p-4 border rounded-lg text-center">
              <p className="text-[10px] font-bold uppercase text-slate-500">Total Objek</p>
              <p className="text-2xl font-bold">{stats.total} Guru</p>
            </div>
            <div className="bg-slate-50 p-4 border rounded-lg text-center">
              <p className="text-[10px] font-bold uppercase text-slate-500">Terlaksana</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.count} Selesai</p>
            </div>
            <div className="bg-slate-50 p-4 border rounded-lg text-center">
              <p className="text-[10px] font-bold uppercase text-slate-500">Nilai Rata-rata</p>
              <p className="text-2xl font-bold text-blue-600">{stats.avg}</p>
            </div>
          </div>
        )}

        <section className="mb-8">
           <h3 className="font-bold border-b mb-3 uppercase text-sm tracking-widest italic">A. Ringkasan Hasil</h3>
           <table className="w-full border-collapse border-2 border-slate-800 text-[10px]">
              <thead>
                 <tr className="bg-slate-900 text-white uppercase">
                    <th className="border border-slate-700 p-2 w-10 text-center">No</th>
                    <th className="border border-slate-700 p-2 text-left">Nama Lengkap</th>
                    <th className="border border-slate-700 p-2 text-center">Nilai</th>
                    <th className="border border-slate-700 p-2 text-center">Predikat</th>
                    <th className="border border-slate-700 p-2 text-left">Rekomendasi Utama</th>
                 </tr>
              </thead>
              <tbody>
                 {type === 'akademik' && records?.filter(r => r.semester === settings.semester).map((r, i) => (
                    <tr key={r.id}>
                       <td className="border border-slate-800 p-2 text-center">{i+1}</td>
                       <td className="border border-slate-800 p-2 font-bold uppercase">{r.namaGuru}</td>
                       <td className="border border-slate-800 p-2 text-center font-black">{r.nilai || 0}</td>
                       <td className="border border-slate-800 p-2 text-center">{r.nilai && r.nilai >= 91 ? 'A' : r.nilai && r.nilai >= 81 ? 'B' : 'C'}</td>
                       <td className="border border-slate-800 p-2 italic">{r.tindakLanjut || '-'}</td>
                    </tr>
                 ))}
                 {(type === 'tendik' || type === 'extra') && (
                    <tr><td colSpan={5} className="p-10 text-center italic text-slate-400">Data rekapitulasi nilai sedang diproses berdasarkan instrumen terisi.</td></tr>
                 )}
              </tbody>
           </table>
        </section>

        <section className="mb-8">
           <h3 className="font-bold border-b mb-2 uppercase text-sm tracking-widest italic">B. Kesimpulan Umum</h3>
           <p className="text-[12px] text-justify leading-relaxed">Secara keseluruhan, pelaksanaan tugas di unit {type.toUpperCase()} pada semester {settings.semester} menunjukkan tren yang positif. Sebagian besar standar pelayanan minimal (SPM) telah terpenuhi. Namun, diperlukan peningkatan pada aspek inovasi digital dan dokumentasi berkala guna menunjang transparansi kinerja sekolah.</p>
        </section>

        <div className="mt-20 flex justify-between items-start text-sm font-bold text-center leading-relaxed">
            <div className="w-64">
               <p className="mb-24 uppercase">Mengetahui,<br/>Pengawas Sekolah</p>
               <p className="underline uppercase font-black">{settings.namaPengawas}</p>
               <p className="text-xs uppercase">NIP. {settings.nipPengawas}</p>
            </div>
            <div className="w-64">
               <p className="mb-24">Mojokerto, {new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}<br/>Kepala {settings.namaSekolah}</p>
               <p className="underline uppercase font-black">{settings.namaKepalaSekolah}</p>
               <p className="text-xs uppercase">NIP. {settings.nipKepalaSekolah}</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LaporanDocView;
