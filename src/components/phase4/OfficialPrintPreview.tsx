import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  ArrowLeft, 
  FileCheck, 
  Sparkles, 
  Users, 
  User, 
  Settings2, 
  Image as ImageIcon, 
  Edit3, 
  Upload,
  Columns,
  FileText,
  Table2
} from 'lucide-react';
import { 
  StudentFullRecord, 
  SchoolProfile, 
  CoverCustomText,
  GradePrintLayoutMode,
  SemesterAcademicRecord,
  SubjectGrade
} from '../../types/buku-induk';
import { STANDARD_SUBJECTS_MIPA, calculatePredicate } from '../../data/mock-data';
import { StudentAvatar } from '../common/StudentAvatar';

interface OfficialPrintPreviewProps {
  students: StudentFullRecord[];
  schoolProfile: SchoolProfile;
  initialStudentId?: string;
  batchStudentIds?: string[];
  onBack: () => void;
}

export const OfficialPrintPreview: React.FC<OfficialPrintPreviewProps> = ({
  students,
  schoolProfile,
  initialStudentId,
  batchStudentIds = [],
  onBack,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudentId || students[0]?.id || ''
  );

  // Determine whether we print 1 student or a batch of students
  const [printMode, setPrintMode] = useState<'single' | 'batch' | 'all'>(
    batchStudentIds.length > 1 ? 'batch' : 'single'
  );

  // 3 Grade Print Layout Options (Confirmed by User)
  const [gradeLayoutMode, setGradeLayoutMode] = useState<GradePrintLayoutMode>('2_per_page');

  // Signature Toggles
  const [includeKepalaSekolahSignature, setIncludeKepalaSekolahSignature] = useState<boolean>(true);
  const [includeWaliKelasSignature, setIncludeWaliKelasSignature] = useState<boolean>(true);
  const [tanggalCetak, setTanggalCetak] = useState<string>('20 Juni 2025');

  // Cover Depan Toggle & Customizable Cover Text
  const [includeCover, setIncludeCover] = useState<boolean>(true);
  const [showCoverEditor, setShowCoverEditor] = useState<boolean>(false);
  const [coverText, setCoverText] = useState<CoverCustomText>({
    namaDinas: 'PEMERINTAH DAERAH PROVINSI JAWA BARAT · DINAS PENDIDIKAN',
    judulDokumen: 'BUKU INDUK REGISTER SISWA',
    subjudulDokumen: 'DOKUMEN ARSIP AKADEMIK RESMI SEKOLAH MENENGAH ATAS (SMA)',
    keteranganTambahan: 'Dokumen Negara Bersifat Rahasia & Wajib Dipelihara Secara Permanen',
    rombelLabel: 'SEMUA ANGKATAN / ROMBONGAN BELAJAR',
    tahunAjaranLabel: 'TAHUN PELAJARAN 2024 / 2025',
    titimangsaKota: 'BANDUNG, JAWA BARAT',
  });

  // Independent Watermark Settings + Opacity Slider
  const [enableWatermark, setEnableWatermark] = useState<boolean>(true);
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(7); // 3% to 30%
  const [watermarkUrl, setWatermarkUrl] = useState<string>(schoolProfile.logoUrl);

  useEffect(() => {
    if (initialStudentId) {
      setSelectedStudentId(initialStudentId);
    }
    if (batchStudentIds.length > 1) {
      setPrintMode('batch');
    }
  }, [initialStudentId, batchStudentIds]);

  const handleWatermarkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setWatermarkUrl(ev.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // List of students to render in the single merged print stream
  const displayedStudents: StudentFullRecord[] =
    printMode === 'all'
      ? students
      : printMode === 'batch' && batchStudentIds.length > 0
      ? students.filter((s) => batchStudentIds.includes(s.id))
      : students.filter((s) => s.id === selectedStudentId);

  const handlePrintAction = () => {
    window.print();
  };

  // Helper to get or synthesize a SemesterAcademicRecord so every semester 1..6 has complete PDF-ready structure
  const getSemesterRecordForPrint = (student: StudentFullRecord, sem: number): SemesterAcademicRecord => {
    const existing = student.academicRecords?.[sem];
    const defaultTingkat = sem <= 2 ? 'X' : sem <= 4 ? 'XI' : 'XII';
    const baseClass = student.previousEducation?.diterimaDiKelas || 'X MIPA 1';
    const derivedClass = baseClass.replace(/^(X|XI|XII)/, defaultTingkat);

    // Derive plausible academic year progression from entry year
    const baseYearStr = student.previousEducation?.tahunAjaranMasuk || '2023/2024';
    const startYearMatch = baseYearStr.match(/^(\d{4})/);
    const startYear = startYearMatch ? parseInt(startYearMatch[1], 10) : 2023;
    const yearOffset = sem <= 2 ? 0 : sem <= 4 ? 1 : 2;
    const derivedTahunAjaran = `${startYear + yearOffset}/${startYear + yearOffset + 1}`;

    if (existing && existing.grades && existing.grades.length > 0) {
      return {
        ...existing,
        tahunAjaran: existing.tahunAjaran || derivedTahunAjaran,
        kelas: existing.kelas || derivedClass,
      };
    }

    // Fallback grades using standard curriculum subjects so the printed Buku Induk table is always structured like the attached PDF
    const fallbackGrades: SubjectGrade[] = STANDARD_SUBJECTS_MIPA.map((sub) => {
      const kkmVal = 70;
      const nilaiP = existing ? 0 : 80;
      const nilaiK = existing ? 0 : 82;
      return {
        mapelCode: sub.code,
        mapelName: sub.name.replace(/^Lintas Minat:\s*/i, ''),
        kelompok: sub.kelompok,
        kkm: kkmVal,
        kkmKeterampilan: kkmVal,
        nilaiPengetahuan: nilaiP,
        predikatPengetahuan: calculatePredicate(nilaiP, kkmVal),
        nilaiKeterampilan: nilaiK,
        predikatKeterampilan: calculatePredicate(nilaiK, kkmVal),
        ketentuan: nilaiP >= kkmVal && nilaiK >= kkmVal ? 'Tuntas' : 'Belum Tuntas',
      };
    });

    return {
      semester: sem as 1 | 2 | 3 | 4 | 5 | 6,
      tahunAjaran: existing?.tahunAjaran || derivedTahunAjaran,
      tingkatKelas: defaultTingkat,
      kelas: existing?.kelas || derivedClass,
      grades: fallbackGrades,
      extracurriculars: existing?.extracurriculars?.length
        ? existing.extracurriculars
        : [{ namaKegiatan: 'KEPRAMUKAAN', predikat: 'Baik', keterangan: 'Aktif' }],
      attendance: existing?.attendance || { sakit: 0, izin: 0, tanpaKeterangan: 0 },
      catatanWaliKelas: existing?.catatanWaliKelas || '',
      keteranganSemester: existing?.keteranganSemester || '',
      tanggalRapor: existing?.tanggalRapor || '',
    };
  };

  // Running Student Header & Footer Marker ("Penanda") on every printed page of a student
  const renderStudentPageMarker = (
    student: StudentFullRecord,
    studentPageNumber: number,
    totalStudentPages: number,
    position: 'header' | 'footer'
  ) => (
    <div
      className={`flex items-center justify-between text-[10px] font-sans font-bold tracking-wide text-slate-900 ${
        position === 'header'
          ? 'border-b border-slate-800 pb-1.5 mb-2.5'
          : 'border-t border-slate-800 pt-1.5 mt-auto'
      }`}
    >
      <div className="uppercase tracking-wider">
        {student.personal.namaLengkap}
      </div>
      <div className="flex items-center gap-4 font-mono">
        <span>NIS : {student.personal.nis}</span>
        <span>
          Hal. {studentPageNumber} dari {totalStudentPages}
        </span>
      </div>
    </div>
  );

  // Render a single semester block matching the attached PDF ("Semester : X", "Tahun Ajaran : YYYY/YYYY", "Kelas : ...", Main Table, Lintas Minat sub-header, Ekstrakurikuler, Kehadiran, Keterangan & Tanggal)
  const renderPdfSemesterBlock = (
    student: StudentFullRecord,
    semNumber: number,
    compactPadding: boolean = false
  ) => {
    const rec = getSemesterRecordForPrint(student, semNumber);
    const regularGrades = rec.grades.filter((g) => g.kelompok !== 'Lintas Minat');
    const lintasMinatGrades = rec.grades.filter((g) => g.kelompok === 'Lintas Minat');

    const cellPad = compactPadding ? 'py-[1.5px] px-1.5' : 'py-1 px-2';
    const fontSize = compactPadding ? 'text-[8.5px]' : 'text-[9.5px]';

    const renderSubjectRow = (g: SubjectGrade, idx: number) => {
      const kkmP = g.kkm || 70;
      const kkmK = g.kkmKeterampilan ?? kkmP;
      const ketentuanText =
        g.ketentuan || (g.nilaiPengetahuan >= kkmP && g.nilaiKeterampilan >= kkmK ? 'Tuntas' : 'Belum Tuntas');

      return (
        <tr key={`${semNumber}-${g.mapelCode}-${idx}`}>
          <td className={`border border-black ${cellPad} font-medium uppercase`}>
            {g.mapelName.replace(/^Lintas Minat:\s*/i, '')}
          </td>
          <td className={`border border-black ${cellPad} text-center font-mono`}>{kkmP}</td>
          <td className={`border border-black ${cellPad} text-center font-mono font-bold`}>{g.nilaiPengetahuan}</td>
          <td className={`border border-black ${cellPad} text-center font-bold`}>{g.predikatPengetahuan}</td>
          <td className={`border border-black ${cellPad} text-center font-mono`}>{kkmK}</td>
          <td className={`border border-black ${cellPad} text-center font-mono font-bold`}>{g.nilaiKeterampilan}</td>
          <td className={`border border-black ${cellPad} text-center font-bold`}>{g.predikatKeterampilan}</td>
          <td className={`border border-black ${cellPad} text-center font-semibold`}>{ketentuanText}</td>
        </tr>
      );
    };

    // Pad extracurricular rows to at least 3 rows so the box matches the PDF height
    const ekskulRows = [...(rec.extracurriculars || [])];
    while (ekskulRows.length < 3) {
      ekskulRows.push({ namaKegiatan: '', predikat: 'Baik', keterangan: '' });
    }

    return (
      <div className="space-y-1.5">
        {/* Semester Metadata Header (3 Columns like PDF: Semester | Tahun Ajaran | Kelas) */}
        <div className="grid grid-cols-3 text-[10px] font-sans font-bold text-slate-950 pt-0.5">
          <div>
            Semester &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {semNumber}
          </div>
          <div className="text-center">
            Tahun Ajaran &nbsp;&nbsp;: {rec.tahunAjaran}
          </div>
          <div className="text-right">
            Kelas &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {rec.kelas}
          </div>
        </div>

        {/* Main Academic Grades Table */}
        <table className={`w-full border-collapse border border-black font-sans ${fontSize} leading-tight`}>
          <thead>
            <tr className="bg-slate-100 font-bold text-center">
              <th rowSpan={2} className={`border border-black ${cellPad} text-left w-[38%]`}>
                Mata Pelajaran
              </th>
              <th colSpan={3} className={`border border-black ${cellPad}`}>
                Nilai Pengetahuan
              </th>
              <th colSpan={3} className={`border border-black ${cellPad}`}>
                Nilai Keterampilan
              </th>
              <th rowSpan={2} className={`border border-black ${cellPad} w-[13%]`}>
                Ketentuan
              </th>
            </tr>
            <tr className="bg-slate-50 font-bold text-center">
              <th className={`border border-black ${cellPad} w-[7%]`}>KKM</th>
              <th className={`border border-black ${cellPad} w-[8%]`}>Nilai</th>
              <th className={`border border-black ${cellPad} w-[9%]`}>Predikat</th>
              <th className={`border border-black ${cellPad} w-[7%]`}>KKM</th>
              <th className={`border border-black ${cellPad} w-[8%]`}>Nilai</th>
              <th className={`border border-black ${cellPad} w-[9%]`}>Predikat</th>
            </tr>
          </thead>
          <tbody>
            {regularGrades.map((g, idx) => renderSubjectRow(g, idx))}

            {/* Sub-header Lintas Minat (persis seperti PDF terlampir) */}
            <tr>
              <td
                colSpan={8}
                className={`border border-black ${cellPad} text-center font-bold uppercase tracking-wider bg-slate-50/70`}
              >
                Lintas Minat
              </td>
            </tr>
            {lintasMinatGrades.length > 0 ? (
              lintasMinatGrades.map((g, idx) => renderSubjectRow(g, idx))
            ) : (
              <tr>
                <td className={`border border-black ${cellPad} text-slate-400 italic`}>-</td>
                <td className={`border border-black ${cellPad} text-center`}>-</td>
                <td className={`border border-black ${cellPad} text-center`}>-</td>
                <td className={`border border-black ${cellPad} text-center`}>-</td>
                <td className={`border border-black ${cellPad} text-center`}>-</td>
                <td className={`border border-black ${cellPad} text-center`}>-</td>
                <td className={`border border-black ${cellPad} text-center`}>-</td>
                <td className={`border border-black ${cellPad} text-center`}>-</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Bottom 3-Column Box: Ekstrakurikuler | Kehadiran | Keterangan & Tanggal */}
        <div className={`grid grid-cols-12 gap-2 font-sans ${fontSize}`}>
          {/* Box 1: Ekstrakurikuler (5 cols) */}
          <div className="col-span-5">
            <table className="w-full border-collapse border border-black">
              <thead>
                <tr className="bg-slate-100 font-bold text-center">
                  <th className={`border border-black ${cellPad} text-left`}>Ekstrakurikuler</th>
                  <th className={`border border-black ${cellPad} w-20 text-center`}>Nilai</th>
                </tr>
              </thead>
              <tbody>
                {ekskulRows.map((eks, i) => (
                  <tr key={i} className="h-4">
                    <td className={`border border-black ${cellPad} uppercase font-medium`}>
                      {eks.namaKegiatan || '\u00A0'}
                    </td>
                    <td className={`border border-black ${cellPad} text-center font-semibold`}>
                      {eks.namaKegiatan ? eks.predikat : '\u00A0'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Box 2: Kehadiran (3 cols) */}
          <div className="col-span-3">
            <table className="w-full border-collapse border border-black">
              <thead>
                <tr className="bg-slate-100 font-bold text-center">
                  <th colSpan={2} className={`border border-black ${cellPad}`}>
                    Kehadiran
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={`border border-black ${cellPad} font-medium`}>Sakit</td>
                  <td className={`border border-black ${cellPad} text-right font-mono`}>
                    {rec.attendance.sakit} Hari
                  </td>
                </tr>
                <tr>
                  <td className={`border border-black ${cellPad} font-medium`}>Izin</td>
                  <td className={`border border-black ${cellPad} text-right font-mono`}>
                    {rec.attendance.izin} Hari
                  </td>
                </tr>
                <tr>
                  <td className={`border border-black ${cellPad} font-medium`}>Alpa</td>
                  <td className={`border border-black ${cellPad} text-right font-mono`}>
                    {rec.attendance.tanpaKeterangan} Hari
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Box 3: Keterangan & Tanggal (4 cols) */}
          <div className="col-span-4">
            <table className="w-full h-full border-collapse border border-black">
              <thead>
                <tr className="bg-slate-100 font-bold">
                  <th className={`border border-black ${cellPad} text-left`}>Keterangan</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={`border border-black ${cellPad} align-top h-9`}>
                    {rec.keteranganSemester || rec.statusKenaikanKelulusan || '\u00A0'}
                  </td>
                </tr>
                <tr>
                  <td className={`border border-black ${cellPad} font-semibold`}>
                    Tanggal : <span className="font-mono font-normal">{rec.tanggalRapor || ''}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Optional Signature Block at the bottom of a grade sheet
  const renderSignatureFooter = (student: StudentFullRecord) => {
    if (!includeKepalaSekolahSignature && !includeWaliKelasSignature) return null;
    return (
      <div className="grid grid-cols-2 gap-8 pt-2 text-[9.5px] font-serif text-center">
        <div>
          {includeKepalaSekolahSignature && (
            <>
              <p>Mengetahui,</p>
              <p className="font-bold">Kepala {schoolProfile.namaSekolah}</p>
              <div className="h-10"></div>
              <p className="font-bold underline">{schoolProfile.namaKepalaSekolah}</p>
              <p className="font-mono text-[8.5px]">NIP. {schoolProfile.nipKepalaSekolah}</p>
            </>
          )}
        </div>
        <div>
          {includeWaliKelasSignature && (
            <>
              <p>
                {schoolProfile.kabupatenKota.replace('Kota ', '')}, {tanggalCetak}
              </p>
              <p className="font-bold">Wali Kelas {student.previousEducation.diterimaDiKelas}</p>
              <div className="h-10"></div>
              <p className="font-bold underline">......................................................</p>
              <p className="font-mono text-[8.5px]">NIP. ............................................</p>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Control Header (Hidden during actual window.print) */}
      <div className="no-print rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Kembali</span>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500 text-slate-950">
                  1 BERKAS GABUNGAN TERPADU
                </span>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Pratinjau Cetak Buku Induk (Format Tabel PDF Resmi + Penanda Halaman Siswa)
                </h2>
              </div>
              <p className="text-xs text-slate-500">
                Setiap lembar dilengkapi Penanda Nama Siswa, NIS, dan Nomor Halaman Siswa di sudut atas & bawah halaman
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Mode Cetak Selector */}
            <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-100 dark:bg-slate-800 text-xs">
              <button
                onClick={() => setPrintMode('single')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  printMode === 'single'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                1 Siswa
              </button>
              {batchStudentIds.length > 0 && (
                <button
                  onClick={() => setPrintMode('batch')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    printMode === 'batch'
                      ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Terpilih ({batchStudentIds.length})
                </button>
              )}
              <button
                onClick={() => setPrintMode('all')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  printMode === 'all'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Semua Siswa ({students.length})
              </button>
            </div>

            {printMode === 'single' && (
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.personal.namaLengkap} ({st.personal.nis}) - {st.previousEducation.diterimaDiKelas}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={handlePrintAction}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shadow-sm cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Cetak / Simpan 1 File PDF ({displayedStudents.length} Siswa)</span>
            </button>
          </div>
        </div>

        {/* 3 PILIHAN TATA LETAK HALAMAN CETAK NILAI (User Confirmed Choice) */}
        <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/20 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                <Columns className="h-4 w-4 text-amber-600" />
                <span>Pilihan Tata Letak Halaman Cetak Tabel Nilai Rapor (Semester 1 s/d 6):</span>
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Pilih salah satu dari 3 tata letak di bawah ini untuk membandingkan tampilan lembar nilai Buku Induk
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setGradeLayoutMode('2_per_page')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  gradeLayoutMode === '2_per_page'
                    ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                <Columns className="h-3.5 w-3.5" />
                <span>1. 2 Semester / Halaman (Sesuai PDF)</span>
              </button>

              <button
                type="button"
                onClick={() => setGradeLayoutMode('1_per_page')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  gradeLayoutMode === '1_per_page'
                    ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>2. 1 Semester Penuh / Halaman</span>
              </button>

              <button
                type="button"
                onClick={() => setGradeLayoutMode('6_per_page')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  gradeLayoutMode === '6_per_page'
                    ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                <Table2 className="h-3.5 w-3.5" />
                <span>3. Ringkas 6 Semester (1 Halaman)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Customization Options: Signature Toggles, Cover Depan & Watermark */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1 text-xs">
          {/* Opsi Tanda Tangan */}
          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
            <div className="font-bold text-[11px] uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Opsi Tanda Tangan Pengesahan:</span>
              <input
                type="text"
                value={tanggalCetak}
                onChange={(e) => setTanggalCetak(e.target.value)}
                placeholder="Tanggal Cetak"
                className="w-28 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-0.5 text-[10px] font-mono"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeKepalaSekolahSignature}
                onChange={(e) => setIncludeKepalaSekolahSignature(e.target.checked)}
                className="h-4 w-4 rounded text-amber-500"
              />
              <span>Cantumkan TTD Kepala Sekolah ({schoolProfile.namaKepalaSekolah.split(',')[0]})</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeWaliKelasSignature}
                onChange={(e) => setIncludeWaliKelasSignature(e.target.checked)}
                className="h-4 w-4 rounded text-amber-500"
              />
              <span>Cantumkan TTD Wali Kelas</span>
            </label>
          </div>

          {/* Cover Depan Option & Editor */}
          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[11px] uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Halaman Sampul (Cover Depan):
              </span>
              <button
                type="button"
                onClick={() => setShowCoverEditor(!showCoverEditor)}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 hover:text-amber-700 underline cursor-pointer"
              >
                <Edit3 className="h-3 w-3" />
                <span>{showCoverEditor ? 'Tutup Editor Teks' : 'Kustomisasi Teks Cover'}</span>
              </button>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeCover}
                onChange={(e) => setIncludeCover(e.target.checked)}
                className="h-4 w-4 rounded text-amber-500"
              />
              <span className="font-semibold text-amber-700 dark:text-amber-400">
                Sertakan Cover Depan Klasik Kedinasan
              </span>
            </label>
            <p className="text-[10px] text-slate-400">
              Menempatkan sampul berbingkai resmi di halaman pertama file cetak.
            </p>
          </div>

          {/* Watermark Custom Gambar + Slider Opacity */}
          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[11px] uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Watermark Transparan (Gambar Khusus):
              </span>
              <label className="flex items-center gap-1 cursor-pointer text-[10px]">
                <input
                  type="checkbox"
                  checked={enableWatermark}
                  onChange={(e) => setEnableWatermark(e.target.checked)}
                  className="rounded text-amber-500"
                />
                <span>Aktif</span>
              </label>
            </div>

            {enableWatermark && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span>Transparansi (Opacity):</span>
                  <span className="font-bold font-mono text-amber-600">{watermarkOpacity}%</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="30"
                  value={watermarkOpacity}
                  onChange={(e) => setWatermarkOpacity(parseInt(e.target.value) || 8)}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="file"
                    id="upload-watermark-file"
                    accept="image/*"
                    onChange={handleWatermarkUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="upload-watermark-file"
                    className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-[10px] font-bold whitespace-nowrap"
                  >
                    <Upload className="h-3 w-3" />
                    <span>Upload File Gambar</span>
                  </label>
                  <input
                    type="text"
                    value={watermarkUrl}
                    onChange={(e) => setWatermarkUrl(e.target.value)}
                    placeholder="Atau URL gambar watermark..."
                    className="w-full rounded border px-2 py-0.5 text-[10px] font-mono"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Expandable Cover Text Customizer Editor */}
        {showCoverEditor && (
          <div className="mt-3 p-4 rounded-xl border border-amber-200 bg-amber-50/30 dark:border-amber-900/40 dark:bg-amber-950/20 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-amber-200 dark:border-amber-900/40">
              <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                <Edit3 className="h-3.5 w-3.5" />
                <span>Kustomisasi Seluruh Teks Cover Depan (Dapat Diedit Mandiri)</span>
              </h4>
              <span className="text-[10px] text-amber-700 dark:text-amber-400">
                Perubahan langsung diterapkan pada lembar cover di bawah
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Dinas / Lembaga Pembina
                </label>
                <input
                  type="text"
                  value={coverText.namaDinas}
                  onChange={(e) => setCoverText({ ...coverText, namaDinas: e.target.value })}
                  className="w-full rounded border px-2.5 py-1 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Judul Utama Dokumen
                </label>
                <input
                  type="text"
                  value={coverText.judulDokumen}
                  onChange={(e) => setCoverText({ ...coverText, judulDokumen: e.target.value })}
                  className="w-full rounded border px-2.5 py-1 text-xs font-black uppercase"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subjudul Dokumen
                </label>
                <input
                  type="text"
                  value={coverText.subjudulDokumen}
                  onChange={(e) => setCoverText({ ...coverText, subjudulDokumen: e.target.value })}
                  className="w-full rounded border px-2.5 py-1 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Keterangan Tambahan Cover
                </label>
                <input
                  type="text"
                  value={coverText.keteranganTambahan}
                  onChange={(e) => setCoverText({ ...coverText, keteranganTambahan: e.target.value })}
                  className="w-full rounded border px-2.5 py-1 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Label Rombel / Tingkat
                </label>
                <input
                  type="text"
                  value={coverText.rombelLabel}
                  onChange={(e) => setCoverText({ ...coverText, rombelLabel: e.target.value })}
                  className="w-full rounded border px-2.5 py-1 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tahun Ajaran / Pelajaran
                </label>
                <input
                  type="text"
                  value={coverText.tahunAjaranLabel}
                  onChange={(e) => setCoverText({ ...coverText, tahunAjaranLabel: e.target.value })}
                  className="w-full rounded border px-2.5 py-1 text-xs font-mono font-bold"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Titimangsa Kota Pengesahan & Arsip
                </label>
                <input
                  type="text"
                  value={coverText.titimangsaKota}
                  onChange={(e) => setCoverText({ ...coverText, titimangsaKota: e.target.value })}
                  className="w-full rounded border px-2.5 py-1 text-xs font-bold uppercase"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DOCUMENT PAPER CANVAS (1 Continuous Merged Stream) */}
      <div id="printable-area" className="flex flex-col items-center gap-10 bg-slate-200/70 dark:bg-slate-950 p-4 sm:p-8 rounded-2xl overflow-x-auto">
        {/* ============================================================== */}
        {/* COVER HALAMAN DEPAN BUKU INDUK (BINGKAI KLASIK KEDINASAN)      */}
        {/* ============================================================== */}
        {includeCover && (
          <div className="print-sheet relative w-[794px] h-[1123px] bg-white text-slate-950 p-12 shadow-2xl font-serif flex flex-col justify-between border-8 border-double border-slate-900 overflow-hidden">
            {enableWatermark && watermarkUrl && (
              <div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{ opacity: watermarkOpacity / 100 }}
              >
                <img
                  src={watermarkUrl}
                  alt="Watermark"
                  className="w-[450px] h-[450px] object-contain grayscale"
                />
              </div>
            )}

            <div className="border border-slate-800 p-8 h-full flex flex-col justify-between text-center relative z-10">
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-700">
                  {coverText.namaDinas}
                </h3>
                <div className="w-16 h-0.5 bg-slate-900 mx-auto my-2"></div>
                <h4 className="text-sm font-bold uppercase tracking-widest text-slate-800">
                  DOKUMEN RESMI NEGARA REPUBLIK INDONESIA
                </h4>
              </div>

              <div className="space-y-6 my-auto py-8">
                <div className="flex justify-center mb-6">
                  <img
                    src={schoolProfile.logoUrl}
                    alt={schoolProfile.namaSekolah}
                    className="h-28 w-28 object-contain"
                  />
                </div>

                <div className="space-y-2">
                  <h1 className="text-3xl font-black uppercase tracking-[0.15em] text-slate-950">
                    {coverText.judulDokumen}
                  </h1>
                  <p className="text-xs tracking-widest uppercase font-sans font-semibold text-slate-600">
                    {coverText.subjudulDokumen}
                  </p>
                </div>

                <div className="pt-6 space-y-1">
                  <h2 className="text-xl font-black uppercase tracking-wider text-slate-900">
                    {schoolProfile.namaSekolah}
                  </h2>
                  <p className="text-xs font-mono font-semibold text-slate-600">
                    NPSN: {schoolProfile.npsn} &nbsp; | &nbsp; NSS: {schoolProfile.nss}
                  </p>
                  <p className="text-[11px] font-sans text-slate-500">
                    {schoolProfile.alamat}, Kel. {schoolProfile.kelurahan}, Kec. {schoolProfile.kecamatan}, {schoolProfile.kabupatenKota}
                  </p>
                </div>

                <div className="mt-8 inline-block border-t border-b border-slate-900 py-3 px-8 text-xs font-sans">
                  <div className="font-bold text-slate-900 uppercase tracking-wider">
                    {coverText.rombelLabel}
                  </div>
                  <div className="text-[11px] text-slate-600 font-mono mt-0.5">
                    {coverText.tahunAjaranLabel} · Terdata {displayedStudents.length} Dokumen Siswa
                  </div>
                </div>

                {coverText.keteranganTambahan && (
                  <p className="text-[10px] italic font-sans text-slate-500 max-w-md mx-auto mt-2">
                    {coverText.keteranganTambahan}
                  </p>
                )}
              </div>

              <div className="border-t border-slate-400 pt-4 text-[10px] text-slate-500 font-sans flex justify-between items-center">
                <span>KODE ARSIP: BI-SMA-{schoolProfile.npsn}</span>
                <span>{coverText.titimangsaKota}</span>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SELURUH DOKUMEN SISWA BERURUTAN (LEMBAR BIODATA + LEMBAR NILAI) */}
        {/* ============================================================== */}
        {displayedStudents.map((student) => {
          // Calculate total pages for this individual student ("halaman dari siswa nya di setiap halaman nya")
          // Page 1 = Lembar Biodata
          // Grade pages = 3 pages (for '2_per_page'), 6 pages (for '1_per_page'), or 1 page (for '6_per_page')
          const gradePagesCount =
            gradeLayoutMode === '2_per_page' ? 3 : gradeLayoutMode === '1_per_page' ? 6 : 1;
          const totalStudentPages = 1 + gradePagesCount;

          return (
            <div key={student.id} className="space-y-10 w-full flex flex-col items-center">
              {/* ---------------------------------------------------------- */}
              {/* HALAMAN 1 SISWA: BIODATA BUKU INDUK (BAGIAN A - F)         */}
              {/* ---------------------------------------------------------- */}
              <div className="print-sheet relative w-[794px] min-h-[1123px] bg-white text-slate-950 px-10 py-8 shadow-2xl font-serif text-[11px] leading-relaxed border border-slate-300 overflow-hidden flex flex-col justify-between">
                {enableWatermark && watermarkUrl && (
                  <div 
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={{ opacity: watermarkOpacity / 100 }}
                  >
                    <img
                      src={watermarkUrl}
                      alt="Watermark"
                      className="w-[420px] h-[420px] object-contain grayscale"
                    />
                  </div>
                )}

                <div className="relative z-10 flex-1 flex flex-col">
                  {/* Running Header Penanda Siswa (Halaman 1) */}
                  {renderStudentPageMarker(student, 1, totalStudentPages, 'header')}

                  <div className="space-y-3.5 flex-1">
                    {/* Kop Surat Resmi */}
                    <div className="text-center border-b-2 border-black pb-2.5">
                      <h3 className="text-xs font-bold tracking-widest uppercase">
                        PEMERINTAH DAERAH PROVINSI JAWA BARAT · DINAS PENDIDIKAN
                      </h3>
                      <h2 className="text-base font-black tracking-wider uppercase mt-0.5">
                        {schoolProfile.namaSekolah}
                      </h2>
                      <p className="text-[10px] font-sans text-slate-700">
                        {schoolProfile.alamat}, {schoolProfile.kabupatenKota} · Telp: {schoolProfile.nomorTelepon} · NPSN: {schoolProfile.npsn}
                      </p>
                    </div>

                    {/* Title */}
                    <div className="text-center py-0.5">
                      <h1 className="text-sm font-black underline uppercase tracking-wider">
                        LEMBAR BUKU INDUK SISWA
                      </h1>
                      <div className="font-mono text-xs font-bold mt-0.5">
                        NOMOR INDUK (NIS): {student.personal.nis} &nbsp; | &nbsp; NISN: {student.personal.nisn}
                      </div>
                    </div>

                    {/* Photo & Bagian A */}
                    <div className="flex gap-4 items-start">
                      <div className="w-28 flex-shrink-0 text-center">
                        <div className="mx-auto flex justify-center">
                          <StudentAvatar
                            fotoUrl={student.personal.fotoUrl}
                            namaLengkap={student.personal.namaLengkap}
                            size="pas-foto"
                            className="mx-auto shadow-xs"
                          />
                        </div>
                        <span className="text-[9px] font-sans text-slate-500 block mt-1">
                          Cap Sekolah & TTD
                        </span>
                      </div>

                      <div className="flex-1">
                        <h4 className="font-bold border-b border-black text-[11px] uppercase mb-1">
                          A. KETERANGAN TENTANG DIRI SISWA
                        </h4>
                        <table className="w-full text-[10.5px]">
                          <tbody>
                            <tr>
                              <td className="w-40 py-0.5">1. Nama Siswa Lengkap</td>
                              <td className="w-3">:</td>
                              <td className="font-bold uppercase">{student.personal.namaLengkap}</td>
                            </tr>
                            <tr>
                              <td className="py-0.5">2. Nama Panggilan</td>
                              <td>:</td>
                              <td>{student.personal.namaPanggilan}</td>
                            </tr>
                            <tr>
                              <td className="py-0.5">3. Jenis Kelamin</td>
                              <td>:</td>
                              <td>{student.personal.jenisKelamin === 'L' ? 'Laki-Laki (L)' : 'Perempuan (P)'}</td>
                            </tr>
                            <tr>
                              <td className="py-0.5">4. Tempat, Tanggal Lahir</td>
                              <td>:</td>
                              <td>{student.personal.tempatLahir}, {student.personal.tanggalLahir}</td>
                            </tr>
                            <tr>
                              <td className="py-0.5">5. Agama & Kewarganegaraan</td>
                              <td>:</td>
                              <td>{student.personal.agama} / {student.personal.kewarganegaraan}</td>
                            </tr>
                            <tr>
                              <td className="py-0.5">6. Anak Ke- / Dari Bersaudara</td>
                              <td>:</td>
                              <td>Anak ke-{student.personal.anakKe} dari {student.personal.jumlahSaudaraKandung + 1} bersaudara</td>
                            </tr>
                            <tr>
                              <td className="py-0.5">7. Bahasa Sehari-hari</td>
                              <td>:</td>
                              <td>{student.personal.bahasaKeseharian}</td>
                            </tr>
                            <tr>
                              <td className="py-0.5 align-top">8. Alamat Tempat Tinggal</td>
                              <td className="align-top">:</td>
                              <td>{student.personal.alamat}, Kel. {student.personal.kelurahan}, Kec. {student.personal.kecamatan}, {student.personal.kabupatenKota}</td>
                            </tr>
                            <tr>
                              <td className="py-0.5">9. Tinggal Bersama / No. HP</td>
                              <td>:</td>
                              <td>{student.personal.tinggalDengan} / {student.personal.nomorHp}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Bagian B & C */}
                    <div className="grid grid-cols-2 gap-4 mt-1">
                      <div>
                        <h4 className="font-bold border-b border-black text-[11px] uppercase mb-1">
                          B. KETERANGAN JASMANI
                        </h4>
                        <table className="w-full text-[10.5px]">
                          <tbody>
                            <tr>
                              <td className="w-36 py-0.5">1. Berat Badan</td>
                              <td className="w-3">:</td>
                              <td>{student.physical.beratBadanKg} kg</td>
                            </tr>
                            <tr>
                              <td className="py-0.5">2. Tinggi Badan</td>
                              <td>:</td>
                              <td>{student.physical.tinggiBadanCm} cm</td>
                            </tr>
                            <tr>
                              <td className="py-0.5">3. Golongan Darah</td>
                              <td>:</td>
                              <td>{student.physical.golonganDarah}</td>
                            </tr>
                            <tr>
                              <td className="py-0.5">4. Riwayat Penyakit</td>
                              <td>:</td>
                              <td>{student.physical.riwayatPenyakit || '-'}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div>
                        <h4 className="font-bold border-b border-black text-[11px] uppercase mb-1">
                          C. PENDIDIKAN SEBELUMNYA
                        </h4>
                        <table className="w-full text-[10.5px]">
                          <tbody>
                            <tr>
                              <td className="w-36 py-0.5">1. Asal Sekolah SMP</td>
                              <td className="w-3">:</td>
                              <td>{student.previousEducation.asalSekolah}</td>
                            </tr>
                            <tr>
                              <td className="py-0.5">2. No. Ijazah SMP</td>
                              <td>:</td>
                              <td>{student.previousEducation.nomorIjazahSmp}</td>
                            </tr>
                            <tr>
                              <td className="py-0.5">3. Diterima di Kelas</td>
                              <td>:</td>
                              <td className="font-bold">{student.previousEducation.diterimaDiKelas} ({student.previousEducation.jurusanPeminatan})</td>
                            </tr>
                            <tr>
                              <td className="py-0.5">4. Tanggal Penerimaan</td>
                              <td>:</td>
                              <td>{student.previousEducation.diterimaTanggal}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Bagian D: Orang Tua */}
                    <div className="mt-1">
                      <h4 className="font-bold border-b border-black text-[11px] uppercase mb-1">
                        D. KETERANGAN ORANG TUA KANDUNG
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <table className="w-full text-[10.5px]">
                          <tbody>
                            <tr className="font-bold underline">
                              <td colSpan={3}>DATA AYAH:</td>
                            </tr>
                            <tr>
                              <td className="w-32 py-0.5">Nama Lengkap</td>
                              <td className="w-3">:</td>
                              <td className="font-semibold">{student.ayah.nama}</td>
                            </tr>
                            <tr>
                              <td className="py-0.5">Tempat, Tgl Lahir</td>
                              <td>:</td>
                              <td>{student.ayah.tempatLahir}, {student.ayah.tanggalLahir}</td>
                            </tr>
                            <tr>
                              <td className="py-0.5">Pendidikan / Kerja</td>
                              <td>:</td>
                              <td>{student.ayah.pendidikanTerakhir} / {student.ayah.pekerjaan}</td>
                            </tr>
                            <tr>
                              <td className="py-0.5">Penghasilan</td>
                              <td>:</td>
                              <td>{student.ayah.penghasilanBulanan}</td>
                            </tr>
                            <tr>
                              <td className="py-0.5">No. Telepon / HP</td>
                              <td>:</td>
                              <td>{student.ayah.nomorHp}</td>
                            </tr>
                          </tbody>
                        </table>

                        <table className="w-full text-[10.5px]">
                          <tbody>
                            <tr className="font-bold underline">
                              <td colSpan={3}>DATA IBU:</td>
                            </tr>
                            <tr>
                              <td className="w-32 py-0.5">Nama Lengkap</td>
                              <td className="w-3">:</td>
                              <td className="font-semibold">{student.ibu.nama}</td>
                            </tr>
                            <tr>
                              <td className="py-0.5">Tempat, Tgl Lahir</td>
                              <td>:</td>
                              <td>{student.ibu.tempatLahir}, {student.ibu.tanggalLahir}</td>
                            </tr>
                            <tr>
                              <td className="py-0.5">Pendidikan / Kerja</td>
                              <td>:</td>
                              <td>{student.ibu.pendidikanTerakhir} / {student.ibu.pekerjaan}</td>
                            </tr>
                            <tr>
                              <td className="py-0.5">Penghasilan</td>
                              <td>:</td>
                              <td>{student.ibu.penghasilanBulanan}</td>
                            </tr>
                            <tr>
                              <td className="py-0.5">No. Telepon / HP</td>
                              <td>:</td>
                              <td>{student.ibu.nomorHp}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Bagian E & F */}
                    <div className="grid grid-cols-2 gap-4 mt-1">
                      <div>
                        <h4 className="font-bold border-b border-black text-[11px] uppercase mb-1">
                          E. KETERANGAN WALI SISWA
                        </h4>
                        {student.wali.adaWali ? (
                          <table className="w-full text-[10.5px]">
                            <tbody>
                              <tr>
                                <td className="w-32 py-0.5">Nama Wali</td>
                                <td className="w-3">:</td>
                                <td>{student.wali.nama}</td>
                              </tr>
                              <tr>
                                <td className="py-0.5">Hubungan Keluarga</td>
                                <td>:</td>
                                <td>{student.wali.hubunganKeluarga}</td>
                              </tr>
                              <tr>
                                <td className="py-0.5">Pekerjaan</td>
                                <td>:</td>
                                <td>{student.wali.pekerjaan}</td>
                              </tr>
                            </tbody>
                          </table>
                        ) : (
                          <p className="text-[10px] italic">Tidak memiliki wali (tinggal bersama orang tua kandung).</p>
                        )}
                      </div>

                      <div>
                        <h4 className="font-bold border-b border-black text-[11px] uppercase mb-1">
                          F. MENINGGALKAN SEKOLAH / LULUS
                        </h4>
                        <table className="w-full text-[10.5px]">
                          <tbody>
                            <tr>
                              <td className="w-32 py-0.5">Status Saat Ini</td>
                              <td className="w-3">:</td>
                              <td className="font-bold uppercase">{student.departure.status}</td>
                            </tr>
                            <tr>
                              <td className="py-0.5">No. Ijazah SMA</td>
                              <td>:</td>
                              <td>{student.departure.nomorIjazahSma || '-'}</td>
                            </tr>
                            <tr>
                              <td className="py-0.5">Melanjutkan Ke</td>
                              <td>:</td>
                              <td>{student.departure.namaPerguruanTinggi || '-'}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {renderSignatureFooter(student)}
                  </div>

                  {/* Running Footer Penanda Siswa (Halaman 1) */}
                  {renderStudentPageMarker(student, 1, totalStudentPages, 'footer')}
                </div>
              </div>

              {/* ---------------------------------------------------------- */}
              {/* MODE 1: 2 SEMESTER PER HALAMAN (IDENTIK FILE PDF TERLAMPIR)*/}
              {/* ---------------------------------------------------------- */}
              {gradeLayoutMode === '2_per_page' &&
                ([
                  [1, 2],
                  [3, 4],
                  [5, 6],
                ] as const).map(([semTop, semBottom], pairIndex) => {
                  const currentPageNum = 2 + pairIndex;
                  return (
                    <div
                      key={`${student.id}-pair-${pairIndex}`}
                      className="print-sheet relative w-[794px] min-h-[1123px] bg-white text-slate-950 px-10 py-6 shadow-2xl font-serif text-[10px] border border-slate-300 overflow-hidden flex flex-col justify-between"
                    >
                      {enableWatermark && watermarkUrl && (
                        <div 
                          className="absolute inset-0 flex items-center justify-center pointer-events-none"
                          style={{ opacity: watermarkOpacity / 100 }}
                        >
                          <img
                            src={watermarkUrl}
                            alt="Watermark"
                            className="w-[420px] h-[420px] object-contain grayscale"
                          />
                        </div>
                      )}

                      <div className="relative z-10 flex-1 flex flex-col justify-between">
                        {/* Running Header Penanda Siswa */}
                        {renderStudentPageMarker(student, currentPageNum, totalStudentPages, 'header')}

                        {/* Top Semester Block */}
                        <div className="space-y-3 my-auto">
                          {renderPdfSemesterBlock(student, semTop, true)}
                          <div className="border-t border-dashed border-slate-400 my-1" />
                          {/* Bottom Semester Block */}
                          {renderPdfSemesterBlock(student, semBottom, true)}
                        </div>

                        {pairIndex === 2 && renderSignatureFooter(student)}

                        {/* Running Footer Penanda Siswa */}
                        {renderStudentPageMarker(student, currentPageNum, totalStudentPages, 'footer')}
                      </div>
                    </div>
                  );
                })}

              {/* ---------------------------------------------------------- */}
              {/* MODE 2: 1 SEMESTER PENUH PER HALAMAN (6 HALAMAN NILAI)      */}
              {/* ---------------------------------------------------------- */}
              {gradeLayoutMode === '1_per_page' &&
                [1, 2, 3, 4, 5, 6].map((semNumber, semIdx) => {
                  const currentPageNum = 2 + semIdx;
                  return (
                    <div
                      key={`${student.id}-sem-${semNumber}`}
                      className="print-sheet relative w-[794px] min-h-[1123px] bg-white text-slate-950 px-10 py-8 shadow-2xl font-serif text-[10.5px] border border-slate-300 overflow-hidden flex flex-col justify-between"
                    >
                      {enableWatermark && watermarkUrl && (
                        <div 
                          className="absolute inset-0 flex items-center justify-center pointer-events-none"
                          style={{ opacity: watermarkOpacity / 100 }}
                        >
                          <img
                            src={watermarkUrl}
                            alt="Watermark"
                            className="w-[420px] h-[420px] object-contain grayscale"
                          />
                        </div>
                      )}

                      <div className="relative z-10 flex-1 flex flex-col justify-between">
                        {renderStudentPageMarker(student, currentPageNum, totalStudentPages, 'header')}

                        <div className="my-auto space-y-4">
                          <div className="text-center border-b border-black pb-2">
                            <h2 className="text-xs font-black uppercase tracking-wider">
                              CATATAN PRESTASI BELAJAR AKADEMIK — SEMESTER {semNumber}
                            </h2>
                          </div>

                          {renderPdfSemesterBlock(student, semNumber, false)}
                          {renderSignatureFooter(student)}
                        </div>

                        {renderStudentPageMarker(student, currentPageNum, totalStudentPages, 'footer')}
                      </div>
                    </div>
                  );
                })}

              {/* ---------------------------------------------------------- */}
              {/* MODE 3: RINGKAS 6 SEMESTER DALAM 1 HALAMAN MATRIKS         */}
              {/* ---------------------------------------------------------- */}
              {gradeLayoutMode === '6_per_page' && (
                <div className="print-sheet relative w-[794px] min-h-[1123px] bg-white text-slate-950 px-10 py-8 shadow-2xl font-serif text-[10px] border border-slate-300 overflow-hidden flex flex-col justify-between">
                  {enableWatermark && watermarkUrl && (
                    <div 
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                      style={{ opacity: watermarkOpacity / 100 }}
                    >
                      <img
                        src={watermarkUrl}
                        alt="Watermark"
                        className="w-[420px] h-[420px] object-contain grayscale"
                      />
                    </div>
                  )}

                  <div className="relative z-10 flex-1 flex flex-col justify-between">
                    {renderStudentPageMarker(student, 2, totalStudentPages, 'header')}

                    <div className="space-y-3 my-auto">
                      <div className="text-center border-b-2 border-black pb-2">
                        <h2 className="text-xs font-black uppercase tracking-wider">
                          REKAPITULASI NILAI CAPAIAN AKADEMIK (SEMESTER 1 S/D SEMESTER 6)
                        </h2>
                      </div>

                      <table className="w-full border-collapse border border-black text-[9px] font-sans">
                        <thead>
                          <tr className="bg-slate-100 font-bold text-center">
                            <th rowSpan={2} className="border border-black p-1 w-6">No</th>
                            <th rowSpan={2} className="border border-black p-1 text-left">Mata Pelajaran</th>
                            <th rowSpan={2} className="border border-black p-1 w-8">KKM</th>
                            <th colSpan={3} className="border border-black p-1">Sem 1</th>
                            <th colSpan={3} className="border border-black p-1">Sem 2</th>
                            <th colSpan={3} className="border border-black p-1">Sem 3</th>
                            <th colSpan={3} className="border border-black p-1">Sem 4</th>
                            <th colSpan={3} className="border border-black p-1">Sem 5</th>
                            <th colSpan={3} className="border border-black p-1">Sem 6</th>
                          </tr>
                          <tr className="bg-slate-50 font-bold text-center text-[8px]">
                            {[1, 2, 3, 4, 5, 6].map((s) => (
                              <React.Fragment key={s}>
                                <th className="border border-black p-0.5">P</th>
                                <th className="border border-black p-0.5">K</th>
                                <th className="border border-black p-0.5">Pr</th>
                              </React.Fragment>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {STANDARD_SUBJECTS_MIPA.map((sub, i) => (
                            <tr key={sub.code}>
                              <td className="border border-black p-1 text-center font-mono">{i + 1}</td>
                              <td className="border border-black p-1 font-medium">{sub.name}</td>
                              <td className="border border-black p-1 text-center font-mono">{sub.kkm}</td>
                              {[1, 2, 3, 4, 5, 6].map((sem) => {
                                const found = student.academicRecords?.[sem]?.grades?.find(
                                  (g) => g.mapelCode === sub.code || g.mapelName.toLowerCase() === sub.name.toLowerCase()
                                );
                                return (
                                  <React.Fragment key={sem}>
                                    <td className="border border-black p-1 text-center font-mono">
                                      {found ? found.nilaiPengetahuan : '-'}
                                    </td>
                                    <td className="border border-black p-1 text-center font-mono">
                                      {found ? found.nilaiKeterampilan : '-'}
                                    </td>
                                    <td className="border border-black p-1 text-center font-bold">
                                      {found ? found.predikatPengetahuan : '-'}
                                    </td>
                                  </React.Fragment>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Rekap Ekstrakurikuler & Kehadiran Semester 1-6 */}
                      <div className="grid grid-cols-2 gap-3 pt-1 font-sans">
                        <div>
                          <h4 className="font-bold text-[9.5px] uppercase mb-1">
                            Rekapitulasi Kehadiran per Semester (Hari)
                          </h4>
                          <table className="w-full border-collapse border border-black text-[8.5px] text-center">
                            <thead>
                              <tr className="bg-slate-100 font-bold">
                                <th className="border border-black p-1 text-left">Keterangan</th>
                                {[1, 2, 3, 4, 5, 6].map((s) => (
                                  <th key={s} className="border border-black p-1">Sem {s}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="border border-black p-1 text-left">Sakit (S)</td>
                                {[1, 2, 3, 4, 5, 6].map((s) => (
                                  <td key={s} className="border border-black p-1 font-mono">
                                    {student.academicRecords?.[s]?.attendance?.sakit ?? 0}
                                  </td>
                                ))}
                              </tr>
                              <tr>
                                <td className="border border-black p-1 text-left">Izin (I)</td>
                                {[1, 2, 3, 4, 5, 6].map((s) => (
                                  <td key={s} className="border border-black p-1 font-mono">
                                    {student.academicRecords?.[s]?.attendance?.izin ?? 0}
                                  </td>
                                ))}
                              </tr>
                              <tr>
                                <td className="border border-black p-1 text-left">Alpa (A)</td>
                                {[1, 2, 3, 4, 5, 6].map((s) => (
                                  <td key={s} className="border border-black p-1 font-mono">
                                    {student.academicRecords?.[s]?.attendance?.tanpaKeterangan ?? 0}
                                  </td>
                                ))}
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        <div>
                          <h4 className="font-bold text-[9.5px] uppercase mb-1">
                            Kegiatan Ekstrakurikuler per Semester
                          </h4>
                          <table className="w-full border-collapse border border-black text-[8.5px]">
                            <thead>
                              <tr className="bg-slate-100 font-bold">
                                <th className="border border-black p-1 text-center w-12">Sem</th>
                                <th className="border border-black p-1 text-left">Kegiatan & Predikat</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[1, 2, 3, 4, 5, 6].map((s) => {
                                const ekskuls = student.academicRecords?.[s]?.extracurriculars || [];
                                return (
                                  <tr key={s}>
                                    <td className="border border-black p-1 text-center font-mono font-bold">Sem {s}</td>
                                    <td className="border border-black p-1">
                                      {ekskuls.length > 0
                                        ? ekskuls.map((e) => `${e.namaKegiatan} (${e.predikat})`).join(', ')
                                        : 'KEPRAMUKAAN (Baik)'}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {renderSignatureFooter(student)}
                    </div>

                    {renderStudentPageMarker(student, 2, totalStudentPages, 'footer')}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
