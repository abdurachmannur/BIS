import { UIThemePreset } from '../types/buku-induk';

export interface ThemeOption {
  id: UIThemePreset;
  name: string;
  tagline: string;
  accentHex: string;
  badgeBg: string;
  badgeText: string;
  borderClass: string;
  ringClass: string;
  buttonClass: string;
  sidebarActiveBg: string;
}

export const UI_THEMES: ThemeOption[] = [
  {
    id: 'filament-amber',
    name: 'Filament Amber',
    tagline: 'Gaya Klasik Filament v3 bernuansa hangat dan elegan',
    accentHex: '#f59e0b',
    badgeBg: 'bg-amber-100 dark:bg-amber-950/80',
    badgeText: 'text-amber-800 dark:text-amber-300',
    borderClass: 'border-amber-500',
    ringClass: 'ring-amber-500',
    buttonClass: 'bg-amber-500 hover:bg-amber-400 text-slate-950',
    sidebarActiveBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold',
  },
  {
    id: 'emerald-kedinasan',
    name: 'Emerald Kedinasan',
    tagline: 'Nuansa Resmi Hijau Kedinasan Pendidikan Indonesia',
    accentHex: '#10b981',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/80',
    badgeText: 'text-emerald-800 dark:text-emerald-300',
    borderClass: 'border-emerald-500',
    ringClass: 'ring-emerald-500',
    buttonClass: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    sidebarActiveBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold',
  },
  {
    id: 'sapphire-modern',
    name: 'Sapphire Modern',
    tagline: 'Gaya Modern Biru Safir Bersih & Berorientasi Presisi',
    accentHex: '#3b82f6',
    badgeBg: 'bg-blue-100 dark:bg-blue-950/80',
    badgeText: 'text-blue-800 dark:text-blue-300',
    borderClass: 'border-blue-500',
    ringClass: 'ring-blue-500',
    buttonClass: 'bg-blue-600 hover:bg-blue-500 text-white',
    sidebarActiveBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold',
  },
  {
    id: 'ruby-maroon',
    name: 'Ruby Maroon',
    tagline: 'Wibawa Akademik Merah Marun Terhormat & Megah',
    accentHex: '#e11d48',
    badgeBg: 'bg-rose-100 dark:bg-rose-950/80',
    badgeText: 'text-rose-800 dark:text-rose-300',
    borderClass: 'border-rose-500',
    ringClass: 'ring-rose-500',
    buttonClass: 'bg-rose-600 hover:bg-rose-500 text-white',
    sidebarActiveBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold',
  },
  {
    id: 'obsidian-dark',
    name: 'Obsidian Dark',
    tagline: 'Kontras Maksimal Hitam Obsidian Elegan & Fokus',
    accentHex: '#eab308',
    badgeBg: 'bg-slate-800 text-yellow-400 border border-yellow-500/40',
    badgeText: 'text-yellow-400',
    borderClass: 'border-yellow-500',
    ringClass: 'ring-yellow-500',
    buttonClass: 'bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black',
    sidebarActiveBg: 'bg-yellow-500/10 text-yellow-500 font-bold',
  },
];
