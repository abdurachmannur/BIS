import React, { useState } from 'react';

interface StudentAvatarProps {
  fotoUrl?: string;
  namaLengkap: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'pas-foto';
  className?: string;
}

/**
 * Standard Monochrome Character Profile Avatar Silhouette
 * Minimalist, elegant user avatar character for students without a photo.
 */
const DefaultCharacterSilhouette: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`select-none ${className}`}
    aria-hidden="true"
  >
    <rect width="48" height="48" rx="8" fill="#F1F5F9" className="dark:fill-slate-800" />
    {/* Head */}
    <circle cx="24" cy="18" r="7.5" fill="#94A3B8" className="dark:fill-slate-500" />
    {/* Shoulders / Torso Silhouette */}
    <path
      d="M11 41C11 33.8203 16.8203 28 24 28C31.1797 28 37 33.8203 37 41V43H11V41Z"
      fill="#94A3B8"
      className="dark:fill-slate-500"
    />
  </svg>
);

export const StudentAvatar: React.FC<StudentAvatarProps> = ({
  fotoUrl,
  namaLengkap,
  size = 'md',
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  // If size is 'pas-foto' for official Kemendikbud print paper (3 x 4 cm standard)
  if (size === 'pas-foto') {
    return (
      <div
        className={`relative w-24 h-32 rounded border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center overflow-hidden text-center shadow-xs ${className}`}
      >
        {fotoUrl && !imageError ? (
          <img
            src={fotoUrl}
            alt={namaLengkap}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-2 text-slate-400 dark:text-slate-500 w-full h-full bg-slate-50 dark:bg-slate-900/60">
            <div className="w-14 h-14 rounded-full overflow-hidden mb-1 flex items-center justify-center bg-slate-200/80 dark:bg-slate-800 border border-slate-300/60 dark:border-slate-700">
              <DefaultCharacterSilhouette className="w-full h-full" />
            </div>
            <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
              Pas Foto Siswa
            </span>
            <span className="text-[8px] text-slate-400">3 x 4 cm</span>
          </div>
        )}
      </div>
    );
  }

  const sizeClasses = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-16 w-16 text-base',
  }[size];

  return (
    <div
      className={`relative inline-flex flex-shrink-0 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 overflow-hidden shadow-2xs ${sizeClasses} ${className}`}
      title={namaLengkap}
    >
      {fotoUrl && !imageError ? (
        <img
          src={fotoUrl}
          alt={namaLengkap}
          onError={() => setImageError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <DefaultCharacterSilhouette />
      )}
    </div>
  );
};
