
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

// --- BANK KALIMAT OTOMATIS BERDASARKAN KATEGORI SKOR ---
const RESPONSE_TEMPLATES = {
  excellent: { // Skor 91-100
    answers: [
      ["Saya merasa sangat lega dan puas karena siswa antusias mengikuti alur pembelajaran.", "Perasaan saya sangat senang, atmosfer kelas sangat hidup dan interaktif hari ini."],
      ["Secara garis besar sudah sangat sesuai dengan modul ajar yang saya rancang.", "Alhamdulillah, seluruh tahapan dalam RPP/Modul Ajar terlaksana dengan runtut."],
      ["Respon siswa saat diskusi kelompok sangat kritis dan hidup.", "Keaktifan siswa dalam mempresentasikan hasil karya sangat membanggakan."],
      ["Saya perkirakan ketercapaian tujuan pembelajaran di atas 90%.", "Hampir seluruh siswa mampu mencapai KKTP yang ditetapkan."],
      ["Hampir tidak ada kesulitan berarti, hanya sedikit butuh waktu saat transisi kelompok.", "Siswa sangat enjoy, mungkin hanya 1-2 anak yang butuh pendampingan khusus."],
      ["Saya sangat menikmati prosesnya, pengelolaan kelas berjalan lancar.", "Tantangannya hanya mengatur euforia siswa agar tetap fokus pada konten."],
      ["Mungkin ke depan saya akan gunakan media yang lebih variatif lagi berbasis AI.", "Saya akan mencoba model pembelajaran lain agar siswa tidak bosan."],
      ["Akan dilanjutkan dengan materi pengayaan dan proyek profil pelajar Pancasila.", "Pertemuan depan kita akan fokus pada asesmen sumatif lingkup materi."]
    ],
    kesan: [
      "Secara umum, penampilan guru SANGAT MEMUASKAN. Penguasaan kelas prima dan pembelajaran berpusat pada siswa.",
      "Luar biasa. Guru mampu menciptakan lingkungan belajar yang menyenangkan dan menantang."
    ],
    saran: [
      "Pertahankan kinerja prima ini dan tularkan praktik baik (best practice) kepada rekan sejawat.",
      "Kembangkan inovasi media pembelajaran berbasis teknologi mutakhir untuk diseminasi di MGMP."
    ]
  },
  good: { // Skor 81-90
    answers: [
      ["Cukup puas, meskipun ada beberapa momen siswa kurang fokus.", "Secara umum berjalan baik, walau ada sedikit kendala teknis."],
      ["Sebagian besar sudah sesuai, namun ada modifikasi sedikit di bagian penutup.", "Sudah sesuai rencana, hanya alokasi waktu yang agak meleset."],
      ["Siswa mulai berani bertanya tanpa ditunjuk.", "Kerjasama dalam kelompok sudah mulai terbangun dengan baik."],
      ["Sekitar 80% siswa sudah memahami konsep dasar.", "Ketercapaian tujuan cukup baik, sebagian besar siswa tuntas."],
      ["Beberapa siswa masih kesulitan memahami instruksi yang kompleks.", "Siswa tertentu masih pasif dan ragu menyampaikan pendapat."],
      ["Mengelola waktu saat sesi tanya jawab yang terlalu panjang.", "Sedikit kewalahan mengkondisikan siswa saat pembagian kelompok."],
      ["Saya akan menyederhanakan lembar kerja (LKPD) agar lebih mudah dipahami.", "Saya perlu menggunakan mic/pengeras suara agar instruksi lebih jelas."],
      ["Saya akan mengulang sedikit materi tadi sebelum masuk bab baru.", "Fokus pada remedial bagi siswa yang belum tuntas."]
    ],
    kesan: [
      "Proses pembelajaran berjalan BAIK. Guru komunikatif dan materi tersampaikan dengan jelas.",
      "Secara umum penampilan guru sudah baik, langkah pembelajaran runtut dan sistematis."
    ],
    saran: [
      "Tingkatkan variasi metode mengajar agar siswa tidak jenuh (misal: gamifikasi).",
      "Perhatikan manajemen waktu, terutama pada saat transisi antar kegiatan inti."
    ]
  },
  fair: { // Skor 71-80
    answers: [
      ["Saya merasa kurang maksimal, siswa terlihat kurang bersemangat.", "Agak kecewa karena banyak waktu terbuang untuk menertibkan siswa."],
      ["Banyak langkah yang terlewat karena waktu habis.", "Tidak sepenuhnya sesuai rencana karena kondisi kelas yang kurang kondusif."],
      ["Ada beberapa siswa yang biasanya diam, hari ini mau menjawab.", "Media gambar yang saya bawa cukup menarik perhatian siswa."],
      ["Mungkin baru sekitar 60-70% siswa yang paham materi.", "Belum seluruhnya tercapai, perlu pengulangan."],
      ["Siswa kesulitan menghubungkan materi dengan pengetahuan awal.", "Literasi siswa masih rendah, sulit memahami soal cerita."],
      ["Saya kesulitan mengontrol siswa yang ramai di belakang.", "Suara saya habis, dan media kurang berfungsi optimal."],
      ["Saya harus mengubah strategi, mungkin lebih banyak ceramah interaktif dulu.", "Perlu pendekatan personal ke siswa yang sering ramai."],
      ["Saya akan membahas ulang soal-soal latihan tadi.", "Memberikan tugas tambahan untuk pendalaman materi."]
    ],
    kesan: [
      "Penampilan guru CUKUP. Perlu usaha lebih dalam mengaktifkan siswa.",
      "Pembelajaran berlangsung cukup lancar namun masih didominasi oleh guru (teacher-centered)."
    ],
    saran: [
      "Kurangi metode ceramah, perbanyak aktivitas yang melibatkan siswa secara langsung.",
      "Perlu variasi media pembelajaran agar siswa lebih tertarik dan fokus."
    ]
  },
  poor: { // Skor < 71
    answers: [
      ["Saya merasa gagal hari ini, kelas sangat tidak terkendali.", "Sangat tidak puas, materi tidak tersampaikan dengan baik."],
      ["Sangat jauh dari RPP, situasi kelas <i>chaos</i>.", "Rencana buyar karena kendala teknis dan kesiapan siswa."],
      ["Setidaknya saya sudah berusaha menyampaikan materi sampai selesai.", "Ada satu-dua siswa yang tetap memperhatikan meski yang lain ramai."],
      ["Ketercapaian tujuan sangat rendah, banyak siswa bingung.", "Sepertinya harus diulang total materinya."],
      ["Siswa sama sekali tidak punya bekal pengetahuan prasyarat.", "Motivasi belajar siswa sangat rendah."],
      ["Saya bingung harus mulai dari mana mengatasi keramaian kelas.", "Persiapan saya kurang matang sehingga grogi."],
      ["Saya perlu belajar lagi teknik pengelolaan kelas (classroom management).", "Minta bantuan guru senior untuk mendampingi di jam berikutnya."],
      ["Melakukan remedial teaching secara klasikal.", "Konsultasi dengan kurikulum untuk penyesuaian materi."]
    ],
    kesan: [
      "Penampilan guru KURANG maksimal. Penguasaan kelas dan materi perlu ditingkatkan segera.",
      "Pembelajaran kurang efektif. Banyak waktu terbuang dan tujuan tidak tercapai."
    ],
    saran: [
      "Wajib mengikuti pembinaan intensif atau supervisi klinis.",
      "Persiapkan perangkat ajar dan media dengan lebih matang sebelum masuk kelas."
    ]
  }
};

// Helper to add 2 working days (skip Sunday)
const calculatePostObsDate = (dateStr?: string) => {
  if (!dateStr) return '..............................';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  let daysAdded = 0;
  while (daysAdded < 2) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() !== 0) { // 0 is Sunday
      daysAdded++;
    }
  }
  return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

// Helper function to pick random array element
const pickRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

interface Props {
  settings: AppSettings; setSettings: (s: AppSettings) => void; records: TeacherRecord[]; instrumentResults: Record<string, InstrumentResult>; onSave: (teacherId: number, type: string, semester: string, data: InstrumentResult) => void;
}

const PostObservationView: React.FC<Props> = ({ settings, setSettings, records, instrumentResults, onSave }) => {
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | ''>('');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [kesanUmum, setKesanUmum] = useState('');
  const [saran, setSaran] = useState('');

  // Reset selected teacher when semester changes
  useEffect(() => {
    setSelectedTeacherId('');
  }, [settings.semester]);

  const selectedTeacher = useMemo(() => records.find(t => t.id === selectedTeacherId), [selectedTeacherId, records]);

  // Logic to generate automated responses based on Teaching Score
  useEffect(() => {
    if (selectedTeacherId !== '') {
      const keyPost = `${selectedTeacherId}-post-observasi-${settings.semester}`;
      const savedPost = instrumentResults[keyPost];

      // If data already saved, use it
      if (savedPost) {
        setAnswers(savedPost.answers || {}); 
        setKesanUmum(savedPost.kesanUmum || ''); 
        setSaran(savedPost.saran || '');
      } else {
        // GENERATE AUTOMATICALLY BASED ON 'PELAKSANAAN PEMBELAJARAN' SCORE
        const keyPelaksanaan = `${selectedTeacherId}-pembelajaran-${settings.semester}`;
        const execResult = instrumentResults[keyPelaksanaan];
        
        let percentage = 85; // Default to 'Good' if no data found
        if (execResult && execResult.scores) {
           // Calculate Percentage manually to match PelaksanaanView logic
           const allScores = Object.values(execResult.scores).filter(v => typeof v === 'number') as number[];
           const totalScore = allScores.reduce((a, b) => a + b, 0);
           // Assuming max score roughly 76 (38 items * 2) from Pelaksanaan view logic
           // Better to use a standard if exact items count varies, but 76 is standard here
           const maxScore = 76; 
           percentage = Math.round((totalScore / maxScore) * 100);
        }

        let category: 'excellent' | 'good' | 'fair' | 'poor' = 'good';
        if (percentage >= 91) category = 'excellent';
        else if (percentage >= 81) category = 'good';
        else if (percentage >= 71) category = 'fair';
        else category = 'poor';

        const templates = RESPONSE_TEMPLATES[category];
        const newAnswers: Record<number, string> = {};
        
        // Generate answers for questions 0-7
        QUESTIONS.forEach((_, idx) => {
           if (templates.answers[idx]) {
             newAnswers[idx] = pickRandom(templates.answers[idx]);
           } else {
             newAnswers[idx] = "-";
           }
        });

        setAnswers(newAnswers);
        setKesanUmum(pickRandom(templates.kesan));
        setSaran(pickRandom(templates.saran));
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
            {records.filter(t => t.semester === settings.semester).map(t => <option key={t.id} value={t.id}>{t.namaGuru}</option>)}
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
          <h2 className="text-lg font-bold mt-1 tracking-tight">REFLEKSI PEMBELAJARAN (GURU)</h2>
          <p className="text-[11px] font-bold mt-1 italic tracking-widest opacity-75">{settings.namaSekolah} • Semester {settings.semester} • TP {settings.tahunPelajaran}</p>
        </div>

        <div className="grid grid-cols-1 gap-y-1 text-sm font-bold mb-8">
           <div className="flex items-start"><span className="w-40 uppercase">Nama Guru</span><span className="mr-4">:</span><span className="uppercase text-blue-800">{selectedTeacher?.namaGuru || '...................'}</span></div>
           <div className="flex items-start"><span className="w-40 uppercase">Mata Pelajaran</span><span className="mr-4">:</span><span className="italic">{selectedTeacher?.mataPelajaran || '...................'}</span></div>
           <div className="flex items-start"><span className="w-40 uppercase">Hari / Tanggal</span><span className="mr-4">:</span><span className="text-blue-800 uppercase">{calculatePostObsDate(selectedTeacher?.tanggalPemb)}</span></div>
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
                   <div className="hidden print:block text-[11px] italic leading-relaxed whitespace-pre-wrap">{answers[idx] || '................................................'}</div>
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
                Mojokerto, {calculatePostObsDate(selectedTeacher?.tanggalPemb)}<br/>
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
