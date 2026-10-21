import React, { useState } from 'react';
import { 
  Bell, 
  Search, 
  CheckCircle, 
  Download, 
  Menu,
  School,
  FileSpreadsheet,
  LogOut,
  ShieldCheck,
  Check,
  Palette,
  ChevronDown
} from 'lucide-react';
import { FilamentNotificationItem, SchoolProfile, AuthUser, UIThemePreset } from '../../types/buku-induk';
import { UI_THEMES } from '../../theme/themes';

interface FilamentNavbarProps {
  notifications: FilamentNotificationItem[];
  onMarkNotificationAsRead: (id: string) => void;
  onClearAllNotifications: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  schoolProfile: SchoolProfile;
  currentUser: AuthUser | null;
  onLogout: () => void;
  onOpenImportModal: () => void;
  currentTheme?: UIThemePreset;
  onSelectTheme?: (theme: UIThemePreset) => void;
}

export const FilamentNavbar: React.FC<FilamentNavbarProps> = ({
  notifications,
  onMarkNotificationAsRead,
  onClearAllNotifications,
  sidebarOpen,
  setSidebarOpen,
  schoolProfile,
  currentUser,
  onLogout,
  onOpenImportModal,
  currentTheme = 'filament-amber',
  onSelectTheme,
}) => {
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const activeThemeObj = UI_THEMES.find(t => t.id === currentTheme) || UI_THEMES[0];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur transition-colors dark:border-slate-800 dark:bg-slate-900/95 lg:px-6">
      {/* Left: Mobile hamburger & Dynamic School Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden cursor-pointer"
          title="Toggle Navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 text-sm">
          <div 
            className="flex h-7 w-7 items-center justify-center rounded text-white font-black text-xs shadow-sm uppercase"
            style={{ backgroundColor: activeThemeObj.accentHex }}
          >
            BI
          </div>
          <span className="font-bold text-slate-800 dark:text-slate-100 hidden sm:inline uppercase">
            {schoolProfile.namaSekolah}
          </span>
          <span className="text-slate-400 dark:text-slate-600 hidden sm:inline">/</span>
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
            NPSN: {schoolProfile.npsn}
          </span>
        </div>
      </div>

      {/* Right: Impor Excel Quick Button, Theme Switcher, Notifications, User & Logout */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Quick Import Button */}
        <button
          onClick={onOpenImportModal}
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm transition-colors cursor-pointer"
          title="Buka Pusat Impor Excel & ZIP Foto"
        >
          <FileSpreadsheet className="h-3.5 w-3.5" />
          <span>⚡ Impor Excel / ZIP Foto</span>
        </button>

        {/* 5 UI Themes Quick Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowThemeMenu(!showThemeMenu);
              setShowNotificationMenu(false);
            }}
            className="flex items-center gap-1.5 h-9 px-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
            title="Ganti Template Tampilan UI"
          >
            <span
              className="h-3 w-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: activeThemeObj.accentHex }}
            />
            <span className="hidden xl:inline text-[11px]">{activeThemeObj.name}</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {showThemeMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in duration-150">
              <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Pilih Template UI (5 Tema)
                </span>
              </div>
              <div className="space-y-1">
                {UI_THEMES.map((theme) => {
                  const isCurrent = currentTheme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => {
                        if (onSelectTheme) onSelectTheme(theme.id);
                        setShowThemeMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full shadow-2xs"
                          style={{ backgroundColor: theme.accentHex }}
                        />
                        <span>{theme.name}</span>
                      </div>
                      {isCurrent && <Check className="h-3.5 w-3.5 text-emerald-600 stroke-[2.5]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotificationMenu(!showNotificationMenu);
              setShowThemeMenu(false);
            }}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
            title="Database Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-600 px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Popover Dropdown */}
          {showNotificationMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Notifikasi Filament
                  </h4>
                  {unreadCount > 0 && (
                    <span className="text-[11px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-1.5 py-0.2 rounded font-medium">
                      {unreadCount} baru
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={onClearAllNotifications}
                    className="text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400 font-medium"
                  >
                    Tandai Semua Dibaca
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    Tidak ada notifikasi aktif
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      className={`p-2.5 rounded-lg border transition-all text-xs ${
                        item.isRead
                          ? 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-60'
                          : 'border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {item.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                          {item.createdAt}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 mt-1 leading-snug">
                        {item.body}
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                        {item.downloadUrl ? (
                          <a
                            href={item.downloadUrl}
                            download={item.downloadFilename || 'Buku_Induk_Export.pdf'}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors shadow-sm"
                          >
                            <Download className="h-3 w-3" />
                            <span>Unduh Berkas</span>
                          </a>
                        ) : (
                          <span />
                        )}

                        {!item.isRead && (
                          <button
                            onClick={() => onMarkNotificationAsRead(item.id)}
                            className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
                          >
                            <Check className="h-3 w-3" />
                            <span>Tandai dibaca</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Badge & Logout */}
        {currentUser ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
            <div className="h-8 w-8 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center font-bold text-xs ring-2 ring-amber-500/30 uppercase">
              {currentUser.username.slice(0, 2)}
            </div>
            <div className="hidden lg:block text-left text-xs">
              <div className="font-bold text-slate-800 dark:text-slate-200 leading-tight">
                {currentUser.namaLengkap.split(' (')[0]}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold capitalize">
                {currentUser.role.replace('_', ' ')} · @{currentUser.username}
              </div>
            </div>
            <button
              onClick={onLogout}
              className="ml-1 flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              title="Logout / Keluar"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Tamu</span>
          </div>
        )}
      </div>
    </header>
  );
};
