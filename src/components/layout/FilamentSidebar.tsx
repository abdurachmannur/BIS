import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Layers, 
  GraduationCap, 
  School, 
  Users, 
  Award, 
  CalendarCheck, 
  Printer, 
  FileSpreadsheet, 
  Settings, 
  Code2, 
  Archive, 
  LogOut, 
  ShieldCheck,
  CheckCircle2,
  FileText,
  UserCheck
} from 'lucide-react';
import { SchoolProfile, AuthUser } from '../../types/buku-induk';

export type ActiveNavKey = 
  | 'dashboard' 
  | 'step1_tahun_ajaran'
  | 'step2_guru'
  | 'step2_jurusan'
  | 'step3_tingkat'
  | 'step4_kelas'
  | 'step5_siswa'
  | 'step6_nilai'
  | 'step7_kehadiran'
  | 'cetak_dokumen_gabungan' 
  | 'queue_cetak_massal' 
  | 'impor_massal_center'
  | 'pengaturan_profil_sekolah'
  | 'pengaturan_backup' 
  | 'blueprint_arsitektur';

interface FilamentSidebarProps {
  activeNav: ActiveNavKey;
  onSelectNav: (key: ActiveNavKey) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
  schoolProfile: SchoolProfile;
  currentUser: AuthUser | null;
  onLogout: () => void;
}

interface NavItem {
  key: ActiveNavKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  stepBadge?: string;
  kicker?: string;
}

interface NavSection {
  group: string;
  items: NavItem[];
}

export const FilamentSidebar: React.FC<FilamentSidebarProps> = ({
  activeNav,
  onSelectNav,
  isOpen,
  onCloseMobile,
  schoolProfile,
  currentUser,
  onLogout,
}) => {
  const navSections: NavSection[] = [
    {
      group: 'Utama',
      items: [
        {
          key: 'dashboard' as ActiveNavKey,
          label: 'Dashboard & Demografi',
          icon: LayoutDashboard,
          badge: 'Live',
        },
      ],
    },
    {
      group: 'Alur Data Terstruktur (1 - 8)',
      items: [
        {
          key: 'step1_tahun_ajaran' as ActiveNavKey,
          label: '1. Input Tahun Ajaran',
          icon: Calendar,
          stepBadge: '1',
          kicker: 'Manual / .xlsx',
        },
        {
          key: 'step2_guru' as ActiveNavKey,
          label: '2. Input Data Guru',
          icon: UserCheck,
          stepBadge: '2',
          kicker: 'NIP & Wali Kelas / .xlsx',
        },
        {
          key: 'step2_jurusan' as ActiveNavKey,
          label: '3. Input Data Jurusan',
          icon: Layers,
          stepBadge: '3',
          kicker: 'Dropdown Guru / .xlsx',
        },
        {
          key: 'step3_tingkat' as ActiveNavKey,
          label: '4. Input Tingkat (X, XI, XII)',
          icon: GraduationCap,
          stepBadge: '4',
          kicker: 'Manual / .xlsx',
        },
        {
          key: 'step4_kelas' as ActiveNavKey,
          label: '5. Input Data Kelas',
          icon: School,
          stepBadge: '5',
          kicker: 'ID Unik per Tahun / .xlsx',
        },
        {
          key: 'step5_siswa' as ActiveNavKey,
          label: '6. Input Data Siswa (A-F)',
          icon: Users,
          stepBadge: '6',
          kicker: 'Dropdown Master / .xlsx',
        },
        {
          key: 'step6_nilai' as ActiveNavKey,
          label: '7. Input Data Nilai Sem 1-6',
          icon: Award,
          stepBadge: '7',
          kicker: 'Kurikulum Merdeka',
        },
        {
          key: 'step7_kehadiran' as ActiveNavKey,
          label: '8. Input Kehadiran Siswa',
          icon: CalendarCheck,
          stepBadge: '8',
          kicker: 'Isi Cepat Hadir',
        },
      ],
    },
    {
      group: 'Pusat Cetak & Impor',
      items: [
        {
          key: 'cetak_dokumen_gabungan' as ActiveNavKey,
          label: 'Cetak 1 Berkas PDF Gabungan',
          icon: Printer,
          badge: 'Resmi',
          kicker: 'Cover + Watermark + TTD',
        },
        {
          key: 'queue_cetak_massal' as ActiveNavKey,
          label: 'Queue Job Spatie Browsershot',
          icon: FileText,
          badge: 'Spatie',
        },
        {
          key: 'impor_massal_center' as ActiveNavKey,
          label: 'Pusat Impor Excel & ZIP Foto',
          icon: FileSpreadsheet,
          badge: 'Batch',
        },
      ],
    },
    {
      group: 'Konfigurasi & Sistem',
      items: [
        {
          key: 'pengaturan_profil_sekolah' as ActiveNavKey,
          label: 'Profil & Logo Sekolah',
          icon: Settings,
          kicker: 'Kop Surat & Cover',
        },
        {
          key: 'pengaturan_backup' as ActiveNavKey,
          label: 'Database & Spatie Backup',
          icon: Archive,
          kicker: 'JSON / SQL Restore',
        },
        {
          key: 'blueprint_arsitektur' as ActiveNavKey,
          label: 'Blueprint Kode Laravel 11',
          icon: Code2,
          badge: '7 Files',
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar aside */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-slate-900 text-slate-300 transition-transform duration-300 dark:border-slate-800 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header with custom school name & logo */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-800 border border-slate-700 overflow-hidden shadow-md">
            {schoolProfile.logoUrl ? (
              <img
                src={schoolProfile.logoUrl}
                alt={schoolProfile.namaSekolah}
                className="h-full w-full object-contain p-1"
              />
            ) : (
              <span className="font-black text-amber-400 text-sm">SMA</span>
            )}
          </div>
          <div className="min-w-0 leading-tight">
            <h1 className="text-xs font-bold text-white tracking-tight uppercase truncate">
              {schoolProfile.namaSekolah}
            </h1>
            <p className="text-[10px] text-amber-400 font-medium truncate mt-0.5">
              Buku Induk Digital · NPSN {schoolProfile.npsn}
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {section.group}
              </div>
              <div className="mt-1 space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeNav === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => {
                        onSelectNav(item.key);
                        onCloseMobile();
                      }}
                      className={`group flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {item.stepBadge ? (
                          <span
                            className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                              isActive
                                ? 'bg-slate-950 text-amber-400'
                                : 'bg-slate-800 text-amber-400 border border-slate-700'
                            }`}
                          >
                            {item.stepBadge}
                          </span>
                        ) : (
                          <Icon
                            className={`h-4 w-4 flex-shrink-0 transition-colors ${
                              isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-amber-400'
                            }`}
                          />
                        )}
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            isActive
                              ? 'bg-slate-950 text-amber-300'
                              : 'bg-slate-800 text-amber-400 border border-slate-700'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Info & Logout Button */}
        <div className="border-t border-slate-800 p-3 bg-slate-950/80 space-y-2">
          {currentUser && (
            <div className="flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3 w-3 text-amber-400 flex-shrink-0" />
                  <span className="text-xs font-bold text-white truncate block">
                    {currentUser.username}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 truncate block capitalize">
                  {currentUser.role.replace('_', ' ')}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded transition-colors"
                title="Keluar dari akun"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Keluar</span>
              </button>
            </div>
          )}
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
            <span>Laravel 11 & Filament v3</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Produksi
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
