import React, { useState, useRef } from 'react';
import { 
  Archive, 
  Database, 
  ShieldCheck, 
  Play, 
  Download, 
  Trash2, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Settings, 
  Users, 
  Calendar, 
  HardDrive,
  RefreshCw,
  Terminal,
  Upload,
  FileText,
  RotateCcw
} from 'lucide-react';
import { DatabaseBackupEntry, StudentFullRecord, DailyAttendanceRecord } from '../../types/buku-induk';

interface SettingsAndBackupViewProps {
  students: StudentFullRecord[];
  attendanceRecords: DailyAttendanceRecord[];
  onRestoreData: (restoredStudents: StudentFullRecord[], restoredAttendance: DailyAttendanceRecord[]) => void;
  onResetToDefault: () => void;
  onShowNotification: (title: string, body: string, type: 'success' | 'info' | 'warning' | 'danger') => void;
}

export const SettingsAndBackupView: React.FC<SettingsAndBackupViewProps> = ({
  students,
  attendanceRecords,
  onRestoreData,
  onResetToDefault,
  onShowNotification,
}) => {
  const [activeTab, setActiveTab] = useState<'backup' | 'roles' | 'academic_years'>('backup');
  const [isBackingUp, setIsBackingUp] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Backup file records
  const [backupFiles, setBackupFiles] = useState<DatabaseBackupEntry[]>([
    {
      id: 'BK-001',
      filename: '2026-10-11-02-00-00-buku_induk_db.zip',
      disk: 'local (storage/app/backups)',
      sizeBytes: 14200000,
      createdAt: '2026-10-11 02:00:15',
      type: 'db_only',
      status: 'healthy',
    },
    {
      id: 'BK-002',
      filename: '2026-10-10-02-00-00-buku_induk_db.zip',
      disk: 'local (storage/app/backups)',
      sizeBytes: 14100000,
      createdAt: '2026-10-10 02:00:12',
      type: 'db_only',
      status: 'healthy',
    },
    {
      id: 'BK-003',
      filename: '2026-10-05-full-backup-with-photos.zip',
      disk: 'local (storage/app/backups)',
      sizeBytes: 86400000,
      createdAt: '2026-10-05 02:00:45',
      type: 'full',
      status: 'healthy',
    },
  ]);

  // Real JSON/SQL Backup Exporter
  const handleExportRealDatabaseBackup = () => {
    const backupPayload = {
      app: 'Buku Induk Siswa Digital SMA',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      metadata: {
        totalStudents: students.length,
        totalAttendance: attendanceRecords.length,
      },
      students,
      attendanceRecords,
    };

    const jsonStr = JSON.stringify(backupPayload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const filename = `backup_buku_induk_${new Date().toISOString().slice(0, 10)}_${Date.now()}.json`;
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    // Add entry to history list
    const newEntry: DatabaseBackupEntry = {
      id: 'BK-' + Date.now(),
      filename,
      disk: 'local (browser client storage)',
      sizeBytes: jsonStr.length,
      createdAt: new Date().toLocaleString(),
      type: 'db_only',
      status: 'healthy',
    };
    setBackupFiles((prev) => [newEntry, ...prev]);

    onShowNotification(
      'Backup Database Diunduh',
      `Seluruh data buku induk (${students.length} siswa) berhasil diekspor ke file ${filename}`,
      'success'
    );
  };

  // Real Database Restore from Uploaded JSON
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.students && Array.isArray(parsed.students)) {
          onRestoreData(parsed.students, parsed.attendanceRecords || []);
          onShowNotification(
            'Restore Database Berhasil',
            `Berhasil memulihkan ${parsed.students.length} data siswa dari berkas backup.`,
            'success'
          );
        } else {
          alert('Format berkas backup tidak valid! Pastikan berkas berasal dari ekspor Buku Induk.');
        }
      } catch (err) {
        alert('Gagal membaca berkas JSON: ' + (err as Error).message);
      }
    };
    reader.readAsText(file);
  };

  // Trigger simulated Artisan command
  const handleTriggerSimulatedBackup = (onlyDb: boolean = true) => {
    setIsBackingUp(true);

    setTimeout(() => {
      setIsBackingUp(false);
      handleExportRealDatabaseBackup();
    }, 1200);
  };

  const handleDeleteBackup = (id: string, filename: string) => {
    setBackupFiles((prev) => prev.filter((b) => b.id !== id));
    onShowNotification(
      'Berkas Backup Dihapus',
      `File arsip ${filename} telah dihapus dari daftar riwayat.`,
      'warning'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              FASE 5
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Sistem, Pengaturan & Spatie Backup
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manajemen Role & Permission, Master Akademik, dan Pemeliharaan Database Spatie Laravel Backup
          </p>
        </div>

        {/* Action button to trigger backup */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-sm transition-all"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Restore Backup (.json)</span>
          </button>

          <button
            onClick={() => handleTriggerSimulatedBackup(true)}
            disabled={isBackingUp}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg shadow-sm transition-all ${
              isBackingUp
                ? 'bg-amber-400 text-slate-900 cursor-wait'
                : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
            }`}
          >
            {isBackingUp ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Mengeksekusi Artisan backup:run...</span>
              </>
            ) : (
              <>
                <Database className="h-3.5 w-3.5" />
                <span>⚡ Jalankan Backup Database Sekarang</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('backup')}
          className={`flex items-center gap-1.5 py-3 border-b-2 transition-all ${
            activeTab === 'backup'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Archive className="h-4 w-4" />
          <span>Spatie Laravel Backup & Restore</span>
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-1.5 py-3 border-b-2 transition-all ${
            activeTab === 'roles'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Manajemen Hak Akses & Role (Admin / Guru)</span>
        </button>

        <button
          onClick={() => setActiveTab('academic_years')}
          className={`flex items-center gap-1.5 py-3 border-b-2 transition-all ${
            activeTab === 'academic_years'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Pengaturan Rombel & Tahun Ajaran</span>
        </button>
      </div>

      {/* TAB 1: SPATIE BACKUP */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          {/* Status KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-medium text-slate-500">Status Database Saat Ini</span>
              <div className="mt-1 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  {students.length} Siswa Terdaftar
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                {attendanceRecords.length} rekaman presensi harian
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-medium text-slate-500">Jadwal Backup Otomatis</span>
              <div className="mt-1 flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                <span className="text-base font-bold text-slate-900 dark:text-white">Daily at 02:00 WIB</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Via Laravel Scheduler Cron Job</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-medium text-slate-500">Total Berkas Tersimpan</span>
              <div className="mt-1 flex items-center gap-2">
                <HardDrive className="h-5 w-5 text-indigo-500" />
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  {backupFiles.length} Berkas Cadangan
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Siap diunduh dan dipulihkan kapan saja
              </p>
            </div>
          </div>

          {/* Backup Files Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Daftar Riwayat Arsip Backup Database (spatie/laravel-backup)
                </h3>
              </div>
              <button
                onClick={onResetToDefault}
                className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-amber-600"
                title="Kembalikan data contoh awal"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset Data ke Contoh Asli</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50/80 text-slate-600 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-400">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Nama Berkas ZIP / JSON</th>
                    <th className="py-2.5 px-4 font-semibold">Tipe Pencadangan</th>
                    <th className="py-2.5 px-4 font-semibold">Ukuran File</th>
                    <th className="py-2.5 px-4 font-semibold">Waktu Pembuatan</th>
                    <th className="py-2.5 px-4 font-semibold">Status Disk</th>
                    <th className="py-2.5 px-4 text-center font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {backupFiles.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-medium text-slate-900 dark:text-white">
                        {item.filename}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.type === 'db_only'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                        }`}>
                          {item.type === 'db_only' ? 'Database SQL / JSON' : 'Full (DB + Foto)'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        {item.sizeBytes > 1000000 
                          ? `${(item.sizeBytes / 1024 / 1024).toFixed(2)} MB`
                          : `${(item.sizeBytes / 1024).toFixed(1)} KB`}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {item.createdAt}
                      </td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1.5 text-emerald-600 font-semibold text-[11px]">
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>Terverifikasi Integritas</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={handleExportRealDatabaseBackup}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                            title="Unduh Berkas Backup Ini"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBackup(item.id, item.filename)}
                            className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-400"
                            title="Hapus Berkas Backup"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ROLES */}
      {activeTab === 'roles' && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Hak Akses & Role Pengguna (Filament Shield / Spatie Permission)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                <tr>
                  <th className="py-2 px-3 font-semibold">Role Name</th>
                  <th className="py-2 px-3 font-semibold">Akses Absensi (Fase 1)</th>
                  <th className="py-2 px-3 font-semibold">Akses Buku Induk (Fase 2)</th>
                  <th className="py-2 px-3 font-semibold">Input Nilai (Fase 3)</th>
                  <th className="py-2 px-3 font-semibold">Cetak PDF Massal (Fase 4)</th>
                  <th className="py-2 px-3 font-semibold">Trigger Backup (Fase 5)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="py-3 px-3 font-bold text-amber-600">Super Admin / Kepala TU</td>
                  <td className="py-3 px-3">✓ Penuh</td>
                  <td className="py-3 px-3">✓ Kelola A-F</td>
                  <td className="py-3 px-3">✓ Semua Mapel</td>
                  <td className="py-3 px-3">✓ Semua Kelas/Angkatan</td>
                  <td className="py-3 px-3">✓ Ya</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-bold text-blue-600">Wali Kelas</td>
                  <td className="py-3 px-3">✓ Kelas Sendiri</td>
                  <td className="py-3 px-3">✓ Baca/Ubah Kelas Sendiri</td>
                  <td className="py-3 px-3">✓ Leger & Rapor Kelas</td>
                  <td className="py-3 px-3">✓ Kelas Sendiri</td>
                  <td className="py-3 px-3">✗ Tidak</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-bold text-emerald-600">Guru Mata Pelajaran</td>
                  <td className="py-3 px-3">✓ Presensi Mapel</td>
                  <td className="py-3 px-3">✗ Hanya Biodata Singkat</td>
                  <td className="py-3 px-3">✓ Nilai Mapel Sendiri</td>
                  <td className="py-3 px-3">✗ Tidak</td>
                  <td className="py-3 px-3">✗ Tidak</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ACADEMIC YEARS & CLASSES */}
      {activeTab === 'academic_years' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-white">
              Tahun Ajaran & Semester Aktif
            </h4>
            <div className="p-3 border rounded-lg bg-slate-50 dark:bg-slate-800/40">
              <span className="text-slate-400 block text-[10px]">Tahun Pelajaran Berjalan</span>
              <strong className="text-sm">2024 / 2025 (Semester Genap)</strong>
            </div>
            <div className="p-3 border rounded-lg bg-slate-50 dark:bg-slate-800/40">
              <span className="text-slate-400 block text-[10px]">Kurikulum Berlaku</span>
              <strong className="text-sm">Kurikulum Merdeka & K-13 (Transisi Kelas XII)</strong>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-white">
              Daftar Rombongan Belajar (Rombel)
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 border rounded font-mono font-bold">X-MIPA-1 (36)</div>
              <div className="p-2 border rounded font-mono font-bold">X-MIPA-2 (36)</div>
              <div className="p-2 border rounded font-mono font-bold">X-IPS-1 (36)</div>
              <div className="p-2 border rounded font-mono font-bold">XI-MIPA-1 (36)</div>
              <div className="p-2 border rounded font-mono font-bold">XI-MIPA-2 (36)</div>
              <div className="p-2 border rounded font-mono font-bold">XI-IPS-1 (36)</div>
              <div className="p-2 border rounded font-mono font-bold">XII-MIPA-1 (36)</div>
              <div className="p-2 border rounded font-mono font-bold">XII-MIPA-2 (36)</div>
              <div className="p-2 border rounded font-mono font-bold">XII-IPS-1 (36)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
