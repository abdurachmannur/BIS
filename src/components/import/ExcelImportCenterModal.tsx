import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Archive, 
  Download, 
  Upload, 
  CheckCircle, 
  X, 
  FileCheck,
  Database,
  Calendar,
  UserCheck,
  Layers,
  GraduationCap,
  School,
  Table2,
  ListChecks
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { 
  StudentFullRecord, 
  SubjectGrade,
  ExtracurricularGrade,
  AcademicYearRecord,
  TeacherRecord,
  DepartmentRecord,
  GradeLevelRecord,
  SchoolClassRecord,
  MasterSubjectRecord
} from '../../types/buku-induk';
import { calculatePredicate, DEFAULT_MASTER_SUBJECTS } from '../../data/mock-data';

type MasterImportCategory = 'tahun_ajaran' | 'guru' | 'jurusan' | 'tingkat' | 'kelas';

export interface GradeImportPayloadItem {
  nis: string;
  semester: number;
  tahunAjaran?: string;
  kelas?: string;
  grades: SubjectGrade[];
  attendance: { sakit: number; izin: number; tanpaKeterangan: number };
  extracurriculars?: ExtracurricularGrade[];
  ekskul?: string;
  keteranganSemester?: string;
  tanggalRapor?: string;
}

interface ExcelImportCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: StudentFullRecord[];
  academicYears?: AcademicYearRecord[];
  onUpdateAcademicYears?: (items: AcademicYearRecord[]) => void;
  teachers?: TeacherRecord[];
  onUpdateTeachers?: (items: TeacherRecord[]) => void;
  departments?: DepartmentRecord[];
  onUpdateDepartments?: (items: DepartmentRecord[]) => void;
  gradeLevels?: GradeLevelRecord[];
  onUpdateGradeLevels?: (items: GradeLevelRecord[]) => void;
  schoolClasses?: SchoolClassRecord[];
  onUpdateSchoolClasses?: (items: SchoolClassRecord[]) => void;
  masterSubjects?: MasterSubjectRecord[];
  onImportStudents: (imported: StudentFullRecord[]) => void;
  onImportGrades: (updates: GradeImportPayloadItem[]) => void;
  onImportPhotosZip: (matchedCount: number) => void;
  onShowNotification: (title: string, body: string, type: 'success' | 'info' | 'warning' | 'danger') => void;
}

export const ExcelImportCenterModal: React.FC<ExcelImportCenterModalProps> = ({
  isOpen,
  onClose,
  students,
  academicYears = [],
  onUpdateAcademicYears,
  teachers = [],
  onUpdateTeachers,
  departments = [],
  onUpdateDepartments,
  gradeLevels = [],
  onUpdateGradeLevels,
  schoolClasses = [],
  onUpdateSchoolClasses,
  masterSubjects = DEFAULT_MASTER_SUBJECTS,
  onImportStudents,
  onImportGrades,
  onImportPhotosZip,
  onShowNotification,
}) => {
  const [activeTab, setActiveTab] = useState<'master_data' | 'siswa' | 'nilai' | 'foto_zip'>('master_data');
  const [masterCategory, setMasterCategory] = useState<MasterImportCategory>('guru');
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen) return null;

  const generateUniqueClassId = (tahun: string, nama: string) => {
    const cleanYear = tahun.replace(/\D/g, '');
    const cleanName = nama.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `CLS-${cleanYear}-${cleanName}-${randomSuffix}`;
  };

  // Download Template Master Data (.xlsx)
  const handleDownloadMasterTemplate = (cat: MasterImportCategory) => {
    const wb = XLSX.utils.book_new();

    if (cat === 'tahun_ajaran') {
      const headers = ['Tahun_Ajaran', 'Semester', 'Kurikulum', 'Status_Aktif'];
      const sample = [
        ['2025/2026', 'Ganjil', 'Kurikulum Merdeka', 'Ya'],
        ['2025/2026', 'Genap', 'Kurikulum Merdeka', 'Tidak'],
      ];
      const ws = XLSX.utils.aoa_to_sheet([headers, ...sample]);
      ws['!cols'] = [{ wch: 18 }, { wch: 15 }, { wch: 24 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, ws, 'DATA_TAHUN_AJARAN');

      const wsGuide = XLSX.utils.aoa_to_sheet([
        ['KOLOM', 'FORMAT', 'CONTOH'],
        ['Tahun_Ajaran', 'YYYY/YYYY', '2025/2026'],
        ['Semester', 'Ganjil / Genap', 'Ganjil'],
        ['Kurikulum', 'Kurikulum Merdeka / Kurikulum 2013', 'Kurikulum Merdeka'],
        ['Status_Aktif', 'Ya / Tidak', 'Ya'],
      ]);
      XLSX.utils.book_append_sheet(wb, wsGuide, 'PETUNJUK');
      XLSX.writeFile(wb, 'Template_Master_Tahun_Ajaran.xlsx');
      onShowNotification('Template Diunduh', 'Template_Master_Tahun_Ajaran.xlsx siap diisi.', 'success');
    } else if (cat === 'guru') {
      const headers = ['NIP', 'Nama_Lengkap', 'Jabatan_Wali_Kelas'];
      const sample = [
        ['198004122005011002', 'Drs. H. Bambang Hermawan, M.Pd.', 'Wali Kelas X'],
        ['198509212010012008', 'Siti Nurhaliza, S.Pd., Gr.', 'Wali Kelas XI'],
      ];
      const ws = XLSX.utils.aoa_to_sheet([headers, ...sample]);
      ws['!cols'] = [{ wch: 22 }, { wch: 34 }, { wch: 28 }];
      XLSX.utils.book_append_sheet(wb, ws, 'DATA_GURU');

      const wsGuide = XLSX.utils.aoa_to_sheet([
        ['KOLOM', 'FORMAT', 'KETERANGAN'],
        ['NIP', '18 Digit Angka / NUPTK', 'Nomor Induk Pegawai Guru'],
        ['Nama_Lengkap', 'Teks Beserta Gelar Akademik', 'Muncul di dropdown Wali Kelas & Ketua Jurusan'],
        ['Jabatan_Wali_Kelas', 'Teks Jabatan', 'Contoh: Wali Kelas X / Wali Kelas XI'],
      ]);
      XLSX.utils.book_append_sheet(wb, wsGuide, 'PETUNJUK');
      XLSX.writeFile(wb, 'Template_Master_Data_Guru.xlsx');
      onShowNotification('Template Diunduh', 'Template_Master_Data_Guru.xlsx siap diisi.', 'success');
    } else if (cat === 'jurusan') {
      const headers = ['Kode_Jurusan', 'Nama_Jurusan', 'Ketua_Jurusan', 'Kuota_Siswa'];
      const sample = [
        ['MIPA', 'Matematika dan Ilmu Pengetahuan Alam', 'Drs. Supriyanto, M.Si.', 252],
        ['IPS', 'Ilmu Pengetahuan Sosial', 'Dra. Endang Sulastri, M.Pd.', 180],
      ];
      const ws = XLSX.utils.aoa_to_sheet([headers, ...sample]);
      ws['!cols'] = [{ wch: 16 }, { wch: 36 }, { wch: 30 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, ws, 'DATA_JURUSAN');
      XLSX.writeFile(wb, 'Template_Master_Data_Jurusan.xlsx');
      onShowNotification('Template Diunduh', 'Template_Master_Data_Jurusan.xlsx siap diisi.', 'success');
    } else if (cat === 'tingkat') {
      const headers = ['Tingkat', 'Keterangan_Fase', 'Target_Jumlah_Rombel'];
      const sample = [
        ['X', 'Tingkat X (Fase E - Kurikulum Merdeka)', 7],
        ['XI', 'Tingkat XI (Fase F - Peminatan)', 7],
        ['XII', 'Tingkat XII (Fase F - Ujian Akhir)', 6],
      ];
      const ws = XLSX.utils.aoa_to_sheet([headers, ...sample]);
      ws['!cols'] = [{ wch: 12 }, { wch: 38 }, { wch: 22 }];
      XLSX.utils.book_append_sheet(wb, ws, 'DATA_TINGKAT');
      XLSX.writeFile(wb, 'Template_Master_Data_Tingkat.xlsx');
      onShowNotification('Template Diunduh', 'Template_Master_Data_Tingkat.xlsx siap diisi.', 'success');
    } else if (cat === 'kelas') {
      const headers = ['Tahun_Ajaran', 'Nama_Kelas', 'Tingkat', 'Jurusan', 'Nama_Wali_Kelas', 'NIP_Wali_Kelas', 'Kapasitas'];
      const sample = [
        ['2024/2025', 'X-MIPA-1', 'X', 'MIPA', 'Dra. Neneng Suryati, M.Pd.', '197608122002122001', 36],
        ['2024/2025', 'X-MIPA-2', 'X', 'MIPA', 'Agus Gunawan, S.Pd.', '198104192006041005', 36],
        ['2025/2026', 'X-MIPA-1', 'X', 'MIPA', 'Dra. Neneng Suryati, M.Pd.', '197608122002122001', 36],
      ];
      const ws = XLSX.utils.aoa_to_sheet([headers, ...sample]);
      ws['!cols'] = [{ wch: 16 }, { wch: 16 }, { wch: 12 }, { wch: 14 }, { wch: 30 }, { wch: 22 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(wb, ws, 'DATA_KELAS');
      XLSX.writeFile(wb, 'Template_Master_Data_Kelas.xlsx');
      onShowNotification('Template Diunduh', 'Template_Master_Data_Kelas.xlsx siap diisi (ID Kelas unik dibuat otomatis per Tahun Ajaran).', 'success');
    }
  };

  // 1. Download Template Siswa Excel Murni (.xlsx) LENGKAP BAGIAN A s/d F (49 Kolom Sesuai Hasil Cetak)
  const handleDownloadStudentTemplate = () => {
    const wb = XLSX.utils.book_new();

    const headers = [
      // Bagian A: Keterangan Pribadi (18 Kolom)
      'NIS', 'NISN', 'Nama_Lengkap', 'Nama_Panggilan', 'Jenis_Kelamin',
      'Tempat_Lahir', 'Tanggal_Lahir_DD_MM_YYYY', 'Agama', 'Kewarganegaraan',
      'Anak_Ke', 'Jumlah_Saudara_Kandung', 'Bahasa_Sehari_Hari',
      'Alamat', 'Kelurahan', 'Kecamatan', 'Kota_Kabupaten', 'Tinggal_Bersama', 'No_HP_Siswa',
      // Bagian B: Keterangan Jasmani & Kesehatan (4 Kolom)
      'Berat_Badan_Kg', 'Tinggi_Badan_Cm', 'Golongan_Darah', 'Riwayat_Penyakit',
      // Bagian C: Pendidikan Sebelumnya (6 Kolom)
      'Asal_SMP', 'No_Ijazah_SMP', 'Diterima_Di_Kelas', 'Jurusan_Peminatan', 'Tahun_Ajaran_Masuk', 'Tanggal_Diterima',
      // Bagian D: Orang Tua Kandung — Ayah & Ibu (14 Kolom)
      'Nama_Ayah', 'Tempat_Lahir_Ayah', 'Tanggal_Lahir_Ayah', 'Pendidikan_Ayah', 'Pekerjaan_Ayah', 'Penghasilan_Ayah', 'No_HP_Ayah',
      'Nama_Ibu', 'Tempat_Lahir_Ibu', 'Tanggal_Lahir_Ibu', 'Pendidikan_Ibu', 'Pekerjaan_Ibu', 'Penghasilan_Ibu', 'No_HP_Ibu',
      // Bagian E: Wali Siswa (4 Kolom)
      'Nama_Wali', 'Hubungan_Keluarga_Wali', 'Pekerjaan_Wali', 'Penghasilan_Wali',
      // Bagian F: Kelulusan / Meninggalkan Sekolah (3 Kolom)
      'Status_Siswa', 'No_Ijazah_SMA', 'Melanjutkan_Ke'
    ];

    const sampleRow1 = [
      '24251006', '0078129011', 'Muhammad Ilham Pratama', 'Ilham', 'L',
      'Bandung', '18-05-2008', 'Islam', 'WNI',
      1, 2, 'Bahasa Indonesia',
      'Jl. Dago Barat No. 12', 'Dago', 'Coblong', 'Kota Bandung', 'Orang Tua', '081234112233',
      58, 168, 'O', 'Tidak Ada',
      'SMP Negeri 1 Bandung', 'DN-02/D-SMP/2024/00192', 'X-MIPA-1', 'MIPA', '2024/2025', '15-07-2024',
      'Hendra Kusuma', 'Bandung', '12-04-1976', 'S1', 'Wiraswasta', 'Rp 7.000.000 - Rp 10.000.000', '081222334455',
      'Siti Maryam', 'Bandung', '20-08-1979', 'S1', 'Guru PNS', 'Rp 5.000.000 - Rp 7.000.000', '081222334466',
      '', '', '', '',
      'Aktif', '', ''
    ];

    const sampleRow2 = [
      '24251007', '0078129022', 'Aulia Rahmadani Putri', 'Aulia', 'P',
      'Tasikmalaya', '24-08-2008', 'Islam', 'WNI',
      2, 1, 'Bahasa Indonesia & Sunda',
      'Jl. Setiabudi No. 45', 'Gegerkalong', 'Sukasari', 'Kota Bandung', 'Wali', '081399887766',
      49, 159, 'A', 'Asma Ringan',
      'SMP Negeri 2 Bandung', 'DN-02/D-SMP/2024/00245', 'X-MIPA-1', 'MIPA', '2024/2025', '15-07-2024',
      'Rahmat Hidayat', 'Tasikmalaya', '05-11-1974', 'S2', 'PNS Dosen', 'Rp 10.000.000+', '081311223344',
      'Dewi Lestari', 'Garut', '14-02-1978', 'S1', 'Ibu Rumah Tangga', 'Tidak Berpenghasilan', '081311223355',
      'H. Dudung Supriatna', 'Paman Kandung', 'Wiraswasta', 'Rp 7.000.000 - Rp 10.000.000',
      'Aktif', '', ''
    ];

    const wsData = XLSX.utils.aoa_to_sheet([headers, sampleRow1, sampleRow2]);
    wsData['!cols'] = headers.map((h) => ({ wch: Math.max(18, h.length + 4) }));
    XLSX.utils.book_append_sheet(wb, wsData, 'DATA_SISWA_LENGKAP');

    const guideHeaders = ['BAGIAN BUKU INDUK', 'KOLOM / FIELD', 'CONTOH PENGISIAN', 'KETERANGAN TAMPIL DI CETAK PDF'];
    const guideRows = [
      ['BAGIAN A (Pribadi)', 'NIS, NISN, Nama_Lengkap, Nama_Panggilan, Jenis_Kelamin, Tempat_Lahir, Tanggal_Lahir_DD_MM_YYYY, Agama, Kewarganegaraan, Anak_Ke, Jumlah_Saudara_Kandung, Bahasa_Sehari_Hari, Alamat, Kelurahan, Kecamatan, Kota_Kabupaten, Tinggal_Bersama, No_HP_Siswa', '18-05-2008, WNI, Anak ke-1, 2 Saudara', 'Tampil lengkap pada Bagian A Lembar Buku Induk'],
      ['BAGIAN B (Jasmani)', 'Berat_Badan_Kg, Tinggi_Badan_Cm, Golongan_Darah, Riwayat_Penyakit', '58, 168, O, Tidak Ada', 'Tampil lengkap pada Bagian B Keterangan Jasmani & Kesehatan'],
      ['BAGIAN C (Pendidikan SMP)', 'Asal_SMP, No_Ijazah_SMP, Diterima_Di_Kelas, Jurusan_Peminatan, Tahun_Ajaran_Masuk, Tanggal_Diterima', 'SMPN 1 Bandung, DN-02/D-SMP/2024/00192', 'Tampil lengkap pada Bagian C Pendidikan Sebelumnya'],
      ['BAGIAN D (Orang Tua)', 'Nama_Ayah, Tempat_Lahir_Ayah, Tanggal_Lahir_Ayah, Pendidikan_Ayah, Pekerjaan_Ayah, Penghasilan_Ayah, No_HP_Ayah (+ Data Ibu lengkap)', 'Hendra Kusuma, Bandung, 12-04-1976, S1, Wiraswasta', 'Tampil lengkap pada Bagian D Keterangan Orang Tua Kandung'],
      ['BAGIAN E (Wali Siswa)', 'Nama_Wali, Hubungan_Keluarga_Wali, Pekerjaan_Wali, Penghasilan_Wali', 'H. Dudung, Paman Kandung, Wiraswasta', 'Kosongkan jika siswa tinggal bersama orang tua; isi jika memiliki wali'],
      ['BAGIAN F (Kelulusan)', 'Status_Siswa, No_Ijazah_SMA, Melanjutkan_Ke', 'Aktif / Lulus, DN-02/M-SMA/..., ITB', 'Tampil pada Bagian F Perkembangan Akhir / Kelulusan'],
    ];
    const wsGuide = XLSX.utils.aoa_to_sheet([guideHeaders, ...guideRows]);
    wsGuide['!cols'] = [{ wch: 24 }, { wch: 55 }, { wch: 34 }, { wch: 42 }];
    XLSX.utils.book_append_sheet(wb, wsGuide, 'PETUNJUK_LENGKAP_A_SD_F');

    XLSX.writeFile(wb, 'Template_Impor_Siswa_SMA_Lengkap_A_sd_F.xlsx');
    onShowNotification(
      'Template Siswa Lengkap Diunduh',
      'Berkas Template_Impor_Siswa_SMA_Lengkap_A_sd_F.xlsx (49 Kolom Bagian A–F) siap diisi.',
      'success'
    );
  };

  // 2A. Download Template Nilai FORMAT 1: Baris Dinamis per Mapel (Rekomendasi — Bebas Beda Mapel Tiap Siswa)
  const handleDownloadDynamicRowGradesTemplate = () => {
    const wb = XLSX.utils.book_new();

    const headersSheet1 = [
      'NIS',
      'Nama_Siswa',
      'Semester',
      'Tahun_Ajaran',
      'Kelas',
      'Nama_Mata_Pelajaran',
      'Kelompok',
      'KKM_Pengetahuan',
      'Nilai_Pengetahuan',
      'KKM_Keterampilan',
      'Nilai_Keterampilan',
      'Ketentuan'
    ];

    const sampleRowsSheet1 = [
      // Siswa 1 (Mengambil Peminatan MIPA + Lintas Minat Ekonomi)
      ['23241001', 'Ahmad Faiz Al-Faruq', 1, '2024/2025', 'X-MIPA-1', 'Pendidikan Agama & Budi Pekerti', 'A', 75, 92, 75, 94, 'Tuntas'],
      ['23241001', 'Ahmad Faiz Al-Faruq', 1, '2024/2025', 'X-MIPA-1', 'Pendidikan Pancasila dan Kewarganegaraan', 'A', 75, 88, 75, 90, 'Tuntas'],
      ['23241001', 'Ahmad Faiz Al-Faruq', 1, '2024/2025', 'X-MIPA-1', 'Bahasa Indonesia', 'A', 75, 90, 75, 91, 'Tuntas'],
      ['23241001', 'Ahmad Faiz Al-Faruq', 1, '2024/2025', 'X-MIPA-1', 'Matematika (Umum)', 'A', 75, 94, 75, 95, 'Tuntas'],
      ['23241001', 'Ahmad Faiz Al-Faruq', 1, '2024/2025', 'X-MIPA-1', 'Fisika', 'C', 75, 91, 75, 93, 'Tuntas'],
      ['23241001', 'Ahmad Faiz Al-Faruq', 1, '2024/2025', 'X-MIPA-1', 'Ekonomi', 'Lintas Minat', 75, 89, 75, 88, 'Tuntas'],
      // Siswa 2 (Mengambil Lintas Minat Berbeda, misal Bahasa Jepang & Informatika)
      ['23241002', 'Siti Aisyah Humaira', 1, '2024/2025', 'X-MIPA-1', 'Pendidikan Agama & Budi Pekerti', 'A', 75, 95, 75, 95, 'Tuntas'],
      ['23241002', 'Siti Aisyah Humaira', 1, '2024/2025', 'X-MIPA-1', 'Bahasa Indonesia', 'A', 75, 92, 75, 94, 'Tuntas'],
      ['23241002', 'Siti Aisyah Humaira', 1, '2024/2025', 'X-MIPA-1', 'Biologi', 'C', 75, 93, 75, 94, 'Tuntas'],
      ['23241002', 'Siti Aisyah Humaira', 1, '2024/2025', 'X-MIPA-1', 'Bahasa Jepang', 'Lintas Minat', 75, 90, 75, 92, 'Tuntas'],
    ];

    const wsGrades = XLSX.utils.aoa_to_sheet([headersSheet1, ...sampleRowsSheet1]);
    wsGrades['!cols'] = [
      { wch: 14 }, { wch: 26 }, { wch: 10 }, { wch: 14 }, { wch: 14 },
      { wch: 38 }, { wch: 16 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 15 }
    ];
    XLSX.utils.book_append_sheet(wb, wsGrades, 'NILAI_MAPEL_DINAMIS');

    // Sheet 2: Rekap Ekstrakurikuler, Kehadiran, & Keterangan per Siswa per Semester
    const headersSheet2 = [
      'NIS',
      'Nama_Siswa',
      'Semester',
      'Sakit_Hari',
      'Izin_Hari',
      'Alpa_Hari',
      'Ekstrakurikuler_1',
      'Predikat_Ekskul_1',
      'Ekstrakurikuler_2',
      'Predikat_Ekskul_2',
      'Keterangan_Semester',
      'Tanggal_Rapor'
    ];
    const sampleRowsSheet2 = [
      ['23241001', 'Ahmad Faiz Al-Faruq', 1, 1, 0, 0, 'KEPRAMUKAAN', 'Sangat Baik', 'KARYA ILMIAH REMAJA (KIR)', 'Baik', 'Tuntas seluruh mata pelajaran', '20 Desember 2024'],
      ['23241002', 'Siti Aisyah Humaira', 1, 0, 1, 0, 'KEPRAMUKAAN', 'Sangat Baik', 'PMR MADYA', 'Sangat Baik', 'Tuntas seluruh mata pelajaran', '20 Desember 2024'],
    ];
    const wsEkskul = XLSX.utils.aoa_to_sheet([headersSheet2, ...sampleRowsSheet2]);
    wsEkskul['!cols'] = headersSheet2.map(() => ({ wch: 22 }));
    XLSX.utils.book_append_sheet(wb, wsEkskul, 'EKSKUL_DAN_KEHADIRAN');

    // Sheet 3: Daftar Master Mata Pelajaran Sekolah (Referensi Copy-Paste)
    const headersSheet3 = ['Nama_Mata_Pelajaran_Standar', 'Kelompok', 'KKM_Pengetahuan', 'KKM_Keterampilan'];
    const masterRows = masterSubjects.map((m) => [
      m.namaMapel.replace(/^Lintas Minat:\s*/i, ''),
      m.kelompok,
      m.kkmDefault,
      m.kkmKeterampilanDefault,
    ]);
    const wsMasterRef = XLSX.utils.aoa_to_sheet([headersSheet3, ...masterRows]);
    wsMasterRef['!cols'] = [{ wch: 40 }, { wch: 18 }, { wch: 18 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, wsMasterRef, 'REFERENSI_MASTER_MAPEL');

    XLSX.writeFile(wb, 'Template_Nilai_Format_Baris_Dinamis_Tanpa_Kode.xlsx');
    onShowNotification(
      'Template Baris Dinamis Diunduh',
      'Template_Nilai_Format_Baris_Dinamis_Tanpa_Kode.xlsx siap diisi (tiap siswa bebas memiliki mata pelajaran berbeda).',
      'success'
    );
  };

  // 2B. Download Template Nilai FORMAT 2: Kolom Melebar dengan Nama Mapel Asli (Tanpa Kode Singkatan)
  const handleDownloadWideRealNameGradesTemplate = () => {
    const wb = XLSX.utils.book_new();

    const baseHeaders = ['NIS', 'NISN', 'Nama_Siswa', 'Semester', 'Tahun_Ajaran', 'Kelas', 'KKM_Default'];
    const subjectHeaders: string[] = [];
    masterSubjects.slice(0, 14).forEach((m) => {
      const cleanName = m.namaMapel.replace(/^Lintas Minat:\s*/i, '');
      subjectHeaders.push(`Pengetahuan - ${cleanName}`);
      subjectHeaders.push(`Keterampilan - ${cleanName}`);
    });
    const tailHeaders = [
      'Sakit_Hari',
      'Izin_Hari',
      'Alpa_Hari',
      'Ekstrakurikuler_1',
      'Predikat_Ekskul_1',
      'Ekstrakurikuler_2',
      'Predikat_Ekskul_2',
      'Keterangan_Semester',
      'Tanggal_Rapor'
    ];

    const allHeaders = [...baseHeaders, ...subjectHeaders, ...tailHeaders];

    const sampleScores = subjectHeaders.map((_, idx) => (idx % 2 === 0 ? 88 : 90));
    const sampleRow = [
      '23241001',
      '0065432190',
      'Ahmad Faiz Al-Faruq',
      1,
      '2024/2025',
      'X-MIPA-1',
      75,
      ...sampleScores,
      1,
      0,
      0,
      'KEPRAMUKAAN',
      'Sangat Baik',
      'OLIMPIADE SAINS',
      'Baik',
      'Tuntas seluruh mata pelajaran',
      '20 Desember 2024'
    ];

    const wsData = XLSX.utils.aoa_to_sheet([allHeaders, sampleRow]);
    wsData['!cols'] = allHeaders.map((h) => ({ wch: Math.max(16, h.length + 3) }));
    XLSX.utils.book_append_sheet(wb, wsData, 'NILAI_KOLOM_NAMA_MAPEL');

    const guideHeaders = ['ATURAN FORMAT KOLOM NAMA MAPEL ASLI', 'PENJELASAN'];
    const guideRows = [
      ['Tanpa Kode Singkatan', 'Header kolom menggunakan Nama Mata Pelajaran Asli seperti "Pengetahuan - Fisika" dan "Keterampilan - Fisika".'],
      ['Bisa Tambah Kolom Mapel Baru di Excel', 'Anda bebas menambahkan kolom "Pengetahuan - [Nama Mapel]" dan "Keterampilan - [Nama Mapel]" di sebelah kanan.'],
      ['Kosongkan Jika Siswa Tidak Mengambil Mapel Tersebut', 'Jika seorang siswa tidak mengambil suatu mapel (misal Lintas Minat tertentu), cukup kosongkan sel nilainya maka mapel tersebut tidak akan dimasukkan ke rapor siswa itu.'],
    ];
    const wsGuide = XLSX.utils.aoa_to_sheet([guideHeaders, ...guideRows]);
    wsGuide['!cols'] = [{ wch: 38 }, { wch: 75 }];
    XLSX.utils.book_append_sheet(wb, wsGuide, 'PANDUAN_KOLOM_DINAMIS');

    XLSX.writeFile(wb, 'Template_Nilai_Format_Kolom_Nama_Mapel_Asli.xlsx');
    onShowNotification(
      'Template Kolom Nama Mapel Diunduh',
      'Template_Nilai_Format_Kolom_Nama_Mapel_Asli.xlsx siap diisi (menggunakan nama mapel asli, bukan kode).',
      'success'
    );
  };

  // 3. Handle File Upload (.xlsx / .xls)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);

    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = wb.SheetNames[0];
      const ws = wb.Sheets[firstSheetName];
      const rawRows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

      if (rawRows.length < 2) {
        onShowNotification('Berkas Kosong', 'Berkas Excel tidak memiliki baris data di bawah header.', 'warning');
        setIsProcessing(false);
        return;
      }

      if (activeTab === 'master_data') {
        const rows = rawRows.slice(1).filter((r) => r && r.length > 0 && r[0] !== undefined && String(r[0]).trim() !== '');
        const parsedPreview: any[] = [];

        if (masterCategory === 'tahun_ajaran') {
          const imported: AcademicYearRecord[] = rows.map((cols, idx) => {
            const item: AcademicYearRecord = {
              id: `AY-IMP-${Date.now()}-${idx}`,
              tahun: String(cols[0] || '2025/2026').trim(),
              semester: String(cols[1] || 'Ganjil').toLowerCase().includes('genap') ? 'Genap' : 'Ganjil',
              kurikulum: String(cols[2] || '').includes('2013') ? 'Kurikulum 2013' : 'Kurikulum Merdeka',
              isActive: String(cols[3] || '').toLowerCase() === 'ya',
            };
            parsedPreview.push({
              no: idx + 1,
              col1: item.tahun,
              col2: `Semester ${item.semester}`,
              col3: item.kurikulum,
              status: 'Siap Impor',
            });
            return item;
          });
          (window as any).__pendingMasterImport = { category: 'tahun_ajaran', data: imported };
        } else if (masterCategory === 'guru') {
          const imported: TeacherRecord[] = rows.map((cols, idx) => {
            const item: TeacherRecord = {
              id: `TCH-IMP-${Date.now()}-${idx}`,
              nip: String(cols[0] || '').trim(),
              namaLengkap: String(cols[1] || '').trim(),
              jabatanWaliKelas: String(cols[2] || 'Wali Kelas').trim(),
            };
            parsedPreview.push({
              no: idx + 1,
              col1: item.nip,
              col2: item.namaLengkap,
              col3: item.jabatanWaliKelas,
              status: 'Siap Impor',
            });
            return item;
          });
          (window as any).__pendingMasterImport = { category: 'guru', data: imported };
        } else if (masterCategory === 'jurusan') {
          const imported: DepartmentRecord[] = rows.map((cols, idx) => {
            const item: DepartmentRecord = {
              id: `DEP-IMP-${Date.now()}-${idx}`,
              kode: String(cols[0] || 'MIPA').trim().toUpperCase(),
              nama: String(cols[1] || 'Jurusan').trim(),
              ketuaJurusan: String(cols[2] || teachers[0]?.namaLengkap || '-').trim(),
              kuotaSiswa: Number(cols[3]) || 180,
            };
            parsedPreview.push({
              no: idx + 1,
              col1: item.kode,
              col2: item.nama,
              col3: `Ka. Jurusan: ${item.ketuaJurusan}`,
              status: 'Siap Impor',
            });
            return item;
          });
          (window as any).__pendingMasterImport = { category: 'jurusan', data: imported };
        } else if (masterCategory === 'tingkat') {
          const imported: GradeLevelRecord[] = rows.map((cols, idx) => {
            const item: GradeLevelRecord = {
              id: `GL-IMP-${Date.now()}-${idx}`,
              tingkat: String(cols[0] || 'X').trim().toUpperCase(),
              keterangan: String(cols[1] || 'Tingkat Kelas').trim(),
              jumlahRombel: Number(cols[2]) || 6,
            };
            parsedPreview.push({
              no: idx + 1,
              col1: `Tingkat ${item.tingkat}`,
              col2: item.keterangan,
              col3: `${item.jumlahRombel} Rombel`,
              status: 'Siap Impor',
            });
            return item;
          });
          (window as any).__pendingMasterImport = { category: 'tingkat', data: imported };
        } else if (masterCategory === 'kelas') {
          const imported: SchoolClassRecord[] = rows.map((cols, idx) => {
            const tahun = String(cols[0] || '2024/2025').trim();
            const namaKelas = String(cols[1] || `X-MIPA-${idx + 1}`).trim();
            const waliName = String(cols[4] || teachers[0]?.namaLengkap || '-').trim();
            const matchedTeacher = teachers.find((t) => t.namaLengkap.toLowerCase() === waliName.toLowerCase());
            const item: SchoolClassRecord = {
              id: generateUniqueClassId(tahun, namaKelas),
              tahunAjaran: tahun,
              namaKelas,
              tingkat: String(cols[2] || 'X').trim().toUpperCase(),
              jurusan: String(cols[3] || 'MIPA').trim().toUpperCase(),
              waliKelas: waliName,
              nipWaliKelas: String(cols[5] || matchedTeacher?.nip || '-').trim(),
              kapasitas: Number(cols[6]) || 36,
            };
            parsedPreview.push({
              no: idx + 1,
              col1: `${item.namaKelas} (${item.tahunAjaran})`,
              col2: `ID: ${item.id}`,
              col3: `Wali: ${item.waliKelas}`,
              status: 'ID Unik Siap',
            });
            return item;
          });
          (window as any).__pendingMasterImport = { category: 'kelas', data: imported };
        }

        setPreviewRows(parsedPreview);
      } else if (activeTab === 'siswa') {
        // Smart header-based + positional parser supporting the full 49-column template AND exported files
        const rawHeaders = (rawRows[0] || []).map((h: any) =>
          String(h || '')
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
        );

        const findCol = (aliases: string[], fallbackIndex?: number): number => {
          for (const alias of aliases) {
            const idx = rawHeaders.findIndex((h) => h === alias || h.includes(alias));
            if (idx !== -1) return idx;
          }
          return fallbackIndex !== undefined ? fallbackIndex : -1;
        };

        const isFull49Template = rawHeaders.length >= 30;

        const parsedRows: any[] = [];
        const newStudentsToInsert: StudentFullRecord[] = [];

        for (let i = 1; i < rawRows.length; i++) {
          const cols = rawRows[i];
          if (!cols || cols.length < 3) continue;

          const getVal = (aliases: string[], fallbackIdx?: number, defaultVal: string = ''): string => {
            const cIdx = findCol(aliases, fallbackIdx);
            if (cIdx >= 0 && cols[cIdx] !== undefined && cols[cIdx] !== null && String(cols[cIdx]).trim() !== '') {
              return String(cols[cIdx]).trim();
            }
            return defaultVal;
          };

          // Bagian A: Pribadi
          const nis = getVal(['nis'], 0);
          const nisn = getVal(['nisn'], 1);
          const namaLengkap = getVal(['nama_lengkap', 'nama_siswa'], 2);
          if (!nis && !namaLengkap) continue;

          const namaPanggilan = getVal(['nama_panggilan'], 3, namaLengkap.split(' ')[0] || '');
          const jkRaw = getVal(['jenis_kelamin', 'l_p'], 4, 'L').toUpperCase();
          const jenisKelamin = jkRaw.startsWith('P') ? 'P' : 'L';
          const tempatLahir = getVal(['tempat_lahir'], 5, 'Bandung');
          const tanggalLahir = getVal(['tanggal_lahir'], 6, '01-01-2008');
          const agama = getVal(['agama'], 7, 'Islam');
          const kewarganegaraan = getVal(['kewarganegaraan'], isFull49Template ? 8 : undefined, 'WNI');
          const anakKe = parseInt(getVal(['anak_ke'], isFull49Template ? 9 : undefined, '1')) || 1;
          const jumlahSaudaraKandung = parseInt(getVal(['jumlah_saudara', 'saudara_kandung'], isFull49Template ? 10 : undefined, '1')) || 0;
          const bahasaKeseharian = getVal(['bahasa_sehari', 'bahasa'], isFull49Template ? 11 : undefined, 'Bahasa Indonesia');
          const alamat = getVal(['alamat'], isFull49Template ? 12 : 8, 'Jl. Pendidikan No. 1');
          const kelurahan = getVal(['kelurahan'], isFull49Template ? 13 : 9, 'Dago');
          const kecamatan = getVal(['kecamatan'], isFull49Template ? 14 : 10, 'Coblong');
          const kota = getVal(['kota_kabupaten', 'kota'], isFull49Template ? 15 : 11, 'Kota Bandung');
          const tinggalBersamaRaw = getVal(['tinggal_bersama', 'tinggal_dengan'], isFull49Template ? 16 : undefined, 'Orang Tua');
          const tinggalDengan: any = ['Orang Tua', 'Menumpang', 'Asrama', 'Kost', 'Wali'].includes(tinggalBersamaRaw)
            ? tinggalBersamaRaw
            : 'Orang Tua';
          const noHp = getVal(['no_hp_siswa', 'no_hp'], isFull49Template ? 17 : 12, '081200000000');

          // Bagian B: Jasmani & Kesehatan
          const beratBadanKg = parseInt(getVal(['berat_badan', 'berat_badan_kg'], isFull49Template ? 18 : undefined, '55')) || 55;
          const tinggiBadanCm = parseInt(getVal(['tinggi_badan', 'tinggi_badan_cm'], isFull49Template ? 19 : undefined, '165')) || 165;
          const golDarahRaw = getVal(['golongan_darah'], isFull49Template ? 20 : undefined, 'O').toUpperCase();
          const golonganDarah: any = ['A', 'B', 'AB', 'O'].includes(golDarahRaw) ? golDarahRaw : 'Tidak Tahu';
          const riwayatPenyakit = getVal(['riwayat_penyakit'], isFull49Template ? 21 : undefined, 'Tidak Ada');

          // Bagian C: Pendidikan Sebelumnya
          const asalSmp = getVal(['asal_smp', 'asal_sekolah'], isFull49Template ? 22 : 13, 'SMP Negeri 1 Bandung');
          const nomorIjazahSmp = getVal(['no_ijazah_smp', 'nomor_ijazah_smp'], isFull49Template ? 23 : undefined, `DN-02/D-SMP/${2024000 + i}`);
          const kelas = getVal(['diterima_di_kelas', 'kelas'], isFull49Template ? 24 : 14, 'X-MIPA-1');
          const jurusanRaw = getVal(['jurusan_peminatan', 'jurusan'], isFull49Template ? 25 : 15, 'MIPA').toUpperCase();
          const jurusan = jurusanRaw || 'MIPA';
          const matchedClassObj = schoolClasses.find((c) => c.namaKelas === kelas);
          const tahunAjaranMasuk = getVal(
            ['tahun_ajaran_masuk', 'tahun_ajaran'],
            isFull49Template ? 26 : undefined,
            matchedClassObj?.tahunAjaran || '2024/2025'
          );
          const diterimaTanggal = getVal(['tanggal_diterima'], isFull49Template ? 27 : undefined, '15-07-2024');

          // Bagian D: Orang Tua Kandung (Ayah & Ibu)
          const namaAyah = getVal(['nama_ayah'], isFull49Template ? 28 : 16, 'Nama Ayah');
          const tempatLahirAyah = getVal(['tempat_lahir_ayah'], isFull49Template ? 29 : undefined, 'Bandung');
          const tanggalLahirAyah = getVal(['tanggal_lahir_ayah'], isFull49Template ? 30 : undefined, '12-04-1976');
          const pendidikanAyah = getVal(['pendidikan_ayah'], isFull49Template ? 31 : undefined, 'S1');
          const pekerjaanAyah = getVal(['pekerjaan_ayah'], isFull49Template ? 32 : 17, 'Wiraswasta');
          const penghasilanAyah = getVal(['penghasilan_ayah'], isFull49Template ? 33 : undefined, 'Rp 5.000.000 - Rp 10.000.000');
          const noHpAyah = getVal(['no_hp_ayah'], isFull49Template ? 34 : undefined, noHp);

          const namaIbu = getVal(['nama_ibu'], isFull49Template ? 35 : 18, 'Nama Ibu');
          const tempatLahirIbu = getVal(['tempat_lahir_ibu'], isFull49Template ? 36 : undefined, 'Bandung');
          const tanggalLahirIbu = getVal(['tanggal_lahir_ibu'], isFull49Template ? 37 : undefined, '20-08-1979');
          const pendidikanIbu = getVal(['pendidikan_ibu'], isFull49Template ? 38 : undefined, 'S1');
          const pekerjaanIbu = getVal(['pekerjaan_ibu'], isFull49Template ? 39 : 19, 'Ibu Rumah Tangga');
          const penghasilanIbu = getVal(['penghasilan_ibu'], isFull49Template ? 40 : undefined, 'Rp 3.000.000 - Rp 5.000.000');
          const noHpIbu = getVal(['no_hp_ibu'], isFull49Template ? 41 : undefined, noHp);

          // Bagian E: Wali Siswa
          const namaWali = getVal(['nama_wali'], isFull49Template ? 42 : undefined, '');
          const hubunganWali = getVal(['hubungan_keluarga_wali', 'hubungan_wali'], isFull49Template ? 43 : undefined, '');
          const pekerjaanWali = getVal(['pekerjaan_wali'], isFull49Template ? 44 : undefined, '');
          const penghasilanWali = getVal(['penghasilan_wali'], isFull49Template ? 45 : undefined, '');
          const adaWali = Boolean(namaWali && namaWali !== '-');

          // Bagian F: Kelulusan / Meninggalkan Sekolah
          const statusSiswaRaw = getVal(['status_siswa', 'status_buku_induk'], isFull49Template ? 46 : undefined, 'Aktif');
          const statusSiswa: any = ['Aktif', 'Lulus', 'Pindah', 'Keluar'].includes(statusSiswaRaw) ? statusSiswaRaw : 'Aktif';
          const noIjazahSma = getVal(['no_ijazah_sma', 'nomor_ijazah_sma'], isFull49Template ? 47 : undefined, '');
          const melanjutkanKe = getVal(['melanjutkan_ke', 'perguruan_tinggi'], isFull49Template ? 48 : undefined, '');

          parsedRows.push({
            no: parsedRows.length + 1,
            nis,
            nisn,
            nama: namaLengkap,
            jk: jenisKelamin,
            tglLahir: `${tempatLahir}, ${tanggalLahir}`,
            kelas: `${kelas} (${beratBadanKg}kg/${tinggiBadanCm}cm, Gol.${golonganDarah})`,
            jurusan,
            status: adaWali ? `Lengkap A–F (Wali: ${namaWali})` : 'Lengkap Bagian A–F',
          });

          newStudentsToInsert.push({
            id: `STD-IMP-${Date.now()}-${i}`,
            personal: {
              nis,
              nisn,
              namaLengkap,
              namaPanggilan,
              jenisKelamin,
              tempatLahir,
              tanggalLahir,
              agama,
              kewarganegaraan,
              anakKe,
              jumlahSaudaraKandung,
              jumlahSaudaraTiri: 0,
              jumlahSaudaraAngkat: 0,
              statusAnak: 'Lengkap',
              bahasaKeseharian,
              alamat,
              rtRw: '001/002',
              kelurahan,
              kecamatan,
              kabupatenKota: kota,
              provinsi: 'Jawa Barat',
              kodePos: '40135',
              nomorHp: noHp,
              tinggalDengan,
              jarakKeSekolahKm: 3.5,
              transportasi: 'Kendaraan Pribadi',
            },
            physical: {
              golonganDarah,
              tinggiBadanCm,
              beratBadanKg,
              riwayatPenyakit,
              kelainanJasmani: 'Tidak Ada',
            },
            previousEducation: {
              asalSekolah: asalSmp,
              nomorIjazahSmp,
              tanggalIjazahSmp: '10-06-2024',
              nomorSkhun: '-',
              lamaBelajarTahun: 3,
              diterimaDiKelas: kelas,
              classId: matchedClassObj?.id,
              tahunAjaranMasuk,
              jurusanPeminatan: jurusan,
              diterimaTanggal,
              isPindahan: false,
            },
            ayah: {
              nama: namaAyah,
              tempatLahir: tempatLahirAyah,
              tanggalLahir: tanggalLahirAyah,
              agama,
              kewarganegaraan: 'WNI',
              pendidikanTerakhir: pendidikanAyah,
              pekerjaan: pekerjaanAyah,
              penghasilanBulanan: penghasilanAyah,
              alamat,
              nomorHp: noHpAyah,
              masihHidup: true,
            },
            ibu: {
              nama: namaIbu,
              tempatLahir: tempatLahirIbu,
              tanggalLahir: tanggalLahirIbu,
              agama,
              kewarganegaraan: 'WNI',
              pendidikanTerakhir: pendidikanIbu,
              pekerjaan: pekerjaanIbu,
              penghasilanBulanan: penghasilanIbu,
              alamat,
              nomorHp: noHpIbu,
              masihHidup: true,
            },
            wali: {
              adaWali,
              nama: namaWali || undefined,
              hubunganKeluarga: hubunganWali || undefined,
              pekerjaan: pekerjaanWali || undefined,
              penghasilanBulanan: penghasilanWali || undefined,
              alamat: adaWali ? alamat : undefined,
              nomorHp: adaWali ? noHp : undefined,
            },
            departure: {
              status: statusSiswa,
              nomorIjazahSma: noIjazahSma || undefined,
              melanjutkanKe: melanjutkanKe || undefined,
              namaPerguruanTinggi: melanjutkanKe || undefined,
            },
            academicRecords: {},
          });
        }

        setPreviewRows(parsedRows);
        (window as any).__pendingImportStudents = newStudentsToInsert;
      } else if (activeTab === 'nilai') {
        // Dual-Format Parser: Auto-detects Format 1 (Baris Dinamis per Mapel) vs Format 2 (Kolom Nama Mapel Asli)
        const headerRow = (rawRows[0] || []).map((h: any) => String(h || '').trim());
        const normalizedHeaders = headerRow.map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, '_'));

        const isDynamicRowFormat = normalizedHeaders.some(
          (h) => h.includes('nama_mata_pelajaran') || h === 'mata_pelajaran' || h === 'nama_mapel'
        );

        const parsedGrades: any[] = [];
        const updates: GradeImportPayloadItem[] = [];

        if (isDynamicRowFormat) {
          // FORMAT 1: Baris Dinamis per Mata Pelajaran (Tiap siswa bebas berbeda mapel)
          const idxNis = normalizedHeaders.findIndex((h) => h === 'nis');
          const idxNama = normalizedHeaders.findIndex((h) => h.includes('nama_siswa') || h === 'nama');
          const idxSem = normalizedHeaders.findIndex((h) => h.includes('semester'));
          const idxTahun = normalizedHeaders.findIndex((h) => h.includes('tahun_ajaran'));
          const idxKelas = normalizedHeaders.findIndex((h) => h === 'kelas');
          const idxMapel = normalizedHeaders.findIndex((h) => h.includes('mata_pelajaran') || h.includes('nama_mapel'));
          const idxKelompok = normalizedHeaders.findIndex((h) => h.includes('kelompok'));
          const idxKkmP = normalizedHeaders.findIndex((h) => h.includes('kkm_pengetahuan') || h === 'kkm');
          const idxNilaiP = normalizedHeaders.findIndex((h) => h.includes('nilai_pengetahuan'));
          const idxKkmK = normalizedHeaders.findIndex((h) => h.includes('kkm_keterampilan'));
          const idxNilaiK = normalizedHeaders.findIndex((h) => h.includes('nilai_keterampilan'));
          const idxKetentuan = normalizedHeaders.findIndex((h) => h.includes('ketentuan') || h.includes('ketuntasan'));

          // Group by NIS + Semester
          const groupedMap = new Map<
            string,
            {
              nis: string;
              nama: string;
              semester: number;
              tahunAjaran?: string;
              kelas?: string;
              grades: SubjectGrade[];
              attendance: { sakit: number; izin: number; tanpaKeterangan: number };
              extracurriculars: ExtracurricularGrade[];
              keteranganSemester?: string;
              tanggalRapor?: string;
            }
          >();

          for (let i = 1; i < rawRows.length; i++) {
            const cols = rawRows[i];
            if (!cols || cols.length < 4) continue;
            const nis = String(cols[idxNis >= 0 ? idxNis : 0] || '').trim();
            const nama = String(cols[idxNama >= 0 ? idxNama : 1] || '').trim();
            const semester = Number(cols[idxSem >= 0 ? idxSem : 2] || 1);
            const mapelName = String(cols[idxMapel >= 0 ? idxMapel : 5] || '').trim();
            if (!nis || !mapelName) continue;

            const key = `${nis}__${semester}`;
            if (!groupedMap.has(key)) {
              groupedMap.set(key, {
                nis,
                nama,
                semester,
                tahunAjaran: idxTahun >= 0 && cols[idxTahun] ? String(cols[idxTahun]).trim() : undefined,
                kelas: idxKelas >= 0 && cols[idxKelas] ? String(cols[idxKelas]).trim() : undefined,
                grades: [],
                attendance: { sakit: 0, izin: 0, tanpaKeterangan: 0 },
                extracurriculars: [
                  { namaKegiatan: 'KEPRAMUKAAN', predikat: 'Baik', keterangan: 'Aktif mengikuti kegiatan' },
                ],
              });
            }

            const matchedMaster = masterSubjects.find(
              (m) =>
                m.namaMapel.toLowerCase() === mapelName.toLowerCase() ||
                m.namaMapel.replace(/^Lintas Minat:\s*/i, '').toLowerCase() === mapelName.toLowerCase()
            );

            const rawKel = idxKelompok >= 0 && cols[idxKelompok] ? String(cols[idxKelompok]).trim() : matchedMaster?.kelompok || 'A';
            const kelompok: 'A' | 'B' | 'C' | 'Lintas Minat' =
              rawKel.toLowerCase().includes('lintas')
                ? 'Lintas Minat'
                : rawKel.toUpperCase() === 'B'
                ? 'B'
                : rawKel.toUpperCase() === 'C' || rawKel.toLowerCase().includes('peminatan')
                ? 'C'
                : 'A';

            const kkmP = Number(idxKkmP >= 0 && cols[idxKkmP] ? cols[idxKkmP] : matchedMaster?.kkmDefault || 75);
            const kkmK = Number(idxKkmK >= 0 && cols[idxKkmK] ? cols[idxKkmK] : matchedMaster?.kkmKeterampilanDefault || kkmP);
            const nilaiP = Number(idxNilaiP >= 0 ? cols[idxNilaiP] : 85);
            const nilaiK = Number(idxNilaiK >= 0 ? cols[idxNilaiK] : nilaiP);
            const ketRaw = idxKetentuan >= 0 && cols[idxKetentuan] ? String(cols[idxKetentuan]).trim() : '';
            const ketentuan: 'Tuntas' | 'Belum Tuntas' =
              ketRaw.toLowerCase().includes('belum')
                ? 'Belum Tuntas'
                : nilaiP >= kkmP && nilaiK >= kkmK
                ? 'Tuntas'
                : 'Belum Tuntas';

            groupedMap.get(key)!.grades.push({
              mapelCode: `MP-DYN-${i}-${groupedMap.get(key)!.grades.length + 1}`,
              mapelName,
              kelompok,
              kkm: kkmP,
              kkmKeterampilan: kkmK,
              nilaiPengetahuan: nilaiP,
              predikatPengetahuan: calculatePredicate(nilaiP, kkmP),
              nilaiKeterampilan: nilaiK,
              predikatKeterampilan: calculatePredicate(nilaiK, kkmK),
              ketentuan,
            });
          }

          // Check if Sheet 2 (EKSKUL_DAN_KEHADIRAN) exists in the workbook
          const secondSheetName = wb.SheetNames.find((sn) =>
            sn.toLowerCase().includes('ekskul') || sn.toLowerCase().includes('kehadiran')
          );
          if (secondSheetName) {
            const ws2 = wb.Sheets[secondSheetName];
            const rows2: any[][] = XLSX.utils.sheet_to_json(ws2, { header: 1 });
            for (let j = 1; j < rows2.length; j++) {
              const r2 = rows2[j];
              if (!r2 || r2.length < 3) continue;
              const nis2 = String(r2[0] || '').trim();
              const sem2 = Number(r2[2] || 1);
              const key2 = `${nis2}__${sem2}`;
              const target = groupedMap.get(key2);
              if (target) {
                target.attendance = {
                  sakit: Number(r2[3] || 0),
                  izin: Number(r2[4] || 0),
                  tanpaKeterangan: Number(r2[5] || 0),
                };
                const ekskulList: ExtracurricularGrade[] = [];
                if (r2[6] && String(r2[6]).trim() !== '') {
                  ekskulList.push({
                    namaKegiatan: String(r2[6]).trim(),
                    predikat: (String(r2[7] || 'Baik').trim() as any) || 'Baik',
                    keterangan: 'Aktif mengikuti kegiatan ekstrakurikuler',
                  });
                }
                if (r2[8] && String(r2[8]).trim() !== '') {
                  ekskulList.push({
                    namaKegiatan: String(r2[8]).trim(),
                    predikat: (String(r2[9] || 'Baik').trim() as any) || 'Baik',
                    keterangan: 'Aktif mengikuti kegiatan ekstrakurikuler',
                  });
                }
                if (ekskulList.length > 0) target.extracurriculars = ekskulList;
                if (r2[10]) target.keteranganSemester = String(r2[10]).trim();
                if (r2[11]) target.tanggalRapor = String(r2[11]).trim();
              }
            }
          }

          let counter = 1;
          groupedMap.forEach((item) => {
            parsedGrades.push({
              no: counter++,
              nis: item.nis,
              nama: item.nama,
              semester: item.semester,
              rataRata: `${item.grades.length} Mapel (Rata: ${Math.round(
                item.grades.reduce((a, b) => a + b.nilaiPengetahuan, 0) / Math.max(1, item.grades.length)
              )})`,
              absensi: `S:${item.attendance.sakit} I:${item.attendance.izin} A:${item.attendance.tanpaKeterangan}`,
              ekskul: item.extracurriculars.map((e) => `${e.namaKegiatan} (${e.predikat})`).join(', '),
              status: 'Format Baris Dinamis',
            });
            updates.push({
              nis: item.nis,
              semester: item.semester,
              tahunAjaran: item.tahunAjaran,
              kelas: item.kelas,
              grades: item.grades,
              attendance: item.attendance,
              extracurriculars: item.extracurriculars,
              keteranganSemester: item.keteranganSemester,
              tanggalRapor: item.tanggalRapor,
            });
          });
        } else {
          // FORMAT 2: Format Kolom Nama Mapel Asli (mendeteksi header "Pengetahuan - [Nama Mapel]" / "Keterampilan - [Nama Mapel]")
          const dynamicSubjectCols: Map<
            string,
            { mapelName: string; kelompok: 'A' | 'B' | 'C' | 'Lintas Minat'; kkm: number; pIdx?: number; kIdx?: number }
          > = new Map();

          headerRow.forEach((rawH, colIdx) => {
            const penMatch = rawH.match(/^(?:Pengetahuan|Nilai Pengetahuan|P)\s*[-_:]\s*(.+)$/i);
            const ketMatch = rawH.match(/^(?:Keterampilan|Nilai Keterampilan|K)\s*[-_:]\s*(.+)$/i);

            if (penMatch || ketMatch) {
              const rawSubjectName = (penMatch ? penMatch[1] : ketMatch![1]).trim();
              const matchedMaster = masterSubjects.find(
                (m) =>
                  m.namaMapel.toLowerCase() === rawSubjectName.toLowerCase() ||
                  m.namaMapel.replace(/^Lintas Minat:\s*/i, '').toLowerCase() === rawSubjectName.toLowerCase()
              );
              const key = rawSubjectName.toLowerCase();
              if (!dynamicSubjectCols.has(key)) {
                dynamicSubjectCols.set(key, {
                  mapelName: matchedMaster ? matchedMaster.namaMapel.replace(/^Lintas Minat:\s*/i, '') : rawSubjectName,
                  kelompok: matchedMaster?.kelompok || 'A',
                  kkm: matchedMaster?.kkmDefault || 75,
                });
              }
              const entry = dynamicSubjectCols.get(key)!;
              if (penMatch) entry.pIdx = colIdx;
              if (ketMatch) entry.kIdx = colIdx;
            }
          });

          const idxSakit = normalizedHeaders.findIndex((h) => h.includes('sakit'));
          const idxIzin = normalizedHeaders.findIndex((h) => h.includes('izin'));
          const idxAlpa = normalizedHeaders.findIndex((h) => h.includes('alpa') || h.includes('tanpa_keterangan'));
          const idxEks1 = normalizedHeaders.findIndex((h) => h.includes('ekstrakurikuler_1') || h.includes('ekstrakurikuler_wajib'));
          const idxPred1 = normalizedHeaders.findIndex((h) => h.includes('predikat_ekskul_1') || h.includes('nilai_ekskul_wajib'));
          const idxEks2 = normalizedHeaders.findIndex((h) => h.includes('ekstrakurikuler_2') || h.includes('ekstrakurikuler_pilihan'));
          const idxPred2 = normalizedHeaders.findIndex((h) => h.includes('predikat_ekskul_2') || h.includes('nilai_ekskul_pilihan'));
          const idxTahun = normalizedHeaders.findIndex((h) => h.includes('tahun_ajaran'));
          const idxKelas = normalizedHeaders.findIndex((h) => h === 'kelas');
          const idxKkmDef = normalizedHeaders.findIndex((h) => h.includes('kkm_default'));
          const idxKetSem = normalizedHeaders.findIndex((h) => h.includes('keterangan_semester'));
          const idxTglRap = normalizedHeaders.findIndex((h) => h.includes('tanggal_rapor'));

          for (let i = 1; i < rawRows.length; i++) {
            const cols = rawRows[i];
            if (!cols || cols.length < 4) continue;

            const nis = String(cols[0] || '').trim();
            const nama = String(cols[2] || '').trim();
            const semester = Number(cols[3] || 1);
            if (!nis) continue;

            const rowDefaultKkm = idxKkmDef >= 0 && Number(cols[idxKkmDef]) ? Number(cols[idxKkmDef]) : 75;
            const gradesList: SubjectGrade[] = [];

            let subCounter = 1;
            dynamicSubjectCols.forEach((subMeta) => {
              const rawP = subMeta.pIdx !== undefined ? cols[subMeta.pIdx] : undefined;
              const rawK = subMeta.kIdx !== undefined ? cols[subMeta.kIdx] : undefined;

              // Skip subject if student's score cell is left blank or '-'
              if (
                (rawP === undefined || rawP === null || String(rawP).trim() === '' || String(rawP).trim() === '-') &&
                (rawK === undefined || rawK === null || String(rawK).trim() === '' || String(rawK).trim() === '-')
              ) {
                return;
              }

              const pScore = Number(rawP ?? rawK ?? 85);
              const kScore = Number(rawK ?? rawP ?? 85);
              const kkmVal = subMeta.kkm || rowDefaultKkm;

              gradesList.push({
                mapelCode: `MP-COL-${i}-${subCounter++}`,
                mapelName: subMeta.mapelName,
                kelompok: subMeta.kelompok,
                kkm: kkmVal,
                kkmKeterampilan: kkmVal,
                nilaiPengetahuan: pScore,
                predikatPengetahuan: calculatePredicate(pScore, kkmVal),
                nilaiKeterampilan: kScore,
                predikatKeterampilan: calculatePredicate(kScore, kkmVal),
                ketentuan: pScore >= kkmVal && kScore >= kkmVal ? 'Tuntas' : 'Belum Tuntas',
              });
            });

            const sakit = idxSakit >= 0 ? Number(cols[idxSakit] || 0) : 0;
            const izin = idxIzin >= 0 ? Number(cols[idxIzin] || 0) : 0;
            const tanpaKeterangan = idxAlpa >= 0 ? Number(cols[idxAlpa] || 0) : 0;

            const ekskulArr: ExtracurricularGrade[] = [];
            if (idxEks1 >= 0 && cols[idxEks1] && String(cols[idxEks1]).trim() !== '') {
              ekskulArr.push({
                namaKegiatan: String(cols[idxEks1]).trim(),
                predikat: (idxPred1 >= 0 && cols[idxPred1] ? String(cols[idxPred1]).trim() : 'Baik') as any,
                keterangan: 'Aktif mengikuti kegiatan ekstrakurikuler',
              });
            }
            if (idxEks2 >= 0 && cols[idxEks2] && String(cols[idxEks2]).trim() !== '') {
              ekskulArr.push({
                namaKegiatan: String(cols[idxEks2]).trim(),
                predikat: (idxPred2 >= 0 && cols[idxPred2] ? String(cols[idxPred2]).trim() : 'Baik') as any,
                keterangan: 'Aktif mengikuti kegiatan ekstrakurikuler',
              });
            }
            if (ekskulArr.length === 0) {
              ekskulArr.push({ namaKegiatan: 'KEPRAMUKAAN', predikat: 'Baik', keterangan: 'Aktif mengikuti kegiatan' });
            }

            parsedGrades.push({
              no: parsedGrades.length + 1,
              nis,
              nama,
              semester,
              rataRata: `${gradesList.length} Mapel`,
              absensi: `S:${sakit} I:${izin} A:${tanpaKeterangan}`,
              ekskul: ekskulArr.map((e) => `${e.namaKegiatan} (${e.predikat})`).join(', '),
              status: 'Format Kolom Mapel Asli',
            });

            updates.push({
              nis,
              semester,
              tahunAjaran: idxTahun >= 0 && cols[idxTahun] ? String(cols[idxTahun]).trim() : undefined,
              kelas: idxKelas >= 0 && cols[idxKelas] ? String(cols[idxKelas]).trim() : undefined,
              grades: gradesList,
              attendance: { sakit, izin, tanpaKeterangan },
              extracurriculars: ekskulArr,
              keteranganSemester: idxKetSem >= 0 && cols[idxKetSem] ? String(cols[idxKetSem]).trim() : undefined,
              tanggalRapor: idxTglRap >= 0 && cols[idxTglRap] ? String(cols[idxTglRap]).trim() : undefined,
            });
          }
        }

        setPreviewRows(parsedGrades);
        (window as any).__pendingImportGrades = updates;
      }
    } catch (err) {
      console.error(err);
      onShowNotification('Gagal Membaca Excel', 'Pastikan berkas berformat .xlsx yang valid.', 'danger');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCommitImport = () => {
    if (activeTab === 'master_data') {
      const pending = (window as any).__pendingMasterImport;
      if (!pending || !pending.data) return;

      if (pending.category === 'tahun_ajaran' && onUpdateAcademicYears) {
        onUpdateAcademicYears([...academicYears, ...pending.data]);
        onShowNotification('Impor Tahun Ajaran Berhasil', `${pending.data.length} Tahun Ajaran berhasil ditambahkan dari Excel (.xlsx).`, 'success');
      } else if (pending.category === 'guru' && onUpdateTeachers) {
        onUpdateTeachers([...teachers, ...pending.data]);
        onShowNotification('Impor Data Guru Berhasil', `${pending.data.length} Guru berhasil ditambahkan dari Excel (.xlsx).`, 'success');
      } else if (pending.category === 'jurusan' && onUpdateDepartments) {
        onUpdateDepartments([...departments, ...pending.data]);
        onShowNotification('Impor Data Jurusan Berhasil', `${pending.data.length} Jurusan berhasil ditambahkan dari Excel (.xlsx).`, 'success');
      } else if (pending.category === 'tingkat' && onUpdateGradeLevels) {
        onUpdateGradeLevels([...gradeLevels, ...pending.data]);
        onShowNotification('Impor Data Tingkat Berhasil', `${pending.data.length} Tingkat berhasil ditambahkan dari Excel (.xlsx).`, 'success');
      } else if (pending.category === 'kelas' && onUpdateSchoolClasses) {
        onUpdateSchoolClasses([...schoolClasses, ...pending.data]);
        onShowNotification('Impor Data Kelas Berhasil', `${pending.data.length} Kelas ber-ID unik berhasil ditambahkan dari Excel (.xlsx).`, 'success');
      }
      delete (window as any).__pendingMasterImport;
      onClose();
    } else if (activeTab === 'siswa') {
      const pending = (window as any).__pendingImportStudents;
      if (pending && pending.length > 0) {
        onImportStudents(pending);
        onShowNotification('Impor Siswa Lengkap Berhasil', `${pending.length} data siswa (Bagian A s/d F lengkap) berhasil diimpor.`, 'success');
        delete (window as any).__pendingImportStudents;
        onClose();
      }
    } else if (activeTab === 'nilai') {
      const pending = (window as any).__pendingImportGrades;
      if (pending && pending.length > 0) {
        onImportGrades(pending);
        onShowNotification('Impor Nilai Berhasil', `Nilai mata pelajaran, ekstrakurikuler, dan kehadiran ${pending.length} siswa berhasil disimpan.`, 'success');
        delete (window as any).__pendingImportGrades;
        onClose();
      }
    }
  };

  const handleSimulateZipUpload = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onImportPhotosZip(students.length);
      onShowNotification(
        'Upload Foto ZIP Berhasil',
        `Sebanyak ${students.length} foto siswa berhasil dicocokkan otomatis berdasarkan nomor NIS/NISN.`,
        'success'
      );
      onClose();
    }, 1200);
  };

  const masterCategories: { id: MasterImportCategory; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'tahun_ajaran', label: 'Data Tahun Ajaran', icon: Calendar },
    { id: 'guru', label: 'Data Guru (NIP & Wali Kelas)', icon: UserCheck },
    { id: 'jurusan', label: 'Data Jurusan', icon: Layers },
    { id: 'tingkat', label: 'Data Tingkat', icon: GraduationCap },
    { id: 'kelas', label: 'Data Kelas (ID Unik)', icon: School },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-4xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Pusat Impor Massal Excel (.xlsx) & Foto Siswa (.zip)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mendukung Impor 5 Master Data, Data Siswa Lengkap Bagian A–F, Nilai Rapor Tanpa Kode Singkatan, dan ZIP Foto
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-2 px-6 pt-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={() => { setActiveTab('master_data'); setPreviewRows([]); setFileName(''); }}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'master_data'
                ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Database className="h-3.5 w-3.5" />
            <span>1. Impor 5 Master Data (.xlsx)</span>
          </button>
          <button
            onClick={() => { setActiveTab('siswa'); setPreviewRows([]); setFileName(''); }}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'siswa'
                ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            2. Impor Data Siswa Lengkap A–F (.xlsx)
          </button>
          <button
            onClick={() => { setActiveTab('nilai'); setPreviewRows([]); setFileName(''); }}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'nilai'
                ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            3. Impor Nilai Rapor Fleksibel (.xlsx)
          </button>
          <button
            onClick={() => { setActiveTab('foto_zip'); setPreviewRows([]); setFileName(''); }}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'foto_zip'
                ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            4. Upload Pas Foto (.zip)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'master_data' && (
            <div className="space-y-4">
              {/* Sub-selector for 5 Master Data */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Pilih Jenis Master Data yang Akan Diimpor (.xlsx):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {masterCategories.map((item) => {
                    const Icon = item.icon;
                    const active = masterCategory === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setMasterCategory(item.id);
                          setPreviewRows([]);
                          setFileName('');
                        }}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all gap-1.5 ${
                          active
                            ? 'border-emerald-600 bg-emerald-50/90 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-500 font-bold shadow-xs'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400'
                        }`}
                      >
                        <Icon className={`h-4 w-4 ${active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                        <span className="text-[11px] leading-tight">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/50 dark:bg-emerald-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                    <Download className="h-4 w-4" />
                    <span>Unduh Template Excel (.xlsx) — {masterCategories.find((c) => c.id === masterCategory)?.label}</span>
                  </h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-400">
                    {masterCategory === 'guru' && 'Kolom: NIP, Nama_Lengkap, Jabatan_Wali_Kelas.'}
                    {masterCategory === 'kelas' && 'Kolom: Tahun_Ajaran, Nama_Kelas, Tingkat, Jurusan, Nama_Wali_Kelas, NIP_Wali_Kelas, Kapasitas (ID Kelas unik dibuat otomatis).'}
                    {masterCategory === 'tahun_ajaran' && 'Kolom: Tahun_Ajaran, Semester, Kurikulum, Status_Aktif.'}
                    {masterCategory === 'jurusan' && 'Kolom: Kode_Jurusan, Nama_Jurusan, Ketua_Jurusan, Kuota_Siswa.'}
                    {masterCategory === 'tingkat' && 'Kolom: Tingkat, Keterangan_Fase, Target_Jumlah_Rombel.'}
                  </p>
                </div>
                <button
                  onClick={() => handleDownloadMasterTemplate(masterCategory)}
                  className="px-3.5 py-2 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-colors shadow-sm flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Download className="h-4 w-4" />
                  <span>Unduh Template (.xlsx)</span>
                </button>
              </div>

              {/* Upload Drop Zone */}
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center hover:border-emerald-500 transition-colors bg-slate-50/50 dark:bg-slate-800/30">
                <input
                  type="file"
                  id="file-master-xlsx"
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label htmlFor="file-master-xlsx" className="cursor-pointer block space-y-2">
                  <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {fileName ? fileName : `Klik untuk Pilih Berkas Excel (.xlsx) — ${masterCategories.find((c) => c.id === masterCategory)?.label}`}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Format resmi Microsoft Excel (.xlsx / .xls)
                  </p>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'siswa' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/50 dark:bg-emerald-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                    <Download className="h-4 w-4" />
                    <span>Langkah 1: Unduh Template Excel Siswa Lengkap Bagian A s/d F (.xlsx)</span>
                  </h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-400">
                    Mencakup seluruh 49 kolom yang tampil di lembar cetak: <strong>Pribadi, Berat & Tinggi Badan, Gol. Darah, Riwayat Penyakit, No. Ijazah SMP, TTL/Pendidikan/Pekerjaan/Penghasilan Ayah & Ibu, Nama/Hubungan/Pekerjaan Wali, dan Status Kelulusan</strong>.
                  </p>
                </div>
                <button
                  onClick={handleDownloadStudentTemplate}
                  className="px-3.5 py-2 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-colors shadow-sm flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Download className="h-4 w-4" />
                  <span>Unduh Template Lengkap A–F (.xlsx)</span>
                </button>
              </div>

              {/* Upload Drop Zone */}
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center hover:border-emerald-500 transition-colors bg-slate-50/50 dark:bg-slate-800/30">
                <input
                  type="file"
                  id="file-siswa-xlsx"
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label htmlFor="file-siswa-xlsx" className="cursor-pointer block space-y-2">
                  <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {fileName ? fileName : 'Klik untuk Pilih Berkas Excel Siswa (.xlsx)'}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Mendukung Template Lengkap 49 Kolom Bagian A–F maupun hasil Ekspor Excel aplikasi
                  </p>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'nilai' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Format 1 Card: Baris Dinamis per Mapel */}
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/50 dark:bg-emerald-950/20 flex flex-col justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold">
                        DIREKOMENDASIKAN (MAPEL BERBEDA TIAP SISWA)
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5 pt-1">
                      <ListChecks className="h-4 w-4" />
                      <span>Format 1: Baris Dinamis per Mata Pelajaran</span>
                    </h4>
                    <p className="text-[11px] text-emerald-800 dark:text-emerald-400 leading-relaxed">
                      Menggunakan <strong>Nama Mata Pelajaran Asli</strong> (bukan kode). Sangat mudah jika setiap siswa memiliki mata pelajaran <strong>Peminatan atau Lintas Minat berbeda</strong>. Dilengkapi Sheet Ekskul & Kehadiran.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadDynamicRowGradesTemplate}
                    className="w-full py-2 px-3 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    <span>Unduh Template Format Baris Dinamis (.xlsx)</span>
                  </button>
                </div>

                {/* Format 2 Card: Kolom Nama Mapel Asli */}
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/60 dark:border-blue-900/50 dark:bg-blue-950/20 flex flex-col justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold">
                        REKAP MENYAMPING TANPA KODE SINGKATAN
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5 pt-1">
                      <Table2 className="h-4 w-4" />
                      <span>Format 2: Kolom Nama Mapel Asli</span>
                    </h4>
                    <p className="text-[11px] text-blue-800 dark:text-blue-400 leading-relaxed">
                      Kolom menyamping menggunakan <strong>Nama Mapel Asli</strong> (misal <em>Pengetahuan - Fisika</em>). Kosongkan sel jika siswa tidak mengambil mapel tersebut. Bisa tambah kolom mapel baru di kanan.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadWideRealNameGradesTemplate}
                    className="w-full py-2 px-3 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    <span>Unduh Template Format Kolom Mapel (.xlsx)</span>
                  </button>
                </div>
              </div>

              {/* Upload Drop Zone */}
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center hover:border-blue-500 transition-colors bg-slate-50/50 dark:bg-slate-800/30">
                <input
                  type="file"
                  id="file-nilai-xlsx"
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label htmlFor="file-nilai-xlsx" className="cursor-pointer block space-y-2">
                  <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {fileName ? fileName : 'Klik untuk Unggah Berkas Nilai Excel (.xlsx) — Otomatis Mendeteksi Format 1 atau Format 2'}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Sistem mendeteksi otomatis apakah berkas menggunakan Format Baris Dinamis atau Format Kolom Nama Mapel Asli
                  </p>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'foto_zip' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 dark:border-amber-900/50 dark:bg-amber-950/20">
                <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5 mb-1">
                  <Archive className="h-4 w-4" />
                  <span>Petunjuk Penamaan Foto Siswa di Dalam Berkas .ZIP</span>
                </h4>
                <ul className="text-xs text-amber-800 dark:text-amber-400 space-y-1 list-disc pl-5">
                  <li>Nama berkas foto harus menggunakan <strong>NIS</strong> (contoh: <code>24251001.jpg</code>) atau <strong>NISN</strong> (contoh: <code>0078129011.jpg</code>).</li>
                  <li>Format gambar yang didukung: JPG, JPEG, atau PNG (ukuran pas foto rasio 3:4 disarankan).</li>
                  <li>Untuk mengunggah foto satu per satu, Anda juga dapat langsung menggunakan tombol <strong>Pilih File Foto</strong> di menu Input/Edit Manual Siswa.</li>
                </ul>
              </div>

              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center bg-slate-50/50 dark:bg-slate-800/30">
                <div className="mx-auto w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-3">
                  <Archive className="h-7 w-7" />
                </div>
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Pilih Berkas ZIP Pas Foto Siswa
                </h5>
                <p className="text-[11px] text-slate-400 mb-4">
                  Sistem otomatis mencocokkan nomor file dengan NIS siswa yang ada di buku induk
                </p>
                <button
                  onClick={handleSimulateZipUpload}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 shadow-sm transition-all"
                >
                  {isProcessing ? 'Memproses Ekstraksi ZIP & Pencocokan...' : '⚡ Unggah & Proses File ZIP Foto'}
                </button>
              </div>
            </div>
          )}

          {/* Live Preview Table */}
          {previewRows.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <FileCheck className="h-4 w-4 text-emerald-500" />
                  <span>Pratinjau Hasil Pembacaan Berkas Excel ({previewRows.length} Data Siswa/Baris Ditemukan)</span>
                </h4>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                  ✓ Validasi Format Sukses
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 max-h-56">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-300">
                    <tr>
                      <th className="p-2.5">No</th>
                      {activeTab === 'master_data' ? (
                        <>
                          <th className="p-2.5">Kolom Utama</th>
                          <th className="p-2.5">Atribut / Nama</th>
                          <th className="p-2.5">Keterangan</th>
                        </>
                      ) : (
                        <>
                          <th className="p-2.5">NIS</th>
                          <th className="p-2.5">Nama Lengkap</th>
                          {activeTab === 'siswa' && <th className="p-2.5">L/P</th>}
                          {activeTab === 'siswa' && <th className="p-2.5">TTL</th>}
                          {activeTab === 'siswa' && <th className="p-2.5">Kelas & Jasmani</th>}
                          {activeTab === 'nilai' && <th className="p-2.5">Semester</th>}
                          {activeTab === 'nilai' && <th className="p-2.5">Jml Mapel</th>}
                          {activeTab === 'nilai' && <th className="p-2.5">Absensi</th>}
                          {activeTab === 'nilai' && <th className="p-2.5">Ekskul</th>}
                        </>
                      )}
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {previewRows.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-2.5 font-mono">{r.no}</td>
                        {activeTab === 'master_data' ? (
                          <>
                            <td className="p-2.5 font-mono font-bold text-slate-700 dark:text-slate-300">{r.col1}</td>
                            <td className="p-2.5 font-semibold text-slate-900 dark:text-white">{r.col2}</td>
                            <td className="p-2.5 text-slate-600 dark:text-slate-400">{r.col3}</td>
                          </>
                        ) : (
                          <>
                            <td className="p-2.5 font-mono font-bold text-slate-700 dark:text-slate-300">{r.nis}</td>
                            <td className="p-2.5 font-semibold text-slate-900 dark:text-white">{r.nama}</td>
                            {activeTab === 'siswa' && <td className="p-2.5">{r.jk}</td>}
                            {activeTab === 'siswa' && <td className="p-2.5 font-mono">{r.tglLahir}</td>}
                            {activeTab === 'siswa' && <td className="p-2.5">{r.kelas}</td>}
                            {activeTab === 'nilai' && <td className="p-2.5 font-bold">Sem {r.semester}</td>}
                            {activeTab === 'nilai' && <td className="p-2.5 font-semibold text-blue-600">{r.rataRata}</td>}
                            {activeTab === 'nilai' && <td className="p-2.5 font-mono">{r.absensi}</td>}
                            {activeTab === 'nilai' && <td className="p-2.5">{r.ekskul}</td>}
                          </>
                        )}
                        <td className="p-2.5 text-emerald-600 font-semibold">{r.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400"
          >
            Batal
          </button>

          {previewRows.length > 0 && (
            <button
              onClick={handleCommitImport}
              className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 shadow-sm transition-all flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Simpan & Terapkan {previewRows.length} Data</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
