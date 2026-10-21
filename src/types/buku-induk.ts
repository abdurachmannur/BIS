export type Gender = 'L' | 'P';
export type AttendanceStatus = 'H' | 'S' | 'I' | 'A';
export type Major = 'MIPA' | 'IPS' | 'BAHASA' | 'UMUM' | string;
export type StudentStatus = 'Aktif' | 'Lulus' | 'Pindah' | 'Keluar';
export type GradeLevel = 'X' | 'XI' | 'XII' | string;
export type UserRole = 'super_admin' | 'wali_kelas' | 'guru_mapel';

export interface TeacherRecord {
  id: string;
  nip: string;
  namaLengkap: string;
  jabatanWaliKelas: string;
}

export interface SchoolProfile {
  namaSekolah: string;
  npsn: string;
  nss: string;
  akreditasi: string;
  alamat: string;
  kelurahan: string;
  kecamatan: string;
  kabupatenKota: string;
  provinsi: string;
  kodePos: string;
  nomorTelepon: string;
  email: string;
  website: string;
  namaKepalaSekolah: string;
  nipKepalaSekolah: string;
  logoUrl: string;
}

export interface AuthUser {
  id: string;
  username: string;
  namaLengkap: string;
  role: UserRole;
  nip?: string;
  assignedClass?: string;
}

export interface AcademicYearRecord {
  id: string;
  tahun: string; // e.g. "2024/2025"
  semester: 'Ganjil' | 'Genap';
  kurikulum: 'Kurikulum Merdeka' | 'Kurikulum 2013';
  isActive: boolean;
}

export interface DepartmentRecord {
  id: string;
  kode: Major;
  nama: string;
  ketuaJurusan: string;
  kuotaSiswa: number;
}

export interface GradeLevelRecord {
  id: string;
  tingkat: GradeLevel;
  keterangan: string;
  jumlahRombel: number;
}

export interface SchoolClassRecord {
  id: string;
  namaKelas: string; // e.g. "X-MIPA-1"
  tingkat: GradeLevel;
  jurusan: Major;
  tahunAjaran: string;
  waliKelas: string;
  nipWaliKelas: string;
  kapasitas: number;
}

export interface StudentPersonal {
  nis: string;
  nisn: string;
  namaLengkap: string;
  namaPanggilan: string;
  jenisKelamin: Gender;
  tempatLahir: string;
  tanggalLahir: string; // DD-MM-YYYY format
  agama: string;
  kewarganegaraan: string;
  anakKe: number;
  jumlahSaudaraKandung: number;
  jumlahSaudaraTiri: number;
  jumlahSaudaraAngkat: number;
  statusAnak: 'Lengkap' | 'Yatim' | 'Piatu' | 'Yatim Piatu';
  bahasaKeseharian: string;
  alamat: string;
  rtRw: string;
  kelurahan: string;
  kecamatan: string;
  kabupatenKota: string;
  provinsi: string;
  kodePos: string;
  teleponRumah?: string;
  nomorHp: string;
  tinggalDengan: 'Orang Tua' | 'Menumpang' | 'Asrama' | 'Kost' | 'Wali';
  jarakKeSekolahKm: number;
  transportasi: string;
  fotoUrl?: string;
}

export interface StudentPhysical {
  beratBadanKg: number;
  tinggiBadanCm: number;
  golonganDarah: 'A' | 'B' | 'AB' | 'O' | 'Tidak Tahu';
  riwayatPenyakit: string;
  kelainanJasmani: string;
}

export interface StudentPreviousEducation {
  asalSekolah: string;
  nomorIjazahSmp: string;
  tanggalIjazahSmp: string; // DD-MM-YYYY
  nomorSkhun: string;
  lamaBelajarTahun: number;
  diterimaDiKelas: string;
  classId?: string;
  tahunAjaranMasuk?: string;
  diterimaTanggal: string; // DD-MM-YYYY
  jurusanPeminatan: Major;
  isPindahan: boolean;
  asalSekolahPindahan?: string;
  alasanPindah?: string;
}

export interface ParentData {
  nama: string;
  tempatLahir: string;
  tanggalLahir: string; // DD-MM-YYYY
  agama: string;
  kewarganegaraan: string;
  pendidikanTerakhir: string;
  pekerjaan: string;
  penghasilanBulanan: string;
  alamat: string;
  nomorHp: string;
  masihHidup: boolean;
  tahunMeninggal?: number;
}

export interface StudentGuardian {
  adaWali: boolean;
  nama?: string;
  tempatLahir?: string;
  tanggalLahir?: string; // DD-MM-YYYY
  agama?: string;
  kewarganegaraan?: string;
  hubunganKeluarga?: string;
  pendidikanTerakhir?: string;
  pekerjaan?: string;
  penghasilanBulanan?: string;
  alamat?: string;
  nomorHp?: string;
}

export interface StudentDeparture {
  status: StudentStatus;
  tahunLulus?: number;
  nomorIjazahSma?: string;
  tanggalIjazahSma?: string; // DD-MM-YYYY
  melanjutkanKe?: string;
  namaPerguruanTinggi?: string;
  pindahKeSekolah?: string;
  alasanPindahKeluar?: string;
  tanggalPindahKeluar?: string; // DD-MM-YYYY
  catatanBk?: string;
  prestasiSiswa?: string;
}

export type GradePrintLayoutMode = '2_per_page' | '1_per_page' | '6_per_page';

export interface MasterSubjectRecord {
  id: string;
  namaMapel: string;
  kelompok: 'A' | 'B' | 'C' | 'Lintas Minat';
  kkmDefault: number;
  kkmKeterampilanDefault: number;
}

export interface SubjectGrade {
  mapelCode: string;
  mapelName: string;
  kelompok: 'A' | 'B' | 'C' | 'Lintas Minat';
  kkm: number;
  kkmKeterampilan?: number;
  nilaiPengetahuan: number;
  predikatPengetahuan: 'A' | 'B' | 'C' | 'D';
  nilaiKeterampilan: number;
  predikatKeterampilan: 'A' | 'B' | 'C' | 'D';
  ketentuan?: 'Tuntas' | 'Belum Tuntas';
  deskripsiKemajuan?: string;
}

export interface ExtracurricularGrade {
  namaKegiatan: string;
  predikat: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Kurang';
  keterangan: string;
}

export interface SemesterAttendance {
  sakit: number;
  izin: number;
  tanpaKeterangan: number;
}

export interface SemesterAcademicRecord {
  semester: 1 | 2 | 3 | 4 | 5 | 6;
  tahunAjaran: string;
  tingkatKelas: GradeLevel;
  kelas: string;
  grades: SubjectGrade[];
  extracurriculars: ExtracurricularGrade[];
  attendance: SemesterAttendance;
  catatanWaliKelas: string;
  keteranganSemester?: string;
  tanggalRapor?: string;
  statusKenaikanKelulusan?: 'Naik Kelas' | 'Tinggal di Kelas' | 'Lulus' | 'Tidak Lulus';
}

export interface StudentFullRecord {
  id: string;
  personal: StudentPersonal;
  physical: StudentPhysical;
  previousEducation: StudentPreviousEducation;
  ayah: ParentData;
  ibu: ParentData;
  wali: StudentGuardian;
  departure: StudentDeparture;
  academicRecords: Record<number, SemesterAcademicRecord>;
}

export interface DailyAttendanceRecord {
  id: string;
  studentId: string;
  nisn: string;
  namaLengkap: string;
  jenisKelamin: Gender;
  kelas: string;
  tanggal: string; // DD-MM-YYYY format
  status: AttendanceStatus;
  keterangan?: string;
}

export interface QueueJobSimulation {
  id: string;
  jobName: string;
  filterType: 'Siswa' | 'Kelas' | 'Tingkat' | 'Tahun';
  targetLabel: string;
  totalRecords: number;
  processedRecords: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  downloadUrl?: string;
  fileSizeMb?: number;
  logs: string[];
}

export interface FilamentNotificationItem {
  id: string;
  title: string;
  body: string;
  type: 'success' | 'info' | 'warning' | 'danger';
  createdAt: string;
  isRead: boolean;
  downloadUrl?: string;
  downloadFilename?: string;
}

export interface DatabaseBackupEntry {
  id: string;
  filename: string;
  disk: string;
  sizeBytes: number;
  createdAt: string;
  type: 'full' | 'db_only';
  status: 'healthy' | 'corrupt';
}

export type UIThemePreset = 
  | 'filament-amber' 
  | 'emerald-kedinasan' 
  | 'sapphire-modern' 
  | 'ruby-maroon' 
  | 'obsidian-dark';

export interface CoverCustomText {
  namaDinas: string;
  judulDokumen: string;
  subjudulDokumen: string;
  keteranganTambahan: string;
  rombelLabel: string;
  tahunAjaranLabel: string;
  titimangsaKota: string;
}

export interface PrintSettings {
  includeCover: boolean;
  coverText: CoverCustomText;
  includeKepalaSekolahSignature: boolean;
  includeWaliKelasSignature: boolean;
  tanggalCetak: string; // DD-MM-YYYY
  watermarkCustomUrl?: string;
  watermarkOpacity: number; // 3 to 30
  enableWatermark: boolean;
}
