import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Award, 
  BookOpen, 
  Save, 
  Calculator, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp,
  HeartHandshake,
  FileSpreadsheet,
  Plus,
  Trash2,
  Edit3,
  Settings2,
  X,
  Calendar,
  School,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import { 
  StudentFullRecord, 
  SubjectGrade, 
  SemesterAcademicRecord,
  ExtracurricularGrade,
  MasterSubjectRecord
} from '../../types/buku-induk';
import { calculatePredicate, STANDARD_SUBJECTS_MIPA, DEFAULT_MASTER_SUBJECTS } from '../../data/mock-data';

interface AcademicGradeViewProps {
  students: StudentFullRecord[];
  masterSubjects?: MasterSubjectRecord[];
  onUpdateMasterSubjects?: (updated: MasterSubjectRecord[]) => void;
  onUpdateStudent?: (updated: StudentFullRecord) => void;
  onOpenImportModal?: () => void;
  onShowNotification: (title: string, body: string, type: 'success' | 'info' | 'warning' | 'danger') => void;
}

export const AcademicGradeView: React.FC<AcademicGradeViewProps> = ({
  students,
  masterSubjects = DEFAULT_MASTER_SUBJECTS,
  onUpdateMasterSubjects,
  onUpdateStudent,
  onOpenImportModal,
  onShowNotification,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [selectedSemester, setSelectedSemester] = useState<number>(1);

  const currentStudent = students.find((s) => s.id === selectedStudentId) || students[0];
  const academicRecord: SemesterAcademicRecord | undefined = currentStudent?.academicRecords?.[selectedSemester];

  // Local state for semester metadata (Tahun Ajaran & Kelas per semester)
  const [semesterTahunAjaran, setSemesterTahunAjaran] = useState<string>('2024/2025');
  const [semesterKelas, setSemesterKelas] = useState<string>('X MIPA 1');
  const [keteranganSemester, setKeteranganSemester] = useState<string>('');
  const [tanggalRapor, setTanggalRapor] = useState<string>('');

  // Local state for interactive editing of subject grades
  const [editableGrades, setEditableGrades] = useState<SubjectGrade[]>([]);

  // Local state for extracurriculars
  const [editableEkskul, setEditableEkskul] = useState<ExtracurricularGrade[]>([]);

  // Local state for attendance
  const [editableAttendance, setEditableAttendance] = useState<{
    sakit: number;
    izin: number;
    tanpaKeterangan: number;
  }>({ sakit: 0, izin: 0, tanpaKeterangan: 0 });

  // Local state for teacher note
  const [catatanWaliKelas, setCatatanWaliKelas] = useState<string>('');

  // Add / Edit Mapel Modal State
  const [showMapelModal, setShowMapelModal] = useState<boolean>(false);
  const [editingMapelCode, setEditingMapelCode] = useState<string | null>(null);
  const [selectedMasterMapelId, setSelectedMasterMapelId] = useState<string>('custom');
  const [mapelNama, setMapelNama] = useState<string>('');
  const [mapelKelompok, setMapelKelompok] = useState<'A' | 'B' | 'C' | 'Lintas Minat'>('A');
  const [mapelKkm, setMapelKkm] = useState<number>(75);
  const [mapelKkmK, setMapelKkmK] = useState<number>(75);
  const [mapelNilaiP, setMapelNilaiP] = useState<number>(85);
  const [mapelNilaiK, setMapelNilaiK] = useState<number>(85);
  const [mapelKetentuan, setMapelKetentuan] = useState<'Tuntas' | 'Belum Tuntas'>('Tuntas');

  // Master Mata Pelajaran Manager Modal State
  const [showMasterSubjectModal, setShowMasterSubjectModal] = useState<boolean>(false);
  const [editingMasterId, setEditingMasterId] = useState<string | null>(null);
  const [masterFormNama, setMasterFormNama] = useState<string>('');
  const [masterFormKelompok, setMasterFormKelompok] = useState<'A' | 'B' | 'C' | 'Lintas Minat'>('A');
  const [masterFormKkmP, setMasterFormKkmP] = useState<number>(75);
  const [masterFormKkmK, setMasterFormKkmK] = useState<number>(75);
  const [selectedMasterIds, setSelectedMasterIds] = useState<string[]>([]);
  const [confirmClearMasterMode, setConfirmClearMasterMode] = useState<'selected' | 'all' | null>(null);

  // Add / Edit Ekskul Modal state
  const [showEkskulModal, setShowEkskulModal] = useState<boolean>(false);
  const [editingEkskulIndex, setEditingEkskulIndex] = useState<number | null>(null);
  const [ekskulNama, setEkskulNama] = useState<string>('');
  const [ekskulPredikat, setEkskulPredikat] = useState<'Sangat Baik' | 'Baik' | 'Cukup' | 'Kurang'>('Baik');
  const [ekskulKeterangan, setEkskulKeterangan] = useState<string>('Aktif mengikuti kegiatan');

  // Helper to determine default Ketentuan ('Tuntas' / 'Belum Tuntas')
  const computeKetentuan = (nilaiP: number, kkmP: number, nilaiK: number, kkmK: number): 'Tuntas' | 'Belum Tuntas' => {
    return nilaiP >= kkmP && nilaiK >= kkmK ? 'Tuntas' : 'Belum Tuntas';
  };

  // Sync states whenever selectedStudentId or selectedSemester changes
  useEffect(() => {
    const defaultTingkat = selectedSemester <= 2 ? 'X' : selectedSemester <= 4 ? 'XI' : 'XII';
    const defaultKelas = currentStudent?.previousEducation?.diterimaDiKelas
      ? currentStudent.previousEducation.diterimaDiKelas.replace(/^(X|XI|XII)/, defaultTingkat)
      : `${defaultTingkat} MIPA 1`;

    if (academicRecord) {
      setSemesterTahunAjaran(academicRecord.tahunAjaran || currentStudent?.previousEducation?.tahunAjaranMasuk || '2024/2025');
      setSemesterKelas(academicRecord.kelas || defaultKelas);
      setKeteranganSemester(academicRecord.keteranganSemester || '');
      setTanggalRapor(academicRecord.tanggalRapor || '');
      setEditableGrades(
        (academicRecord.grades || []).map((g) => {
          const kkmK = g.kkmKeterampilan ?? g.kkm;
          return {
            ...g,
            kkmKeterampilan: kkmK,
            ketentuan: g.ketentuan || computeKetentuan(g.nilaiPengetahuan, g.kkm, g.nilaiKeterampilan, kkmK),
          };
        })
      );
      setEditableEkskul(academicRecord.extracurriculars || []);
      setEditableAttendance(academicRecord.attendance || { sakit: 0, izin: 0, tanpaKeterangan: 0 });
      setCatatanWaliKelas(academicRecord.catatanWaliKelas || 'Menunjukkan kemajuan belajar yang baik.');
    } else {
      setSemesterTahunAjaran(currentStudent?.previousEducation?.tahunAjaranMasuk || '2024/2025');
      setSemesterKelas(defaultKelas);
      setKeteranganSemester('');
      setTanggalRapor('');
      setEditableGrades([]);
      setEditableEkskul([]);
      setEditableAttendance({ sakit: 0, izin: 0, tanpaKeterangan: 0 });
      setCatatanWaliKelas('');
    }
  }, [selectedStudentId, selectedSemester, currentStudent]);

  const handleLoadStandardSubjects = () => {
    const sourceList = masterSubjects.length > 0 ? masterSubjects : DEFAULT_MASTER_SUBJECTS;
    const templateGrades: SubjectGrade[] = sourceList.map((sub, idx) => ({
      mapelCode: sub.id || STANDARD_SUBJECTS_MIPA[idx]?.code || `MP-${idx + 1}`,
      mapelName: sub.namaMapel.replace(/^Lintas Minat:\s*/i, ''),
      kelompok: sub.kelompok,
      kkm: sub.kkmDefault || 75,
      kkmKeterampilan: sub.kkmKeterampilanDefault || sub.kkmDefault || 75,
      nilaiPengetahuan: 82,
      predikatPengetahuan: calculatePredicate(82, sub.kkmDefault || 75),
      nilaiKeterampilan: 84,
      predikatKeterampilan: calculatePredicate(84, sub.kkmKeterampilanDefault || 75),
      ketentuan: 'Tuntas',
      deskripsiKemajuan: 'Menunjukkan penguasaan kompetensi dengan baik.',
    }));
    setEditableGrades(templateGrades);
    if (editableEkskul.length === 0) {
      setEditableEkskul([
        { namaKegiatan: 'KEPRAMUKAAN', predikat: 'Baik', keterangan: 'Aktif mengikuti kegiatan kepramukaan' },
      ]);
    }
    onShowNotification(
      'Template Mapel Dimuat',
      `Daftar mata pelajaran (${templateGrades.length} mapel) berhasil dimuat ke Semester ${selectedSemester}.`,
      'info'
    );
  };

  const handleClearSemesterGrades = () => {
    setEditableGrades([]);
    onShowNotification(
      'Daftar Nilai Dikosongkan',
      `Daftar nilai mata pelajaran pada Semester ${selectedSemester} telah dikosongkan. Klik Simpan Nilai jika ingin memperbarui ke database.`,
      'warning'
    );
  };

  const handleScoreChange = (
    mapelCode: string,
    field: 'nilaiPengetahuan' | 'nilaiKeterampilan' | 'kkm' | 'kkmKeterampilan' | 'ketentuan' | 'kelompok' | 'mapelName',
    val: string | number
  ) => {
    setEditableGrades((prev) =>
      prev.map((g) => {
        if (g.mapelCode !== mapelCode) return g;
        const updated: SubjectGrade = { ...g, [field]: val };
        const kkmP = updated.kkm || 70;
        const kkmK = updated.kkmKeterampilan ?? kkmP;

        if (field === 'nilaiPengetahuan' || field === 'kkm') {
          updated.predikatPengetahuan = calculatePredicate(updated.nilaiPengetahuan, kkmP);
        }
        if (field === 'nilaiKeterampilan' || field === 'kkmKeterampilan' || field === 'kkm') {
          updated.predikatKeterampilan = calculatePredicate(updated.nilaiKeterampilan, kkmK);
        }
        if (field !== 'ketentuan') {
          updated.ketentuan = computeKetentuan(updated.nilaiPengetahuan, kkmP, updated.nilaiKeterampilan, kkmK);
        }
        return updated;
      })
    );
  };

  const handleDeleteGrade = (mapelCode: string) => {
    setEditableGrades((prev) => prev.filter((g) => g.mapelCode !== mapelCode));
    onShowNotification('Mapel Dihapus', 'Mata pelajaran berhasil dihapus dari rekap semester.', 'info');
  };

  const openAddMapelModal = () => {
    setEditingMapelCode(null);
    setSelectedMasterMapelId('custom');
    setMapelNama('');
    setMapelKelompok('A');
    setMapelKkm(75);
    setMapelKkmK(75);
    setMapelNilaiP(85);
    setMapelNilaiK(85);
    setMapelKetentuan('Tuntas');
    setShowMapelModal(true);
  };

  const openEditMapelModal = (grade: SubjectGrade) => {
    setEditingMapelCode(grade.mapelCode);
    const matchedMaster = masterSubjects.find(
      (m) => m.namaMapel.toLowerCase() === grade.mapelName.toLowerCase()
    );
    setSelectedMasterMapelId(matchedMaster ? matchedMaster.id : 'custom');
    setMapelNama(grade.mapelName);
    setMapelKelompok(grade.kelompok);
    setMapelKkm(grade.kkm);
    setMapelKkmK(grade.kkmKeterampilan ?? grade.kkm);
    setMapelNilaiP(grade.nilaiPengetahuan);
    setMapelNilaiK(grade.nilaiKeterampilan);
    setMapelKetentuan(
      grade.ketentuan ||
        computeKetentuan(
          grade.nilaiPengetahuan,
          grade.kkm,
          grade.nilaiKeterampilan,
          grade.kkmKeterampilan ?? grade.kkm
        )
    );
    setShowMapelModal(true);
  };

  const handleSelectMasterSubjectInForm = (masterId: string) => {
    setSelectedMasterMapelId(masterId);
    if (masterId === 'custom') return;
    const found = masterSubjects.find((m) => m.id === masterId);
    if (found) {
      setMapelNama(found.namaMapel.replace(/^Lintas Minat:\s*/i, ''));
      setMapelKelompok(found.kelompok);
      setMapelKkm(found.kkmDefault);
      setMapelKkmK(found.kkmKeterampilanDefault);
      setMapelKetentuan(
        computeKetentuan(mapelNilaiP, found.kkmDefault, mapelNilaiK, found.kkmKeterampilanDefault)
      );
    }
  };

  const handleSaveMapelModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapelNama.trim()) return;

    const kkmP = Number(mapelKkm) || 75;
    const kkmK = Number(mapelKkmK) || kkmP;
    const nilaiP = Math.min(100, Math.max(0, Number(mapelNilaiP) || 0));
    const nilaiK = Math.min(100, Math.max(0, Number(mapelNilaiK) || 0));

    if (editingMapelCode) {
      setEditableGrades((prev) =>
        prev.map((g) => {
          if (g.mapelCode !== editingMapelCode) return g;
          return {
            ...g,
            mapelName: mapelNama.trim(),
            kelompok: mapelKelompok,
            kkm: kkmP,
            kkmKeterampilan: kkmK,
            nilaiPengetahuan: nilaiP,
            predikatPengetahuan: calculatePredicate(nilaiP, kkmP),
            nilaiKeterampilan: nilaiK,
            predikatKeterampilan: calculatePredicate(nilaiK, kkmK),
            ketentuan: mapelKetentuan,
          };
        })
      );
      onShowNotification(
        'Mapel & Nilai Diperbarui',
        `Data mata pelajaran ${mapelNama.trim()} berhasil diperbarui.`,
        'success'
      );
    } else {
      const newGrade: SubjectGrade = {
        mapelCode: `MP-${Date.now()}`,
        mapelName: mapelNama.trim(),
        kelompok: mapelKelompok,
        kkm: kkmP,
        kkmKeterampilan: kkmK,
        nilaiPengetahuan: nilaiP,
        predikatPengetahuan: calculatePredicate(nilaiP, kkmP),
        nilaiKeterampilan: nilaiK,
        predikatKeterampilan: calculatePredicate(nilaiK, kkmK),
        ketentuan: mapelKetentuan,
        deskripsiKemajuan: 'Menunjukkan penguasaan materi pembelajaran yang memuaskan.',
      };
      setEditableGrades((prev) => [...prev, newGrade]);
      onShowNotification(
        'Mapel Baru Ditambahkan',
        `${newGrade.mapelName} berhasil ditambahkan ke Semester ${selectedSemester}.`,
        'success'
      );
    }

    setShowMapelModal(false);
    setEditingMapelCode(null);
  };

  // Master Subject CRUD inside Modal
  const handleSaveMasterSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterFormNama.trim() || !onUpdateMasterSubjects) return;

    if (editingMasterId) {
      const updated = masterSubjects.map((m) =>
        m.id === editingMasterId
          ? {
              ...m,
              namaMapel: masterFormNama.trim(),
              kelompok: masterFormKelompok,
              kkmDefault: Number(masterFormKkmP) || 75,
              kkmKeterampilanDefault: Number(masterFormKkmK) || 75,
            }
          : m
      );
      onUpdateMasterSubjects(updated);
      onShowNotification('Master Mapel Diperbarui', `${masterFormNama} berhasil diperbarui.`, 'success');
    } else {
      const newMaster: MasterSubjectRecord = {
        id: `MSUB-${Date.now()}`,
        namaMapel: masterFormNama.trim(),
        kelompok: masterFormKelompok,
        kkmDefault: Number(masterFormKkmP) || 75,
        kkmKeterampilanDefault: Number(masterFormKkmK) || 75,
      };
      onUpdateMasterSubjects([...masterSubjects, newMaster]);
      onShowNotification('Master Mapel Ditambahkan', `${masterFormNama} ditambahkan ke daftar Master Mapel.`, 'success');
    }

    setEditingMasterId(null);
    setMasterFormNama('');
    setMasterFormKelompok('A');
    setMasterFormKkmP(75);
    setMasterFormKkmK(75);
  };

  const handleEditMasterItem = (item: MasterSubjectRecord) => {
    setEditingMasterId(item.id);
    setMasterFormNama(item.namaMapel);
    setMasterFormKelompok(item.kelompok);
    setMasterFormKkmP(item.kkmDefault);
    setMasterFormKkmK(item.kkmKeterampilanDefault);
  };

  const handleDeleteMasterItem = (id: string, nama: string) => {
    if (!onUpdateMasterSubjects) return;
    onUpdateMasterSubjects(masterSubjects.filter((m) => m.id !== id));
    setSelectedMasterIds((prev) => prev.filter((item) => item !== id));
    onShowNotification('Master Mapel Dihapus', `${nama} dihapus dari daftar Master Mapel.`, 'info');
  };

  const handleToggleMasterRowSelect = (id: string) => {
    setSelectedMasterIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleAllMasterSelect = () => {
    if (selectedMasterIds.length === masterSubjects.length && masterSubjects.length > 0) {
      setSelectedMasterIds([]);
    } else {
      setSelectedMasterIds(masterSubjects.map((m) => m.id));
    }
  };

  const handleExecuteBulkDeleteMaster = () => {
    if (!onUpdateMasterSubjects || !confirmClearMasterMode) return;
    if (confirmClearMasterMode === 'all') {
      onUpdateMasterSubjects([]);
      setSelectedMasterIds([]);
      onShowNotification(
        'Master Mapel Dikosongkan',
        'Seluruh daftar Master Mata Pelajaran berhasil dikosongkan.',
        'warning'
      );
    } else {
      const remaining = masterSubjects.filter((m) => !selectedMasterIds.includes(m.id));
      onUpdateMasterSubjects(remaining);
      onShowNotification(
        'Mapel Terpilih Dihapus',
        `${selectedMasterIds.length} mata pelajaran telah dihapus dari Master Mapel.`,
        'warning'
      );
      setSelectedMasterIds([]);
    }
    setConfirmClearMasterMode(null);
  };

  const handleResetStandardMasterSubjects = () => {
    if (!onUpdateMasterSubjects) return;
    onUpdateMasterSubjects(DEFAULT_MASTER_SUBJECTS);
    setSelectedMasterIds([]);
    onShowNotification(
      'Master Mapel Direset',
      `Daftar Master Mata Pelajaran telah dikembalikan ke standar SMA (${DEFAULT_MASTER_SUBJECTS.length} mapel).`,
      'success'
    );
  };

  // Ekskul Add / Edit handlers
  const openAddEkskulModal = () => {
    setEditingEkskulIndex(null);
    setEkskulNama('');
    setEkskulPredikat('Baik');
    setEkskulKeterangan('Aktif mengikuti kegiatan');
    setShowEkskulModal(true);
  };

  const openEditEkskulModal = (ekskul: ExtracurricularGrade, index: number) => {
    setEditingEkskulIndex(index);
    setEkskulNama(ekskul.namaKegiatan);
    setEkskulPredikat(ekskul.predikat);
    setEkskulKeterangan(ekskul.keterangan);
    setShowEkskulModal(true);
  };

  const handleSaveEkskulSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ekskulNama.trim()) return;

    const item: ExtracurricularGrade = {
      namaKegiatan: ekskulNama.trim(),
      predikat: ekskulPredikat,
      keterangan: ekskulKeterangan.trim(),
    };

    if (editingEkskulIndex !== null) {
      setEditableEkskul((prev) => prev.map((ek, idx) => (idx === editingEkskulIndex ? item : ek)));
      onShowNotification('Ekstrakurikuler Diperbarui', `Kegiatan ${item.namaKegiatan} berhasil diperbarui.`, 'success');
    } else {
      setEditableEkskul((prev) => [...prev, item]);
      onShowNotification('Ekstrakurikuler Ditambahkan', `Kegiatan ${item.namaKegiatan} berhasil ditambahkan.`, 'success');
    }

    setShowEkskulModal(false);
    setEditingEkskulIndex(null);
  };

  const handleDeleteEkskul = (index: number) => {
    setEditableEkskul((prev) => prev.filter((_, i) => i !== index));
    onShowNotification('Ekstrakurikuler Dihapus', 'Kegiatan ekskul berhasil dihapus.', 'info');
  };

  const handleSaveAllGrades = () => {
    if (!currentStudent) return;

    const updatedRecords = { ...currentStudent.academicRecords };
    const defaultTingkat = selectedSemester <= 2 ? 'X' : selectedSemester <= 4 ? 'XI' : 'XII';

    const currentRec: SemesterAcademicRecord = {
      semester: selectedSemester as 1 | 2 | 3 | 4 | 5 | 6,
      tahunAjaran: semesterTahunAjaran.trim() || '2024/2025',
      tingkatKelas: defaultTingkat,
      kelas: semesterKelas.trim() || currentStudent.previousEducation.diterimaDiKelas,
      grades: editableGrades,
      extracurriculars: editableEkskul,
      attendance: editableAttendance,
      catatanWaliKelas,
      keteranganSemester: keteranganSemester.trim(),
      tanggalRapor: tanggalRapor.trim(),
      statusKenaikanKelulusan: updatedRecords[selectedSemester]?.statusKenaikanKelulusan || 'Naik Kelas',
    };

    updatedRecords[selectedSemester] = currentRec;

    const updatedStudent: StudentFullRecord = {
      ...currentStudent,
      academicRecords: updatedRecords,
    };

    if (onUpdateStudent) {
      onUpdateStudent(updatedStudent);
    }

    onShowNotification(
      'Nilai Semester Berhasil Disimpan',
      `Nilai Semester ${selectedSemester} (${currentRec.kelas} · TA ${currentRec.tahunAjaran}) untuk ${currentStudent.personal.namaLengkap} telah tersimpan.`,
      'success'
    );
  };

  // Separate regular subjects vs Lintas Minat subjects
  const regularGrades = editableGrades.filter((g) => g.kelompok !== 'Lintas Minat');
  const lintasMinatGrades = editableGrades.filter((g) => g.kelompok === 'Lintas Minat');

  // Stats calculation
  const totalMapel = editableGrades.length;
  const avgPengetahuan = totalMapel > 0
    ? Math.round(editableGrades.reduce((acc, g) => acc + g.nilaiPengetahuan, 0) / totalMapel)
    : 0;
  const avgKeterampilan = totalMapel > 0
    ? Math.round(editableGrades.reduce((acc, g) => acc + g.nilaiKeterampilan, 0) / totalMapel)
    : 0;
  const totalTuntas = editableGrades.filter((g) => (g.ketentuan || 'Tuntas') === 'Tuntas').length;

  const renderGradeRow = (grade: SubjectGrade, idx: number) => {
    const kkmK = grade.kkmKeterampilan ?? grade.kkm;
    const ketentuanVal = grade.ketentuan || computeKetentuan(grade.nilaiPengetahuan, grade.kkm, grade.nilaiKeterampilan, kkmK);

    return (
      <tr key={grade.mapelCode || idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
        <td className="py-2 px-3 text-center text-slate-500 dark:text-slate-400 font-mono text-[11px] border-r border-slate-100 dark:border-slate-800">
          {idx + 1}
        </td>
        <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white border-r border-slate-100 dark:border-slate-800">
          <input
            type="text"
            value={grade.mapelName}
            onChange={(e) => handleScoreChange(grade.mapelCode, 'mapelName', e.target.value)}
            className="w-full bg-transparent text-slate-900 dark:text-white font-semibold text-xs focus:outline-none focus:underline"
          />
        </td>
        <td className="py-2 px-2 text-center border-r border-slate-100 dark:border-slate-800">
          <select
            value={grade.kelompok}
            onChange={(e) => handleScoreChange(grade.mapelCode, 'kelompok', e.target.value)}
            className="rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-1.5 py-0.5 text-[10px] font-bold"
          >
            <option value="A">Wajib A</option>
            <option value="B">Wajib B</option>
            <option value="C">Peminatan</option>
            <option value="Lintas Minat">Lintas Minat</option>
          </select>
        </td>

        {/* Pengetahuan: KKM, Nilai, Predikat */}
        <td className="py-2 px-2 text-center bg-blue-50/15 dark:bg-blue-950/10">
          <input
            type="number"
            value={grade.kkm}
            min={50}
            max={95}
            onChange={(e) => handleScoreChange(grade.mapelCode, 'kkm', parseInt(e.target.value) || 70)}
            className="w-12 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-1 py-1 text-center font-mono font-bold text-xs"
          />
        </td>
        <td className="py-2 px-2 text-center bg-blue-50/15 dark:bg-blue-950/10">
          <input
            type="number"
            value={grade.nilaiPengetahuan}
            min={0}
            max={100}
            onChange={(e) =>
              handleScoreChange(
                grade.mapelCode,
                'nilaiPengetahuan',
                Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
              )
            }
            className="w-14 rounded border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-800 px-1.5 py-1 text-center font-mono font-bold text-blue-700 dark:text-blue-300 text-xs"
          />
        </td>
        <td className="py-2 px-2 text-center bg-blue-50/15 dark:bg-blue-950/10 border-r border-slate-100 dark:border-slate-800">
          <span
            className={`inline-flex h-6 w-6 items-center justify-center rounded font-bold text-xs ${
              grade.predikatPengetahuan === 'A'
                ? 'bg-emerald-600 text-white'
                : grade.predikatPengetahuan === 'B'
                ? 'bg-blue-600 text-white'
                : grade.predikatPengetahuan === 'C'
                ? 'bg-amber-600 text-white'
                : 'bg-rose-600 text-white'
            }`}
          >
            {grade.predikatPengetahuan}
          </span>
        </td>

        {/* Keterampilan: KKM, Nilai, Predikat */}
        <td className="py-2 px-2 text-center bg-emerald-50/15 dark:bg-emerald-950/10">
          <input
            type="number"
            value={kkmK}
            min={50}
            max={95}
            onChange={(e) => handleScoreChange(grade.mapelCode, 'kkmKeterampilan', parseInt(e.target.value) || 70)}
            className="w-12 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-1 py-1 text-center font-mono font-bold text-xs"
          />
        </td>
        <td className="py-2 px-2 text-center bg-emerald-50/15 dark:bg-emerald-950/10">
          <input
            type="number"
            value={grade.nilaiKeterampilan}
            min={0}
            max={100}
            onChange={(e) =>
              handleScoreChange(
                grade.mapelCode,
                'nilaiKeterampilan',
                Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
              )
            }
            className="w-14 rounded border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-800 px-1.5 py-1 text-center font-mono font-bold text-emerald-700 dark:text-emerald-300 text-xs"
          />
        </td>
        <td className="py-2 px-2 text-center bg-emerald-50/15 dark:bg-emerald-950/10 border-r border-slate-100 dark:border-slate-800">
          <span
            className={`inline-flex h-6 w-6 items-center justify-center rounded font-bold text-xs ${
              grade.predikatKeterampilan === 'A'
                ? 'bg-emerald-600 text-white'
                : grade.predikatKeterampilan === 'B'
                ? 'bg-blue-600 text-white'
                : grade.predikatKeterampilan === 'C'
                ? 'bg-amber-600 text-white'
                : 'bg-rose-600 text-white'
            }`}
          >
            {grade.predikatKeterampilan}
          </span>
        </td>

        {/* Ketentuan / Ketuntasan */}
        <td className="py-2 px-3 text-center border-r border-slate-100 dark:border-slate-800">
          <select
            value={ketentuanVal}
            onChange={(e) => handleScoreChange(grade.mapelCode, 'ketentuan', e.target.value)}
            className={`rounded-md px-2 py-1 text-[11px] font-bold border ${
              ketentuanVal === 'Tuntas'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
            }`}
          >
            <option value="Tuntas">Tuntas</option>
            <option value="Belum Tuntas">Belum Tuntas</option>
          </select>
        </td>

        <td className="py-2 px-2 text-center">
          <div className="flex items-center justify-center gap-1">
            <button
              type="button"
              onClick={() => openEditMapelModal(grade)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-300 text-[10px] font-bold transition-colors cursor-pointer"
              title="Edit Mata Pelajaran & Nilai"
            >
              <Edit3 className="h-3 w-3" />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={() => handleDeleteGrade(grade.mapelCode)}
              className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-1 rounded transition-colors cursor-pointer"
              title="Hapus Mapel"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-4">
      {/* Enterprise Toolbar: Student Selector, Semester Tabs & Action Buttons */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowMasterSubjectModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors cursor-pointer"
            >
              <Settings2 className="h-3.5 w-3.5" />
              <span>Master Mata Pelajaran ({masterSubjects.length})</span>
            </button>

            {onOpenImportModal && (
              <button
                type="button"
                onClick={onOpenImportModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>Impor Nilai (.xlsx)</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {editableGrades.length > 0 && (
              <button
                type="button"
                onClick={handleClearSemesterGrades}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Kosongkan Nilai Sem {selectedSemester}</span>
              </button>
            )}

            <button
              type="button"
              onClick={openAddMapelModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Mapel</span>
            </button>

            <button
              type="button"
              onClick={handleSaveAllGrades}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Simpan Nilai Semester {selectedSemester}</span>
            </button>
          </div>
        </div>

        {/* Select Student & Semester Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Pilih Siswa Terdaftar:
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none"
            >
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.personal.namaLengkap} (NIS: {st.personal.nis}) — Kelas {st.previousEducation.diterimaDiKelas}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-4">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Pilih Semester (1 s/d 6):
            </label>
            <div className="grid grid-cols-6 gap-1">
              {[1, 2, 3, 4, 5, 6].map((sem) => {
                const hasData = (currentStudent?.academicRecords?.[sem]?.grades?.length || 0) > 0;
                return (
                  <button
                    key={sem}
                    type="button"
                    onClick={() => setSelectedSemester(sem)}
                    style={
                      selectedSemester === sem
                        ? { backgroundColor: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' }
                        : undefined
                    }
                    className={`py-2 text-xs font-semibold rounded-md border transition-all cursor-pointer relative ${
                      selectedSemester === sem
                        ? 'text-white shadow-2xs'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    Sem {sem}
                    {hasData && (
                      <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-emerald-400" title="Data nilai tersedia" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-3 grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1">
                <Calendar className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                <span>Tahun Ajaran Sem {selectedSemester}</span>
              </label>
              <input
                type="text"
                value={semesterTahunAjaran}
                onChange={(e) => setSemesterTahunAjaran(e.target.value)}
                placeholder="2024/2025"
                className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-2.5 py-1.5 text-xs font-mono font-semibold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1">
                <School className="h-3 w-3 text-teal-600 dark:text-teal-400" />
                <span>Kelas Sem {selectedSemester}</span>
              </label>
              <input
                type="text"
                value={semesterKelas}
                onChange={(e) => setSemesterKelas(e.target.value)}
                placeholder="X MIPA 1"
                className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-2.5 py-1.5 text-xs font-semibold"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Performance Summary Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">Total Mata Pelajaran</span>
            <strong className="text-lg font-bold text-slate-900 dark:text-white">{totalMapel} Mapel</strong>
          </div>
          <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>

        <div className="p-3.5 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/40 dark:bg-blue-950/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] text-blue-700 dark:text-blue-300 uppercase font-semibold block">Rata-rata Pengetahuan</span>
            <strong className="text-lg font-bold text-blue-700 dark:text-blue-300 font-mono">{avgPengetahuan}</strong>
          </div>
          <Calculator className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>

        <div className="p-3.5 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-300 uppercase font-semibold block">Rata-rata Keterampilan</span>
            <strong className="text-lg font-bold text-emerald-700 dark:text-emerald-300 font-mono">{avgKeterampilan}</strong>
          </div>
          <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        </div>

        <div className="p-3.5 rounded-lg border border-cyan-200 dark:border-cyan-800 bg-cyan-50/40 dark:bg-cyan-950/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] text-cyan-800 dark:text-cyan-300 uppercase font-semibold block">Ketuntasan Semester</span>
            <span className="text-xs font-bold text-teal-700 dark:text-teal-300 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{totalTuntas} / {totalMapel} Mapel Tuntas</span>
            </span>
          </div>
          <Sparkles className="h-6 w-6 text-teal-600 dark:text-teal-400" />
        </div>
      </div>

      {/* Main Editable Grades Table */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white">
              Semester {selectedSemester}
            </h3>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
              Kelas: {semesterKelas}
            </span>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              TA: {semesterTahunAjaran}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {editableGrades.length === 0 && (
              <button
                type="button"
                onClick={handleLoadStandardSubjects}
                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-md border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 hover:bg-blue-100 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>Muat Mapel Standar SMA</span>
              </button>
            )}
            <button
              type="button"
              onClick={openAddMapelModal}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-md bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Mapel</span>
            </button>
          </div>
        </div>

        {editableGrades.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 space-y-3">
            <BookOpen className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-700" />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Belum ada mata pelajaran untuk Semester {selectedSemester}
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleLoadStandardSubjects}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg accent-btn-primary text-white cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Muat Template Mapel Standar SMA</span>
              </button>
              <button
                type="button"
                onClick={openAddMapelModal}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Pilih dari Master / Input Mapel Bebas</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-800/80 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  <th rowSpan={2} className="py-2 px-3 w-10 text-center border-r border-slate-200 dark:border-slate-700">No</th>
                  <th rowSpan={2} className="py-2 px-3 min-w-[220px] border-r border-slate-200 dark:border-slate-700">Mata Pelajaran</th>
                  <th rowSpan={2} className="py-2 px-2 w-24 text-center border-r border-slate-200 dark:border-slate-700">Kelompok</th>
                  <th colSpan={3} className="py-1.5 px-2 text-center bg-blue-50/60 dark:bg-blue-950/30 border-b border-r border-slate-200 dark:border-slate-700">
                    Nilai Pengetahuan
                  </th>
                  <th colSpan={3} className="py-1.5 px-2 text-center bg-emerald-50/60 dark:bg-emerald-950/30 border-b border-r border-slate-200 dark:border-slate-700">
                    Nilai Keterampilan
                  </th>
                  <th rowSpan={2} className="py-2 px-3 w-32 text-center border-r border-slate-200 dark:border-slate-700">Ketentuan</th>
                  <th rowSpan={2} className="py-2 px-2 w-24 text-center">Aksi</th>
                </tr>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                  <th className="py-1.5 px-2 w-14 text-center bg-blue-50/40 dark:bg-blue-950/20">KKM</th>
                  <th className="py-1.5 px-2 w-16 text-center bg-blue-50/40 dark:bg-blue-950/20">Nilai</th>
                  <th className="py-1.5 px-2 w-14 text-center bg-blue-50/40 dark:bg-blue-950/20 border-r border-slate-200 dark:border-slate-700">Predikat</th>
                  <th className="py-1.5 px-2 w-14 text-center bg-emerald-50/40 dark:bg-emerald-950/20">KKM</th>
                  <th className="py-1.5 px-2 w-16 text-center bg-emerald-50/40 dark:bg-emerald-950/20">Nilai</th>
                  <th className="py-1.5 px-2 w-14 text-center bg-emerald-50/40 dark:bg-emerald-950/20 border-r border-slate-200 dark:border-slate-700">Predikat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {regularGrades.map((grade, idx) => renderGradeRow(grade, idx))}

                {/* Sub-header Lintas Minat */}
                {lintasMinatGrades.length > 0 && (
                  <>
                    <tr className="bg-blue-50/70 dark:bg-blue-950/40 border-y border-slate-200 dark:border-slate-700">
                      <td colSpan={11} className="py-1.5 px-4 text-center font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-blue-200">
                        Lintas Minat
                      </td>
                    </tr>
                    {lintasMinatGrades.map((grade, idx) => renderGradeRow(grade, regularGrades.length + idx))}
                  </>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bottom Semester Section: Ekstrakurikuler, Kehadiran, Keterangan & Tanggal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 1. Ekstrakurikuler Editor */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Ekstrakurikuler (Sem {selectedSemester})
              </h4>
            </div>

            <button
              type="button"
              onClick={openAddEkskulModal}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-2xs"
            >
              <Plus className="h-3 w-3" />
              <span>Tambah</span>
            </button>
          </div>

          <div className="space-y-2">
            {editableEkskul.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">Belum ada data ekstrakurikuler</p>
            ) : (
              editableEkskul.map((ekskul, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 gap-2"
                >
                  <div className="flex-1">
                    <strong className="text-xs text-slate-900 dark:text-white uppercase block">
                      {ekskul.namaKegiatan}
                    </strong>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{ekskul.keterangan}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-50 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                      {ekskul.predikat}
                    </span>
                    <button
                      type="button"
                      onClick={() => openEditEkskulModal(ekskul, i)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 p-1 cursor-pointer"
                      title="Edit Ekstrakurikuler"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteEkskul(i)}
                      className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-1 rounded cursor-pointer"
                      title="Hapus"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 2. Kehadiran (Sakit, Izin, Alpa dalam Hari) */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <HeartHandshake className="h-4 w-4 text-emerald-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Kehadiran Semester {selectedSemester} (Hari)
            </h4>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 border rounded-lg border-blue-200 dark:border-blue-900/50 bg-blue-50/30 dark:bg-blue-950/20 text-center">
              <label className="text-[10px] text-blue-700 dark:text-blue-300 font-bold block mb-1">
                Sakit (Hari)
              </label>
              <input
                type="number"
                min={0}
                value={editableAttendance.sakit}
                onChange={(e) =>
                  setEditableAttendance({ ...editableAttendance, sakit: Math.max(0, parseInt(e.target.value) || 0) })
                }
                className="w-16 mx-auto rounded border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-2 py-1 text-center font-mono font-bold text-sm"
              />
            </div>

            <div className="p-2.5 border rounded-lg border-cyan-200 dark:border-cyan-900/50 bg-cyan-50/30 dark:bg-cyan-950/20 text-center">
              <label className="text-[10px] text-cyan-700 dark:text-cyan-300 font-bold block mb-1">
                Izin (Hari)
              </label>
              <input
                type="number"
                min={0}
                value={editableAttendance.izin}
                onChange={(e) =>
                  setEditableAttendance({ ...editableAttendance, izin: Math.max(0, parseInt(e.target.value) || 0) })
                }
                className="w-16 mx-auto rounded border border-cyan-300 dark:border-cyan-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-2 py-1 text-center font-mono font-bold text-sm"
              />
            </div>

            <div className="p-2.5 border rounded-lg border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20 text-center">
              <label className="text-[10px] text-rose-700 dark:text-rose-300 font-bold block mb-1">
                Alpa (Hari)
              </label>
              <input
                type="number"
                min={0}
                value={editableAttendance.tanpaKeterangan}
                onChange={(e) =>
                  setEditableAttendance({ ...editableAttendance, tanpaKeterangan: Math.max(0, parseInt(e.target.value) || 0) })
                }
                className="w-16 mx-auto rounded border border-rose-300 dark:border-rose-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-2 py-1 text-center font-mono font-bold text-sm"
              />
            </div>
          </div>
        </div>

        {/* 3. Keterangan & Tanggal Rapor Semester */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <GraduationCap className="h-4 w-4 text-blue-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Keterangan & Tanggal (Sem {selectedSemester})
            </h4>
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 block mb-1">
                Keterangan Kenaikan / Kelulusan / Catatan:
              </label>
              <input
                type="text"
                value={keteranganSemester}
                onChange={(e) => setKeteranganSemester(e.target.value)}
                placeholder="Contoh: Naik ke Kelas XI / Tuntas seluruh mapel"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-1.5 text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 block mb-1">
                Tanggal Pengesahan Semester:
              </label>
              <input
                type="text"
                value={tanggalRapor}
                onChange={(e) => setTanggalRapor(e.target.value)}
                placeholder="Contoh: 20 Desember 2024"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-1.5 text-xs font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Tambah / Edit Mata Pelajaran */}
      {showMapelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {editingMapelCode
                    ? `Edit Mata Pelajaran & Nilai (Semester ${selectedSemester})`
                    : `Tambah Mata Pelajaran (Semester ${selectedSemester})`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMapelModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMapelModalSubmit} className="space-y-3 text-xs text-slate-800 dark:text-slate-200">
              <div className="p-3 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30 space-y-2">
                <label className="block font-bold text-blue-900 dark:text-blue-300 text-[11px]">
                  Pilih Cepat dari Daftar Master Mata Pelajaran (Opsional):
                </label>
                <select
                  value={selectedMasterMapelId}
                  onChange={(e) => handleSelectMasterSubjectInForm(e.target.value)}
                  className="w-full rounded-lg border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 text-xs font-semibold"
                >
                  <option value="custom">-- Ketik Manual / Mata Pelajaran Bebas --</option>
                  {masterSubjects.map((ms) => (
                    <option key={ms.id} value={ms.id}>
                      [{ms.kelompok === 'Lintas Minat' ? 'Lintas Minat' : `Kelompok ${ms.kelompok}`}] {ms.namaMapel} (KKM: {ms.kkmDefault})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Nama Mata Pelajaran *
                </label>
                <input
                  type="text"
                  required
                  value={mapelNama}
                  onChange={(e) => {
                    setMapelNama(e.target.value);
                    setSelectedMasterMapelId('custom');
                  }}
                  placeholder="Contoh: FISIKA / EKONOMI / BAHASA JEPANG"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Kelompok Kurikulum *
                  </label>
                  <select
                    value={mapelKelompok}
                    onChange={(e) => setMapelKelompok(e.target.value as 'A' | 'B' | 'C' | 'Lintas Minat')}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 text-xs font-semibold"
                  >
                    <option value="A">Kelompok A (Wajib Umum)</option>
                    <option value="B">Kelompok B (Wajib Umum & Mulok)</option>
                    <option value="C">Kelompok C (Peminatan Akademik)</option>
                    <option value="Lintas Minat">Lintas Minat</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Ketentuan / Ketuntasan
                  </label>
                  <select
                    value={mapelKetentuan}
                    onChange={(e) => setMapelKetentuan(e.target.value as 'Tuntas' | 'Belum Tuntas')}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 text-xs font-bold"
                  >
                    <option value="Tuntas">Tuntas</option>
                    <option value="Belum Tuntas">Belum Tuntas</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/20 space-y-2">
                  <div className="font-bold text-[10px] uppercase text-blue-700 dark:text-blue-300 flex items-center justify-between">
                    <span>Pengetahuan</span>
                    <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white">
                      Predikat: {calculatePredicate(mapelNilaiP, mapelKkm)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-600 dark:text-slate-300 mb-0.5">KKM (P)</label>
                      <input
                        type="number"
                        min={50}
                        max={95}
                        value={mapelKkm}
                        onChange={(e) => {
                          const v = parseInt(e.target.value) || 70;
                          setMapelKkm(v);
                          setMapelKetentuan(computeKetentuan(mapelNilaiP, v, mapelNilaiK, mapelKkmK));
                        }}
                        className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-2 py-1 text-center font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 dark:text-slate-300 mb-0.5">Nilai (P)</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={mapelNilaiP}
                        onChange={(e) => {
                          const v = parseInt(e.target.value) || 0;
                          setMapelNilaiP(v);
                          setMapelKetentuan(computeKetentuan(v, mapelKkm, mapelNilaiK, mapelKkmK));
                        }}
                        className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-center font-bold text-blue-600 dark:text-blue-300"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-2">
                  <div className="font-bold text-[10px] uppercase text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
                    <span>Keterampilan</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                      Predikat: {calculatePredicate(mapelNilaiK, mapelKkmK)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-600 dark:text-slate-300 mb-0.5">KKM (K)</label>
                      <input
                        type="number"
                        min={50}
                        max={95}
                        value={mapelKkmK}
                        onChange={(e) => {
                          const v = parseInt(e.target.value) || 70;
                          setMapelKkmK(v);
                          setMapelKetentuan(computeKetentuan(mapelNilaiP, mapelKkm, mapelNilaiK, v));
                        }}
                        className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-2 py-1 text-center font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 dark:text-slate-300 mb-0.5">Nilai (K)</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={mapelNilaiK}
                        onChange={(e) => {
                          const v = parseInt(e.target.value) || 0;
                          setMapelNilaiK(v);
                          setMapelKetentuan(computeKetentuan(mapelNilaiP, mapelKkm, v, mapelKkmK));
                        }}
                        className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-center font-bold text-emerald-600 dark:text-emerald-300"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowMapelModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs cursor-pointer"
                >
                  {editingMapelCode ? 'Simpan Perubahan' : 'Tambahkan ke Tabel Nilai'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Kelola Master Mata Pelajaran Sekolah (dengan Fitur Hapus Massal & Kosongkan) */}
      {showMasterSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Kelola Master Mata Pelajaran Sekolah ({masterSubjects.length} Mapel)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Tambah, ubah, hapus massal, atau kosongkan daftar mata pelajaran kustom sekolah Anda
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMasterSubjectModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs text-slate-800 dark:text-slate-200">
              {/* Form Tambah / Edit Master Mapel */}
              <form
                onSubmit={handleSaveMasterSubject}
                className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3"
              >
                <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>{editingMasterId ? 'Edit Master Mata Pelajaran' : 'Tambah Mata Pelajaran Baru ke Master'}</span>
                  {editingMasterId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingMasterId(null);
                        setMasterFormNama('');
                        setMasterFormKelompok('A');
                        setMasterFormKkmP(75);
                        setMasterFormKkmK(75);
                      }}
                      className="text-xs text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                    >
                      Batal Edit
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-5">
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-200 mb-1">
                      Nama Mata Pelajaran *
                    </label>
                    <input
                      type="text"
                      required
                      value={masterFormNama}
                      onChange={(e) => setMasterFormNama(e.target.value)}
                      placeholder="Contoh: Bahasa Perancis / Astronomi"
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-1.5 font-semibold"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-200 mb-1">
                      Kelompok
                    </label>
                    <select
                      value={masterFormKelompok}
                      onChange={(e) => setMasterFormKelompok(e.target.value as 'A' | 'B' | 'C' | 'Lintas Minat')}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-2.5 py-1.5 font-semibold"
                    >
                      <option value="A">Wajib A</option>
                      <option value="B">Wajib B</option>
                      <option value="C">Peminatan (C)</option>
                      <option value="Lintas Minat">Lintas Minat</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-200 mb-1">
                      KKM (P/K)
                    </label>
                    <input
                      type="number"
                      min={50}
                      max={95}
                      value={masterFormKkmP}
                      onChange={(e) => {
                        const v = parseInt(e.target.value) || 75;
                        setMasterFormKkmP(v);
                        setMasterFormKkmK(v);
                      }}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-2.5 py-1.5 text-center font-mono font-bold"
                    />
                  </div>
                  <div className="sm:col-span-2 flex items-end">
                    <button
                      type="submit"
                      className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
                    >
                      {editingMasterId ? 'Update' : '+ Tambah'}
                    </button>
                  </div>
                </div>
              </form>

              {/* Toolbar Hapus Massal / Kosongkan / Reset Master Mapel */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  {selectedMasterIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setConfirmClearMasterMode('selected')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Hapus Terpilih ({selectedMasterIds.length})</span>
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetStandardMasterSubjects}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reset Mapel Standar</span>
                  </button>

                  {masterSubjects.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setConfirmClearMasterMode('all')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Kosongkan Semua Mapel</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Konfirmasi Hapus Massal / Kosongkan di dalam Modal */}
              {confirmClearMasterMode && (
                <div className="p-3.5 rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-2 text-rose-800 dark:text-rose-200">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                    <span className="font-semibold">
                      {confirmClearMasterMode === 'all'
                        ? 'Yakin ingin mengosongkan seluruh daftar Master Mata Pelajaran?'
                        : `Yakin ingin menghapus ${selectedMasterIds.length} Mata Pelajaran terpilih?`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setConfirmClearMasterMode(null)}
                      className="px-3 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleExecuteBulkDeleteMaster}
                      className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-semibold cursor-pointer"
                    >
                      Ya, Hapus
                    </button>
                  </div>
                </div>
              )}

              {/* Tabel Master Mapel */}
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    <tr>
                      <th className="py-2.5 px-3 w-10">
                        <input
                          type="checkbox"
                          checked={masterSubjects.length > 0 && selectedMasterIds.length === masterSubjects.length}
                          onChange={handleToggleAllMasterSelect}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 cursor-pointer"
                        />
                      </th>
                      <th className="py-2.5 px-3 w-10">No</th>
                      <th className="py-2.5 px-3">Nama Mata Pelajaran</th>
                      <th className="py-2.5 px-3 w-32 text-center">Kelompok</th>
                      <th className="py-2.5 px-3 w-24 text-center">KKM Default</th>
                      <th className="py-2.5 px-3 w-28 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {masterSubjects.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500 dark:text-slate-400">
                          Daftar Master Mata Pelajaran kosong. Tambahkan mapel baru di atas atau klik <strong>Reset Mapel Standar</strong>.
                        </td>
                      </tr>
                    ) : (
                      masterSubjects.map((ms, i) => (
                        <tr key={ms.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-2 px-3">
                            <input
                              type="checkbox"
                              checked={selectedMasterIds.includes(ms.id)}
                              onChange={() => handleToggleMasterRowSelect(ms.id)}
                              className="h-4 w-4 rounded border-slate-300 text-blue-600 cursor-pointer"
                            />
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-400">{i + 1}</td>
                          <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">{ms.namaMapel}</td>
                          <td className="py-2 px-3 text-center">
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[10px] font-bold">
                              {ms.kelompok === 'Lintas Minat' ? 'Lintas Minat' : `Kelompok ${ms.kelompok}`}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center font-mono font-bold text-slate-900 dark:text-white">{ms.kkmDefault}</td>
                          <td className="py-2 px-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleEditMasterItem(ms)}
                                className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 text-[10px] font-bold cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteMasterItem(ms.id, ms.namaMapel)}
                                className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-1 rounded cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-end px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <button
                type="button"
                onClick={() => setShowMasterSubjectModal(false)}
                className="px-4 py-1.5 rounded-lg accent-btn-primary text-white text-xs font-bold cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Tambah / Edit Ekstrakurikuler */}
      {showEkskulModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Award className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>{editingEkskulIndex !== null ? 'Edit Ekstrakurikuler' : 'Tambah Ekstrakurikuler'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowEkskulModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEkskulSubmit} className="space-y-3 text-xs text-slate-800 dark:text-slate-200">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Nama Kegiatan Ekstra *
                </label>
                <input
                  type="text"
                  required
                  value={ekskulNama}
                  onChange={(e) => setEkskulNama(e.target.value)}
                  placeholder="Contoh: KEPRAMUKAAN / PMR / PASKIBRA"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 text-xs font-semibold uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Nilai / Predikat
                </label>
                <select
                  value={ekskulPredikat}
                  onChange={(e) => setEkskulPredikat(e.target.value as 'Sangat Baik' | 'Baik' | 'Cukup' | 'Kurang')}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 text-xs font-semibold"
                >
                  <option value="Sangat Baik">Sangat Baik</option>
                  <option value="Baik">Baik</option>
                  <option value="Cukup">Cukup</option>
                  <option value="Kurang">Kurang</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Keterangan Partisipasi
                </label>
                <input
                  type="text"
                  value={ekskulKeterangan}
                  onChange={(e) => setEkskulKeterangan(e.target.value)}
                  placeholder="Aktif mengikuti kegiatan"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEkskulModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs cursor-pointer"
                >
                  {editingEkskulIndex !== null ? 'Simpan Perubahan' : 'Tambah Ekskul'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
