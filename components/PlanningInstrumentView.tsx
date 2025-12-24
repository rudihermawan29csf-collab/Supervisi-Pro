import React, { useState, useMemo } from 'react';
import { INITIAL_TEACHERS } from '../constants';

const COMPONENTS_LIST = [
  "Kalender Pendidikan",
  "Rencana Pekan Efektif (RPE)",
  "Program Tahunan",
  "Program Semester",
  "Alur Tujuan Pembelajaran",
  "Modul Ajar",
  "Jadwal Tatap Muka",
  "Jurnal Mengajar",
  "Daftar Nilai",
  "KKTP",
  "Absensi Siswa",
  "Buku Pegangan Guru",
  "Buku Teks Siswa"
];

const PlanningInstrumentView: React.FC = () => {
  const [selectedTeacherName, setSelectedTeacherName] = useState('');
  const [jamTatapMuka, setJamTatapMuka] = useState('');
  const [tanggalSupervisi, setTanggalSupervisi] = useState('');
  const [catatan, setCatatan] = useState('');
  const [tindakLanjut, setTindakLanjut] = useState('');
  
  const [scores, setScores] = useState<Record<number, number>>(() => {
    const initial: Record<number, number> = {};
    COMPONENTS_LIST.forEach((_, idx) => { initial[idx] = 0; });
    return initial;
  });
  
  const [remarks, setRemarks] = useState<Record<number, string>>(() => {
    const initial: Record<number, string> = {};
    COMPONENTS_LIST.forEach((_, idx) => { initial[idx] = ''; });
    return initial;
  });

  const selectedTeacher = useMemo(() => {
    return INITIAL_TEACHERS.find(t => t.namaGuru === selectedTeacherName);
  }, [selectedTeacherName]);

  const stats = useMemo(() => {
    const scoreValues = Object.values(scores) as number[];
    const totalScore = scoreValues.reduce((sum, s) => sum + s, 0);
    const maxScore = 26; 
    const percentage = (totalScore / maxScore) * 100;
    
    let category = 'Kurang';
    if (percentage >= 91) category = 'Sangat Baik';
    else if (percentage >= 81) category = 'Baik';
    else if (percentage >= 71) category = 'Cukup';

    return { totalScore, percentage: percentage.toFixed(2), category };
  }, [scores]);

  const handleScoreChange = (idx: number, val: number) => {
    setScores(prev => ({ ...prev, [idx]: val }));
  };

  const handleRemarkChange = (idx: number, val: string) => {
    setRemarks(prev => ({ ...prev, [idx]: val }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-fadeIn max-w-5xl mx-auto">
      {/* Header Form */}
      <div className="p-8 border-b border-slate-100 bg-slate-50/50 print:bg-white">
        <div className="text-center mb-8 border-b-2 border-slate-900 pb-4">
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-widest">Instrumen Supervisi Akademik (Kurikulum Merdeka)</h1>
          <h2 className="text-xl font-bold text-slate-700 uppercase mt-1">Administrasi Pembelajaran</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-4">
            <div className="flex items-center">
              <label className="w-40 font-bold text-slate-700">Nama Sekolah</label>
              <span className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm font-semibold">SMPN 3 Pacet</span>
            </div>
            <div className="flex items-center">
              <label className="w-40 font-bold text-slate-700">Nama Guru</label>
              <select 
                value={selectedTeacherName}
                onChange={(e) => setSelectedTeacherName(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-white border border-blue-200 rounded-lg shadow-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">-- Pilih Guru --</option>
                {INITIAL_TEACHERS.map(t => (
                  <option key={t.id} value={t.namaGuru}>{t.namaGuru}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center">
              <label className="w-40 font-bold text-slate-700">Mata Pelajaran</label>
              <div className="flex-1 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-bold italic">
                {selectedTeacher?.mataPelajaran || '-'}
              </div>
            </div>
            <div className="flex items-center">
              <label className="w-40 font-bold text-slate-700">Jumlah Jam Tatap Muka</label>
              <input 
                type="text" 
                value={jamTatapMuka}
                onChange={(e) => setJamTatapMuka(e.target.value)}
                placeholder="... Jam"
                className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-0 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-900 text-white uppercase tracking-wider text-xs">
              <th rowSpan={2} className="px-4 py-4 border border-slate-700 w-12 text-center">No</th>
              <th rowSpan={2} className="px-6 py-4 border border-slate-700 text-left">Komponen Administrasi Pembelajaran</th>
              <th colSpan={3} className="px-4 py-2 border border-slate-700 text-center">Kondisi</th>
              <th rowSpan={2} className="px-6 py-4 border border-slate-700 text-left">Keterangan</th>
            </tr>
            <tr className="bg-slate-800 text-white text-[10px] text-center uppercase">
              <th className="px-2 py-2 border border-slate-700 w-24">Tidak Ada (0)</th>
              <th className="px-2 py-2 border border-slate-700 w-24">Ada Tidak Sesuai (1)</th>
              <th className="px-2 py-2 border border-slate-700 w-24">Ada Sesuai (2)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {COMPONENTS_LIST.map((item, idx) => (
              <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-4 py-3 border border-slate-200 text-center font-bold text-slate-500">{idx + 1}.</td>
                <td className="px-6 py-3 border border-slate-200 font-medium text-slate-800">{item}</td>
                <td className="px-2 py-3 border border-slate-200 text-center">
                  <input 
                    type="radio" 
                    name={`score-${idx}`} 
                    checked={scores[idx] === 0} 
                    onChange={() => handleScoreChange(idx, 0)}
                    className="w-4 h-4 text-red-600 focus:ring-red-500"
                  />
                </td>
                <td className="px-2 py-3 border border-slate-200 text-center">
                  <input 
                    type="radio" 
                    name={`score-${idx}`} 
                    checked={scores[idx] === 1} 
                    onChange={() => handleScoreChange(idx, 1)}
                    className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                  />
                </td>
                <td className="px-2 py-3 border border-slate-200 text-center">
                  <input 
                    type="radio" 
                    name={`score-${idx}`} 
                    checked={scores[idx] === 2} 
                    onChange={() => handleScoreChange(idx, 2)}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                  />
                </td>
                <td className="px-4 py-2 border border-slate-200">
                  <input 
                    type="text" 
                    value={remarks[idx]}
                    onChange={(e) => handleRemarkChange(idx, e.target.value)}
                    placeholder="..."
                    className="w-full bg-transparent border-b border-transparent focus:border-blue-300 outline-none text-xs text-slate-600"
                  />
                </td>
              </tr>
            ))}
            <tr className="bg-slate-50 font-bold text-slate-900">
              <td colSpan={2} className="px-6 py-4 border border-slate-200 text-right uppercase">Skor Total</td>
              <td colSpan={3} className="px-4 py-4 border border-slate-200 text-center text-xl text-blue-700">{stats.totalScore}</td>
              <td className="border border-slate-200 bg-slate-100 text-[10px] text-slate-500 px-4">Max Skor: 26</td>
            </tr>
            <tr className="bg-white font-bold text-slate-900">
              <td colSpan={2} className="px-6 py-4 border border-slate-200 text-right uppercase italic">Ketercapaian (Nilai Akhir %)</td>
              <td colSpan={3} className="px-4 py-4 border border-slate-200 text-center text-xl text-emerald-700">{stats.percentage}%</td>
              <td className="border border-slate-200 bg-emerald-50 px-4 py-4 text-center">
                 <span className={`px-4 py-1.5 rounded-full text-white shadow-sm uppercase tracking-widest text-xs ${
                   stats.category === 'Sangat Baik' ? 'bg-emerald-600' :
                   stats.category === 'Baik' ? 'bg-blue-600' :
                   stats.category === 'Cukup' ? 'bg-amber-500' : 'bg-red-500'
                 }`}>
                   {stats.category}
                 </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="p-8 space-y-8 bg-slate-50 print:bg-white border-t border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 uppercase tracking-tight">Catatan Supervisor</label>
            <textarea 
              rows={3}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="w-full p-4 border border-slate-200 rounded-2xl bg-white shadow-inner outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
              placeholder="Tulis catatan di sini..."
            ></textarea>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 uppercase tracking-tight">Tindak Lanjut</label>
            <textarea 
              rows={3}
              value={tindakLanjut}
              onChange={(e) => setTindakLanjut(e.target.value)}
              className="w-full p-4 border border-slate-200 rounded-2xl bg-white shadow-inner outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
              placeholder="Rencana tindak lanjut..."
            ></textarea>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 text-[11px] grid grid-cols-2 md:grid-cols-4 gap-4 text-slate-600 italic">
          <div className="flex items-center"><div className="w-3 h-3 bg-emerald-600 rounded-full mr-2"></div> 91% - 100% = Sangat Baik</div>
          <div className="flex items-center"><div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div> 81% - 90% = Baik</div>
          <div className="flex items-center"><div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div> 71% - 80% = Cukup</div>
          <div className="flex items-center"><div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div> Dibawah 71% = Kurang</div>
        </div>

        <div className="pt-10 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="text-center w-full md:w-64 mb-10 md:mb-0">
             <p className="text-sm font-medium text-slate-700 mb-20 uppercase">Guru yang di Supervisi</p>
             <p className="border-b-2 border-slate-900 mx-auto w-48 font-bold uppercase">{selectedTeacherName || '................................'}</p>
             <p className="text-xs text-slate-500 mt-1 uppercase">NIP. ................................</p>
          </div>

          <div className="text-center w-full md:w-80">
             <div className="mb-4">
               <input 
                 type="text" 
                 value={tanggalSupervisi}
                 onChange={(e) => setTanggalSupervisi(e.target.value)}
                 placeholder="Mojokerto, ....................."
                 className="text-sm font-medium text-slate-700 bg-transparent border-b border-transparent hover:border-slate-300 outline-none text-center"
               />
             </div>
             <p className="text-sm font-bold text-slate-900 mb-20 uppercase">Kepala SMPN 3 Pacet</p>
             <p className="font-black text-slate-900 uppercase">DIDIK SULISTYO, M.M.Pd</p>
             <p className="text-sm text-slate-700 mt-1 font-mono">NIP. 19660518 198901 1 002</p>
          </div>
        </div>
      </div>
      
      <div className="p-6 border-t bg-slate-900 flex justify-end space-x-4 print:hidden">
        <button 
          onClick={() => window.print()}
          className="px-6 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all font-bold flex items-center shadow-lg border border-slate-700"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
          Print Instrumen
        </button>
        <button 
          className="px-8 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-900/40"
          onClick={() => alert('Data instrumen supervisi berhasil disimpan secara lokal.')}
        >
          Simpan Hasil
        </button>
      </div>
    </div>
  );
};

export default PlanningInstrumentView;