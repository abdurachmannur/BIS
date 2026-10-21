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
import { PdfExportQueueView } from './components/phase4/PdfExportQueueView';
import { ExcelImportCenterModal } from './components/import/ExcelImportCenterModal';
import { SchoolProfileSettingsView } from './components/settings/SchoolProfileSettingsView';
import { SettingsAndBackupView } from './components/phase5/SettingsAndBackupView';
import { CodeBlueprintViewer } from './components/blueprint/CodeBlueprintViewer';
import { 
  MOCK_STUDENTS, 
  MOCK_DAILY_ATTENDANCE, 
  DEFAULT_SCHOOL_PROFILE,
  DEFAULT_AUTH_USERS,
  DEFAULT_ACADEMIC_YEARS,
  DEFAULT_TEACHERS,
  DEFAULT_DEPARTMENTS,
  DEFAULT_GRADE_LEVELS,
  DEFAULT_CLASSES,
  DEFAULT_MASTER_SUBJECTS
} from './data/mock-data';
import { 
  StudentFullRecord, 
  DailyAttendanceRecord, 
  FilamentNotificationItem, 
  SchoolProfile, 
  AuthUser,
  AcademicYearRecord,
  TeacherRecord,
  DepartmentRecord,
  GradeLevelRecord,
  SchoolClassRecord,
  MasterSubjectRecord,
  UIThemePreset
} from './types/buku-induk';
import { GradeImportPayloadItem } from './components/import/ExcelImportCenterModal';

const STORAGE_KEY_STUDENTS = 'buku_induk_students_v2';
const STORAGE_KEY_ATTENDANCE = 'buku_induk_attendance_v2';
const STORAGE_KEY_SCHOOL = 'buku_induk_school_profile_v2';
const STORAGE_KEY_AUTH = 'buku_induk_auth_user_v2';
const STORAGE_KEY_ACADEMIC_YEARS = 'buku_induk_academic_years_v2';
const STORAGE_KEY_TEACHERS = 'buku_induk_teachers_v2';
const STORAGE_KEY_DEPARTMENTS = 'buku_induk_departments_v2';
const STORAGE_KEY_GRADE_LEVELS = 'buku_induk_grade_levels_v2';
const STORAGE_KEY_CLASSES = 'buku_induk_classes_v2';
const STORAGE_KEY_MASTER_SUBJECTS = 'buku_induk_master_subjects_v2';
const STORAGE_KEY_THEME = 'buku_induk_ui_theme_v2';

export default function App() {
  // Current logged in user (null = shows Filament login screen)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUTH);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_AUTH_USERS[0];
  });

  const [activeNav, setActiveNav] = useState<ActiveNavKey>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);

  // 5 UI Templates State
  const [currentTheme, setCurrentTheme] = useState<UIThemePreset>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THEME) as UIThemePreset;
      if (saved) return saved;
    } catch (e) {
      console.error(e);
    }
    return 'filament-amber';
  });

  const handleSelectTheme = (theme: UIThemePreset) => {
    setCurrentTheme(theme);
    localStorage.setItem(STORAGE_KEY_THEME, theme);
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'obsidian-dark');
    showToast('Tema UI Diperbarui', `Tampilan aktif: ${theme.replace('-', ' ').toUpperCase()}`, 'info');
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.documentElement.classList.toggle('dark', currentTheme === 'obsidian-dark');
  }, [currentTheme]);

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

  // Students & Attendance Records (Steps 6 & 8)
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

  // Filament Live Database Notifications
  const [notifications, setNotifications] = useState<FilamentNotificationItem[]>([
    {
      id: 'notif-1',
      title: 'Database Terinisialisasi',
      body: 'Struktur Buku Induk SMA Kurikulum Merdeka aktif.',
      type: 'success',
      createdAt: '10 menit lalu',
      isRead: false,
    },
    {
      id: 'notif-2',
      title: 'Sinkronisasi Sekolah',
      body: `Profil ${schoolProfile.namaSekolah} siap digunakan untuk cetak dokumen resmi.`,
      type: 'info',
      createdAt: 'Baru saja',
      isRead: false,
    },
  ]);

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

  // Sync to LocalStorage
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
    if (currentUser) {
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEY_AUTH);
    }
  }, [currentUser]);

  // Notification handlers
  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleClearAllNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleTriggerJobNotification = (title: string, body: string, downloadUrl?: string) => {
    const newNotif: FilamentNotificationItem = {
      id: 'job-' + Date.now(),
      title,
      body,
      type: 'success',
      createdAt: 'Baru saja',
      isRead: false,
      downloadUrl,
      downloadFilename: `Buku_Induk_Ekspor_${Date.now()}.pdf`,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    showToast(title, body, 'success');
  };

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

  // Safe non-destructive unassign when a Master Class is deleted
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

  // Authentic Excel (.xlsx) Export with Complete 49 Columns (Bagian A s/d F Matching Print Preview & Re-importable)
  const handleExportExcel = (selectedIds?: string[]) => {
    const targetList =
      selectedIds && selectedIds.length > 0
        ? students.filter((s) => selectedIds.includes(s.id))
        : students;

    const wb = XLSX.utils.book_new();

    const headers = [
      // Bagian A: Keterangan Pribadi (18 Kolom)
      'NIS', 'NISN', 'Nama_Lengkap', 'Nama_Panggilan', 'Jenis_Kelamin',
      'Tempat_Lahir', 'Tanggal_Lahir_DD_MM_YYYY', 'Agama', 'Kewarganegaraan',
      'Anak_Ke', 'Jumlah_Saudara_Kandung', 'Bahasa_Sehari_Hari',
      'Alamat', 'Kelurahan', 'Kecamatan', 'Kota_Kabupaten', 'Tinggal_Bersama', 'No_HP_Siswa',
      // Bagian B: Keterangan Jasmani & Kesehatan (4 Kolom)
      'Berat_Badan_Kg', 'Tinggi_Badan_Cm', 'Golongan_Darah', 'Riwayat_Penyakit',
      // Bagian C: Pendidikan Sebelumnya (6 Kolom)
      'Asal_SMP', 'No_Ijazah_SMP', 'Diterima_Di_Kelas', 'Jurusan_Peminatan', 'Tahun_Ajaran_Masuk', 'Tanggal_Diterima',
      // Bagian D: Orang Tua Kandung — Ayah & Ibu (14 Kolom)
      'Nama_Ayah', 'Tempat_Lahir_Ayah', 'Tanggal_Lahir_Ayah', 'Pendidikan_Ayah', 'Pekerjaan_Ayah', 'Penghasilan_Ayah', 'No_HP_Ayah',
      'Nama_Ibu', 'Tempat_Lahir_Ibu', 'Tanggal_Lahir_Ibu', 'Pendidikan_Ibu', 'Pekerjaan_Ibu', 'Penghasilan_Ibu', 'No_HP_Ibu',
      // Bagian E: Wali Siswa (4 Kolom)
      'Nama_Wali', 'Hubungan_Keluarga_Wali', 'Pekerjaan_Wali', 'Penghasilan_Wali',
      // Bagian F: Kelulusan / Meninggalkan Sekolah (3 Kolom)
      'Status_Siswa', 'No_Ijazah_SMA', 'Melanjutkan_Ke'
    ];

    const dataRows = targetList.map((s) => [
      // Bagian A
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
      // Bagian B
      s.physical.beratBadanKg,
      s.physical.tinggiBadanCm,
      s.physical.golonganDarah,
      s.physical.riwayatPenyakit || 'Tidak Ada',
      // Bagian C
      s.previousEducation.asalSekolah,
      s.previousEducation.nomorIjazahSmp,
      s.previousEducation.diterimaDiKelas,
      s.previousEducation.jurusanPeminatan,
      s.previousEducation.tahunAjaranMasuk || '2024/2025',
      s.previousEducation.diterimaTanggal,
      // Bagian D
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
      // Bagian E
      s.wali.adaWali ? (s.wali.nama || '') : '',
      s.wali.adaWali ? (s.wali.hubunganKeluarga || '') : '',
      s.wali.adaWali ? (s.wali.pekerjaan || '') : '',
      s.wali.adaWali ? (s.wali.penghasilanBulanan || '') : '',
      // Bagian F
      s.departure.status,
      s.departure.nomorIjazahSma || '',
      s.departure.namaPerguruanTinggi || s.departure.melanjutkanKe || '',
    ]);

    const wsData = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
    wsData['!cols'] = headers.map((h) => ({ wch: Math.max(18, h.length + 4) }));
    XLSX.utils.book_append_sheet(wb, wsData, 'DATA_SISWA_BUKU_INDUK');

    const guideHeaders = ['BAGIAN BUKU INDUK', 'FORMAT STANDAR', 'KETERANGAN RESMI DAPODIK / BUKU INDUK'];
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

    const filename = `Buku_Induk_SMA_Lengkap_A_sd_F_${schoolProfile.namaSekolah.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, filename);

    showToast(
      'Ekspor Excel (.xlsx) Lengkap Berhasil',
      `${targetList.length} data siswa (49 kolom Bagian A s/d F) telah diekspor ke ${filename}.`,
      'success'
    );
  };

  // Excel Batch Import Handlers
  const handleImportStudents = (importedStudents: StudentFullRecord[]) => {
    setStudents((prev) => [...importedStudents, ...prev]);
    const newNotif: FilamentNotificationItem = {
      id: 'imp-std-' + Date.now(),
      title: 'Impor Excel Siswa Selesai',
      body: `${importedStudents.length} data siswa baru (Bagian A–F lengkap) berhasil ditambahkan ke database.`,
      type: 'success',
      createdAt: 'Baru saja',
      isRead: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
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

  const handleImportPhotosZip = (matchedCount: number) => {
    const newNotif: FilamentNotificationItem = {
      id: 'imp-zip-' + Date.now(),
      title: 'Pencocokan Foto ZIP Berhasil',
      body: `${matchedCount} pas foto siswa telah disinkronkan dengan NIS/NISN.`,
      type: 'info',
      createdAt: 'Baru saja',
      isRead: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Backup Restore & Reset Handlers
  const handleRestoreData = (
    restoredStudents: StudentFullRecord[],
    restoredAttendance: DailyAttendanceRecord[]
  ) => {
    setStudents(restoredStudents);
    setAttendanceRecords(restoredAttendance);
  };

  const handleResetToDefault = () => {
    setStudents(MOCK_STUDENTS);
    setAttendanceRecords(MOCK_DAILY_ATTENDANCE);
    setSchoolProfile(DEFAULT_SCHOOL_PROFILE);
    setAcademicYears(DEFAULT_ACADEMIC_YEARS);
    setTeachers(DEFAULT_TEACHERS);
    setDepartments(DEFAULT_DEPARTMENTS);
    setGradeLevels(DEFAULT_GRADE_LEVELS);
    setSchoolClasses(DEFAULT_CLASSES);
    setCurrentTheme('filament-amber');
    localStorage.clear();
    showToast('Data Direset', 'Seluruh data telah dikembalikan ke standar awal.', 'info');
  };

  const mapStepToNav = (step: MasterStepNumber) => {
    if (step === 1) setActiveNav('step1_tahun_ajaran');
    if (step === 2) setActiveNav('step2_guru');
    if (step === 3) setActiveNav('step2_jurusan');
    if (step === 4) setActiveNav('step3_tingkat');
    if (step === 5) setActiveNav('step4_kelas');
  };

  // If user is not logged in, display the authentic Filament v3 Login Screen
  if (!currentUser) {
    return (
      <FilamentLoginView
        schoolProfile={schoolProfile}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          showToast('Login Berhasil', `Selamat datang, ${user.namaLengkap}!`, 'success');
        }}
      />
    );
  }

  const isObsidian = currentTheme === 'obsidian-dark';

  return (
    <div
      data-theme={currentTheme}
      className={`theme-app-shell min-h-screen ${
        isObsidian
          ? 'bg-slate-950 text-slate-100'
          : 'bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100'
      } flex flex-col font-sans antialiased selection:bg-amber-500 selection:text-slate-950 transition-colors duration-200`}
    >
      <div className="flex flex-1 overflow-hidden">
        {/* Filament Sidebar with Steps 1 - 8 */}
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
          currentUser={currentUser}
          onLogout={() => {
            setCurrentUser(null);
            showToast('Telah Keluar', 'Sesi login berhasil diakhiri.', 'info');
          }}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Navbar with Quick Theme Switcher */}
          <FilamentNavbar
            notifications={notifications}
            onMarkNotificationAsRead={handleMarkNotificationAsRead}
            onClearAllNotifications={handleClearAllNotifications}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            schoolProfile={schoolProfile}
            currentUser={currentUser}
            onLogout={() => {
              setCurrentUser(null);
              showToast('Telah Keluar', 'Sesi login berhasil diakhiri.', 'info');
            }}
            onOpenImportModal={() => setIsImportModalOpen(true)}
            currentTheme={currentTheme}
            onSelectTheme={handleSelectTheme}
          />

          {/* Page Routing */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {/* 1. Dashboard Induk & Matriks Demografi L/P */}
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

            {/* Step 1: Input Tahun Ajaran */}
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

            {/* Step 2: Input Data Guru */}
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

            {/* Step 3: Input Jurusan */}
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

            {/* Step 4: Input Tingkat Kelas */}
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

            {/* Step 5: Input Rombel Kelas (Unique ID per Academic Year) */}
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

            {/* Step 6: Input & Master Siswa Buku Induk (Lembar I & Lembar II) */}
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

            {/* Step 7: Input Data Nilai Sem 1-6 */}
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

            {/* Step 8: Input Kehadiran Siswa */}
            {activeNav === 'step7_kehadiran' && (
              <AttendanceView
                records={attendanceRecords}
                students={students}
                classes={schoolClasses}
                onSaveAttendance={(updated) => setAttendanceRecords(updated)}
                onShowNotification={showToast}
              />
            )}

            {/* Cetak 1 Berkas Gabungan PDF (Cover Depan Klasik + Watermark + TTD Toggle) */}
            {activeNav === 'cetak_dokumen_gabungan' && (
              <OfficialPrintPreview
                students={students}
                schoolProfile={schoolProfile}
                initialStudentId={previewStudentId}
                batchStudentIds={batchPrintStudentIds}
                onBack={() => setActiveNav('dashboard')}
              />
            )}

            {/* Queue Job Spatie Browsershot Simulator */}
            {activeNav === 'queue_cetak_massal' && (
              <PdfExportQueueView
                students={students}
                schoolProfile={schoolProfile}
                onTriggerJobNotification={handleTriggerJobNotification}
                onNavigateToPreview={() => {
                  setPreviewStudentId(students[0]?.id);
                  setBatchPrintStudentIds(students.map((s) => s.id));
                  setActiveNav('cetak_dokumen_gabungan');
                }}
                onOpenImportModal={() => setIsImportModalOpen(true)}
              />
            )}

            {/* Profil & Logo Sekolah + 5 UI Themes */}
            {activeNav === 'pengaturan_profil_sekolah' && (
              <SchoolProfileSettingsView
                schoolProfile={schoolProfile}
                onUpdateSchoolProfile={setSchoolProfile}
                currentTheme={currentTheme}
                onSelectTheme={handleSelectTheme}
                onShowNotification={showToast}
              />
            )}

            {/* Database & Spatie Backup */}
            {activeNav === 'pengaturan_backup' && (
              <SettingsAndBackupView
                students={students}
                attendanceRecords={attendanceRecords}
                onRestoreData={handleRestoreData}
                onResetToDefault={handleResetToDefault}
                onShowNotification={showToast}
              />
            )}

            {/* Blueprint Kode Laravel 11 */}
            {activeNav === 'blueprint_arsitektur' && (
              <CodeBlueprintViewer />
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
        <div className="fixed bottom-5 right-5 z-50 flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-w-md animate-in fade-in slide-in-from-bottom-4">
          <div className="h-2 w-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0 animate-ping"></div>
          <div className="flex-1 text-xs">
            <h5 className="font-bold text-slate-900 dark:text-white">
              {toast.title}
            </h5>
            <p className="mt-0.5 text-slate-600 dark:text-slate-300 leading-relaxed">
              {toast.body}
            </p>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-slate-600 text-xs"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
