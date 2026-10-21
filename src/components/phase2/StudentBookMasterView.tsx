import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  User, 
  Eye, 
  Edit3, 
  Printer, 
  Download, 
  X, 
  Check, 
  FileText,
  Heart,
  Building2,
  Users,
  ShieldCheck,
  Award,
  ChevronRight,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  CheckSquare,
  Square,
  Upload,
  FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { 
  StudentFullRecord, 
  Major, 
  StudentStatus, 
  Gender,
  AcademicYearRecord,
  DepartmentRecord,
  GradeLevelRecord,
  SchoolClassRecord
} from '../../types/buku-induk';
import { STANDARD_SUBJECTS_MIPA, calculatePredicate } from '../../data/mock-data';
import { StudentAvatar } from '../common/StudentAvatar';

interface StudentBookMasterViewProps {
  students: StudentFullRecord[];
  academicYears?: AcademicYearRecord[];
  departments?: DepartmentRecord[];
  gradeLevels?: GradeLevelRecord[];
  schoolClasses?: SchoolClassRecord[];
  onAddStudent: (newStudent: StudentFullRecord) => void;
  onUpdateStudent: (updatedStudent: StudentFullRecord) => void;
  onDeleteStudent: (studentId: string) => void;
  onBulkDeleteStudents?: (studentIds: string[]) => void;
  onBulkAssignClass?: (studentIds: string[], targetClass: SchoolClassRecord) => void;
  onTriggerSinglePrint: (student: StudentFullRecord) => void;
  onTriggerBulkPrint: (studentIds: string[]) => void;
  onExportExcel: (selectedIds?: string[]) => void;
  onOpenImportModal?: () => void;
  onShowNotification: (title: string, body: string, type: 'success' | 'info' | 'warning' | 'danger') => void;
}

export const StudentBookMasterView: React.FC<StudentBookMasterViewProps> = ({
  students,
  academicYears = [],
  departments = [],
  gradeLevels = [],
  schoolClasses = [],
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onBulkDeleteStudents,
  onBulkAssignClass,
  onTriggerSinglePrint,
  onTriggerBulkPrint,
  onExportExcel,
  onOpenImportModal,
  onShowNotification,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMajor, setSelectedMajor] = useState<string>('ALL');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Selected for bulk actions
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Modal states
  const [viewingStudent, setViewingStudent] = useState<StudentFullRecord | null>(null);
  const [editingStudent, setEditingStudent] = useState<StudentFullRecord | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'A' | 'B' | 'C' | 'D' | 'E' | 'F'>('A');

  // Form State for Create/Edit
  const [formData, setFormData] = useState<StudentFullRecord | null>(null);

  // In-App Delete Confirmation Modal State (Individual & Bulk)
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    ids: string[];
    names: string[];
  } | null>(null);

  // In-App Bulk Class Reassignment Modal State
  const [bulkClassModalOpen, setBulkClassModalOpen] = useState<boolean>(false);
  const [targetBulkClassId, setTargetBulkClassId] = useState<string>(schoolClasses[0]?.id || '');

  // Available classes from Master Data Kelas + existing student classes
  const classesList = Array.from(
    new Set([
      ...schoolClasses.map((c) => c.namaKelas),
      ...students.map((s) => s.previousEducation.diterimaDiKelas),
    ])
  )
    .filter(Boolean)
    .sort();

  const majorsList = departments.length > 0
    ? departments.map((d) => ({ kode: d.kode, nama: d.nama }))
    : [
        { kode: 'MIPA', nama: 'Matematika dan Ilmu Pengetahuan Alam' },
        { kode: 'IPS', nama: 'Ilmu Pengetahuan Sosial' },
        { kode: 'BAHASA', nama: 'Bahasa dan Budaya' },
      ];

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.personal.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.personal.nis.includes(searchTerm) ||
      s.personal.nisn.includes(searchTerm);
    const matchesMajor = selectedMajor === 'ALL' || s.previousEducation.jurusanPeminatan === selectedMajor;
    const matchesClass = selectedClass === 'ALL' || s.previousEducation.diterimaDiKelas === selectedClass;
    const matchesStatus = selectedStatus === 'ALL' || s.departure.status === selectedStatus;
    return matchesSearch && matchesMajor && matchesClass && matchesStatus;
  });

  const handleSelectAll = () => {
    if (selectedStudentIds.length === filteredStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map((s) => s.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const openCreateModal = () => {
    const nextNis = '2425' + String(1000 + students.length + 1).slice(1);
    const nextNisn = '007' + String(1000000 + students.length + 1).slice(1);

    const blankStudent: StudentFullRecord = {
      id: 'STD-' + Date.now(),
      personal: {
        nis: nextNis,
        nisn: nextNisn,
        namaLengkap: '',
        namaPanggilan: '',
        jenisKelamin: 'L',
        tempatLahir: 'Bandung',
        tanggalLahir: '2008-01-01',
        agama: 'Islam',
        kewarganegaraan: 'WNI',
        anakKe: 1,
        jumlahSaudaraKandung: 1,
        jumlahSaudaraTiri: 0,
        jumlahSaudaraAngkat: 0,
        statusAnak: 'Lengkap',
        bahasaKeseharian: 'Bahasa Indonesia',
        alamat: '',
        rtRw: '01/01',
        kelurahan: 'Dago',
        kecamatan: 'Coblong',
        kabupatenKota: 'Kota Bandung',
        provinsi: 'Jawa Barat',
        kodePos: '40135',
        nomorHp: '',
        tinggalDengan: 'Orang Tua',
        jarakKeSekolahKm: 2.5,
        transportasi: 'Sepeda Motor',
        fotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      },
      physical: {
        beratBadanKg: 55,
        tinggiBadanCm: 165,
        golonganDarah: 'O',
        riwayatPenyakit: 'Tidak Ada',
        kelainanJasmani: 'Tidak Ada',
      },
      previousEducation: {
        asalSekolah: 'SMP Negeri 1 Bandung',
        nomorIjazahSmp: 'DN-02/DIK/2024/000912',
        tanggalIjazahSmp: '2024-06-15',
        nomorSkhun: 'SKHUN-SMP-24-09812',
        lamaBelajarTahun: 3,
        diterimaDiKelas: 'X-MIPA-1',
        diterimaTanggal: '2024-07-15',
        jurusanPeminatan: 'MIPA',
        isPindahan: false,
      },
      ayah: {
        nama: '',
        tempatLahir: 'Bandung',
        tanggalLahir: '1975-01-01',
        agama: 'Islam',
        kewarganegaraan: 'WNI',
        pendidikanTerakhir: 'S1',
        pekerjaan: 'Wiraswasta',
        penghasilanBulanan: 'Rp 7.000.000 - Rp 10.000.000',
        alamat: 'Bandung',
        nomorHp: '',
        masihHidup: true,
      },
      ibu: {
        nama: '',
        tempatLahir: 'Bandung',
        tanggalLahir: '1978-01-01',
        agama: 'Islam',
        kewarganegaraan: 'WNI',
        pendidikanTerakhir: 'S1',
        pekerjaan: 'Ibu Rumah Tangga',
        penghasilanBulanan: 'Tidak Berpenghasilan',
        alamat: 'Bandung',
        nomorHp: '',
        masihHidup: true,
      },
      wali: {
        adaWali: false,
      },
      departure: {
        status: 'Aktif',
      },
      academicRecords: {
        1: {
          semester: 1,
          tahunAjaran: '2024/2025',
          tingkatKelas: 'X',
          kelas: 'X-MIPA-1',
          grades: STANDARD_SUBJECTS_MIPA.map((sub) => ({
            mapelCode: sub.code,
            mapelName: sub.name,
            kelompok: sub.kelompok,
            kkm: sub.kkm,
            nilaiPengetahuan: 85,
            predikatPengetahuan: calculatePredicate(85, sub.kkm),
            nilaiKeterampilan: 85,
            predikatKeterampilan: calculatePredicate(85, sub.kkm),
            deskripsiKemajuan: 'Menunjukkan pemahaman yang baik terhadap materi dasar.',
          })),
          extracurriculars: [
            { namaKegiatan: 'Pramuka (Wajib)', predikat: 'Baik', keterangan: 'Tertib mengikuti apel mingguan' },
          ],
          attendance: { sakit: 0, izin: 0, tanpaKeterangan: 0 },
          catatanWaliKelas: 'Siswa baru yang berpotensi aktif dan bersemangat belajar.',
        },
      },
    };

    setFormData(blankStudent);
    setIsCreatingNew(true);
    setEditingStudent(null);
    setActiveTab('A');
  };

  const openEditModal = (student: StudentFullRecord) => {
    setFormData(JSON.parse(JSON.stringify(student)));
    setEditingStudent(student);
    setIsCreatingNew(false);
    setActiveTab('A');
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    if (!formData.personal.namaLengkap.trim()) {
      onShowNotification('Validasi Gagal', 'Nama lengkap siswa wajib diisi!', 'danger');
      return;
    }
    if (!formData.personal.nis.trim() || !formData.personal.nisn.trim()) {
      onShowNotification('Validasi Gagal', 'NIS dan NISN wajib diisi!', 'danger');
      return;
    }

    if (isCreatingNew) {
      onAddStudent(formData);
      onShowNotification(
        'Siswa Baru Ditambahkan',
        `Data Buku Induk ${formData.personal.namaLengkap} (NIS: ${formData.personal.nis}) berhasil disimpan.`,
        'success'
      );
    } else {
      onUpdateStudent(formData);
      onShowNotification(
        'Data Siswa Diperbarui',
        `Buku Induk ${formData.personal.namaLengkap} telah berhasil diperbarui.`,
        'success'
      );
    }

    setFormData(null);
    setIsCreatingNew(false);
    setEditingStudent(null);
  };

  const handleDelete = (id: string, nama: string) => {
    setDeleteConfirmModal({
      isOpen: true,
      ids: [id],
      names: [nama],
    });
  };

  const handleOpenBulkDelete = () => {
    if (selectedStudentIds.length === 0) return;
    const selectedStudents = students.filter((s) => selectedStudentIds.includes(s.id));
    setDeleteConfirmModal({
      isOpen: true,
      ids: selectedStudents.map((s) => s.id),
      names: selectedStudents.map((s) => `${s.personal.namaLengkap} (${s.personal.nis})`),
    });
  };

  const handleExecuteDeleteConfirm = () => {
    if (!deleteConfirmModal) return;
    const { ids, names } = deleteConfirmModal;

    if (ids.length === 1) {
      onDeleteStudent(ids[0]);
      onShowNotification(
        'Arsip Buku Induk Dihapus',
        `Data siswa ${names[0]} berhasil dihapus dari daftar aktif.`,
        'warning'
      );
    } else if (ids.length > 1) {
      if (onBulkDeleteStudents) {
        onBulkDeleteStudents(ids);
      } else {
        ids.forEach((id) => onDeleteStudent(id));
      }
      onShowNotification(
        'Hapus Massal Berhasil',
        `${ids.length} data siswa terpilih telah berhasil dihapus.`,
        'warning'
      );
    }

    setSelectedStudentIds((prev) => prev.filter((id) => !ids.includes(id)));
    setDeleteConfirmModal(null);
  };

  const handleExecuteBulkAssignClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudentIds.length === 0) return;
    const targetCls = schoolClasses.find((c) => c.id === targetBulkClassId);
    if (!targetCls) {
      onShowNotification('Pilih Kelas Tujuan', 'Silakan pilih kelas tujuan dari Master Data Kelas.', 'warning');
      return;
    }

    if (onBulkAssignClass) {
      onBulkAssignClass(selectedStudentIds, targetCls);
    } else {
      selectedStudentIds.forEach((studentId) => {
        const st = students.find((s) => s.id === studentId);
        if (st) {
          onUpdateStudent({
            ...st,
            previousEducation: {
              ...st.previousEducation,
              diterimaDiKelas: targetCls.namaKelas,
              classId: targetCls.id,
              jurusanPeminatan: targetCls.jurusan,
              tahunAjaranMasuk: targetCls.tahunAjaran,
            },
          });
        }
      });
    }

    onShowNotification(
      'Bulk Ubah Kelas Berhasil',
      `${selectedStudentIds.length} siswa berhasil dipindahkan ke Kelas ${targetCls.namaKelas} (${targetCls.jurusan} · TA ${targetCls.tahunAjaran}).`,
      'success'
    );
    setBulkClassModalOpen(false);
    setSelectedStudentIds([]);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              FASE 2
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Data Master Buku Induk Siswa (Bagian A - F)
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Standar format dokumen resmi Buku Induk Siswa SMA Kemendikbudristek RI
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {selectedStudentIds.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 p-1.5 rounded-xl border border-amber-300 dark:border-amber-800 shadow-xs">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-300 px-2">
                {selectedStudentIds.length} Siswa Terpilih
              </span>
              <button
                type="button"
                onClick={() => {
                  if (schoolClasses.length > 0 && !targetBulkClassId) {
                    setTargetBulkClassId(schoolClasses[0].id);
                  }
                  setBulkClassModalOpen(true);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors cursor-pointer"
                title="Ubah Kelas, Jurusan, dan Tahun Ajaran untuk semua siswa terpilih"
              >
                <Users className="h-3.5 w-3.5" />
                <span>Ubah Kelas Massal</span>
              </button>
              <button
                type="button"
                onClick={handleOpenBulkDelete}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-600 text-white hover:bg-rose-500 transition-colors cursor-pointer"
                title="Hapus semua siswa terpilih"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Hapus Terpilih</span>
              </button>
              <button
                type="button"
                onClick={() => onTriggerBulkPrint(selectedStudentIds)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Cetak PDF Batch</span>
              </button>
              <button
                type="button"
                onClick={() => onExportExcel(selectedStudentIds)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>Ekspor Excel</span>
              </button>
            </div>
          )}

          {onOpenImportModal && (
            <button
              onClick={onOpenImportModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm transition-colors"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>⚡ Impor Excel & ZIP Foto</span>
            </button>
          )}

          <button
            onClick={() => onExportExcel()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-sm cursor-pointer"
            title="Ekspor Seluruh Siswa ke Format Excel .xlsx"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            <span>Ekspor Excel (.xlsx)</span>
          </button>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>+ Tambah Siswa Baru</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="relative sm:col-span-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari Nama, NIS, atau NISN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 whitespace-nowrap">Kelas:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="ALL">Semua Kelas</option>
            {classesList.map((cls) => (
              <option key={cls} value={cls}>Kelas {cls}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 whitespace-nowrap">Jurusan:</span>
          <select
            value={selectedMajor}
            onChange={(e) => setSelectedMajor(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="ALL">Semua Jurusan</option>
            {majorsList.map((m) => (
              <option key={m.kode} value={m.kode}>{m.kode} ({m.nama})</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 whitespace-nowrap">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="ALL">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Lulus">Lulus / Alumni</option>
            <option value="Pindah">Pindah Sekolah</option>
          </select>
        </div>
      </div>

      {/* Student Master Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-slate-600 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-400">
              <tr>
                <th className="py-3 px-3 w-10 text-center">
                  <button
                    onClick={handleSelectAll}
                    className="text-slate-500 hover:text-slate-700"
                    title="Pilih Semua"
                  >
                    {selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0 ? (
                      <CheckSquare className="h-4 w-4 text-amber-600" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4 font-semibold">Foto & Identitas Siswa</th>
                <th className="py-3 px-4 font-semibold">NIS / NISN</th>
                <th className="py-3 px-4 font-semibold">Kelas & Peminatan</th>
                <th className="py-3 px-4 font-semibold">TTL & Asal Sekolah</th>
                <th className="py-3 px-4 font-semibold">Status Siswa</th>
                <th className="py-3 px-4 text-center font-semibold">Aksi Filament</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ditemukan data siswa yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const isChecked = selectedStudentIds.includes(student.id);
                  return (
                    <tr
                      key={student.id}
                      className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors ${
                        isChecked ? 'bg-amber-50/30 dark:bg-amber-950/10' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleToggleSelect(student.id)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          {isChecked ? (
                            <CheckSquare className="h-4 w-4 text-amber-600" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <StudentAvatar
                            fotoUrl={student.personal.fotoUrl}
                            namaLengkap={student.personal.namaLengkap}
                            size="md"
                          />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {student.personal.namaLengkap}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <span>Panggilan: {student.personal.namaPanggilan || '-'}</span>
                              <span>·</span>
                              <span className={student.personal.jenisKelamin === 'L' ? 'text-blue-600 font-semibold' : 'text-pink-600 font-semibold'}>
                                {student.personal.jenisKelamin === 'L' ? 'Laki-Laki' : 'Perempuan'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {student.personal.nis}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          NISN: {student.personal.nisn}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {student.previousEducation.diterimaDiKelas}
                        </div>
                        <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          {student.previousEducation.jurusanPeminatan}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-800 dark:text-slate-200">
                          {student.personal.tempatLahir}, {student.personal.tanggalLahir}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Asal: {student.previousEducation.asalSekolah}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            student.departure.status === 'Aktif'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : student.departure.status === 'Lulus'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {student.departure.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setViewingStudent(student);
                              setActiveTab('A');
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                            title="Buka Lembar Buku Induk Lengkap"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => openEditModal(student)}
                            className="p-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300 transition-colors"
                            title="Edit Data Siswa (Semua Bagian)"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => onTriggerSinglePrint(student)}
                            className="p-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 transition-colors"
                            title="Cetak Buku Induk PDF Siswa Ini"
                          >
                            <Printer className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(student.id, student.personal.namaLengkap)}
                            className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400 transition-colors"
                            title="Hapus / Soft Delete Siswa"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE & EDIT FORM MODAL (BAGIAN A S/D F) */}
      {formData && (isCreatingNew || editingStudent) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500 font-bold text-slate-950">
                  {isCreatingNew ? '+' : 'EDIT'}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {isCreatingNew ? 'Form Tambah Buku Induk Siswa Baru' : `Edit Buku Induk: ${formData.personal.namaLengkap}`}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Sesuai Standar Format Formulir Buku Induk Siswa SMA Depdikbud RI
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setFormData(null);
                  setIsCreatingNew(false);
                  setEditingStudent(null);
                }}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form Tabs Navigation */}
            <div className="flex border-b border-slate-200 bg-slate-100/60 px-4 dark:border-slate-800 dark:bg-slate-800/60 overflow-x-auto">
              {(['A', 'B', 'C', 'D', 'E', 'F'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`py-2.5 px-3.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab
                      ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-900'
                      : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400'
                  }`}
                >
                  Bagian {tab} {tab === 'A' ? '(Pribadi)' : tab === 'B' ? '(Jasmani)' : tab === 'C' ? '(Pendidikan SMP)' : tab === 'D' ? '(Orang Tua)' : tab === 'E' ? '(Wali)' : '(Lulus/Pindah)'}
                </button>
              ))}
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveForm} className="flex-1 overflow-y-auto p-6 text-xs text-slate-800 dark:text-slate-200 space-y-4">
              {/* TAB A: PRIBADI */}
              {activeTab === 'A' && (
                <div className="space-y-4">
                  {/* Upload Pas Foto Siswa 3x4 */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-24 h-32 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-xs">
                      {formData.personal.fotoUrl ? (
                        <img
                          src={formData.personal.fotoUrl}
                          alt="Pas Foto Siswa"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-2 text-[10px] text-slate-400">
                          <User className="h-6 w-6 mx-auto mb-1 text-slate-300" />
                          <span>Pas Foto 3x4</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2 w-full">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            Pas Foto Siswa (Ukuran 3x4)
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Unggah file foto (.jpg / .png / .webp) dari perangkat atau tempel tautan foto untuk ditampilkan di Buku Induk & Lembar Cetak.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-500 transition-colors shadow-xs">
                            <Upload className="h-3.5 w-3.5" />
                            <span>Pilih File Foto</span>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                  const dataUrl = ev.target?.result as string;
                                  if (dataUrl) {
                                    setFormData({
                                      ...formData,
                                      personal: { ...formData.personal, fotoUrl: dataUrl },
                                    });
                                    onShowNotification('Pas Foto Diunggah', `Foto ${file.name} berhasil dipasang.`, 'success');
                                  }
                                };
                                reader.readAsDataURL(file);
                              }}
                            />
                          </label>
                          {formData.personal.fotoUrl && (
                            <button
                              type="button"
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  personal: { ...formData.personal, fotoUrl: '' },
                                })
                              }
                              className="px-2.5 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-[11px] font-semibold"
                            >
                              Hapus Foto
                            </button>
                          )}
                        </div>
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Atau tempel URL foto langsung (opsional)..."
                          value={formData.personal.fotoUrl || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              personal: { ...formData.personal, fotoUrl: e.target.value },
                            })
                          }
                          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-[11px] font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Nomor Induk Siswa (NIS) *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.personal.nis}
                        onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, nis: e.target.value } })}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        NISN Nasional (10 Digit) *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={10}
                        value={formData.personal.nisn}
                        onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, nisn: e.target.value } })}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Jenis Kelamin *
                      </label>
                      <select
                        value={formData.personal.jenisKelamin}
                        onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, jenisKelamin: e.target.value as Gender } })}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5"
                      >
                        <option value="L">Laki-Laki (L)</option>
                        <option value="P">Perempuan (P)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Nama Lengkap Siswa *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.personal.namaLengkap}
                        onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, namaLengkap: e.target.value } })}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Nama Panggilan
                      </label>
                      <input
                        type="text"
                        value={formData.personal.namaPanggilan}
                        onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, namaPanggilan: e.target.value } })}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5"
                      />
                    </div>
                  </div>

                  {/* Penempatan Kelas, Jurusan & Tahun Ajaran (Dropdown Terhubung dari Master Data) */}
                  <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/20 space-y-3">
                    <div className="text-[11px] font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                      Penempatan Rombel, Jurusan & Tahun Ajaran (Dropdown dari Master Data)
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Pilih Kelas / Rombel (Data Kelas) *
                        </label>
                        <select
                          value={formData.previousEducation.classId || formData.previousEducation.diterimaDiKelas}
                          onChange={(e) => {
                            const val = e.target.value;
                            const foundCls = schoolClasses.find((c) => c.id === val || c.namaKelas === val);
                            if (foundCls) {
                              setFormData({
                                ...formData,
                                previousEducation: {
                                  ...formData.previousEducation,
                                  classId: foundCls.id,
                                  diterimaDiKelas: foundCls.namaKelas,
                                  jurusanPeminatan: foundCls.jurusan,
                                  tahunAjaranMasuk: foundCls.tahunAjaran,
                                },
                              });
                            } else {
                              setFormData({
                                ...formData,
                                previousEducation: {
                                  ...formData.previousEducation,
                                  classId: undefined,
                                  diterimaDiKelas: val,
                                },
                              });
                            }
                          }}
                          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 font-bold"
                        >
                          <option value="Belum Ditentukan">-- Belum Ditentukan / Tanpa Kelas --</option>
                          {schoolClasses.map((cls) => (
                            <option key={cls.id} value={cls.id}>
                              {cls.namaKelas} ({cls.tahunAjaran}) — Wali: {cls.waliKelas}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Pilih Jurusan (Data Jurusan) *
                        </label>
                        <select
                          value={formData.previousEducation.jurusanPeminatan}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              previousEducation: { ...formData.previousEducation, jurusanPeminatan: e.target.value },
                            })
                          }
                          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 font-bold"
                        >
                          {majorsList.map((m) => (
                            <option key={m.kode} value={m.kode}>
                              {m.kode} — {m.nama}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Tahun Ajaran Masuk (Data Tahun Ajaran)
                        </label>
                        <select
                          value={formData.previousEducation.tahunAjaranMasuk || academicYears[0]?.tahun || '2024/2025'}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              previousEducation: { ...formData.previousEducation, tahunAjaranMasuk: e.target.value },
                            })
                          }
                          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 font-mono font-bold"
                        >
                          {Array.from(new Set(academicYears.map((y) => y.tahun))).map((th) => (
                            <option key={th} value={th}>
                              Tahun Ajaran {th}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Tempat Lahir
                      </label>
                      <input
                        type="text"
                        value={formData.personal.tempatLahir}
                        onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, tempatLahir: e.target.value } })}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Tanggal Lahir (DD-MM-YYYY)
                      </label>
                      <input
                        type="text"
                        placeholder="DD-MM-YYYY"
                        value={formData.personal.tanggalLahir}
                        onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, tanggalLahir: e.target.value } })}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Agama
                      </label>
                      <select
                        value={formData.personal.agama}
                        onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, agama: e.target.value } })}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5"
                      >
                        <option value="Islam">Islam</option>
                        <option value="Kristen Protestan">Kristen Protestan</option>
                        <option value="Katolik">Katolik</option>
                        <option value="Hindu">Hindu</option>
                        <option value="Buddha">Buddha</option>
                        <option value="Khonghucu">Khonghucu</option>
                      </select>
                    </div>
                  </div>

                  {/* Kewarganegaraan, Anak Ke, Jumlah Saudara, Bahasa, Tinggal Bersama */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Kewarganegaraan
                      </label>
                      <input
                        type="text"
                        value={formData.personal.kewarganegaraan}
                        onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, kewarganegaraan: e.target.value } })}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Anak Ke-
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={formData.personal.anakKe}
                        onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, anakKe: parseInt(e.target.value) || 1 } })}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Jml. Saudara Kandung
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={formData.personal.jumlahSaudaraKandung}
                        onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, jumlahSaudaraKandung: parseInt(e.target.value) || 0 } })}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Bahasa Sehari-hari
                      </label>
                      <input
                        type="text"
                        value={formData.personal.bahasaKeseharian}
                        onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, bahasaKeseharian: e.target.value } })}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Tinggal Bersama
                      </label>
                      <select
                        value={formData.personal.tinggalDengan}
                        onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, tinggalDengan: e.target.value as any } })}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs"
                      >
                        <option value="Orang Tua">Orang Tua</option>
                        <option value="Wali">Wali</option>
                        <option value="Kost">Kost</option>
                        <option value="Asrama">Asrama</option>
                        <option value="Menumpang">Menumpang</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Alamat Tempat Tinggal Lengkap
                    </label>
                    <textarea
                      rows={2}
                      value={formData.personal.alamat}
                      onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, alamat: e.target.value } })}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1">Kelurahan</label>
                      <input
                        type="text"
                        value={formData.personal.kelurahan}
                        onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, kelurahan: e.target.value } })}
                        className="w-full rounded border px-2 py-1 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1">Kecamatan</label>
                      <input
                        type="text"
                        value={formData.personal.kecamatan}
                        onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, kecamatan: e.target.value } })}
                        className="w-full rounded border px-2 py-1 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1">Kota / Kabupaten</label>
                      <input
                        type="text"
                        value={formData.personal.kabupatenKota}
                        onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, kabupatenKota: e.target.value } })}
                        className="w-full rounded border px-2 py-1 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1">No. HP / WhatsApp</label>
                      <input
                        type="text"
                        value={formData.personal.nomorHp}
                        onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, nomorHp: e.target.value } })}
                        className="w-full rounded border px-2 py-1 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB B: JASMANI */}
              {activeTab === 'B' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Berat Badan (kg)
                      </label>
                      <input
                        type="number"
                        value={formData.physical.beratBadanKg}
                        onChange={(e) => setFormData({ ...formData, physical: { ...formData.physical, beratBadanKg: parseInt(e.target.value) || 0 } })}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Tinggi Badan (cm)
                      </label>
                      <input
                        type="number"
                        value={formData.physical.tinggiBadanCm}
                        onChange={(e) => setFormData({ ...formData, physical: { ...formData.physical, tinggiBadanCm: parseInt(e.target.value) || 0 } })}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Golongan Darah
                      </label>
                      <select
                        value={formData.physical.golonganDarah}
                        onChange={(e) => setFormData({ ...formData, physical: { ...formData.physical, golonganDarah: e.target.value as any } })}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5"
                      >
                        <option value="A">Golongan A</option>
                        <option value="B">Golongan B</option>
                        <option value="AB">Golongan AB</option>
                        <option value="O">Golongan O</option>
                        <option value="Tidak Tahu">Tidak Tahu</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Riwayat Penyakit Pernah Diderita
                    </label>
                    <textarea
                      rows={2}
                      value={formData.physical.riwayatPenyakit}
                      onChange={(e) => setFormData({ ...formData, physical: { ...formData.physical, riwayatPenyakit: e.target.value } })}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Kelainan Jasmani / Kebutuhan Khusus
                    </label>
                    <input
                      type="text"
                      value={formData.physical.kelainanJasmani}
                      onChange={(e) => setFormData({ ...formData, physical: { ...formData.physical, kelainanJasmani: e.target.value } })}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5"
                    />
                  </div>
                </div>
              )}

              {/* TAB C: PENDIDIKAN SEBELUMNYA */}
              {activeTab === 'C' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Asal Sekolah (SMP / MTs)
                      </label>
                      <input
                        type="text"
                        value={formData.previousEducation.asalSekolah}
                        onChange={(e) => setFormData({ ...formData, previousEducation: { ...formData.previousEducation, asalSekolah: e.target.value } })}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Nomor Ijazah SMP
                      </label>
                      <input
                        type="text"
                        value={formData.previousEducation.nomorIjazahSmp}
                        onChange={(e) => setFormData({ ...formData, previousEducation: { ...formData.previousEducation, nomorIjazahSmp: e.target.value } })}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Diterima di Kelas (Dropdown Data Kelas)
                      </label>
                      <select
                        value={formData.previousEducation.classId || formData.previousEducation.diterimaDiKelas}
                        onChange={(e) => {
                          const val = e.target.value;
                          const foundCls = schoolClasses.find((c) => c.id === val || c.namaKelas === val);
                          if (foundCls) {
                            setFormData({
                              ...formData,
                              previousEducation: {
                                ...formData.previousEducation,
                                classId: foundCls.id,
                                diterimaDiKelas: foundCls.namaKelas,
                                jurusanPeminatan: foundCls.jurusan,
                                tahunAjaranMasuk: foundCls.tahunAjaran,
                              },
                            });
                          } else {
                            setFormData({
                              ...formData,
                              previousEducation: {
                                ...formData.previousEducation,
                                classId: undefined,
                                diterimaDiKelas: val,
                              },
                            });
                          }
                        }}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 font-bold"
                      >
                        <option value="Belum Ditentukan">-- Belum Ditentukan / Tanpa Kelas --</option>
                        {schoolClasses.map((cls) => (
                          <option key={cls.id} value={cls.id}>
                            {cls.namaKelas} ({cls.tahunAjaran}) — Wali: {cls.waliKelas}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Jurusan Peminatan (Dropdown Data Jurusan)
                      </label>
                      <select
                        value={formData.previousEducation.jurusanPeminatan}
                        onChange={(e) => setFormData({ ...formData, previousEducation: { ...formData.previousEducation, jurusanPeminatan: e.target.value as Major } })}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 font-bold"
                      >
                        {majorsList.map((m) => (
                          <option key={m.kode} value={m.kode}>
                            {m.kode} — {m.nama}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Tahun Ajaran Masuk (Dropdown Tahun Ajaran)
                      </label>
                      <select
                        value={formData.previousEducation.tahunAjaranMasuk || academicYears[0]?.tahun || '2024/2025'}
                        onChange={(e) => setFormData({ ...formData, previousEducation: { ...formData.previousEducation, tahunAjaranMasuk: e.target.value } })}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 font-bold font-mono"
                      >
                        {(academicYears.length > 0
                          ? Array.from(new Set(academicYears.map((y) => y.tahun)))
                          : ['2024/2025', '2025/2026', '2023/2024']
                        ).map((th) => (
                          <option key={th} value={th}>
                            Tahun Ajaran {th}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Tingkat Kelas Saat Diterima (Dropdown Data Tingkat)
                      </label>
                      <select
                        value={
                          schoolClasses.find(
                            (c) =>
                              c.id === formData.previousEducation.classId ||
                              c.namaKelas === formData.previousEducation.diterimaDiKelas
                          )?.tingkat ||
                          gradeLevels[0]?.tingkat ||
                          'X'
                        }
                        onChange={(e) => {
                          const selectedTingkat = e.target.value;
                          const matchedCls = schoolClasses.find(
                            (c) =>
                              c.tingkat === selectedTingkat &&
                              c.jurusan === formData.previousEducation.jurusanPeminatan
                          );
                          if (matchedCls) {
                            setFormData({
                              ...formData,
                              previousEducation: {
                                ...formData.previousEducation,
                                classId: matchedCls.id,
                                diterimaDiKelas: matchedCls.namaKelas,
                                tahunAjaranMasuk: matchedCls.tahunAjaran,
                              },
                            });
                          }
                        }}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 font-bold"
                      >
                        {(gradeLevels.length > 0
                          ? gradeLevels
                          : [
                              { id: 'GL-X', tingkat: 'X', keterangan: 'Tingkat X (Fase E)', jumlahRombel: 7 },
                              { id: 'GL-XI', tingkat: 'XI', keterangan: 'Tingkat XI (Fase F)', jumlahRombel: 7 },
                              { id: 'GL-XII', tingkat: 'XII', keterangan: 'Tingkat XII (Fase F)', jumlahRombel: 6 },
                            ]
                        ).map((gl) => (
                          <option key={gl.id} value={gl.tingkat}>
                            Tingkat {gl.tingkat} — {gl.keterangan}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Tanggal Diterima di SMA
                      </label>
                      <input
                        type="text"
                        value={formData.previousEducation.diterimaTanggal}
                        onChange={(e) => setFormData({ ...formData, previousEducation: { ...formData.previousEducation, diterimaTanggal: e.target.value } })}
                        placeholder="DD-MM-YYYY"
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB D: ORANG TUA */}
              {activeTab === 'D' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Ayah */}
                  <div className="p-4 border rounded-xl dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-800/30">
                    <h4 className="font-bold text-xs text-blue-600 dark:text-blue-400 pb-2 border-b">DATA AYAH KANDUNG</h4>
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1">Nama Lengkap Ayah</label>
                      <input
                        type="text"
                        value={formData.ayah.nama}
                        onChange={(e) => setFormData({ ...formData, ayah: { ...formData.ayah, nama: e.target.value } })}
                        className="w-full rounded border px-2.5 py-1 text-xs font-semibold"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">Tempat Lahir Ayah</label>
                        <input
                          type="text"
                          value={formData.ayah.tempatLahir}
                          onChange={(e) => setFormData({ ...formData, ayah: { ...formData.ayah, tempatLahir: e.target.value } })}
                          className="w-full rounded border px-2.5 py-1 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">Tanggal Lahir Ayah (DD-MM-YYYY)</label>
                        <input
                          type="text"
                          placeholder="DD-MM-YYYY"
                          value={formData.ayah.tanggalLahir}
                          onChange={(e) => setFormData({ ...formData, ayah: { ...formData.ayah, tanggalLahir: e.target.value } })}
                          className="w-full rounded border px-2.5 py-1 text-xs font-mono"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">Pendidikan Terakhir</label>
                        <input
                          type="text"
                          placeholder="SMA / D3 / S1 / S2"
                          value={formData.ayah.pendidikanTerakhir}
                          onChange={(e) => setFormData({ ...formData, ayah: { ...formData.ayah, pendidikanTerakhir: e.target.value } })}
                          className="w-full rounded border px-2.5 py-1 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">Pekerjaan Ayah</label>
                        <input
                          type="text"
                          value={formData.ayah.pekerjaan}
                          onChange={(e) => setFormData({ ...formData, ayah: { ...formData.ayah, pekerjaan: e.target.value } })}
                          className="w-full rounded border px-2.5 py-1 text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1">Penghasilan Bulanan Ayah</label>
                      <input
                        type="text"
                        value={formData.ayah.penghasilanBulanan}
                        onChange={(e) => setFormData({ ...formData, ayah: { ...formData.ayah, penghasilanBulanan: e.target.value } })}
                        className="w-full rounded border px-2.5 py-1 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1">Nomor HP Ayah</label>
                      <input
                        type="text"
                        value={formData.ayah.nomorHp}
                        onChange={(e) => setFormData({ ...formData, ayah: { ...formData.ayah, nomorHp: e.target.value } })}
                        className="w-full rounded border px-2.5 py-1 text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Ibu */}
                  <div className="p-4 border rounded-xl dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-800/30">
                    <h4 className="font-bold text-xs text-pink-600 dark:text-pink-400 pb-2 border-b">DATA IBU KANDUNG</h4>
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1">Nama Lengkap Ibu</label>
                      <input
                        type="text"
                        value={formData.ibu.nama}
                        onChange={(e) => setFormData({ ...formData, ibu: { ...formData.ibu, nama: e.target.value } })}
                        className="w-full rounded border px-2.5 py-1 text-xs font-semibold"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">Tempat Lahir Ibu</label>
                        <input
                          type="text"
                          value={formData.ibu.tempatLahir}
                          onChange={(e) => setFormData({ ...formData, ibu: { ...formData.ibu, tempatLahir: e.target.value } })}
                          className="w-full rounded border px-2.5 py-1 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">Tanggal Lahir Ibu (DD-MM-YYYY)</label>
                        <input
                          type="text"
                          placeholder="DD-MM-YYYY"
                          value={formData.ibu.tanggalLahir}
                          onChange={(e) => setFormData({ ...formData, ibu: { ...formData.ibu, tanggalLahir: e.target.value } })}
                          className="w-full rounded border px-2.5 py-1 text-xs font-mono"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">Pendidikan Terakhir</label>
                        <input
                          type="text"
                          placeholder="SMA / D3 / S1 / S2"
                          value={formData.ibu.pendidikanTerakhir}
                          onChange={(e) => setFormData({ ...formData, ibu: { ...formData.ibu, pendidikanTerakhir: e.target.value } })}
                          className="w-full rounded border px-2.5 py-1 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">Pekerjaan Ibu</label>
                        <input
                          type="text"
                          value={formData.ibu.pekerjaan}
                          onChange={(e) => setFormData({ ...formData, ibu: { ...formData.ibu, pekerjaan: e.target.value } })}
                          className="w-full rounded border px-2.5 py-1 text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1">Penghasilan Bulanan Ibu</label>
                      <input
                        type="text"
                        value={formData.ibu.penghasilanBulanan}
                        onChange={(e) => setFormData({ ...formData, ibu: { ...formData.ibu, penghasilanBulanan: e.target.value } })}
                        className="w-full rounded border px-2.5 py-1 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1">Nomor HP Ibu</label>
                      <input
                        type="text"
                        value={formData.ibu.nomorHp}
                        onChange={(e) => setFormData({ ...formData, ibu: { ...formData.ibu, nomorHp: e.target.value } })}
                        className="w-full rounded border px-2.5 py-1 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB E: WALI */}
              {activeTab === 'E' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="adaWali"
                      checked={formData.wali.adaWali}
                      onChange={(e) => setFormData({ ...formData, wali: { ...formData.wali, adaWali: e.target.checked } })}
                      className="h-4 w-4 rounded text-amber-500"
                    />
                    <label htmlFor="adaWali" className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                      Siswa Memiliki Wali Siswa Terdaftar (Tampil pada Bagian E di Hasil Cetak)
                    </label>
                  </div>

                  {formData.wali.adaWali && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border rounded-xl dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">Nama Lengkap Wali</label>
                        <input
                          type="text"
                          value={formData.wali.nama || ''}
                          onChange={(e) => setFormData({ ...formData, wali: { ...formData.wali, nama: e.target.value } })}
                          className="w-full rounded border px-2.5 py-1.5 text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">Hubungan Keluarga dengan Siswa</label>
                        <input
                          type="text"
                          placeholder="Contoh: Paman / Bibi / Kakak Kandung / Kakek"
                          value={formData.wali.hubunganKeluarga || ''}
                          onChange={(e) => setFormData({ ...formData, wali: { ...formData.wali, hubunganKeluarga: e.target.value } })}
                          className="w-full rounded border px-2.5 py-1.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">Pekerjaan Wali</label>
                        <input
                          type="text"
                          placeholder="Contoh: Wiraswasta / PNS / Karyawan Swasta"
                          value={formData.wali.pekerjaan || ''}
                          onChange={(e) => setFormData({ ...formData, wali: { ...formData.wali, pekerjaan: e.target.value } })}
                          className="w-full rounded border px-2.5 py-1.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">Penghasilan Bulanan Wali</label>
                        <input
                          type="text"
                          placeholder="Contoh: Rp 5.000.000 - Rp 10.000.000"
                          value={formData.wali.penghasilanBulanan || ''}
                          onChange={(e) => setFormData({ ...formData, wali: { ...formData.wali, penghasilanBulanan: e.target.value } })}
                          className="w-full rounded border px-2.5 py-1.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">Nomor HP Wali</label>
                        <input
                          type="text"
                          value={formData.wali.nomorHp || ''}
                          onChange={(e) => setFormData({ ...formData, wali: { ...formData.wali, nomorHp: e.target.value } })}
                          className="w-full rounded border px-2.5 py-1.5 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">Alamat Wali</label>
                        <input
                          type="text"
                          value={formData.wali.alamat || ''}
                          onChange={(e) => setFormData({ ...formData, wali: { ...formData.wali, alamat: e.target.value } })}
                          className="w-full rounded border px-2.5 py-1.5 text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB F: LULUS / PINDAH */}
              {activeTab === 'F' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Status Siswa Saat Ini
                      </label>
                      <select
                        value={formData.departure.status}
                        onChange={(e) => setFormData({ ...formData, departure: { ...formData.departure, status: e.target.value as StudentStatus } })}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5"
                      >
                        <option value="Aktif">Aktif</option>
                        <option value="Lulus">Lulus / Alumni</option>
                        <option value="Pindah">Pindah Sekolah</option>
                        <option value="Keluar">Keluar</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Nomor Ijazah SMA
                      </label>
                      <input
                        type="text"
                        placeholder="DN-02/M-SMA/..."
                        value={formData.departure.nomorIjazahSma || ''}
                        onChange={(e) => setFormData({ ...formData, departure: { ...formData.departure, nomorIjazahSma: e.target.value } })}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Melanjutkan ke Perguruan Tinggi / Instansi
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: ITB / UNPAD / Bekerja"
                        value={formData.departure.namaPerguruanTinggi || formData.departure.melanjutkanKe || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            departure: {
                              ...formData.departure,
                              melanjutkanKe: e.target.value,
                              namaPerguruanTinggi: e.target.value,
                            },
                          })
                        }
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Catatan Bakat & Prestasi Unggulan
                    </label>
                    <textarea
                      rows={2}
                      value={formData.departure.prestasiSiswa || ''}
                      onChange={(e) => setFormData({ ...formData, departure: { ...formData.departure, prestasiSiswa: e.target.value } })}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5"
                    />
                  </div>
                </div>
              )}

              {/* Form Footer Action */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setFormData(null);
                    setIsCreatingNew(false);
                    setEditingStudent(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shadow-sm"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Simpan ke Database</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL KEMENDIKBUD BUKU INDUK DETAIL MODAL (BAGIAN A S/D F) */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500 font-bold text-slate-950">
                  BI
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Buku Induk Siswa: {viewingStudent.personal.namaLengkap}
                  </h3>
                  <p className="text-xs text-slate-500">
                    NIS: {viewingStudent.personal.nis} · NISN: {viewingStudent.personal.nisn} · Kelas {viewingStudent.previousEducation.diterimaDiKelas}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingStudent(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation */}
            <div className="flex border-b border-slate-200 bg-slate-100/60 px-4 dark:border-slate-800 dark:bg-slate-800/60 overflow-x-auto">
              {(['A', 'B', 'C', 'D', 'E', 'F'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab
                      ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-900'
                      : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400'
                  }`}
                >
                  Bagian {tab} {tab === 'A' ? '(Pribadi)' : tab === 'B' ? '(Jasmani)' : tab === 'C' ? '(Pendidikan SMP)' : tab === 'D' ? '(Orang Tua)' : tab === 'E' ? '(Wali)' : '(Lulus/Pindah)'}
                </button>
              ))}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 text-xs text-slate-800 dark:text-slate-200">
              {activeTab === 'A' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-1 flex flex-col items-center p-3 border border-slate-200 rounded-lg dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                      <StudentAvatar
                        fotoUrl={viewingStudent.personal.fotoUrl}
                        namaLengkap={viewingStudent.personal.namaLengkap}
                        size="pas-foto"
                      />
                      <span className="mt-2 text-[10px] text-slate-500">Pas Foto Resmi 3x4</span>
                    </div>

                    <div className="md:col-span-3 grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Nomor Induk Siswa (NIS)</span>
                        <strong className="text-sm font-mono">{viewingStudent.personal.nis}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">NISN Nasional</span>
                        <strong className="text-sm font-mono">{viewingStudent.personal.nisn}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Nama Lengkap</span>
                        <strong className="text-sm">{viewingStudent.personal.namaLengkap}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Nama Panggilan</span>
                        <span>{viewingStudent.personal.namaPanggilan}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Jenis Kelamin</span>
                        <span>{viewingStudent.personal.jenisKelamin === 'L' ? 'Laki-Laki' : 'Perempuan'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Tempat, Tanggal Lahir</span>
                        <span>{viewingStudent.personal.tempatLahir}, {viewingStudent.personal.tanggalLahir}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                    <span className="text-slate-400 block text-[10px] uppercase">Alamat Lengkap</span>
                    <p className="mt-1 font-medium">{viewingStudent.personal.alamat}</p>
                    <p className="text-slate-500">
                      Kel. {viewingStudent.personal.kelurahan}, Kec. {viewingStudent.personal.kecamatan}, {viewingStudent.personal.kabupatenKota}, {viewingStudent.personal.provinsi}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'B' && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <span className="text-slate-400 block text-[10px]">Berat Badan</span>
                    <strong className="text-xl">{viewingStudent.physical.beratBadanKg} kg</strong>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <span className="text-slate-400 block text-[10px]">Tinggi Badan</span>
                    <strong className="text-xl">{viewingStudent.physical.tinggiBadanCm} cm</strong>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <span className="text-slate-400 block text-[10px]">Golongan Darah</span>
                    <strong className="text-xl text-amber-600">Golongan {viewingStudent.physical.golonganDarah}</strong>
                  </div>
                </div>
              )}

              {activeTab === 'C' && (
                <div className="space-y-3">
                  <p><strong>Asal Sekolah:</strong> {viewingStudent.previousEducation.asalSekolah}</p>
                  <p><strong>No. Ijazah SMP:</strong> {viewingStudent.previousEducation.nomorIjazahSmp}</p>
                  <p><strong>Diterima di Kelas:</strong> {viewingStudent.previousEducation.diterimaDiKelas} ({viewingStudent.previousEducation.jurusanPeminatan})</p>
                  <p><strong>Tanggal Diterima:</strong> {viewingStudent.previousEducation.diterimaTanggal}</p>
                </div>
              )}

              {activeTab === 'D' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg">
                    <h5 className="font-bold text-blue-600 mb-2">Ayah Kandung:</h5>
                    <p>Nama: <strong>{viewingStudent.ayah.nama}</strong></p>
                    <p>Pekerjaan: {viewingStudent.ayah.pekerjaan}</p>
                    <p>Penghasilan: {viewingStudent.ayah.penghasilanBulanan}</p>
                    <p>No. HP: {viewingStudent.ayah.nomorHp}</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h5 className="font-bold text-pink-600 mb-2">Ibu Kandung:</h5>
                    <p>Nama: <strong>{viewingStudent.ibu.nama}</strong></p>
                    <p>Pekerjaan: {viewingStudent.ibu.pekerjaan}</p>
                    <p>Penghasilan: {viewingStudent.ibu.penghasilanBulanan}</p>
                    <p>No. HP: {viewingStudent.ibu.nomorHp}</p>
                  </div>
                </div>
              )}

              {activeTab === 'E' && (
                <div>
                  {viewingStudent.wali.adaWali ? (
                    <div className="p-4 border rounded-lg">
                      <p>Nama Wali: <strong>{viewingStudent.wali.nama}</strong></p>
                      <p>Hubungan: {viewingStudent.wali.hubunganKeluarga}</p>
                      <p>Pekerjaan: {viewingStudent.wali.pekerjaan}</p>
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">Tinggal langsung dengan orang tua kandung (tidak ada wali).</p>
                  )}
                </div>
              )}

              {activeTab === 'F' && (
                <div className="space-y-3">
                  <p>Status: <strong className="uppercase">{viewingStudent.departure.status}</strong></p>
                  {viewingStudent.departure.status === 'Lulus' && (
                    <p>Melanjutkan Ke: <strong>{viewingStudent.departure.namaPerguruanTinggi}</strong></p>
                  )}
                  <p>Prestasi: {viewingStudent.departure.prestasiSiswa || '-'}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-200 p-4 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(viewingStudent)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-500 shadow-sm"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit Siswa Ini</span>
                </button>
                <button
                  onClick={() => onTriggerSinglePrint(viewingStudent)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Cetak Lembar Resmi</span>
                </button>
              </div>
              <button
                onClick={() => setViewingStudent(null)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IN-APP DELETE CONFIRMATION MODAL (INDIVIDUAL & BULK) */}
      {deleteConfirmModal && deleteConfirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-rose-200 bg-white p-6 shadow-2xl dark:border-rose-900/50 dark:bg-slate-900 space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {deleteConfirmModal.ids.length === 1
                      ? 'Konfirmasi Hapus Data Siswa'
                      : `Konfirmasi Hapus Massal (${deleteConfirmModal.ids.length} Siswa)`}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Tindakan ini akan menghapus data dari daftar Buku Induk aktif
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeleteConfirmModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="text-xs text-slate-700 dark:text-slate-300 space-y-2">
              <p>
                Apakah Anda yakin ingin menghapus data Buku Induk untuk{' '}
                <strong>{deleteConfirmModal.ids.length} siswa</strong> berikut?
              </p>
              <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-2.5 space-y-1">
                {deleteConfirmModal.names.map((name, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 flex-shrink-0" />
                    <span>{name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteConfirmModal(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteDeleteConfirm}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-rose-600 text-white hover:bg-rose-500 shadow-sm cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Ya, Hapus Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IN-APP BULK UBAH KELAS MODAL */}
      {bulkClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Ubah Kelas Massal ({selectedStudentIds.length} Siswa Terpilih)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Otomatis menyesuaikan Kelas, Jurusan Peminatan, dan Tahun Ajaran baru
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBulkClassModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteBulkAssignClass} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Pilih Kelas / Rombel Tujuan (dari Master Data Kelas) *
                </label>
                <select
                  value={targetBulkClassId}
                  onChange={(e) => setTargetBulkClassId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                >
                  {schoolClasses.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.namaKelas} — Jurusan {cls.jurusan} · TA {cls.tahunAjaran} (Wali: {cls.waliKelas})
                    </option>
                  ))}
                </select>
              </div>

              {(() => {
                const chosen = schoolClasses.find((c) => c.id === targetBulkClassId);
                if (!chosen) return null;
                return (
                  <div className="rounded-xl border border-blue-200 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-950/30 p-3.5 space-y-1.5">
                    <div className="text-[11px] font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider">
                      Ringkasan Penyesuaian Otomatis:
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-500 block">Kelas Baru:</span>
                        <strong className="text-slate-900 dark:text-white">{chosen.namaKelas}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">ID Kelas Unik:</span>
                        <strong className="font-mono text-slate-900 dark:text-white">{chosen.id}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Jurusan Peminatan:</span>
                        <strong className="text-amber-700 dark:text-amber-400">{chosen.jurusan}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Tahun Ajaran:</span>
                        <strong className="font-mono text-slate-900 dark:text-white">{chosen.tahunAjaran}</strong>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setBulkClassModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-500 shadow-sm cursor-pointer"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Terapkan ke {selectedStudentIds.length} Siswa</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
