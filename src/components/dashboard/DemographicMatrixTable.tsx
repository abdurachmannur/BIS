import React, { useState } from 'react';
import { 
  Users, 
  Layers, 
  School, 
  GraduationCap, 
  Filter, 
  ArrowUpDown,
  PieChart,
  BarChart3
} from 'lucide-react';
import { StudentFullRecord, SchoolClassRecord } from '../../types/buku-induk';

interface DemographicMatrixTableProps {
  students: StudentFullRecord[];
  classes: SchoolClassRecord[];
}

export const DemographicMatrixTable: React.FC<DemographicMatrixTableProps> = ({
  students,
  classes,
}) => {
  const [groupBy, setGroupBy] = useState<'tingkat' | 'jurusan' | 'kelas' | 'tahun'>('tingkat');

  // Compute breakdown data dynamically based on students
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
        // Group by Year of Admission / Completion
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
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-amber-500" />
            <span>Matriks Demografi Jumlah Siswa (Laki-laki & Perempuan)</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Rincian jumlah siswa menurut Tingkat, Jurusan, Kelas, dan Tahun Masuk
          </p>
        </div>

        {/* Dimension Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs">
          <span className="text-[10px] font-bold text-slate-400 px-2 uppercase">Grup Per:</span>
          {(['tingkat', 'jurusan', 'kelas', 'tahun'] as const).map((dim) => (
            <button
              key={dim}
              onClick={() => setGroupBy(dim)}
              className={`px-2.5 py-1 rounded font-semibold capitalize transition-all ${
                groupBy === dim
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {dim}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Laki-laki vs Perempuan */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/50 dark:border-blue-900/40 dark:bg-blue-950/20">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
            Siswa Laki-Laki (L)
          </span>
          <div className="text-xl font-bold font-mono text-blue-900 dark:text-blue-100 mt-1">
            {totalL} <span className="text-xs font-normal text-slate-500">Orang</span>
          </div>
          <div className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">
            {grandTotal > 0 ? Math.round((totalL / grandTotal) * 100) : 0}% dari seluruh siswa
          </div>
        </div>

        <div className="p-3 rounded-lg border border-pink-200 bg-pink-50/50 dark:border-pink-900/40 dark:bg-pink-950/20">
          <span className="text-[10px] font-bold uppercase tracking-wider text-pink-700 dark:text-pink-300">
            Siswa Perempuan (P)
          </span>
          <div className="text-xl font-bold font-mono text-pink-900 dark:text-pink-100 mt-1">
            {totalP} <span className="text-xs font-normal text-slate-500">Orang</span>
          </div>
          <div className="text-[10px] text-pink-600 dark:text-pink-400 mt-0.5">
            {grandTotal > 0 ? Math.round((totalP / grandTotal) * 100) : 0}% dari seluruh siswa
          </div>
        </div>

        <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Total Seluruh Siswa
          </span>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {grandTotal} <span className="text-xs font-normal text-slate-500">Orang Terdata</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {rows.length} Kelompok aktif
          </div>
        </div>
      </div>

      {/* Drill-down Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-2.5 px-4 font-semibold">Kelompok ({groupBy.toUpperCase()})</th>
              <th className="py-2.5 px-4 font-semibold">Keterangan</th>
              <th className="py-2.5 px-4 font-semibold text-center text-blue-600">Laki-Laki (L)</th>
              <th className="py-2.5 px-4 font-semibold text-center text-pink-600">Perempuan (P)</th>
              <th className="py-2.5 px-4 font-semibold text-center">Total Siswa</th>
              <th className="py-2.5 px-4 font-semibold">Komposisi Gender</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((row) => {
              const lPercent = row.total > 0 ? Math.round((row.lCount / row.total) * 100) : 0;
              const pPercent = 100 - lPercent;
              return (
                <tr key={row.label} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">
                    {row.label}
                  </td>
                  <td className="py-2.5 px-4 text-slate-500 text-[11px]">
                    {row.detail}
                  </td>
                  <td className="py-2.5 px-4 text-center font-mono font-bold text-blue-700 dark:text-blue-300">
                    {row.lCount}
                  </td>
                  <td className="py-2.5 px-4 text-center font-mono font-bold text-pink-700 dark:text-pink-300">
                    {row.pCount}
                  </td>
                  <td className="py-2.5 px-4 text-center font-mono font-bold text-slate-900 dark:text-white">
                    {row.total}
                  </td>
                  <td className="py-2.5 px-4 w-48">
                    <div className="flex items-center gap-2">
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden">
                        <div style={{ width: `${lPercent}%` }} className="bg-blue-500 h-full" title={`L: ${lPercent}%`}></div>
                        <div style={{ width: `${pPercent}%` }} className="bg-pink-500 h-full" title={`P: ${pPercent}%`}></div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">
                        {lPercent}% : {pPercent}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-slate-50 dark:bg-slate-800/80 font-bold border-t border-slate-200 dark:border-slate-800">
            <tr>
              <td className="py-2.5 px-4">TOTAL KESELURUHAN</td>
              <td className="py-2.5 px-4 text-slate-500 text-[11px]">Akumulasi Aktif</td>
              <td className="py-2.5 px-4 text-center font-mono text-blue-700 dark:text-blue-300">{totalL}</td>
              <td className="py-2.5 px-4 text-center font-mono text-pink-700 dark:text-pink-300">{totalP}</td>
              <td className="py-2.5 px-4 text-center font-mono text-slate-900 dark:text-white">{grandTotal}</td>
              <td className="py-2.5 px-4 text-[11px] text-slate-500 font-mono">
                {grandTotal > 0 ? `${Math.round((totalL / grandTotal) * 100)}% L · ${Math.round((totalP / grandTotal) * 100)}% P` : '-'}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
