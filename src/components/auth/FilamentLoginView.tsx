import React, { useState, useEffect } from 'react';
import { Lock, User, LogIn, School, AlertCircle } from 'lucide-react';
import { SchoolProfile, AuthUser } from '../../types/buku-induk';

interface FilamentLoginViewProps {
  schoolProfile: SchoolProfile;
  onLoginSuccess: (user: AuthUser, token: string) => void;
}

export const FilamentLoginView: React.FC<FilamentLoginViewProps> = ({
  schoolProfile: initialSchoolProfile,
  onLoginSuccess,
}) => {
  const [publicProfile, setPublicProfile] = useState<SchoolProfile>(initialSchoolProfile);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Ambil Logo dan Nama Sekolah secara dinamis dari database pengaturan publik
  useEffect(() => {
    let isMounted = true;
    fetch('/api/public/school-profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data && data.namaSekolah) {
          setPublicProfile(data);
        }
      })
      .catch(() => {
        // Gunakan profil lokal jika endpoint belum merespons
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.token) {
        setError(data.error || 'Username atau password tidak valid.');
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      onLoginSuccess(data.user, data.token);
    } catch (_err) {
      setError('Gagal menghubungi layanan autentikasi server.');
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col justify-center items-center bg-[#f0f2f5] p-4 font-sans text-slate-800 relative overflow-hidden"
      style={{
        backgroundImage:
          'radial-gradient(#cbd5e1 1px, transparent 1px), radial-gradient(#cbd5e1 1px, #f0f2f5 1px)',
        backgroundSize: '32px 32px',
        backgroundPosition: '0 0, 16px 16px',
      }}
    >
      <div className="w-full max-w-md relative z-10">
        {/* Card Login Formal Ant Design Pro */}
        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-md">
          {/* Header Identitas Sekolah */}
          <div className="text-center mb-7">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-blue-600 mb-3 overflow-hidden shadow-2xs">
              {publicProfile.logoUrl ? (
                <img
                  src={publicProfile.logoUrl}
                  alt={publicProfile.namaSekolah}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-contain p-1.5"
                />
              ) : (
                <School className="h-8 w-8 text-blue-600" />
              )}
            </div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 uppercase">
              {publicProfile.namaSekolah}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Sistem Informasi Buku Induk Siswa
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded border border-rose-200 bg-rose-50 text-rose-600 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  autoComplete="username"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-2xs cursor-pointer disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <span>Memproses...</span>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>Masuk</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
