
import React, { useState, useMemo, useEffect } from 'react';
import { AppSettings, InstrumentResult, AdminRecord } from '../types';

type TendikType = 'sekolah' | 'ketenagaan' | 'perlengkapan' | 'perpustakaan' | 'lab-ipa' | 'lab-komputer' | 'kesiswaan';

interface ConfigItem {
  no: string;
  label: string;
  isSub?: boolean;
  isHeader?: boolean;
}

const SEKOLAH_ITEMS: ConfigItem[] = [
  { no: '1', label: 'Program Kerja Sekolah' },
  { no: '2', label: 'Kalender Pendidikan' },
  { no: '3', label: 'Jadwal Kegiatan Pertahun' },
  { no: '4', label: 'Administrasi Umum/ Surat menyurat', isHeader: true },
  { no: 'a', label: 'Agenda', isSub: true },
  { no: 'b', label: 'Buku Ekspedisi', isSub: true },
  { no: 'c', label: 'Pengarsipan (Filing)', isSub: true },
  { no: 'd', label: 'Buku Tamu umum', isSub: true },
  { no: 'e', label: 'Buku Tamu Pembinaan', isSub: true },
  { no: 'f', label: 'Notulen Rapat', isSub: true },
  { no: '5', label: 'Struktur Organisasi' },
  { no: '6', label: 'Pembagian Tugas dan Uraiannya' },
  { no: '7', label: 'Papan Data Ketenagaan dan Kesiswaan' },
  { no: '8', label: 'Program PKG dan PKB' },
  { no: '9', label: 'Rapat Kerja Awal Tahun Ajaran' },
  { no: '10', label: 'Laporan Bulanan, Tengah Tahunan, dan Tahunan' },
  { no: '11', label: 'Nomor Induk Sekolah (NIS)' },
  { no: '12', label: 'Ijin Operasional' },
  { no: '13', label: 'Kelembagaan', isHeader: true },
  { no: 'a', label: 'Akte Pendirian', isSub: true },
  { no: 'b', label: 'NPSN', isSub: true },
  { no: 'c', label: 'Program Kerja Sekolah', isSub: true },
];

const KETENAGAAN_ITEMS: ConfigItem[] = [
  { no: '1', label: 'Kepala Sekolah', isHeader: true },
  { no: 'a', label: 'Biodata', isSub: true },
  { no: 'b', label: 'Program Kerja Kepala Sekolah', isSub: true },
  { no: 'c', label: 'Buku Agenda Kepala Sekolah', isSub: true },
  { no: 'd', label: 'Jadwal Supervisi Kelas', isSub: true },
  { no: 'e', label: 'Pelaksanaan Supervisi Kelas', isSub: true },
  { no: 'f', label: 'PPK Guru dan Pegawai', isSub: true },
  { no: 'g', label: 'PAK Tahunan', isSub: true },
  { no: 'h', label: 'PKKS/PKG', isSub: true },
  { no: '2', label: 'Guru', isHeader: true },
  { no: 'a', label: 'Biodata', isSub: true },
  { no: 'b', label: 'Buku Agenda Guru', isSub: true },
  { no: 'c', label: 'Presensi Guru', isSub: true },
  { no: 'd', label: 'Kesesuaian Tugas dan SK', isSub: true },
  { no: 'e', label: 'Kelebihan Guru per Mata Pelajaran', isSub: true },
  { no: 'f', label: 'Kekurangan', isSub: true },
  { no: '3', label: 'Tata Usaha', isHeader: true },
  { no: 'a', label: 'Daftar Presensi', isSub: true },
  { no: 'b', label: 'Pembagian Tugas', isSub: true },
  { no: 'c', label: 'Rincian Tugas', isSub: true },
  { no: 'd', label: 'Catatan Hasil Pekerjaan/ Jurnal', isSub: true },
  { no: '4', label: 'Buku Induk Pegawai' },
  { no: '5', label: 'File', isHeader: true },
  { no: 'a', label: 'Kepala Sekolah', isSub: true },
  { no: 'b', label: 'Guru', isSub: true },
  { no: 'c', label: 'Pegawai', isSub: true },
];

const PERLENGKAPAN_ITEMS: ConfigItem[] = [
  { no: '1', label: 'Pemilikan Gedung', isHeader: true },
  { no: 'a', label: 'Milik Sendiri', isSub: true },
  { no: 'b', label: 'Sewa', isSub: true },
  { no: 'c', label: 'Menumpang', isSub: true },
  { no: '2', label: 'Buku Induk Barang Inventaris' },
  { no: '3', label: 'Buku Golongan Barang Inventaris' },
  { no: '4', label: 'Daftar Barang Inventaris Kelas/ Ruang' },
  { no: '5', label: 'Buku Barang Inventaris' },
  { no: '6', label: 'Buku Pembelian Barang' },
  { no: '7', label: 'Buku Penerimaan Barang' },
  { no: '8', label: 'Buku/ Kartu Stok Barang' },
  { no: '9', label: 'Kartu Pemeliharaan' },
  { no: '10', label: 'Penghapusan Barang' },
  { no: '11', label: 'Nomor Inventaris' },
  { no: '12', label: 'Barang Inventaris', isHeader: true },
  { no: 'a', label: 'Dipakai Sendiri', isSub: true },
  { no: 'b', label: 'Dipakai Bersama', isSub: true },
  { no: '13', label: 'Laporan' },
];

const PERPUSTAKAAN_ITEMS: ConfigItem[] = [
  { no: '1', label: 'Ruang Perpustakaan' },
  { no: '2', label: 'Pengelola' },
  { no: '3', label: 'Program Kerja' },
  { no: '4', label: 'Perlengkapan', isHeader: true },
  { no: 'a', label: 'Buku Induk Perpustakaan', isSub: true },
  { no: 'b', label: 'Klasifikasi Buku', isSub: true },
  { no: 'c', label: 'Katalog', isSub: true },
  { no: 'd', label: 'Kartu Peminjam', isSub: true },
  { no: 'e', label: 'Buku Peminjam', isSub: true },
  { no: 'f', label: 'Daftar Pengunjung', isSub: true },
  { no: 'g', label: 'Kartu Buku', isSub: true },
  { no: '5', label: 'Tempat Penyimpanan', isHeader: true },
  { no: 'a', label: 'Lemari', isSub: true },
  { no: 'b', label: 'Rak', isSub: true },
  { no: 'c', label: 'Meja Baca + Kursi', isSub: true },
  { no: '6', label: 'Pemeliharaan', isHeader: true },
  { no: 'a', label: 'Ruang', isSub: true },
  { no: 'b', label: 'Buku', isSub: true },
  { no: 'c', label: 'Kebersihan', isSub: true },
  { no: '7', label: 'Tata Tertib' },
  { no: '8', label: 'Laporan' },
];

const LAB_IPA_ITEMS: ConfigItem[] = [
  { no: '1', label: 'Ruang Laboratorium' },
  { no: '2', label: 'Pengelolaan Laboratorium (Laboran)' },
  { no: '3', label: 'Jadwal Penggunaan' },
  { no: '4', label: 'Tata Tertib' },
  { no: '5', label: 'Daftar Bahan' },
  { no: '6', label: 'Daftar Alat' },
  { no: '7', label: 'Daftar Hasil Praktikum' },
  { no: '8', label: 'Penempatan Alat dan Bahan' },
  { no: '9', label: 'Pemeliharaan Lab dan alat' },
  { no: '10', label: 'Alat Pemadam Kebakaran' },
  { no: '11', label: 'Tersedianya Alat PPPK' },
];

const LAB_KOMPUTER_ITEMS: ConfigItem[] = [
  { no: '1', label: 'Ruang Laboratorium' },
  { no: '2', label: 'Pengelolaan Laboratorium (Laboran)' },
  { no: '3', label: 'Jadwal Penggunaan' },
  { no: '4', label: 'Tata Tertib' },
  { no: '5', label: 'Daftar Bahan' },
  { no: '6', label: 'Daftar Alat' },
  { no: '7', label: 'Daftar Hasil Praktikum' },
  { no: '8', label: 'Penempatan Alat dan Bahan' },
  { no: '9', label: 'Pemeliharaan Lab dan alat' },
  { no: '10', label: 'Alat Pemadam Kebakaran' },
  { no: '11', label: 'Tersedianya Alat PPPK' },
];

const KESISWAAN_ITEMS: ConfigItem[] = [
  { no: '1', label: 'Buku Induk' },
  { no: '2', label: 'Buku Klaper' },
  { no: '3', label: 'Buku Mutasi' },
  { no: '4', label: 'Daftar Hadir Siswa' },
  { no: '5', label: 'Tata Tertib' },
  { no: '6', label: 'Buku Kelas/ Legger' },
  { no: '7', label: 'Papan Absen Kelas' },
  { no: '8', label: 'Daftar Kelas' },
  { no: '9', label: 'O S I S', isHeader: true },
  { no: 'a', label: 'Struktur Organisasi', isSub: true },
  { no: 'b', label: 'Pengurus', isSub: true },
  { no: 'c', label: 'Program', isSub: true },
  { no: 'd', label: 'Pelaksanaan', isSub: true },
  { no: 'e', label: 'Laporan Dokumentasi Prestasi Siswa', isSub: true },
  { no: '10', label: 'Prestasi Siswa', isHeader: true },
  { no: 'a', label: 'Bea Siswa', isSub: true },
  { no: 'b', label: 'Bidang Studi/ O.R/ Seni Budaya/Lain2', isSub: true },
  { no: '11', label: 'Daftar Peserta UN' },
  { no: '12', label: 'Dokumen Penyerahan STTB' },
];

const getAutoTendikFeedback = (percentage: number) => {
  if (percentage >= 91) return { 
    kesimpulan: "Sangat Baik. Dokumen administrasi dikelola dengan sangat rapi, lengkap, dan mutakhir. Sistem pengarsipan mudah diakses.", 
    saran: "Pertahankan kinerja prima ini dan kembangkan inovasi digitalisasi arsip untuk efisiensi jangka panjang." 
  };
  if (percentage >= 81) return { 
    kesimpulan: "Baik. Sebagian besar dokumen administrasi utama sudah tersedia dan terisi dengan benar.", 
    saran: "Tingkatkan ketelitian dalam pemutakhiran data secara berkala agar tidak ada dokumen yang tertinggal." 
  };
  if (percentage >= 71) return { 
    kesimpulan: "Cukup. Administrasi dasar tersedia namun beberapa buku/dokumen pendukung belum lengkap atau belum diisi rutin.", 
    saran: "Lengkapi dokumen yang masih kosong dan biasakan pengisian jurnal/buku harian tepat waktu." 
  };
  return { 
    kesimpulan: "Kurang. Banyak dokumen administrasi wajib yang belum tersedia atau tidak dikelola dengan baik.", 
    saran: "Perlu pembinaan intensif mengenai standar operasional prosedur (SOP) administrasi dan penataan ulang arsip." 
  };
};

interface Props {
  type: TendikType;
  settings: AppSettings;
  adminRecords: AdminRecord[];
  instrumentResults: Record<string, InstrumentResult>;
  onSave: (key: string, data: InstrumentResult) => void;
  setSettings: (s: AppSettings) => void;
}

const InstrumentTendikView: React.FC<Props> = ({ type, settings, adminRecords, instrumentResults, onSave, setSettings }) => {
  const activeSemester = settings.semester;
  const storageKey = `tendik-${type}-${activeSemester}`;

  const currentItems = useMemo(() => {
    if (type === 'ketenagaan') return KETENAGAAN_ITEMS;
    if (type === 'perpustakaan') return PERPUSTAKAAN_ITEMS;
    if (type === 'perlengkapan') return PERLENGKAPAN_ITEMS;
    if (type === 'lab-ipa') return LAB_IPA_ITEMS;
    if (type === 'lab-komputer') return LAB_KOMPUTER_ITEMS;
    if (type === 'kesiswaan') return KESISWAAN_ITEMS;
    return SEKOLAH_ITEMS;
  }, [type]);

  const scheduleData = useMemo(() => {
    return adminRecords.find(r => {
      if (r.semester !== activeSemester) return false;
      const activity = r.kegiatan.toLowerCase();
      if (type === 'lab-ipa' && activity.includes('ipa')) return true;
      if (type === 'lab-komputer' && activity.includes('komp')) return true;
      if (type === 'perpustakaan' && activity.includes('perpustakaan')) return true;
      if (type === 'ketenagaan' && activity.includes('ketenagaan')) return true;
      if (type === 'perlengkapan' && (activity.includes('perlengkapan') || activity.includes('sarpras'))) return true;
      if (type === 'sekolah' && activity.includes('sekolah')) return true;
      if (type === 'kesiswaan' && activity.includes('kesiswaan')) return true;
      return false;
    });
  }, [adminRecords, activeSemester, type]);

  const [scores, setScores] = useState<Record<number, number>>({});
  const [remarks, setRemarks] = useState<Record<number, string>>({});
  const [kesimpulan, setKesimpulan] = useState('');
  const [saran, setSaran] = useState('');

  useEffect(() => {
    const saved = instrumentResults[storageKey];
    if (saved) {
      setScores(saved.scores as any || {});
      setRemarks(saved.remarks || {});
      setKesimpulan(saved.catatan || '');
      setSaran(saved.tindakLanjut || '');
    } else {
      setScores({}); setRemarks({}); setKesimpulan(''); setSaran('');
    }
  }, [storageKey, instrumentResults]);

  const stats = useMemo(() => {
    const scoreValues = Object.values(scores).filter(v => typeof v === 'number') as number[];
    const totalScore = scoreValues.reduce((sum, s) => sum + s, 0);
    const count = currentItems.filter(item => !item.isHeader).length;
    const average = count > 0 ? (totalScore / count) : 0;
    const percentage = Math.round(average * 100);
    return { totalScore, count, average, percentage };
  }, [scores, currentItems]);

  // Auto-generate feedback when score changes
  useEffect(() => {
    if (Object.keys(scores).length > 0) {
      const feedback = getAutoTendikFeedback(stats.percentage);
      setKesimpulan(feedback.kesimpulan);
      setSaran(feedback.saran);
    }
  }, [stats.percentage]);

  const handleScoreChange = (idx: number, val: number) => {
    setScores(p => ({ ...p, [idx]: val }));
    setRemarks(p => ({ ...p, [idx]: val === 1 ? "Lengkap/Ada" : "Tidak Ada" }));
  };

  const handleSave = () => {
    onSave(storageKey, { scores, remarks, catatan: kesimpulan, tindakLanjut: saran });
    alert(`Hasil supervisi ${type} berhasil disimpan!`);
  };

  const exportPDF = () => {
    const element = document.getElementById('tendik-instr-export');
    // @ts-ignore
    html2pdf().from(element).save(`Tendik_${type}_${settings.semester}.pdf`);
  };

  const title = useMemo(() => {
    if (type === 'ketenagaan') return 'SUPERVISI ADMINISTRASI KETENAGAAN';
    if (type === 'perlengkapan') return 'SUPERVISI ADMINISTRASI PERLENGKAPAN';
    if (type === 'perpustakaan') return 'SUPERVISI ADMINISTRASI PERPUSTAKAAN';
    if (type === 'lab-ipa') return 'SUPERVISI ADMINISTRASI LABORATORIUM IPA';
    if (type === 'lab-komputer') return 'SUPERVISI ADMINISTRASI LABORATORIUM KOMPUTER';
    if (type === 'kesiswaan') return 'SUPERVISI ADMINISTRASI KESISWAAN';
    if (type === 'sekolah') return 'SUPERVISI ADMINISTRASI SEKOLAH';
    return `SUPERVISI ${(type as string).toUpperCase()}`;
  }, [type]);

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center no-print bg-white p-4 rounded-2xl shadow-sm border border-slate-100 gap-4">
        <div className="flex bg-slate-100 p-1 rounded-xl">
           <button onClick={() => setSettings({...settings, semester: 'Ganjil'})} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase ${settings.semester === 'Ganjil' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}>Ganjil</button>
           <button onClick={() => setSettings({...settings, semester: 'Genap'})} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase ${settings.semester === 'Genap' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}>Genap</button>
        </div>
        <div className="flex gap-2">
            <button onClick={exportPDF} className="px-4 py-2 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg">PDF</button>
            <button onClick={handleSave} className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg">Simpan</button>
        </div>
      </div>

      <div id="tendik-instr-export" className="bg-white shadow-xl border border-slate-300 p-12 max-w-5xl mx-auto text-gray-900 font-serif mb-20">
        <div className="text-center mb-10 border-b-4 border-double border-slate-900 pb-4 uppercase">
            <h1 className="text-xl font-black tracking-widest leading-none">{title}</h1>
            <p className="text-lg font-bold mt-1 uppercase">SEMESTER {activeSemester.toUpperCase()} *)</p>
            <p className="text-[11px] font-bold mt-1 italic tracking-widest opacity-75">TAHUN PELAJARAN {settings.tahunPelajaran}</p>
        </div>

        <div className="grid grid-cols-1 gap-y-1 text-sm font-bold mb-8">
             <div className="flex items-start"><span className="w-5 tracking-tight">1.</span><span className="w-40 uppercase">Nama Sekolah</span><span className="mr-4">:</span><span className="uppercase">{settings.namaSekolah}</span></div>
             <div className="flex items-start"><span className="w-5 tracking-tight">2.</span><span className="w-40 uppercase">Alamat Sekolah</span><span className="mr-4">:</span><span className="">Jl. Tirta Wening No. 03 Ds. Kembangbelor</span></div>
             <div className="flex items-start"><span className="w-5 tracking-tight">3.</span><span className="w-40 uppercase">Kecamatan</span><span className="mr-4">:</span><span className="">Pacet</span></div>
             <div className="flex items-start"><span className="w-5 tracking-tight">4.</span><span className="w-40 uppercase">Kabupaten</span><span className="mr-4">:</span><span className="">Mojokerto</span></div>
             <div className="flex items-start"><span className="w-5 tracking-tight">5.</span><span className="w-40 uppercase">Hari / Tanggal</span><span className="mr-4">:</span><span className="text-blue-800">{scheduleData ? `${scheduleData.hari} / ${scheduleData.tgl}` : '................... / ...................'}</span></div>
        </div>

        <table className="w-full border-collapse border-2 border-slate-900 text-[11px]">
          <thead>
            <tr className="bg-slate-100 font-black uppercase text-center">
              <th rowSpan={2} className="border-2 border-slate-900 p-2 w-10">NO</th>
              <th rowSpan={2} className="border-2 border-slate-900 p-2 text-left">KEGIATAN</th>
              <th colSpan={2} className="border-2 border-slate-900 p-1">JAWABAN</th>
              <th rowSpan={2} className="border-2 border-slate-900 p-2 w-16">NILAI</th>
              <th rowSpan={2} className="border-2 border-slate-900 p-2 w-48 text-left">KETERANGAN</th>
            </tr>
            <tr className="bg-slate-50 font-bold text-[9px] text-center">
              <th className="border-2 border-slate-900 p-1">YA/ADA</th>
              <th className="border-2 border-slate-900 p-1">TIDAK</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, idx) => (
              <tr key={idx} className={`${item.isHeader ? 'bg-slate-200 font-black' : 'hover:bg-slate-50'}`}>
                <td className="border-2 border-slate-900 p-2 text-center font-bold text-slate-700">{!item.isSub ? item.no : ''}</td>
                <td className={`border-2 border-slate-900 p-2 ${item.isHeader ? 'font-black uppercase tracking-tight' : item.isSub ? 'pl-8 italic text-slate-600' : 'font-bold'}`}>
                  {item.isSub ? `${item.no}. ${item.label}` : item.label}
                </td>
                {item.isHeader ? (
                  <><td className="border-2 border-slate-900 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,rgba(0,0,0,0.1)_5px,rgba(0,0,0,0.1)_10px)]"></td><td className="border-2 border-slate-900 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,rgba(0,0,0,0.1)_5px,rgba(0,0,0,0.1)_10px)]"></td><td className="border-2 border-slate-900 bg-slate-200"></td><td className="border-2 border-slate-900 bg-slate-200"></td></>
                ) : (
                  <>
                    <td className="border-2 border-slate-900 p-1 text-center cursor-pointer no-print" onClick={() => handleScoreChange(idx, 1)}>
                      <div className={`w-5 h-5 mx-auto border-2 border-slate-900 flex items-center justify-center ${scores[idx] === 1 ? 'bg-slate-900 text-white font-black' : 'bg-white'}`}>{scores[idx] === 1 && "v"}</div>
                    </td>
                    <td className="border-2 border-slate-900 p-1 text-center cursor-pointer no-print" onClick={() => handleScoreChange(idx, 0)}>
                      <div className={`w-5 h-5 mx-auto border-2 border-slate-900 flex items-center justify-center ${scores[idx] === 0 ? 'bg-slate-900 text-white font-black' : 'bg-white'}`}>{scores[idx] === 0 && "v"}</div>
                    </td>
                    <td className="border-2 border-slate-900 p-1 text-center hidden print:table-cell font-black">{scores[idx] === 1 ? 'v' : ''}</td>
                    <td className="border-2 border-slate-900 p-1 text-center hidden print:table-cell font-black">{scores[idx] === 0 ? 'v' : ''}</td>
                    <td className="border-2 border-slate-900 p-2 text-center font-black text-blue-800">{scores[idx] !== undefined ? scores[idx] : ''}</td>
                    <td className="border-2 border-slate-900 p-1">
                       <input type="text" value={remarks[idx] || ''} onChange={e => setRemarks({...remarks, [idx]: e.target.value})} className="w-full bg-transparent border-0 text-[10px] outline-none no-print" placeholder="..." />
                       <span className="hidden print:inline text-[10px] italic">{remarks[idx]}</span>
                    </td>
                  </>
                )}
              </tr>
            ))}
            <tr className="bg-slate-900 text-white font-black uppercase text-center">
               <td colSpan={2} className="border-2 border-slate-800 p-3 text-right text-xs tracking-widest">JUMLAH/ RATA-RATA</td>
               <td colSpan={2} className="border-2 border-slate-800 p-2">{stats.totalScore}</td>
               <td className="border-2 border-slate-800 p-2 text-xl bg-blue-700">{stats.percentage}%</td>
               <td className="border-2 border-slate-800 p-2 text-[10px]">
                  {stats.average >= 0.91 ? 'SANGAT BAIK' : stats.average >= 0.76 ? 'BAIK' : 'CUKUP'}
               </td>
            </tr>
          </tbody>
        </table>

        <div className="mt-8 space-y-2 border-t-4 border-slate-900 pt-6">
           <div className="border-b border-slate-400 pb-1">
              <h3 className="text-sm font-black uppercase tracking-tight text-blue-800">KESIMPULAN :</h3>
              <textarea value={kesimpulan} onChange={e => setKesimpulan(e.target.value)} className="w-full bg-transparent border-0 text-sm no-print h-16 outline-none italic" placeholder="Otomatis terisi..." />
              <div className="hidden print:block text-sm italic min-h-[40px] whitespace-pre-wrap">{kesimpulan || '................................................'}</div>
           </div>
           <div className="border-b border-slate-400 pb-1">
              <h3 className="text-sm font-black uppercase tracking-tight text-emerald-800">SARAN :</h3>
              <textarea value={saran} onChange={e => setSaran(e.target.value)} className="w-full bg-transparent border-0 text-sm no-print h-16 outline-none italic" placeholder="Otomatis terisi..." />
              <div className="hidden print:block text-sm italic min-h-[40px] whitespace-pre-wrap">{saran || '................................................'}</div>
           </div>
        </div>

        <div className="mt-16 flex justify-between items-start text-xs font-bold uppercase tracking-tight px-4 text-center">
          <div className="w-64">
             <p className="mb-24 uppercase">
                Kepala {settings.namaSekolah}
             </p>
             <div>
               <p className="font-black underline text-sm uppercase">{settings.namaKepalaSekolah}</p>
               <p className="text-[10px] font-mono tracking-tighter uppercase">NIP. {settings.nipKepalaSekolah}</p>
             </div>
          </div>
          <div className="w-64">
             <p className="mb-20 uppercase">
                Mojokerto, {scheduleData?.tgl || '................'}<br/>
                Petugas yang di Supervisi
             </p>
             <div>
               <p className="font-black underline text-sm uppercase">{scheduleData?.nama || '....................'}</p>
               <p className="text-[10px] font-mono tracking-tighter uppercase">NIP. {scheduleData?.nip || '....................'}</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstrumentTendikView;
