import React, { useState, useRef } from 'react';
import { 
  School, 
  Save, 
  Upload, 
  CheckCircle, 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  UserCheck, 
  Image as ImageIcon,
  Palette,
  Check,
  RefreshCw
} from 'lucide-react';
import { SchoolProfile, UIThemePreset } from '../../types/buku-induk';
import { UI_THEMES } from '../../theme/themes';
import { DEFAULT_SCHOOL_PROFILE } from '../../data/mock-data';

interface SchoolProfileSettingsViewProps {
  schoolProfile: SchoolProfile;
  onUpdateSchoolProfile: (profile: SchoolProfile) => void;
  currentTheme?: UIThemePreset;
  onSelectTheme?: (theme: UIThemePreset) => void;
  onShowNotification: (title: string, body: string, type: 'success' | 'info' | 'warning' | 'danger') => void;
}

export const SchoolProfileSettingsView: React.FC<SchoolProfileSettingsViewProps> = ({
  schoolProfile,
  onUpdateSchoolProfile,
  currentTheme = 'filament-amber',
  onSelectTheme,
  onShowNotification,
}) => {
  const [formData, setFormData] = useState<SchoolProfile>({ ...schoolProfile });
  const [isSaved, setIsSaved] = useState(false);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSchoolProfile(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
    onShowNotification(
      'Profil Sekolah Diperbarui',
      `Identitas resmi ${formData.namaSekolah} berhasil disimpan dan disinkronkan ke seluruh dokumen cetak.`,
      'success'
    );
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onShowNotification('Format Berkas Tidak Valid', 'Silakan unggah berkas gambar (PNG, JPG, SVG, atau WebP).', 'danger');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setFormData((prev) => ({ ...prev, logoUrl: dataUrl }));
        onShowNotification('Logo Berhasil Diunggah', 'Gambar logo lokal telah dimuat dan siap disimpan.', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetLogo = () => {
    setFormData((prev) => ({ ...prev, logoUrl: DEFAULT_SCHOOL_PROFILE.logoUrl }));
    onShowNotification('Logo Direset', 'Logo dikembalikan ke lambang standar.', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              PENGATURAN IDENTITAS & TEMA
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Profil & Identitas Resmi Sekolah
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Data ini otomatis dicantumkan pada Kop Surat Kedinasan, Cover Halaman Depan, dan Lembar Pengesahan Buku Induk
          </p>
        </div>

        <button
          onClick={handleSubmit}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-sm transition-all"
        >
          <Save className="h-4 w-4" />
          <span>Simpan Perubahan Profil</span>
        </button>
      </div>

      {/* 5 UI Themes Selection Cards */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-amber-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Pilihan Template & Tema Tampilan UI (5 Pilihan Kustomisasi)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Dapat dialihkan sewaktu-waktu tanpa memengaruhi data
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {UI_THEMES.map((theme) => {
            const isSelected = currentTheme === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => {
                  if (onSelectTheme) {
                    onSelectTheme(theme.id);
                    onShowNotification('Tema Berubah', `Template tampilan diubah ke ${theme.name}.`, 'info');
                  }
                }}
                className={`relative flex flex-col p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? `${theme.borderClass} ring-2 ${theme.ringClass} bg-slate-50 dark:bg-slate-800/80 shadow-sm`
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3.5 w-3.5 rounded-full shadow-xs"
                      style={{ backgroundColor: theme.accentHex }}
                    />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {theme.name}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-white">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">
                  {theme.tagline}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Logo & Visual */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 text-center space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Logo Resmi Sekolah
            </h3>

            <div className="flex flex-col items-center">
              <div className="h-32 w-32 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-2 flex items-center justify-center bg-slate-50 dark:bg-slate-800/40 relative group overflow-hidden">
                <img
                  src={formData.logoUrl}
                  alt={formData.namaSekolah}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-2">
                Format PNG/JPG/SVG transparan (digunakan untuk Kop Surat & Cover)
              </p>
            </div>

            {/* Upload File Button & Hidden Input */}
            <div className="space-y-2">
              <input
                ref={logoFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoFileUpload}
                className="hidden"
                id="upload-school-logo"
              />
              <button
                type="button"
                onClick={() => logoFileInputRef.current?.click()}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm transition-colors cursor-pointer"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Unggah File Logo Baru</span>
              </button>

              <button
                type="button"
                onClick={handleResetLogo}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Reset ke Logo Standar</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-left text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Atau Masukkan URL Gambar Logo
              </label>
              <input
                type="text"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                placeholder="https://domain.sch.id/logo.png"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-mono"
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60 text-xs text-slate-600 dark:text-slate-400 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <span>Sinkronisasi Otomatis Dokumen</span>
            </h4>
            <p className="text-[11px] leading-relaxed">
              Nama sekolah, NPSN, dan alamat yang Anda simpan di sini akan langsung memperbarui:
            </p>
            <ul className="text-[11px] list-disc list-inside space-y-0.5 text-slate-500">
              <li>Header & Navbar Panel Admin</li>
              <li>Layar Halaman Login</li>
              <li>Kop Surat Cetak Buku Induk</li>
              <li>Cover Halaman Depan Jilid Fisik</li>
              <li>Tanda Tangan Kepala Sekolah</li>
            </ul>
          </div>
        </div>

        {/* Right 2 Columns: School Master Fields */}
        <div className="lg:col-span-2 space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b pb-3 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Data Pokok Satuan Pendidikan
            </h3>
            <p className="text-xs text-slate-400">
              Isi sesuai data resmi Dapodik / Kemenristekdikti
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Resmi Satuan Pendidikan (Sekolah) *
              </label>
              <input
                type="text"
                required
                value={formData.namaSekolah}
                onChange={(e) => setFormData({ ...formData, namaSekolah: e.target.value })}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nomor Pokok Sekolah Nasional (NPSN) *
              </label>
              <input
                type="text"
                required
                value={formData.npsn}
                onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nomor Statistik Sekolah (NSS)
              </label>
              <input
                type="text"
                value={formData.nss}
                onChange={(e) => setFormData({ ...formData, nss: e.target.value })}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Peringkat Akreditasi
              </label>
              <input
                type="text"
                value={formData.akreditasi}
                onChange={(e) => setFormData({ ...formData, akreditasi: e.target.value })}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nomor Telepon Sekolah
              </label>
              <input
                type="text"
                value={formData.nomorTelepon}
                onChange={(e) => setFormData({ ...formData, nomorTelepon: e.target.value })}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Alamat Lengkap Jalan
              </label>
              <input
                type="text"
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kelurahan / Desa
              </label>
              <input
                type="text"
                value={formData.kelurahan}
                onChange={(e) => setFormData({ ...formData, kelurahan: e.target.value })}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kecamatan
              </label>
              <input
                type="text"
                value={formData.kecamatan}
                onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kota / Kabupaten
              </label>
              <input
                type="text"
                value={formData.kabupatenKota}
                onChange={(e) => setFormData({ ...formData, kabupatenKota: e.target.value })}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Provinsi
              </label>
              <input
                type="text"
                value={formData.provinsi}
                onChange={(e) => setFormData({ ...formData, provinsi: e.target.value })}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kode Pos
              </label>
              <input
                type="text"
                value={formData.kodePos}
                onChange={(e) => setFormData({ ...formData, kodePos: e.target.value })}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Resmi Sekolah
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Website Resmi Sekolah
              </label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs"
              />
            </div>

            {/* Kepala Sekolah */}
            <div className="sm:col-span-2 pt-4 border-t dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase mb-3 flex items-center gap-1.5">
                <UserCheck className="h-4 w-4 text-amber-500" />
                <span>Identitas Pimpinan / Kepala Sekolah (Penandatangan Ijazah & Buku Induk)</span>
              </h4>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Lengkap & Gelar Kepala Sekolah *
              </label>
              <input
                type="text"
                required
                value={formData.namaKepalaSekolah}
                onChange={(e) => setFormData({ ...formData, namaKepalaSekolah: e.target.value })}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                NIP Kepala Sekolah *
              </label>
              <input
                type="text"
                required
                value={formData.nipKepalaSekolah}
                onChange={(e) => setFormData({ ...formData, nipKepalaSekolah: e.target.value })}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-mono"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
