
import React, { useState, useMemo, useEffect } from 'react';
import { AppSettings, TeacherRecord, InstrumentResult } from '../types';

const COMPONENTS_LIST = [
  "Kalender Pendidikan", "Rencana Pekan Efektif (RPE)", "Program Tahunan", "Program Semester",
  "Alur Tujuan Pembelajaran", "Modul Ajar", "Jadwal Tatap Muka", "Jurnal Mengajar",
  "Daftar Nilai", "KKTP", "Absensi Siswa", "Buku Pegangan Guru", "Buku Teks Siswa"
];

const formatIndonesianDate = (dateStr?: string) => {
  if (!dateStr) return '..............................';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

const getAutoFeedback = (percentage: number) => {
  if (percentage >= 91) return { catatan: "Dokumen administrasi pembelajaran tersusun sangat lengkap, sistematis, dan mutakhir sesuai kurikulum.", tindakLanjut: "Pertahankan kualitas administrasi dan bagikan praktik baik penyusunan dokumen kepada rekan sejawat." };
  if (percentage >= 81) return { catatan: "Dokumen administrasi sudah lengkap dan memenuhi standar minimal.", tindakLanjut: "Tingkatkan ketelitian dalam penyusunan beberapa lampiran pendukung." };
  if (percentage >= 71) return { catatan: "Administrasi pembelajaran cukup lengkap, namun beberapa dokumen perlu revisi.", tindakLanjut: "Lengkapi dan perbaiki dokumen yang masih berstatus kurang sesuai." };
  return { catatan: "Kelengkapan administrasi pembelajaran masih kurang memadai.", tindakLanjut: "Segera susun dan lengkapi perangkat pembelajaran utama." };
};

interface Props {
  settings: AppSettings;
  setSettings: (s: AppSettings) => void;
  records: TeacherRecord[];
  instrumentResults: Record<string, InstrumentResult>;
  onSave: (teacherId: number, type: string, semester: string, data: InstrumentResult) => void;
}

const AdministrasiPembelajaran: React.FC<Props> = ({ settings, setSettings, records, instrumentResults, onSave }) => {
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | ''>('');
  const [scores, setScores] = useState<Record<number, number>>({});
  const [catatan, setCatatan] = useState('');
  const [tindakLanjut, setTindakLanjut] = useState('');

  const selectedTeacher = useMemo(() => records.find(t => t.id === selectedTeacherId), [selectedTeacherId, records]);

  const stats = useMemo(() => {
    const scoreValues = Object.values(scores) as number[];
    const total = scoreValues.reduce((a, b) => a + b, 0);
    const perc = Math.round((total / 26) * 100);
    let pred = perc >= 91 ? "Sangat Baik" : perc >= 81 ? "Baik" : perc >= 71 ? "Cukup" : "Kurang";
    return { total, perc, pred };
  }, [scores]);

  useEffect(() => {
    if (Object.keys(scores).length > 0) {
      const feedback = getAutoFeedback(stats.perc);
      setCatatan(feedback.catatan); 
      setTindakLanjut(feedback.tindakLanjut);
    }
  }, [stats.perc]);

  useEffect(() => {
    if (selectedTeacherId !== '') {
      const key = `${selectedTeacherId}-administrasi-${settings.semester}`;
      const saved = instrumentResults[key];
      if (saved) {
        setScores(saved.scores as any || {}); 
        if (saved.catatan) setCatatan(saved.catatan);
        if (saved.tindakLanjut) setTindakLanjut(saved.tindakLanjut);
      } else {
        setScores({}); setCatatan(''); setTindakLanjut('');
      }
    }
  }, [selectedTeacherId, settings.semester, instrumentResults]);

  const handleScore = (idx: number, val: number) => setScores(p => ({ ...p, [idx]: val }));

  const exportPDF = () => {
    const element = document.getElementById('adm-pemb-export');
    // @ts-ignore
    html2pdf().from(element).save(`Adm_Pembelajaran_${selectedTeacher?.namaGuru || 'Guru'}_${settings.semester}.pdf`);
  };

  const exportWord = () => {
    const content = document.getElementById('adm-pemb-export')?.innerHTML;
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid black; padding: 5px; font-size: 10pt; }</style></head><body>";
    const footer = "</body></html>";
    const blob = new Blob([header + content + footer], { type: 'application/msword' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Adm_Pembelajaran_${selectedTeacher?.namaGuru || 'Guru'}_${settings.semester}.doc`;
    link.click();
  };

  const supervisorName = selectedTeacher?.pewawancara || settings.namaKepalaSekolah;
  const supervisorNIP = records.find(r => r.namaGuru === supervisorName)?.nip || (supervisorName === settings.namaKepalaSekolah ? settings.nipKepalaSekolah : '....................');

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-2xl shadow-sm no-print gap-4 border border-slate-100">
        <div className="flex items-center gap-3">
          <select value={selectedTeacherId} onChange={e => setSelectedTeacherId(Number(e.target.value))} className="px-4 py-2 border rounded-xl font-black text-blue-600 text-xs uppercase tracking-tight outline-none">
            <option value="">-- PILIH GURU --</option>
            {records.map(t => <option key={t.id} value={t.id}>{t.namaGuru}</option>)}
          </select>
          <div className="flex bg-slate-200 p-1 rounded-xl shadow-inner">
             <button onClick={() => setSettings({...settings, semester: 'Ganjil'})} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase ${settings.semester === 'Ganjil' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>Ganjil</button>
             <button onClick={() => setSettings({...settings, semester: 'Genap'})} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase ${settings.semester === 'Genap' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>Genap</button>
           </div>
        </div>
        <div className="flex gap-2">
          <button onClick={exportPDF} className="px-4 py-2 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg">PDF</button>
          <button onClick={exportWord} className="px-4 py-2 bg-indigo-800 text-white rounded-xl font-black text-[10px] uppercase shadow-lg">Word</button>
          <button onClick={() => onSave(selectedTeacherId as number, 'administrasi', settings.semester, { scores, remarks: {}, catatan, tindakLanjut })} disabled={!selectedTeacherId} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg">Simpan</button>
        </div>
      </div>

      <div id="adm-pemb-export" className="bg-white shadow-xl border border-slate-300 p-12 max-w-5xl mx-auto text-gray-900 font-serif">
        <div className="text-center mb-10 border-b-4 border-double border-slate-900 pb-4 uppercase">
          <h1 className="text-xl font-black leading-none tracking-widest">INSTRUMEN SUPERVISI AKADEMIK</h1>
          <h2 className="text-lg font-bold mt-1 tracking-tight">ADMINISTRASI PEMBELAJARAN (GURU)</h2>
          <p className="text-[11px] font-bold mt-1 italic tracking-widest opacity-75">{settings.namaSekolah} • Semester {settings.semester} • TP {settings.tahunPelajaran}</p>
        </div>

        <div className="grid grid-cols-1 gap-y-1 text-sm font-bold mb-8">
           <div className="flex items-start"><span className="w-40 uppercase">Nama Guru</span><span className="mr-4">:</span><span className="uppercase text-blue-800">{selectedTeacher?.namaGuru || '...................'}</span></div>
           <div className="flex items-start"><span className="w-40 uppercase">Mata Pelajaran</span><span className="mr-4">:</span><span className="italic">{selectedTeacher?.mataPelajaran || '...................'}</span></div>
           <div className="flex items-start"><span className="w-40 uppercase">Semester</span><span className="mr-4">:</span><span className="">{settings.semester}</span></div>
        </div>

        <table className="w-full border-collapse border-2 border-slate-900 text-[11px]">
          <thead>
            <tr className="bg-slate-100 text-center font-black uppercase">
              <th rowSpan={2} className="border-2 border-slate-900 p-2 w-10">No</th>
              <th rowSpan={2} className="border-2 border-slate-900 p-2 text-left">Komponen Administrasi Pembelajaran</th>
              <th colSpan={3} className="border-2 border-slate-900 p-1">Kondisi / Skor</th>
              <th rowSpan={2} className="border-2 border-slate-900 p-2 w-32">Keterangan</th>
            </tr>
            <tr className="bg-slate-800 text-white font-bold text-[9px]">
              <th className="border-2 border-slate-900">Tidak (0)</th>
              <th className="border-2 border-slate-900">Ada/Tdk Sesuai (1)</th>
              <th className="border-2 border-slate-900">Sesuai (2)</th>
            </tr>
          </thead>
          <tbody>
            {COMPONENTS_LIST.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="border-2 border-slate-900 p-2 text-center font-bold text-slate-500">{idx + 1}.</td>
                <td className="border-2 border-slate-900 p-2 font-bold text-slate-800">{item}</td>
                {[0, 1, 2].map(val => (
                  <td key={val} className="border-2 border-slate-900 p-1 text-center cursor-pointer no-print" onClick={() => handleScore(idx, val)}>
                    <div className={`w-5 h-5 mx-auto border-2 border-slate-900 flex items-center justify-center ${scores[idx] === val ? 'bg-slate-900 text-white font-black' : 'bg-white'}`}>
                      {scores[idx] === val && "v"}
                    </div>
                  </td>
                ))}
                {[0, 1, 2].map(val => (
                  <td key={`p-${val}`} className="border-2 border-slate-900 p-1 text-center hidden print:table-cell font-black">
                    {scores[idx] === val ? "v" : ""}
                  </td>
                ))}
                <td className="border-2 border-slate-900 p-1 text-center italic text-slate-500 text-[10px]">
                   {scores[idx] === 2 ? "Lengkap & Sesuai" : scores[idx] === 1 ? "Perlu Revisi" : scores[idx] === 0 ? "Belum Ada" : ""}
                </td>
              </tr>
            ))}
            <tr className="bg-slate-900 text-white font-black">
              <td colSpan={2} className="border-2 border-slate-800 p-3 text-right uppercase italic tracking-widest text-xs">Nilai Akhir Ketercapaian (%)</td>
              <td colSpan={3} className="border-2 border-slate-800 p-2 text-center text-xl bg-blue-700">{stats.perc}%</td>
              <td className="border-2 border-slate-800 p-2 text-center uppercase tracking-tighter text-[10px]">{stats.pred}</td>
            </tr>
          </tbody>
        </table>

        <div className="mt-8 space-y-4">
           <div className="border-b border-slate-400 pb-1">
              <h3 className="text-sm font-black uppercase tracking-tight text-blue-800">Catatan Khusus Supervisor:</h3>
              <textarea value={catatan} onChange={e => setCatatan(e.target.value)} className="w-full bg-transparent border-0 italic text-sm no-print h-16 outline-none resize-none" placeholder="Otomatis terisi..." />
              <p className="hidden print:block text-sm italic min-h-[40px] whitespace-pre-wrap">{catatan || '................................................'}</p>
           </div>
           <div className="border-b border-slate-400 pb-1">
              <h3 className="text-sm font-black uppercase tracking-tight text-emerald-800">Tindak Lanjut & Rekomendasi:</h3>
              <textarea value={tindakLanjut} onChange={e => setTindakLanjut(e.target.value)} className="w-full bg-transparent border-0 italic text-sm no-print h-16 outline-none resize-none" placeholder="Otomatis terisi..." />
              <p className="hidden print:block text-sm italic min-h-[40px] whitespace-pre-wrap">{tindakLanjut || '................................................'}</p>
           </div>
        </div>

        {/* Tanda Tangan: 3 Kolom (Principal, Supervisor, Teacher) */}
        <div className="mt-16 grid grid-cols-3 gap-4 text-xs font-bold uppercase tracking-tight text-center px-4 break-inside-avoid">
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
                Mojokerto, {formatIndonesianDate(selectedTeacher?.tanggalAdm)}<br/>
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

export default AdministrasiPembelajaran;
