
import React, { useState, useEffect, useMemo } from 'react';
import { AppSettings, InstrumentResult, ExtraRecord } from '../types';

interface ExtraItem {
  id: string;
  label: string;
  type: 'BCKT' | 'YATIDAK';
  isHeader?: boolean;
}

const ITEMS: ExtraItem[] = [
  { id: '1a', label: 'Pembuatan Program Kegiatan Tahunan', type: 'BCKT' },
  { id: '1b', label: 'Konsep Perencanaan dan Langkah Pelaksanaan', type: 'BCKT' },
  { id: '2h1', label: 'Kegiatan Pendahuluan', type: 'BCKT', isHeader: true },
  { id: '2a', label: 'Apersepsi / Penguasaan Lapangan', type: 'BCKT' },
  { id: '2b', label: 'Pemberian Motivasi Siswa', type: 'BCKT' },
  { id: '2c', label: 'Penyampaian Tujuan dan Target Latihan', type: 'BCKT' },
  { id: '2h2', label: 'Pelaksanaan Lapangan / Penyampaian Materi', type: 'BCKT', isHeader: true },
  { id: '2d', label: 'Tertib Presensi Kehadiran Siswa', type: 'BCKT' },
  { id: '2e', label: 'Kemampuan Menyampaikan Materi Ekstra', type: 'BCKT' },
  { id: '2f', label: 'Kemampuan Pembimbingan Teknis', type: 'BCKT' },
  { id: '2g', label: 'Kemampuan Pengelolaan Kelompok', type: 'BCKT' },
  { id: '2h', label: 'Pemberian Reward / Penguatan Positif', type: 'BCKT' },
  { id: '2h3', label: 'Kegiatan Penutup', type: 'BCKT', isHeader: true },
  { id: '2i', label: 'Pemberian Penguatan Motivasi Akhir', type: 'BCKT' },
  { id: '2j', label: 'Pemberian Pemantapan dan Evaluasi', type: 'BCKT' },
  { id: '2k', label: 'Sesuai Skenario / Konsep Awal', type: 'YATIDAK' },
  { id: '2l', label: 'Sesuai Alokasi Waktu yang Tersedia', type: 'YATIDAK' },
  { id: '2m', label: 'Penggunaan Media / Alat Pendukung', type: 'YATIDAK' },
  { id: '2n', label: 'Tingkat Antusiasme Siswa', type: 'YATIDAK' },
  { id: '2o', label: 'Pendekatan Berpusat pada Siswa', type: 'YATIDAK' },
  { id: '2p', label: 'Interaksi Terpusat pada Pembina', type: 'YATIDAK' }
];

const getAutoExtraCatatan = (percentage: number) => {
  if (percentage >= 91) return "Sangat Baik. Pembina menunjukkan dedikasi tinggi, program kerja sangat terukur, and antusiasme siswa sangat luar biasa.";
  if (percentage >= 76) return "Baik. Pelaksanaan kegiatan ekstrakurikuler sudah berjalan sesuai jadwal and tujuan, namun perlu pengayaan variasi metode.";
  if (percentage >= 60) return "Cukup. Pembinaan sudah dilakukan, namun administrasi and koordinasi lapangan perlu ditingkatkan agar lebih efektif.";
  return "Kurang. Diperlukan peninjauan ulang terhadap program kerja and metode pembimbingan agar minat siswa tetap terjaga.";
};

interface Props {
  settings: AppSettings;
  setSettings: (s: AppSettings) => void;
  extraRecords: ExtraRecord[];
  instrumentResults: Record<string, InstrumentResult>;
  onSave: (key: string, data: InstrumentResult) => void;
}

const InstrumentExtraView: React.FC<Props> = ({ settings, setSettings, extraRecords, instrumentResults, onSave }) => {
  const activeSemester = settings.semester;
  const [selectedExtraId, setSelectedExtraId] = useState<number | ''>('');
  const [scores, setScores] = useState<Record<string, string>>({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [catatan, setCatatan] = useState('');

  const selectedRecord = useMemo(() => 
    extraRecords.find(r => r.id === selectedExtraId), 
    [selectedExtraId, extraRecords]
  );

  const storageKey = selectedExtraId ? `extra-${selectedExtraId}-${activeSemester}` : '';

  useEffect(() => {
    if (storageKey && instrumentResults[storageKey]) {
      const saved = instrumentResults[storageKey];
      setScores(saved.scores as any || {});
      setRemarks(saved.remarks as any || {});
      setCatatan(saved.catatan || '');
    } else {
      setScores({}); setRemarks({}); setCatatan('');
    }
  }, [storageKey, instrumentResults]);

  const stats = useMemo(() => {
    const vals = Object.values(scores).map(v => {
      if (v === 'B') return 3; if (v === 'C') return 2; if (v === 'K') return 1; if (v === 'T') return 0;
      if (v === 'YA') return 3; if (v === 'TIDAK') return 0;
      return 0;
    });
    const total = vals.reduce((a, b) => a + b, 0);
    const max = 3 * ITEMS.filter(i => !i.isHeader).length;
    const perc = max > 0 ? Math.round((total / max) * 100) : 0;
    return { perc, total, max };
  }, [scores]);

  useEffect(() => {
    if (Object.keys(scores).length > 0) {
      setCatatan(getAutoExtraCatatan(stats.perc));
    }
  }, [stats.perc]);

  const handleScoreChange = (id: string, val: string) => {
    setScores(prev => ({ ...prev, [id]: val }));
    let rem = val === 'B' ? "Sangat Baik" : val === 'C' ? "Cukup" : val === 'K' ? "Kurang" : val === 'YA' ? "Ya" : val === 'TIDAK' ? "Tidak" : "Tidak Teramati";
    setRemarks(prev => ({ ...prev, [id]: rem }));
  };

  const exportPDF = () => {
    const element = document.getElementById('extra-instr-export');
    // @ts-ignore
    html2pdf().from(element).save(`Supervisi_Ekstra_${selectedRecord?.nama || 'Pembina'}_${activeSemester}.pdf`);
  };

  const exportWord = () => {
    const content = document.getElementById('extra-instr-export')?.innerHTML;
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid black; padding: 5px; font-size: 9pt; }</style></head><body>";
    const footer = "</body></html>";
    const blob = new Blob([header + content + footer], { type: 'application/msword' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Supervisi_Ekstra_${selectedRecord?.nama || 'Pembina'}_${activeSemester}.doc`;
    link.click();
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center no-print bg-white p-4 rounded-2xl shadow-sm border border-slate-100 gap-4">
        <div className="flex items-center gap-3">
          <select value={selectedExtraId} onChange={e => setSelectedExtraId(Number(e.target.value))} className="px-4 py-2 border rounded-xl font-black text-blue-600 text-xs uppercase outline-none">
            <option value="">-- PILIH PEMBINA --</option>
            {extraRecords.filter(r => r.semester === activeSemester).map(r => <option key={r.id} value={r.id}>{r.nama} ({r.ekstra})</option>)}
          </select>
        </div>
        <div className="flex gap-2">
            <button onClick={exportWord} className="px-4 py-2 bg-indigo-800 text-white rounded-xl font-black text-[10px] uppercase shadow-lg">Word</button>
            <button onClick={exportPDF} className="px-4 py-2 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg">PDF</button>
            <button onClick={() => onSave(storageKey, { scores: scores as any, remarks: remarks as any, catatan })} disabled={!selectedExtraId} className="px-6 py-2 bg-purple-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg ml-2">Simpan Hasil</button>
        </div>
      </div>

      <div id="extra-instr-export" className="bg-white shadow-xl border border-slate-300 p-12 max-w-5xl mx-auto text-gray-900 font-serif">
        <div className="text-center mb-10 border-b-4 border-double border-slate-900 pb-4 uppercase">
          <h1 className="text-xl font-black leading-none tracking-widest">INSTRUMEN SUPERVISI EKSTRAKURIKULER</h1>
          <p className="text-[11px] font-bold mt-1 italic tracking-widest opacity-75">{settings.namaSekolah} • TP {settings.tahunPelajaran}</p>
        </div>

        <div className="grid grid-cols-1 gap-y-1 text-sm font-bold mb-8">
           <div className="flex items-start"><span className="w-40 uppercase">Pembina</span><span className="mr-4">:</span><span className="uppercase text-purple-800">{selectedRecord?.nama || '...................'}</span></div>
           <div className="flex items-start"><span className="w-40 uppercase">Ekstrakurikuler</span><span className="mr-4">:</span><span className="italic text-purple-800">{selectedRecord?.ekstra || '...................'}</span></div>
           <div className="flex items-start"><span className="w-40 uppercase">Hari / Tanggal</span><span className="mr-4">:</span><span className="">{selectedRecord ? `${selectedRecord.hari}, ${selectedRecord.tgl}` : '...................'}</span></div>
        </div>

        <table className="w-full border-collapse border-2 border-slate-900 text-[11px]">
          <thead>
            <tr className="bg-slate-100 font-black uppercase text-center">
              <th rowSpan={2} className="border-2 border-slate-900 p-2 w-10">NO</th>
              <th rowSpan={2} className="border-2 border-slate-900 p-2 text-left">Aspek Pengamatan Pembinaan</th>
              <th colSpan={4} className="border-2 border-slate-900 p-1">Skor Kinerja</th>
              <th rowSpan={2} className="border-2 border-slate-900 p-2 w-32">Keterangan</th>
            </tr>
            <tr className="bg-slate-800 text-white font-bold text-[9px]">
              <th className="border-2 border-slate-900">B</th>
              <th className="border-2 border-slate-900">C</th>
              <th className="border-2 border-slate-900">K</th>
              <th className="border-2 border-slate-900">T</th>
            </tr>
          </thead>
          <tbody>
            {ITEMS.map((item, idx) => {
               if (item.isHeader) return <tr key={item.id} className="bg-slate-100 font-black italic"><td className="border-2 border-slate-900 text-center"></td><td colSpan={5} className="border-2 border-slate-900 p-1 pl-4 uppercase tracking-tighter">{item.label}</td></tr>;
               return (
                 <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                   <td className="border-2 border-slate-900 p-2 text-center font-bold text-slate-500">{idx + 1}.</td>
                   <td className="border-2 border-slate-900 p-2 font-bold text-slate-800">{item.label}</td>
                   {item.type === 'YATIDAK' ? (
                     <>
                        <td colSpan={2} className="border-2 border-slate-900 p-1 text-center cursor-pointer no-print" onClick={() => handleScoreChange(item.id, 'YA')}>
                          <div className={`w-full py-1 border-2 rounded-xl text-[9px] font-black ${scores[item.id] === 'YA' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-100'}`}>YA {scores[item.id] === 'YA' && "v"}</div>
                        </td>
                        <td colSpan={2} className="border-2 border-slate-900 p-1 text-center cursor-pointer no-print" onClick={() => handleScoreChange(item.id, 'TIDAK')}>
                          <div className={`w-full py-1 border-2 rounded-xl text-[9px] font-black ${scores[item.id] === 'TIDAK' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-100'}`}>TIDAK {scores[item.id] === 'TIDAK' && "v"}</div>
                        </td>
                        <td colSpan={2} className="border-2 border-slate-900 p-1 text-center hidden print:table-cell font-black">YA: {scores[item.id] === 'YA' ? "v" : ""}</td>
                        <td colSpan={2} className="border-2 border-slate-900 p-1 text-center hidden print:table-cell font-black">TDK: {scores[item.id] === 'TIDAK' ? "v" : ""}</td>
                     </>
                   ) : (
                     ['B', 'C', 'K', 'T'].map(val => (
                        <td key={val} className="border-2 border-slate-900 p-1 text-center cursor-pointer no-print" onClick={() => handleScoreChange(item.id, val)}>
                           <div className={`w-5 h-5 mx-auto border-2 border-slate-900 flex items-center justify-center ${scores[item.id] === val ? 'bg-slate-900 text-white font-black' : 'bg-white'}`}>{scores[item.id] === val && "v"}</div>
                        </td>
                     ))
                   )}
                   {item.type !== 'YATIDAK' && ['B', 'C', 'K', 'T'].map(val => (
                      <td key={`p-${val}`} className="border-2 border-slate-900 p-1 text-center hidden print:table-cell font-black">{scores[item.id] === val ? "v" : ""}</td>
                   ))}
                   <td className="border-2 border-slate-900 p-1 italic text-slate-500 text-[9px]">{remarks[item.id]}</td>
                 </tr>
               );
            })}
            <tr className="bg-slate-900 text-white font-black">
               <td colSpan={2} className="border-2 border-slate-800 p-3 text-right uppercase tracking-widest text-xs italic">Tingkat Ketercapaian Kinerja (%)</td>
               <td colSpan={4} className="border-2 border-slate-800 p-2 text-center text-xl bg-purple-700">{stats.perc}%</td>
               <td className="border-2 border-slate-800 p-2 text-center uppercase tracking-tighter text-[10px] bg-slate-800">
                  {stats.perc >= 91 ? "Sangat Baik" : stats.perc >= 76 ? "Baik" : "Cukup"}
               </td>
            </tr>
          </tbody>
        </table>

        <div className="mt-16 flex justify-between items-start text-xs font-bold uppercase tracking-tight px-4 text-center">
          <div className="w-64">
             <p className="mb-24 uppercase">
                Mojokerto, {selectedRecord?.tgl || '................'}<br/>
                Kepala {settings.namaSekolah}
             </p>
             <div>
               <p className="font-black underline text-sm uppercase">{settings.namaKepalaSekolah}</p>
               <p className="text-[10px] font-mono tracking-tighter uppercase">NIP. {settings.nipKepalaSekolah}</p>
             </div>
          </div>
          <div className="w-64">
             <p className="mb-20 uppercase">Pembina yang di Supervisi</p>
             <div>
               <p className="font-black underline text-sm uppercase">{selectedRecord?.nama || '....................'}</p>
               <p className="text-[10px] font-mono tracking-tighter uppercase">NIP. {selectedRecord?.nip || '....................'}</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstrumentExtraView;
