
export enum SupervisionStatus {
  PENDING = 'Belum Terlaksana',
  COMPLETED = 'Terlaksana',
  RESCHEDULED = 'Dijadwal Ulang'
}

export interface TeacherRecord {
  id: number;
  no: number;
  hari: string;
  tanggal: string;
  namaGuru: string;
  mataPelajaran: string;
  kelas: string;
  jamKe: string;
  status: SupervisionStatus;
  feedbackAI?: string;
  semester: 'Ganjil' | 'Genap';
  nip?: string;
  kode?: string; // Teacher Code (e.g., MAT-PU)
  pangkatGolongan?: string;
  nilaiAdm?: number;
  nilaiATP?: number;
  nilaiModul?: number;
  nilai?: number; 
  nilaiPenilaian?: number;
  catatan?: string;
  tindakLanjut?: string;
  realisasi?: string;
  saran?: string;
  tanggalAdm?: string;
  tanggalPemb?: string;
  pukul?: string;
  pewawancara?: string;
  tempat?: string;
}

export type ViewType = 
  | 'dashboard' | 'supervision' | 'settings' | 'schedule' 
  | 'prog-extra'
  | 'supervision-admin-guru' | 'schedule-admin' | 'schedule-extra'
  | 'inst-atp' | 'inst-modul' | 'inst-administrasi' | 'inst-pelaksanaan' | 'inst-penilaian' | 'inst-hasil-observasi' | 'inst-post-observasi'
  | 'tendik-sekolah' | 'tendik-ketenagaan' | 'tendik-perlengkapan' | 'tendik-perpustakaan' | 'tendik-lab-ipa' | 'tendik-lab-komputer' | 'tendik-kesiswaan' | 'inst-ekstra'
  | 'ptl-akademik' | 'ptl-tendik' | 'ptl-extra' | 'results-followup-action'
  | 'lap-akademik' | 'lap-tendik' | 'lap-extra'
  | 'lap-analisis-pbm' | 'lap-catatan-pbm' | 'lap-rekap-akademik' | 'lap-ptl-akademik' | 'lap-action-akademik';

export interface DateRange {
  from: string;
  to: string;
}

export interface ScoreSettings {
  excellent: number;
  good: number;
  fair: number;
}

export interface AppSettings {
  namaSekolah: string;
  namaAdministrator: string;
  nipAdministrator: string;
  tahunPelajaran: string;
  semester: 'Ganjil' | 'Genap';
  namaKepalaSekolah: string;
  nipKepalaSekolah: string;
  namaPengawas: string;
  nipPengawas: string;
  rangePembelajaranGuru: DateRange;
  rangePembelajaranGuruGenap: DateRange;
  rangeAdmGuruGanjil: DateRange;
  rangeAdmGuruGenap: DateRange;
  rangeTendikGanjil: DateRange;
  rangeTendikGenap: DateRange;
  rangeExtraGanjil: DateRange;
  rangeExtraGenap: DateRange;
  supervisors: string[];
  tanggalCetak: string; // Legacy
  tanggalCetakGanjil: string;
  tanggalCetakGenap: string;
  scoreSettings: ScoreSettings;
}

export interface InstrumentResult {
  scores: Record<string | number, any>;
  remarks: Record<string | number, string>;
  catatan?: string;
  tindakLanjut?: string;
  materi?: string;
  answers?: Record<number, string>;
  kesanUmum?: string;
  saran?: string;
  actions?: any;
}

export interface ExtraRecord {
  id: number;
  nama: string;
  nip: string;
  hari: string;
  tgl: string;
  pukul: string;
  ekstra: string;
  tempat: string;
  supervisor: string;
  semester: 'Ganjil' | 'Genap';
  status?: SupervisionStatus;
  nilai?: number;
}

export interface AdminRecord {
  id: number;
  nama: string;
  nip: string;
  hari: string;
  tgl: string;
  pukul: string;
  kegiatan: string;
  tempat: string;
  supervisor: string;
  semester: 'Ganjil' | 'Genap';
  status?: SupervisionStatus;
  nilai?: number;
}
