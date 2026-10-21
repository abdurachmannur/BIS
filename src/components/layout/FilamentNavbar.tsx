import React, { useState } from 'react';
import { 
  Bell, 
  Search, 
  Download, 
  Menu,
  FileSpreadsheet,
  LogOut,
  Check,
  Palette,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { FilamentNotificationItem, SchoolProfile, AuthUser, UIThemePreset } from '../../types/buku-induk';
import { UI_THEMES } from '../../theme/themes';

interface FilamentNavbarProps {
  notifications: FilamentNotificationItem[];
  onMarkNotificationAsRead: (id: string) => void;
  onClearAllNotifications: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebarCollapse?: () => void;
  onOpenCommandPalette?: () => void;
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
  isSidebarCollapsed = false,
  onToggleSidebarCollapse,
  onOpenCommandPalette,
  schoolProfile,
  currentUser,
  onLogout,
  onOpenImportModal,
  currentTheme = 'linear-notion',
  onSelectTheme,
}) => {
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const activeThemeObj = UI_THEMES.find(t => t.id === currentTheme) || UI_THEMES[0];

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur-sm transition-colors dark:border-slate-800 dark:bg-slate-900/95 lg:px-6">
      {/* Left: Mobile hamburger, Desktop Sidebar Collapse Toggle & School Breadcrumb */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden cursor-pointer"
          title="Buka Navigasi"
        >
          <Menu className="h-4 w-4" />
        </button>

        {onToggleSidebarCollapse && (
          <button
            type="button"
            onClick={onToggleSidebarCollapse}
            className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={isSidebarCollapsed ? 'Perluas Sidebar' : 'Lipat Sidebar'}
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        )}

        <div className="flex items-center gap-2 text-xs sm:text-sm min-w-0">
          <span className="font-semibold text-slate-800 dark:text-slate-100 truncate">
            {schoolProfile.namaSekolah}
          </span>
          <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">·</span>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 hidden sm:inline whitespace-nowrap">
            NPSN {schoolProfile.npsn}
          </span>
        </div>
      </div>

      {/* Center: Linear / Notion Command Palette Quick Search Trigger */}
      {onOpenCommandPalette && (
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center justify-between gap-6 w-72 lg:w-96 h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
          title="Cari nama siswa, NIS, atau modul (Ctrl+K)"
        >
          <span className="flex items-center gap-2 truncate">
            <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate">Cari siswa, NIS, atau lompat modul...</span>
          </span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-500 shrink-0">
            Ctrl+K
          </kbd>
        </button>
      )}

      {/* Right: Impor Excel Quick Button, UI Style Switcher, Notifications, User */}
      <div className="flex items-center gap-2 shrink-0">
        {onOpenCommandPalette && (
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="flex md:hidden h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 cursor-pointer"
            title="Cari Cepat (Ctrl+K)"
          >
            <Search className="h-4 w-4" />
          </button>
        )}

        {/* Quick Import Button */}
        <button
          type="button"
          onClick={onOpenImportModal}
          className="hidden sm:inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
          title="Buka Pusat Impor Excel & ZIP Foto"
        >
          <FileSpreadsheet className="h-3.5 w-3.5" />
          <span>Impor Excel</span>
        </button>

        {/* UI Style Switcher Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowThemeMenu(!showThemeMenu);
              setShowNotificationMenu(false);
            }}
            className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
            title="Ganti Sistem Desain / Gaya UI"
          >
            <Palette className="h-3.5 w-3.5 text-slate-500" />
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: activeThemeObj.accentHex }}
            />
            <span className="hidden xl:inline text-[11px]">{activeThemeObj.name}</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {showThemeMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50">
              <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Pilih Gaya Desain UI ({UI_THEMES.length} Tema)
                </span>
              </div>
              <div className="space-y-0.5">
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
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                        isCurrent
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="h-3 w-3 rounded-full shrink-0"
                          style={{ backgroundColor: theme.accentHex }}
                        />
                        <div className="min-w-0">
                          <div className="truncate">{theme.name}</div>
                          <div className="text-[10px] text-slate-400 truncate font-normal">
                            {theme.tagline}
                          </div>
                        </div>
                      </div>
                      {isCurrent && <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 ml-2" />}
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
            type="button"
            onClick={() => {
              setShowNotificationMenu(!showNotificationMenu);
              setShowThemeMenu(false);
            }}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
            title="Notifikasi Sistem"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Popover Dropdown */}
          {showNotificationMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Notifikasi Aktivitas
                  </h4>
                  {unreadCount > 0 && (
                    <span className="text-[11px] text-slate-500 font-mono">
                      · {unreadCount} baru
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
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
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-slate-900 dark:text-white">
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
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                          >
                            <Download className="h-3 w-3" />
                            <span>Unduh Berkas</span>
                          </a>
                        ) : (
                          <span />
                        )}

                        {!item.isRead && (
                          <button
                            type="button"
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

        {/* User Profile & Logout */}
        {currentUser && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
            <div className="hidden lg:block text-right text-xs">
              <div className="font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                {currentUser.namaLengkap.split(' (')[0]}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                {currentUser.role.replace('_', ' ')}
              </div>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              title="Keluar"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
