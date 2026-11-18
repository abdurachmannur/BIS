import React from 'react';
import {
  Users,
  CalendarCheck,
  Printer,
  Archive,
  School,
  FileSpreadsheet,
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
  const totalL = students.filter((s) => s.personal.jenisKelamin === 'L').length;
  const totalP = students.filter((s) => s.personal.jenisKelamin === 'P').length;

  const presentCount = attendanceRecords.filter((a) => a.status === 'H').length;
  const attendancePercentage =
    attendanceRecords.length > 0
      ? Math.round((presentCount / attendanceRecords.length) * 100)
      : 100;

  return (
    <div className="space-y-5">
      {/* Top Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          {schoolProfile.logoUrl && (
            <img
              src={schoolProfile.logoUrl}
              alt={schoolProfile.namaSekolah}
              className="h-9 w-9 rounded-md border border-slate-200 dark:border-slate-700 object-contain p-0.5 bg-white shrink-0"
            />
          )}
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {schoolProfile.namaSekolah}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                NPSN: {schoolProfile.npsn}
              </span>
              <span className="truncate">{schoolProfile.kabupatenKota}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenImportModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Impor Excel & ZIP Foto</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('cetak_dokumen_gabungan')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md accent-btn-primary text-white transition-colors shadow-xs cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>Cetak Rapor & Buku Induk PDF</span>
          </button>
        </div>
      </div>

      {/* 4 Multi-Accent KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Siswa & Gender */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Total Buku Induk
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {totalStudents}{' '}
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">Siswa</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
            <span className="text-blue-600 dark:text-blue-400 font-semibold">{totalL} Laki-laki</span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className="text-teal-600 dark:text-teal-400 font-semibold">{totalP} Perempuan</span>
          </div>
        </div>

        {/* Card 2: Kehadiran Harian */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Presensi Harian
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CalendarCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {attendancePercentage}%{' '}
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">Hadir</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>
              {presentCount} dari {attendanceRecords.length} data presensi
            </span>
          </div>
        </div>

        {/* Card 3: Rombel & Tingkat */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Rombongan Belajar
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-cyan-50 dark:bg-cyan-950/60 text-teal-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800">
              <School className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {classes.length}{' '}
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">Kelas Aktif</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
              Tingkat X, XI & XII
            </span>
          </div>
        </div>

        {/* Card 4: Kepala Sekolah */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Kepala Sekolah
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Archive className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-sm font-bold text-slate-900 dark:text-white truncate">
            {schoolProfile.namaKepalaSekolah}
          </div>
          <div className="mt-2 text-xs font-mono text-slate-500 dark:text-slate-400 truncate">
            NIP: {schoolProfile.nipKepalaSekolah}
          </div>
        </div>
      </div>

      {/* Matriks Demografi Tabel Interaktif L/P */}
      <DemographicMatrixTable students={students} classes={classes} />
    </div>
  );
};
