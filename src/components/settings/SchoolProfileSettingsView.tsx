import React, { useState, useRef } from 'react';
import {
  School,
  Save,
  Upload,
  Lock,
  KeyRound,
  RefreshCw,
  Terminal,
  GitBranch,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Database,
  Palette,
  Sun,
  Moon,
  Check
} from 'lucide-react';
import {
  SchoolProfile,
  UIAccentColor,
  UIColorMode,
  StudentFullRecord,
  DailyAttendanceRecord,
  AcademicYearRecord,
  TeacherRecord,
  DepartmentRecord,
  GradeLevelRecord,
  SchoolClassRecord,
  MasterSubjectRecord
} from '../../types/buku-induk';
import { DEFAULT_SCHOOL_PROFILE } from '../../data/mock-data';
import { CORPORATE_ACCENT_OPTIONS } from '../layout/FilamentNavbar';
import {
  SettingsAndBackupView,
  FullAppStoreBackupPayload,
  ClearableDataKey
} from '../phase5/SettingsAndBackupView';

interface SchoolProfileSettingsViewProps {
  schoolProfile: SchoolProfile;
  onUpdateSchoolProfile: (profile: SchoolProfile) => void;
  authToken?: string | null;
  username?: string;
  colorMode?: UIColorMode;
  onChangeColorMode?: (mode: UIColorMode) => void;
  accentColor?: UIAccentColor;
  onChangeAccentColor?: (accent: UIAccentColor) => void;
  students?: StudentFullRecord[];
  attendanceRecords?: DailyAttendanceRecord[];
  academicYears?: AcademicYearRecord[];
  teachers?: TeacherRecord[];
  departments?: DepartmentRecord[];
  gradeLevels?: GradeLevelRecord[];
  schoolClasses?: SchoolClassRecord[];
  masterSubjects?: MasterSubjectRecord[];
  onRestoreData?: (restoredStudents: StudentFullRecord[], restoredAttendance: DailyAttendanceRecord[]) => void;
  onRestoreFullPayload?: (payload: FullAppStoreBackupPayload) => void;
  onClearSelectedCollections?: (keys: ClearableDataKey[]) => void;
  onClearAllToZero?: () => void;
  onResetToDefault?: () => void;
  onShowNotification: (
    title: string,
    body: string,
    type: 'success' | 'info' | 'warning' | 'danger'
  ) => void;
}

type SettingsTabKey = 'profile' | 'backup-restore' | 'security' | 'system-update';

export const SchoolProfileSettingsView: React.FC<SchoolProfileSettingsViewProps> = ({
  schoolProfile,
  onUpdateSchoolProfile,
  authToken,
  username = 'admin',
  colorMode = 'light',
  onChangeColorMode,
  accentColor = 'royal',
  onChangeAccentColor,
  students = [],
  attendanceRecords = [],
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
  const [activeTab, setActiveTab] = useState<SettingsTabKey>('profile');

  // --- Tab 1: Profil & Logo Sekolah State ---
  const [formData, setFormData] = useState<SchoolProfile>({ ...schoolProfile });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // --- Tab 3: Keamanan Akun (Ubah Password) State ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // --- Tab 4: Pembaruan Sistem (Update via GitHub) State ---
  const [isUpdatingSystem, setIsUpdatingSystem] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string>(
    'Siap memeriksa pembaruan dari repositori https://github.com/abdurachmannur/BIS ...'
  );

  // Handlers Tab 1: Profil & Logo Sekolah
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onShowNotification('Format Tidak Valid', 'Silakan pilih file gambar (PNG, JPG, SVG, WebP).', 'danger');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setFormData((prev) => ({ ...prev, logoUrl: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSchoolProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      onUpdateSchoolProfile(formData);
      if (authToken) {
        await fetch('/api/settings/school-profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(formData),
        });
      }
      onShowNotification('Berhasil Disimpan', 'Profil dan Logo Sekolah telah diperbarui.', 'success');
    } catch (_err) {
      onShowNotification('Peringatan', 'Profil disimpan secara lokal.', 'warning');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handlers Tab 3: Keamanan Akun (Ubah Password)
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword.length < 4) {
      setPasswordMessage({
        type: 'error',
        text: 'Password baru minimal terdiri dari 4 karakter.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({
        type: 'error',
        text: 'Konfirmasi password baru tidak sesuai.',
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setPasswordMessage({
          type: 'error',
          text: data.error || 'Gagal mengubah password.',
        });
        setIsChangingPassword(false);
        return;
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMessage({
        type: 'success',
        text: data.message || 'Password berhasil diperbarui.',
      });
      onShowNotification('Password Diperbarui', 'Password akun berhasil diubah.', 'success');
    } catch (_err) {
      setPasswordMessage({
        type: 'error',
        text: 'Gagal menghubungi server.',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handlers Tab 4: Pembaruan Sistem (Update via GitHub)
  const handleTriggerGitHubUpdate = async () => {
    setIsUpdatingSystem(true);
    setTerminalLogs(
      `[${new Date().toISOString()}] Menghubungi server untuk mengeksekusi:\n$ git pull origin main && npm install && npm run build\nMohon tunggu...`
    );

    try {
      const response = await fetch('/api/system/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
      });

      const data = await response.json();
      if (data.output) {
        setTerminalLogs(data.output);
      } else {
        setTerminalLogs(
          `${data.stdout || ''}\n${data.stderr || ''}`.trim() ||
            'Proses selesai tanpa output tambahan.'
        );
      }

      if (data.success) {
        onShowNotification(
          'Update Berhasil',
          'Sistem berhasil diperbarui dari GitHub dan sedang dimulai ulang.',
          'success'
        );
      } else {
        onShowNotification(
          'Proses Update Selesai',
          'Periksa log terminal untuk melihat detail output.',
          'info'
        );
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Koneksi terputus saat server restart';
      setTerminalLogs((prev) => `${prev}\n[INFO] ${message}`);
    } finally {
      setIsUpdatingSystem(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Navigasi 4 Tab Ant Design Pro */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 px-4 pt-3 flex flex-wrap items-center gap-4 sm:gap-6 border-b">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'profile'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <School className="h-4 w-4" />
          <span>Profil, Logo & Tema UI</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('backup-restore')}
          className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'backup-restore'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Database className="h-4 w-4" />
          <span>Backup & Restore Database</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'security'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Lock className="h-4 w-4" />
          <span>Keamanan Akun (Ubah Password)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('system-update')}
          className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'system-update'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <GitBranch className="h-4 w-4" />
          <span>Pembaruan Sistem (Update via GitHub)</span>
        </button>
      </div>

      {/* TAB 1: PROFIL SEKOLAH, LOGO & TEMA / AKSEN WARNA UI */}
      {activeTab === 'profile' && (
        <div className="space-y-4">
          {/* Kustomisasi Tema Terang/Gelap & 5 Aksen Warna Korporat */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Tema Tampilan & Pilihan Warna Aksen Korporat
                </h3>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Tersimpan otomatis di browser perangkat Anda
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Pemilih Mode Terang / Gelap */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Mode Kontras Layar
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => onChangeColorMode && onChangeColorMode('light')}
                    className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                      colorMode === 'light'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-500 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Sun className="h-4 w-4 text-amber-500" />
                    <span>Mode Terang</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onChangeColorMode && onChangeColorMode('dark')}
                    className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                      colorMode === 'dark'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-500 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Moon className="h-4 w-4 text-indigo-500" />
                    <span>Mode Gelap</span>
                  </button>
                </div>
              </div>

              {/* Pemilih 5 Warna Aksen Korporat */}
              <div className="lg:col-span-2 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  5 Pilihan Aksen Warna Korporat
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                  {CORPORATE_ACCENT_OPTIONS.map((opt) => {
                    const isSelected = accentColor === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => onChangeAccentColor && onChangeAccentColor(opt.id)}
                        className={`flex items-center justify-between sm:flex-col sm:items-start p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800 shadow-xs'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span
                            className="h-5 w-5 rounded-full border border-black/10 shadow-2xs"
                            style={{ backgroundColor: opt.hex }}
                          />
                          {isSelected && (
                            <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                            {opt.label}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {opt.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Form Profil & Logo Sekolah */}
          <form
            onSubmit={handleSaveSchoolProfile}
            className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Kolom Upload Logo */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col items-center justify-center text-center bg-slate-50/70 dark:bg-slate-800/40 space-y-3">
                <div className="h-28 w-28 rounded border border-slate-200 dark:border-slate-700 bg-white flex items-center justify-center overflow-hidden p-2">
                  {formData.logoUrl ? (
                    <img
                      src={formData.logoUrl}
                      alt={formData.namaSekolah}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <School className="h-12 w-12 text-slate-400" />
                  )}
                </div>

                <input
                  ref={logoFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoFileUpload}
                  className="hidden"
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => logoFileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold accent-btn-primary text-white transition-colors cursor-pointer"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload Logo</span>
                  </button>
                  {formData.logoUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          logoUrl: DEFAULT_SCHOOL_PROFILE.logoUrl,
                        }))
                      }
                      className="px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Ditampilkan otomatis pada Halaman Login & Kop Rapor PDF
                </span>
              </div>

              {/* Kolom Input Data Sekolah */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Nama Sekolah
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.namaSekolah}
                    onChange={(e) =>
                      setFormData({ ...formData, namaSekolah: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    NPSN
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.npsn}
                    onChange={(e) =>
                      setFormData({ ...formData, npsn: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white font-mono focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    NSS
                  </label>
                  <input
                    type="text"
                    value={formData.nss}
                    onChange={(e) =>
                      setFormData({ ...formData, nss: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white font-mono focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Akreditasi
                  </label>
                  <input
                    type="text"
                    value={formData.akreditasi}
                    onChange={(e) =>
                      setFormData({ ...formData, akreditasi: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Nomor Telepon
                  </label>
                  <input
                    type="text"
                    value={formData.nomorTelepon}
                    onChange={(e) =>
                      setFormData({ ...formData, nomorTelepon: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Alamat Jalan
                  </label>
                  <input
                    type="text"
                    value={formData.alamat}
                    onChange={(e) =>
                      setFormData({ ...formData, alamat: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Kelurahan / Desa
                  </label>
                  <input
                    type="text"
                    value={formData.kelurahan}
                    onChange={(e) =>
                      setFormData({ ...formData, kelurahan: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Kecamatan
                  </label>
                  <input
                    type="text"
                    value={formData.kecamatan}
                    onChange={(e) =>
                      setFormData({ ...formData, kecamatan: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Kabupaten / Kota
                  </label>
                  <input
                    type="text"
                    value={formData.kabupatenKota}
                    onChange={(e) =>
                      setFormData({ ...formData, kabupatenKota: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Provinsi & Kode Pos
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Provinsi"
                      value={formData.provinsi}
                      onChange={(e) =>
                        setFormData({ ...formData, provinsi: e.target.value })
                      }
                      className="col-span-2 px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Kode Pos"
                      value={formData.kodePos}
                      onChange={(e) =>
                        setFormData({ ...formData, kodePos: e.target.value })
                      }
                      className="px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white font-mono focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Nama Kepala Sekolah
                  </label>
                  <input
                    type="text"
                    value={formData.namaKepalaSekolah}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        namaKepalaSekolah: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    NIP Kepala Sekolah
                  </label>
                  <input
                    type="text"
                    value={formData.nipKepalaSekolah}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nipKepalaSekolah: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white font-mono focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Email Resmi
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Website Sekolah
                  </label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="inline-flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{isSavingProfile ? 'Menyimpan...' : 'Simpan Profil Sekolah'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: BACKUP & RESTORE DATABASE (.SQLITE & .JSON) */}
      {activeTab === 'backup-restore' && (
        <SettingsAndBackupView
          authToken={authToken}
          students={students}
          attendanceRecords={attendanceRecords}
          schoolProfile={schoolProfile}
          academicYears={academicYears}
          teachers={teachers}
          departments={departments}
          gradeLevels={gradeLevels}
          schoolClasses={schoolClasses}
          masterSubjects={masterSubjects}
          onRestoreData={onRestoreData || (() => {})}
          onRestoreFullPayload={onRestoreFullPayload}
          onClearSelectedCollections={onClearSelectedCollections}
          onClearAllToZero={onClearAllToZero}
          onResetToDefault={onResetToDefault || (() => {})}
          onShowNotification={onShowNotification}
        />
      )}

      {/* TAB 3: KEAMANAN AKUN (UBAH PASSWORD) */}
      {activeTab === 'security' && (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 max-w-xl">
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Ubah Password Administrator
                </span>
              </div>
              <span className="text-xs font-mono text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 px-2 py-0.5 rounded">
                @{username}
              </span>
            </div>

            {passwordMessage && (
              <div
                className={`p-3 rounded border text-xs flex items-center gap-2 ${
                  passwordMessage.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300'
                }`}
              >
                {passwordMessage.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0" />
                )}
                <span>{passwordMessage.text}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Password Lama
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Masukkan password lama"
                  className="w-full px-3 py-2 pr-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Password Baru
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Masukkan password baru"
                className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Konfirmasi Password Baru
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password baru"
                className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isChangingPassword}
                className="inline-flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>
                  {isChangingPassword ? 'Memproses...' : 'Simpan Password Baru'}
                </span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: PEMBARUAN SISTEM (UPDATE VIA GITHUB) */}
      {activeTab === 'system-update' && (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Versi Aplikasi:
                </span>
                <span className="px-2.5 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 font-mono text-xs font-semibold">
                  v1.0.0-beta.1
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-medium">
                  Status: Beta Release
                </span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                Repositori: https://github.com/abdurachmannur/BIS
              </div>
            </div>

            <button
              type="button"
              onClick={handleTriggerGitHubUpdate}
              disabled={isUpdatingSystem}
              className="inline-flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer disabled:opacity-50 shrink-0"
            >
              <RefreshCw
                className={`h-4 w-4 ${isUpdatingSystem ? 'animate-spin' : ''}`}
              />
              <span>
                {isUpdatingSystem
                  ? 'Menjalankan Update...'
                  : 'Cek & Update dari GitHub'}
              </span>
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
              <Terminal className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <span>Output Terminal Pembaruan</span>
            </div>
            <pre className="w-full min-h-[240px] max-h-[420px] overflow-y-auto rounded p-4 bg-slate-950 text-emerald-400 font-mono text-xs leading-relaxed whitespace-pre-wrap border border-slate-800">
              {terminalLogs}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
