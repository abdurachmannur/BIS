import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { FilamentNavbar } from './components/layout/FilamentNavbar';
import { FilamentSidebar, ActiveNavKey } from './components/layout/FilamentSidebar';
import { FilamentLoginView } from './components/auth/FilamentLoginView';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { MasterSetupStepsView, MasterStepNumber } from './components/phase1_step1_4/MasterSetupStepsView';
import { StudentBookMasterView } from './components/phase2/StudentBookMasterView';
import { AcademicGradeView } from './components/phase3/AcademicGradeView';
import { AttendanceView } from './components/phase1/AttendanceView';
import { OfficialPrintPreview } from './components/phase4/OfficialPrintPreview';
import { ExcelImportCenterModal, GradeImportPayloadItem } from './components/import/ExcelImportCenterModal';
import { SchoolProfileSettingsView } from './components/settings/SchoolProfileSettingsView';
import {
  SettingsAndBackupView,
  FullAppStoreBackupPayload,
  ClearableDataKey,
} from './components/phase5/SettingsAndBackupView';
import {
  MOCK_STUDENTS,
  MOCK_DAILY_ATTENDANCE,
  DEFAULT_SCHOOL_PROFILE,
  DEFAULT_ACADEMIC_YEARS,
  DEFAULT_TEACHERS,
  DEFAULT_DEPARTMENTS,
  DEFAULT_GRADE_LEVELS,
  DEFAULT_CLASSES,
  DEFAULT_MASTER_SUBJECTS,
} from './data/mock-data';
import {
  StudentFullRecord,
  DailyAttendanceRecord,
  SchoolProfile,
  AuthUser,
  AcademicYearRecord,
  TeacherRecord,
  DepartmentRecord,
  GradeLevelRecord,
  SchoolClassRecord,
  MasterSubjectRecord,
  UIColorMode,
  UIAccentColor,
} from './types/buku-induk';

const STORAGE_KEY_STUDENTS = 'buku_induk_students_v2';
const STORAGE_KEY_ATTENDANCE = 'buku_induk_attendance_v2';
const STORAGE_KEY_SCHOOL = 'buku_induk_school_profile_v2';
const STORAGE_KEY_AUTH = 'buku_induk_auth_user_v3';
const STORAGE_KEY_TOKEN = 'buku_induk_jwt_token_v1';
const STORAGE_KEY_ACADEMIC_YEARS = 'buku_induk_academic_years_v2';
const STORAGE_KEY_TEACHERS = 'buku_induk_teachers_v2';
const STORAGE_KEY_DEPARTMENTS = 'buku_induk_departments_v2';
const STORAGE_KEY_GRADE_LEVELS = 'buku_induk_grade_levels_v2';
const STORAGE_KEY_CLASSES = 'buku_induk_classes_v2';
const STORAGE_KEY_MASTER_SUBJECTS = 'buku_induk_master_subjects_v2';
const STORAGE_KEY_COLOR_MODE = 'buku_induk_color_mode_v1';
const STORAGE_KEY_ACCENT_COLOR = 'buku_induk_accent_color_v1';

const PAGE_TITLES: Record<ActiveNavKey, string> = {
  dashboard: 'Dashboard Buku Induk Siswa',
  step5_siswa: 'Data Buku Induk Siswa',
  step6_nilai: 'Nilai Rapor Semester 1 – 6',
  step7_kehadiran: 'Presensi Harian Siswa',
  cetak_dokumen_gabungan: 'Cetak Rapor & Buku Induk PDF',
  impor_massal_center: 'Impor Excel & ZIP Foto',
  step1_tahun_ajaran: 'Master Data Tahun Ajaran',
  step2_guru: 'Master Data Guru & Wali Kelas',
  step2_jurusan: 'Master Data Jurusan',
  step3_tingkat: 'Master Data Tingkat Kelas',
  step4_kelas: 'Master Data Rombongan Belajar (Kelas)',
  backup_restore_db: 'Backup, Restore & Reset Database',
  pengaturan_profil_sekolah: 'Pengaturan Sistem & Akun',
};

export default function App() {
  const [authToken, setAuthToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_TOKEN);
    } catch {
      return null;
    }
  });

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const token = localStorage.getItem(STORAGE_KEY_TOKEN);
      const savedUser = localStorage.getItem(STORAGE_KEY_AUTH);
      if (token && savedUser) return JSON.parse(savedUser);
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  // UI Theme & Corporate Accent State
  const [colorMode, setColorMode] = useState<UIColorMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COLOR_MODE);
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {
      // ignore
    }
    return 'light';
  });

  const [accentColor, setAccentColor] = useState<UIAccentColor>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACCENT_COLOR);
      if (
        saved === 'royal' ||
        saved === 'emerald' ||
        saved === 'teal' ||
        saved === 'indigo' ||
        saved === 'slate'
      ) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'royal';
  });

  // Sync colorMode (.dark class on <html>) and accentColor (data-accent on <html>)
  useEffect(() => {
    const root = document.documentElement;
    if (colorMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_KEY_COLOR_MODE, colorMode);
    } catch {
      // ignore
    }
  }, [colorMode]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-accent', accentColor);
    try {
      localStorage.setItem(STORAGE_KEY_ACCENT_COLOR, accentColor);
    } catch {
      // ignore
    }
  }, [accentColor]);

  const [activeNav, setActiveNav] = useState<ActiveNavKey>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isHydratedFromServer, setIsHydratedFromServer] = useState<boolean>(false);

  // Persistent School Profile State
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SCHOOL);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_SCHOOL_PROFILE;
  });

  // Master Setup Records (Steps 1 - 5)
  const [academicYears, setAcademicYears] = useState<AcademicYearRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACADEMIC_YEARS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_ACADEMIC_YEARS;
  });

  const [teachers, setTeachers] = useState<TeacherRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TEACHERS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_TEACHERS;
  });

  const [departments, setDepartments] = useState<DepartmentRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DEPARTMENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_DEPARTMENTS;
  });

  const [gradeLevels, setGradeLevels] = useState<GradeLevelRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_GRADE_LEVELS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_GRADE_LEVELS;
  });

  const [schoolClasses, setSchoolClasses] = useState<SchoolClassRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CLASSES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_CLASSES;
  });

  const [masterSubjects, setMasterSubjects] = useState<MasterSubjectRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MASTER_SUBJECTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_MASTER_SUBJECTS;
  });

  // Students & Attendance Records
  const [students, setStudents] = useState<StudentFullRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STUDENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return MOCK_STUDENTS;
  });

  const [attendanceRecords, setAttendanceRecords] = useState<DailyAttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ATTENDANCE);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return MOCK_DAILY_ATTENDANCE;
  });

  // Print Preview state
  const [previewStudentId, setPreviewStudentId] = useState<string | undefined>(MOCK_STUDENTS[0]?.id);
  const [batchPrintStudentIds, setBatchPrintStudentIds] = useState<string[]>([]);

  // Floating Toast Notification state
  const [toast, setToast] = useState<{
    title: string;
    body: string;
    type: 'success' | 'info' | 'warning' | 'danger';
  } | null>(null);

  const showToast = (
    title: string,
    body: string,
    type: 'success' | 'info' | 'warning' | 'danger' = 'success'
  ) => {
    setToast({ title, body, type });
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  };

  // Load public school profile on initial mount
  useEffect(() => {
    let isCancelled = false;
    async function fetchPublicProfile() {
      try {
        const res = await fetch('/api/public/school-profile');
        if (!res.ok) return;
        const data = await res.json();
        if (!isCancelled && data.schoolProfile) {
          setSchoolProfile((prev) => ({
            ...prev,
            ...data.schoolProfile,
          }));
        }
      } catch {
        // Ignore network error before server hydration
      }
    }
    fetchPublicProfile();
    return () => {
      isCancelled = true;
    };
  }, []);

  // Sync to LocalStorage cache
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ATTENDANCE, JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SCHOOL, JSON.stringify(schoolProfile));
  }, [schoolProfile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ACADEMIC_YEARS, JSON.stringify(academicYears));
  }, [academicYears]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TEACHERS, JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DEPARTMENTS, JSON.stringify(departments));
  }, [departments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_GRADE_LEVELS, JSON.stringify(gradeLevels));
  }, [gradeLevels]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CLASSES, JSON.stringify(schoolClasses));
  }, [schoolClasses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MASTER_SUBJECTS, JSON.stringify(masterSubjects));
  }, [masterSubjects]);

  useEffect(() => {
    if (currentUser && authToken) {
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(currentUser));
      localStorage.setItem(STORAGE_KEY_TOKEN, authToken);
    } else {
      localStorage.removeItem(STORAGE_KEY_AUTH);
      localStorage.removeItem(STORAGE_KEY_TOKEN);
    }
  }, [currentUser, authToken]);

  // 1. Ambil data awal dari GET /api/data saat user sudah login
  useEffect(() => {
    if (!authToken || !currentUser) {
      setIsHydratedFromServer(false);
      return;
    }

    let isCancelled = false;

    async function loadFromSQLite() {
      try {
        const res = await fetch('/api/data', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (res.status === 401) {
          if (!isCancelled) {
            setAuthToken(null);
            setCurrentUser(null);
            showToast('Sesi Berakhir', 'Silakan masuk kembali.', 'warning');
          }
          return;
        }

        if (!res.ok) {
          throw new Error('Gagal memuat data');
        }

        const result = await res.json();
        if (isCancelled) return;

        const serverData = result.data || {};

        if (result.isEmpty) {
          await fetch('/api/data', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              data: {
                students,
                attendanceRecords,
                schoolProfile,
                academicYears,
                teachers,
                departments,
                gradeLevels,
                schoolClasses,
                masterSubjects,
              },
            }),
          });
        } else {
          if (Array.isArray(serverData.students)) setStudents(serverData.students);
          if (Array.isArray(serverData.attendanceRecords)) setAttendanceRecords(serverData.attendanceRecords);
          if (serverData.schoolProfile) setSchoolProfile(serverData.schoolProfile);
          if (Array.isArray(serverData.academicYears)) setAcademicYears(serverData.academicYears);
          if (Array.isArray(serverData.teachers)) setTeachers(serverData.teachers);
          if (Array.isArray(serverData.departments)) setDepartments(serverData.departments);
          if (Array.isArray(serverData.gradeLevels)) setGradeLevels(serverData.gradeLevels);
          if (Array.isArray(serverData.schoolClasses)) setSchoolClasses(serverData.schoolClasses);
          if (Array.isArray(serverData.masterSubjects)) setMasterSubjects(serverData.masterSubjects);
        }

        setIsHydratedFromServer(true);
      } catch (err) {
        console.error('Gagal memuat GET /api/data:', err);
        if (!isCancelled) {
          setIsHydratedFromServer(true);
        }
      }
    }

    loadFromSQLite();

    return () => {
      isCancelled = true;
    };
  }, [authToken]);

  // 2. Simpan perubahan ke POST /api/data secara otomatis
  useEffect(() => {
    if (!authToken || !currentUser || !isHydratedFromServer) return;

    const timer = setTimeout(async () => {
      try {
        await fetch('/api/data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            data: {
              students,
              attendanceRecords,
              schoolProfile,
              academicYears,
              teachers,
              departments,
              gradeLevels,
              schoolClasses,
              masterSubjects,
            },
          }),
        });
      } catch (err) {
        console.error('Gagal menyimpan POST /api/data:', err);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [
    authToken,
    currentUser,
    isHydratedFromServer,
    students,
    attendanceRecords,
    schoolProfile,
    academicYears,
    teachers,
    departments,
    gradeLevels,
    schoolClasses,
    masterSubjects,
  ]);

  // Student CRUD Handlers
  const handleAddStudent = (newStudent: StudentFullRecord) => {
    setStudents((prev) => [newStudent, ...prev]);
  };

  const handleUpdateStudent = (updatedStudent: StudentFullRecord) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
    );
  };

  const handleDeleteStudent = (studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
  };

  const handleBulkDeleteStudents = (studentIds: string[]) => {
    setStudents((prev) => prev.filter((s) => !studentIds.includes(s.id)));
  };

  const handleBulkAssignClass = (studentIds: string[], targetClass: SchoolClassRecord) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (!studentIds.includes(s.id)) return s;
        return {
          ...s,
          previousEducation: {
            ...s.previousEducation,
            diterimaDiKelas: targetClass.namaKelas,
            classId: targetClass.id,
            jurusanPeminatan: targetClass.jurusan,
            tahunAjaranMasuk: targetClass.tahunAjaran,
          },
        };
      })
    );
  };

  const handleUnassignStudentsFromClass = (deletedClass: SchoolClassRecord) => {
    setStudents((prev) =>
      prev.map((s) => {
        const matchesId = s.previousEducation.classId && s.previousEducation.classId === deletedClass.id;
        const matchesName =
          !s.previousEducation.classId && s.previousEducation.diterimaDiKelas === deletedClass.namaKelas;
        if (matchesId || matchesName) {
          return {
            ...s,
            previousEducation: {
              ...s.previousEducation,
              classId: undefined,
              diterimaDiKelas: 'Belum Ditentukan',
            },
          };
        }
        return s;
      })
    );
  };

  // Backup, Restore & Selective/Complete Clear Handlers
  const handleRestoreFullPayload = (payload: FullAppStoreBackupPayload) => {
    if (Array.isArray(payload.students)) setStudents(payload.students);
    if (Array.isArray(payload.attendanceRecords)) setAttendanceRecords(payload.attendanceRecords);
    if (payload.schoolProfile) setSchoolProfile(payload.schoolProfile);
    if (Array.isArray(payload.academicYears)) setAcademicYears(payload.academicYears);
    if (Array.isArray(payload.teachers)) setTeachers(payload.teachers);
    if (Array.isArray(payload.departments)) setDepartments(payload.departments);
    if (Array.isArray(payload.gradeLevels)) setGradeLevels(payload.gradeLevels);
    if (Array.isArray(payload.schoolClasses)) setSchoolClasses(payload.schoolClasses);
    if (Array.isArray(payload.masterSubjects)) setMasterSubjects(payload.masterSubjects);
  };

  const handleClearSelectedCollections = (keys: ClearableDataKey[]) => {
    if (keys.includes('academicYears')) setAcademicYears([]);
    if (keys.includes('teachers')) setTeachers([]);
    if (keys.includes('departments')) setDepartments([]);
    if (keys.includes('gradeLevels')) setGradeLevels([]);
    if (keys.includes('schoolClasses')) setSchoolClasses([]);
    if (keys.includes('masterSubjects')) setMasterSubjects([]);
    if (keys.includes('students')) setStudents([]);
    if (keys.includes('attendanceRecords')) setAttendanceRecords([]);
  };

  const handleClearAllToZero = () => {
    setAcademicYears([]);
    setTeachers([]);
    setDepartments([]);
    setGradeLevels([]);
    setSchoolClasses([]);
    setMasterSubjects([]);
    setStudents([]);
    setAttendanceRecords([]);
  };

  const handleResetToDefault = () => {
    setSchoolProfile(DEFAULT_SCHOOL_PROFILE);
    setAcademicYears(DEFAULT_ACADEMIC_YEARS);
    setTeachers(DEFAULT_TEACHERS);
    setDepartments(DEFAULT_DEPARTMENTS);
    setGradeLevels(DEFAULT_GRADE_LEVELS);
    setSchoolClasses(DEFAULT_CLASSES);
    setMasterSubjects(DEFAULT_MASTER_SUBJECTS);
    setStudents(MOCK_STUDENTS);
    setAttendanceRecords(MOCK_DAILY_ATTENDANCE);
  };

  const handleSinglePrint = (student: StudentFullRecord) => {
    setPreviewStudentId(student.id);
    setBatchPrintStudentIds([]);
    setActiveNav('cetak_dokumen_gabungan');
  };

  const handleBulkPrint = (studentIds: string[]) => {
    if (studentIds.length > 0) {
      setPreviewStudentId(studentIds[0]);
      setBatchPrintStudentIds(studentIds);
      setActiveNav('cetak_dokumen_gabungan');
    }
  };

  // Authentic Excel (.xlsx) Export with Complete 49 Columns (Bagian A s/d F)
  const handleExportExcel = (selectedIds?: string[]) => {
    const targetList =
      selectedIds && selectedIds.length > 0
        ? students.filter((s) => selectedIds.includes(s.id))
        : students;

    const wb = XLSX.utils.book_new();

    const headers = [
      'NIS', 'NISN', 'Nama_Lengkap', 'Nama_Panggilan', 'Jenis_Kelamin',
      'Tempat_Lahir', 'Tanggal_Lahir_DD_MM_YYYY', 'Agama', 'Kewarganegaraan',
      'Anak_Ke', 'Jumlah_Saudara_Kandung', 'Bahasa_Sehari_Hari',
      'Alamat', 'Kelurahan', 'Kecamatan', 'Kota_Kabupaten', 'Tinggal_Bersama', 'No_HP_Siswa',
      'Berat_Badan_Kg', 'Tinggi_Badan_Cm', 'Golongan_Darah', 'Riwayat_Penyakit',
      'Asal_SMP', 'No_Ijazah_SMP', 'Diterima_Di_Kelas', 'Jurusan_Peminatan', 'Tahun_Ajaran_Masuk', 'Tanggal_Diterima',
      'Nama_Ayah', 'Tempat_Lahir_Ayah', 'Tanggal_Lahir_Ayah', 'Pendidikan_Ayah', 'Pekerjaan_Ayah', 'Penghasilan_Ayah', 'No_HP_Ayah',
      'Nama_Ibu', 'Tempat_Lahir_Ibu', 'Tanggal_Lahir_Ibu', 'Pendidikan_Ibu', 'Pekerjaan_Ibu', 'Penghasilan_Ibu', 'No_HP_Ibu',
      'Nama_Wali', 'Hubungan_Keluarga_Wali', 'Pekerjaan_Wali', 'Penghasilan_Wali',
      'Status_Siswa', 'No_Ijazah_SMA', 'Melanjutkan_Ke',
    ];

    const dataRows = targetList.map((s) => [
      s.personal.nis,
      s.personal.nisn,
      s.personal.namaLengkap,
      s.personal.namaPanggilan,
      s.personal.jenisKelamin,
      s.personal.tempatLahir,
      s.personal.tanggalLahir,
      s.personal.agama,
      s.personal.kewarganegaraan || 'WNI',
      s.personal.anakKe ?? 1,
      s.personal.jumlahSaudaraKandung ?? 0,
      s.personal.bahasaKeseharian || 'Bahasa Indonesia',
      s.personal.alamat,
      s.personal.kelurahan,
      s.personal.kecamatan,
      s.personal.kabupatenKota,
      s.personal.tinggalDengan || 'Orang Tua',
      s.personal.nomorHp,
      s.physical.beratBadanKg,
      s.physical.tinggiBadanCm,
      s.physical.golonganDarah,
      s.physical.riwayatPenyakit || 'Tidak Ada',
      s.previousEducation.asalSekolah,
      s.previousEducation.nomorIjazahSmp,
      s.previousEducation.diterimaDiKelas,
      s.previousEducation.jurusanPeminatan,
      s.previousEducation.tahunAjaranMasuk || '2024/2025',
      s.previousEducation.diterimaTanggal,
      s.ayah.nama,
      s.ayah.tempatLahir || '',
      s.ayah.tanggalLahir || '',
      s.ayah.pendidikanTerakhir || '',
      s.ayah.pekerjaan,
      s.ayah.penghasilanBulanan || '',
      s.ayah.nomorHp || '',
      s.ibu.nama,
      s.ibu.tempatLahir || '',
      s.ibu.tanggalLahir || '',
      s.ibu.pendidikanTerakhir || '',
      s.ibu.pekerjaan,
      s.ibu.penghasilanBulanan || '',
      s.ibu.nomorHp || '',
      s.wali.adaWali ? (s.wali.nama || '') : '',
      s.wali.adaWali ? (s.wali.hubunganKeluarga || '') : '',
      s.wali.adaWali ? (s.wali.pekerjaan || '') : '',
      s.wali.adaWali ? (s.wali.penghasilanBulanan || '') : '',
      s.departure.status,
      s.departure.nomorIjazahSma || '',
      s.departure.namaPerguruanTinggi || s.departure.melanjutkanKe || '',
    ]);

    const wsData = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
    wsData['!cols'] = headers.map((h) => ({ wch: Math.max(18, h.length + 4) }));
    XLSX.utils.book_append_sheet(wb, wsData, 'DATA_SISWA_BUKU_INDUK');

    const guideHeaders = ['BAGIAN BUKU INDUK', 'FORMAT STANDAR', 'KETERANGAN RESMI'];
    const guideRows = [
      ['BAGIAN A (Pribadi)', '18 Kolom Lengkap', 'NIS, NISN, Nama, TTL, Agama, Kewarganegaraan, Anak Ke, Saudara, Bahasa, Alamat, Tinggal Bersama, HP'],
      ['BAGIAN B (Jasmani)', '4 Kolom Lengkap', 'Berat Badan (kg), Tinggi Badan (cm), Golongan Darah, Riwayat Penyakit'],
      ['BAGIAN C (Pendidikan SMP)', '6 Kolom Lengkap', 'Asal SMP, Nomor Ijazah SMP, Diterima di Kelas, Jurusan, Tahun Ajaran Masuk, Tanggal Diterima'],
      ['BAGIAN D (Orang Tua)', '14 Kolom Lengkap', 'Nama, Tempat/Tgl Lahir, Pendidikan, Pekerjaan, Penghasilan, No. HP Ayah & Ibu'],
      ['BAGIAN E (Wali Siswa)', '4 Kolom Lengkap', 'Nama Wali, Hubungan Keluarga, Pekerjaan Wali, Penghasilan Wali'],
      ['BAGIAN F (Kelulusan)', '3 Kolom Lengkap', 'Status Siswa, Nomor Ijazah SMA, Melanjutkan Ke Perguruan Tinggi'],
    ];
    const wsGuide = XLSX.utils.aoa_to_sheet([guideHeaders, ...guideRows]);
    wsGuide['!cols'] = [{ wch: 26 }, { wch: 26 }, { wch: 68 }];
    XLSX.utils.book_append_sheet(wb, wsGuide, 'PETUNJUK_DAN_LEGENDA');

    const filename = `Buku_Induk_SMA_${schoolProfile.namaSekolah.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, filename);

    showToast(
      'Ekspor Excel (.xlsx) Berhasil',
      `${targetList.length} data siswa berhasil diekspor ke ${filename}.`,
      'success'
    );
  };

  // Excel Batch Import Handlers
  const handleImportStudents = (importedStudents: StudentFullRecord[]) => {
    setStudents((prev) => [...importedStudents, ...prev]);
  };

  const handleImportGrades = (updates: GradeImportPayloadItem[]) => {
    setStudents((prev) =>
      prev.map((student) => {
        const studentMatches = updates.filter((u) => u.nis === student.personal.nis);
        if (studentMatches.length === 0) return student;

        const nextAcademicRecords = { ...student.academicRecords };

        studentMatches.forEach((match) => {
          const semKey = match.semester as 1 | 2 | 3 | 4 | 5 | 6;
          const existingSem = nextAcademicRecords[semKey];
          const defaultTingkat = semKey <= 2 ? 'X' : semKey <= 4 ? 'XI' : 'XII';

          nextAcademicRecords[semKey] = {
            semester: semKey,
            tahunAjaran: match.tahunAjaran || existingSem?.tahunAjaran || student.previousEducation.tahunAjaranMasuk || '2024/2025',
            tingkatKelas: existingSem?.tingkatKelas || defaultTingkat,
            kelas: match.kelas || existingSem?.kelas || student.previousEducation.diterimaDiKelas,
            grades: match.grades,
            extracurriculars:
              match.extracurriculars && match.extracurriculars.length > 0
                ? match.extracurriculars
                : [
                    {
                      namaKegiatan: match.ekskul || 'KEPRAMUKAAN',
                      predikat: 'Sangat Baik',
                      keterangan: 'Aktif mengikuti kegiatan ekstrakurikuler semester ini.',
                    },
                  ],
            attendance: match.attendance,
            catatanWaliKelas: existingSem?.catatanWaliKelas || 'Pertahankan prestasi belajar dan semangat disiplin.',
            keteranganSemester: match.keteranganSemester ?? existingSem?.keteranganSemester ?? '',
            tanggalRapor: match.tanggalRapor ?? existingSem?.tanggalRapor ?? '',
            statusKenaikanKelulusan: semKey % 2 === 0 ? 'Naik Kelas' : undefined,
          };
        });

        return {
          ...student,
          academicRecords: nextAcademicRecords,
        };
      })
    );
  };

  const handleImportPhotosZip = (_matchedCount: number) => {
    // Handled via notification in ExcelImportCenterModal
  };

  const mapStepToNav = (step: MasterStepNumber) => {
    if (step === 1) setActiveNav('step1_tahun_ajaran');
    if (step === 2) setActiveNav('step2_guru');
    if (step === 3) setActiveNav('step2_jurusan');
    if (step === 4) setActiveNav('step3_tingkat');
    if (step === 5) setActiveNav('step4_kelas');
  };

  const handleLogout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    setIsHydratedFromServer(false);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_AUTH);
  };

  if (!currentUser || !authToken) {
    return (
      <FilamentLoginView
        schoolProfile={schoolProfile}
        onLoginSuccess={(user, token) => {
          localStorage.setItem(STORAGE_KEY_TOKEN, token);
          localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(user));
          setAuthToken(token);
          setCurrentUser(user);
          showToast('Berhasil Masuk', `Selamat datang, ${user.namaLengkap}.`, 'success');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased transition-colors">
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Ant Design Pro Dark Navy (#001529), Fixed Width w-64 */}
        <FilamentSidebar
          activeNav={activeNav}
          onSelectNav={(key) => {
            if (key === 'impor_massal_center') {
              setIsImportModalOpen(true);
            } else {
              setActiveNav(key);
            }
          }}
          isOpen={sidebarOpen}
          onCloseMobile={() => setSidebarOpen(false)}
          schoolProfile={schoolProfile}
        />

        {/* Main Workspace Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#f0f2f5] dark:bg-slate-950 transition-colors">
          {/* Topbar with Page Title, Theme & 5 Corporate Accent Switcher, User Profile + Keluar */}
          <FilamentNavbar
            pageTitle={PAGE_TITLES[activeNav] || 'Buku Induk Siswa'}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            currentUser={currentUser}
            onLogout={handleLogout}
            colorMode={colorMode}
            onChangeColorMode={setColorMode}
            accentColor={accentColor}
            onChangeAccentColor={setAccentColor}
          />

          {/* Main Page Content */}
          <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full">
            {activeNav === 'dashboard' && (
              <DashboardOverview
                students={students}
                attendanceRecords={attendanceRecords}
                schoolProfile={schoolProfile}
                classes={schoolClasses}
                onNavigate={(key) => setActiveNav(key)}
                onOpenImportModal={() => setIsImportModalOpen(true)}
              />
            )}

            {activeNav === 'step1_tahun_ajaran' && (
              <MasterSetupStepsView
                currentStep={1}
                onSelectStep={mapStepToNav}
                academicYears={academicYears}
                onUpdateAcademicYears={setAcademicYears}
                teachers={teachers}
                onUpdateTeachers={setTeachers}
                departments={departments}
                onUpdateDepartments={setDepartments}
                gradeLevels={gradeLevels}
                onUpdateGradeLevels={setGradeLevels}
                schoolClasses={schoolClasses}
                onUpdateSchoolClasses={setSchoolClasses}
                students={students}
                onUnassignStudentsFromClass={handleUnassignStudentsFromClass}
                onNavigateToNext={() => setActiveNav('step2_guru')}
                onShowNotification={showToast}
              />
            )}

            {activeNav === 'step2_guru' && (
              <MasterSetupStepsView
                currentStep={2}
                onSelectStep={mapStepToNav}
                academicYears={academicYears}
                onUpdateAcademicYears={setAcademicYears}
                teachers={teachers}
                onUpdateTeachers={setTeachers}
                departments={departments}
                onUpdateDepartments={setDepartments}
                gradeLevels={gradeLevels}
                onUpdateGradeLevels={setGradeLevels}
                schoolClasses={schoolClasses}
                onUpdateSchoolClasses={setSchoolClasses}
                students={students}
                onUnassignStudentsFromClass={handleUnassignStudentsFromClass}
                onNavigateToNext={() => setActiveNav('step2_jurusan')}
                onShowNotification={showToast}
              />
            )}

            {activeNav === 'step2_jurusan' && (
              <MasterSetupStepsView
                currentStep={3}
                onSelectStep={mapStepToNav}
                academicYears={academicYears}
                onUpdateAcademicYears={setAcademicYears}
                teachers={teachers}
                onUpdateTeachers={setTeachers}
                departments={departments}
                onUpdateDepartments={setDepartments}
                gradeLevels={gradeLevels}
                onUpdateGradeLevels={setGradeLevels}
                schoolClasses={schoolClasses}
                onUpdateSchoolClasses={setSchoolClasses}
                students={students}
                onUnassignStudentsFromClass={handleUnassignStudentsFromClass}
                onNavigateToNext={() => setActiveNav('step3_tingkat')}
                onShowNotification={showToast}
              />
            )}

            {activeNav === 'step3_tingkat' && (
              <MasterSetupStepsView
                currentStep={4}
                onSelectStep={mapStepToNav}
                academicYears={academicYears}
                onUpdateAcademicYears={setAcademicYears}
                teachers={teachers}
                onUpdateTeachers={setTeachers}
                departments={departments}
                onUpdateDepartments={setDepartments}
                gradeLevels={gradeLevels}
                onUpdateGradeLevels={setGradeLevels}
                schoolClasses={schoolClasses}
                onUpdateSchoolClasses={setSchoolClasses}
                students={students}
                onUnassignStudentsFromClass={handleUnassignStudentsFromClass}
                onNavigateToNext={() => setActiveNav('step4_kelas')}
                onShowNotification={showToast}
              />
            )}

            {activeNav === 'step4_kelas' && (
              <MasterSetupStepsView
                currentStep={5}
                onSelectStep={mapStepToNav}
                academicYears={academicYears}
                onUpdateAcademicYears={setAcademicYears}
                teachers={teachers}
                onUpdateTeachers={setTeachers}
                departments={departments}
                onUpdateDepartments={setDepartments}
                gradeLevels={gradeLevels}
                onUpdateGradeLevels={setGradeLevels}
                schoolClasses={schoolClasses}
                onUpdateSchoolClasses={setSchoolClasses}
                students={students}
                onUnassignStudentsFromClass={handleUnassignStudentsFromClass}
                onNavigateToNext={() => setActiveNav('step5_siswa')}
                onShowNotification={showToast}
              />
            )}

            {activeNav === 'step5_siswa' && (
              <StudentBookMasterView
                students={students}
                academicYears={academicYears}
                departments={departments}
                gradeLevels={gradeLevels}
                schoolClasses={schoolClasses}
                onAddStudent={handleAddStudent}
                onUpdateStudent={handleUpdateStudent}
                onDeleteStudent={handleDeleteStudent}
                onBulkDeleteStudents={handleBulkDeleteStudents}
                onBulkAssignClass={handleBulkAssignClass}
                onTriggerSinglePrint={handleSinglePrint}
                onTriggerBulkPrint={handleBulkPrint}
                onExportExcel={handleExportExcel}
                onOpenImportModal={() => setIsImportModalOpen(true)}
                onShowNotification={showToast}
              />
            )}

            {activeNav === 'step6_nilai' && (
              <AcademicGradeView
                students={students}
                masterSubjects={masterSubjects}
                onUpdateMasterSubjects={setMasterSubjects}
                onUpdateStudent={handleUpdateStudent}
                onOpenImportModal={() => setIsImportModalOpen(true)}
                onShowNotification={showToast}
              />
            )}

            {activeNav === 'step7_kehadiran' && (
              <AttendanceView
                records={attendanceRecords}
                students={students}
                classes={schoolClasses}
                onSaveAttendance={(updated) => setAttendanceRecords(updated)}
                onShowNotification={showToast}
              />
            )}

            {activeNav === 'cetak_dokumen_gabungan' && (
              <OfficialPrintPreview
                students={students}
                schoolProfile={schoolProfile}
                initialStudentId={previewStudentId}
                batchStudentIds={batchPrintStudentIds}
                onBack={() => setActiveNav('dashboard')}
              />
            )}

            {activeNav === 'backup_restore_db' && (
              <SettingsAndBackupView
                authToken={authToken}
                students={students}
                attendanceRecords={attendanceRecords}
                schoolProfile={schoolProfile}
                academicYears={academicYears}
                teachers={teachers}
                departments={departments}
                gradeLevels={gradeLevels}
                schoolClasses={schoolClasses}
                masterSubjects={masterSubjects}
                onRestoreData={(restoredStudents, restoredAttendance) => {
                  setStudents(restoredStudents);
                  setAttendanceRecords(restoredAttendance);
                }}
                onRestoreFullPayload={handleRestoreFullPayload}
                onClearSelectedCollections={handleClearSelectedCollections}
                onClearAllToZero={handleClearAllToZero}
                onResetToDefault={handleResetToDefault}
                onShowNotification={showToast}
              />
            )}

            {activeNav === 'pengaturan_profil_sekolah' && (
              <SchoolProfileSettingsView
                schoolProfile={schoolProfile}
                onUpdateSchoolProfile={setSchoolProfile}
                authToken={authToken}
                username={currentUser.username}
                colorMode={colorMode}
                onChangeColorMode={setColorMode}
                accentColor={accentColor}
                onChangeAccentColor={setAccentColor}
                students={students}
                attendanceRecords={attendanceRecords}
                academicYears={academicYears}
                teachers={teachers}
                departments={departments}
                gradeLevels={gradeLevels}
                schoolClasses={schoolClasses}
                masterSubjects={masterSubjects}
                onRestoreData={(restoredStudents, restoredAttendance) => {
                  setStudents(restoredStudents);
                  setAttendanceRecords(restoredAttendance);
                }}
                onRestoreFullPayload={handleRestoreFullPayload}
                onClearSelectedCollections={handleClearSelectedCollections}
                onClearAllToZero={handleClearAllToZero}
                onResetToDefault={handleResetToDefault}
                onShowNotification={showToast}
              />
            )}
          </main>
        </div>
      </div>

      {/* Modal Pusat Impor Excel (5 Master Data + Siswa + Nilai + ZIP Foto) */}
      <ExcelImportCenterModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        students={students}
        academicYears={academicYears}
        onUpdateAcademicYears={setAcademicYears}
        teachers={teachers}
        onUpdateTeachers={setTeachers}
        departments={departments}
        onUpdateDepartments={setDepartments}
        gradeLevels={gradeLevels}
        onUpdateGradeLevels={setGradeLevels}
        schoolClasses={schoolClasses}
        onUpdateSchoolClasses={setSchoolClasses}
        masterSubjects={masterSubjects}
        onImportStudents={handleImportStudents}
        onImportGrades={handleImportGrades}
        onImportPhotosZip={handleImportPhotosZip}
        onShowNotification={showToast}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-start gap-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-xl max-w-md">
          <div
            className={`h-2.5 w-2.5 rounded-full mt-1 flex-shrink-0 ${
              toast.type === 'success'
                ? 'bg-emerald-600'
                : toast.type === 'danger'
                ? 'bg-rose-600'
                : toast.type === 'warning'
                ? 'bg-amber-500'
                : 'bg-blue-600'
            }`}
          />
          <div className="flex-1 text-xs">
            <h5 className="font-bold text-slate-900 dark:text-white">{toast.title}</h5>
            <p className="text-slate-600 dark:text-slate-300 mt-0.5">{toast.body}</p>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
