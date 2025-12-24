
import React, { useState, useMemo, useEffect } from 'react';
import { AppSettings, TeacherRecord, InstrumentResult } from '../types';

interface ObsItem { id: number; label: string; }
interface ObsGroup { no: string; title: string; items: ObsItem[]; }

const GROUPS: ObsGroup[] = [
  { no: "1", title: "Tahap Persiapan Observasi", items: [ 
    { id: 1, label: "Kesiapan Dokumen Modul Ajar (MA) / RPP." }, 
    { id: 2, label: "Kesesuaian konsep/tema yang akan dibahas." },
    { id: 3, label: "Kesiapan media dan sumber belajar." },
    { id: 4, label: "Kejelasan alur dan langkah pembelajaran." } 
  ] },
  { no: "2", title: "Tahap Pelaksanaan Observasi", items: [ 
    { id: 7, label: "Kejelasan penyampaian konsep materi." }, 
    { id: 8, label: "Tingkat keberhasilan interaksi siswa." },
    { id: 9, label: "Ketepatan waktu sesuai alokasi jadwal." },
    { id: 10, label: "Efektivitas penggunaan alat peraga/media IT." },
    { id: 11, label: "Kemampuan guru merespon kesulitan siswa." }
  ] }
];

const formatIndonesianDate = (dateStr?: string) => {
  if (!dateStr) return '..............................';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

interface Props {
  settings: AppSettings; setSettings: (s: AppSettings) => void; records: TeacherRecord[]; instrumentResults: Record<string, InstrumentResult>; onSave: (teacherId: number, type: string, semester: string, data: InstrumentResult) => void;
}

const ObservationResultsView: React.FC<Props> = ({ settings, setSettings, records, instrumentResults, onSave }) => {
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | ''>('');
  const [scores, setScores] = useState<Record<number, number>>({});

  const selectedTeacher = useMemo(() => records.find(t => t.id === selectedTeacherId), [selectedTeacherId, records]);

  useEffect(() => {
    if (selectedTeacherId !== '') {
      const key = `${selectedTeacherId}-hasil-observasi-${settings.semester}`;
      const saved = instrumentResults[key];
      if (saved) {
        setScores(saved.scores as any || {});
      } else {
        setScores({});
      }
    }
  }, [selectedTeacherId, settings.semester, instrumentResults]);

  const stats = useMemo(() => {
    const scoreValues = Object.values(scores).filter(v => typeof v === 'number') as number[];
    const totalScore = scoreValues.reduce((sum, s) => sum + s, 0);
    const average = scoreValues.length > 0 ? (totalScore / scoreValues.length).toFixed(2) : '0.00';
    return { totalScore, average };
  }, [scores]);

  const exportPDF = () => {
    const element = document.getElementById('obs-results-export');
    // @ts-ignore
    html2pdf().from(element).save(`HasilObs_${selectedTeacher?.namaGuru || 'Guru'}_${settings.semester}.pdf`);
  };

  const exportWord = () => {
    const content = document.getElementById('obs-results-export')?.innerHTML;
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid black; padding: 5px; font-size: 10pt; }</style></head><body>";
    const footer = "</body></html>";
    const blob = new Blob([header + content + footer], { type: 'application/msword' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Hasil_Observasi_${selectedTeacher?.namaGuru || 'Guru'}_${settings.semester}.doc`;
    link.click();
  };

  const supervisorName = selectedTeacher?.pewawancara || settings.namaKepalaSekolah;
  const supervisorNIP = records.find(r => r.namaGuru === supervisorName)?.nip || (supervisorName === settings.namaKepalaSekolah ? settings.nipKepalaSekolah : '....................');

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center no-print bg-white p-4 rounded-2xl shadow-sm border border-slate-100 gap-4">
        <div className="flex items-center gap-3">
          <select value={selectedTeacherId} onChange={(e) => setSelectedTeacherId(Number(e.target.value))} className="px-4 py-2 border rounded-xl font-bold text-blue-600 outline-none uppercase text-xs">
            <option value="">-- PILIH GURU --</option>
            {records.map(t => <option key={t.id} value={t.id}>{t.namaGuru}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
            <button onClick={exportPDF} className="px-4 py-2 bg-red-600 text-white rounded-lg font-black text-[9px] uppercase shadow">PDF</button>
            <button onClick={exportWord} className="px-4 py-2 bg-indigo-800 text-white rounded-lg font-black text-[9px] uppercase shadow">Word</button>
            <button onClick={() => onSave(selectedTeacherId as number, 'hasil-observasi', settings.semester, { scores, remarks: {} })} disabled={!selectedTeacher} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-black text-[10px] uppercase">Simpan</button>
        </div>
      </div>

      <div id="obs-results-export" className="bg-white shadow-xl border border-slate-300 p-12 max-w-5xl mx-auto text-gray-900 font-serif">
        <div className="text-center mb-10 border-b-4 border-double border-slate-900 pb-4 uppercase">
          <h1 className="text-xl font-black leading-none tracking-widest">SUMMARY HASIL OBSERVASI</h1>
          <h2 className="text-lg font-bold mt-1 tracking-tight">HASIL PENGAMATAN KELAS</h2>
          <p className="text-[11px] font-bold mt-1 italic tracking-widest opacity-75">{settings.namaSekolah} • Semester {settings.semester} • TP {settings.tahunPelajaran}</p>
        </div>

        <div className="grid grid-cols-1 gap-y-1 text-sm font-bold mb-8">
           <div className="flex items-start"><span className="w-40 uppercase">Nama Guru</span><span className="mr-4">:</span><span className="uppercase text-blue-800">{selectedTeacher?.namaGuru || '...................'}</span></div>
           <div className="flex items-start"><span className="w-40 uppercase">Mata Pelajaran</span><span className="mr-4">:</span><span className="italic">{selectedTeacher?.mataPelajaran || '...................'}</span></div>
           <div className="flex items-start"><span className="w-40 uppercase">Pewawancara</span><span className="mr-4">:</span><span>{supervisorName}</span></div>
        </div>

        <table className="w-full border-collapse border-2 border-slate-900 text-[11px]">
          <thead>
            <tr className="bg-slate-100 font-black uppercase text-center">
              <th className="border-2 border-slate-900 p-3 w-12">No</th>
              <th className="border-2 border-slate-900 p-3 text-left">Komponen Analisis Observasi</th>
              <th className="border-2 border-slate-900 p-1 w-48">Kualitas Skor (1-5)</th>
              <th className="border-2 border-slate-900 p-3 w-32">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {GROUPS.map((group, gIdx) => (
              <React.Fragment key={gIdx}>
                <tr className="bg-slate-50 font-black"><td className="border-2 border-slate-900 p-2 text-center">{group.no}.</td><td colSpan={3} className="border-2 border-slate-900 p-2 uppercase italic">{group.title}</td></tr>
                {group.items.map((item) => (
                  <tr key={item.id}>
                    <td className="border-2 border-slate-900 p-2 text-center font-bold text-slate-500">{item.id}.</td>
                    <td className="border-2 border-slate-900 p-2 font-bold text-slate-800">{item.label}</td>
                    <td className="border-2 border-slate-900 p-1">
                       <div className="flex justify-center gap-1 no-print">
                          {[1,2,3,4,5].map(v => (
                             <button key={v} onClick={() => setScores({...scores, [item.id]: v})} className={`w-7 h-7 rounded border font-bold text-[10px] ${scores[item.id] === v ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400'}`}>{v}</button>
                          ))}
                       </div>
                       <div className="hidden print:block text-center font-black text-lg">{scores[item.id] || '-'}</div>
                    </td>
                    <td className="border-2 border-slate-900 p-2 text-center text-xs font-medium">
                       {scores[item.id] >= 5 ? "Ekselen" : scores[item.id] >= 4 ? "Baik" : scores[item.id] >= 3 ? "Cukup" : scores[item.id] >= 2 ? "Kurang" : "Sangat Kurang"}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
            <tr className="bg-slate-900 text-white font-black">
               <td colSpan={2} className="border-2 border-slate-800 p-3 text-right uppercase tracking-widest text-xs italic">Skor Rata-rata Observasi</td>
               <td className="border-2 border-slate-800 p-2 text-center text-xl bg-indigo-700">{stats.average}</td>
               <td className="border-2 border-slate-800 p-2 text-center uppercase tracking-tighter text-[10px]">
                  {parseFloat(stats.average) >= 4.5 ? 'SANGAT BAIK' : parseFloat(stats.average) >= 3.5 ? 'BAIK' : 'CUKUP'}
               </td>
            </tr>
          </tbody>
        </table>

        {/* Tanda Tangan: 3 Kolom (Principal, Supervisor, Teacher) */}
        <div className="mt-16 grid grid-cols-3 gap-4 text-xs font-bold uppercase tracking-tight px-4 text-center break-inside-avoid">
          <div className="flex flex-col justify-between h-32">
             <p className="uppercase">
                Mengetahui,<br/>
                Kepala Sekolah
             </p>
             <div>
               <p className="font-black underline text-sm uppercase">{settings.namaKepalaSekolah}</p>
               <p className="text-[10px] font-mono tracking-tighter uppercase">NIP. {settings.nipKepalaSekolah}</p>
             </div>
          </div>
          <div className="flex flex-col justify-between h-32">
            {supervisorName !== settings.namaKepalaSekolah ? (
              <>
                 <p className="uppercase">Supervisor</p>
                 <div>
                   <p className="font-black underline text-sm uppercase">{supervisorName}</p>
                   <p className="text-[10px] font-mono tracking-tighter uppercase">NIP. {supervisorNIP}</p>
                 </div>
              </>
            ) : <div></div>}
          </div>
          <div className="flex flex-col justify-between h-32">
             <p className="uppercase">
                Mojokerto, {formatIndonesianDate(selectedTeacher?.tanggalPemb)}<br/>
                Guru yang di Supervisi
             </p>
             <div>
               <p className="font-black underline text-sm uppercase">{selectedTeacher?.namaGuru || '....................'}</p>
               <p className="text-[10px] font-mono tracking-tighter uppercase">NIP. {selectedTeacher?.nip || '....................'}</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ObservationResultsView;
