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
  FileText,
  UserCheck,
  PanelLeftClose,
  PanelLeftOpen,
  Search
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
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenCommandPalette?: () => void;
  schoolProfile: SchoolProfile;
  currentUser: AuthUser | null;
  onLogout: () => void;
}

interface NavItem {
  key: ActiveNavKey;
  label: string;
  shortLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  stepBadge?: string;
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
  isCollapsed = false,
  onToggleCollapse,
  onOpenCommandPalette,
  schoolProfile,
  currentUser,
  onLogout,
}) => {
  const navSections: NavSection[] = [
    {
      group: 'Workspace',
      items: [
        {
          key: 'dashboard',
          label: 'Ringkasan & Demografi',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      group: 'Alur Data & Akademik (1–8)',
      items: [
        {
          key: 'step1_tahun_ajaran',
          label: '1. Tahun Ajaran',
          icon: Calendar,
          stepBadge: '1',
        },
        {
          key: 'step2_guru',
          label: '2. Data Guru & Wali',
          icon: UserCheck,
          stepBadge: '2',
        },
        {
          key: 'step2_jurusan',
          label: '3. Data Jurusan',
          icon: Layers,
          stepBadge: '3',
        },
        {
          key: 'step3_tingkat',
          label: '4. Tingkat Kelas (X–XII)',
          icon: GraduationCap,
          stepBadge: '4',
        },
        {
          key: 'step4_kelas',
          label: '5. Rombel Kelas',
          icon: School,
          stepBadge: '5',
        },
        {
          key: 'step5_siswa',
          label: '6. Buku Induk Siswa (A–F)',
          icon: Users,
          stepBadge: '6',
        },
        {
          key: 'step6_nilai',
          label: '7. Nilai Rapor Sem 1–6',
          icon: Award,
          stepBadge: '7',
        },
        {
          key: 'step7_kehadiran',
          label: '8. Presensi Harian',
          icon: CalendarCheck,
          stepBadge: '8',
        },
      ],
    },
    {
      group: 'Cetak & Impor Data',
      items: [
        {
          key: 'cetak_dokumen_gabungan',
          label: 'Cetak PDF Buku Induk',
          icon: Printer,
        },
        {
          key: 'queue_cetak_massal',
          label: 'Antrean Cetak Massal',
          icon: FileText,
        },
        {
          key: 'impor_massal_center',
          label: 'Pusat Impor Excel & Foto',
          icon: FileSpreadsheet,
        },
      ],
    },
    {
      group: 'Pengaturan Sistem',
      items: [
        {
          key: 'pengaturan_profil_sekolah',
          label: 'Profil Sekolah & Tema UI',
          icon: Settings,
        },
        {
          key: 'pengaturan_backup',
          label: 'Cadangan & Restore Data',
          icon: Archive,
        },
        {
          key: 'blueprint_arsitektur',
          label: 'Blueprint Arsitektur',
          icon: Code2,
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
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar aside */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-slate-900 text-slate-300 transition-all duration-200 dark:border-slate-800 lg:static lg:translate-x-0 shrink-0 ${
          isCollapsed ? 'w-[68px]' : 'w-64'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Brand Header */}
        <div className="flex h-14 items-center justify-between gap-2 border-b border-slate-800 px-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 border border-slate-700 overflow-hidden">
              {schoolProfile.logoUrl ? (
                <img
                  src={schoolProfile.logoUrl}
                  alt={schoolProfile.namaSekolah}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-contain p-0.5"
                />
              ) : (
                <span className="font-bold text-amber-400 text-xs">BI</span>
              )}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 leading-tight">
                <h1 className="text-xs font-bold text-white tracking-tight truncate">
                  {schoolProfile.namaSekolah}
                </h1>
                <p className="text-[10px] text-slate-400 font-mono truncate">
                  NPSN {schoolProfile.npsn}
                </p>
              </div>
            )}
          </div>

          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              title={isCollapsed ? 'Perluas Sidebar' : 'Lipat Sidebar (Mode Ringkas)'}
              className="hidden lg:flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-800/60 hover:text-white transition-colors cursor-pointer"
            >
              {isCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {/* Quick Command Palette Trigger in Sidebar */}
        {onOpenCommandPalette && (
          <div className="px-2.5 pt-2.5">
            <button
              type="button"
              onClick={onOpenCommandPalette}
              title="Pencarian Cepat Siswa & Modul (Ctrl+K)"
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center px-0 py-2' : 'justify-between px-2.5 py-1.5'
              } rounded-lg border border-slate-700/80 bg-slate-800/50 text-xs text-slate-300 hover:border-amber-500/60 transition-colors cursor-pointer`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                {!isCollapsed && <span className="truncate text-[11px]">Cari siswa / menu...</span>}
              </div>
              {!isCollapsed && (
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-900/70 text-slate-400 border border-slate-700 shrink-0">
                  Ctrl+K
                </kbd>
              )}
            </button>
          </div>
        )}

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {!isCollapsed && (
                <div className="px-2 text-[10px] font-semibold tracking-wider text-slate-400">
                  {section.group}
                </div>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeNav === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      title={isCollapsed ? item.label : undefined}
                      onClick={() => {
                        onSelectNav(item.key);
                        onCloseMobile();
                      }}
                      className={`group flex w-full items-center ${
                        isCollapsed ? 'justify-center px-0 py-2' : 'justify-between px-2.5 py-1.5'
                      } rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 font-semibold shadow-2xs'
                          : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                      }`}
                    >
                      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5 min-w-0'}`}>
                        <Icon
                          className={`h-4 w-4 shrink-0 transition-colors ${
                            isActive ? 'text-current' : 'text-slate-400 group-hover:text-amber-400'
                          }`}
                        />
                        {!isCollapsed && <span className="truncate">{item.label}</span>}
                      </div>

                      {!isCollapsed && item.stepBadge && (
                        <span
                          className={`ml-1.5 text-[10px] font-mono ${
                            isActive ? 'opacity-90' : 'text-slate-400'
                          }`}
                        >
                          0{item.stepBadge}
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
        <div className="border-t border-slate-800 p-2.5 bg-slate-950/80">
          {currentUser && (
            <div className={`flex items-center ${isCollapsed ? 'flex-col gap-2' : 'justify-between'}`}>
              {!isCollapsed ? (
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span className="text-xs font-semibold text-white truncate block">
                      {currentUser.username}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 truncate block capitalize">
                    {currentUser.role.replace('_', ' ')}
                  </span>
                </div>
              ) : (
                <div
                  title={`${currentUser.namaLengkap} (${currentUser.role})`}
                  className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-amber-400 uppercase"
                >
                  {currentUser.username.slice(0, 2)}
                </div>
              )}
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                title="Keluar dari akun"
              >
                <LogOut className="h-3.5 w-3.5" />
                {!isCollapsed && <span>Keluar</span>}
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
