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
    <div className="space-y-4">
      {/* Enterprise Toolbar & Filter Row */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded text-xs font-semibold bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/60">
              Kelas: {selectedClass}
            </span>
            {currentClassInfo && (
              <span className="text-xs text-slate-600 dark:text-slate-400">
                Wali Kelas: <strong className="text-slate-900 dark:text-white">{currentClassInfo.waliKelas}</strong>
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleQuickFillAllPresent}
              className="accent-btn-primary inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md text-white transition-colors shadow-xs cursor-pointer"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Isi Cepat Semua Hadir</span>
            </button>

            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Simpan Presensi</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Pilih Kelas (Rombel Terdaftar)
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none"
            >
              {availableClasses.map((cls) => (
                <option key={cls} value={cls}>
                  Kelas {cls} ({students.filter((s) => s.previousEducation.diterimaDiKelas === cls).length} Siswa)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tanggal Presensi
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-mono font-semibold text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Rekap Kelas {selectedClass}
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              <div className="rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-1.5 text-center">
                <span className="block text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold">Hadir</span>
                <span className="text-sm font-bold text-emerald-800 dark:text-emerald-200">{hadirCount}</span>
              </div>
              <div className="rounded-md bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 p-1.5 text-center">
                <span className="block text-[10px] text-cyan-700 dark:text-cyan-300 font-semibold">Sakit</span>
                <span className="text-sm font-bold text-cyan-800 dark:text-cyan-200">{sakitCount}</span>
              </div>
              <div className="rounded-md bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 p-1.5 text-center">
                <span className="block text-[10px] text-blue-700 dark:text-blue-300 font-semibold">Izin</span>
                <span className="text-sm font-bold text-blue-800 dark:text-blue-200">{izinCount}</span>
              </div>
              <div className="rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 p-1.5 text-center">
                <span className="block text-[10px] text-rose-700 dark:text-rose-300 font-semibold">Alpa</span>
                <span className="text-sm font-bold text-rose-800 dark:text-rose-200">{alpaCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Roster Enterprise Table */}
      <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
              Daftar Presensi Kelas {selectedClass} ({classStudents.length} Siswa)
            </h3>
          </div>
          <span className="text-xs text-slate-600 dark:text-slate-300">
            Kehadiran: <strong className="text-emerald-600 dark:text-emerald-400">{totalInClass > 0 ? Math.round((hadirCount / totalInClass) * 100) : 100}%</strong>
          </span>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs">
            Belum ada siswa yang terdaftar di kelas {selectedClass}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 w-12 text-center">No</th>
                  <th className="px-4 py-3 w-14">Foto</th>
                  <th className="px-4 py-3">Nama Siswa & NIS/NISN</th>
                  <th className="px-4 py-3 w-16 text-center">L/P</th>
                  <th className="px-4 py-3 w-72 text-center">Status Kehadiran</th>
                  <th className="px-4 py-3">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredRecords.map(({ student, record }, index) => (
                  <tr
                    key={student.id}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                      record.status === 'S'
                        ? 'bg-cyan-50/30 dark:bg-cyan-950/20'
                        : record.status === 'I'
                        ? 'bg-blue-50/30 dark:bg-blue-950/20'
                        : record.status === 'A'
                        ? 'bg-rose-50/30 dark:bg-rose-950/20'
                        : ''
                    }`}
                  >
                    <td className="px-4 py-2.5 text-center font-mono text-xs text-slate-500 dark:text-slate-400">
                      {index + 1}
                    </td>
                    <td className="px-4 py-2">
                      <StudentAvatar
                        fotoUrl={student.personal.fotoUrl}
                        namaLengkap={student.personal.namaLengkap}
                        size="sm"
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {student.personal.namaLengkap}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        NIS: {student.personal.nis} · NISN: {student.personal.nisn}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span
                        className={`font-semibold text-xs ${
                          student.personal.jenisKelamin === 'L'
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-teal-600 dark:text-teal-400'
                        }`}
                      >
                        {student.personal.jenisKelamin}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleStatusChange(record.id, student.id, 'H')}
                          className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                            record.status === 'H'
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          Hadir (H)
                        </button>
                        <button
                          onClick={() => handleStatusChange(record.id, student.id, 'S')}
                          className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                            record.status === 'S'
                              ? 'bg-teal-600 text-white shadow-2xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          Sakit (S)
                        </button>
                        <button
                          onClick={() => handleStatusChange(record.id, student.id, 'I')}
                          className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                            record.status === 'I'
                              ? 'bg-blue-600 text-white shadow-2xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          Izin (I)
                        </button>
                        <button
                          onClick={() => handleStatusChange(record.id, student.id, 'A')}
                          className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                            record.status === 'A'
                              ? 'bg-rose-600 text-white shadow-2xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          Alpa (A)
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <input
                        type="text"
                        placeholder="Keterangan..."
                        value={record.keterangan || ''}
                        onChange={(e) => handleKeteranganChange(record.id, student.id, e.target.value)}
                        className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:border-blue-600 focus:outline-none"
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
