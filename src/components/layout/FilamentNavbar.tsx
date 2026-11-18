import React, { useState, useRef, useEffect } from 'react';
import { Menu, LogOut, User, Sun, Moon, Palette, Check } from 'lucide-react';
import { AuthUser, UIAccentColor, UIColorMode } from '../../types/buku-induk';

export const CORPORATE_ACCENT_OPTIONS: {
  id: UIAccentColor;
  label: string;
  desc: string;
  hex: string;
}[] = [
  {
    id: 'royal',
    label: 'Royal Blue',
    desc: 'Standar Ant Design Pro',
    hex: '#2563eb',
  },
  {
    id: 'emerald',
    label: 'Emerald Green',
    desc: 'Hijau Akademik Resmi',
    hex: '#059669',
  },
  {
    id: 'teal',
    label: 'Teal Ocean',
    desc: 'Biru Kehijauan Modern',
    hex: '#0d9488',
  },
  {
    id: 'indigo',
    label: 'Indigo Executive',
    desc: 'Indigo Korporat Formal',
    hex: '#4f46e5',
  },
  {
    id: 'slate',
    label: 'Slate Monochrome',
    desc: 'Abu-abu Eksekutif',
    hex: '#334155',
  },
];

interface FilamentNavbarProps {
  pageTitle: string;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  currentUser: AuthUser | null;
  onLogout: () => void;
  colorMode?: UIColorMode;
  onChangeColorMode?: (mode: UIColorMode) => void;
  accentColor?: UIAccentColor;
  onChangeAccentColor?: (accent: UIAccentColor) => void;
}

export const FilamentNavbar: React.FC<FilamentNavbarProps> = ({
  pageTitle,
  sidebarOpen,
  setSidebarOpen,
  currentUser,
  onLogout,
  colorMode = 'light',
  onChangeColorMode,
  accentColor = 'royal',
  onChangeAccentColor,
}) => {
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setThemeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentAccentObj =
    CORPORATE_ACCENT_OPTIONS.find((item) => item.id === accentColor) ||
    CORPORATE_ACCENT_OPTIONS[0];

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 lg:px-6 transition-colors">
      {/* Kiri: Tombol Menu Mobile & Judul Halaman */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex h-8 w-8 items-center justify-center rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden cursor-pointer"
          title="Menu Navigasi"
        >
          <Menu className="h-4 w-4" />
        </button>

        <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
          {pageTitle}
        </h2>
      </div>

      {/* Kanan: Pengaturan Tema/Aksen Cepat, Profil User & Tombol Keluar */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Tombol Toggle Cepat Mode Terang / Gelap */}
        {onChangeColorMode && (
          <button
            type="button"
            onClick={() => onChangeColorMode(colorMode === 'dark' ? 'light' : 'dark')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium transition-colors cursor-pointer"
            title={colorMode === 'dark' ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
          >
            {colorMode === 'dark' ? (
              <>
                <Sun className="h-3.5 w-3.5 text-amber-400" />
                <span className="hidden md:inline">Gelap</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5 text-slate-600" />
                <span className="hidden md:inline">Terang</span>
              </>
            )}
          </button>
        )}

        {/* Dropdown Pemilih Tema & 5 Aksen Warna Korporat */}
        {onChangeAccentColor && (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setThemeMenuOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium transition-colors cursor-pointer"
              title="Pilih Tema & Warna Aksen UI"
            >
              <span
                className="h-3 w-3 rounded-full shrink-0 border border-white/50 shadow-xs"
                style={{ backgroundColor: currentAccentObj.hex }}
              />
              <Palette className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300 sm:hidden" />
              <span className="hidden sm:inline">{currentAccentObj.label}</span>
            </button>

            {themeMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl p-3 z-50 space-y-3">
                {/* Mode Warna */}
                {onChangeColorMode && (
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Mode Tampilan
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => onChangeColorMode('light')}
                        className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-semibold border transition-colors cursor-pointer ${
                          colorMode === 'light'
                            ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-500'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        <Sun className="h-3.5 w-3.5" />
                        <span>Terang</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onChangeColorMode('dark')}
                        className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-semibold border transition-colors cursor-pointer ${
                          colorMode === 'dark'
                            ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-500'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        <Moon className="h-3.5 w-3.5" />
                        <span>Gelap</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 5 Aksen Warna Korporat */}
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    5 Aksen Warna Korporat
                  </div>
                  <div className="space-y-1">
                    {CORPORATE_ACCENT_OPTIONS.map((opt) => {
                      const isSelected = accentColor === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            onChangeAccentColor(opt.id);
                            setThemeMenuOpen(false);
                          }}
                          className={`flex w-full items-center justify-between px-2.5 py-2 rounded text-left text-xs transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-slate-100 dark:bg-slate-800 font-semibold text-slate-900 dark:text-white'
                              : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className="h-4 w-4 rounded-full shrink-0 border border-black/10"
                              style={{ backgroundColor: opt.hex }}
                            />
                            <div className="truncate">
                              <div className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                                {opt.label}
                              </div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                {opt.desc}
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {currentUser && (
          <>
            <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200 pl-1">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full text-white font-semibold shadow-xs"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              >
                <User className="h-3.5 w-3.5" />
              </div>
              <span className="font-semibold hidden sm:inline">
                {currentUser.namaLengkap || currentUser.username}
              </span>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer"
              title="Keluar dari aplikasi"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
};
