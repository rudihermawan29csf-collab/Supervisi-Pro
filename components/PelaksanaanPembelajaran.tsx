
import React, { useState, useMemo, useEffect } from 'react';
import { AppSettings, TeacherRecord, InstrumentResult } from '../types';

interface SubItem { id: number; label: string; }
interface AspectGroup { no: string; title: string; items: SubItem[]; }
interface Section { category: string; title: string; groups: AspectGroup[]; }

const formatIndonesianDate = (dateStr?: string) => {
  if (!dateStr) return '..............................';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

const getAutoFeedback = (percentage: number) => {
  if (percentage >= 91) return { catatan: "Pelaksanaan pembelajaran sangat inspiratif, interaktif, dan berpusat pada peserta didik. Penggunaan waktu dan media sangat efektif.", tindakLanjut: "Jadikan model pembelajaran percontohan (best practice) bagi guru lain dan dokumentasikan dalam video praktik baik." };
  if (percentage >= 81) return { catatan: "Proses pembelajaran berjalan baik, tujuan tercapai, dan kelas kondusif. Langkah pembelajaran sudah runtut.", tindakLanjut: "Tingkatkan variasi metode dan penggunaan media pembelajaran yang lebih inovatif (berbasis digital)." };
  if (percentage >= 71) return { catatan: "Pembelajaran berjalan cukup baik, namun interaksi siswa perlu ditingkatkan. Beberapa siswa masih terlihat pasif.", tindakLanjut: "Fokus pada strategi pelibatan siswa aktif dalam kegiatan inti dan manajemen pengelolaan kelas." };
  return { catatan: "Pembelajaran masih didominasi guru (teacher-centered) and kurang variatif. Tujuan pembelajaran belum sepenuhnya tercapai.", tindakLanjut: "Perlu bimbingan teknis intensif mengenai manajemen kelas dan strategi pembelajaran aktif." };
};

const SECTIONS: Section[] = [
  { 
    category: "A", title: "Kegiatan Pendahuluan", 
    groups: [ 
      { no: "1", title: "Orientasi", items: [ { id: 1, label: "Guru menyiapkan fisik dan psikis peserta didik (Salam, Doa, Presensi)." }, { id: 2, label: "Guru melakukan pembiasaan literasi/numerasi singkat." } ] }, 
      { no: "2", title: "Motivasi", items: [ { id: 3, label: "Guru mengajukan pertanyaan pemantik/memotivasi." }, { id: 4, label: "Guru memberikan gambaran manfaat materi dalam kehidupan nyata." } ] }, 
      { no: "3", title: "Apersepsi", items: [ { id: 5, label: "Guru mengaitkan materi dengan pengetahuan sebelumnya." }, { id: 6, label: "Guru menyampaikan tujuan pembelajaran yang akan dicapai." } ] } 
    ] 
  },
  { 
    category: "B", title: "Kegiatan Inti", 
    groups: [ 
      { no: "1", title: "Penguasaan Materi", items: [ { id: 8, label: "Menunjukkan penguasaan materi pembelajaran." }, { id: 9, label: "Mengaitkan materi dengan pengetahuan lain/relevan." }, { id: 10, label: "Menyampaikan materi sesuai dengan hierarki belajar." } ] }, 
      { no: "2", title: "Penerapan Strategi (Diferensiasi)", items: [ { id: 12, label: "Melaksanakan pembelajaran sesuai kompetensi yang akan dicapai." }, { id: 13, label: "Melaksanakan pembelajaran secara runtut." }, { id: 14, label: "Mengelola kelas secara efektif and kondusif." }, { id: 15, label: "Melaksanakan pembelajaran berdiferensiasi (Konten/Proses/Produk)." } ] }, 
      { no: "3", title: "Kecakapan Abad 21 (4C)", items: [ { id: 18, label: "Creativity: Mendorong siswa berkreasi." }, { id: 19, label: "Critical Thinking: Membangun daya kritis siswa." }, { id: 20, label: "Communication: Siswa berani berpendapat." }, { id: 21, label: "Collaboration: Kerja kelompok efektif." } ] },
      { no: "4", title: "Pemanfaatan Sumber Belajar/Media", items: [ { id: 25, label: "Menggunakan media pembelajaran yang bervariasi/IT." }, { id: 26, label: "Pemanfaatan lingkungan sekitar sebagai sumber belajar." } ] }
    ] 
  },
  { 
    category: "C", title: "Kegiatan Penutup", 
    groups: [ 
      { no: "1", title: "Rangkuman & Refleksi", items: [ { id: 31, label: "Membimbing peserta didik merangkum materi." }, { id: 32, label: "Melakukan refleksi bersama peserta didik atas pembelajaran." } ] },
      { no: "2", title: "Evaluasi & Tindak Lanjut", items: [ { id: 35, label: "Melaksanakan penilaian formatif akhir sesi." }, { id: 36, label: "Memberikan tugas/rencana pertemuan berikutnya." } ] }
    ] 
  }
];

interface Props {
  settings: AppSettings; setSettings: (s: AppSettings) => void; records: TeacherRecord[]; instrumentResults: Record<string, InstrumentResult>; onSave: (teacherId: number, type: string, semester: string, data: InstrumentResult) => void;
}

const PelaksanaanPembelajaran: React.FC<Props> = ({ settings, setSettings, records, instrumentResults, onSave }) => {
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | ''>('');
  const [scores, setScores] = useState<Record<number, number>>({});
  const [catatan, setCatatan] = useState('');
  const [tindakLanjut, setTindakLanjut] = useState('');

  const selectedTeacher = useMemo(() => records.find(t => t.id === selectedTeacherId), [selectedTeacherId, records]);

  const stats = useMemo(() => {
    const allItems = SECTIONS.flatMap(section => section.groups.flatMap(group => group.items));
    const totalItems = allItems.length;
    const maxScore = totalItems * 2; 
    const totalScore = allItems.reduce((sum, item) => sum + (scores[item.id] || 0), 0);
    const perc = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    let kriteria = perc >= 91 ? 'Sangat Baik' : perc >= 81 ? 'Baik' : perc >= 71 ? 'Cukup' : 'Kurang';
    return { totalScore, perc, kriteria };
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
      const key = `${selectedTeacherId}-pembelajaran-${settings.semester}`;
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
    const element = document.getElementById('pelaksanaan-export-area');
    // @ts-ignore
    html2pdf().from(element).save(`Pelaks_Pemb_${selectedTeacher?.namaGuru || 'Guru'}_${settings.semester}.pdf`);
  };

  const exportWord = () => {
    const content = document.getElementById('pelaksanaan-export-area')?.innerHTML;
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid black; padding: 5px; font-size: 10pt; }</style></head><body>";
    const footer = "</body></html>";
    const blob = new Blob([header + content + footer], { type: 'application/msword' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Pelaksanaan_Pembelajaran_${selectedTeacher?.namaGuru || 'Guru'}_${settings.semester}.doc`;
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
          <div className="flex bg-slate-200 p-1 rounded-xl shadow-inner">
             <button onClick={() => setSettings({...settings, semester: 'Ganjil'})} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase ${settings.semester === 'Ganjil' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>Ganjil</button>
             <button onClick={() => setSettings({...settings, semester: 'Genap'})} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase ${settings.semester === 'Genap' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>Genap</button>
           </div>
        </div>
        <div className="flex gap-2">
          <button onClick={exportPDF} className="px-4 py-2 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg">PDF</button>
          <button onClick={exportWord} className="px-4 py-2 bg-indigo-800 text-white rounded-xl font-black text-[10px] uppercase shadow-lg">Word</button>
          <button onClick={() => onSave(selectedTeacherId as number, 'pembelajaran', settings.semester, { scores, remarks: {}, catatan, tindakLanjut })} disabled={!selectedTeacherId} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg">Simpan</button>
        </div>
      </div>

      <div id="pelaksanaan-export-area" className="bg-white shadow-xl border border-slate-300 p-12 max-w-5xl mx-auto text-gray-900 font-serif">
        <div className="text-center mb-10 border-b-4 border-double border-slate-900 pb-4 uppercase">
          <h1 className="text-xl font-black leading-none tracking-widest">INSTRUMEN OBSERVASI KELAS</h1>
          <h2 className="text-lg font-bold mt-1">PELAKSANAAN PEMBELAJARAN (GURU)</h2>
          <p className="text-[11px] font-bold mt-1 italic tracking-widest opacity-75">{settings.namaSekolah} • Semester {settings.semester} • TP {settings.tahunPelajaran}</p>
        </div>

        <div className="grid grid-cols-1 gap-y-1 text-sm font-bold mb-8">
           <div className="flex items-start"><span className="w-40 uppercase">Nama Guru</span><span className="mr-4">:</span><span className="uppercase text-blue-800">{selectedTeacher?.namaGuru || '...................'}</span></div>
           <div className="flex items-start"><span className="w-40 uppercase">Mata Pelajaran</span><span className="mr-4">:</span><span className="italic">{selectedTeacher?.mataPelajaran || '...................'}</span></div>
           <div className="flex items-start"><span className="w-40 uppercase">Hari / Tanggal</span><span className="mr-4">:</span><span>{formatIndonesianDate(selectedTeacher?.tanggalPemb)}</span></div>
        </div>

        <table className="w-full border-collapse border-2 border-slate-900 text-[10px]">
          <thead>
            <tr className="bg-slate-100 text-center font-black uppercase">
              <th rowSpan={2} className="border-2 border-slate-900 p-2 w-10">No</th>
              <th rowSpan={2} className="border-2 border-slate-900 p-2 text-left">Aspek Pengamatan Pelaksanaan Pembelajaran</th>
              <th colSpan={3} className="border-2 border-slate-900 p-1">Skor</th>
              <th rowSpan={2} className="border-2 border-slate-900 p-2 w-32">Keterangan</th>
            </tr>
            <tr className="bg-slate-800 text-white font-bold text-[8px]">
              <th className="border-2 border-slate-900">0</th>
              <th className="border-2 border-slate-900">1</th>
              <th className="border-2 border-slate-900">2</th>
            </tr>
          </thead>
          <tbody>
            {SECTIONS.map((section, sIdx) => (
              <React.Fragment key={sIdx}>
                <tr className="bg-slate-50 font-black"><td className="border-2 border-slate-900 p-2 text-center">{section.category}.</td><td colSpan={5} className="border-2 border-slate-900 p-2 uppercase tracking-tighter">{section.title}</td></tr>
                {section.groups.map((group, gIdx) => (
                  <React.Fragment key={gIdx}>
                    <tr className="bg-slate-50 italic"><td className="border-2 border-slate-900"></td><td colSpan={5} className="border-2 border-slate-900 p-1 font-bold text-blue-900">{group.no}. {group.title}</td></tr>
                    {group.items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="border-2 border-slate-900 p-2 text-center font-bold text-slate-500">{item.id}.</td>
                        <td className="border-2 border-slate-900 p-2 font-medium text-slate-800">{item.label}</td>
                        {[0, 1, 2].map(val => (
                          <td key={val} className="border-2 border-slate-900 p-1 text-center cursor-pointer no-print" onClick={() => handleScore(item.id, val)}>
                            <div className={`w-4 h-4 mx-auto border border-slate-900 flex items-center justify-center ${scores[item.id] === val ? 'bg-slate-900 text-white font-black' : 'bg-white'}`}>
                              {scores[item.id] === val && "v"}
                            </div>
                          </td>
                        ))}
                        {[0, 1, 2].map(val => <td key={`p-${val}`} className="border-2 border-slate-900 p-1 text-center hidden print:table-cell font-bold">{scores[item.id] === val ? "v" : ""}</td>)}
                        <td className="border-2 border-slate-900 p-1 italic text-slate-500 text-[9px]">
                           {scores[item.id] === 2 ? "Lengkap" : scores[item.id] === 1 ? "Cukup" : scores[item.id] === 0 ? "Kurang" : ""}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </React.Fragment>
            ))}
            <tr className="bg-slate-900 text-white font-black">
              <td colSpan={2} className="border-2 border-slate-800 p-3 text-right uppercase italic tracking-widest text-xs">Total Persentase Ketercapaian (%)</td>
              <td colSpan={3} className="border-2 border-slate-800 p-2 text-center text-xl bg-blue-700">{stats.perc}%</td>
              <td className="border-2 border-slate-800 p-2 text-center uppercase tracking-tighter text-[10px]">{stats.kriteria}</td>
            </tr>
          </tbody>
        </table>

        <div className="mt-8 space-y-4">
           <div className="border-b border-slate-400 pb-1">
              <h3 className="text-sm font-black uppercase tracking-tight text-blue-800">Analisis Hasil Temuan:</h3>
              <textarea value={catatan} onChange={e => setCatatan(e.target.value)} className="w-full bg-transparent border-0 italic text-sm no-print h-16 outline-none resize-none" placeholder="Otomatis terisi..." />
              <p className="hidden print:block text-sm italic min-h-[40px] whitespace-pre-wrap">{catatan || '................................................'}</p>
           </div>
           <div className="border-b border-slate-400 pb-1">
              <h3 className="text-sm font-black uppercase tracking-tight text-emerald-800">Rekomendasi Tindak Lanjut:</h3>
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

export default PelaksanaanPembelajaran;
