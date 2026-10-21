import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  LogIn, 
  ShieldCheck, 
  School, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { SchoolProfile, AuthUser } from '../../types/buku-induk';
import { DEFAULT_AUTH_USERS } from '../../data/mock-data';

interface FilamentLoginViewProps {
  schoolProfile: SchoolProfile;
  onLoginSuccess: (user: AuthUser) => void;
}

export const FilamentLoginView: React.FC<FilamentLoginViewProps> = ({
  schoolProfile,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const cleanUsername = username.trim().toLowerCase();
      const matched = DEFAULT_AUTH_USERS.find(
        (u) => u.username.toLowerCase() === cleanUsername
      );

      if (matched) {
        onLoginSuccess(matched);
      } else {
        setError('Username atau password tidak ditemukan. Silakan hubungi Administrator.');
      }
    }, 600);
  };

  const handleQuickLogin = (userItem: AuthUser) => {
    setUsername(userItem.username);
    setPassword('password');
    onLoginSuccess(userItem);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-slate-950 p-4 font-sans text-slate-100 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Filament Brand Header */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-xl shadow-amber-500/20 text-slate-950 mb-2">
            <School className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase">
            {schoolProfile.namaSekolah}
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Sistem Informasi Buku Induk Siswa Digital · Panel Masuk Filament v3
          </p>
          <div className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            NPSN: {schoolProfile.npsn} · Terakreditasi {schoolProfile.akreditasi}
          </div>
        </div>

        {/* Login Box */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl p-8 shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white">
              Masuk ke Akun Anda
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Kredensial ditentukan oleh Administrator sekolah (Tanpa Email)
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Username Akun
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Masukkan username (contoh: admin)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-white placeholder-slate-500 text-xs focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-white placeholder-slate-500 text-xs focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md shadow-amber-500/20 active:scale-98 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Memverifikasi Kredensial...</span>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>Masuk ke Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Role Picker (Convenience for testing) */}
          <div className="border-t border-slate-800 pt-5 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1 font-semibold">
                <Sparkles className="h-3 w-3 text-amber-400" />
                <span>Pilih Cepat Akun Demo (Produksi):</span>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin(DEFAULT_AUTH_USERS[0])}
                className="p-2 rounded-lg border border-slate-800 hover:border-amber-500/50 bg-slate-950/60 hover:bg-slate-800/80 text-left transition-all group"
              >
                <div className="text-[11px] font-bold text-amber-400 group-hover:text-amber-300">
                  Admin TU
                </div>
                <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                  user: admin
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin(DEFAULT_AUTH_USERS[1])}
                className="p-2 rounded-lg border border-slate-800 hover:border-blue-500/50 bg-slate-950/60 hover:bg-slate-800/80 text-left transition-all group"
              >
                <div className="text-[11px] font-bold text-blue-400 group-hover:text-blue-300">
                  Wali Kelas
                </div>
                <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                  user: walikelas
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin(DEFAULT_AUTH_USERS[2])}
                className="p-2 rounded-lg border border-slate-800 hover:border-emerald-500/50 bg-slate-950/60 hover:bg-slate-800/80 text-left transition-all group"
              >
                <div className="text-[11px] font-bold text-emerald-400 group-hover:text-emerald-300">
                  Guru Mapel
                </div>
                <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                  user: guru
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-[11px] text-slate-400">
          TALL Stack · Laravel 11 · Filament v3 · Standar Buku Induk Kemendikbudristek RI
        </div>
      </div>
    </div>
  );
};
