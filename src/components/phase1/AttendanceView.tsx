import React, { useState, useEffect } from 'react';
import { 
  Check, 
  Calendar, 
  Users, 
  Zap, 
  Save, 
  CheckCircle2, 
  Clock, 
  Filter,
  UserCheck
} from 'lucide-react';
import { DailyAttendanceRecord, AttendanceStatus, StudentFullRecord, SchoolClassRecord } from '../../types/buku-induk';
import { StudentAvatar } from '../common/StudentAvatar';

interface AttendanceViewProps {
  records: DailyAttendanceRecord[];
  students: StudentFullRecord[];
  classes: SchoolClassRecord[];
  onSaveAttendance: (updated: DailyAttendanceRecord[]) => void;
  onShowNotification: (title: string, body: string, type: 'success' | 'info' | 'warning' | 'danger') => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  records: initialRecords,
  students,
  classes,
  onSaveAttendance,
  onShowNotification,
}) => {
  // Available classes list from classes prop or student list
  const availableClasses = classes && classes.length > 0
    ? classes.map((c) => c.namaKelas)
    : Array.from(new Set(students.map((s) => s.previousEducation.diterimaDiKelas))).filter(Boolean);

  const [selectedClass, setSelectedClass] = useState<string>(availableClasses[0] || 'XI-MIPA-1');
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-12');
  const [records, setRecords] = useState<DailyAttendanceRecord[]>(initialRecords);
  const [isDirty, setIsDirty] = useState<boolean>(false);

  // Synchronize roster when selectedClass or selectedDate changes:
  // Auto-populate all students registered in this class with default status 'H' (Hadir)
  useEffect(() => {
    const classStudents = students.filter(
      (s) => s.previousEducation.diterimaDiKelas === selectedClass
    );

    setRecords((prevRecords) => {
      let updated = [...prevRecords];
      let hasNew = false;

      classStudents.forEach((student) => {
        const existing = updated.find(
          (r) =>
            (r.studentId === student.id || r.nisn === student.personal.nisn) &&
            r.tanggal === selectedDate
        );

        if (!existing) {
          hasNew = true;
          updated.push({
            id: `ATT-${student.id}-${selectedDate}`,
            studentId: student.id,
            nisn: student.personal.nisn,
            namaLengkap: student.personal.namaLengkap,
            jenisKelamin: student.personal.jenisKelamin,
            kelas: selectedClass,
            tanggal: selectedDate,
            status: 'H', // Default Hadir
            keterangan: '',
          });
        }
      });

      return hasNew ? updated : prevRecords;
    });
  }, [selectedClass, selectedDate, students]);

  // Students in selected class
  const classStudents = students.filter(
    (s) => s.previousEducation.diterimaDiKelas === selectedClass
  );

  // Filter records based on selected class and date
  const filteredRecords = classStudents.map((student) => {
    const foundRecord = records.find(
      (r) =>
        (r.studentId === student.id || r.nisn === student.personal.nisn) &&
        r.tanggal === selectedDate
    );

    return {
      student,
      record: foundRecord || {
        id: `ATT-${student.id}-${selectedDate}`,
        studentId: student.id,
        nisn: student.personal.nisn,
        namaLengkap: student.personal.namaLengkap,
        jenisKelamin: student.personal.jenisKelamin,
        kelas: selectedClass,
        tanggal: selectedDate,
        status: 'H' as AttendanceStatus,
        keterangan: '',
      },
    };
  });

  // Stats calculation
  const totalInClass = filteredRecords.length;
  const hadirCount = filteredRecords.filter((item) => item.record.status === 'H').length;
  const sakitCount = filteredRecords.filter((item) => item.record.status === 'S').length;
  const izinCount = filteredRecords.filter((item) => item.record.status === 'I').length;
  const alpaCount = filteredRecords.filter((item) => item.record.status === 'A').length;

  const handleStatusChange = (recordId: string, studentId: string, newStatus: AttendanceStatus) => {
    setRecords((prev) => {
      const exists = prev.some((r) => r.id === recordId || (r.studentId === studentId && r.tanggal === selectedDate));
      if (exists) {
        return prev.map((r) =>
          r.id === recordId || (r.studentId === studentId && r.tanggal === selectedDate)
            ? { ...r, status: newStatus }
            : r
        );
      } else {
        const student = students.find((s) => s.id === studentId);
        return [
          ...prev,
          {
            id: recordId,
            studentId,
            nisn: student?.personal.nisn || '',
            namaLengkap: student?.personal.namaLengkap || '',
            jenisKelamin: student?.personal.jenisKelamin || 'L',
            kelas: selectedClass,
            tanggal: selectedDate,
            status: newStatus,
            keterangan: '',
          },
        ];
      }
    });
    setIsDirty(true);
  };

  const handleKeteranganChange = (recordId: string, studentId: string, ket: string) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === recordId || (r.studentId === studentId && r.tanggal === selectedDate)
          ? { ...r, keterangan: ket }
          : r
      )
    );
    setIsDirty(true);
  };

  const handleQuickFillAllPresent = () => {
    const updatedIds = new Set<string>();

    setRecords((prev) => {
      const newRecords = [...prev];
      classStudents.forEach((st) => {
        const idx = newRecords.findIndex(
          (r) =>
            (r.studentId === st.id || r.nisn === st.personal.nisn) &&
            r.tanggal === selectedDate
        );
        if (idx >= 0) {
          newRecords[idx] = { ...newRecords[idx], status: 'H', keterangan: '' };
        } else {
          newRecords.push({
            id: `ATT-${st.id}-${selectedDate}`,
            studentId: st.id,
            nisn: st.personal.nisn,
            namaLengkap: st.personal.namaLengkap,
            jenisKelamin: st.personal.jenisKelamin,
            kelas: selectedClass,
            tanggal: selectedDate,
            status: 'H',
            keterangan: '',
          });
        }
      });
      return newRecords;
    });

    setIsDirty(true);
    onShowNotification(
      'Isi Cepat Berhasil',
      `Seluruh siswa kelas ${selectedClass} (${classStudents.length} siswa) berhasil ditandai Hadir (H).`,
      'success'
    );
  };

  const handleSave = () => {
    onSaveAttendance(records);
    setIsDirty(false);
    onShowNotification(
      'Presensi Disimpan',
      `Rekapitulasi kehadiran kelas ${selectedClass} tanggal ${selectedDate} berhasil disimpan ke database.`,
      'success'
    );
  };

  const currentClassInfo = classes.find((c) => c.namaKelas === selectedClass);

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              LANGKAH 7
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Input Kehadiran & Presensi Harian Siswa
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Daftar otomatis memuat siswa terdaftar di kelas terpilih dengan default Hadir. Ubah siswa yang berhalangan hadir.
          </p>
        </div>

        {/* Primary actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleQuickFillAllPresent}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors shadow-sm"
          >
            <Zap className="h-3.5 w-3.5" />
            <span>⚡ Isi Cepat Semua Hadir</span>
          </button>

          <button
            onClick={handleSave}
            disabled={!isDirty}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg transition-colors shadow-sm ${
              isDirty
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                : 'bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed'
            }`}
          >
            <Save className="h-3.5 w-3.5" />
            <span>Simpan Presensi</span>
          </button>
        </div>
      </div>

      {/* Filter and selector row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Pilih Kelas (Rombel Terdaftar)
          </label>
          <div className="relative">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {availableClasses.map((cls) => (
                <option key={cls} value={cls}>
                  Kelas {cls} ({students.filter((s) => s.previousEducation.diterimaDiKelas === cls).length} Siswa Terdaftar)
                </option>
              ))}
            </select>
          </div>
          {currentClassInfo && (
            <p className="text-[11px] text-slate-400 mt-1">
              Wali Kelas: {currentClassInfo.waliKelas} · Tingkat {currentClassInfo.tingkat}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Tanggal Presensi (Format DD-MM-YYYY)
          </label>
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Standar format Indonesia: {selectedDate.split('-').reverse().join('-')}
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Rekap Singkat Kelas {selectedClass}
          </label>
          <div className="grid grid-cols-4 gap-1.5 pt-0.5">
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-1.5 text-center">
              <span className="block text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">Hadir</span>
              <span className="text-sm font-black text-emerald-800 dark:text-emerald-300">{hadirCount}</span>
            </div>
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-1.5 text-center">
              <span className="block text-[10px] text-amber-700 dark:text-amber-400 font-bold">Sakit</span>
              <span className="text-sm font-black text-amber-800 dark:text-amber-300">{sakitCount}</span>
            </div>
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 p-1.5 text-center">
              <span className="block text-[10px] text-blue-700 dark:text-blue-400 font-bold">Izin</span>
              <span className="text-sm font-black text-blue-800 dark:text-blue-300">{izinCount}</span>
            </div>
            <div className="rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 p-1.5 text-center">
              <span className="block text-[10px] text-rose-700 dark:text-rose-400 font-bold">Alpa</span>
              <span className="text-sm font-black text-rose-800 dark:text-rose-300">{alpaCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Roster Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Daftar Siswa Terdaftar di Kelas {selectedClass} ({classStudents.length} Siswa Aktif)
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">
            Tingkat Kehadiran: <strong className="text-emerald-600">{totalInClass > 0 ? Math.round((hadirCount / totalInClass) * 100) : 100}%</strong>
          </span>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            Belum ada siswa yang terdaftar di kelas {selectedClass}. Silakan tambahkan siswa di Langkah 5 atau impor via Excel.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-[11px] font-bold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3 w-12 text-center">No</th>
                  <th className="px-4 py-3 w-14">Foto</th>
                  <th className="px-4 py-3">Nama Siswa & NIS/NISN</th>
                  <th className="px-4 py-3 w-16 text-center">L/P</th>
                  <th className="px-4 py-3 w-72 text-center">Status Kehadiran</th>
                  <th className="px-4 py-3">Keterangan Khusus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRecords.map(({ student, record }, index) => (
                  <tr
                    key={student.id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                      record.status === 'S'
                        ? 'bg-amber-50/30 dark:bg-amber-950/10'
                        : record.status === 'I'
                        ? 'bg-blue-50/30 dark:bg-blue-950/10'
                        : record.status === 'A'
                        ? 'bg-rose-50/30 dark:bg-rose-950/10'
                        : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-center font-mono text-slate-400">
                      {index + 1}
                    </td>
                    <td className="px-4 py-2">
                      <StudentAvatar
                        fotoUrl={student.personal.fotoUrl}
                        namaLengkap={student.personal.namaLengkap}
                        size="sm"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {student.personal.namaLengkap}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        NIS: {student.personal.nis} · NISN: {student.personal.nisn}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`font-bold ${
                          student.personal.jenisKelamin === 'L'
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-pink-600 dark:text-pink-400'
                        }`}
                      >
                        {student.personal.jenisKelamin}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleStatusChange(record.id, student.id, 'H')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            record.status === 'H'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          Hadir (H)
                        </button>
                        <button
                          onClick={() => handleStatusChange(record.id, student.id, 'S')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            record.status === 'S'
                              ? 'bg-amber-500 text-slate-950 shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          Sakit (S)
                        </button>
                        <button
                          onClick={() => handleStatusChange(record.id, student.id, 'I')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            record.status === 'I'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          Izin (I)
                        </button>
                        <button
                          onClick={() => handleStatusChange(record.id, student.id, 'A')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            record.status === 'A'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          Alpa (A)
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        placeholder="Keterangan surat izin / dokter..."
                        value={record.keterangan || ''}
                        onChange={(e) => handleKeteranganChange(record.id, student.id, e.target.value)}
                        className="w-full rounded border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-800 placeholder-slate-400 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
