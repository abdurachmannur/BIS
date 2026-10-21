import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  Calendar, 
  Layers, 
  GraduationCap, 
  School, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  Save, 
  ArrowRight,
  Sparkles,
  X,
  UserCheck,
  FileSpreadsheet,
  Upload,
  Download,
  AlertTriangle,
  Filter,
  Hash
} from 'lucide-react';
import { 
  AcademicYearRecord, 
  TeacherRecord,
  DepartmentRecord, 
  GradeLevelRecord, 
  SchoolClassRecord,
  StudentFullRecord,
  Major,
  GradeLevel
} from '../../types/buku-induk';

export type MasterStepNumber = 1 | 2 | 3 | 4 | 5;

interface MasterSetupStepsViewProps {
  currentStep: MasterStepNumber;
  onSelectStep: (step: MasterStepNumber) => void;
  academicYears: AcademicYearRecord[];
  onUpdateAcademicYears: (items: AcademicYearRecord[]) => void;
  teachers: TeacherRecord[];
  onUpdateTeachers: (items: TeacherRecord[]) => void;
  departments: DepartmentRecord[];
  onUpdateDepartments: (items: DepartmentRecord[]) => void;
  gradeLevels: GradeLevelRecord[];
  onUpdateGradeLevels: (items: GradeLevelRecord[]) => void;
  schoolClasses: SchoolClassRecord[];
  onUpdateSchoolClasses: (items: SchoolClassRecord[]) => void;
  students: StudentFullRecord[];
  onUnassignStudentsFromClass: (deletedClass: SchoolClassRecord) => void;
  onNavigateToNext: () => void;
  onShowNotification: (title: string, body: string, type: 'success' | 'info' | 'warning' | 'danger') => void;
}

export const MasterSetupStepsView: React.FC<MasterSetupStepsViewProps> = ({
  currentStep,
  onSelectStep,
  academicYears,
  onUpdateAcademicYears,
  teachers,
  onUpdateTeachers,
  departments,
  onUpdateDepartments,
  gradeLevels,
  onUpdateGradeLevels,
  schoolClasses,
  onUpdateSchoolClasses,
  students,
  onUnassignStudentsFromClass,
  onNavigateToNext,
  onShowNotification,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBatchClassModal, setShowBatchClassModal] = useState(false);

  // Edit modal states
  const [editingAcademicYear, setEditingAcademicYear] = useState<AcademicYearRecord | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<TeacherRecord | null>(null);
  const [editingDepartment, setEditingDepartment] = useState<DepartmentRecord | null>(null);
  const [editingGradeLevel, setEditingGradeLevel] = useState<GradeLevelRecord | null>(null);
  const [editingSchoolClass, setEditingSchoolClass] = useState<SchoolClassRecord | null>(null);

  // Delete confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'tahun_ajaran' | 'guru' | 'jurusan' | 'tingkat' | 'kelas';
    id: string;
    label: string;
    sublabel?: string;
    affectedStudentCount?: number;
    classObj?: SchoolClassRecord;
  } | null>(null);

  // Class Filter by Academic Year
  const [selectedClassYearFilter, setSelectedClassYearFilter] = useState<string>('ALL');

  // Form states for Step 1: Tahun Ajaran
  const [newTahun, setNewTahun] = useState('2025/2026');
  const [newSemester, setNewSemester] = useState<'Ganjil' | 'Genap'>('Ganjil');
  const [newKurikulum, setNewKurikulum] = useState<'Kurikulum Merdeka' | 'Kurikulum 2013'>('Kurikulum Merdeka');

  // Form states for Step 2: Guru
  const [newGuruNip, setNewGuruNip] = useState('');
  const [newGuruNama, setNewGuruNama] = useState('');
  const [newGuruJabatan, setNewGuruJabatan] = useState('Wali Kelas');

  // Form states for Step 3: Jurusan
  const [newJurusanKode, setNewJurusanKode] = useState<string>('MIPA');
  const [newJurusanNama, setNewJurusanNama] = useState('');
  const [newKetuaJurusan, setNewKetuaJurusan] = useState(teachers[0]?.namaLengkap || '');
  const [newJurusanKuota, setNewJurusanKuota] = useState<number>(216);

  // Form states for Step 4: Tingkat
  const [newTingkat, setNewTingkat] = useState<string>('X');
  const [newTingkatKeterangan, setNewTingkatKeterangan] = useState('');
  const [newTingkatRombel, setNewTingkatRombel] = useState<number>(7);

  // Form states for Step 5: Kelas (Single & Batch Generator)
  const activeYearStr = academicYears.find((y) => y.isActive)?.tahun || academicYears[0]?.tahun || '2024/2025';
  const [newKelasTahunAjaran, setNewKelasTahunAjaran] = useState<string>(activeYearStr);
  const [newKelasTingkat, setNewKelasTingkat] = useState<string>(gradeLevels[0]?.tingkat || 'X');
  const [newKelasJurusan, setNewKelasJurusan] = useState<string>(departments[0]?.kode || 'MIPA');
  const [newNamaKelas, setNewNamaKelas] = useState('');
  const [newWaliKelas, setNewWaliKelas] = useState(teachers[0]?.namaLengkap || '');
  const [newNipWaliKelas, setNewNipWaliKelas] = useState(teachers[0]?.nip || '');
  const [newKelasKapasitas, setNewKelasKapasitas] = useState<number>(36);

  // Batch generator states (for varying class counts per year, e.g., 7 MIPA classes this year, 6 next year)
  const [batchTahunAjaran, setBatchTahunAjaran] = useState<string>(activeYearStr);
  const [batchTingkat, setBatchTingkat] = useState<string>(gradeLevels[0]?.tingkat || 'X');
  const [batchJurusan, setBatchJurusan] = useState<string>(departments[0]?.kode || 'MIPA');
  const [batchJumlahKelas, setBatchJumlahKelas] = useState<number>(7);
  const [batchKapasitas, setBatchKapasitas] = useState<number>(36);

  // Helper to generate unique database ID for a class tied to its academic year
  const generateUniqueClassId = (tahun: string, nama: string) => {
    const cleanYear = tahun.replace(/\D/g, '');
    const cleanName = nama.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `CLS-${cleanYear}-${cleanName}-${randomSuffix}`;
  };

  // ============================================================================
  // EXCEL (.XLSX) TEMPLATE DOWNLOADERS & IMPORTERS FOR ALL 5 MASTER DATA
  // ============================================================================
  const handleDownloadStepTemplate = () => {
    const wb = XLSX.utils.book_new();

    if (currentStep === 1) {
      const headers = ['Tahun_Ajaran', 'Semester', 'Kurikulum', 'Status_Aktif'];
      const sample = [
        ['2025/2026', 'Ganjil', 'Kurikulum Merdeka', 'Ya'],
        ['2025/2026', 'Genap', 'Kurikulum Merdeka', 'Tidak'],
      ];
      const ws = XLSX.utils.aoa_to_sheet([headers, ...sample]);
      ws['!cols'] = [{ wch: 18 }, { wch: 15 }, { wch: 24 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, ws, 'DATA_TAHUN_AJARAN');

      const guide = XLSX.utils.aoa_to_sheet([
        ['KOLOM', 'FORMAT RESMI', 'CONTOH'],
        ['Tahun_Ajaran', 'YYYY/YYYY', '2025/2026'],
        ['Semester', 'Ganjil atau Genap', 'Ganjil'],
        ['Kurikulum', 'Kurikulum Merdeka / Kurikulum 2013', 'Kurikulum Merdeka'],
        ['Status_Aktif', 'Ya atau Tidak', 'Ya'],
      ]);
      guide['!cols'] = [{ wch: 20 }, { wch: 32 }, { wch: 22 }];
      XLSX.utils.book_append_sheet(wb, guide, 'PETUNJUK');
      XLSX.writeFile(wb, 'Template_Master_Tahun_Ajaran.xlsx');
      onShowNotification('Template Diunduh', 'Template_Master_Tahun_Ajaran.xlsx berhasil diunduh.', 'success');
    } else if (currentStep === 2) {
      const headers = ['NIP', 'Nama_Lengkap', 'Jabatan_Wali_Kelas'];
      const sample = [
        ['197804122005011002', 'Drs. Bambang Hermawan, M.Pd.', 'Wali Kelas X'],
        ['198309212009022004', 'Rina Kartika Sari, S.Pd., Gr.', 'Wali Kelas XI'],
      ];
      const ws = XLSX.utils.aoa_to_sheet([headers, ...sample]);
      ws['!cols'] = [{ wch: 22 }, { wch: 34 }, { wch: 28 }];
      XLSX.utils.book_append_sheet(wb, ws, 'DATA_GURU');

      const guide = XLSX.utils.aoa_to_sheet([
        ['KOLOM', 'FORMAT RESMI', 'CONTOH'],
        ['NIP', '18 Digit Angka NIP / NUPTK', '197804122005011002'],
        ['Nama_Lengkap', 'Nama Lengkap beserta Gelar', 'Drs. Bambang Hermawan, M.Pd.'],
        ['Jabatan_Wali_Kelas', 'Jabatan penugasan guru', 'Wali Kelas X'],
      ]);
      guide['!cols'] = [{ wch: 22 }, { wch: 32 }, { wch: 32 }];
      XLSX.utils.book_append_sheet(wb, guide, 'PETUNJUK');
      XLSX.writeFile(wb, 'Template_Master_Data_Guru.xlsx');
      onShowNotification('Template Diunduh', 'Template_Master_Data_Guru.xlsx berhasil diunduh.', 'success');
    } else if (currentStep === 3) {
      const headers = ['Kode_Jurusan', 'Nama_Jurusan', 'Ketua_Jurusan', 'Kuota_Siswa'];
      const sample = [
        ['MIPA', 'Matematika dan Ilmu Pengetahuan Alam', 'Drs. Supriyanto, M.Si.', 252],
        ['IPS', 'Ilmu Pengetahuan Sosial', 'Dra. Endang Sulastri, M.Pd.', 216],
      ];
      const ws = XLSX.utils.aoa_to_sheet([headers, ...sample]);
      ws['!cols'] = [{ wch: 16 }, { wch: 38 }, { wch: 30 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, ws, 'DATA_JURUSAN');

      const guide = XLSX.utils.aoa_to_sheet([
        ['KOLOM', 'FORMAT RESMI', 'CONTOH'],
        ['Kode_Jurusan', 'Singkatan Jurusan (MIPA/IPS/BAHASA)', 'MIPA'],
        ['Nama_Jurusan', 'Nama Lengkap Peminatan', 'Matematika dan Ilmu Pengetahuan Alam'],
        ['Ketua_Jurusan', 'Nama Guru Ketua Jurusan', 'Drs. Supriyanto, M.Si.'],
        ['Kuota_Siswa', 'Angka daya tampung', '252'],
      ]);
      guide['!cols'] = [{ wch: 20 }, { wch: 35 }, { wch: 35 }];
      XLSX.utils.book_append_sheet(wb, guide, 'PETUNJUK');
      XLSX.writeFile(wb, 'Template_Master_Data_Jurusan.xlsx');
      onShowNotification('Template Diunduh', 'Template_Master_Data_Jurusan.xlsx berhasil diunduh.', 'success');
    } else if (currentStep === 4) {
      const headers = ['Tingkat', 'Keterangan_Fase', 'Jumlah_Rombel'];
      const sample = [
        ['X', 'Tingkat X (Fase E - Kurikulum Merdeka)', 7],
        ['XI', 'Tingkat XI (Fase F - Peminatan)', 7],
        ['XII', 'Tingkat XII (Fase F - Persiapan Kelulusan)', 6],
      ];
      const ws = XLSX.utils.aoa_to_sheet([headers, ...sample]);
      ws['!cols'] = [{ wch: 14 }, { wch: 42 }, { wch: 18 }];
      XLSX.utils.book_append_sheet(wb, ws, 'DATA_TINGKAT');

      const guide = XLSX.utils.aoa_to_sheet([
        ['KOLOM', 'FORMAT RESMI', 'CONTOH'],
        ['Tingkat', 'Angka Romawi X / XI / XII', 'X'],
        ['Keterangan_Fase', 'Deskripsi Fase Kurikulum', 'Tingkat X (Fase E - Kurikulum Merdeka)'],
        ['Jumlah_Rombel', 'Target jumlah rombel tingkat ini', '7'],
      ]);
      guide['!cols'] = [{ wch: 20 }, { wch: 35 }, { wch: 35 }];
      XLSX.utils.book_append_sheet(wb, guide, 'PETUNJUK');
      XLSX.writeFile(wb, 'Template_Master_Data_Tingkat.xlsx');
      onShowNotification('Template Diunduh', 'Template_Master_Data_Tingkat.xlsx berhasil diunduh.', 'success');
    } else if (currentStep === 5) {
      const headers = ['Tahun_Ajaran', 'Nama_Kelas', 'Tingkat', 'Jurusan', 'Nama_Wali_Kelas', 'NIP_Wali_Kelas', 'Kapasitas'];
      const sample = [
        ['2024/2025', 'X-MIPA-1', 'X', 'MIPA', 'Dra. Neneng Suryati, M.Pd.', '197608122002122001', 36],
        ['2024/2025', 'X-MIPA-2', 'X', 'MIPA', 'Agus Gunawan, S.Pd.', '198104192006041005', 36],
        ['2025/2026', 'X-MIPA-1', 'X', 'MIPA', 'Drs. Supriyanto, M.Si.', '197011051995121001', 36],
      ];
      const ws = XLSX.utils.aoa_to_sheet([headers, ...sample]);
      ws['!cols'] = [{ wch: 16 }, { wch: 16 }, { wch: 10 }, { wch: 12 }, { wch: 30 }, { wch: 22 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(wb, ws, 'DATA_KELAS');

      const guide = XLSX.utils.aoa_to_sheet([
        ['KOLOM', 'FORMAT RESMI', 'KETERANGAN'],
        ['Tahun_Ajaran', 'YYYY/YYYY', 'Membedakan ID unik kelas antar tahun ajaran'],
        ['Nama_Kelas', 'Tetap standar (misal X-MIPA-1 s/d X-MIPA-7)', 'ID database otomatis dibuat unik per baris'],
        ['Tingkat', 'X / XI / XII', 'Sesuai Master Tingkat'],
        ['Jurusan', 'MIPA / IPS / BAHASA', 'Sesuai Master Jurusan'],
        ['Nama_Wali_Kelas', 'Nama Guru Wali Kelas', 'Otomatis dicocokkan dengan NIP di Data Guru jika kosong'],
      ]);
      guide['!cols'] = [{ wch: 20 }, { wch: 38 }, { wch: 42 }];
      XLSX.utils.book_append_sheet(wb, guide, 'PETUNJUK');
      XLSX.writeFile(wb, 'Template_Master_Data_Kelas.xlsx');
      onShowNotification('Template Diunduh', 'Template_Master_Data_Kelas.xlsx berhasil diunduh.', 'success');
    }
  };

  const handleImportStepExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });

      if (rows.length === 0) {
        onShowNotification('Berkas Kosong', 'Tidak ditemukan baris data pada lembar pertama Excel.', 'warning');
        return;
      }

      if (currentStep === 1) {
        const imported: AcademicYearRecord[] = rows.map((r, i) => ({
          id: `AY-IMP-${Date.now()}-${i}`,
          tahun: String(r.Tahun_Ajaran || r.Tahun || '2025/2026').trim(),
          semester: String(r.Semester || 'Ganjil').toLowerCase().includes('genap') ? 'Genap' : 'Ganjil',
          kurikulum: String(r.Kurikulum || '').includes('2013') ? 'Kurikulum 2013' : 'Kurikulum Merdeka',
          isActive: String(r.Status_Aktif || '').toLowerCase() === 'ya',
        }));
        onUpdateAcademicYears([...academicYears, ...imported]);
        onShowNotification('Impor Tahun Ajaran Selesai', `${imported.length} data Tahun Ajaran berhasil diimpor dari Excel (.xlsx).`, 'success');
      } else if (currentStep === 2) {
        const imported: TeacherRecord[] = rows.map((r, i) => ({
          id: `TCH-IMP-${Date.now()}-${i}`,
          nip: String(r.NIP || r.Nip || `19800101200501100${i}`).trim(),
          namaLengkap: String(r.Nama_Lengkap || r.Nama || `Guru Baru ${i + 1}`).trim(),
          jabatanWaliKelas: String(r.Jabatan_Wali_Kelas || r.Jabatan || 'Wali Kelas').trim(),
        }));
        onUpdateTeachers([...teachers, ...imported]);
        onShowNotification('Impor Data Guru Selesai', `${imported.length} data Guru berhasil diimpor dari Excel (.xlsx).`, 'success');
      } else if (currentStep === 3) {
        const imported: DepartmentRecord[] = rows.map((r, i) => ({
          id: `DEP-IMP-${Date.now()}-${i}`,
          kode: String(r.Kode_Jurusan || r.Kode || 'MIPA').trim().toUpperCase(),
          nama: String(r.Nama_Jurusan || r.Nama || 'Peminatan Akademik').trim(),
          ketuaJurusan: String(r.Ketua_Jurusan || teachers[0]?.namaLengkap || 'Drs. Pendidik, M.Pd.').trim(),
          kuotaSiswa: Number(r.Kuota_Siswa || r.Kuota) || 180,
        }));
        onUpdateDepartments([...departments, ...imported]);
        onShowNotification('Impor Data Jurusan Selesai', `${imported.length} data Jurusan berhasil diimpor dari Excel (.xlsx).`, 'success');
      } else if (currentStep === 4) {
        const imported: GradeLevelRecord[] = rows.map((r, i) => ({
          id: `GL-IMP-${Date.now()}-${i}`,
          tingkat: String(r.Tingkat || 'X').trim().toUpperCase(),
          keterangan: String(r.Keterangan_Fase || r.Keterangan || 'Fase Kurikulum Merdeka').trim(),
          jumlahRombel: Number(r.Jumlah_Rombel || r.Rombel) || 7,
        }));
        onUpdateGradeLevels([...gradeLevels, ...imported]);
        onShowNotification('Impor Data Tingkat Selesai', `${imported.length} data Tingkat Kelas berhasil diimpor dari Excel (.xlsx).`, 'success');
      } else if (currentStep === 5) {
        const imported: SchoolClassRecord[] = rows.map((r, i) => {
          const tahun = String(r.Tahun_Ajaran || activeYearStr).trim();
          const nama = String(r.Nama_Kelas || r.Kelas || `X-MIPA-${i + 1}`).trim();
          const waliName = String(r.Nama_Wali_Kelas || r.Wali_Kelas || teachers[i % Math.max(1, teachers.length)]?.namaLengkap || '').trim();
          const matchedTeacher = teachers.find((t) => t.namaLengkap.toLowerCase() === waliName.toLowerCase());
          const nip = String(r.NIP_Wali_Kelas || matchedTeacher?.nip || '198001012006041001').trim();

          return {
            id: `${generateUniqueClassId(tahun, nama)}${i}`,
            tahunAjaran: tahun,
            namaKelas: nama,
            tingkat: String(r.Tingkat || nama.split('-')[0] || 'X').trim(),
            jurusan: String(r.Jurusan || nama.split('-')[1] || 'MIPA').trim(),
            waliKelas: waliName || 'Belum Ditentukan',
            nipWaliKelas: nip,
            kapasitas: Number(r.Kapasitas || r.Kapasitas_Siswa) || 36,
          };
        });
        onUpdateSchoolClasses([...schoolClasses, ...imported]);
        onShowNotification('Impor Data Kelas Selesai', `${imported.length} Rombel Kelas dengan ID unik berhasil diimpor dari Excel (.xlsx).`, 'success');
      }
    } catch (err) {
      console.error(err);
      onShowNotification('Gagal Membaca Excel', 'Pastikan berkas yang diunggah adalah format .xlsx yang valid.', 'danger');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ============================================================================
  // CRUD HANDLERS FOR STEPS 1 - 5
  // ============================================================================

  // Step 1: Academic Year
  const handleAddAcademicYear = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: AcademicYearRecord = {
      id: `AY-${Date.now()}`,
      tahun: newTahun,
      semester: newSemester,
      kurikulum: newKurikulum,
      isActive: false,
    };
    onUpdateAcademicYears([...academicYears, newItem]);
    setShowAddModal(false);
    onShowNotification('Tahun Ajaran Ditambahkan', `Tahun Ajaran ${newTahun} (${newSemester}) berhasil disimpan.`, 'success');
  };

  const handleSaveEditAcademicYear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAcademicYear) return;
    onUpdateAcademicYears(
      academicYears.map((ay) => (ay.id === editingAcademicYear.id ? editingAcademicYear : ay))
    );
    setEditingAcademicYear(null);
    onShowNotification('Tahun Ajaran Diperbarui', `Data Tahun Ajaran ${editingAcademicYear.tahun} berhasil diperbarui.`, 'success');
  };

  const handleSetActiveYear = (id: string) => {
    onUpdateAcademicYears(academicYears.map((ay) => ({ ...ay, isActive: ay.id === id })));
    onShowNotification('Tahun Ajaran Aktif', 'Tahun ajaran operasional berhasil diubah.', 'info');
  };

  // Step 2: Teacher (Data Guru)
  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: TeacherRecord = {
      id: `TCH-${Date.now()}`,
      nip: newGuruNip.trim() || '198001012005011001',
      namaLengkap: newGuruNama.trim(),
      jabatanWaliKelas: newGuruJabatan.trim() || 'Wali Kelas',
    };
    onUpdateTeachers([...teachers, newItem]);
    setNewGuruNip('');
    setNewGuruNama('');
    setShowAddModal(false);
    onShowNotification('Data Guru Ditambahkan', `${newItem.namaLengkap} (NIP: ${newItem.nip}) siap dipilih pada dropdown Kelas & Jurusan.`, 'success');
  };

  const handleSaveEditTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;
    onUpdateTeachers(teachers.map((t) => (t.id === editingTeacher.id ? editingTeacher : t)));
    setEditingTeacher(null);
    onShowNotification('Data Guru Diperbarui', `Identitas ${editingTeacher.namaLengkap} berhasil disimpan.`, 'success');
  };

  // Step 3: Department (Data Jurusan)
  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: DepartmentRecord = {
      id: `DEP-${Date.now()}`,
      kode: newJurusanKode.trim().toUpperCase(),
      nama: newJurusanNama.trim() || `Peminatan ${newJurusanKode}`,
      ketuaJurusan: newKetuaJurusan || teachers[0]?.namaLengkap || 'Drs. Pendidik, M.Pd.',
      kuotaSiswa: Number(newJurusanKuota) || 180,
    };
    onUpdateDepartments([...departments, newItem]);
    setShowAddModal(false);
    onShowNotification('Jurusan Ditambahkan', `Jurusan ${newItem.nama} berhasil disimpan.`, 'success');
  };

  const handleSaveEditDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDepartment) return;
    onUpdateDepartments(
      departments.map((d) => (d.id === editingDepartment.id ? editingDepartment : d))
    );
    setEditingDepartment(null);
    onShowNotification('Jurusan Diperbarui', `Data Jurusan ${editingDepartment.nama} berhasil disimpan.`, 'success');
  };

  // Step 4: Grade Level (Data Tingkat)
  const handleAddGradeLevel = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: GradeLevelRecord = {
      id: `GL-${Date.now()}`,
      tingkat: newTingkat,
      keterangan: newTingkatKeterangan || `Tingkat ${newTingkat} Kurikulum Merdeka`,
      jumlahRombel: Number(newTingkatRombel) || 7,
    };
    onUpdateGradeLevels([...gradeLevels, newItem]);
    setShowAddModal(false);
    onShowNotification('Tingkat Kelas Ditambahkan', `Tingkat ${newTingkat} dengan kuota ${newItem.jumlahRombel} rombel berhasil disimpan.`, 'success');
  };

  const handleSaveEditGradeLevel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGradeLevel) return;
    onUpdateGradeLevels(
      gradeLevels.map((gl) => (gl.id === editingGradeLevel.id ? editingGradeLevel : gl))
    );
    setEditingGradeLevel(null);
    onShowNotification('Tingkat Diperbarui', `Data Tingkat ${editingGradeLevel.tingkat} berhasil disimpan.`, 'success');
  };

  // Step 5: School Class (Data Kelas - Unique Database ID per Academic Year)
  const handleAddSchoolClass = (e: React.FormEvent) => {
    e.preventDefault();
    const existingForYearAndMajor = schoolClasses.filter(
      (c) => c.tahunAjaran === newKelasTahunAjaran && c.tingkat === newKelasTingkat && c.jurusan === newKelasJurusan
    );
    const finalName = newNamaKelas.trim() || `${newKelasTingkat}-${newKelasJurusan}-${existingForYearAndMajor.length + 1}`;
    const uniqueId = generateUniqueClassId(newKelasTahunAjaran, finalName);

    const newItem: SchoolClassRecord = {
      id: uniqueId,
      tahunAjaran: newKelasTahunAjaran,
      namaKelas: finalName,
      tingkat: newKelasTingkat,
      jurusan: newKelasJurusan,
      waliKelas: newWaliKelas || teachers[0]?.namaLengkap || 'Belum Ditentukan',
      nipWaliKelas: newNipWaliKelas || teachers[0]?.nip || '-',
      kapasitas: Number(newKelasKapasitas) || 36,
    };
    onUpdateSchoolClasses([...schoolClasses, newItem]);
    setNewNamaKelas('');
    setShowAddModal(false);
    onShowNotification(
      'Rombel Kelas Ditambahkan',
      `Kelas ${newItem.namaKelas} (${newItem.tahunAjaran}) dibuat dengan ID unik ${newItem.id}.`,
      'success'
    );
  };

  // Batch Generate N Classes for an Academic Year + Grade + Major (e.g. 7 MIPA classes this year, 6 next year)
  const handleBatchGenerateClasses = (e: React.FormEvent) => {
    e.preventDefault();
    const count = Math.max(1, Math.min(20, Number(batchJumlahKelas) || 1));
    const generated: SchoolClassRecord[] = [];

    for (let i = 1; i <= count; i++) {
      const className = `${batchTingkat}-${batchJurusan}-${i}`;
      const assignedTeacher = teachers[(i - 1) % Math.max(1, teachers.length)];
      generated.push({
        id: `${generateUniqueClassId(batchTahunAjaran, className)}-${i}`,
        tahunAjaran: batchTahunAjaran,
        namaKelas: className,
        tingkat: batchTingkat,
        jurusan: batchJurusan,
        waliKelas: assignedTeacher?.namaLengkap || 'Belum Ditentukan',
        nipWaliKelas: assignedTeacher?.nip || '-',
        kapasitas: Number(batchKapasitas) || 36,
      });
    }

    onUpdateSchoolClasses([...schoolClasses, ...generated]);
    setShowBatchClassModal(false);
    onShowNotification(
      `${count} Kelas Berhasil Digenerate`,
      `Berhasil membuat ${batchTingkat}-${batchJurusan}-1 s/d ${batchTingkat}-${batchJurusan}-${count} untuk Tahun Ajaran ${batchTahunAjaran} dengan ID database unik.`,
      'success'
    );
  };

  const handleSaveEditSchoolClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchoolClass) return;
    onUpdateSchoolClasses(
      schoolClasses.map((sc) => (sc.id === editingSchoolClass.id ? editingSchoolClass : sc))
    );
    setEditingSchoolClass(null);
    onShowNotification('Data Kelas Diperbarui', `Rombel ${editingSchoolClass.namaKelas} (${editingSchoolClass.id}) berhasil disimpan.`, 'success');
  };

  // Execute confirmed deletion
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'tahun_ajaran') {
      onUpdateAcademicYears(academicYears.filter((ay) => ay.id !== deleteTarget.id));
      onShowNotification('Tahun Ajaran Dihapus', `Tahun Ajaran ${deleteTarget.label} telah dihapus.`, 'info');
    } else if (deleteTarget.type === 'guru') {
      onUpdateTeachers(teachers.filter((t) => t.id !== deleteTarget.id));
      onShowNotification('Data Guru Dihapus', `Data Guru ${deleteTarget.label} telah dihapus.`, 'info');
    } else if (deleteTarget.type === 'jurusan') {
      onUpdateDepartments(departments.filter((d) => d.id !== deleteTarget.id));
      onShowNotification('Data Jurusan Dihapus', `Jurusan ${deleteTarget.label} telah dihapus.`, 'info');
    } else if (deleteTarget.type === 'tingkat') {
      onUpdateGradeLevels(gradeLevels.filter((gl) => gl.id !== deleteTarget.id));
      onShowNotification('Data Tingkat Dihapus', `Tingkat ${deleteTarget.label} telah dihapus.`, 'info');
    } else if (deleteTarget.type === 'kelas' && deleteTarget.classObj) {
      onUpdateSchoolClasses(schoolClasses.filter((sc) => sc.id !== deleteTarget.id));
      onUnassignStudentsFromClass(deleteTarget.classObj);
      onShowNotification(
        'Kelas Dihapus & Siswa Dikosongkan Kelasnya',
        `Kelas ${deleteTarget.label} (${deleteTarget.sublabel}) telah dihapus. ${deleteTarget.affectedStudentCount || 0} siswa tetap aman di Buku Induk dengan status kelas dikosongkan.`,
        'warning'
      );
    }

    setDeleteTarget(null);
  };

  const stepsMeta = [
    { step: 1 as MasterStepNumber, title: '1. Tahun Ajaran', subtitle: 'Kurikulum & Semester', icon: Calendar, count: academicYears.length },
    { step: 2 as MasterStepNumber, title: '2. Data Guru', subtitle: 'NIP & Wali Kelas', icon: UserCheck, count: teachers.length },
    { step: 3 as MasterStepNumber, title: '3. Data Jurusan', subtitle: 'MIPA, IPS, Bahasa', icon: Layers, count: departments.length },
    { step: 4 as MasterStepNumber, title: '4. Data Tingkat', subtitle: 'Kelas X, XI, XII', icon: GraduationCap, count: gradeLevels.length },
    { step: 5 as MasterStepNumber, title: '5. Data Kelas', subtitle: 'ID Unik per Tahun', icon: School, count: schoolClasses.length },
  ];

  // Unique list of academic years for class filtering & dropdowns
  const uniqueAcademicYearStrings = Array.from(
    new Set([
      ...academicYears.map((y) => y.tahun),
      ...schoolClasses.map((c) => c.tahunAjaran),
    ])
  ).filter(Boolean);

  const filteredSchoolClasses = selectedClassYearFilter === 'ALL'
    ? schoolClasses
    : schoolClasses.filter((c) => c.tahunAjaran === selectedClassYearFilter);

  const currentStepName =
    currentStep === 1 ? 'Tahun Ajaran' :
    currentStep === 2 ? 'Data Guru' :
    currentStep === 3 ? 'Data Jurusan' :
    currentStep === 4 ? 'Data Tingkat' : 'Data Kelas';

  return (
    <div className="space-y-6">
      {/* Hidden Excel File Input for Current Step */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleImportStepExcel}
        className="hidden"
      />

      {/* Stepper Header Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {stepsMeta.map((item) => {
          const IconComponent = item.icon;
          const isCurrent = currentStep === item.step;
          return (
            <button
              key={item.step}
              onClick={() => onSelectStep(item.step)}
              className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                isCurrent
                  ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/30 ring-2 ring-amber-500/20 shadow-sm'
                  : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-bold ${
                    isCurrent
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {item.title}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {item.subtitle}
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 ml-1">
                {item.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Content Card for Active Step */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        {/* Card Header with Direct Excel (.xlsx) Template & Import Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                LANGKAH {currentStep} DARI 8
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {currentStep === 1 && 'Manajemen Data Tahun Ajaran & Semester'}
                {currentStep === 2 && 'Master Data Guru & Wali Kelas (NIP, Nama, Jabatan)'}
                {currentStep === 3 && 'Manajemen Data Jurusan / Peminatan SMA'}
                {currentStep === 4 && 'Manajemen Data Tingkat Kelas (Fase E & Fase F)'}
                {currentStep === 5 && 'Manajemen Data Rombongan Belajar (Kelas) Unik per Tahun Ajaran'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {currentStep === 1 && 'Atur tahun pelajaran aktif untuk dasar pengelompokan kelas dan buku induk.'}
              {currentStep === 2 && 'Data guru yang diinput di sini otomatis muncul sebagai pilihan dropdown Wali Kelas dan Ketua Jurusan.'}
              {currentStep === 3 && 'Daftar jurusan yang diinput akan muncul pada dropdown pembuatan Kelas dan input Siswa.'}
              {currentStep === 4 && 'Konfigurasi tingkat kelas X, XI, dan XII beserta target rombel.'}
              {currentStep === 5 && 'Setiap kelas memiliki ID Database unik yang terikat pada Tahun Ajaran. Jumlah kelas tiap jurusan dapat berbeda setiap tahunnya.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Direct Excel Template Download */}
            <button
              type="button"
              onClick={handleDownloadStepTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-2xs cursor-pointer"
              title={`Unduh Template Resmi Excel (.xlsx) untuk ${currentStepName}`}
            >
              <Download className="h-3.5 w-3.5 text-emerald-600" />
              <span>Template {currentStepName} (.xlsx)</span>
            </button>

            {/* Direct Excel Import Upload */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm cursor-pointer"
              title={`Impor berkas .xlsx untuk ${currentStepName}`}
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Impor .xlsx</span>
            </button>

            {currentStep === 5 && (
              <button
                type="button"
                onClick={() => setShowBatchClassModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg border border-amber-500/40 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-300 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Generate N Kelas per Tahun</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>+ Tambah {currentStepName}</span>
            </button>

            <button
              type="button"
              onClick={onNavigateToNext}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <span>Lanjut Langkah {currentStep + 1}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* STEP 1 TABLE: TAHUN AJARAN */}
        {currentStep === 1 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/60 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Tahun Ajaran</th>
                  <th className="py-3 px-4">Semester</th>
                  <th className="py-3 px-4">Kurikulum Acuan</th>
                  <th className="py-3 px-4">Status Operasional</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                {academicYears.map((ay) => (
                  <tr key={ay.id} className="hover:bg-slate-50/90 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-4 font-mono text-slate-500">{ay.id}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white font-mono">{ay.tahun}</td>
                    <td className="py-3 px-4">{ay.semester}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                        {ay.kurikulum}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {ay.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                          <CheckCircle className="h-3 w-3" /> Aktif
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSetActiveYear(ay.id)}
                          className="text-[11px] text-slate-500 hover:text-amber-600 underline cursor-pointer"
                        >
                          Jadikan Aktif
                        </button>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setEditingAcademicYear({ ...ay })}
                          className="p-1.5 text-slate-500 hover:text-amber-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          title="Edit Tahun Ajaran"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteTarget({
                              type: 'tahun_ajaran',
                              id: ay.id,
                              label: `${ay.tahun} (${ay.semester})`,
                            })
                          }
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                          title="Hapus Tahun Ajaran"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* STEP 2 TABLE: DATA GURU (NIP, NAMA LENGKAP, JABATAN WALI KELAS) */}
        {currentStep === 2 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/60 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase">
                  <th className="py-3 px-4">ID Guru</th>
                  <th className="py-3 px-4">NIP / NUPTK</th>
                  <th className="py-3 px-4">Nama Lengkap & Gelar</th>
                  <th className="py-3 px-4">Jabatan Wali Kelas / Tugas</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                {teachers.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/90 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-4 font-mono text-slate-500">{t.id}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">{t.nip}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{t.namaLengkap}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                        {t.jabatanWaliKelas}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setEditingTeacher({ ...t })}
                          className="p-1.5 text-slate-500 hover:text-amber-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          title="Edit Data Guru"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteTarget({
                              type: 'guru',
                              id: t.id,
                              label: t.namaLengkap,
                              sublabel: `NIP: ${t.nip}`,
                            })
                          }
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                          title="Hapus Data Guru"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* STEP 3 TABLE: JURUSAN */}
        {currentStep === 3 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/60 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase">
                  <th className="py-3 px-4">Kode</th>
                  <th className="py-3 px-4">Nama Lengkap Jurusan / Peminatan</th>
                  <th className="py-3 px-4">Ketua Program / Koordinator (Data Guru)</th>
                  <th className="py-3 px-4 text-center">Kuota Siswa</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                {departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-slate-50/90 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-mono">
                        {dept.kode}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{dept.nama}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{dept.ketuaJurusan}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold">{dept.kuotaSiswa} Siswa</td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setEditingDepartment({ ...dept })}
                          className="p-1.5 text-slate-500 hover:text-amber-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          title="Edit Jurusan"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteTarget({
                              type: 'jurusan',
                              id: dept.id,
                              label: `${dept.kode} - ${dept.nama}`,
                            })
                          }
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                          title="Hapus Jurusan"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* STEP 4 TABLE: TINGKAT KELAS */}
        {currentStep === 4 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/60 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase">
                  <th className="py-3 px-4">Tingkat</th>
                  <th className="py-3 px-4">Keterangan Fase Kurikulum</th>
                  <th className="py-3 px-4 text-center">Target Rombel</th>
                  <th className="py-3 px-4 text-center">Rombel Terdaftar</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                {gradeLevels.map((gl) => {
                  const actualClassesCount = schoolClasses.filter((c) => c.tingkat === gl.tingkat).length;
                  return (
                    <tr key={gl.id} className="hover:bg-slate-50/90 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-4">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 font-black font-mono">
                          {gl.tingkat}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{gl.keterangan}</td>
                      <td className="py-3 px-4 text-center font-mono font-bold">{gl.jumlahRombel} Rombel</td>
                      <td className="py-3 px-4 text-center font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {actualClassesCount} Kelas Aktif
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => setEditingGradeLevel({ ...gl })}
                            className="p-1.5 text-slate-500 hover:text-amber-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            title="Edit Tingkat"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteTarget({
                                type: 'tingkat',
                                id: gl.id,
                                label: `Tingkat ${gl.tingkat}`,
                              })
                            }
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                            title="Hapus Tingkat"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* STEP 5 TABLE: ROMBEL KELAS (UNIQUE DATABASE ID PER ACADEMIC YEAR) */}
        {currentStep === 5 && (
          <div>
            {/* Filter Bar by Tahun Ajaran */}
            <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-amber-500" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Filter Kelas per Tahun Ajaran:
                </span>
                <div className="flex flex-wrap items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setSelectedClassYearFilter('ALL')}
                    className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                      selectedClassYearFilter === 'ALL'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Semua Tahun ({schoolClasses.length})
                  </button>
                  {uniqueAcademicYearStrings.map((yr) => {
                    const count = schoolClasses.filter((c) => c.tahunAjaran === yr).length;
                    return (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => setSelectedClassYearFilter(yr)}
                        className={`px-2.5 py-1 rounded-md font-mono font-bold transition-colors cursor-pointer ${
                          selectedClassYearFilter === yr
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {yr} ({count} Kelas)
                      </button>
                    );
                  })}
                </div>
              </div>

              <span className="text-[11px] text-slate-500">
                Nama kelas tetap standar (misal <code className="font-mono font-bold">X-MIPA-1</code>), dengan <strong>ID Database unik</strong> di setiap Tahun Ajaran.
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/60 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase">
                    <th className="py-3 px-4">ID Database Unik</th>
                    <th className="py-3 px-4">Tahun Ajaran</th>
                    <th className="py-3 px-4">Nama Kelas</th>
                    <th className="py-3 px-4">Tingkat & Jurusan</th>
                    <th className="py-3 px-4">Wali Kelas & NIP</th>
                    <th className="py-3 px-4 text-center">Siswa Terdaftar</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                  {filteredSchoolClasses.map((sc) => {
                    const registeredStudents = students.filter(
                      (s) =>
                        s.previousEducation.classId === sc.id ||
                        (!s.previousEducation.classId && s.previousEducation.diterimaDiKelas === sc.namaKelas)
                    );
                    return (
                      <tr key={sc.id} className="hover:bg-slate-50/90 dark:hover:bg-slate-800/50">
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            <Hash className="h-3 w-3 text-amber-500" />
                            {sc.id}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                          {sc.tahunAjaran}
                        </td>
                        <td className="py-3 px-4 font-black text-slate-900 dark:text-white font-mono text-sm">
                          {sc.namaKelas}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-slate-700 dark:text-slate-300 font-semibold">
                            Tingkat {sc.tingkat} · {sc.jurusan}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900 dark:text-white">{sc.waliKelas}</div>
                          <div className="text-[10px] font-mono text-slate-400">NIP. {sc.nipWaliKelas}</div>
                        </td>
                        <td className="py-3 px-4 text-center font-mono">
                          <span className="font-bold text-slate-900 dark:text-white">{registeredStudents.length}</span>
                          <span className="text-slate-400"> / {sc.kapasitas} Siswa</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => setEditingSchoolClass({ ...sc })}
                              className="p-1.5 text-slate-500 hover:text-amber-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                              title="Edit Kelas"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteTarget({
                                  type: 'kelas',
                                  id: sc.id,
                                  label: sc.namaKelas,
                                  sublabel: `ID: ${sc.id} · TA ${sc.tahunAjaran}`,
                                  affectedStudentCount: registeredStudents.length,
                                  classObj: sc,
                                })
                              }
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                              title="Hapus Kelas"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================================
          MODAL KONFIRMASI PENGHAPUSAN MASTER DATA (AMAN BAGI BUKU INDUK SISWA)
          ====================================================================== */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Konfirmasi Penghapusan Data Master
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Anda akan menghapus <strong>{deleteTarget.label}</strong>{' '}
                  {deleteTarget.sublabel && <span className="font-mono">({deleteTarget.sublabel})</span>}.
                </p>
              </div>
            </div>

            {deleteTarget.type === 'kelas' && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 dark:border-amber-900/50 dark:bg-amber-950/30 text-xs space-y-1.5">
                <div className="font-bold text-amber-900 dark:text-amber-300">
                  Dampak Terhadap Siswa di Kelas Ini ({deleteTarget.affectedStudentCount || 0} Siswa Terdaftar):
                </div>
                <p className="text-amber-800 dark:text-amber-200/90 leading-relaxed">
                  Sesuai pengaturan perlindungan Buku Induk, <strong>data siswa di kelas tersebut TIDAK dihapus permanen</strong>, melainkan status kelasnya akan <strong>dikosongkan (Tanpa Kelas / Belum Ditentukan)</strong> agar dapat dipindahkan ke kelas/rombel lain.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-rose-600 text-white hover:bg-rose-500 shadow-sm cursor-pointer"
              >
                {deleteTarget.type === 'kelas'
                  ? 'Ya, Hapus Kelas & Kosongkan Kelas Siswa'
                  : 'Ya, Hapus Data Master'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================
          MODAL GENERATE N ROMBEL FLEKSIBEL PER TAHUN AJARAN
          ====================================================================== */}
      {showBatchClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Generate Beberapa Kelas Sekaligus per Tahun Ajaran
                </h3>
                <p className="text-[11px] text-slate-500">
                  Mendukung jumlah kelas berbeda tiap tahun (misal tahun ini 7 kelas MIPA, tahun depan 6 kelas MIPA)
                </p>
              </div>
              <button onClick={() => setShowBatchClassModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleBatchGenerateClasses} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Pilih Tahun Ajaran (dari Data Tahun Ajaran)</label>
                <select
                  value={batchTahunAjaran}
                  onChange={(e) => setBatchTahunAjaran(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-mono font-bold"
                >
                  {Array.from(new Set(academicYears.map((y) => y.tahun))).map((th) => (
                    <option key={th} value={th}>
                      Tahun Ajaran {th}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Pilih Tingkat (Data Tingkat)</label>
                  <select
                    value={batchTingkat}
                    onChange={(e) => setBatchTingkat(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-bold"
                  >
                    {gradeLevels.map((gl) => (
                      <option key={gl.id} value={gl.tingkat}>
                        Tingkat {gl.tingkat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Pilih Jurusan (Data Jurusan)</label>
                  <select
                    value={batchJurusan}
                    onChange={(e) => setBatchJurusan(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-bold"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.kode}>
                        {d.kode} ({d.nama})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Jumlah Kelas Tahun Ini</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={batchJumlahKelas}
                    onChange={(e) => setBatchJumlahKelas(parseInt(e.target.value) || 1)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-400">
                    Hasil: {batchTingkat}-{batchJurusan}-1 s/d {batchTingkat}-{batchJurusan}-{batchJumlahKelas}
                  </span>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Kapasitas per Kelas</label>
                  <input
                    type="number"
                    min={10}
                    max={50}
                    value={batchKapasitas}
                    onChange={(e) => setBatchKapasitas(parseInt(e.target.value) || 36)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowBatchClassModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 cursor-pointer"
                >
                  Generate {batchJumlahKelas} Kelas (ID Unik)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================================
          ADD MODAL FOR STEPS 1 - 5 (WITH RELATIONAL DROPDOWNS)
          ====================================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {currentStep === 1 && 'Tambah Tahun Ajaran Baru'}
                {currentStep === 2 && 'Tambah Master Data Guru'}
                {currentStep === 3 && 'Tambah Jurusan / Peminatan'}
                {currentStep === 4 && 'Tambah Tingkat Kelas'}
                {currentStep === 5 && 'Tambah Rombel Kelas Baru (ID Unik)'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            {currentStep === 1 && (
              <form onSubmit={handleAddAcademicYear} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Tahun Ajaran (YYYY/YYYY) *</label>
                  <input
                    type="text"
                    required
                    value={newTahun}
                    onChange={(e) => setNewTahun(e.target.value)}
                    placeholder="2025/2026"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Semester</label>
                  <select
                    value={newSemester}
                    onChange={(e) => setNewSemester(e.target.value as 'Ganjil' | 'Genap')}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  >
                    <option value="Ganjil">Semester Ganjil</option>
                    <option value="Genap">Semester Genap</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Kurikulum</label>
                  <select
                    value={newKurikulum}
                    onChange={(e) => setNewKurikulum(e.target.value as 'Kurikulum Merdeka' | 'Kurikulum 2013')}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  >
                    <option value="Kurikulum Merdeka">Kurikulum Merdeka</option>
                    <option value="Kurikulum 2013">Kurikulum 2013</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-3">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-lg border">Batal</button>
                  <button type="submit" className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold">Simpan</button>
                </div>
              </form>
            )}

            {currentStep === 2 && (
              <form onSubmit={handleAddTeacher} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1">NIP / NUPTK Guru *</label>
                  <input
                    type="text"
                    required
                    value={newGuruNip}
                    onChange={(e) => setNewGuruNip(e.target.value)}
                    placeholder="Contoh: 197804122005011002"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Nama Lengkap & Gelar Akademik *</label>
                  <input
                    type="text"
                    required
                    value={newGuruNama}
                    onChange={(e) => setNewGuruNama(e.target.value)}
                    placeholder="Contoh: Drs. Bambang Hermawan, M.Pd."
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Jabatan Wali Kelas / Tugas *</label>
                  <input
                    type="text"
                    required
                    value={newGuruJabatan}
                    onChange={(e) => setNewGuruJabatan(e.target.value)}
                    placeholder="Contoh: Wali Kelas X / Wali Kelas XI"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-3">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-lg border">Batal</button>
                  <button type="submit" className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold">Simpan Guru</button>
                </div>
              </form>
            )}

            {currentStep === 3 && (
              <form onSubmit={handleAddDepartment} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Kode Jurusan *</label>
                  <input
                    type="text"
                    required
                    value={newJurusanKode}
                    onChange={(e) => setNewJurusanKode(e.target.value.toUpperCase())}
                    placeholder="Contoh: MIPA / IPS / BAHASA / TEKNIK"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Nama Lengkap Jurusan *</label>
                  <input
                    type="text"
                    required
                    value={newJurusanNama}
                    onChange={(e) => setNewJurusanNama(e.target.value)}
                    placeholder="Contoh: Matematika dan Ilmu Pengetahuan Alam"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Ketua Jurusan (Pilih dari Dropdown Data Guru)</label>
                  <select
                    value={newKetuaJurusan}
                    onChange={(e) => setNewKetuaJurusan(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-semibold"
                  >
                    <option value="">-- Pilih Guru dari Master Data Guru --</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.namaLengkap}>
                        {t.namaLengkap} (NIP: {t.nip})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Kuota Daya Tampung Siswa</label>
                  <input
                    type="number"
                    value={newJurusanKuota}
                    onChange={(e) => setNewJurusanKuota(parseInt(e.target.value) || 180)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-mono"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-3">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-lg border">Batal</button>
                  <button type="submit" className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold">Simpan</button>
                </div>
              </form>
            )}

            {currentStep === 4 && (
              <form onSubmit={handleAddGradeLevel} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Tingkat Kelas *</label>
                  <input
                    type="text"
                    required
                    value={newTingkat}
                    onChange={(e) => setNewTingkat(e.target.value.toUpperCase())}
                    placeholder="Contoh: X / XI / XII"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Keterangan Fase</label>
                  <input
                    type="text"
                    required
                    value={newTingkatKeterangan}
                    onChange={(e) => setNewTingkatKeterangan(e.target.value)}
                    placeholder="Contoh: Tingkat X (Fase E - Kurikulum Merdeka)"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Target Jumlah Rombel</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={newTingkatRombel}
                    onChange={(e) => setNewTingkatRombel(parseInt(e.target.value) || 7)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-mono"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-3">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-lg border">Batal</button>
                  <button type="submit" className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold">Simpan</button>
                </div>
              </form>
            )}

            {currentStep === 5 && (
              <form onSubmit={handleAddSchoolClass} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Pilih Tahun Ajaran (dari Data Tahun Ajaran) *</label>
                  <select
                    value={newKelasTahunAjaran}
                    onChange={(e) => setNewKelasTahunAjaran(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-mono font-bold"
                  >
                    {Array.from(new Set(academicYears.map((y) => y.tahun))).map((th) => (
                      <option key={th} value={th}>
                        {th}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Tingkat (Data Tingkat) *</label>
                    <select
                      value={newKelasTingkat}
                      onChange={(e) => setNewKelasTingkat(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-bold"
                    >
                      {gradeLevels.map((gl) => (
                        <option key={gl.id} value={gl.tingkat}>
                          Tingkat {gl.tingkat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Jurusan (Data Jurusan) *</label>
                    <select
                      value={newKelasJurusan}
                      onChange={(e) => setNewKelasJurusan(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-bold"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.kode}>
                          {d.kode}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Nama Kelas / Rombel (Tetap Standar) *</label>
                  <input
                    type="text"
                    required
                    value={newNamaKelas}
                    onChange={(e) => setNewNamaKelas(e.target.value)}
                    placeholder={`Contoh: ${newKelasTingkat}-${newKelasJurusan}-1`}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-400">
                    ID Database unik akan otomatis dibuat: <code className="font-mono">{generateUniqueClassId(newKelasTahunAjaran, newNamaKelas || `${newKelasTingkat}-${newKelasJurusan}-1`)}</code>
                  </span>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Pilih Wali Kelas (Dropdown dari Data Guru) *</label>
                  <select
                    value={newWaliKelas}
                    onChange={(e) => {
                      const chosenName = e.target.value;
                      const foundTeacher = teachers.find((t) => t.namaLengkap === chosenName);
                      setNewWaliKelas(chosenName);
                      if (foundTeacher) {
                        setNewNipWaliKelas(foundTeacher.nip);
                      }
                    }}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-semibold"
                  >
                    <option value="">-- Pilih Guru Wali Kelas --</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.namaLengkap}>
                        {t.namaLengkap} — NIP: {t.nip} ({t.jabatanWaliKelas})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">NIP Wali Kelas (Otomatis)</label>
                    <input
                      type="text"
                      value={newNipWaliKelas}
                      onChange={(e) => setNewNipWaliKelas(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Kapasitas Siswa</label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={newKelasKapasitas}
                      onChange={(e) => setNewKelasKapasitas(parseInt(e.target.value) || 36)}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-lg border">Batal</button>
                  <button type="submit" className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold">Simpan Kelas</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ======================================================================
          EDIT MODALS FOR STEPS 1 - 5
          ====================================================================== */}

      {/* EDIT MODAL STEP 1: Tahun Ajaran */}
      {editingAcademicYear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Data Tahun Ajaran</h3>
              <button onClick={() => setEditingAcademicYear(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEditAcademicYear} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Tahun Ajaran</label>
                <input
                  type="text"
                  required
                  value={editingAcademicYear.tahun}
                  onChange={(e) => setEditingAcademicYear({ ...editingAcademicYear, tahun: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Semester</label>
                <select
                  value={editingAcademicYear.semester}
                  onChange={(e) => setEditingAcademicYear({ ...editingAcademicYear, semester: e.target.value as 'Ganjil' | 'Genap' })}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                >
                  <option value="Ganjil">Semester Ganjil</option>
                  <option value="Genap">Semester Genap</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Kurikulum</label>
                <select
                  value={editingAcademicYear.kurikulum}
                  onChange={(e) => setEditingAcademicYear({ ...editingAcademicYear, kurikulum: e.target.value as 'Kurikulum Merdeka' | 'Kurikulum 2013' })}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                >
                  <option value="Kurikulum Merdeka">Kurikulum Merdeka</option>
                  <option value="Kurikulum 2013">Kurikulum 2013</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setEditingAcademicYear(null)} className="px-4 py-2 rounded-lg border">Batal</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL STEP 2: Guru */}
      {editingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Data Guru</h3>
              <button onClick={() => setEditingTeacher(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEditTeacher} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">NIP / NUPTK</label>
                <input
                  type="text"
                  required
                  value={editingTeacher.nip}
                  onChange={(e) => setEditingTeacher({ ...editingTeacher, nip: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  required
                  value={editingTeacher.namaLengkap}
                  onChange={(e) => setEditingTeacher({ ...editingTeacher, namaLengkap: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-semibold"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Jabatan Wali Kelas</label>
                <input
                  type="text"
                  required
                  value={editingTeacher.jabatanWaliKelas}
                  onChange={(e) => setEditingTeacher({ ...editingTeacher, jabatanWaliKelas: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setEditingTeacher(null)} className="px-4 py-2 rounded-lg border">Batal</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL STEP 3: Jurusan */}
      {editingDepartment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Data Jurusan</h3>
              <button onClick={() => setEditingDepartment(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEditDepartment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Kode Jurusan</label>
                <input
                  type="text"
                  required
                  value={editingDepartment.kode}
                  onChange={(e) => setEditingDepartment({ ...editingDepartment, kode: e.target.value.toUpperCase() })}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Nama Lengkap Jurusan</label>
                <input
                  type="text"
                  required
                  value={editingDepartment.nama}
                  onChange={(e) => setEditingDepartment({ ...editingDepartment, nama: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Ketua Jurusan (Pilih dari Data Guru)</label>
                <select
                  value={editingDepartment.ketuaJurusan}
                  onChange={(e) => setEditingDepartment({ ...editingDepartment, ketuaJurusan: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-semibold"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.namaLengkap}>
                      {t.namaLengkap} (NIP: {t.nip})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Kuota Siswa</label>
                <input
                  type="number"
                  required
                  value={editingDepartment.kuotaSiswa}
                  onChange={(e) => setEditingDepartment({ ...editingDepartment, kuotaSiswa: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setEditingDepartment(null)} className="px-4 py-2 rounded-lg border">Batal</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL STEP 4: Tingkat */}
      {editingGradeLevel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Data Tingkat</h3>
              <button onClick={() => setEditingGradeLevel(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEditGradeLevel} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Tingkat Kelas</label>
                <input
                  type="text"
                  required
                  value={editingGradeLevel.tingkat}
                  onChange={(e) => setEditingGradeLevel({ ...editingGradeLevel, tingkat: e.target.value.toUpperCase() })}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Keterangan Fase</label>
                <input
                  type="text"
                  required
                  value={editingGradeLevel.keterangan}
                  onChange={(e) => setEditingGradeLevel({ ...editingGradeLevel, keterangan: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Target Jumlah Rombel</label>
                <input
                  type="number"
                  required
                  value={editingGradeLevel.jumlahRombel}
                  onChange={(e) => setEditingGradeLevel({ ...editingGradeLevel, jumlahRombel: parseInt(e.target.value) || 1 })}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setEditingGradeLevel(null)} className="px-4 py-2 rounded-lg border">Batal</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL STEP 5: Kelas */}
      {editingSchoolClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Data Kelas</h3>
                <span className="text-[10px] font-mono text-slate-400">ID Database: {editingSchoolClass.id}</span>
              </div>
              <button onClick={() => setEditingSchoolClass(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEditSchoolClass} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Tahun Ajaran</label>
                <select
                  value={editingSchoolClass.tahunAjaran}
                  onChange={(e) => setEditingSchoolClass({ ...editingSchoolClass, tahunAjaran: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-mono font-bold"
                >
                  {Array.from(new Set(academicYears.map((y) => y.tahun))).map((th) => (
                    <option key={th} value={th}>
                      {th}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Nama Kelas / Rombel</label>
                <input
                  type="text"
                  required
                  value={editingSchoolClass.namaKelas}
                  onChange={(e) => setEditingSchoolClass({ ...editingSchoolClass, namaKelas: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-mono font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Tingkat (Data Tingkat)</label>
                  <select
                    value={editingSchoolClass.tingkat}
                    onChange={(e) => setEditingSchoolClass({ ...editingSchoolClass, tingkat: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  >
                    {gradeLevels.map((gl) => (
                      <option key={gl.id} value={gl.tingkat}>
                        Tingkat {gl.tingkat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Jurusan (Data Jurusan)</label>
                  <select
                    value={editingSchoolClass.jurusan}
                    onChange={(e) => setEditingSchoolClass({ ...editingSchoolClass, jurusan: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.kode}>
                        {d.kode}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Pilih Wali Kelas (dari Data Guru)</label>
                <select
                  value={editingSchoolClass.waliKelas}
                  onChange={(e) => {
                    const chosenName = e.target.value;
                    const foundTeacher = teachers.find((t) => t.namaLengkap === chosenName);
                    setEditingSchoolClass({
                      ...editingSchoolClass,
                      waliKelas: chosenName,
                      nipWaliKelas: foundTeacher ? foundTeacher.nip : editingSchoolClass.nipWaliKelas,
                    });
                  }}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-semibold"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.namaLengkap}>
                      {t.namaLengkap} — NIP: {t.nip}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">NIP Wali Kelas</label>
                  <input
                    type="text"
                    required
                    value={editingSchoolClass.nipWaliKelas}
                    onChange={(e) => setEditingSchoolClass({ ...editingSchoolClass, nipWaliKelas: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Kapasitas</label>
                  <input
                    type="number"
                    required
                    value={editingSchoolClass.kapasitas}
                    onChange={(e) => setEditingSchoolClass({ ...editingSchoolClass, kapasitas: parseInt(e.target.value) || 36 })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setEditingSchoolClass(null)} className="px-4 py-2 rounded-lg border">Batal</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
