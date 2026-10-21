import React, { useState } from 'react';
import { 
  Printer, 
  Download, 
  Play, 
  RotateCcw, 
  Terminal, 
  CheckCircle, 
  AlertCircle, 
  FileSpreadsheet, 
  FileText, 
  Archive, 
  Clock, 
  Cpu, 
  Zap,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';
import { QueueJobSimulation, StudentFullRecord, SchoolProfile } from '../../types/buku-induk';

interface PdfExportQueueViewProps {
  students: StudentFullRecord[];
  schoolProfile: SchoolProfile;
  onTriggerJobNotification: (
    title: string,
    body: string,
    downloadUrl: string,
    filename: string
  ) => void;
  onNavigateToPreview: (filterContext?: string) => void;
  onOpenImportModal: () => void;
}

export const PdfExportQueueView: React.FC<PdfExportQueueViewProps> = ({
  students,
  schoolProfile,
  onTriggerJobNotification,
  onNavigateToPreview,
  onOpenImportModal,
}) => {
  const [filterType, setFilterType] = useState<'Siswa' | 'Kelas' | 'Tingkat' | 'Tahun'>('Kelas');
  const [targetValue, setTargetValue] = useState<string>('XI-MIPA-1');
  const [activeJob, setActiveJob] = useState<QueueJobSimulation | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const getEstimatedStudentCount = () => {
    if (filterType === 'Siswa') return 1;
    if (filterType === 'Kelas') return 36;
    if (filterType === 'Tingkat') return 288;
    if (filterType === 'Tahun') return 288;
    return 36;
  };

  const handleStartQueueJob = () => {
    if (isProcessing) return;

    const totalRecords = getEstimatedStudentCount();
    const jobId = 'JOB-' + Math.floor(1000 + Math.random() * 9000);
    const initialJob: QueueJobSimulation = {
      id: jobId,
      jobName: 'PdfExportJob (Spatie Browsershot - Merged Single PDF)',
      filterType,
      targetLabel: targetValue,
      totalRecords,
      processedRecords: 0,
      status: 'pending',
      startedAt: new Date().toLocaleTimeString(),
      logs: [
        `[${new Date().toLocaleTimeString()}] [Supervisor Worker-1] Job ${jobId} didispatch oleh User: admin (${schoolProfile.namaSekolah}).`,
        `[${new Date().toLocaleTimeString()}] [Supervisor Worker-1] Query data: Filter ${filterType} = "${targetValue}". Total: ${totalRecords} siswa.`,
        `[${new Date().toLocaleTimeString()}] [Supervisor Worker-1] Format Output: 1 File PDF Utuh Gabungan (Cover Halaman Depan + Lembar I & II Siswa).`,
        `[${new Date().toLocaleTimeString()}] [Supervisor Worker-1] Streaming cursor lazyById(50) anti memory-leak...`,
      ],
    };

    setActiveJob(initialJob);
    setIsProcessing(true);

    let currentProcessed = 0;
    const intervalTime = totalRecords > 50 ? 400 : 700;

    const timer = setInterval(() => {
      const stepIncrement = totalRecords > 50 ? Math.ceil(totalRecords / 10) : 5;
      currentProcessed += stepIncrement;

      if (currentProcessed < totalRecords) {
        setActiveJob((prev) => {
          if (!prev) return null;
          const chunkNum = Math.ceil(currentProcessed / 50);
          return {
            ...prev,
            status: 'processing',
            processedRecords: currentProcessed,
            logs: [
              ...prev.logs,
              `[${new Date().toLocaleTimeString()}] [Batch ${chunkNum}] Spatie Browsershot rendering ${stepIncrement} siswa (Chromium headless --no-sandbox)...`,
              `[${new Date().toLocaleTimeString()}] [Watermark & Cover] Merging Cover Depan dan logo watermark transparan...`,
            ],
          };
        });
      } else {
        clearInterval(timer);
        setIsProcessing(false);
        const pdfName = `Buku_Induk_Gabungan_${filterType}_${targetValue}_${Date.now()}.pdf`;
        const downloadUrl = '#download-simulated';

        setActiveJob((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            status: 'completed',
            processedRecords: totalRecords,
            completedAt: new Date().toLocaleTimeString(),
            downloadUrl,
            fileSizeMb: Number((totalRecords * 0.42 + 1.2).toFixed(2)),
            logs: [
              ...prev.logs,
              `[${new Date().toLocaleTimeString()}] Berhasil menggabungkan Cover dan ${totalRecords} dokumen siswa ke dalam 1 File PDF Gabungan: storage/app/public/exports/${pdfName}`,
              `[${new Date().toLocaleTimeString()}] Status: Siap dikirim ke mesin printer fisik kertas.`,
              `[${new Date().toLocaleTimeString()}] [Notification::make()] Mengirim Database Notification ke lonceng Filament...`,
            ],
          };
        });

        onTriggerJobNotification(
          'Pencetakan 1 File PDF Gabungan Selesai!',
          `Dokumen Buku Induk ${filterType} (${targetValue}) telah selesai digenerate menjadi 1 File PDF utuh siap cetak kertas (${totalRecords} siswa).`,
          downloadUrl,
          pdfName
        );
      }
    }, intervalTime);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              FASE 4
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Cetak Buku Induk PDF Massal (1 File Gabungan)
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Mencetak Cover Depan dan seluruh siswa ke dalam 1 File PDF utuh siap cetak langsung ke printer kertas
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenImportModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 shadow-sm transition-all"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            <span>Pusat Impor Excel & Foto ZIP</span>
          </button>

          <button
            onClick={() => onNavigateToPreview(`${filterType}: ${targetValue}`)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-sm transition-all"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Buka Pratinjau 1 Berkas Gabungan</span>
          </button>
        </div>
      </div>

      {/* Critical Architecture Card */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900/50 dark:bg-amber-950/20 text-xs text-amber-900 dark:text-amber-200 leading-relaxed space-y-1">
        <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
          <Zap className="h-4 w-4 text-amber-600" />
          <span>ARSITEKTUR CETAK 1 BERKAS GABUNGAN (SINGLE MERGED PDF):</span>
        </div>
        <p>
          Dokumen cetak massal digabung dalam <strong>1 berkas PDF utuh berkesinambungan</strong> yang diawali oleh <strong>Cover Halaman Depan</strong> berbingkai klasik kedinasan, diikuti lembar biodata dan nilai seluruh siswa. Dilengkapi <strong>Watermark Kustom</strong> dan <strong>Toggle Tanda Tangan</strong> Kepala Sekolah & Wali Kelas.
        </p>
      </div>

      {/* Dispatch Job Form Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Printer className="h-4 w-4 text-amber-500" />
            <span>Parameter Cetak 1 File Gabungan</span>
          </h3>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Filter Pencetakan Massal
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Siswa', 'Kelas', 'Tingkat', 'Tahun'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setFilterType(type);
                    if (type === 'Siswa') setTargetValue(students[0]?.personal.namaLengkap || 'Siswa');
                    if (type === 'Kelas') setTargetValue('XI-MIPA-1');
                    if (type === 'Tingkat') setTargetValue('Tingkat XI (Fase F)');
                    if (type === 'Tahun') setTargetValue('Tahun Ajaran 2024/2025');
                  }}
                  className={`py-2 px-2.5 rounded-lg text-xs font-semibold border transition-all ${
                    filterType === type
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400'
                  }`}
                >
                  Per {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Pilihan Target {filterType}
            </label>
            {filterType === 'Siswa' && (
              <select
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.personal.namaLengkap}>
                    {st.personal.namaLengkap} ({st.personal.nis})
                  </option>
                ))}
              </select>
            )}

            {filterType === 'Kelas' && (
              <select
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="X-MIPA-1">Kelas X-MIPA-1 (36 Siswa)</option>
                <option value="XI-MIPA-1">Kelas XI-MIPA-1 (36 Siswa)</option>
                <option value="XII-MIPA-1">Kelas XII-MIPA-1 (36 Siswa)</option>
                <option value="XII-IPS-1">Kelas XII-IPS-1 (36 Siswa)</option>
              </select>
            )}

            {filterType === 'Tingkat' && (
              <select
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="Tingkat X (Fase E)">Tingkat X / Kelas 10 (288 Siswa)</option>
                <option value="Tingkat XI (Fase F)">Tingkat XI / Kelas 11 (288 Siswa)</option>
                <option value="Tingkat XII (Fase F)">Tingkat XII / Kelas 12 (288 Siswa)</option>
              </select>
            )}

            {filterType === 'Tahun' && (
              <select
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="Tahun Ajaran 2024/2025">Tahun Ajaran 2024/2025 Genap</option>
                <option value="Tahun Masuk 2024">Angkatan Masuk 2024</option>
                <option value="Tahun Lulus 2024">Angkatan Lulus 2024</option>
              </select>
            )}
          </div>

          <div className="rounded-lg bg-slate-50 p-3 text-xs dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1 text-slate-600 dark:text-slate-400">
            <div className="flex justify-between">
              <span>Estimasi Siswa:</span>
              <strong className="text-slate-900 dark:text-white">{getEstimatedStudentCount()} Orang</strong>
            </div>
            <div className="flex justify-between">
              <span>Format Cetak:</span>
              <strong className="text-emerald-600 dark:text-emerald-400">1 File PDF Utuh Gabungan</strong>
            </div>
            <div className="flex justify-between">
              <span>Cover Halaman Depan:</span>
              <strong className="text-amber-600 dark:text-amber-400">Bingkai Klasik Resmi</strong>
            </div>
          </div>

          <button
            onClick={handleStartQueueJob}
            disabled={isProcessing}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-md ${
              isProcessing
                ? 'bg-amber-400 text-slate-900 cursor-wait animate-pulse'
                : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
            }`}
          >
            {isProcessing ? (
              <>
                <Clock className="h-4 w-4 animate-spin" />
                <span>Memproses 1 File PDF di Background...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                <span>🚀 Dispatch Cetak 1 File Gabungan (Queue)</span>
              </>
            )}
          </button>
        </div>

        {/* Live Queue Monitor & Terminal Stream */}
        <div className="lg:col-span-2 space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Terminal className="h-4 w-4 text-emerald-500" />
              <span>Supervisor Worker & Queue Progress (Live Log)</span>
            </h3>

            {activeJob && (
              <span className="text-[11px] px-2 py-0.5 rounded-full font-bold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                {activeJob.status}
              </span>
            )}
          </div>

          {activeJob ? (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Progres Render Siswa: {activeJob.processedRecords} / {activeJob.totalRecords}
                  </span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {Math.round((activeJob.processedRecords / activeJob.totalRecords) * 100)}%
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-300"
                    style={{
                      width: `${Math.round((activeJob.processedRecords / activeJob.totalRecords) * 100)}%`,
                    }}
                  ></div>
                </div>
              </div>

              {activeJob.status === 'completed' && (
                <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    <div>
                      <strong className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                        1 Berkas PDF Gabungan Selesai Digenerate!
                      </strong>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                        Ukuran File: {activeJob.fileSizeMb} MB · Memuat Cover + Seluruh Lembar {activeJob.totalRecords} Siswa
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigateToPreview(`${filterType}: ${targetValue}`)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 shadow-sm"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Buka Lembar Cetak Kertas</span>
                  </button>
                </div>
              )}

              <div className="h-64 rounded-xl bg-slate-950 p-3 font-mono text-[11px] text-slate-300 overflow-y-auto space-y-1 border border-slate-800">
                {activeJob.logs.map((log, i) => (
                  <div key={i} className="leading-relaxed">
                    <span className="text-amber-400">➜</span> {log}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-72 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-center p-6 text-slate-400">
              <Printer className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Background Queue Worker Siap Mencetak 1 File PDF Gabungan
              </p>
              <p className="text-[11px] text-slate-400 max-w-sm mt-1">
                Pilih filter di sebelah kiri dan klik tombol "Dispatch Cetak 1 File Gabungan" untuk memproses.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
