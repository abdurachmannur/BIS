import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  LogIn, 
  School, 
  AlertCircle,
  Database,
  KeyRound
} from 'lucide-react';
import { SchoolProfile, AuthUser } from '../../types/buku-induk';

interface FilamentLoginViewProps {
  schoolProfile: SchoolProfile;
  onLoginSuccess: (user: AuthUser, token: string) => void;
}

export const FilamentLoginView: React.FC<FilamentLoginViewProps> = ({
  schoolProfile,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const performLogin = async (targetUsername: string, targetPassword: string) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: targetUsername.trim(),
          password: targetPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.token) {
        setError(data.error || 'Username atau password tidak sesuai.');
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      onLoginSuccess(data.user, data.token);
    } catch (err) {
      console.error('Login error:', err);
      setError('Gagal terhubung ke server backend (/api/login). Pastikan server Express berjalan.');
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(username, password);
  };

  const handleFillDefaultAdmin = () => {
    setUsername('admin');
    setPassword('admin123');
    performLogin('admin', 'admin123');
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-slate-950 p-4 font-sans text-slate-100 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* School Brand Header */}
        <div className="text-center mb-7 space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg text-white mb-1 overflow-hidden">
            {schoolProfile.logoUrl ? (
              <img
                src={schoolProfile.logoUrl}
                alt={schoolProfile.namaSekolah}
                referrerPolicy="no-referrer"
                className="h-full w-full object-contain p-1.5 bg-white"
              />
            ) : (
              <School className="h-7 w-7" />
            )}
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            {schoolProfile.namaSekolah}
          </h1>
          <p className="text-xs text-slate-400">
            Sistem Informasi Buku Induk Siswa Digital · NPSN {schoolProfile.npsn}
          </p>
        </div>

        {/* Login Box */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/95 backdrop-blur-xl p-7 shadow-2xl space-y-5">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">
                Autentikasi Server Buku Induk
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Terhubung ke database persisten SQLite (<code className="font-mono text-indigo-400">bis.sqlite</code>)
              </p>
            </div>
            <Database className="h-4 w-4 text-indigo-400 shrink-0" />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-white placeholder-slate-500 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
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
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-white placeholder-slate-500 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Memverifikasi JWT & SQLite...</span>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>Masuk ke Aplikasi</span>
                </>
              )}
            </button>
          </form>

          {/* Auto-Seed Default Credentials Info */}
          <div className="border-t border-slate-800 pt-4 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <KeyRound className="h-3.5 w-3.5 text-indigo-400" />
                <span>Akun Auto-Seed Default SQLite:</span>
              </span>
              <button
                type="button"
                onClick={handleFillDefaultAdmin}
                className="text-indigo-400 hover:text-indigo-300 font-semibold underline cursor-pointer"
              >
                Masuk Instan (admin)
              </button>
            </div>

            <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs font-mono text-slate-300">
              <span>Username: <strong className="text-white">admin</strong></span>
              <span>·</span>
              <span>Password Awal: <strong className="text-white">admin123</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
