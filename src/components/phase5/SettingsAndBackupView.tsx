import React, { useState, useRef } from 'react';
import {
  Database,
  Download,
  Upload,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  RefreshCw,
  FileJson,
  RotateCcw,
  CheckSquare,
  Square,
  X
} from 'lucide-react';
import {
  StudentFullRecord,
  DailyAttendanceRecord,
  SchoolProfile,
  AcademicYearRecord,
  TeacherRecord,
  DepartmentRecord,
  GradeLevelRecord,
  SchoolClassRecord,
  MasterSubjectRecord
} from '../../types/buku-induk';

export interface FullAppStoreBackupPayload {
  students?: StudentFullRecord[];
  attendanceRecords?: DailyAttendanceRecord[];
  schoolProfile?: SchoolProfile;
  academicYears?: AcademicYearRecord[];
  teachers?: TeacherRecord[];
  departments?: DepartmentRecord[];
  gradeLevels?: GradeLevelRecord[];
  schoolClasses?: SchoolClassRecord[];
  masterSubjects?: MasterSubjectRecord[];
}

export type ClearableDataKey =
  | 'academicYears'
  | 'teachers'
  | 'departments'
  | 'gradeLevels'
  | 'schoolClasses'
  | 'masterSubjects'
  | 'students'
  | 'attendanceRecords';

interface SettingsAndBackupViewProps {
  authToken?: string | null;
  students: StudentFullRecord[];
  attendanceRecords: DailyAttendanceRecord[];
  schoolProfile?: SchoolProfile;
  academicYears?: AcademicYearRecord[];
  teachers?: TeacherRecord[];
  departments?: DepartmentRecord[];
  gradeLevels?: GradeLevelRecord[];
  schoolClasses?: SchoolClassRecord[];
  masterSubjects?: MasterSubjectRecord[];
  onRestoreData: (restoredStudents: StudentFullRecord[], restoredAttendance: DailyAttendanceRecord[]) => void;
  onRestoreFullPayload?: (payload: FullAppStoreBackupPayload) => void;
  onClearSelectedCollections?: (keys: ClearableDataKey[]) => void;
  onClearAllToZero?: () => void;
  onResetToDefault: () => void;
  onShowNotification: (title: string, body: string, type: 'success' | 'info' | 'warning' | 'danger') => void;
}

export const SettingsAndBackupView: React.FC<SettingsAndBackupViewProps> = ({
  authToken,
  students,
  attendanceRecords,
  schoolProfile,
  academicYears = [],
  teachers = [],
  departments = [],
  gradeLevels = [],
  schoolClasses = [],
  masterSubjects = [],
  onRestoreData,
  onRestoreFullPayload,
  onClearSelectedCollections,
  onClearAllToZero,
  onResetToDefault,
  onShowNotification,
}) => {
  const [isDownloadingSqlite, setIsDownloadingSqlite] = useState(false);
  const [isRestoringSqlite, setIsRestoringSqlite] = useState(false);
  const [selectedClearKeys, setSelectedClearKeys] = useState<ClearableDataKey[]>([]);
  const [confirmModal, setConfirmModal] = useState<{
    type: 'clear_selected' | 'clear_all_zero' | 'reset_sample';
    title: string;
    description: string;
  } | null>(null);

  const sqliteInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  const collectionStats: {
    key: ClearableDataKey;
    label: string;
    category: 'Master Data' | 'Data Akademik';
    count: number;
    unit: string;
  }[] = [
    {
      key: 'academicYears',
      label: '1. Master Tahun Ajaran',
      category: 'Master Data',
      count: academicYears.length,
      unit: 'periode',
    },
    {
      key: 'teachers',
      label: '2. Master Data Guru & Wali Kelas',
      category: 'Master Data',
      count: teachers.length,
      unit: 'guru',
    },
    {
      key: 'departments',
      label: '3. Master Data Jurusan / Peminatan',
      category: 'Master Data',
      count: departments.length,
      unit: 'jurusan',
    },
    {
      key: 'gradeLevels',
      label: '4. Master Tingkat Kelas',
      category: 'Master Data',
      count: gradeLevels.length,
      unit: 'tingkat',
    },
    {
      key: 'schoolClasses',
      label: '5. Master Data Kelas / Rombel',
      category: 'Master Data',
      count: schoolClasses.length,
      unit: 'kelas',
    },
    {
      key: 'masterSubjects',
      label: '6. Master Mata Pelajaran Rapor',
      category: 'Master Data',
      count: masterSubjects.length,
      unit: 'mapel',
    },
    {
      key: 'students',
      label: 'Data Buku Induk Siswa & Nilai Rapor',
      category: 'Data Akademik',
      count: students.length,
      unit: 'siswa',
    },
    {
      key: 'attendanceRecords',
      label: 'Data Absensi Harian Siswa',
      category: 'Data Akademik',
      count: attendanceRecords.length,
      unit: 'presensi',
    },
  ];

  // 1. Unduh File Database SQLite Asli (.sqlite) dari Server
  const handleDownloadSqliteBackup = async () => {
    setIsDownloadingSqlite(true);
    try {
      const token = authToken || localStorage.getItem('bis_auth_token_v1') || '';
      const response = await fetch('/api/backup/sqlite', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Gagal mengunduh file database SQLite.');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      const filename = `bis_backup_${dateStr}.sqlite`;
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      onShowNotification(
        'Backup SQLite Diunduh',
        `File database fisik (${filename}) berhasil diunduh.`,
        'success'
      );
    } catch (err) {
      onShowNotification(
        'Gagal Mengunduh SQLite',
        err instanceof Error ? err.message : 'Terjadi kesalahan saat mengunduh database SQLite.',
        'danger'
      );
    } finally {
      setIsDownloadingSqlite(false);
    }
  };

  // 2. Restore Database dari File .sqlite
  const handleSqliteFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsRestoringSqlite(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const base64Data = event.target?.result as string;
        const token = authToken || localStorage.getItem('bis_auth_token_v1') || '';
        const response = await fetch('/api/restore/sqlite', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ sqliteBase64: base64Data }),
        });

        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Gagal memulihkan file database SQLite.');
        }

        if (result.data && onRestoreFullPayload) {
          onRestoreFullPayload(result.data);
        } else if (result.data?.students) {
          onRestoreData(result.data.students, result.data.attendanceRecords || []);
        }

        onShowNotification(
          'Database SQLite Dipulihkan',
          `Seluruh tabel dan master data berhasil dipulihkan dari berkas ${file.name}.`,
          'success'
        );
      } catch (err) {
        onShowNotification(
          'Gagal Restore SQLite',
          err instanceof Error ? err.message : 'Pastikan berkas .sqlite valid.',
          'danger'
        );
      } finally {
        setIsRestoringSqlite(false);
        if (sqliteInputRef.current) sqliteInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  // 3. Unduh Backup Lengkap Format .json
  const handleExportFullJsonBackup = () => {
    const backupPayload = {
      app: 'Buku Induk Siswa (BIS) Enterprise',
      version: 'v1.0.0-beta.1',
      exportedAt: new Date().toISOString(),
      data: {
        students,
        attendanceRecords,
        schoolProfile,
        academicYears,
        teachers,
        departments,
        gradeLevels,
        schoolClasses,
        masterSubjects,
      },
    };

    const jsonStr = JSON.stringify(backupPayload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const filename = `bis_full_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    onShowNotification(
      'Backup JSON Berhasil Diunduh',
      `Seluruh data siswa (${students.length}) dan 6 Master Data telah diekspor ke ${filename}.`,
      'success'
    );
  };

  // 4. Restore Database dari File .json
  const handleJsonFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const payload: FullAppStoreBackupPayload = parsed.data && typeof parsed.data === 'object' ? parsed.data : parsed;

        if (!payload || (!Array.isArray(payload.students) && !Array.isArray(payload.academicYears))) {
          onShowNotification(
            'Format JSON Tidak Valid',
            'Berkas JSON tidak memiliki struktur cadangan Buku Induk Siswa yang dikenali.',
            'danger'
          );
          return;
        }

        if (onRestoreFullPayload) {
          onRestoreFullPayload(payload);
        } else if (Array.isArray(payload.students)) {
          onRestoreData(payload.students, payload.attendanceRecords || []);
        }

        onShowNotification(
          'Restore JSON Berhasil',
          `Data berhasil dipulihkan dari berkas ${file.name}.`,
          'success'
        );
      } catch (err) {
        onShowNotification(
          'Gagal Membaca File JSON',
          err instanceof Error ? err.message : 'Berkas JSON rusak atau tidak sesuai format.',
          'danger'
        );
      } finally {
        if (jsonInputRef.current) jsonInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const toggleClearKey = (key: ClearableDataKey) => {
    setSelectedClearKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const selectAllMasterKeys = () => {
    const allKeys = collectionStats.map((c) => c.key);
    if (selectedClearKeys.length === allKeys.length) {
      setSelectedClearKeys([]);
    } else {
      setSelectedClearKeys(allKeys);
    }
  };

  const executeConfirmedAction = () => {
    if (!confirmModal) return;

    if (confirmModal.type === 'clear_selected') {
      if (onClearSelectedCollections && selectedClearKeys.length > 0) {
        onClearSelectedCollections(selectedClearKeys);
        setSelectedClearKeys([]);
      }
    } else if (confirmModal.type === 'clear_all_zero') {
      if (onClearAllToZero) {
        onClearAllToZero();
        setSelectedClearKeys([]);
      }
    } else if (confirmModal.type === 'reset_sample') {
      onResetToDefault();
      setSelectedClearKeys([]);
    }

    setConfirmModal(null);
  };

  return (
    <div className="space-y-6">
      {/* Input File Tersembunyi */}
      <input
        type="file"
        ref={sqliteInputRef}
        onChange={handleSqliteFileChange}
        accept=".sqlite,.db,.sqlite3"
        className="hidden"
      />
      <input
        type="file"
        ref={jsonInputRef}
        onChange={handleJsonFileChange}
        accept=".json"
        className="hidden"
      />

      {/* Ringkasan Status Database */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Data Siswa & Rapor
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-bold text-slate-900 dark:text-white font-mono">
              {students.length}
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Siswa
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Master Kelas & Guru
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-bold text-slate-900 dark:text-white font-mono">
              {schoolClasses.length} / {teachers.length}
            </span>
            <span className="text-xs font-semibold text-cyan-700 dark:text-cyan-400">
              Kelas / Guru
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Master Mapel & Jurusan
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-bold text-slate-900 dark:text-white font-mono">
              {masterSubjects.length} / {departments.length}
            </span>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              Mapel / Jurusan
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Rekaman Absensi
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-bold text-slate-900 dark:text-white font-mono">
              {attendanceRecords.length}
            </span>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Presensi
            </span>
          </div>
        </div>
      </div>

      {/* DUA PANEL UTAMA: BACKUP/RESTORE SQLITE ASLI & BACKUP/RESTORE JSON */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Panel 1: File Database SQLite Fisik (.sqlite) */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs flex flex-col justify-between">
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                  <HardDrive className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Database SQLite Fisik (.sqlite)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Cadangkan atau pulihkan langsung file binary database server (./data/bis.sqlite)
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800">
                Native SQLite3
              </span>
            </div>

            <div className="rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3 text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Direkomendasikan untuk Migrasi Server / Docker</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Menyimpan salinan utuh seluruh tabel SQLite termasuk Pengaturan Profil Sekolah, Logo, Master Data, Siswa, Nilai, dan Absensi.
              </p>
            </div>
          </div>

          <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleDownloadSqliteBackup}
              disabled={isDownloadingSqlite}
              className="inline-flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white transition-colors cursor-pointer"
            >
              {isDownloadingSqlite ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              <span>Unduh Database (.sqlite)</span>
            </button>

            <button
              type="button"
              onClick={() => sqliteInputRef.current?.click()}
              disabled={isRestoringSqlite}
              className="inline-flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {isRestoringSqlite ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
              <span>Restore dari File (.sqlite)</span>
            </button>
          </div>
        </div>

        {/* Panel 2: Arsip Lengkap JSON (.json) */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs flex flex-col justify-between">
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <FileJson className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Arsip Data Terstruktur (.json)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Ekspor dan impor seluruh koleksi data dalam format JSON portabel
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                Portable JSON
              </span>
            </div>

            <div className="rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3 text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Mencakup 9 Koleksi Data Aplikasi</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Berisi Tahun Ajaran, Guru, Jurusan, Tingkat, Kelas, Mata Pelajaran, Profil Sekolah, Buku Induk Siswa, dan Absensi.
              </p>
            </div>
          </div>

          <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportFullJsonBackup}
              className="inline-flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold accent-btn-primary text-white transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Unduh Backup Lengkap (.json)</span>
            </button>

            <button
              type="button"
              onClick={() => jsonInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Restore dari File (.json)</span>
            </button>
          </div>
        </div>
      </div>

      {/* PANEL 3: MANAJEMEN PENGHAPUSAN / PENGOSONGAN MASTER DATA & RESET DATABASE */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              <span>Hapus / Kosongkan Master Data Kustom & Reset Database</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pilih modul Master Data atau Data Siswa yang ingin dikosongkan agar dapat diisi ulang sesuai struktur sekolah Anda.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={selectAllMasterKeys}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
            >
              {selectedClearKeys.length === collectionStats.length ? (
                <CheckSquare className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              ) : (
                <Square className="h-3.5 w-3.5 text-slate-400" />
              )}
              <span>
                {selectedClearKeys.length === collectionStats.length
                  ? 'Batal Pilih Semua'
                  : 'Pilih Semua Modul'}
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                setConfirmModal({
                  type: 'reset_sample',
                  title: 'Kembalikan ke Data Sampel Awal?',
                  description:
                    'Seluruh Master Data (Tahun Ajaran, Guru, Jurusan, Tingkat, Kelas, Mapel) dan Data Siswa akan dikembalikan ke data sampel bawaan aplikasi.',
                })
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset ke Data Sampel</span>
            </button>
          </div>
        </div>

        {/* Daftar Modul Master Data & Akademik yang Dapat Dikosongkan */}
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {collectionStats.map((item) => {
              const isChecked = selectedClearKeys.includes(item.key);
              return (
                <div
                  key={item.key}
                  onClick={() => toggleClearKey(item.key)}
                  className={`flex items-start justify-between p-3.5 rounded-lg border transition-colors cursor-pointer select-none ${
                    isChecked
                      ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/30 dark:border-rose-700'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                    />
                    <div className="min-w-0">
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {item.category}
                      </span>
                      <div className="text-xs font-bold text-slate-900 dark:text-white leading-snug mt-0.5">
                        {item.label}
                      </div>
                      <div className="text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-300 mt-1">
                        {item.count} {item.unit}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Bar Penghapusan */}
          <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-600 dark:text-slate-300">
              {selectedClearKeys.length > 0 ? (
                <span className="font-semibold text-rose-600 dark:text-rose-400">
                  {selectedClearKeys.length} modul dipilih untuk dikosongkan
                </span>
              ) : (
                <span>Centang satu atau beberapa modul di atas untuk mengosongkan datanya.</span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                disabled={selectedClearKeys.length === 0}
                onClick={() =>
                  setConfirmModal({
                    type: 'clear_selected',
                    title: `Kosongkan ${selectedClearKeys.length} Modul Data Terpilih?`,
                    description:
                      'Seluruh baris data pada modul yang Anda centang akan dihapus permanen dari database SQLite. Pastikan Anda sudah mengunduh backup jika diperlukan.',
                  })
                }
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded text-xs font-semibold bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Kosongkan Modul Terpilih ({selectedClearKeys.length})</span>
              </button>

              {onClearAllToZero && (
                <button
                  type="button"
                  onClick={() =>
                    setConfirmModal({
                      type: 'clear_all_zero',
                      title: 'Kosongkan Seluruh Database (Mulai dari 0 Data)?',
                      description:
                        'Tindakan ini akan menghapus seluruh data bawaan (Siswa, Nilai, Absensi, Kelas, Guru, Jurusan, Tingkat, Tahun Ajaran, dan Mapel) sehingga aplikasi benar-benar kosong (0 data) dan siap diisi dari awal.',
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded text-xs font-semibold border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors cursor-pointer"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Kosongkan Semua (Mulai dari 0 Data)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi Penghapusan / Reset (Kontras Tinggi) */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Konfirmasi Tindakan Database
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-2">
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {confirmModal.title}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {confirmModal.description}
              </p>
            </div>

            <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-3.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeConfirmedAction}
                className="px-4 py-1.5 rounded bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white cursor-pointer"
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
