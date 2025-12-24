
import React, { useMemo } from 'react';
import { TeacherRecord, AppSettings } from '../types';

interface Props {
  records: TeacherRecord[];
  settings: AppSettings;
  onUpdate: (records: TeacherRecord[]) => void;
  onRefresh: () => void;
  setSettings: (settings: AppSettings) => void;
}

const formatIndonesianDate = (dateStr: string) => {
  if (!dateStr) return '..............................';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

const AdminResultsView: React.FC<Props> = ({ records, settings, onUpdate, setSettings }) => {
  const activeSemester = settings.semester;
  
  const filteredRecords = useMemo(() => {
    return records.filter(r => r.semester === activeSemester);
  }, [records, activeSemester]);

  const handleUpdateField = (id: number, field: 'tindakLanjut' | 'realisasi' | 'saran' | 'catatan', value: string) => {
    const updated = records.map(r => r.id === id ? { ...r, [field]: value } : r);
    onUpdate(updated);
  };

  const exportPDF = () => {
    const element = document.getElementById('admin-results-export');
    const opt = { 
      margin: 10, 
      filename: `Hasil_Supervisi_Administrasi_${activeSemester}.pdf`, 
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'landscape' } 
    };
    // @ts-ignore
    html2pdf().set(opt).from(element).save();
  };

  const exportExcel = () => {
    const table = document.getElementById('admin-results-table-real');
    if (!table) return;
    const header = "No,Nama Guru,Mata Pelajaran,Skor,Catatan,Tindak Lanjut,Realisasi,Saran\n";
    let rows = "";
    filteredRecords.forEach((r, i) => {
      rows += `${i+1},"${r.namaGuru}","${r.mataPelajaran}",${r.nilaiAdm || 0},"${r.catatan || ''}","${r.tindakLanjut || ''}","${r.realisasi || ''}","${r.saran || ''}"\n`;
    });
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Hasil_Supervisi_Adm_${activeSemester}.csv`;
    link.click();
  };

  const exportWord = () => {
    const content = document.getElementById('admin-results-export')?.innerHTML;
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Laporan</title><style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid black; padding: 5px; font-size: 10pt; }</style></head><body>";
    const footer = "</body></html>";
    const blob = new Blob([header + content + footer], { type: 'application/msword' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Hasil_Supervisi_Adm_${activeSemester}.doc`;
    link.click();
  };

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 no-print">
        <div>
           <h2 className="text-xl font-black uppercase tracking-tight">Hasil Supervisi Administrasi</h2>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Input Manual Catatan & Tindak Lanjut</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportPDF} className="px-4 py-2 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg transition-all hover:bg-red-700">PDF</button>
          <button onClick={exportWord} className="px-4 py-2 bg-blue-800 text-white rounded-xl font-black text-[10px] uppercase shadow-lg transition-all hover:bg-blue-900">Word</button>
          <button onClick={exportExcel} className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg transition-all hover:bg-emerald-700">Excel</button>
          <button onClick={() => alert('Data disimpan ke penyimpanan lokal!')} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg transition-all hover:bg-indigo-700 ml-2">Simpan Perubahan</button>
        </div>
      </div>

      <div id="admin-results-export" className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden p-8 font-serif">
        <div className="text-center border-b-2 border-slate-900 mb-8 pb-4">
          <h1 className="text-lg font-black uppercase tracking-tight">Hasil Supervisi Administrasi Perencanaan Pembelajaran</h1>
          <h2 className="text-md font-bold uppercase">{settings.namaSekolah}</h2>
          <p className="text-[10px] font-bold mt-1 italic uppercase tracking-widest">Tahun Pelajaran {settings.tahunPelajaran} • Semester {activeSemester}</p>
        </div>

        <table id="admin-results-table-real" className="w-full border-collapse text-[10px] table-auto border border-slate-800">
          <thead>
            <tr className="bg-slate-100 text-slate-900 font-black text-center uppercase">
              <th className="px-1 py-3 border border-slate-800 w-8">No</th>
              <th className="px-3 py-3 border border-slate-800 text-left">Nama Guru</th>
              <th className="px-3 py-3 border border-slate-800 text-left">Mata Pelajaran</th>
              <th className="px-2 py-3 border border-slate-800 w-16">Skor</th>
              <th className="px-3 py-3 border border-slate-800 text-left">Catatan Khusus</th>
              <th className="px-3 py-3 border border-slate-800 text-left">Tindak Lanjut</th>
              <th className="px-3 py-3 border border-slate-800 text-left">Realisasi</th>
              <th className="px-3 py-3 border border-slate-800 text-left">Saran</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRecords.map((r, i) => (
              <tr key={r.id} className="align-top hover:bg-slate-50 transition-colors">
                <td className="px-1 py-3 border border-slate-800 text-center font-bold text-slate-400">{i + 1}</td>
                <td className="px-3 py-3 border border-slate-800 font-black text-slate-900 uppercase leading-tight">{r.namaGuru}</td>
                <td className="px-3 py-3 border border-slate-800 italic text-indigo-700 font-medium">{r.mataPelajaran}</td>
                <td className="px-2 py-3 border border-slate-800 text-center font-black text-blue-600 bg-blue-50/30">{r.nilaiAdm || '0'}</td>
                <td className="px-3 py-1 border border-slate-800">
                  <textarea value={r.catatan || ''} onChange={e => handleUpdateField(r.id, 'catatan', e.target.value)} className="w-full bg-transparent outline-none text-[9px] min-h-[40px] no-print py-1" placeholder="..." />
                  <div className="hidden print:block text-[9px] italic">{r.catatan || '-'}</div>
                </td>
                <td className="px-3 py-1 border border-slate-800">
                  <textarea value={r.tindakLanjut || ''} onChange={e => handleUpdateField(r.id, 'tindakLanjut', e.target.value)} className="w-full bg-transparent outline-none text-[9px] min-h-[40px] no-print py-1" placeholder="..." />
                  <div className="hidden print:block text-[9px] italic">{r.tindakLanjut || '-'}</div>
                </td>
                <td className="px-3 py-1 border border-slate-800">
                  <textarea value={r.realisasi || ''} onChange={e => handleUpdateField(r.id, 'realisasi', e.target.value)} className="w-full bg-transparent outline-none text-[9px] min-h-[40px] no-print py-1" placeholder="..." />
                  <div className="hidden print:block text-[9px] italic">{r.realisasi || '-'}</div>
                </td>
                <td className="px-3 py-1 border border-slate-800">
                  <textarea value={r.saran || ''} onChange={e => handleUpdateField(r.id, 'saran', e.target.value)} className="w-full bg-transparent outline-none text-[9px] min-h-[40px] no-print py-1" placeholder="..." />
                  <div className="hidden print:block text-[9px] italic">{r.saran || '-'}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-12 flex justify-between items-start text-xs font-bold uppercase tracking-tight px-4">
          <div className="text-center w-64">
             <p className="mb-20">Mengetahui,<br/>Kepala {settings.namaSekolah}</p>
             <p className="font-black underline">{settings.namaKepalaSekolah}</p>
             <p className="text-[10px] font-mono tracking-tighter">NIP. {settings.nipKepalaSekolah}</p>
          </div>
          <div className="text-center w-64">
             <p className="mb-20">Mojokerto, {formatIndonesianDate(new Date().toISOString())}<br/>Supervisor</p>
             <p className="font-black underline uppercase tracking-widest">................................................</p>
             <p className="text-[10px] font-mono tracking-tighter">NIP. ................................................</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminResultsView;
