
import React, { useMemo } from 'react';
import { TeacherRecord, AppSettings, InstrumentResult, ScoreSettings } from '../types';

interface Props {
  settings: AppSettings;
  records: TeacherRecord[];
  instrumentResults: Record<string, InstrumentResult>;
  setSettings: (s: AppSettings) => void;
}

const toTitleCase = (str: string) => {
  if (!str) return '';
  return str.toLowerCase().split(' ').map(word => {
    return (word.charAt(0).toUpperCase() + word.slice(1));
  }).join(' ');
};

const addWorkDays = (startDateStr: string | undefined, days: number): string => {
  if (!startDateStr) return '................';
  const date = new Date(startDateStr);
  if (isNaN(date.getTime())) return '................';
  
  let added = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() !== 0) { // 0 is Sunday
      added++;
    }
  }
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

const getDetailedNarrative = (pPerc: number, lPerc: number, ePerc: number, scoreSettings: ScoreSettings) => {
  const totalPerc = Math.round((pPerc * 0.15) + (lPerc * 0.55) + (ePerc * 0.3)); 
  
  let strengths = [];
  let weaknesses = [];
  
  if (pPerc >= 85) strengths.push("Perencanaan perangkat ajar sangat matang dan sistematis.");
  else weaknesses.push("Sinkronisasi antara tujuan dan apersepsi perlu dipertajam.");
  
  if (lPerc >= 85) strengths.push("Implementasi model pembelajaran aktif dan interaksi 4C sangat menonjol.");
  else weaknesses.push("Dominasi guru dalam proses diskusi (teacher-centered) masih perlu dikurangi.");
  
  if (ePerc >= 85) strengths.push("Teknik penilaian formatif dilakukan secara berkelanjutan.");
  else weaknesses.push("Umpan balik (feedback) pasca-pembelajaran belum terdokumentasi dengan baik.");

  return { strengths, weaknesses };
};

const LearningAnalysisView: React.FC<Props> = ({ settings, records, instrumentResults, setSettings }) => {
  const activeSemester = settings.semester;

  const analysisData = useMemo(() => {
    const idPersiapan = [1, 2, 3, 4, 5, 6]; 
    const idPelaksanaan = [8, 9, 10, 12, 13, 14, 15, 18, 19, 20, 21, 25, 26]; 
    const idEvaluasi = [31, 32, 35, 36]; 

    return records
      .filter(r => r.semester === activeSemester)
      .map((teacher) => {
        const key = `${teacher.id}-pembelajaran-${activeSemester}`;
        const result = instrumentResults[key];
        
        let pScore = 0; let lScore = 0; let eScore = 0;
        if (result && result.scores) {
          const s = result.scores as Record<number, number>;
          idPersiapan.forEach(id => pScore += (s[id] || 0));
          idPelaksanaan.forEach(id => lScore += (s[id] || 0));
          idEvaluasi.forEach(id => eScore += (s[id] || 0));
        }

        const pMax = idPersiapan.length * 2;
        const lMax = idPelaksanaan.length * 2;
        const eMax = idEvaluasi.length * 2;
        const totalMax = pMax + lMax + eMax;

        const pPerc = pMax > 0 ? Math.round((pScore / pMax) * 100) : 0;
        const lPerc = lMax > 0 ? Math.round((lScore / lMax) * 100) : 0;
        const ePerc = eMax > 0 ? Math.round((eScore / eMax) * 100) : 0;
        
        const totalPerc = totalMax > 0 ? Math.round(((pScore + lScore + eScore) / totalMax) * 100) : 0;
        
        const narrative = getDetailedNarrative(pPerc, lPerc, ePerc, settings.scoreSettings);
        
        let kesimpulan = "";
        if (totalPerc >= settings.scoreSettings.excellent) 
          kesimpulan = `Luar Biasa (${totalPerc}%). Guru menunjukkan kompetensi pedagogik tingkat mahir. ${narrative.strengths.join(" ")}`;
        else if (totalPerc >= settings.scoreSettings.good) 
          kesimpulan = `Sangat Baik (${totalPerc}%). Secara umum tujuan tercapai. ${narrative.strengths[0] || ""} Namun, ${narrative.weaknesses[0] || ""}`;
        else if (totalPerc >= settings.scoreSettings.fair) 
          kesimpulan = `Cukup (${totalPerc}%). Memerlukan pendampingan pada aspek teknis. ${narrative.weaknesses.join(" ")}`;
        else 
          kesimpulan = `Kurang (${totalPerc}%). Diperlukan supervisi klinis intensif. Fokus utama perbaikan: ${narrative.weaknesses.join(", ")}`;

        let reco = "Pendampingan Klinis";
        if (totalPerc >= settings.scoreSettings.excellent) reco = "Sharing Praktik Baik (Peer Coaching)";
        else if (totalPerc >= settings.scoreSettings.good) reco = "Workshop Media Interaktif";
        else if (totalPerc >= settings.scoreSettings.fair) reco = "Diskusi Terfokus MGMP";

        return {
          ...teacher,
          persiapanPerc: `${pPerc}%`,
          pelaksanaanPerc: `${lPerc}%`,
          evaluasiPerc: `${ePerc}%`,
          totalPerc,
          narasi: kesimpulan,
          rekomendasi: reco
        };
      });
  }, [records, activeSemester, instrumentResults, settings.scoreSettings]);

  const globalStats = useMemo(() => {
    if (analysisData.length === 0) return null;
    const avg = analysisData.reduce((s, r) => s + r.totalPerc, 0) / analysisData.length;
    return {
      avg: avg.toFixed(1),
      excellent: analysisData.filter(d => d.totalPerc >= settings.scoreSettings.excellent).length,
      good: analysisData.filter(d => d.totalPerc >= settings.scoreSettings.good && d.totalPerc < settings.scoreSettings.excellent).length,
      fair: analysisData.filter(d => d.totalPerc < settings.scoreSettings.good).length
    };
  }, [analysisData, settings.scoreSettings]);

  const latestSupervisionDate = useMemo(() => {
    if (analysisData.length === 0) return null;
    const sorted = [...analysisData].sort((a, b) => {
        if (!a.tanggalPemb) return 1;
        if (!b.tanggalPemb) return -1;
        return new Date(b.tanggalPemb).getTime() - new Date(a.tanggalPemb).getTime();
    });
    return sorted[0].tanggalPemb;
  }, [analysisData]);

  const exportPDF = () => {
    const element = document.getElementById('analysis-export-area');
    // @ts-ignore
    html2pdf().from(element).save(`Analisis_Lengkap_PBM_${activeSemester}.pdf`);
  };

  const exportWord = () => {
    const content = document.getElementById('analysis-export-area')?.innerHTML;
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid black; padding: 5px; font-size: 8pt; }</style></head><body>";
    const footer = "</body></html>";
    const blob = new Blob([header + content + footer], { type: 'application/msword' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Analisis_Hasil_PBM_${activeSemester}.doc`;
    link.click();
  };

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex justify-between items-center no-print">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight text-slate-800">Analisis Komprehensif Hasil PBM</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Diagnostik Performa Pedagogik Guru</p>
        </div>
        <div className="flex gap-2">
           <div className="flex bg-slate-200 p-1 rounded-xl shadow-inner mr-2">
             <button onClick={() => setSettings({...settings, semester: 'Ganjil'})} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold ${activeSemester === 'Ganjil' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>Ganjil</button>
             <button onClick={() => setSettings({...settings, semester: 'Genap'})} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold ${activeSemester === 'Genap' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>Genap</button>
           </div>
           <button onClick={exportPDF} className="px-4 py-2 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg">PDF</button>
           <button onClick={exportWord} className="px-4 py-2 bg-blue-800 text-white rounded-xl font-black text-[10px] uppercase shadow-lg">Word</button>
        </div>
      </div>

      <div id="analysis-export-area" className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden p-8 font-serif">
        <div className="text-center border-b-2 border-slate-900 mb-8 pb-4">
          <h1 className="text-lg font-black tracking-widest uppercase">ANALISIS DETAIL DAN REKOMENDASI HASIL SUPERVISI</h1>
          <h2 className="text-md font-bold mt-1 uppercase">{settings.namaSekolah}</h2>
          <p className="text-[10px] font-bold mt-1 italic uppercase">Tahun Pelajaran {settings.tahunPelajaran} • Semester {activeSemester}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[9px] border-2 border-slate-800">
            <thead>
              <tr className="bg-slate-900 text-white uppercase text-center font-black">
                <th className="border border-slate-800 p-2 w-8">No</th>
                <th className="border border-slate-800 p-2 text-left w-32">Nama Guru</th>
                <th className="border border-slate-800 p-2 w-24">Mapel</th>
                <th className="border border-slate-800 p-2 bg-blue-800">Persiapan</th>
                <th className="border border-slate-800 p-2 bg-emerald-800">Pelaksanaan</th>
                <th className="border border-slate-800 p-2 bg-purple-800">Evaluasi</th>
                <th className="border border-slate-800 p-2 text-left">Analisis Kualitatif (Catatan & Temuan)</th>
                <th className="border border-slate-800 p-2 text-left w-32">Rekomendasi Strategis</th>
              </tr>
            </thead>
            <tbody>
              {analysisData.map((d, i) => (
                <tr key={d.id} className="hover:bg-slate-50 transition-colors align-top">
                  <td className="border border-slate-800 p-2 text-center font-bold text-slate-400">{i + 1}</td>
                  <td className="border border-slate-800 p-2 font-black uppercase text-slate-800">{toTitleCase(d.namaGuru)}</td>
                  <td className="border border-slate-800 p-2 italic text-blue-800">{d.mataPelajaran}</td>
                  <td className="border border-slate-800 p-2 text-center font-black text-blue-700 bg-blue-50/20">{d.persiapanPerc}</td>
                  <td className="border border-slate-800 p-2 text-center font-black text-emerald-700 bg-emerald-50/20">{d.pelaksanaanPerc}</td>
                  <td className="border border-slate-800 p-2 text-center font-black text-purple-700 bg-purple-50/20">{d.evaluasiPerc}</td>
                  <td className="border border-slate-800 p-2 font-medium italic text-slate-600 leading-relaxed text-justify">{d.narasi}</td>
                  <td className="border border-slate-800 p-2 font-bold text-blue-900 bg-blue-50/10 uppercase text-[8px]">{d.rekomendasi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 border-t-4 border-slate-900 pt-6">
           <div className="space-y-4">
              <div>
                 <h3 className="text-xs font-black uppercase bg-slate-900 text-white px-3 py-1 inline-block">1. Analisis Kekuatan (Strengths)</h3>
                 <div className="mt-2 text-[10px] leading-relaxed text-slate-700 space-y-2 text-justify">
                    <p>• <strong>Kualitas Perencanaan Pembelajaran:</strong> Mayoritas guru ({globalStats?.excellent || 0} orang) telah menyusun Alur Tujuan Pembelajaran (ATP) dan Modul Ajar yang sistematis, dengan integrasi Profil Pelajar Pancasila yang terlihat jelas pada komponen kegiatan inti.</p>
                    <p>• <strong>Manajemen Kelas & Pengkondisian:</strong> Kemampuan guru dalam membuka pelajaran (apersepsi dan motivasi) serta pengelolaan kondisi fisik kelas tergolong sangat baik, menciptakan atmosfer belajar yang kondusif sejak menit awal.</p>
                    <p>• <strong>Penguasaan Materi Esensial:</strong> Guru menunjukkan kedalaman pemahaman materi ajar yang mumpuni, mampu menjawab pertanyaan kritis siswa, dan menghubungkan materi dengan konteks kehidupan nyata (kontekstual).</p>
                 </div>
              </div>
              <div>
                 <h3 className="text-xs font-black uppercase bg-slate-900 text-white px-3 py-1 inline-block">2. Analisis Kelemahan (Weaknesses)</h3>
                 <div className="mt-2 text-[10px] leading-relaxed text-slate-700 space-y-2 text-justify">
                    <p>• <strong>Implementasi Pembelajaran Berdiferensiasi:</strong> Penerapan strategi diferensiasi (konten, proses, produk) masih belum optimal. Sebagian besar pembelajaran masih cenderung menggunakan pendekatan "satu ukuran untuk semua" (one size fits all), kurang mengakomodasi gaya belajar auditori/kinestetik secara spesifik.</p>
                    <p>• <strong>Interaktivitas Media Pembelajaran:</strong> Pemanfaatan teknologi informasi (IT) mayoritas masih terbatas pada fungsi presentasi (PowerPoint statis). Penggunaan alat evaluasi digital interaktif (seperti Quizizz, Kahoot, atau Padlet) untuk meningkatkan <i>engagement</i> siswa masih minim.</p>
                    <p>• <strong>Umpan Balik & Refleksi:</strong> Sesi penutup seringkali terburu-buru, sehingga refleksi pembelajaran bersama siswa dan pemberian umpan balik konstruktif terhadap hasil kerja siswa sering terlewatkan.</p>
                 </div>
              </div>
           </div>
           <div className="space-y-4">
              <div className="bg-blue-50 p-4 border-2 border-blue-200 rounded-xl">
                 <h3 className="text-xs font-black uppercase text-blue-900 mb-2">3. Rekomendasi Peningkatan Kedepan</h3>
                 <div className="text-[10px] leading-relaxed text-blue-800 space-y-2 text-justify">
                    <p><strong>A. Workshop Pendalaman Diferensiasi:</strong> Menyelenggarakan In-House Training (IHT) khusus tentang penyusunan LKPD berjenjang (tiered assignments) untuk memfasilitasi perbedaan kemampuan siswa dalam kelas heterogen.</p>
                    <p><strong>B. Optimalisasi Digital Learning:</strong> Mewajibkan penggunaan setidaknya satu platform interaktif dalam setiap siklus pembelajaran dan memfasilitasi pelatihan teman sejawat (peer tutoring) terkait pemanfaatan AI dalam pendidikan.</p>
                    <p><strong>C. Penguatan Budaya Refleksi:</strong> Mewajibkan guru mengalokasikan waktu minimal 10 menit di akhir sesi untuk kegiatan refleksi terbimbing dan penyampaian rencana tindak lanjut yang konkret kepada siswa.</p>
                 </div>
              </div>
           </div>
        </div>

        <div className="mt-12 flex justify-end items-start text-xs font-bold uppercase tracking-tight px-4">
          <div className="text-center w-64">
             <p className="mb-20 uppercase">
                Mojokerto, {addWorkDays(latestSupervisionDate || new Date().toISOString(), 5)}<br/>
                Kepala {settings.namaSekolah}
             </p>
             <p className="font-black underline">{settings.namaKepalaSekolah}</p>
             <p className="text-[10px] font-mono tracking-tighter">NIP. {settings.nipKepalaSekolah}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningAnalysisView;
