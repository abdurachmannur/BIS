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
  UserCheck,
  Database
} from 'lucide-react';
import { SchoolProfile } from '../../types/buku-induk';

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
  | 'impor_massal_center'
  | 'backup_restore_db'
  | 'pengaturan_profil_sekolah';

interface FilamentSidebarProps {
  activeNav: ActiveNavKey;
  onSelectNav: (key: ActiveNavKey) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
  schoolProfile: SchoolProfile;
}

interface NavItem {
  key: ActiveNavKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
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
}) => {
  const navSections: NavSection[] = [
    {
      group: 'Menu Utama',
      items: [
        {
          key: 'dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
        },
        {
          key: 'step5_siswa',
          label: 'Data Siswa',
          icon: Users,
        },
        {
          key: 'step6_nilai',
          label: 'Nilai Rapor',
          icon: Award,
        },
        {
          key: 'step7_kehadiran',
          label: 'Absensi Siswa',
          icon: CalendarCheck,
        },
        {
          key: 'cetak_dokumen_gabungan',
          label: 'Cetak Rapor PDF',
          icon: Printer,
        },
        {
          key: 'impor_massal_center',
          label: 'Impor & Ekspor Excel',
          icon: FileSpreadsheet,
        },
      ],
    },
    {
      group: 'Master Data',
      items: [
        {
          key: 'step1_tahun_ajaran',
          label: 'Tahun Ajaran',
          icon: Calendar,
        },
        {
          key: 'step2_guru',
          label: 'Data Guru',
          icon: UserCheck,
        },
        {
          key: 'step2_jurusan',
          label: 'Data Jurusan',
          icon: Layers,
        },
        {
          key: 'step3_tingkat',
          label: 'Tingkat Kelas',
          icon: GraduationCap,
        },
        {
          key: 'step4_kelas',
          label: 'Data Kelas',
          icon: School,
        },
      ],
    },
    {
      group: 'Sistem',
      items: [
        {
          key: 'backup_restore_db',
          label: 'Backup & Restore DB',
          icon: Database,
        },
        {
          key: 'pengaturan_profil_sekolah',
          label: 'Pengaturan',
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <>
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/60 lg:hidden"
        />
      )}

      {/* Ant Design Pro Dark Navy Sidebar (w-64, bg-[#001529]) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 shrink-0 flex-col bg-[#001529] text-slate-200 transition-transform duration-200 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-14 items-center gap-3 border-b border-white/10 px-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-white/10 overflow-hidden">
            {schoolProfile.logoUrl ? (
              <img
                src={schoolProfile.logoUrl}
                alt={schoolProfile.namaSekolah}
                referrerPolicy="no-referrer"
                className="h-full w-full object-contain p-0.5 bg-white"
              />
            ) : (
              <School className="h-4 w-4 text-cyan-400" />
            )}
          </div>
          <div className="min-w-0 leading-tight">
            <div className="text-xs font-bold text-white truncate uppercase">
              {schoolProfile.namaSekolah}
            </div>
            <div className="text-[11px] text-slate-300 truncate">
              Buku Induk Siswa
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4">
          {navSections.map((section, idx) => (
            <div key={idx}>
              <div className="px-4 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {section.group}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeNav === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        onSelectNav(item.key);
                        onCloseMobile();
                      }}
                      style={
                        isActive
                          ? { backgroundColor: 'var(--accent-primary)' }
                          : undefined
                      }
                      className={`group flex w-full items-center gap-3 px-4 py-2.5 text-xs transition-colors cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'text-white font-semibold border-l-4 border-cyan-400 shadow-sm'
                          : 'text-slate-200 hover:bg-white/10 hover:text-white border-l-4 border-transparent'
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 ${
                          isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Version Badge Footer */}
        <div className="border-t border-white/10 px-4 py-3 flex items-center justify-between text-[11px] text-slate-300">
          <span>BIS Enterprise</span>
          <span className="px-2 py-0.5 rounded bg-white/10 text-cyan-300 font-mono text-[10px]">
            v1.0.0-beta.1
          </span>
        </div>
      </aside>
    </>
  );
};
