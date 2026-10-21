import React from 'react';
import { 
  Users, 
  CalendarCheck, 
  GraduationCap, 
  Printer, 
  Archive, 
  Calendar,
  Layers,
  School,
  Award,
  ArrowRight,
  Sparkles,
  Server,
  FileSpreadsheet,
  Settings,
  Clock
} from 'lucide-react';
import { ActiveNavKey } from '../layout/FilamentSidebar';
import { StudentFullRecord, DailyAttendanceRecord, SchoolProfile, SchoolClassRecord } from '../../types/buku-induk';
import { DemographicMatrixTable } from './DemographicMatrixTable';

interface DashboardOverviewProps {
  students: StudentFullRecord[];
  attendanceRecords: DailyAttendanceRecord[];
  schoolProfile: SchoolProfile;
  classes: SchoolClassRecord[];
  onNavigate: (key: ActiveNavKey) => void;
  onOpenImportModal: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  students,
  attendanceRecords,
  schoolProfile,
  classes,
  onNavigate,
  onOpenImportModal,
}) => {
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.departure.status === 'Aktif').length;
  const graduatedStudents = students.filter(s => s.departure.status === 'Lulus').length;

  const totalL = students.filter(s => s.personal.jenisKelamin === 'L').length;
  const totalP = students.filter(s => s.personal.jenisKelamin === 'P').length;

  const presentCount = attendanceRecords.filter(a => a.status === 'H').length;
  const attendancePercentage = attendanceRecords.length > 0 
    ? Math.round((presentCount / attendanceRecords.length) * 100) 
    : 100;

  return (
    <div className="space-y-6">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              SISTEM PRODUKSI AKTIF
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              NPSN {schoolProfile.npsn}
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mt-1">
            {schoolProfile.namaSekolah}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sistem Informasi Buku Induk Siswa Digital SMA · Alur Data 1 s/d 7 & Matriks Demografi
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenImportModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors shadow-sm"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>⚡ Impor Excel & ZIP Foto</span>
          </button>

          <button
            onClick={() => onNavigate('cetak_dokumen_gabungan')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shadow-sm"
          >
            <Printer className="h-4 w-4" />
            <span>Cetak 1 Berkas Gabungan</span>
          </button>
        </div>
      </div>

      {/* 4 Primary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Siswa & Gender */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Buku Induk</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {totalStudents} <span className="text-xs font-normal text-slate-500">Siswa</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
            <span className="text-blue-600 dark:text-blue-400 font-bold">{totalL} Laki-laki</span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-pink-600 dark:text-pink-400 font-bold">{totalP} Perempuan</span>
          </div>
        </div>

        {/* Card 2: Kehadiran Harian */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Presensi Harian</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CalendarCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {attendancePercentage}% <span className="text-xs font-normal text-slate-500">Hadir</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>{presentCount} dari {attendanceRecords.length} siswa hari ini</span>
          </div>
        </div>

        {/* Card 3: Rombel & Tingkat */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Rombongan Belajar</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <School className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {classes.length} <span className="text-xs font-normal text-slate-500">Kelas Aktif</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 font-medium">
            <span>Tingkat X, XI, dan XII</span>
          </div>
        </div>

        {/* Card 4: Status Profil & Legalitas */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Profil & Kepala Sekolah</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Archive className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-xs font-bold text-slate-900 dark:text-white truncate">
            {schoolProfile.namaKepalaSekolah.split(',')[0]}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 truncate">
            NIP: {schoolProfile.nipKepalaSekolah}
          </div>
        </div>
      </div>

      {/* Matriks Demografi Tabel Interaktif L/P */}
      <DemographicMatrixTable students={students} classes={classes} />

      {/* Structured 1 - 7 Data Input Workflow Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                PANDUAN ALUR DATA
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Urutan Pengisian Data Master Buku Induk (Langkah 1 s/d 7)
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Klik setiap langkah untuk membuka modul input data terstruktur
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {/* Step 1 */}
          <div 
            onClick={() => onNavigate('step1_tahun_ajaran')}
            className="group cursor-pointer rounded-xl border border-slate-200 p-3 transition-all hover:border-amber-400 hover:shadow-md dark:border-slate-800 dark:hover:border-amber-500/60 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                  1
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Siap</span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-amber-600">
                Tahun Ajaran
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                2024/2025 Genap & Kurikulum Merdeka.
              </p>
            </div>
            <div className="mt-3 flex items-center text-[10px] font-bold text-amber-600 dark:text-amber-400 gap-1">
              <span>Buka</span>
              <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Step 2 */}
          <div 
            onClick={() => onNavigate('step2_jurusan')}
            className="group cursor-pointer rounded-xl border border-slate-200 p-3 transition-all hover:border-amber-400 hover:shadow-md dark:border-slate-800 dark:hover:border-amber-500/60 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                  2
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Siap</span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-amber-600">
                Jurusan
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                MIPA, IPS, Bahasa, dan Peminatan.
              </p>
            </div>
            <div className="mt-3 flex items-center text-[10px] font-bold text-amber-600 dark:text-amber-400 gap-1">
              <span>Buka</span>
              <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Step 3 */}
          <div 
            onClick={() => onNavigate('step3_tingkat')}
            className="group cursor-pointer rounded-xl border border-slate-200 p-3 transition-all hover:border-amber-400 hover:shadow-md dark:border-slate-800 dark:hover:border-amber-500/60 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                  3
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Siap</span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-amber-600">
                Tingkat
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                Tingkat X, XI, dan XII SMA.
              </p>
            </div>
            <div className="mt-3 flex items-center text-[10px] font-bold text-amber-600 dark:text-amber-400 gap-1">
              <span>Buka</span>
              <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Step 4 */}
          <div 
            onClick={() => onNavigate('step4_kelas')}
            className="group cursor-pointer rounded-xl border border-slate-200 p-3 transition-all hover:border-amber-400 hover:shadow-md dark:border-slate-800 dark:hover:border-amber-500/60 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                  4
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Siap</span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-amber-600">
                Data Kelas
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                Rombel, Wali Kelas, dan Kapasitas.
              </p>
            </div>
            <div className="mt-3 flex items-center text-[10px] font-bold text-amber-600 dark:text-amber-400 gap-1">
              <span>Buka</span>
              <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Step 5 */}
          <div 
            onClick={() => onNavigate('step5_siswa')}
            className="group cursor-pointer rounded-xl border border-amber-300 bg-amber-50/20 p-3 transition-all hover:border-amber-500 hover:shadow-md dark:border-amber-800 dark:bg-amber-950/20 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                  5
                </span>
                <span className="text-[10px] bg-amber-200 text-amber-900 px-1 rounded font-bold">Excel/ZIP</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600">
                Data Siswa
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                Bagian A-F, Impor Massal & ZIP Foto.
              </p>
            </div>
            <div className="mt-3 flex items-center text-[10px] font-bold text-amber-600 dark:text-amber-400 gap-1">
              <span>Kelola</span>
              <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Step 6 */}
          <div 
            onClick={() => onNavigate('step6_nilai')}
            className="group cursor-pointer rounded-xl border border-blue-300 bg-blue-50/20 p-3 transition-all hover:border-blue-500 hover:shadow-md dark:border-blue-800 dark:bg-blue-950/20 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white font-black text-[10px]">
                  6
                </span>
                <span className="text-[10px] bg-blue-100 text-blue-900 px-1 rounded font-bold">Merdeka</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600">
                Data Nilai
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                Semester 1-6, Custom Mapel, S/I/A & Ekskul.
              </p>
            </div>
            <div className="mt-3 flex items-center text-[10px] font-bold text-blue-600 dark:text-blue-400 gap-1">
              <span>Kelola</span>
              <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Step 7 */}
          <div 
            onClick={() => onNavigate('step7_kehadiran')}
            className="group cursor-pointer rounded-xl border border-emerald-300 bg-emerald-50/20 p-3 transition-all hover:border-emerald-500 hover:shadow-md dark:border-emerald-800 dark:bg-emerald-950/20 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white font-black text-[10px]">
                  7
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-900 px-1 rounded font-bold">Presensi</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600">
                Kehadiran
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                Aksi "Isi Cepat Hadir" & Status H/S/I/A.
              </p>
            </div>
            <div className="mt-3 flex items-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400 gap-1">
              <span>Isi Hadir</span>
              <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Production Architecture Summary */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400 flex-shrink-0">
            <Server className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Arsitektur Produksi Buku Induk: Cetak 1 File Gabungan & Autentikasi Admin
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              Sistem telah dikonfigurasi untuk pencetakan massal ke dalam <strong>1 berkas PDF utuh berkesinambungan</strong> (Cover Depan + Lembar Biodata A-F + Lembar Nilai) dengan <strong>Watermark Transparan</strong> (opacity custom) serta <strong>Opsi Centang Pengesahan Tanda Tangan</strong> Kepala Sekolah dan Wali Kelas. Kredensial pengguna menggunakan sistem Username & Password yang ditentukan oleh Administrator (tanpa mewajibkan email).
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
              <span className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300 font-mono">
                Format Tanggal Baku DD-MM-YYYY
              </span>
              <span className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300 font-mono">
                Upload Foto Massal .ZIP (Auto-match NIS/NISN)
              </span>
              <span className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300 font-mono">
                Kurikulum Merdeka Custom Mapel + Ekskul + S/I/A
              </span>
              <span className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300 font-mono">
                spatie/browsershot + spatie/laravel-backup v9
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
