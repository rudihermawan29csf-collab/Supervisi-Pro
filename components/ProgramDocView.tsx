
import React from 'react';
import { AppSettings, TeacherRecord, AdminRecord, ExtraRecord } from '../types';

interface Props {
  type: 'akademik' | 'tendik' | 'extra';
  settings: AppSettings;
  records?: TeacherRecord[];
  adminRecords?: AdminRecord[];
  extraRecords?: ExtraRecord[];
}

const ProgramDocView: React.FC<Props> = ({ type, settings, records, adminRecords, extraRecords }) => {
  const exportPDF = () => {
    const element = document.getElementById('program-full-doc');
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `Program_Supervisi_${type}_${settings.tahunPelajaran.replace('/', '-')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    // @ts-ignore
    html2pdf().set(opt).from(element).save();
  };

  const currentYear = settings.tahunPelajaran;
  const prevYear = (parseInt(currentYear.split('/')[0]) - 1) + '/' + (parseInt(currentYear.split('/')[1]) - 1);

  const docTitle = type === 'akademik' ? 'PROGRAM SUPERVISI AKADEMIK (GURU)' : 
                   type === 'tendik' ? 'PROGRAM SUPERVISI MANAJERIAL (TENDIK)' : 
                   'PROGRAM SUPERVISI EKSTRAKURIKULER';

  // Helper component for page footer with automatic numbering
  const PageFooter = ({ pageNum }: { pageNum: number }) => (
    <div className="absolute bottom-10 left-0 right-0 text-center border-t border-slate-200 pt-4 px-20 flex justify-between items-center text-[10px] text-slate-400 italic">
       <span>Program Supervisi {settings.namaSekolah} - TP {currentYear}</span>
       <span className="font-bold text-slate-900">Halaman {pageNum}</span>
    </div>
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      <div className="flex justify-end no-print">
        <button onClick={exportPDF} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-lg flex items-center transition-all hover:bg-indigo-700">
           <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeWidth="2"/></svg>
           Cetak Dokumen Program (Buku Pedoman)
        </button>
      </div>

      <div id="program-full-doc" className="bg-white shadow-sm max-w-[210mm] mx-auto text-gray-900 font-serif leading-relaxed print:shadow-none">
        
        {/* 1. HALAMAN JUDUL (P1) */}
        <div className="min-h-[296mm] relative flex flex-col items-center justify-between py-24 px-16 break-after-page border-b border-slate-100">
            <div className="text-center space-y-4">
                <p className="text-sm font-bold tracking-[0.2em] uppercase mb-4">Dokumen Perangkat Akreditasi</p>
                <h1 className="text-3xl font-black uppercase tracking-widest leading-tight">{docTitle}</h1>
                <p className="text-xl font-bold uppercase">TAHUN PELAJARAN {currentYear}</p>
            </div>
            
            <div className="w-56 h-56 bg-slate-50 rounded-full flex items-center justify-center border-8 border-double border-slate-200">
                <div className="text-center">
                   <svg className="w-20 h-20 mx-auto text-slate-300 mb-2" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.827a1 1 0 00-.788 0L2.606 6.006a1 1 0 01-.744.051L.23 5.483a1 1 0 00-1.21.73c-.053.242.062.487.27.604l1.623.916a1 1 0 001.21-.035l1.623-.916a1 1 0 00.27-.604 1 1 0 00-1.21-.73l-1.632.574a1 1 0 01-.744-.051l6.452-2.827zm6.394 1.344a1 1 0 00-.788 0l-7 3.062a1 1 0 01-.744 0l-7-3.062a1 1 0 00-1.21.73c-.053.242.062.487.27.604l1.623.916a1 1 0 001.21-.035l1.623-.916a1 1 0 00.27-.604 1 1 0 00-1.21-.73l-1.632.574a1 1 0 01-.744-.051l6.452-2.827z"/></svg>
                   <p className="text-slate-400 italic text-[10px] uppercase font-black">Logo Sekolah / Institusi</p>
                </div>
            </div>

            <div className="text-center space-y-2">
                <p className="text-xl font-black uppercase tracking-tight">PEMERINTAH KABUPATEN MOJOKERTO</p>
                <p className="text-xl font-black uppercase tracking-tight">DINAS PENDIDIKAN</p>
                <p className="text-2xl font-black uppercase text-blue-900">{settings.namaSekolah}</p>
                <p className="text-xs font-medium italic">Alamat: Jl. Tirta Wening No. 03 Ds. Kembangbelor - Pacet - Mojokerto</p>
            </div>
            <PageFooter pageNum={1} />
        </div>

        {/* 2. KATA PENGANTAR (P2) */}
        <div className="min-h-[296mm] relative py-20 px-24 space-y-8 break-after-page">
            <h2 className="text-center text-xl font-bold uppercase underline mb-10 decoration-2 underline-offset-8">KATA PENGANTAR</h2>
            <div className="text-justify text-[13px] space-y-5 leading-relaxed">
                <p>Puji syukur kami panjatkan ke hadirat Allah SWT, karena atas rahmat dan hidayah-Nya, penyusunan Dokumen Program Supervisi di {settings.namaSekolah} untuk Tahun Pelajaran {currentYear} dapat diselesaikan tepat pada waktunya.</p>
                <p>Supervisi merupakan bagian yang sangat strategis dalam manajemen sekolah. Kegiatan ini tidak hanya bertujuan untuk melakukan pengawasan, namun lebih kepada memberikan bantuan teknis, pembinaan, dan pendampingan profesional kepada para guru dan tenaga kependidikan. Harapannya, melalui supervisi yang terencana, kualitas layanan pendidikan di unit kerja kami dapat terus meningkat secara berkelanjutan.</p>
                <p>Program ini disusun dengan mengacu pada kurikulum yang berlaku (Kurikulum Merdeka) dan kebutuhan nyata di lapangan. Di dalamnya memuat target kompetensi, jadwal pelaksanaan, serta instrumen penilaian yang objektif.</p>
                <p>Kami menyampaikan terima kasih kepada tim pengembang kurikulum, rekan-rekan guru, dan pengawas sekolah yang telah memberikan masukan berharga. Kritik dan saran demi kesempurnaan program ini sangat kami harapkan.</p>
            </div>
            
            <div className="pt-10 flex justify-end">
                <div className="text-center w-64">
                    <p className="text-sm">Mojokerto, Juli 2025</p>
                    <p className="text-sm mb-24 font-bold uppercase">Kepala Sekolah,</p>
                    <p className="font-bold underline uppercase text-sm">{settings.namaKepalaSekolah}</p>
                    <p className="text-[10px] uppercase font-mono tracking-tighter">NIP. {settings.nipKepalaSekolah}</p>
                </div>
            </div>
            <PageFooter pageNum={2} />
        </div>

        {/* 3. DAFTAR ISI (P3) */}
        <div className="min-h-[296mm] relative py-20 px-24 space-y-12 break-after-page">
            <h2 className="text-center text-xl font-bold uppercase underline decoration-2 underline-offset-8">DAFTAR ISI</h2>
            
            <div className="space-y-4 text-sm font-medium">
                <div className="flex justify-between border-b border-dotted border-slate-300 pb-1"><span>HALAMAN JUDUL</span><span>i</span></div>
                <div className="flex justify-between border-b border-dotted border-slate-300 pb-1"><span>KATA PENGANTAR</span><span>ii</span></div>
                <div className="flex justify-between border-b border-dotted border-slate-300 pb-1 font-bold"><span>DAFTAR ISI</span><span>iii</span></div>
                
                <div className="pt-4 space-y-4">
                   <div className="flex justify-between font-bold"><span>BAB 1. PENDAHULUAN</span><span>1</span></div>
                   <div className="pl-6 space-y-2 text-slate-700 font-normal">
                      <div className="flex justify-between"><span>a. Latar Belakang</span><span>1</span></div>
                      <div className="flex justify-between"><span>b. Landasan Hukum</span><span>2</span></div>
                      <div className="flex justify-between"><span>c. Tujuan Supervisi</span><span>3</span></div>
                      <div className="flex justify-between"><span>d. Ruang Lingkup</span><span>3</span></div>
                   </div>

                   <div className="flex justify-between font-bold"><span>BAB 2. ANALISIS HASIL SUPERVISI TAHUN {prevYear}</span><span>4</span></div>
                   <div className="pl-6 space-y-2 text-slate-700 font-normal">
                      <div className="flex justify-between"><span>a. Analisis Hasil Supervisi Akademis</span><span>4</span></div>
                      <div className="flex justify-between"><span>b. Rekapitulasi Capaian Tahun Sebelumnya</span><span>5</span></div>
                   </div>

                   <div className="flex justify-between font-bold"><span>BAB 3. RENCANA PELAKSANAAN SUPERVISI TAHUN {currentYear}</span><span>6</span></div>
                   <div className="pl-6 space-y-2 text-slate-700 font-normal">
                      <div className="flex justify-between"><span>a. Rencana Supervisi Akademis (Guru)</span><span>6</span></div>
                      <div className="flex justify-between"><span>b. Rencana Supervisi Internal Manajerial (Tendik)</span><span>7</span></div>
                      <div className="flex justify-between"><span>c. Jadwal Kegiatan Lengkap</span><span>8</span></div>
                   </div>

                   <div className="flex justify-between font-bold"><span>BAB 4. PENUTUP</span><span>9</span></div>
                   <div className="flex justify-between font-bold"><span>LAMPIRAN</span><span>10</span></div>
                </div>
            </div>
            <PageFooter pageNum={3} />
        </div>

        {/* 4. BAB 1: PENDAHULUAN (P4) */}
        <div className="min-h-[296mm] relative py-20 px-24 space-y-10 break-after-page">
            <h2 className="text-center text-xl font-black uppercase mb-8">BAB 1. PENDAHULUAN</h2>
            
            <div className="space-y-8 text-[13px] leading-relaxed">
                <section>
                    <h3 className="font-bold text-sm uppercase mb-3 flex items-center"><span className="mr-2">a.</span> Latar Belakang</h3>
                    <p className="text-justify indent-8 mb-4">Pendidikan yang berkualitas sangat ditentukan oleh kemampuan guru dalam mengelola proses pembelajaran yang menarik, menantang, dan bermakna bagi siswa. Di era Kurikulum Merdeka, tantangan guru semakin besar untuk dapat mengimplementasikan pembelajaran yang berdiferensiasi dan berfokus pada pengembangan Profil Pelajar Pancasila.</p>
                    <p className="text-justify indent-8">Supervisi akademik merupakan serangkaian kegiatan membantu guru mengembangkan kemampuannya dalam mengelola proses pembelajaran demi pencapaian tujuan pendidikan. Kegiatan ini merupakan layanan profesional yang diberikan kepada pendidik dan tenaga kependidikan untuk meningkatkan kualitas kinerja mereka secara kolaboratif.</p>
                </section>
                
                <section>
                    <h3 className="font-bold text-sm uppercase mb-3 flex items-center"><span className="mr-2">b.</span> Landasan Hukum</h3>
                    <p className="mb-2">Penyusunan program supervisi ini didasarkan pada peraturan sebagai berikut:</p>
                    <ul className="list-decimal pl-10 space-y-2">
                        <li>Undang-Undang Nomor 20 Tahun 2003 tentang Sistem Pendidikan Nasional.</li>
                        <li>Undang-Undang Nomor 14 Tahun 2005 tentang Guru dan Dosen.</li>
                        <li>Peraturan Pemerintah Nomor 19 Tahun 2017 tentang Perubahan atas PP No. 74 Tahun 2008 tentang Guru.</li>
                        <li>Permendiknas No. 13 Tahun 2007 tentang Standar Kepala Sekolah/Madrasah.</li>
                        <li>Permendikbudristek No. 21 Tahun 2022 tentang Standar Penilaian Pendidikan.</li>
                        <li>Kurikulum Operasional Satuan Pendidikan (KOSP) {settings.namaSekolah}.</li>
                    </ul>
                </section>

                <section>
                    <h3 className="font-bold text-sm uppercase mb-3 flex items-center"><span className="mr-2">c.</span> Tujuan</h3>
                    <p className="mb-2">Tujuan utama dari pelaksanaan supervisi tahun pelajaran {currentYear} adalah:</p>
                    <ul className="list-disc pl-10 space-y-1">
                        <li>Membina guru dalam menyusun perangkat ajar (ATP dan Modul Ajar).</li>
                        <li>Memantau pelaksanaan proses pembelajaran di dalam kelas sesuai standar proses.</li>
                        <li>Mengevaluasi sistem penilaian yang digunakan agar selaras dengan capaian pembelajaran.</li>
                        <li>Memberikan umpan balik (feedback) objektif untuk perbaikan kinerja guru dan staf.</li>
                    </ul>
                </section>
            </div>
            <PageFooter pageNum={4} />
        </div>

        {/* 5. BAB 2: ANALISIS HASIL (P5) */}
        <div className="min-h-[296mm] relative py-20 px-24 space-y-10 break-after-page">
            <h2 className="text-center text-xl font-black uppercase mb-8">BAB 2. ANALISIS HASIL SUPERVISI TAHUN {prevYear}</h2>
            
            <div className="space-y-8 text-[13px]">
                <section>
                    <h3 className="font-bold text-sm uppercase mb-3 flex items-center"><span className="mr-2">a.</span> Analisis Hasil Supervisi Akademis Tahun {prevYear}</h3>
                    <p className="text-justify mb-4">Evaluasi hasil supervisi pada tahun pelajaran sebelumnya menunjukkan bahwa secara kolektif, tingkat kompetensi pedagogik guru di {settings.namaSekolah} mencapai rata-rata skor **82.5 (Kategori Baik)**. Namun, ditemukan beberapa aspek yang memerlukan perhatian khusus, antara lain:</p>
                    <ul className="list-disc pl-10 space-y-1 mb-4 italic text-slate-600">
                        <li>Pemanfaatan media pembelajaran interaktif berbasis teknologi informasi (IT) masih perlu ditingkatkan.</li>
                        <li>Instrumen penilaian psikomotorik (keterampilan) masih bersifat konvensional dan kurang bervariasi.</li>
                        <li>Dokumentasi hasil remedial dan pengayaan belum tertib secara administratif.</li>
                    </ul>
                </section>

                <section>
                    <h3 className="font-bold text-sm uppercase mb-3 flex items-center"><span className="mr-2">b.</span> Rekapitulasi Capaian</h3>
                    <table className="w-full border-collapse border border-slate-400 text-[11px] mt-4">
                        <thead>
                            <tr className="bg-slate-50 uppercase font-bold text-center">
                                <th className="border border-slate-400 p-2">Aspek Supervisi</th>
                                <th className="border border-slate-400 p-2">Capaian (%)</th>
                                <th className="border border-slate-400 p-2">Kriteria</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="text-center">
                                <td className="border border-slate-400 p-2 text-left">Administrasi Perencanaan (Modul Ajar)</td>
                                <td className="border border-slate-400 p-2 font-bold">88%</td>
                                <td className="border border-slate-400 p-2">Sangat Baik</td>
                            </tr>
                            <tr className="text-center">
                                <td className="border border-slate-400 p-2 text-left">Pelaksanaan Proses Pembelajaran</td>
                                <td className="border border-slate-400 p-2 font-bold">78%</td>
                                <td className="border border-slate-400 p-2">Baik</td>
                            </tr>
                            <tr className="text-center">
                                <td className="border border-slate-400 p-2 text-left">Pelaksanaan Evaluasi/Penilaian</td>
                                <td className="border border-slate-400 p-2 font-bold">75%</td>
                                <td className="border border-slate-400 p-2">Cukup</td>
                            </tr>
                        </tbody>
                    </table>
                </section>
            </div>
            <PageFooter pageNum={5} />
        </div>

        {/* 6. BAB 3: RENCANA PELAKSANAAN (P6) */}
        <div className="min-h-[296mm] relative py-20 px-24 space-y-10 break-after-page">
            <h2 className="text-center text-xl font-black uppercase mb-8">BAB 3. RENCANA PELAKSANAAN SUPERVISI TAHUN {currentYear}</h2>
            
            <div className="space-y-6 text-[13px]">
                <section>
                    <h3 className="font-bold text-sm uppercase mb-2">a. Fokus Rencana Supervisi Akademis</h3>
                    <p className="text-justify leading-relaxed">Pada tahun ini, supervisi akan difokuskan pada implementasi **Pembelajaran Berdiferensiasi** dan integrasi literasi-numerasi dalam setiap mata pelajaran. Supervisor akan melakukan kunjungan kelas secara terjadwal untuk mengamati langsung bagaimana guru merespon kebutuhan belajar siswa yang beragam.</p>
                </section>

                <section>
                    <h3 className="font-bold text-sm uppercase mb-4">b. Jadwal Kegiatan Supervisi Akademis (Guru)</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border-2 border-slate-900 text-[10px]">
                            <thead>
                                <tr className="bg-slate-100 font-bold text-center uppercase">
                                    <th className="border-2 border-slate-900 p-2 w-10">No</th>
                                    <th className="border-2 border-slate-900 p-2 text-left">Nama Lengkap Guru</th>
                                    <th className="border-2 border-slate-900 p-2">Mata Pelajaran</th>
                                    <th className="border-2 border-slate-900 p-2">Hari, Tanggal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records?.filter(r => r.semester === settings.semester).map((r, i) => (
                                    <tr key={r.id}>
                                        <td className="border-2 border-slate-900 p-2 text-center">{i+1}</td>
                                        <td className="border-2 border-slate-900 p-2 font-bold uppercase">{r.namaGuru}</td>
                                        <td className="border-2 border-slate-900 p-2 italic">{r.mataPelajaran}</td>
                                        <td className="border-2 border-slate-900 p-2 text-center text-blue-800">{r.hari || '-'}, {r.tanggalPemb || r.tanggalAdm || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section>
                    <h3 className="font-bold text-sm uppercase mb-4">c. Jadwal Supervisi Internal Manajerial (Tendik)</h3>
                    <table className="w-full border-collapse border-2 border-slate-900 text-[10px]">
                        <thead>
                            <tr className="bg-slate-100 font-bold text-center uppercase">
                                <th className="border-2 border-slate-900 p-2 w-10">No</th>
                                <th className="border-2 border-slate-900 p-2 text-left">Nama Petugas</th>
                                <th className="border-2 border-slate-900 p-2 text-left">Tugas Utama</th>
                                <th className="border-2 border-slate-900 p-2">Waktu Pelaksanaan</th>
                            </tr>
                        </thead>
                        <tbody>
                            {adminRecords?.filter(r => r.semester === settings.semester).map((r, i) => (
                                <tr key={r.id}>
                                    <td className="border-2 border-slate-900 p-2 text-center">{i+1}</td>
                                    <td className="border-2 border-slate-900 p-2 font-bold uppercase">{r.nama}</td>
                                    <td className="border-2 border-slate-900 p-2 italic">{r.kegiatan}</td>
                                    <td className="border-2 border-slate-900 p-2 text-center text-emerald-800">{r.hari}, {r.tgl}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            </div>
            <PageFooter pageNum={6} />
        </div>

        {/* 7. BAB 4: PENUTUP & LAMPIRAN (P7) */}
        <div className="min-h-[296mm] relative py-20 px-24 space-y-12">
            <section>
               <h2 className="text-center text-xl font-black uppercase mb-8">BAB 4. PENUTUP</h2>
               <p className="text-justify text-[13px] leading-relaxed indent-8">Demikian Dokumen Program Supervisi di {settings.namaSekolah} ini disusun dengan penuh tanggung jawab. Program ini diharapkan menjadi panduan operasional bagi seluruh civitas akademika dalam mewujudkan ekosistem sekolah yang berorientasi pada kualitas. Keberhasilan program ini sangat bergantung pada kerjasama, kejujuran, dan keterbukaan antara supervisor dan yang disupervisi dalam rangka refleksi perbaikan bersama.</p>
            </section>
            
            <section className="pt-10">
               <h2 className="text-xl font-black uppercase mb-4 tracking-wider">LAMPIRAN-LAMPIRAN</h2>
               <div className="text-sm font-bold italic space-y-2 border-l-4 border-slate-200 pl-6 text-slate-500 uppercase">
                  <p>1. Instrumen Telaah ATP dan Modul Ajar</p>
                  <p>2. Instrumen Observasi Pelaksanaan Pembelajaran</p>
                  <p>3. Instrumen Supervisi Administrasi Tendik</p>
                  <p>4. Form Tindak Lanjut Hasil Supervisi</p>
               </div>
            </section>

            <div className="pt-20 grid grid-cols-2 text-sm font-bold text-center gap-12">
                <div className="space-y-24">
                    <p className="uppercase leading-tight">Mengetahui,<br/>Pengawas Pembina,</p>
                    <div>
                        <p className="underline uppercase font-black">{settings.namaPengawas}</p>
                        <p className="text-[10px] uppercase font-mono">NIP. {settings.nipPengawas}</p>
                    </div>
                </div>
                <div className="space-y-24">
                    <p className="uppercase leading-tight">Mojokerto, Juli 2025<br/>Kepala {settings.namaSekolah},</p>
                    <div>
                        <p className="underline uppercase font-black">{settings.namaKepalaSekolah}</p>
                        <p className="text-[10px] uppercase font-mono">NIP. {settings.nipKepalaSekolah}</p>
                    </div>
                </div>
            </div>
            <PageFooter pageNum={7} />
        </div>

      </div>
    </div>
  );
};

export default ProgramDocView;
