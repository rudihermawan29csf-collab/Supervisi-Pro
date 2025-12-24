
import React, { useMemo, useState } from 'react';
import { TeacherRecord, SupervisionStatus, AppSettings, AdminRecord, ExtraRecord, InstrumentResult } from '../types';

interface MainDashboardViewProps {
  records: TeacherRecord[];
  settings: AppSettings;
  adminRecords: AdminRecord[];
  extraRecords: ExtraRecord[];
  instrumentResults: Record<string, InstrumentResult>;
  setSettings: (s: AppSettings) => void;
  onRefresh?: () => void;
}

const formatName = (str: string) => {
  if (!str) return '';
  // Capitalize first letter of each word
  let formatted = str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  // Specific fix for academic titles
  formatted = formatted
    .replace(/\bS\.pd\b/gi, 'S.Pd')
    .replace(/\bM\.pd\b/gi, 'M.Pd')
    .replace(/\bM\.m\.pd\b/gi, 'M.M.Pd')
    .replace(/\bS\.si\b/gi, 'S.Si')
    .replace(/\bS\.sn\b/gi, 'S.Sn')
    .replace(/\bS\.e\b/gi, 'S.E')
    .replace(/\bS\.t\b/gi, 'S.T')
    .replace(/\bS\.kom\b/gi, 'S.Kom')
    .replace(/\bS\.ag\b/gi, 'S.Ag')
    .replace(/\bS\.pd\.i\b/gi, 'S.Pd.I');
    
  return formatted;
};

const MainDashboardView: React.FC<MainDashboardViewProps> = ({ records, settings, adminRecords, extraRecords, instrumentResults, setSettings }) => {
  const activeSemester = settings.semester;
  const [activeTab, setActiveTab] = useState<'akademik' | 'tendik' | 'extra'>('akademik');

  // --- STATS CALCULATION ---

  const stats = useMemo(() => {
    const current = records.filter(r => r.semester === activeSemester);
    const completed = current.filter(r => r.status === SupervisionStatus.COMPLETED);
    
    let sumCompositeAdm = 0;
    let sumCompositePbm = 0;

    current.forEach(r => {
      const getScore = (type: string, maxScore: number) => {
        const key = `${r.id}-${type}-${activeSemester}`;
        const res = instrumentResults[key];
        if (res && res.scores) {
          const vals = Object.values(res.scores).filter(v => typeof v === 'number') as number[];
          const sum = vals.reduce((a, b) => a + b, 0);
          return maxScore > 0 ? (sum / maxScore) * 100 : 0;
        }
        return 0;
      };

      const sAdm = getScore('administrasi', 26);
      const sATP = getScore('atp', 24);
      const sModul = getScore('modul', 34);
      const compositeAdm = (sAdm + sATP + sModul) / 3;
      sumCompositeAdm += compositeAdm;

      const sPBM = getScore('pembelajaran', 46);
      const sPenilaian = getScore('penilaian', 48);
      const compositePbm = (sPBM + sPenilaian) / 2;
      sumCompositePbm += compositePbm;
    });

    const totalData = current.length;
    const avgAdm = totalData > 0 ? (sumCompositeAdm / totalData).toFixed(1) : '0.0';
    const avgPbm = totalData > 0 ? (sumCompositePbm / totalData).toFixed(1) : '0.0';
    const progressPerc = totalData > 0 ? Math.round((completed.length / totalData) * 100) : 0;
    
    return {
      total: totalData,
      done: completed.length,
      progressPerc,
      avgAdm,
      avgPbm
    };
  }, [records, activeSemester, instrumentResults]);

  const tendikData = useMemo(() => {
    const categories = [
      { id: 'sekolah', label: 'Adm. Sekolah' }, 
      { id: 'ketenagaan', label: 'Adm. Ketenagaan' }, 
      { id: 'perlengkapan', label: 'Adm. Perlengkapan' }, 
      { id: 'perpustakaan', label: 'Adm. Perpustakaan' }, 
      { id: 'lab-ipa', label: 'Lab. IPA' }, 
      { id: 'lab-komputer', label: 'Lab. Komputer' }, 
      { id: 'kesiswaan', label: 'Adm. Kesiswaan' }
    ];
    
    let completedCount = 0;
    let totalScoreAll = 0;

    const list = categories.map(cat => {
      const key = `tendik-${cat.id}-${activeSemester}`;
      const result = instrumentResults[key];
      let score = 0;
      let status = 'Belum';
      
      if (result && result.scores && Object.keys(result.scores).length > 0) {
        completedCount++;
        status = 'Selesai';
        const vals = Object.values(result.scores).map(v => parseFloat(v as string)).filter(v => !isNaN(v));
        if (vals.length > 0) {
          const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
          score = Math.round(avg * 100);
          totalScoreAll += score;
        }
      }
      
      const schedule = adminRecords.find(r => 
        r.semester === activeSemester && 
        (
          r.kegiatan.toLowerCase().includes(cat.label.toLowerCase()) || 
          r.kegiatan.toLowerCase().includes(cat.id.replace('-', ' ')) ||
          (cat.id === 'lab-ipa' && r.kegiatan.toLowerCase().includes('ipa')) ||
          (cat.id === 'lab-komputer' && r.kegiatan.toLowerCase().includes('komp'))
        )
      );

      return { ...cat, score, status, petugas: schedule?.nama || '-' };
    });

    const totalItems = categories.length;
    const avgScore = totalItems > 0 ? (totalScoreAll / totalItems) : 0;
    const progressPerc = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;
    
    return {
      list,
      total: totalItems,
      done: completedCount,
      progressPerc,
      avgScore: avgScore.toFixed(1)
    };
  }, [instrumentResults, activeSemester, adminRecords]);

  const extraData = useMemo(() => {
    const currentExtras = extraRecords.filter(r => r.semester === activeSemester);
    let completedCount = 0;
    let totalPercAll = 0;

    const list = currentExtras.map(ex => {
      const key = `extra-${ex.id}-${activeSemester}`;
      const result = instrumentResults[key];
      let score = 0;
      let status = 'Belum';

      if (result && result.scores && Object.keys(result.scores).length > 0) {
        completedCount++;
        status = 'Selesai';
        const vals = Object.values(result.scores).map(v => {
            if (v === 'B') return 3; if (v === 'C') return 2; if (v === 'K') return 1; if (v === 'T') return 0;
            if (v === 'YA') return 3; if (v === 'TIDAK') return 0; return 0;
        });
        
        const maxScore = 54; 
        const totalScore = vals.reduce((a, b) => a + b, 0);
        score = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
        totalPercAll += score;
      }
      return { ...ex, score, status };
    });

    const totalData = currentExtras.length;
    const avgScore = totalData > 0 ? (totalPercAll / totalData) : 0;
    const progressPerc = totalData > 0 ? Math.round((completedCount / totalData) * 100) : 0;

    return {
      list,
      total: totalData,
      done: completedCount,
      progressPerc,
      avgScore: avgScore.toFixed(1)
    };
  }, [extraRecords, instrumentResults, activeSemester]);

  const exportPDF = () => {
    const element = document.getElementById('dashboard-export-area');
    const opt = { 
      margin: 10, 
      filename: `Dashboard_${activeTab}_${activeSemester}.pdf`, 
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'landscape' } 
    };
    // @ts-ignore
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 no-print">
        <div className="flex flex-col gap-2">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">Dashboard Monitoring</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{settings.namaSekolah} • TP {settings.tahunPelajaran}</p>
          </div>
          {/* SEMESTER SELECTOR IN DASHBOARD */}
          <div className="flex bg-blue-600/5 p-1 rounded-xl border border-blue-100 self-start">
             <button 
               onClick={() => setSettings({...settings, semester: 'Ganjil'})} 
               className={`px-6 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${activeSemester === 'Ganjil' ? 'bg-blue-600 text-white shadow-md' : 'text-blue-600 hover:bg-blue-100'}`}
             >
               Semester Ganjil
             </button>
             <button 
               onClick={() => setSettings({...settings, semester: 'Genap'})} 
               className={`px-6 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${activeSemester === 'Genap' ? 'bg-blue-600 text-white shadow-md' : 'text-blue-600 hover:bg-blue-100'}`}
             >
               Semester Genap
             </button>
          </div>
        </div>
        <div className="flex gap-2 bg-slate-100 p-1 rounded-xl shadow-inner">
           <button onClick={() => setActiveTab('akademik')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === 'akademik' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Akademik Guru</button>
           <button onClick={() => setActiveTab('tendik')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === 'tendik' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Tenaga Kependidikan</button>
           <button onClick={() => setActiveTab('extra')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === 'extra' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Ekstrakurikuler</button>
        </div>
        <button onClick={exportPDF} className="px-4 py-2 bg-slate-800 text-white rounded-xl font-black text-[10px] uppercase shadow-lg hover:bg-slate-900">Download PDF</button>
      </div>

      <div id="dashboard-export-area" className="space-y-6">
        {activeTab === 'akademik' && (
          <div className="animate-fadeIn space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Guru</p>
                <p className="text-3xl font-black text-slate-800">{stats.total}</p>
                <div className="w-full h-1 bg-slate-100 rounded-full mt-4"><div className="h-full bg-slate-400 rounded-full" style={{width: '100%'}}></div></div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selesai Supervisi</p>
                   <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{stats.progressPerc}%</span>
                </div>
                <p className="text-3xl font-black text-blue-600">{stats.done}</p>
                <div className="w-full h-1 bg-blue-50 rounded-full mt-4"><div className="h-full bg-blue-600 rounded-full" style={{width: `${stats.progressPerc}%`}}></div></div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rerata Nilai Adm</p>
                <p className="text-3xl font-black text-emerald-600">{stats.avgAdm}</p>
                <div className="w-full h-1 bg-emerald-50 rounded-full mt-4"><div className="h-full bg-emerald-600 rounded-full" style={{width: `${Math.min(100, parseFloat(stats.avgAdm))}%`}}></div></div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rerata Nilai PBM</p>
                <p className="text-3xl font-black text-orange-600">{stats.avgPbm}</p>
                <div className="w-full h-1 bg-orange-50 rounded-full mt-4"><div className="h-full bg-orange-600 rounded-full" style={{width: `${Math.min(100, parseFloat(stats.avgPbm))}%`}}></div></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest text-center">
                Monitoring Supervisi Akademik Guru - Semester {activeSemester}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] uppercase font-black text-slate-500 border-b">
                      <th className="px-6 py-4 w-10">No</th>
                      <th className="px-6 py-4">Nama Guru</th>
                      <th className="px-6 py-4">Mata Pelajaran</th>
                      <th className="px-6 py-4 text-center">Nilai Adm</th>
                      <th className="px-6 py-4 text-center">Nilai PBM</th>
                      <th className="px-6 py-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {records.filter(r => r.semester === activeSemester).map((r, i) => {
                      const getScore = (type: string, maxScore: number) => {
                        const key = `${r.id}-${type}-${activeSemester}`;
                        const res = instrumentResults[key];
                        if (res && res.scores) {
                          const vals = Object.values(res.scores).filter(v => typeof v === 'number') as number[];
                          const sum = vals.reduce((a, b) => a + b, 0);
                          return maxScore > 0 ? (sum / maxScore) * 100 : 0;
                        }
                        return 0;
                      };
                      const sAdm = getScore('administrasi', 26);
                      const sATP = getScore('atp', 24);
                      const sModul = getScore('modul', 34);
                      const admDisplay = Math.round((sAdm + sATP + sModul) / 3);
                      const sPBM = getScore('pembelajaran', 46);
                      const sPenilaian = getScore('penilaian', 48);
                      const pbmDisplay = Math.round((sPBM + sPenilaian) / 2);

                      return (
                      <tr key={r.id} className="border-b hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3 font-bold text-slate-400">{i + 1}</td>
                        <td className="px-6 py-3 font-black text-slate-800 uppercase tracking-tight">{formatName(r.namaGuru)}</td>
                        <td className="px-6 py-3 italic text-slate-500 font-medium">{r.mataPelajaran}</td>
                        <td className="px-6 py-3 text-center font-black text-emerald-600">{admDisplay > 0 ? admDisplay : '-'}</td>
                        <td className="px-6 py-3 text-center font-black text-orange-600">{pbmDisplay > 0 ? pbmDisplay : '-'}</td>
                        <td className="px-6 py-3 text-right">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${r.status === SupervisionStatus.COMPLETED ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tendik' && (
          <div className="animate-fadeIn space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Instrumen</p>
                <p className="text-3xl font-black text-purple-700">{tendikData.total}</p>
                <div className="w-full h-1 bg-purple-50 rounded-full mt-4"><div className="h-full bg-purple-400 rounded-full" style={{width: '100%'}}></div></div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selesai Supervisi</p>
                   <span className="text-[9px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{tendikData.progressPerc}%</span>
                </div>
                <p className="text-3xl font-black text-purple-600">{tendikData.done}</p>
                <div className="w-full h-1 bg-purple-50 rounded-full mt-4"><div className="h-full bg-purple-600 rounded-full" style={{width: `${tendikData.progressPerc}%`}}></div></div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rata-rata Skor</p>
                <p className="text-3xl font-black text-fuchsia-600">{tendikData.avgScore}</p>
                <div className="w-full h-1 bg-fuchsia-50 rounded-full mt-4"><div className="h-full bg-fuchsia-600 rounded-full" style={{width: `${Math.min(100, parseFloat(tendikData.avgScore))}%`}}></div></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 bg-purple-900 text-white text-[10px] font-black uppercase tracking-widest text-center">
                Monitoring Supervisi Tenaga Kependidikan
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] uppercase font-black text-slate-500 border-b">
                      <th className="px-6 py-4 w-10">No</th>
                      <th className="px-6 py-4">Instrumen Supervisi</th>
                      <th className="px-6 py-4">Petugas / Koordinator</th>
                      <th className="px-6 py-4 text-center">Skor Capaian</th>
                      <th className="px-6 py-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {tendikData.list.map((item, i) => (
                      <tr key={item.id} className="border-b hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3 font-bold text-slate-400">{i + 1}</td>
                        <td className="px-6 py-3 font-black text-slate-800 uppercase tracking-tight">{item.label}</td>
                        <td className="px-6 py-3 italic text-slate-500 font-medium uppercase">{formatName(item.petugas)}</td>
                        <td className="px-6 py-3 text-center font-black text-purple-600">{item.score}</td>
                        <td className="px-6 py-3 text-right">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${item.status === 'Selesai' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-400'}`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'extra' && (
          <div className="animate-fadeIn space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Ekstra</p>
                <p className="text-3xl font-black text-rose-700">{extraData.total}</p>
                <div className="w-full h-1 bg-rose-50 rounded-full mt-4"><div className="h-full bg-rose-400 rounded-full" style={{width: '100%'}}></div></div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selesai Supervisi</p>
                   <span className="text-[9px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">{extraData.progressPerc}%</span>
                </div>
                <p className="text-3xl font-black text-rose-600">{extraData.done}</p>
                <div className="w-full h-1 bg-rose-50 rounded-full mt-4"><div className="h-full bg-rose-600 rounded-full" style={{width: `${extraData.progressPerc}%`}}></div></div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rerata Nilai</p>
                <p className="text-3xl font-black text-pink-600">{extraData.avgScore}</p>
                <div className="w-full h-1 bg-pink-50 rounded-full mt-4"><div className="h-full bg-pink-600 rounded-full" style={{width: `${Math.min(100, parseFloat(extraData.avgScore))}%`}}></div></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 bg-rose-900 text-white text-[10px] font-black uppercase tracking-widest text-center">
                Monitoring Supervisi Ekstrakurikuler
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] uppercase font-black text-slate-500 border-b">
                      <th className="px-6 py-4 w-10">No</th>
                      <th className="px-6 py-4">Nama Pembina</th>
                      <th className="px-6 py-4">Nama Ekstrakurikuler</th>
                      <th className="px-6 py-4 text-center">Nilai Kinerja</th>
                      <th className="px-6 py-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {extraData.list.map((ex, i) => (
                      <tr key={ex.id} className="border-b hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3 font-bold text-slate-400">{i + 1}</td>
                        <td className="px-6 py-3 font-black text-slate-800 uppercase tracking-tight">{formatName(ex.nama)}</td>
                        <td className="px-6 py-3 italic text-rose-700 font-medium uppercase">{ex.ekstra}</td>
                        <td className="px-6 py-3 text-center font-black text-rose-600">{ex.score}</td>
                        <td className="px-6 py-3 text-right">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${ex.status === 'Selesai' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-400'}`}>
                            {ex.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainDashboardView;
