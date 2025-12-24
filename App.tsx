import React, { useState, useEffect, useCallback } from 'react';
import { INITIAL_TEACHERS, DATA_PTT } from './constants';
import { TeacherRecord, ViewType, AppSettings, SupervisionStatus, InstrumentResult, ExtraRecord, AdminRecord } from './types';
import LoginView from './components/LoginView';
import { fetchDataFromCloud, syncDataToCloud } from './services/apiService';

// View Imports
import SupervisionView from './components/SupervisionView';
import ScheduleExtraView from './components/ScheduleExtraView';
import ScheduleAdminView from './components/ScheduleAdminView';
import SupervisionForm from './components/SupervisionForm';
import AdministrasiPembelajaran from './components/AdministrasiPembelajaran';
import PenilaianPembelajaran from './components/PenilaianPembelajaran';
import PelaksanaanPembelajaran from './components/PelaksanaanPembelajaran';
import PenelaahanATP from './components/PenelaahanATP';
import TelaahModulAjar from './components/TelaahModulAjar';
import PostObservationView from './components/PostObservationView';
import ObservationResultsView from './components/ObservationResultsView';
import InstrumentTendikView from './components/InstrumentTendikView';
import InstrumentExtraView from './components/InstrumentExtraView';
import SettingsView from './components/SettingsView';
import MainDashboardView from './components/MainDashboardView';
import AdminSupervisionView from './components/AdminSupervisionView';
import TendikResultsView from './components/TendikResultsView';
import ExtraResultsView from './components/ExtraResultsView';
import ProgramTindakLanjutView from './components/ProgramTindakLanjutView';
import FollowUpActionView from './components/FollowUpActionView';
import LearningAnalysisView from './components/LearningAnalysisView';
import SupervisionLogView from './components/SupervisionLogView';
import SupervisionRecapView from './components/SupervisionRecapView';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('supervisi_auth') === 'true');
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncStatus, setLastSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    jadwal: true, instrumen: true, instrumenTendik: false, laporanRekap: true, laporanNonGuru: false
  });

  const [selectedRecord, setSelectedRecord] = useState<TeacherRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // APP STATES
  const [settings, setSettings] = useState<AppSettings>({} as AppSettings);
  const [records, setRecords] = useState<TeacherRecord[]>([]);
  const [pttRecords, setPttRecords] = useState<any[]>([]);
  const [extraRecords, setExtraRecords] = useState<ExtraRecord[]>([]);
  const [adminRecords, setAdminRecords] = useState<AdminRecord[]>([]);
  const [instrumentResults, setInstrumentResults] = useState<Record<string, InstrumentResult>>({});
  const [uploadedSchedules, setUploadedSchedules] = useState<Record<string, any[]>>({});

  const loadDefaultState = useCallback(() => {
    setSettings({
      namaSekolah: 'SMPN 3 Pacet',
      namaAdministrator: 'Administrator',
      nipAdministrator: '-',
      tahunPelajaran: '2025/2026',
      semester: 'Ganjil',
      namaKepalaSekolah: 'Didik Sulistyo, M.M.Pd.',
      nipKepalaSekolah: '19660518 198901 1 002',
      namaPengawas: 'Lilik Hariati, S.Pd., M.Pd.',
      nipPengawas: '196203091984032013',
      tanggalCetak: '2025-07-14',
      tanggalCetakGanjil: '14 Juli 2025',
      tanggalCetakGenap: '02 Januari 2026',
      supervisors: ['', '', ''],
      rangeAdmGuruGanjil: { from: '2025-09-01', to: '2025-09-15' },
      rangeAdmGuruGenap: { from: '2026-01-15', to: '2026-01-31' },
      rangePembelajaranGuru: { from: '2025-09-16', to: '2025-10-15' },
      rangePembelajaranGuruGenap: { from: '2026-02-01', to: '2026-02-28' },
      rangeTendikGanjil: { from: '2025-10-16', to: '2025-10-23' },
      rangeTendikGenap: { from: '2026-03-01', to: '2026-03-16' },
      rangeExtraGanjil: { from: '2025-10-24', to: '2025-10-31' },
      rangeExtraGenap: { from: '2026-03-17', to: '2026-03-30' },
      scoreSettings: { excellent: 91, good: 75, fair: 55 }
    });
    setRecords(INITIAL_TEACHERS);
    setPttRecords(DATA_PTT);
    setExtraRecords([]);
    setAdminRecords([]);
    setInstrumentResults({});
    setUploadedSchedules({});
  }, []);

  const loadDataFromCloud = async (isManual = false) => {
    if (isManual && !confirm("Muat data dari cloud? Data yang belum tersimpan di perangkat ini mungkin akan tertimpa.")) {
      return;
    }

    setIsSyncing(true);
    const cloudData = await fetchDataFromCloud();
    if (cloudData && cloudData.settings) {
      setSettings(cloudData.settings);
      setRecords(cloudData.records || []);
      setPttRecords(cloudData.pttRecords || []);
      setExtraRecords(cloudData.extraRecords || []);
      setAdminRecords(cloudData.adminRecords || []);
      setInstrumentResults(cloudData.instrumentResults || {});
      setUploadedSchedules(cloudData.uploadedSchedules || {});
      setLastSyncStatus('success');
      if (isManual) alert("Berhasil memuat data terbaru dari Cloud.");
    } else if (!isManual) {
      loadDefaultState();
    }
    setIsSyncing(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadDataFromCloud();
    }
  }, [isAuthenticated]);

  const triggerCloudSync = async (overrides = {}) => {
    setIsSyncing(true);
    const fullData = { 
      settings, records, pttRecords, extraRecords, adminRecords, 
      instrumentResults, uploadedSchedules, ...overrides 
    };
    const success = await syncDataToCloud(fullData);
    setLastSyncStatus(success ? 'success' : 'error');
    setIsSyncing(false);
  };

  // Fungsi khusus untuk tombol "Simpan ke Cloud" manual
  const handleManualSave = async () => {
    setIsSyncing(true);
    const fullData = { 
      settings, records, pttRecords, extraRecords, adminRecords, 
      instrumentResults, uploadedSchedules
    };
    const success = await syncDataToCloud(fullData);
    if (success) {
      setLastSyncStatus('success');
      alert("Seluruh data berhasil diamankan ke Cloud Database.");
    } else {
      setLastSyncStatus('error');
      alert("Gagal menyimpan ke Cloud. Cek koneksi Anda.");
    }
    setIsSyncing(false);
  };

  const handleUpdateRecords = useCallback((newRecords: TeacherRecord[]) => {
    setRecords(newRecords);
    triggerCloudSync({ records: newRecords });
  }, [settings, pttRecords, extraRecords, adminRecords, instrumentResults, uploadedSchedules]);

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    triggerCloudSync({ settings: newSettings });
  };

  const handleSaveInstrument = (teacherId: number, type: string, semester: string, data: InstrumentResult) => {
    const key = `${teacherId}-${type}-${semester}`;
    const newResults = { ...instrumentResults, [key]: data };
    
    const newRecords = records.map(r => {
      if (r.id === teacherId) {
        const getVal = (t: string, max: number): number => {
          const res = newResults[`${teacherId}-${t}-${semester}`];
          if (!res || !res.scores) return 0;
          const scoreValues = Object.values(res.scores);
          const sum: number = (scoreValues as any[]).reduce((acc: number, val: any) => {
            const v = typeof val === 'number' ? val : 0;
            return acc + v;
          }, 0);
          return Math.round((sum / max) * 100);
        };

        const sAdm = getVal('administrasi', 26);
        const sATP = getVal('atp', 24);
        const sModul = getVal('modul', 34);
        const sPBM = getVal('pembelajaran', 46);
        const sPenilaian = getVal('penilaian', 48);
        const avg = Math.round((sAdm + sATP + sModul + sPBM + sPenilaian) / 5);

        return { 
          ...r, 
          status: SupervisionStatus.COMPLETED,
          nilai: avg,
          nilaiAdm: sAdm,
          nilaiATP: sATP,
          nilaiModul: sModul,
          nilaiPenilaian: sPenilaian
        };
      }
      return r;
    });

    setInstrumentResults(newResults);
    setRecords(newRecords);
    triggerCloudSync({ instrumentResults: newResults, records: newRecords });
  };

  const handleSaveAction = (teacherId: number, actions: any) => {
    const key = `${teacherId}-followup-actions-${settings.semester}`;
    const newResults = { ...instrumentResults, [key]: { scores: {}, remarks: {}, actions } };
    setInstrumentResults(newResults);
    triggerCloudSync({ instrumentResults: newResults });
  };

  const handleSaveTendikInstrument = (key: string, data: InstrumentResult) => {
    const newResults = { ...instrumentResults, [key]: data };
    setInstrumentResults(newResults);
    triggerCloudSync({ instrumentResults: newResults });
  };

  if (!isAuthenticated) return <LoginView onLogin={() => { setIsAuthenticated(true); localStorage.setItem('supervisi_auth', 'true'); }} />;

  const NavItem = ({ view, label, icon, activeColor = 'bg-blue-600' }: { view: ViewType, label: string, icon?: React.ReactNode, activeColor?: string }) => (
    <button 
      onClick={() => { setActiveView(view); if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
      className={`w-full flex items-center justify-start text-left px-4 py-2 rounded-xl text-[11px] font-bold transition-all ${activeView === view ? `${activeColor} text-white shadow-lg` : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
    >
      {icon && <span className="mr-3 shrink-0">{icon}</span>}
      <span className="truncate">{label}</span>
    </button>
  );

  const SectionHeader = ({ id, label, color = 'text-slate-500' }: { id: string, label: string, color?: string }) => (
    <button 
      onClick={() => setOpenSections(p => ({...p, [id]: !p[id]}))}
      className={`w-full flex items-center justify-between text-left px-4 py-2 mt-4 text-[10px] font-black uppercase tracking-widest ${color} hover:text-white transition-colors`}
    >
      <span className="truncate mr-2">{label}</span>
      <svg className={`w-3 h-3 shrink-0 transition-transform duration-300 ${openSections[id] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex overflow-hidden">
      {/* SIDEBAR */}
      <aside className={ `fixed inset-y-0 left-0 z-50 bg-slate-900 text-white transition-all duration-300 transform lg:relative ${isSidebarOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full lg:w-0'} flex flex-col overflow-hidden`}>
        <div className="p-5 border-b border-slate-800 bg-slate-950/50 relative flex items-center gap-4">
           <img src="https://i.ibb.co.com/c9Y905N/Logo-SMPN-3-PACET.png" alt="Logo" className="w-10 h-10 object-contain shadow-lg rounded-full bg-white p-0.5" />
           <div className="flex-1 min-w-0">
             <h1 className="text-[11px] font-black text-white uppercase truncate">{settings.namaSekolah || 'Supervisi Pro'}</h1>
             <p className="text-[9px] text-blue-400 font-bold tracking-widest uppercase">Cloud Database Active</p>
           </div>
           <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 text-slate-500 hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2"/></svg></button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2 scrollbar-hide">
          <NavItem view="dashboard" label="Dashboard Utama" activeColor="bg-indigo-600" />
          <NavItem view="settings" label="Pengaturan Master" activeColor="bg-slate-700" />
          
          <div className="pt-2 pb-1 border-t border-slate-800/50 mt-4 space-y-1">
             <button onClick={() => handleManualSave()} disabled={isSyncing} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600/10 text-emerald-400 rounded-xl text-[10px] font-black uppercase hover:bg-emerald-600 hover:text-white transition-all">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" strokeWidth="3" /></svg>
                {isSyncing ? 'Menyimpan...' : 'Simpan ke Cloud'}
             </button>
             <button onClick={() => loadDataFromCloud(true)} disabled={isSyncing} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600/10 text-blue-400 rounded-xl text-[10px] font-black uppercase hover:bg-blue-600 hover:text-white transition-all">
                <svg className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeWidth="3" /></svg>
                Muat dari Cloud
             </button>
          </div>

          <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 overflow-hidden pb-1 mt-4">
            <SectionHeader id="jadwal" label="1. Jadwal Supervisi" color="text-blue-400" />
            {openSections.jadwal && (
              <div className="px-1 space-y-0.5">
                <NavItem view="supervision-admin-guru" label="Jadwal Adm. Guru" />
                <NavItem view="supervision" label="Jadwal PBM Guru" />
                <NavItem view="schedule-admin" label="Jadwal Tendik" />
                <NavItem view="schedule-extra" label="Jadwal Ekstra" />
              </div>
            )}
          </div>

          <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 overflow-hidden pb-1">
            <SectionHeader id="instrumen" label="2. Instrumen Guru" color="text-emerald-400" />
            {openSections.instrumen && (
              <div className="px-1 space-y-0.5">
                <NavItem view="inst-atp" label="Telaah ATP" />
                <NavItem view="inst-modul" label="Telaah Modul Ajar" />
                <NavItem view="inst-administrasi" label="Adm. Pembelajaran" />
                <NavItem view="inst-pelaksanaan" label="Pelaksanaan Pemb." />
                <NavItem view="inst-penilaian" label="Penilaian Pemb." />
                <NavItem view="inst-hasil-observasi" label="Hasil Observasi" />
                <NavItem view="inst-post-observasi" label="Pasca Observasi" />
              </div>
            )}
          </div>

          <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 overflow-hidden pb-1">
            <SectionHeader id="instrumenTendik" label="3. Instrumen Tendik & Ekstra" color="text-purple-400" />
            {openSections.instrumenTendik && (
              <div className="px-1 space-y-0.5">
                <NavItem view="tendik-sekolah" label="Adm. Sekolah" activeColor="bg-purple-600" />
                <NavItem view="tendik-ketenagaan" label="Adm. Ketenagaan" activeColor="bg-purple-600" />
                <NavItem view="tendik-perlengkapan" label="Adm. Perlengkapan" activeColor="bg-purple-600" />
                <NavItem view="tendik-perpustakaan" label="Adm. Perpustakaan" activeColor="bg-purple-600" />
                <NavItem view="tendik-lab-ipa" label="Lab. IPA" activeColor="bg-purple-600" />
                <NavItem view="tendik-lab-komputer" label="Lab. Komputer" activeColor="bg-purple-600" />
                <NavItem view="tendik-kesiswaan" label="Adm. Kesiswaan" activeColor="bg-purple-600" />
                <NavItem view="inst-ekstra" label="Kegiatan Ekstrakurikuler" activeColor="bg-rose-600" />
              </div>
            )}
          </div>

          <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 overflow-hidden pb-1">
            <SectionHeader id="laporanRekap" label="4. Hasil & Rekap Guru" color="text-rose-400" />
            {openSections.laporanRekap && (
              <div className="px-1 space-y-0.5">
                <NavItem view="lap-analisis-pbm" label="Analisis Hasil PBM" />
                <NavItem view="lap-catatan-pbm" label="Catatan Pelaksanaan" />
                <NavItem view="lap-rekap-akademik" label="Rekap Akademik" />
                <NavItem view="lap-ptl-akademik" label="Program Tindak Lanjut" />
                <NavItem view="lap-action-akademik" label="Tindak Lanjut Action" />
              </div>
            )}
          </div>

          <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 overflow-hidden pb-1">
            <SectionHeader id="laporanNonGuru" label="5. Laporan Non-Guru" color="text-amber-400" />
            {openSections.laporanNonGuru && (
              <div className="px-1 space-y-0.5">
                <NavItem view="ptl-tendik" label="Hasil Supervisi Tendik" activeColor="bg-purple-700" />
                <NavItem view="ptl-extra" label="Hasil Supervisi Ekstra" activeColor="bg-rose-700" />
              </div>
            )}
          </div>
          
          <button 
            onClick={() => { setIsAuthenticated(false); localStorage.removeItem('supervisi_auth'); }}
            className="w-full mt-10 flex items-center px-4 py-2 rounded-xl text-[11px] font-black text-red-400 hover:bg-red-500/10 transition-all uppercase tracking-widest"
          >
            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeWidth="2" /></svg>
            Keluar Sistem
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b h-14 flex items-center justify-between px-6 shrink-0 no-print">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" strokeWidth="2"/></svg>
            </button>
            <h2 className="text-sm font-black text-slate-800 uppercase truncate">Manajemen Supervisi - {settings.namaSekolah || 'Memuat...'}</h2>
          </div>
          <div className="flex items-center gap-3">
             <button 
               onClick={handleManualSave}
               disabled={isSyncing}
               className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-tighter transition-all ${lastSyncStatus === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : lastSyncStatus === 'error' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
             >
                <div className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-blue-500 animate-pulse' : lastSyncStatus === 'success' ? 'bg-emerald-500' : lastSyncStatus === 'error' ? 'bg-red-500' : 'bg-slate-400'}`}></div>
                {isSyncing ? 'Simpan...' : lastSyncStatus === 'success' ? 'Database OK' : lastSyncStatus === 'error' ? 'Sync Error' : 'Offline'}
             </button>
             <div className="text-right hidden md:block">
                <span className="block text-[10px] font-black text-slate-800 uppercase">TP {settings.tahunPelajaran}</span>
                <span className="block text-[9px] font-bold text-blue-600 uppercase">{settings.semester}</span>
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
           {isSyncing && Object.keys(settings).length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full space-y-4 animate-fadeIn">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sinkronisasi Data Cloud...</p>
             </div>
           ) : (
            <div className="max-w-6xl mx-auto">
              {activeView === 'dashboard' && <MainDashboardView records={records} settings={settings} setSettings={handleUpdateSettings} adminRecords={adminRecords} extraRecords={extraRecords} instrumentResults={instrumentResults} />}
              {activeView === 'settings' && <SettingsView settings={settings} setSettings={setSettings} records={records} setRecords={handleUpdateRecords} uploadedSchedules={uploadedSchedules} setUploadedSchedules={setUploadedSchedules} pttRecords={pttRecords} setPttRecords={setPttRecords} />}
              
              {activeView === 'supervision' && <SupervisionView records={records} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSelect={setSelectedRecord} onUpdateRecords={handleUpdateRecords} settings={settings} setSettings={setSettings} />}
              {activeView === 'supervision-admin-guru' && <AdminSupervisionView records={records} onUpdateRecords={handleUpdateRecords} settings={settings} onSelect={setSelectedRecord} setSettings={setSettings} />}
              {activeView === 'schedule-extra' && <ScheduleExtraView settings={settings} setSettings={setSettings} extraRecords={extraRecords} setExtraRecords={setExtraRecords} teacherRecords={records} />}
              {activeView === 'schedule-admin' && <ScheduleAdminView settings={settings} setSettings={setSettings} adminRecords={adminRecords} setAdminRecords={setAdminRecords} teacherRecords={records} />}

              {activeView === 'inst-atp' && <PenelaahanATP settings={settings} setSettings={setSettings} records={records} instrumentResults={instrumentResults} onSave={handleSaveInstrument} />}
              {activeView === 'inst-modul' && <TelaahModulAjar settings={settings} setSettings={setSettings} records={records} instrumentResults={instrumentResults} onSave={handleSaveInstrument} />}
              {activeView === 'inst-administrasi' && <AdministrasiPembelajaran settings={settings} setSettings={setSettings} records={records} instrumentResults={instrumentResults} onSave={handleSaveInstrument} />}
              {activeView === 'inst-pelaksanaan' && <PelaksanaanPembelajaran settings={settings} setSettings={setSettings} records={records} instrumentResults={instrumentResults} onSave={handleSaveInstrument} />}
              {activeView === 'inst-penilaian' && <PenilaianPembelajaran settings={settings} setSettings={setSettings} records={records} instrumentResults={instrumentResults} onSave={handleSaveInstrument} />}
              {activeView === 'inst-hasil-observasi' && <ObservationResultsView settings={settings} setSettings={setSettings} records={records} instrumentResults={instrumentResults} onSave={handleSaveInstrument} />}
              {activeView === 'inst-post-observasi' && <PostObservationView settings={settings} setSettings={setSettings} records={records} instrumentResults={instrumentResults} onSave={handleSaveInstrument} />}

              {activeView === 'tendik-sekolah' && <InstrumentTendikView type="sekolah" settings={settings} adminRecords={adminRecords} instrumentResults={instrumentResults} onSave={handleSaveTendikInstrument} setSettings={setSettings} />}
              {activeView === 'tendik-ketenagaan' && <InstrumentTendikView type="ketenagaan" settings={settings} adminRecords={adminRecords} instrumentResults={instrumentResults} onSave={handleSaveTendikInstrument} setSettings={setSettings} />}
              {activeView === 'tendik-perlengkapan' && <InstrumentTendikView type="perlengkapan" settings={settings} adminRecords={adminRecords} instrumentResults={instrumentResults} onSave={handleSaveTendikInstrument} setSettings={setSettings} />}
              {activeView === 'tendik-perpustakaan' && <InstrumentTendikView type="perpustakaan" settings={settings} adminRecords={adminRecords} instrumentResults={instrumentResults} onSave={handleSaveTendikInstrument} setSettings={setSettings} />}
              {activeView === 'tendik-lab-ipa' && <InstrumentTendikView type="lab-ipa" settings={settings} adminRecords={adminRecords} instrumentResults={instrumentResults} onSave={handleSaveTendikInstrument} setSettings={setSettings} />}
              {activeView === 'tendik-lab-komputer' && <InstrumentTendikView type="lab-komputer" settings={settings} adminRecords={adminRecords} instrumentResults={instrumentResults} onSave={handleSaveTendikInstrument} setSettings={setSettings} />}
              {activeView === 'tendik-kesiswaan' && <InstrumentTendikView type="kesiswaan" settings={settings} adminRecords={adminRecords} instrumentResults={instrumentResults} onSave={handleSaveTendikInstrument} setSettings={setSettings} />}
              {activeView === 'inst-ekstra' && <InstrumentExtraView settings={settings} setSettings={setSettings} extraRecords={extraRecords} instrumentResults={instrumentResults} onSave={handleSaveTendikInstrument} />}

              {activeView === 'lap-analisis-pbm' && <LearningAnalysisView settings={settings} records={records} instrumentResults={instrumentResults} setSettings={setSettings} />}
              {activeView === 'lap-catatan-pbm' && <SupervisionLogView settings={settings} records={records} instrumentResults={instrumentResults} setSettings={setSettings} onSave={handleSaveInstrument} />}
              {activeView === 'lap-rekap-akademik' && <SupervisionRecapView settings={settings} records={records} instrumentResults={instrumentResults} setSettings={setSettings} onSave={handleSaveInstrument} />}
              {activeView === 'lap-ptl-akademik' && <ProgramTindakLanjutView settings={settings} records={records} instrumentResults={instrumentResults} setSettings={setSettings} onSave={handleSaveInstrument} />}
              {activeView === 'lap-action-akademik' && <FollowUpActionView settings={settings} records={records} setSettings={setSettings} instrumentResults={instrumentResults} onSaveAction={handleSaveAction} onSave={handleSaveInstrument} />}
              
              {activeView === 'ptl-tendik' && <TendikResultsView adminRecords={adminRecords} settings={settings} instrumentResults={instrumentResults} setSettings={setSettings} />}
              {activeView === 'ptl-extra' && <ExtraResultsView extraRecords={extraRecords} settings={settings} instrumentResults={instrumentResults} setSettings={setSettings} />}
            </div>
           )}
        </div>
      </main>

      {selectedRecord && (
        <SupervisionForm 
          record={selectedRecord} 
          onSave={(updated) => { 
            const newRecords = records.map(r => r.id === updated.id ? updated : r);
            setRecords(newRecords); 
            triggerCloudSync({ records: newRecords });
            setSelectedRecord(null); 
          }} 
          onClose={() => setSelectedRecord(null)} 
        />
      )}
    </div>
  );
};

export default App;