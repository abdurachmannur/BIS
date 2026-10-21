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
    id: 'linear-notion',
    name: 'Linear & Notion Workspace',
    tagline: 'Kanvas produktivitas ultra-ringkas dengan aksen Indigo presisi (Default)',
    accentHex: '#4f46e5',
    badgeBg: 'bg-indigo-50 dark:bg-indigo-950/80',
    badgeText: 'text-indigo-700 dark:text-indigo-300',
    borderClass: 'border-indigo-500',
    ringClass: 'ring-indigo-500',
    buttonClass: 'bg-indigo-600 hover:bg-indigo-500 text-white',
    sidebarActiveBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold',
  },
  {
    id: 'shadcn-slate',
    name: 'Shadcn Minimalist Slate',
    tagline: 'Desain monokrom Zinc/Slate bersih bergaya Vercel & Shadcn UI',
    accentHex: '#18181b',
    badgeBg: 'bg-zinc-100 dark:bg-zinc-800',
    badgeText: 'text-zinc-900 dark:text-zinc-200',
    borderClass: 'border-zinc-800',
    ringClass: 'ring-zinc-800',
    buttonClass: 'bg-zinc-900 hover:bg-zinc-800 text-white',
    sidebarActiveBg: 'bg-zinc-900/10 text-zinc-900 dark:text-zinc-100 font-semibold',
  },
  {
    id: 'sapphire-modern',
    name: 'Academic Institutional Navy',
    tagline: 'Nuansa Biru Resmi Pendidikan / Kemendikbud E-Rapor Modern',
    accentHex: '#2563eb',
    badgeBg: 'bg-blue-100 dark:bg-blue-950/80',
    badgeText: 'text-blue-800 dark:text-blue-300',
    borderClass: 'border-blue-500',
    ringClass: 'ring-blue-500',
    buttonClass: 'bg-blue-600 hover:bg-blue-500 text-white',
    sidebarActiveBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold',
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
    id: 'filament-amber',
    name: 'Filament Amber Classic',
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
    name: 'Obsidian Dark Pro',
    tagline: 'Kontras Maksimal Hitam Obsidian Elegan & Fokus',
    accentHex: '#6366f1',
    badgeBg: 'bg-zinc-800 text-indigo-400 border border-indigo-500/40',
    badgeText: 'text-indigo-400',
    borderClass: 'border-indigo-500',
    ringClass: 'ring-indigo-500',
    buttonClass: 'bg-indigo-600 hover:bg-indigo-500 text-white font-semibold',
    sidebarActiveBg: 'bg-indigo-500/10 text-indigo-400 font-bold',
  },
];
