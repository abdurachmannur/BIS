import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  User,
  GraduationCap,
  FileText,
  Printer,
  FileSpreadsheet,
  Database,
  Building2,
  CalendarCheck,
  LayoutDashboard,
  Palette,
  PanelLeftClose,
  ArrowRight,
  CornerDownLeft,
  X,
  Archive,
  Code2,
  UserCheck,
  Layers,
  School
} from 'lucide-react';
import { StudentFullRecord, UIThemePreset } from '../../types/buku-induk';
import { ActiveNavKey } from '../layout/FilamentSidebar';
import { UI_THEMES } from '../../theme/themes';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: StudentFullRecord[];
  onSelectStudentForPreview: (student: StudentFullRecord) => void;
  onNavigateNav: (nav: ActiveNavKey) => void;
  onOpenImportModal: () => void;
  onExportStudentsExcel: () => void;
  onToggleSidebarCollapse: () => void;
  isSidebarCollapsed: boolean;
  currentTheme: UIThemePreset;
  onSelectTheme: (themeId: UIThemePreset) => void;
}

interface CommandItem {
  id: string;
  group: 'Siswa' | 'Navigasi Modul' | 'Aksi Cepat' | 'Gaya Tampilan UI';
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  action: () => void;
  secondaryActions?: {
    label: string;
    onClick: () => void;
  }[];
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  students,
  onSelectStudentForPreview,
  onNavigateNav,
  onOpenImportModal,
  onExportStudentsExcel,
  onToggleSidebarCollapse,
  isSidebarCollapsed,
  currentTheme,
  onSelectTheme
}) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 30);
    }
  }, [isOpen]);

  const commandItems = useMemo<CommandItem[]>(() => {
    const q = query.trim().toLowerCase();

    // 1. Student items
    const matchedStudents = students
      .filter((s) => {
        if (!q) return true;
        return (
          s.personal.namaLengkap.toLowerCase().includes(q) ||
          s.personal.nis.toLowerCase().includes(q) ||
          s.personal.nisn.toLowerCase().includes(q) ||
          (s.previousEducation.diterimaDiKelas || '').toLowerCase().includes(q) ||
          (s.previousEducation.jurusanPeminatan || '').toLowerCase().includes(q)
        );
      })
      .slice(0, q ? 12 : 5)
      .map((s): CommandItem => ({
        id: `student-${s.id}`,
        group: 'Siswa',
        title: s.personal.namaLengkap,
        subtitle: `NIS: ${s.personal.nis} · NISN: ${s.personal.nisn} · ${s.previousEducation.diterimaDiKelas || 'Belum Ada Kelas'} (${s.previousEducation.jurusanPeminatan})`,
        icon: <User className="w-4 h-4 text-indigo-600" />,
        action: () => {
          onSelectStudentForPreview(s);
          onClose();
        },
        secondaryActions: [
          {
            label: 'Data Siswa',
            onClick: () => {
              onNavigateNav('step5_siswa');
              onClose();
            }
          },
          {
            label: 'Nilai Rapor',
            onClick: () => {
              onNavigateNav('step6_nilai');
              onClose();
            }
          },
          {
            label: 'Cetak PDF',
            onClick: () => {
              onSelectStudentForPreview(s);
              onClose();
            }
          }
        ]
      }));

    // 2. Module navigation items
    const rawModules: CommandItem[] = [
      {
        id: 'nav-dashboard',
        group: 'Navigasi Modul',
        title: 'Dashboard & Demografi Sekolah',
        subtitle: 'Ringkasan populasi siswa L/P, rombel, dan statistik kehadiran',
        icon: <LayoutDashboard className="w-4 h-4 text-zinc-500" />,
        action: () => {
          onNavigateNav('dashboard');
          onClose();
        }
      },
      {
        id: 'nav-siswa',
        group: 'Navigasi Modul',
        title: 'Data Buku Induk Siswa (Bagian A–F)',
        subtitle: 'Kelola biodata lengkap, upload pas foto 3x4, bulk ubah kelas, dan hapus siswa',
        icon: <FileText className="w-4 h-4 text-zinc-500" />,
        action: () => {
          onNavigateNav('step5_siswa');
          onClose();
        }
      },
      {
        id: 'nav-nilai',
        group: 'Navigasi Modul',
        title: 'Input Nilai Akademik & Rapor (Semester 1–6)',
        subtitle: 'Kelola nilai pengetahuan/keterampilan, predikat, ketuntasan, ekskul & Master Mapel',
        icon: <GraduationCap className="w-4 h-4 text-zinc-500" />,
        action: () => {
          onNavigateNav('step6_nilai');
          onClose();
        }
      },
      {
        id: 'nav-kehadiran',
        group: 'Navigasi Modul',
        title: 'Input Kehadiran Harian Siswa',
        subtitle: 'Rekapitulasi presensi harian per kelas dan isi cepat hadir',
        icon: <CalendarCheck className="w-4 h-4 text-zinc-500" />,
        action: () => {
          onNavigateNav('step7_kehadiran');
          onClose();
        }
      },
      {
        id: 'nav-tahun-ajaran',
        group: 'Navigasi Modul',
        title: 'Master Data: 1. Tahun Ajaran & Kurikulum',
        subtitle: 'Kelola tahun ajaran aktif, semester, dan kurikulum',
        icon: <Database className="w-4 h-4 text-zinc-500" />,
        action: () => {
          onNavigateNav('step1_tahun_ajaran');
          onClose();
        }
      },
      {
        id: 'nav-guru',
        group: 'Navigasi Modul',
        title: 'Master Data: 2. Data Guru & Wali Kelas',
        subtitle: 'Kelola daftar NIP dan penugasan wali kelas',
        icon: <UserCheck className="w-4 h-4 text-zinc-500" />,
        action: () => {
          onNavigateNav('step2_guru');
          onClose();
        }
      },
      {
        id: 'nav-jurusan',
        group: 'Navigasi Modul',
        title: 'Master Data: 3. Data Jurusan / Peminatan',
        subtitle: 'Kelola jurusan MIPA, IPS, Bahasa, dan kuota rombel',
        icon: <Layers className="w-4 h-4 text-zinc-500" />,
        action: () => {
          onNavigateNav('step2_jurusan');
          onClose();
        }
      },
      {
        id: 'nav-kelas',
        group: 'Navigasi Modul',
        title: 'Master Data: 5. Data Rombel Kelas',
        subtitle: 'Kelola kelas dengan ID unik per tahun ajaran',
        icon: <School className="w-4 h-4 text-zinc-500" />,
        action: () => {
          onNavigateNav('step4_kelas');
          onClose();
        }
      },
      {
        id: 'nav-cetak',
        group: 'Navigasi Modul',
        title: 'Cetak 1 Berkas PDF Gabungan Buku Induk',
        subtitle: 'Pratinjau & cetak A4 dengan 3 opsi tata letak nilai dan header otomatis tiap halaman',
        icon: <Printer className="w-4 h-4 text-zinc-500" />,
        action: () => {
          onNavigateNav('cetak_dokumen_gabungan');
          onClose();
        }
      },
      {
        id: 'nav-profil',
        group: 'Navigasi Modul',
        title: 'Profil, Identitas Sekolah & Kustomisasi Tema UI',
        subtitle: 'Pengaturan kop surat, NPSN, logo sekolah, dan tanda tangan Kepala Sekolah',
        icon: <Building2 className="w-4 h-4 text-zinc-500" />,
        action: () => {
          onNavigateNav('pengaturan_profil_sekolah');
          onClose();
        }
      },
      {
        id: 'nav-backup',
        group: 'Navigasi Modul',
        title: 'Database & Pencadangan Data (JSON / Restore)',
        subtitle: 'Ekspor cadangan penuh seluruh database lokal atau pulihkan data',
        icon: <Archive className="w-4 h-4 text-zinc-500" />,
        action: () => {
          onNavigateNav('pengaturan_backup');
          onClose();
        }
      },
      {
        id: 'nav-blueprint',
        group: 'Navigasi Modul',
        title: 'Blueprint Arsitektur & Kode Sumber',
        subtitle: 'Dokumentasi skema tabel dan referensi kode',
        icon: <Code2 className="w-4 h-4 text-zinc-500" />,
        action: () => {
          onNavigateNav('blueprint_arsitektur');
          onClose();
        }
      }
    ];
    const modules = rawModules.filter((m) => !q || m.title.toLowerCase().includes(q) || m.subtitle.toLowerCase().includes(q));

    // 3. Quick Actions
    const rawActions: CommandItem[] = [
      {
        id: 'act-import-excel',
        group: 'Aksi Cepat',
        title: 'Buka Pusat Impor Excel (Siswa 49 Kolom & Nilai Rapor)',
        subtitle: 'Unduh template dan impor data siswa lengkap A–F atau nilai rapor tanpa kode',
        icon: <FileSpreadsheet className="w-4 h-4 text-emerald-600" />,
        action: () => {
          onClose();
          onOpenImportModal();
        }
      },
      {
        id: 'act-export-excel',
        group: 'Aksi Cepat',
        title: 'Ekspor Seluruh Siswa ke Excel (.xlsx Lengkap A–F)',
        subtitle: 'Unduh database buku induk siswa lengkap 49 kolom ke file Excel',
        icon: <FileSpreadsheet className="w-4 h-4 text-indigo-600" />,
        action: () => {
          onClose();
          onExportStudentsExcel();
        }
      },
      {
        id: 'act-toggle-sidebar',
        group: 'Aksi Cepat',
        title: isSidebarCollapsed ? 'Perluas Sidebar Navigasi' : 'Lipat Sidebar Navigasi (Mode Ikon Ringkas)',
        subtitle: 'Maksimalkan ruang lebar layar untuk tabel data siswa dan nilai rapor',
        icon: <PanelLeftClose className="w-4 h-4 text-zinc-500" />,
        action: () => {
          onToggleSidebarCollapse();
          onClose();
        }
      }
    ];
    const actions = rawActions.filter((a) => !q || a.title.toLowerCase().includes(q) || a.subtitle.toLowerCase().includes(q));

    // 4. UI Themes from UI_THEMES
    const themes: CommandItem[] = UI_THEMES.map((t): CommandItem => ({
      id: `theme-${t.id}`,
      group: 'Gaya Tampilan UI',
      title: `Gaya UI: ${t.name}`,
      subtitle: t.tagline,
      icon: (
        <span
          className="w-3.5 h-3.5 rounded-full inline-block"
          style={{ backgroundColor: t.accentHex }}
        />
      ),
      action: () => {
        onSelectTheme(t.id);
        onClose();
      }
    })).filter((t) => !q || t.title.toLowerCase().includes(q) || t.subtitle.toLowerCase().includes(q));

    return [...matchedStudents, ...modules, ...actions, ...themes];
  }, [
    query,
    students,
    isSidebarCollapsed,
    onSelectStudentForPreview,
    onNavigateNav,
    onOpenImportModal,
    onExportStudentsExcel,
    onToggleSidebarCollapse,
    onSelectTheme,
    onClose
  ]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (commandItems.length > 0 ? (prev + 1) % commandItems.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) =>
          commandItems.length > 0 ? (prev - 1 + commandItems.length) % commandItems.length : 0
        );
      } else if (e.key === 'Enter' && commandItems[activeIndex]) {
        e.preventDefault();
        commandItems[activeIndex].action();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, commandItems, activeIndex, onClose]);

  if (!isOpen) return null;

  const groups: CommandItem['group'][] = ['Siswa', 'Navigasi Modul', 'Aksi Cepat', 'Gaya Tampilan UI'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[9vh] bg-zinc-950/50 backdrop-blur-xs p-4 no-print"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Search Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-200 dark:border-zinc-800">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ketik nama siswa, NIS, NISN, kelas, modul, atau ganti gaya UI..."
            className="w-full bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-zinc-400 hover:text-zinc-600 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="px-2 py-0.5 text-[11px] font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 shrink-0">
            ESC
          </kbd>
        </div>

        {/* Command List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-zinc-100 dark:divide-zinc-800/60">
          {commandItems.length === 0 ? (
            <div className="py-12 text-center text-sm text-zinc-500">
              Tidak ditemukan siswa atau perintah untuk kata kunci <span className="font-semibold text-zinc-800">"{query}"</span>
            </div>
          ) : (
            groups.map((groupName) => {
              const groupItems = commandItems.filter((item) => item.group === groupName);
              if (groupItems.length === 0) return null;

              return (
                <div key={groupName} className="py-1.5 first:pt-0 last:pb-0">
                  <div className="px-3 py-1 text-[11px] font-semibold text-zinc-400 tracking-wide">
                    {groupName}
                  </div>
                  <div className="space-y-0.5">
                    {groupItems.map((item) => {
                      const flatIdx = commandItems.findIndex((c) => c.id === item.id);
                      const isSelected = flatIdx === activeIndex;

                      return (
                        <div
                          key={item.id}
                          onMouseEnter={() => setActiveIndex(flatIdx)}
                          onClick={item.action}
                          className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                              : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-1.5 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-700 shrink-0 flex items-center justify-center">
                              {item.icon}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-semibold truncate flex items-center gap-2">
                                <span>{item.title}</span>
                                {item.id === `theme-${currentTheme}` && (
                                  <span className="text-[10px] font-normal text-indigo-600 dark:text-indigo-400">
                                    · Aktif
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate font-mono">
                                {item.subtitle}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {item.secondaryActions ? (
                              <div className="hidden sm:flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                {item.secondaryActions.map((sec) => (
                                  <button
                                    key={sec.label}
                                    type="button"
                                    onClick={sec.onClick}
                                    className="px-2 py-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-indigo-600 hover:text-white border border-zinc-200 dark:border-zinc-700 rounded transition-colors whitespace-nowrap"
                                  >
                                    {sec.label}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <ArrowRight className={`w-3.5 h-3.5 transition-opacity ${isSelected ? 'opacity-100 text-zinc-600' : 'opacity-0'}`} />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Hints */}
        <div className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 font-mono bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded">↑</kbd>
              <kbd className="px-1.5 py-0.5 font-mono bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded">↓</kbd>
              <span>Navigasi</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 font-mono bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded flex items-center">
                <CornerDownLeft className="w-3 h-3" />
              </kbd>
              <span>Pilih</span>
            </span>
          </div>
          <div>
            Pintasan Global <span className="font-mono font-medium text-zinc-700 dark:text-zinc-300">Ctrl+K</span> / <span className="font-mono font-medium text-zinc-700 dark:text-zinc-300">⌘K</span>
          </div>
        </div>
      </div>
    </div>
  );
};
