
import React, { useState, useMemo, useEffect } from 'react';
import { AppSettings, TeacherRecord, InstrumentResult } from '../types';

const QUESTIONS = [ 
  { q: "Bagaimana pendapat Saudara setelah menyajikan pelajaran ini?", field: "pendapat" }, 
  { q: "Apakah proses pembelajaran sudah sesuai dengan rencana (Modul Ajar) yang Saudara susun?", field: "sesuai_rencana" }, 
  { q: "Dapatkah Saudara menceritakan hal-hal yang memuaskan dalam pembelajaran tadi?", field: "memuaskan" }, 
  { q: "Bagaimana perkiraan Saudara mengenai ketercapaian tujuan pembelajaran?", field: "ketercapaian" }, 
  { q: "Apa yang menjadi kesulitan siswa dalam mengikuti pembelajaran tadi?", field: "kesulitan_siswa" }, 
  { q: "Apa yang menjadi kesulitan Saudara dalam mengelola pembelajaran tadi?", field: "kesulitan_guru" }, 
  { q: "Adakah alternatif/cara lain yang Saudara pikirkan untuk mengatasi kesulitan tersebut?", field: "alternatif" }, 
  { q: "Marilah kita bersama menentukan langkah berikutnya untuk pertemuan mendatang?", field: "langkah_berikut" } 
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

const PostObservationView: React.FC<Props> = ({ settings, setSettings, records, instrumentResults, onSave }) => {
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | ''>('');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [kesanUmum, setKesanUmum] = useState('');
  const [saran, setSaran] = useState('');

  const selectedTeacher = useMemo(() => records.find(t => t.id === selectedTeacherId), [selectedTeacherId, records]);

  useEffect(() => {
    if (selectedTeacherId !== '') {
      const key = `${selectedTeacherId}-post-observasi-${settings.semester}`;
      const saved = instrumentResults[key];
      if (saved) {
        setAnswers(saved.answers || {}); setKesanUmum(saved.kesanUmum || ''); setSaran(saved.saran || '');
      } else {
        setAnswers({}); setKesanUmum(''); setSaran('');
      }
    }
  }, [selectedTeacherId, settings.semester, instrumentResults]);

  const handleAnswerChange = (idx: number, val: string) => {
    setAnswers(prev => ({ ...prev, [idx]: val }));
  };

  const exportPDF = () => {
    const element = document.getElementById('post-obs-export');
    // @ts-ignore
    html2pdf().from(element).save(`PostObs_${selectedTeacher?.namaGuru || 'Guru'}_${settings.semester}.pdf`);
  };

  const exportWord = () => {
    const content = document.getElementById('post-obs-export')?.innerHTML;
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid black; padding: 5px; font-size: 10pt; }</style></head><body>";
    const footer = "</body></html>";
    const blob = new Blob([header + content + footer], { type: 'application/msword' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Post_Observasi_${selectedTeacher?.namaGuru || 'Guru'}_${settings.semester}.doc`;
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
            <button onClick={() => onSave(selectedTeacherId as number, 'post-observasi', settings.semester, { scores: {}, remarks: {}, answers, kesanUmum, saran })} disabled={!selectedTeacher} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-black text-[10px] uppercase shadow-lg ml-2">Simpan</button>
        </div>
      </div>

      <div id="post-obs-export" className="bg-white shadow-xl border border-slate-300 p-12 max-w-5xl mx-auto text-gray-900 font-serif">
        <div className="text-center mb-10 border-b-4 border-double border-slate-900 pb-4 uppercase">
          <h1 className="text-xl font-black leading-none tracking-widest">WAWANCARA PASCA OBSERVASI</h1>
          <h2 className="text-lg font-bold mt-1 tracking-tight">RELEKSI PEMBELAJARAN (GURU)</h2>
          <p className="text-[11px] font-bold mt-1 italic tracking-widest opacity-75">{settings.namaSekolah} • Semester {settings.semester} • TP {settings.tahunPelajaran}</p>
        </div>

        <div className="grid grid-cols-1 gap-y-1 text-sm font-bold mb-8">
           <div className="flex items-start"><span className="w-40 uppercase">Nama Guru</span><span className="mr-4">:</span><span className="uppercase text-blue-800">{selectedTeacher?.namaGuru || '...................'}</span></div>
           <div className="flex items-start"><span className="w-40 uppercase">Mata Pelajaran</span><span className="mr-4">:</span><span className="italic">{selectedTeacher?.mataPelajaran || '...................'}</span></div>
           <div className="flex items-start"><span className="w-40 uppercase">Hari / Tanggal</span><span className="mr-4">:</span><span>{formatIndonesianDate(selectedTeacher?.tanggalPemb)}</span></div>
        </div>

        <table className="w-full border-collapse border-2 border-slate-900 text-[12px]">
          <thead>
            <tr className="bg-slate-100 font-black uppercase text-center">
              <th className="border-2 border-slate-900 p-3 w-12">No</th>
              <th className="border-2 border-slate-900 p-3 text-left">Pertanyaan Wawancara / Refleksi</th>
              <th className="border-2 border-slate-900 p-3 text-left">Jawaban / Tanggapan Guru</th>
            </tr>
          </thead>
          <tbody>
            {QUESTIONS.map((q, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="border-2 border-slate-900 p-3 text-center font-bold text-slate-500">{idx + 1}.</td>
                <td className="border-2 border-slate-900 p-3 font-bold text-slate-800 bg-slate-50/50 w-1/3">{q.q}</td>
                <td className="border-2 border-slate-900 p-2">
                   <textarea value={answers[idx] || ''} onChange={e => handleAnswerChange(idx, e.target.value)} className="w-full bg-transparent border-0 italic text-[11px] no-print h-16 resize-none" placeholder="Tulis tanggapan guru..." />
                   <div className="hidden print:block text-[11px] italic leading-relaxed">{answers[idx] || '................................................'}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-8 space-y-4">
           <div className="border-b border-slate-400 pb-1">
              <h3 className="text-sm font-black uppercase tracking-tight text-blue-800">Kesan Umum Supervisor:</h3>
              <textarea value={kesanUmum} onChange={e => setKesanUmum(e.target.value)} className="w-full bg-transparent border-0 italic text-sm no-print h-12" placeholder="..." />
              <div className="hidden print:block text-sm italic min-h-[40px] whitespace-pre-wrap">{kesanUmum || '................................................'}</div>
           </div>
           <div className="border-b border-slate-400 pb-1">
              <h3 className="text-sm font-black uppercase tracking-tight text-emerald-800">Saran Pembinaan Kedepan:</h3>
              <textarea value={saran} onChange={e => setSaran(e.target.value)} className="w-full bg-transparent border-0 italic text-sm no-print h-12" placeholder="..." />
              <div className="hidden print:block text-sm italic min-h-[40px] whitespace-pre-wrap">{saran || '................................................'}</div>
           </div>
        </div>

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

export default PostObservationView;
