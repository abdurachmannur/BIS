import React, { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { StudentFullRecord, SchoolClassRecord } from '../../types/buku-induk';

interface DemographicMatrixTableProps {
  students: StudentFullRecord[];
  classes: SchoolClassRecord[];
}

export const DemographicMatrixTable: React.FC<DemographicMatrixTableProps> = ({
  students,
}) => {
  const [groupBy, setGroupBy] = useState<'tingkat' | 'jurusan' | 'kelas' | 'tahun'>('tingkat');

  const getBreakdownData = () => {
    const map = new Map<string, { label: string; lCount: number; pCount: number; total: number; detail: string }>();

    students.forEach((student) => {
      let key = '';
      let label = '';
      let detail = '';

      if (groupBy === 'tingkat') {
        const clsName = student.previousEducation.diterimaDiKelas || '';
        const level = clsName.startsWith('X-') ? 'Tingkat X' : clsName.startsWith('XI-') ? 'Tingkat XI' : 'Tingkat XII';
        key = level;
        label = level;
        detail = 'Fase Kurikulum Terdaftar';
      } else if (groupBy === 'jurusan') {
        key = student.previousEducation.jurusanPeminatan;
        label = `Jurusan ${student.previousEducation.jurusanPeminatan}`;
        detail = 'Peminatan Akademik';
      } else if (groupBy === 'kelas') {
        key = student.previousEducation.diterimaDiKelas;
        label = `Kelas ${student.previousEducation.diterimaDiKelas}`;
        detail = `Jurusan ${student.previousEducation.jurusanPeminatan}`;
      } else if (groupBy === 'tahun') {
        const yr = student.previousEducation.tanggalIjazahSmp ? student.previousEducation.tanggalIjazahSmp.slice(-4) : '2023';
        key = `Tahun Masuk ${yr}`;
        label = `Tahun Masuk ${yr}`;
        detail = 'Angkatan Terdaftar';
      }

      if (!map.has(key)) {
        map.set(key, { label, lCount: 0, pCount: 0, total: 0, detail });
      }

      const item = map.get(key)!;
      if (student.personal.jenisKelamin === 'L') {
        item.lCount += 1;
      } else {
        item.pCount += 1;
      }
      item.total += 1;
    });

    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  };

  const rows = getBreakdownData();
  const totalL = students.filter((s) => s.personal.jenisKelamin === 'L').length;
  const totalP = students.filter((s) => s.personal.jenisKelamin === 'P').length;
  const grandTotal = students.length;

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Matriks Demografi Siswa (Laki-laki & Perempuan)
          </h3>
        </div>

        {/* Dimension Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-md text-xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 px-2">Filter Grup:</span>
          {(['tingkat', 'jurusan', 'kelas', 'tahun'] as const).map((dim) => (
            <button
              key={dim}
              type="button"
              onClick={() => setGroupBy(dim)}
              style={groupBy === dim ? { backgroundColor: 'var(--accent-primary)' } : undefined}
              className={`px-3 py-1 rounded font-semibold capitalize transition-all cursor-pointer ${
                groupBy === dim
                  ? 'text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {dim}
            </button>
          ))}
        </div>
      </div>

      {/* Dense Enterprise Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/70 text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-2.5 px-4">Kelompok ({groupBy.toUpperCase()})</th>
              <th className="py-2.5 px-4">Keterangan</th>
              <th className="py-2.5 px-4 text-center text-blue-600 dark:text-blue-400">Laki-Laki (L)</th>
              <th className="py-2.5 px-4 text-center text-teal-600 dark:text-teal-400">Perempuan (P)</th>
              <th className="py-2.5 px-4 text-center">Total Siswa</th>
              <th className="py-2.5 px-4">Proporsi L / P</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                  Belum ada data siswa terdaftar.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const lPercent = row.total > 0 ? Math.round((row.lCount / row.total) * 100) : 0;
                const pPercent = 100 - lPercent;
                return (
                  <tr key={row.label} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-white">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                        {row.label}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400 text-xs">
                      {row.detail}
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono font-semibold text-blue-600 dark:text-blue-400">
                      {row.lCount}
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono font-semibold text-teal-600 dark:text-teal-400">
                      {row.pCount}
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono font-bold text-slate-900 dark:text-white">
                      {row.total}
                    </td>
                    <td className="py-2.5 px-4 w-52">
                      <div className="flex items-center gap-2">
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden">
                          <div style={{ width: `${lPercent}%` }} className="bg-blue-600 h-full" title={`L: ${lPercent}%`}></div>
                          <div style={{ width: `${pPercent}%` }} className="bg-teal-500 h-full" title={`P: ${pPercent}%`}></div>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono whitespace-nowrap">
                          {lPercent}% : {pPercent}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          <tfoot className="bg-slate-50 dark:bg-slate-800/60 font-bold border-t border-slate-200 dark:border-slate-800 text-xs">
            <tr>
              <td className="py-2.5 px-4 text-slate-900 dark:text-white">TOTAL KESELURUHAN</td>
              <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400">Data Aktif</td>
              <td className="py-2.5 px-4 text-center font-mono text-blue-600 dark:text-blue-400">{totalL}</td>
              <td className="py-2.5 px-4 text-center font-mono text-teal-600 dark:text-teal-400">{totalP}</td>
              <td className="py-2.5 px-4 text-center font-mono text-slate-900 dark:text-white">{grandTotal}</td>
              <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300 font-mono">
                {grandTotal > 0 ? `${Math.round((totalL / grandTotal) * 100)}% L · ${Math.round((totalP / grandTotal) * 100)}% P` : '-'}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
