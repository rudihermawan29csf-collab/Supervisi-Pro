
import { TeacherRecord, SupervisionStatus } from './types';

export const CLASS_LIST = ['VII A', 'VII B', 'VII C', 'VIII A', 'VIII B', 'VIII C', 'IX A', 'IX B', 'IX C'];

export const SCHEDULE_TEACHERS = [
  { nama: 'Dra. Sri Hayati', kode: 'BIN-SH', nip: '19670628 200801 2 006', mapel: 'Bahasa Indonesia' },
  { nama: 'Bakhtiar Rifai, S.E', kode: 'IPS-BR', nip: '19800304 200801 1 009', mapel: 'IPS' },
  { nama: 'Akhmad Hariadi, S.Pd', kode: 'BIG-AH', nip: '19751108 200901 1 001', mapel: 'Bahasa Inggris & Informatika' },
  { nama: 'Moch. Husain Rifai Hamzah, S.Pd.', kode: 'PJOK-MH', nip: '19920316 202012 1 011', mapel: 'PJOK' },
  { nama: 'Rudi Hermawan, S.Pd.I', kode: 'PAI-RH', nip: '19891029 202012 1 003', mapel: 'Pendidikan Agama Islam' },
  { nama: 'Okha Devi Anggraini, S.Pd.', kode: 'BK-OD', nip: '19941002 202012 2 008', mapel: 'BK' },
  { nama: 'Eka Hariyati, S.Pd.', kode: 'PKN-EH', nip: '19731129 202421 2 003', mapel: 'Pendidikan Pancasila' },
  { nama: 'Retno Nawangwulan, S.Pd.', kode: 'BIG-RN', nip: '19850703 202521 2 006', mapel: 'Bahasa Inggris & Informatika' },
  { nama: 'Mikoe Wahyudi Putra, S.T., S.Pd.', kode: 'BK-MW', nip: '19820222 202421 1 004', mapel: 'BK' },
  { nama: 'Purnadi, S.Pd.', kode: 'MAT-PU', nip: '19680705 202421 1 001', mapel: 'Matematika' },
  { nama: 'Israfin Maria Ulfa, S.Pd', kode: 'IPS-MU', nip: '19850131 202521 2 004', mapel: 'IPS & Bahasa Indonesia' },
  { nama: 'Syadam Budi Satrianto, S.Pd', kode: 'BAJA-SB', nip: '-', mapel: 'Bahasa Jawa' },
  { nama: 'Rebby Dwi Prataopu, S.Si', kode: 'IPA-RB', nip: '-', mapel: 'IPA' },
  { nama: 'Fakhita Madury, S.Sn.', kode: 'SENI-FA', nip: '-', mapel: 'Seni & Informatika' },
  { nama: 'Mukhamad Yunus, S.Pd', kode: 'IPA-MY', nip: '-', mapel: 'IPA & Matematika' },
  { nama: 'Fahmi Wahyuni, S.Pd', kode: 'BIN-FW', nip: '-', mapel: 'Bahasa Indonesia' }
];

export const INITIAL_TEACHERS: TeacherRecord[] = SCHEDULE_TEACHERS.map((t, idx) => ({
  id: idx + 1,
  no: idx + 1,
  namaGuru: t.nama,
  nip: t.nip,
  kode: t.kode,
  mataPelajaran: t.mapel,
  pangkatGolongan: t.nip !== '-' ? 'Pembina, IV/a' : '-',
  hari: '',
  tanggal: '',
  kelas: '',
  jamKe: '',
  status: SupervisionStatus.PENDING,
  semester: 'Ganjil'
}));

export const DATA_PTT = [
  {
    no: 1,
    nama: "Imam Safi'i",
    nip: '-',
    jabatan: 'PTT',
    tugas: [
      { label: 'Koordinator Tenaga Administrasi', detail: 'Struktur Organisasi, File Guru, Papan Data' },
      { label: 'Operator PPDB & Dapodik', detail: 'E-Rapor, NIS, Mutasi Siswa' }
    ]
  },
  {
    no: 2,
    nama: "Mansyur Rohmad",
    nip: '-',
    jabatan: 'PTT',
    tugas: [
      { label: 'Sarana Prasarana', detail: 'Buku Induk Barang, Inventaris Kelas' },
      { label: 'Laboran', detail: 'Petugas Perpustakaan & Lab IPA' }
    ]
  },
  {
    no: 3,
    nama: "Rayi Putri Lestari, S.Pd.",
    nip: '-',
    jabatan: 'PTT',
    tugas: [
      { label: 'Administrasi Persuratan', detail: 'Agenda, Ekspidisi, Filling, Buku Tamu' },
      { label: 'Staf Kurikulum', detail: 'KIP/PIP, Arsip Ijazah, DUK' }
    ]
  },
  {
    no: 4,
    nama: "Mochamad Ansori",
    nip: '-',
    jabatan: 'PTT',
    tugas: [
      { label: 'Layanan Khusus', detail: 'Kurir Persuratan, Kebersihan Lingkungan' }
    ]
  }
];

export const FULL_SCHEDULE = [
  {
    day: 'Senin',
    rows: [
      { ke: 0, waktu: '06.30-06.45', activity: 'Persiapan Upacara Bendera' },
      { ke: 1, waktu: '06.45-07.40', activity: 'Upacara Bendera' },
      { ke: 2, waktu: '07.40-08.20', classes: { 'VII A': 'MAT-MY', 'VII B': 'BAJA-SB', 'VII C': 'PJOK-MH', 'VIII A': 'BIG-RN', 'VIII B': 'IPS-BR', 'VIII C': 'PKN-EH', 'IX A': 'MAT-PU', 'IX B': 'BIN-SH', 'IX C': 'IPS-MU' } },
      { ke: 3, waktu: '08.20-09.00', classes: { 'VII A': 'MAT-MY', 'VII B': 'BAJA-SB', 'VII C': 'PJOK-MH', 'VIII A': 'BIG-RN', 'VIII B': 'IPS-BR', 'VIII C': 'PKN-EH', 'IX A': 'MAT-PU', 'IX B': 'BIN-SH', 'IX C': 'IPS-MU' } },
      { waktu: '09.00-09.20', activity: 'Istirahat ke-1' },
      { ke: 4, waktu: '09.20-10.00', classes: { 'VII A': 'BIN-FW', 'VII B': 'IPA-RB', 'VII C': 'PJOK-MH', 'VIII A': 'IPA-MY', 'VIII B': 'BK-MW', 'VIII C': 'PKN-EH', 'IX A': 'MAT-PU', 'IX B': 'BIN-SH', 'IX C': 'PAI-RH' } },
      { ke: 5, waktu: '10.00-10.40', classes: { 'VII A': 'BIN-FW', 'VII B': 'IPA-RB', 'VII C': 'SENI-FA', 'VIII A': 'IPA-MY', 'VIII B': 'BIG-RN', 'VIII C': 'MAT-PU', 'IX A': 'BIN-SH', 'IX B': 'PJOK-MH', 'IX C': 'PAI-RH' } },
      { ke: 6, waktu: '10.40-11.20', classes: { 'VII A': 'BIN-FW', 'VII B': 'IPA-RB', 'VII C': 'SENI-FA', 'VIII A': 'IPA-MY', 'VIII B': 'BIG-RN', 'VIII C': 'MAT-PU', 'IX A': 'BIN-SH', 'IX B': 'PJOK-MH', 'IX C': 'PAI-RH' } },
      { waktu: '11.20-11.50', activity: 'Istirahat 2 / Sholat Dzuhur Berjamaah' },
      { ke: 7, waktu: '11.50-12.25', classes: { 'VII A': 'IPS-MU', 'VII B': 'BIG-AH', 'VII C': 'MAT-MY', 'VIII A': 'IPS-BR', 'VIII B': 'BAJA-SB', 'VIII C': 'BIG-RN', 'IX A': 'SENI-FA', 'IX B': 'PJOK-MH', 'IX C': 'IPA-RB' } },
      { ke: 8, waktu: '12.25-13.00', classes: { 'VII A': 'IPS-MU', 'VII B': 'BIG-AH', 'VII C': 'MAT-MY', 'VIII A': 'IPS-BR', 'VIII B': 'BAJA-SB', 'VIII C': 'BIG-RN', 'IX A': 'SENI-FA', 'IX B': 'BK-OD', 'IX C': 'IPA-RB' } }
    ]
  },
  {
    day: 'Selasa',
    rows: [
      { ke: 0, waktu: '06.30-07.00', activity: 'Apel Pagi / Pembacaan Surat Ar-Rahman' },
      { ke: 1, waktu: '07.00-07.40', classes: { 'VII A': 'SENI-FA', 'VII B': 'IPS-MU', 'VII C': 'IPA-RB', 'VIII A': 'BIN-FW', 'VIII B': 'PJOK-MH', 'VIII C': 'IPS-BR', 'IX A': 'BIG-RN', 'IX B': 'BAJA-SB', 'IX C': 'BIN-SH' } },
      { ke: 2, waktu: '07.40-08.20', classes: { 'VII A': 'SENI-FA', 'VII B': 'IPS-MU', 'VII C': 'IPA-RB', 'VIII A': 'BIN-FW', 'VIII B': 'PJOK-MH', 'VIII C': 'IPS-BR', 'IX A': 'BIG-RN', 'IX B': 'BAJA-SB', 'IX C': 'BIN-SH' } },
      { ke: 3, waktu: '08.20-09.00', classes: { 'VII A': 'PKN-EH', 'VII B': 'SENI-FA', 'VII C': 'BK-OD', 'VIII A': 'BIN-FW', 'VIII B': 'PJOK-MH', 'VIII C': 'BK-MW', 'IX A': 'PAI-RH', 'IX B': 'BIG-RN', 'IX C': 'BIN-SH' } },
      { waktu: '09.00-09.20', activity: 'Istirahat ke-1' },
      { ke: 4, waktu: '09.20-10.00', classes: { 'VII A': 'PKN-EH', 'VII B': 'SENI-FA', 'VII C': 'BIN-FW', 'VIII A': 'MAT-PU', 'VIII B': 'BIG-RN', 'VIII C': 'BAJA-SB', 'IX A': 'PAI-RH', 'IX B': 'IPA-RB', 'IX C': 'PJOK-MH' } },
      { ke: 5, waktu: '10.00-10.40', classes: { 'VII A': 'PKN-EH', 'VII B': 'BK-OD', 'VII C': 'BIN-FW', 'VIII A': 'MAT-PU', 'VIII B': 'BIG-RN', 'VIII C': 'BAJA-SB', 'IX A': 'PAI-RH', 'IX B': 'IPA-RB', 'IX C': 'PJOK-MH' } },
      { ke: 6, waktu: '10.40-11.20', classes: { 'VII A': 'BK-OD', 'VII B': 'PKN-EH', 'VII C': 'BIN-FW', 'VIII A': 'PAI-RH', 'VIII B': 'IPA-MY', 'VIII C': 'BIN-SH', 'IX A': 'IPA-RB', 'IX B': 'MAT-PU', 'IX C': 'PJOK-MH' } },
      { waktu: '11.20-11.50', activity: 'Istirahat 2 / Sholat Dzuhur Berjamaah' },
      { ke: 7, waktu: '11.50-12.25', classes: { 'VII A': 'IPS-MU', 'VII B': 'PKN-EH', 'VII C': 'BAJA-SB', 'VIII A': 'PAI-RH', 'VIII B': 'IPA-MY', 'VIII C': 'BIN-SH', 'IX A': 'IPA-RB', 'IX B': 'MAT-PU', 'IX C': 'BIG-RN' } },
      { ke: 8, waktu: '12.25-13.00', classes: { 'VII A': 'IPS-MU', 'VII B': 'PKN-EH', 'VII C': 'BAJA-SB', 'VIII A': 'PAI-RH', 'VIII B': 'IPA-MY', 'VIII C': 'BIN-SH', 'IX A': 'BK-OD', 'IX B': 'MAT-PU', 'IX C': 'BIG-RN' } }
    ]
  },
  {
    day: 'Rabu',
    rows: [
      { ke: 0, waktu: '06.30-07.00', activity: "Apel Pagi / Pembacaan Surat Al Waqi'ah" },
      { ke: 1, waktu: '07.00-07.40', classes: { 'VII A': 'PJOK-MH', 'VII B': 'INF-FA', 'VII C': 'MAT-MY', 'VIII A': 'BIG-RN', 'VIII B': 'BIN-SH', 'VIII C': 'PAI-RH', 'IX A': 'IPS-MU', 'IX B': 'IPA-RB', 'IX C': 'PKN-EH' } },
      { ke: 2, waktu: '07.40-08.20', classes: { 'VII A': 'PJOK-MH', 'VII B': 'INF-FA', 'VII C': 'MAT-MY', 'VIII A': 'BIG-RN', 'VIII B': 'BIN-SH', 'VIII C': 'PAI-RH', 'IX A': 'IPS-MU', 'IX B': 'IPA-RB', 'IX C': 'PKN-EH' } },
      { ke: 3, waktu: '08.20-09.00', classes: { 'VII A': 'PJOK-MH', 'VII B': 'INF-FA', 'VII C': 'MAT-MY', 'VIII A': 'BK-MW', 'VIII B': 'BIN-SH', 'VIII C': 'PAI-RH', 'IX A': 'IPS-MU', 'IX B': 'IPA-RB', 'IX C': 'PKN-EH' } },
      { waktu: '09.00-09.20', activity: 'Istirahat ke-1' },
      { ke: 4, waktu: '09.20-10.00', classes: { 'VII A': 'IPA-RB', 'VII B': 'PJOK-MH', 'VII C': 'INF-FA', 'VIII A': 'IPA-MY', 'VIII B': 'PKN-EH', 'VIII C': 'INF-RN', 'IX A': 'INF-AH', 'IX B': 'PAI-RH', 'IX C': 'IPS-MU' } },
      { ke: 5, waktu: '10.00-10.40', classes: { 'VII A': 'IPA-RB', 'VII B': 'PJOK-MH', 'VII C': 'INF-FA', 'VIII A': 'IPA-MY', 'VIII B': 'PKN-EH', 'VIII C': 'INF-RN', 'IX A': 'INF-AH', 'IX B': 'PAI-RH', 'IX C': 'IPS-MU' } },
      { ke: 6, waktu: '10.40-11.20', classes: { 'VII A': 'IPA-RB', 'VII B': 'PJOK-MH', 'VII C': 'INF-FA', 'VIII A': 'BIN-FW', 'VIII B': 'PKN-EH', 'VIII C': 'INF-RN', 'IX A': 'INF-AH', 'IX B': 'PAI-RH', 'IX C': 'BIN-SH' } },
      { waktu: '11.20-11.50', activity: 'Istirahat 2 / Sholat Dzuhur Berjamaah' },
      { ke: 7, waktu: '11.50-12.25', classes: { 'VII A': 'BIG-AH', 'VII B': 'IPA-RB', 'VII C': 'IPS-MU', 'VIII A': 'BIN-FW', 'VIII B': 'IPA-MY', 'VIII C': 'SENI-FA', 'IX A': 'MAT-PU', 'IX B': 'BIG-RN', 'IX C': 'BIN-SH' } },
      { ke: 8, waktu: '12.25-13.00', classes: { 'VII A': 'BIG-AH', 'VII B': 'IPA-RB', 'VII C': 'IPS-MU', 'VIII A': 'BIN-FW', 'VIII B': 'IPA-MY', 'VIII C': 'SENI-FA', 'IX A': 'MAT-PU', 'IX B': 'BIG-RN', 'IX C': 'BIN-SH' } }
    ]
  },
  {
    day: 'Kamis',
    rows: [
      { ke: 0, waktu: '06.30-07.00', activity: 'Apel Pagi / Pembacaan Istighotsah' },
      { ke: 1, waktu: '07.00-07.40', classes: { 'VII A': 'INF-FA', 'VII B': 'BIN-FW', 'VII C': 'IPA-RB', 'VIII A': 'PKN-EH', 'VIII B': 'PAI-RH', 'VIII C': 'PJOK-MH', 'IX A': 'BIG-RN', 'IX B': 'INF-AH', 'IX C': 'MAT-PU' } },
      { ke: 2, waktu: '07.40-08.20', classes: { 'VII A': 'INF-FA', 'VII B': 'BIN-FW', 'VII C': 'IPA-RB', 'VIII A': 'PKN-EH', 'VIII B': 'PAI-RH', 'VIII C': 'PJOK-MH', 'IX A': 'BIG-RN', 'IX B': 'INF-AH', 'IX C': 'MAT-PU' } },
      { ke: 3, waktu: '08.20-09.00', classes: { 'VII A': 'INF-FA', 'VII B': 'BIN-FW', 'VII C': 'IPA-RB', 'VIII A': 'PKN-EH', 'VIII B': 'PAI-RH', 'VIII C': 'PJOK-MH', 'IX A': 'IPS-MU', 'IX B': 'INF-AH', 'IX C': 'MAT-PU' } },
      { waktu: '09.00-09.20', activity: 'Istirahat ke-1' },
      { ke: 4, waktu: '09.20-10.00', classes: { 'VII A': 'PAI-RH', 'VII B': 'MAT-MY', 'VII C': 'IPS-MU', 'VIII A': 'PJOK-MH', 'VIII B': 'BIN-SH', 'VIII C': 'MAT-PU', 'IX A': 'IPA-RB', 'IX B': 'PKN-EH', 'IX C': 'SENI-FA' } },
      { ke: 5, waktu: '10.00-10.40', classes: { 'VII A': 'PAI-RH', 'VII B': 'MAT-MY', 'VII C': 'IPS-MU', 'VIII A': 'PJOK-MH', 'VIII B': 'BIN-SH', 'VIII C': 'MAT-PU', 'IX A': 'IPA-RB', 'IX B': 'PKN-EH', 'IX C': 'SENI-FA' } },
      { ke: 6, waktu: '10.40-11.20', classes: { 'VII A': 'PAI-RH', 'VII B': 'MAT-MY', 'VII C': 'BIN-FW', 'VIII A': 'PJOK-MH', 'VIII B': 'BIN-SH', 'VIII C': 'MAT-PU', 'IX A': 'IPA-RB', 'IX B': 'PKN-EH', 'IX C': 'BK-OD' } },
      { waktu: '11.20-11.50', activity: 'Istirahat 2 / Sholat Dzuhur Berjamaah' },
      { ke: 7, waktu: '11.50-12.25', classes: { 'VII A': 'IPA-RB', 'VII B': 'BIG-AH', 'VII C': 'BIN-FW', 'VIII A': 'IPS-BR', 'VIII B': 'SENI-FA', 'VIII C': 'IPA-MY', 'IX A': 'BIN-SH', 'IX B': 'MAT-PU', 'IX C': 'BIG-RN' } },
      { ke: 8, waktu: '12.25-13.00', classes: { 'VII A': 'IPA-RB', 'VII B': 'BIG-AH', 'VII C': 'BIN-FW', 'VIII A': 'IPS-BR', 'VIII B': 'SENI-FA', 'VIII C': 'IPA-MY', 'IX A': 'BIN-SH', 'IX B': 'MAT-PU', 'IX C': 'BIG-RN' } }
    ]
  },
  {
    day: "Jum'at",
    rows: [
      { ke: 0, waktu: '06.30-07.00', activity: 'Apel Pagi / Pembacaan Surat Yasin' },
      { ke: 1, waktu: '07.00-07.40', classes: { 'VII A': 'BAJA-SB', 'VII B': 'PAI-RH', 'VII C': 'PKN-EH', 'VIII A': 'INF-RN', 'VIII B': 'MAT-PU', 'VIII C': 'IPA-MY', 'IX A': 'PJOK-MH', 'IX B': 'BIN-SH', 'IX C': 'INF-AH' } },
      { ke: 2, waktu: '07.40-08.20', classes: { 'VII A': 'BAJA-SB', 'VII B': 'PAI-RH', 'VII C': 'PKN-EH', 'VIII A': 'INF-RN', 'VIII B': 'MAT-PU', 'VIII C': 'IPA-MY', 'IX A': 'PJOK-MH', 'IX B': 'BIN-SH', 'IX C': 'INF-AH' } },
      { ke: 3, waktu: '08.20-09.00', classes: { 'VII A': 'BIN-FW', 'VII B': 'PAI-RH', 'VII C': 'PKN-EH', 'VIII A': 'INF-RN', 'VIII B': 'MAT-PU', 'VIII C': 'IPA-MY', 'IX A': 'PJOK-MH', 'IX B': 'BIN-SH', 'IX C': 'INF-AH' } },
      { waktu: '09.00-09.20', activity: 'Istirahat' },
      { ke: 4, waktu: '09.20-10.00', classes: { 'VII A': 'BIN-FW', 'VII B': 'MAT-MY', 'VII C': 'BIG-AH', 'VIII A': 'BAJA-SB', 'VIII B': 'IPS-BR', 'VIII C': 'BIG-RN', 'IX A': 'BIN-SH', 'IX B': 'IPS-MU', 'IX C': 'MAT-PU' } },
      { ke: 5, waktu: '10.00-10.40', classes: { 'VII A': 'BIN-FW', 'VII B': 'MAT-MY', 'VII C': 'BIG-AH', 'VIII A': 'BAJA-SB', 'VIII B': 'IPS-BR', 'VIII C': 'BIG-RN', 'IX A': 'BIN-SH', 'IX B': 'IPS-MU', 'IX C': 'MAT-PU' } }
    ]
  },
  {
    day: 'Sabtu',
    rows: [
      { ke: 0, waktu: '06.30-07.00', activity: "Apel Pagi / Pembacaan Asma'ul Husna dan Juz 'Amma" },
      { ke: 1, waktu: '07.00-07.40', activity: 'Sabtu Sehat Jiwa Raga' },
      { ke: 2, waktu: '07.40-08.20', classes: { 'VII A': 'BIG-AH', 'VII B': 'BIN-FW', 'VII C': 'PAI-RH', 'VIII A': 'SENI-FA', 'VIII B': 'MAT-PU', 'VIII C': 'BIN-SH', 'IX A': 'BAJA-SB', 'IX B': 'BIG-RN', 'IX C': 'IPA-RB' } },
      { ke: 3, waktu: '08.20-09.00', classes: { 'VII A': 'BIG-AH', 'VII B': 'BIN-FW', 'VII C': 'PAI-RH', 'VIII A': 'SENI-FA', 'VIII B': 'MAT-PU', 'VIII C': 'BIN-SH', 'IX A': 'BAJA-SB', 'IX B': 'IPS-MU', 'IX C': 'IPA-RB' } },
      { waktu: '09.00-09.20', activity: 'Istirahat' },
      { ke: 4, waktu: '09.20-10.00', classes: { 'VII A': 'MAT-MY', 'VII B': 'BIN-FW', 'VII C': 'PAI-RH', 'VIII A': 'MAT-PU', 'VIII B': 'INF-RN', 'VIII C': 'BIN-SH', 'IX A': 'PKN-EH', 'IX B': 'IPS-MU', 'IX C': 'IPA-RB' } },
      { ke: 5, waktu: '10.00-10.40', classes: { 'VII A': 'MAT-MY', 'VII B': 'IPS-MU', 'VII C': 'BIG-AH', 'VIII A': 'MAT-PU', 'VIII B': 'INF-RN', 'VIII C': 'IPS-BR', 'IX A': 'PKN-EH', 'IX B': 'SENI-FA', 'IX C': 'BAJA-SB' } },
      { ke: 6, waktu: '10.40-11.20', classes: { 'VII A': 'MAT-MY', 'VII B': 'IPS-MU', 'VII C': 'BIG-AH', 'VIII A': 'MAT-PU', 'VIII B': 'INF-RN', 'VIII C': 'IPS-BR', 'IX A': 'PKN-EH', 'IX B': 'SENI-FA', 'IX C': 'BAJA-SB' } },
      { waktu: '11.20-12.00', activity: 'Sholat Dhuhur Berjamaah' },
      { waktu: '12.00-Selesai', activity: 'Kegiatan Pengembangan Diri (Ekstrakurikuler)' }
    ]
  }
];
