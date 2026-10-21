export interface CodeSnippet {
  id: string;
  title: string;
  filename: string;
  description: string;
  category: 'Migration' | 'Jobs & Spatie' | 'Filament Resource' | 'Backup' | 'Server Config';
  code: string;
  explanation: string[];
}

export const CODE_SNIPPETS: CodeSnippet[] = [
  {
    id: 'migration-students',
    title: '1. Migration Tabel Siswa (Bagian A-F Buku Induk)',
    filename: 'database/migrations/2026_01_01_000001_create_students_table.php',
    description: 'Skema database komprehensif tabel students yang menampung seluruh atribut Bagian A s/d F dokumen resmi Buku Induk Siswa SMA.',
    category: 'Migration',
    code: `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Skema Buku Induk Siswa SMA Sesuai Standar Depdikbud / Kemendikbudristek
     */
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();

            // ==========================================
            // BAGIAN A: KETERANGAN TENTANG DIRI SISWA
            // ==========================================
            $table->string('nis', 20)->unique()->index();
            $table->string('nisn', 10)->unique()->index();
            $table->string('nama_lengkap');
            $table->string('nama_panggilan', 50)->nullable();
            $table->enum('jenis_kelamin', ['L', 'P']);
            $table->string('tempat_lahir');
            $table->date('tanggal_lahir');
            $table->string('agama', 30); // Islam, Kristen Protestan, Katolik, Hindu, Buddha, Khonghucu
            $table->string('kewarganegaraan', 30)->default('WNI');
            $table->unsignedTinyInteger('anak_ke')->default(1);
            $table->unsignedTinyInteger('jumlah_saudara_kandung')->default(0);
            $table->unsignedTinyInteger('jumlah_saudara_tiri')->default(0);
            $table->unsignedTinyInteger('jumlah_saudara_angkat')->default(0);
            $table->enum('status_anak', ['Lengkap', 'Yatim', 'Piatu', 'Yatim Piatu'])->default('Lengkap');
            $table->string('bahasa_keseharian')->default('Bahasa Indonesia');
            
            // Alamat & Tempat Tinggal Siswa
            $table->text('alamat');
            $table->string('rt_rw', 20)->nullable();
            $table->string('kelurahan', 100);
            $table->string('kecamatan', 100);
            $table->string('kabupaten_kota', 100);
            $table->string('provinsi', 100);
            $table->string('kode_pos', 10)->nullable();
            $table->string('telepon_rumah', 30)->nullable();
            $table->string('nomor_hp', 30)->nullable();
            $table->enum('tinggal_dengan', ['Orang Tua', 'Menumpang', 'Asrama', 'Kost', 'Wali'])->default('Orang Tua');
            $table->decimal('jarak_ke_sekolah_km', 5, 2)->nullable();
            $table->string('transportasi_ke_sekolah', 50)->nullable(); // Jalan Kaki, Sepeda Motor, Angkot
            $table->string('foto_siswa')->nullable(); // Path storage pas foto 3x4

            // ==========================================
            // BAGIAN B: KETERANGAN JASMANI
            // ==========================================
            $table->unsignedSmallInteger('berat_badan_kg')->nullable();
            $table->unsignedSmallInteger('tinggi_badan_cm')->nullable();
            $table->enum('golongan_darah', ['A', 'B', 'AB', 'O', 'Tidak Tahu'])->default('Tidak Tahu');
            $table->text('riwayat_penyakit')->nullable();
            $table->text('kelainan_jasmani')->nullable();

            // ==========================================
            // BAGIAN C: PENDIDIKAN SEBELUMNYA & PENERIMAAN
            // ==========================================
            $table->string('asal_sekolah_smp');
            $table->string('nomor_ijazah_smp', 50)->nullable();
            $table->date('tanggal_ijazah_smp')->nullable();
            $table->string('nomor_skhun_smp', 50)->nullable();
            $table->unsignedTinyInteger('lama_belajar_smp_tahun')->default(3);
            
            // Penerimaan di SMA ini
            $table->date('tanggal_diterima');
            $table->string('diterima_di_kelas', 30); // Contoh: X-MIPA-1
            $table->enum('jurusan_peminatan', ['MIPA', 'IPS', 'BAHASA', 'UMUM'])->default('MIPA');
            $table->boolean('is_pindahan')->default(false);
            $table->string('asal_sekolah_pindahan')->nullable();
            $table->text('alasan_pindah')->nullable();

            // ==========================================
            // BAGIAN D: KETERANGAN ORANG TUA KANDUNG
            // ==========================================
            // Data Ayah
            $table->string('ayah_nama')->nullable();
            $table->string('ayah_tempat_lahir')->nullable();
            $table->date('ayah_tanggal_lahir')->nullable();
            $table->string('ayah_agama', 30)->nullable();
            $table->string('ayah_kewarganegaraan', 30)->default('WNI');
            $table->string('ayah_pendidikan_terakhir', 50)->nullable(); // SD, SMP, SMA, S1, S2, S3
            $table->string('ayah_pekerjaan', 100)->nullable();
            $table->string('ayah_penghasilan_bulanan', 50)->nullable();
            $table->text('ayah_alamat')->nullable();
            $table->string('ayah_nomor_hp', 30)->nullable();
            $table->boolean('ayah_masih_hidup')->default(true);
            $table->year('ayah_tahun_meninggal')->nullable();

            // Data Ibu
            $table->string('ibu_nama')->nullable();
            $table->string('ibu_tempat_lahir')->nullable();
            $table->date('ibu_tanggal_lahir')->nullable();
            $table->string('ibu_agama', 30)->nullable();
            $table->string('ibu_kewarganegaraan', 30)->default('WNI');
            $table->string('ibu_pendidikan_terakhir', 50)->nullable();
            $table->string('ibu_pekerjaan', 100)->nullable();
            $table->string('ibu_penghasilan_bulanan', 50)->nullable();
            $table->text('ibu_alamat')->nullable();
            $table->string('ibu_nomor_hp', 30)->nullable();
            $table->boolean('ibu_masih_hidup')->default(true);
            $table->year('ibu_tahun_meninggal')->nullable();

            // ==========================================
            // BAGIAN E: KETERANGAN WALI SISWA (Jika ada)
            // ==========================================
            $table->boolean('ada_wali')->default(false);
            $table->string('wali_nama')->nullable();
            $table->string('wali_tempat_lahir')->nullable();
            $table->date('wali_tanggal_lahir')->nullable();
            $table->string('wali_agama', 30)->nullable();
            $table->string('wali_kewarganegaraan', 30)->default('WNI');
            $table->string('wali_hubungan_keluarga', 50)->nullable(); // Paman, Kakek, Kakak, dsb.
            $table->string('wali_pendidikan_terakhir', 50)->nullable();
            $table->string('wali_pekerjaan', 100)->nullable();
            $table->string('wali_penghasilan_bulanan', 50)->nullable();
            $table->text('wali_alamat')->nullable();
            $table->string('wali_nomor_hp', 30)->nullable();

            // ==========================================
            // BAGIAN F: PERKEMBANGAN & MENINGGALKAN SEKOLAH
            // ==========================================
            $table->enum('status_siswa', ['Aktif', 'Lulus', 'Pindah', 'Keluar'])->default('Aktif')->index();
            $table->text('bakat_dan_prestasi')->nullable();
            $table->text('beasiswa_yang_diterima')->nullable();
            
            // Jika Lulus:
            $table->year('tahun_lulus')->nullable();
            $table->string('nomor_ijazah_sma', 50)->nullable();
            $table->date('tanggal_ijazah_sma')->nullable();
            $table->string('melanjutkan_ke')->nullable(); // Nama PTN/PTS atau Perusahaan
            
            // Jika Pindah/Keluar Sebelum Lulus:
            $table->string('pindah_ke_sekolah')->nullable();
            $table->text('alasan_pindah_keluar')->nullable();
            $table->date('tanggal_pindah_keluar')->nullable();
            $table->text('catatan_guru_bk')->nullable();

            // Meta & Timestamps
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes(); // Proteksi data arsip hukum buku induk
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};`,
    explanation: [
      'Menyimpan 100% field formal Buku Induk Siswa SMA dari Bagian A hingga F.',
      'Menggunakan Soft Deletes (`softDeletes()`) karena Buku Induk adalah dokumen arsip hukum negara yang tidak boleh terhapus permanen tanpa jejak audit.',
      'Indeks unik pada `nis` dan `nisn` untuk kecepatan pencarian data saat query ribuan siswa.',
      'Foreign key `created_by` dan `updated_by` untuk jejak rekam petugas TU / operator.',
    ],
  },
  {
    id: 'migration-grades',
    title: '2. Migration Nilai & Rekapitulasi Akademik (Semester 1-6)',
    filename: 'database/migrations/2026_01_01_000002_create_grades_and_academic_records_table.php',
    description: 'Skema tabel nilai mata pelajaran per semester, rekap ekstrakurikuler, dan presensi semester yang menampung rekam jejak 6 semester.',
    category: 'Migration',
    code: `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Master Mata Pelajaran
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique(); // Misal: MAT-WAJIB, FIS-MINAT
            $table->string('name');
            $table->enum('kelompok', ['A', 'B', 'C', 'Lintas Minat']);
            $table->unsignedTinyInteger('kkm_default')->default(75);
            $table->unsignedTinyInteger('urutan_rapor')->default(1);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Rekapitulasi Semester Siswa (Parent Record per Semester)
        Schema::create('student_semester_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->unsignedTinyInteger('semester'); // 1, 2, 3, 4, 5, 6
            $table->string('tahun_ajaran', 10); // '2024/2025'
            $table->string('tingkat_kelas', 10); // 'X', 'XI', 'XII'
            $table->string('nama_kelas', 30); // 'X-MIPA-1'
            $table->foreignId('wali_kelas_id')->nullable()->constrained('users')->nullOnDelete();

            // Presensi Semester
            $table->unsignedSmallInteger('presensi_sakit')->default(0);
            $table->unsignedSmallInteger('presensi_izin')->default(0);
            $table->unsignedSmallInteger('presensi_alpa')->default(0);

            // Sikap Spiritual & Sosial
            $table->char('predikat_spiritual', 1)->default('B'); // A, B, C, D
            $table->text('deskripsi_spiritual')->nullable();
            $table->char('predikat_sosial', 1)->default('B');
            $table->text('deskripsi_sosial')->nullable();

            // Catatan & Kenaikan
            $table->text('catatan_wali_kelas')->nullable();
            $table->enum('status_kenaikan', ['Naik Kelas', 'Tinggal di Kelas', 'Lulus', 'Tidak Lulus'])->nullable();
            
            $table->timestamps();
            $table->unique(['student_id', 'semester'], 'unique_student_semester');
        });

        // 3. Rincian Nilai per Mata Pelajaran
        Schema::create('student_grades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_semester_report_id')->constrained('student_semester_reports')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained('subjects')->cascadeOnDelete();
            
            $table->unsignedTinyInteger('kkm')->default(75);
            
            // Nilai Pengetahuan (Kognitif)
            $table->decimal('nilai_pengetahuan', 5, 2);
            $table->char('predikat_pengetahuan', 1); // A, B, C, D (Kalkulasi otomatis)
            $table->text('deskripsi_pengetahuan')->nullable();

            // Nilai Keterampilan (Psikomotorik)
            $table->decimal('nilai_keterampilan', 5, 2);
            $table->char('predikat_keterampilan', 1); // A, B, C, D
            $table->text('deskripsi_keterampilan')->nullable();

            $table->timestamps();
            $table->unique(['student_semester_report_id', 'subject_id'], 'unique_report_subject');
        });

        // 4. Rekap Ekstrakurikuler per Semester
        Schema::create('student_extracurriculars', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_semester_report_id')->constrained('student_semester_reports')->cascadeOnDelete();
            $table->string('nama_kegiatan'); // Pramuka (Wajib), PMR, KIR, Basket, dll
            $table->enum('predikat', ['Sangat Baik', 'Baik', 'Cukup', 'Kurang'])->default('Baik');
            $table->text('keterangan')->nullable();
            $table->timestamps();
        });

        // 5. Tabel Absensi Harian (Fase 1)
        Schema::create('daily_attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->string('kelas', 30)->index();
            $table->date('tanggal')->index();
            $table->enum('status', ['H', 'S', 'I', 'A'])->default('H'); // Hadir, Sakit, Izin, Alpa
            $table->text('keterangan')->nullable();
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['student_id', 'tanggal'], 'unique_daily_student_attendance');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_attendances');
        Schema::dropIfExists('student_extracurriculars');
        Schema::dropIfExists('student_grades');
        Schema::dropIfExists('student_semester_reports');
        Schema::dropIfExists('subjects');
    }
};`,
    explanation: [
      'Normalisasi database yang rapi: `student_semester_reports` menyimpan induk per semester, `student_grades` menyimpan per mata pelajaran.',
      'Mendukung rekam jejak lengkap Semester 1 hingga Semester 6 tanpa batasan statis.',
      'Penghitungan predikat A/B/C/D dapat dihitung otomatis via Model Observer atau mutator.',
      'Tabel `daily_attendances` diindeks pada `(student_id, tanggal)` untuk efisiensi kueri absensi harian Fase 1.',
    ],
  },
  {
    id: 'pdf-export-job',
    title: '3. Logika Cetak PDF Massal Anti Time-Out (Spatie Browsershot + Queue)',
    filename: 'app/Jobs/PdfExportJob.php',
    description: 'Laravel Queue Job production-ready yang mengeksekusi pencetakan ribuan siswa secara streaming tanpa memory leak / timeout, menghasilkan ZIP file dan mengirim Filament Database Notification.',
    category: 'Jobs & Spatie',
    code: `<?php

namespace App\\Jobs;

use App\\Models\\Student;
use App\\Models\\User;
use Filament\\Notifications\\Actions\\Action;
use Filament\\Notifications\\Notification;
use Illuminate\\Bus\\Queueable;
use Illuminate\\Contracts\\Queue\\ShouldQueue;
use Illuminate\\Foundation\\Bus\\Dispatchable;
use Illuminate\\Queue\\InteractsWithQueue;
use Illuminate\\Queue\\SerializesModels;
use Illuminate\\Support\\Facades\\File;
use Illuminate\\Support\\Facades\\Log;
use Illuminate\\Support\\Facades\\Storage;
use Illuminate\\Support\\Facades\\View;
use Spatie\\Browsershot\\Browsershot;
use ZipArchive;

class PdfExportJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Set timeout lebih longgar untuk background worker.
     * Tidak membebani HTTP Request Nginx / PHP-FPM.
     */
    public int $timeout = 1800; // 30 Menit
    public int $tries = 2;

    public function __construct(
        public int $userId,
        public string $filterType, // 'single', 'class', 'major', 'generation'
        public ?string $filterValue, // Contoh: 'XII-MIPA-1' atau '2024'
        public ?int $studentId = null
    ) {}

    public function handle(): void
    {
        $user = User::find($this->userId);
        if (!$user) {
            Log::error("[PdfExportJob] User ID {$this->userId} tidak ditemukan.");
            return;
        }

        $timestamp = now()->format('Ymd_His');
        $batchFolder = "exports/buku_induk_{$this->filterType}_{$timestamp}";
        $tempPath = storage_path("app/{$batchFolder}");
        File::ensureDirectoryExists($tempPath);

        // Siapkan Query Siswa dengan Eager Loading lengkap Bagian A-F dan Semester 1-6
        $query = Student::with([
            'semesterReports.grades.subject',
            'semesterReports.extracurriculars',
        ]);

        if ($this->filterType === 'single' && $this->studentId) {
            $query->where('id', $this->studentId);
        } elseif ($this->filterType === 'class') {
            $query->where('diterima_di_kelas', $this->filterValue);
        } elseif ($this->filterType === 'major') {
            $query->where('jurusan_peminatan', $this->filterValue);
        } elseif ($this->filterType === 'generation') {
            $query->where('tahun_lulus', $this->filterValue)
                  ->orWhereYear('tanggal_diterima', $this->filterValue);
        }

        $totalSiswa = (clone $query)->count();

        if ($totalSiswa === 0) {
            Notification::make()
                ->title('Cetak Buku Induk Gagal')
                ->body('Tidak ada data siswa yang cocok dengan filter yang dipilih.')
                ->warning()
                ->sendToDatabase($user);
            return;
        }

        Log::info("[PdfExportJob] Memulai cetak {$totalSiswa} siswa via Browsershot (Filter: {$this->filterType} = {$this->filterValue})");

        $pdfFiles = [];
        $processedCount = 0;

        /**
         * ANTI MEMORY-LEAK & ANTI TIME-OUT:
         * Gunakan lazyById() untuk memecah dataset ribuan siswa ke cursor chunking 50 record.
         * Jangan gunakan ->get() yang memuat ribuan model Eloquent sekaligus ke RAM!
         */
        $query->orderBy('id')->lazyById(50)->each(function (Student $student) use ($tempPath, &$pdfFiles, &$processedCount, $totalSiswa) {
            try {
                // 1. Render Blade HTML template resmi Buku Induk Siswa SMA
                $html = View::make('pdf.buku-induk-siswa', [
                    'student' => $student,
                    'reports' => $student->semesterReports->keyBy('semester'),
                    'printedAt' => now()->translatedFormat('d F Y'),
                ])->render();

                $cleanNis = preg_replace('/[^A-Za-z0-9]/', '_', $student->nis);
                $cleanNama = preg_replace('/[^A-Za-z0-9]/', '_', $student->nama_lengkap);
                $pdfFilename = "BukuInduk_{$cleanNis}_{$cleanNama}.pdf";
                $targetFile = "{$tempPath}/{$pdfFilename}";

                /**
                 * EKSEKUSI SPATIE BROWSERSHOT DENGAN SERVER TUNING ANTI-CRASH:
                 * - noSandbox & disableDevShmUsage wajib di Docker / Ubuntu Server
                 * - setExtraHttpHeaders / setNodeBinary menyesuaikan environment
                 */
                Browsershot::html($html)
                    ->setNodeBinary(config('services.browsershot.node_bin', '/usr/bin/node'))
                    ->setNpmBinary(config('services.browsershot.npm_bin', '/usr/bin/npm'))
                    ->noSandbox()
                    ->addChromiumArguments([
                        '--disable-dev-shm-usage',
                        '--disable-gpu',
                        '--disable-software-rasterizer',
                        '--disable-extensions',
                    ])
                    ->format('A4')
                    ->margins(15, 15, 15, 15) // mm
                    ->showBackground()
                    ->save($targetFile);

                $pdfFiles[] = $targetFile;
                $processedCount++;

                // Bersihkan siklus memori PHP
                if ($processedCount % 25 === 0) {
                    gc_collect_cycles();
                    Log::info("[PdfExportJob] Kemajuan: {$processedCount} / {$totalSiswa} berkas PDF.");
                }
            } catch (\\Throwable $e) {
                Log::error("[PdfExportJob] Gagal generate PDF Siswa ID {$student->id}: " . $e->getMessage());
            }
        });

        // 3. Jika lebih dari 1 file, bundel ke dalam ZIP
        $zipFilename = "Buku_Induk_{$this->filterType}_{$this->filterValue}_{$timestamp}.zip";
        $zipStoragePath = "public/exports/{$zipFilename}";
        $zipFullPath = storage_path("app/{$zipStoragePath}");

        File::ensureDirectoryExists(dirname($zipFullPath));

        $zip = new ZipArchive();
        if ($zip->open($zipFullPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) === true) {
            foreach ($pdfFiles as $file) {
                if (file_exists($file)) {
                    $zip->addFile($file, basename($file));
                }
            }
            $zip->close();
        }

        // 4. Bersihkan folder sementara per-siswa untuk hemat storage
        File::deleteDirectory($tempPath);

        $downloadUrl = Storage::url("exports/{$zipFilename}");
        $fileSizeMb = round(filesize($zipFullPath) / 1024 / 1024, 2);

        Log::info("[PdfExportJob] Selesai! Berkas tersimpan di {$zipFullPath} ({$fileSizeMb} MB). Mengirim notifikasi...");

        /**
         * 5. KIRIM DATABASE NOTIFICATION FILAMENT KE USER:
         * Menampilkan lonceng notifikasi real-time lengkap dengan action download langsung.
         */
        Notification::make()
            ->title('Pencetakan Buku Induk Selesai!')
            ->body("Sebanyak {$processedCount} dokumen Buku Induk ({$this->filterValue}) siap diunduh. Ukuran: {$fileSizeMb} MB.")
            ->success()
            ->actions([
                Action::make('download')
                    ->label('Unduh Berkas ZIP')
                    ->url($downloadUrl, shouldOpenInNewTab: true)
                    ->button()
                    ->color('success')
                    ->icon('heroicon-o-arrow-down-tray'),
                Action::make('markAsRead')
                    ->label('Tandai Dibaca')
                    ->markAsRead(),
            ])
            ->sendToDatabase($user);
    }

    public function failed(\\Throwable $exception): void
    {
        Log::critical("[PdfExportJob] Fatal failure: " . $exception->getMessage());

        $user = User::find($this->userId);
        if ($user) {
            Notification::make()
                ->title('Pencetakan Buku Induk Gagal')
                ->body('Terjadi kegagalan sistem saat merender PDF: ' . substr($exception->getMessage(), 0, 150))
                ->danger()
                ->sendToDatabase($user);
        }
    }
}`,
    explanation: [
      'Menghindari batas waktu HTTP (Time-Out): Dijalankan asynchronous via Laravel Queue (`ShouldQueue`), bebas dari timeout 60 detik Nginx/PHP-FPM.',
      'Anti Memory Leak: Menggunakan `Student::lazyById(50)` bukan `Student::get()`. Chunking cursor mencegah memori PHP meluap saat mencetak 500-2000 siswa.',
      'Spatie Browsershot Tuning: Menggunakan flag headless Chromium `--no-sandbox` dan `--disable-dev-shm-usage` untuk kestabilan di environment Linux/Docker.',
      'Otomatisasi ZIP & Cleanup: Menggabungkan PDF ke arsip ZIP dan langsung menghapus file temporary untuk menjaga kapasitas disk server.',
      'Filament Database Notification: Menggunakan `Notification::make()->actions([...])->sendToDatabase($user)` sehingga ada tombol "Unduh Berkas ZIP" langsung di lonceng notifikasi user.',
    ],
  },
  {
    id: 'filament-student-resource',
    title: '4. Filament Resource: Form Schema Bagian A-F & Bulk Action Dispatch',
    filename: 'app/Filament/Resources/StudentResource.php',
    description: 'Implementasi Filament Resource dengan Tab Form A-F dan Bulk Action untuk mendispatch PdfExportJob ke antrean.',
    category: 'Filament Resource',
    code: `<?php

namespace App\\Filament\\Resources;

use App\\Filament\\Resources\\StudentResource\\Pages;
use App\\Jobs\\PdfExportJob;
use App\\Models\\Student;
use Filament\\Forms;
use Filament\\Forms\\Components\\DatePicker;
use Filament\\Forms\\Components\\FileUpload;
use Filament\\Forms\\Components\\Grid;
use Filament\\Forms\\Components\\Radio;
use Filament\\Forms\\Components\\Select;
use Filament\\Forms\\Components\\Tabs;
use Filament\\Forms\\Components\\Textarea;
use Filament\\Forms\\Components\\TextInput;
use Filament\\Forms\\Components\\Toggle;
use Filament\\Forms\\Form;
use Filament\\Notifications\\Notification;
use Filament\\Resources\\Resource;
use Filament\\Tables;
use Filament\\Tables\\Actions\\Action;
use Filament\\Tables\\Actions\\BulkAction;
use Filament\\Tables\\Columns\\ImageColumn;
use Filament\\Tables\\Columns\\TextColumn;
use Filament\\Tables\\Filters\\SelectFilter;
use Filament\\Tables\\Table;
use Illuminate\\Database\\Eloquent\\Collection;

class StudentResource extends Resource
{
    protected static ?string $model = Student::class;
    protected static ?string $navigationIcon = 'heroicon-o-academic-cap';
    protected static ?string $navigationGroup = 'Data Master';
    protected static ?string $modelLabel = 'Buku Induk Siswa';
    protected static ?string $pluralModelLabel = 'Buku Induk Siswa';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Tabs::make('BukuIndukTabs')->tabs([
                // TAB A
                Tabs\\Tab::make('Bagian A: Keterangan Pribadi')
                    ->icon('heroicon-o-user')
                    ->schema([
                        Grid::make(3)->schema([
                            TextInput::make('nis')->label('NIS')->required()->unique(ignoreRecord: true),
                            TextInput::make('nisn')->label('NISN')->length(10)->required()->unique(ignoreRecord: true),
                            FileUpload::make('foto_siswa')->label('Pas Foto 3x4')->image()->directory('students/photos')->avatar(),
                        ]),
                        Grid::make(2)->schema([
                            TextInput::make('nama_lengkap')->required(),
                            TextInput::make('nama_panggilan'),
                        ]),
                        Grid::make(4)->schema([
                            Select::make('jenis_kelamin')->options(['L' => 'Laki-Laki', 'P' => 'Perempuan'])->required(),
                            TextInput::make('tempat_lahir')->required(),
                            DatePicker::make('tanggal_lahir')->required(),
                            Select::make('agama')->options([
                                'Islam' => 'Islam', 'Kristen Protestan' => 'Kristen Protestan',
                                'Katolik' => 'Katolik', 'Hindu' => 'Hindu', 'Buddha' => 'Buddha', 'Khonghucu' => 'Khonghucu'
                            ])->required(),
                        ]),
                        Grid::make(3)->schema([
                            TextInput::make('kewarganegaraan')->default('WNI'),
                            TextInput::make('anak_ke')->numeric()->default(1),
                            TextInput::make('jumlah_saudara_kandung')->numeric()->default(0),
                        ]),
                        Textarea::make('alamat')->required()->rows(2),
                        Grid::make(3)->schema([
                            TextInput::make('kelurahan')->required(),
                            TextInput::make('kecamatan')->required(),
                            TextInput::make('kabupaten_kota')->required(),
                        ]),
                    ]),

                // TAB B
                Tabs\\Tab::make('Bagian B: Jasmani')
                    ->icon('heroicon-o-heart')
                    ->schema([
                        Grid::make(3)->schema([
                            TextInput::make('berat_badan_kg')->numeric()->suffix('kg'),
                            TextInput::make('tinggi_badan_cm')->numeric()->suffix('cm'),
                            Select::make('golongan_darah')->options([
                                'A' => 'A', 'B' => 'B', 'AB' => 'AB', 'O' => 'O', 'Tidak Tahu' => 'Tidak Tahu'
                            ]),
                        ]),
                        Textarea::make('riwayat_penyakit')->rows(2)->placeholder('Penyakit berat yang pernah diderita / dirawat'),
                        Textarea::make('kelainan_jasmani')->rows(2),
                    ]),

                // TAB C
                Tabs\\Tab::make('Bagian C: Pendidikan Sebelumnya')
                    ->icon('heroicon-o-building-library')
                    ->schema([
                        Grid::make(2)->schema([
                            TextInput::make('asal_sekolah_smp')->label('Asal SMP/MTs')->required(),
                            TextInput::make('nomor_ijazah_smp')->label('No. Ijazah SMP'),
                        ]),
                        Grid::make(3)->schema([
                            DatePicker::make('tanggal_diterima')->required(),
                            TextInput::make('diterima_di_kelas')->required()->placeholder('X-MIPA-1'),
                            Select::make('jurusan_peminatan')->options([
                                'MIPA' => 'MIPA', 'IPS' => 'IPS', 'BAHASA' => 'Bahasa'
                            ])->required(),
                        ]),
                        Toggle::make('is_pindahan')->label('Siswa Pindahan?')->reactive(),
                        TextInput::make('asal_sekolah_pindahan')->visible(fn ($get) => $get('is_pindahan')),
                    ]),

                // TAB D
                Tabs\\Tab::make('Bagian D: Orang Tua')
                    ->icon('heroicon-o-users')
                    ->schema([
                        Grid::make(2)->schema([
                            Forms\\Components\\Section::make('Data Ayah Kandung')->schema([
                                TextInput::make('ayah_nama')->label('Nama Ayah'),
                                TextInput::make('ayah_pekerjaan')->label('Pekerjaan'),
                                TextInput::make('ayah_pendidikan_terakhir')->label('Pendidikan Terakhir'),
                                TextInput::make('ayah_penghasilan_bulanan')->label('Penghasilan'),
                                TextInput::make('ayah_nomor_hp')->label('No. HP Ayah'),
                                Toggle::make('ayah_masih_hidup')->default(true),
                            ]),
                            Forms\\Components\\Section::make('Data Ibu Kandung')->schema([
                                TextInput::make('ibu_nama')->label('Nama Ibu'),
                                TextInput::make('ibu_pekerjaan')->label('Pekerjaan'),
                                TextInput::make('ibu_pendidikan_terakhir')->label('Pendidikan Terakhir'),
                                TextInput::make('ibu_penghasilan_bulanan')->label('Penghasilan'),
                                TextInput::make('ibu_nomor_hp')->label('No. HP Ibu'),
                                Toggle::make('ibu_masih_hidup')->default(true),
                            ]),
                        ]),
                    ]),

                // TAB E
                Tabs\\Tab::make('Bagian E: Wali')
                    ->icon('heroicon-o-user-group')
                    ->schema([
                        Toggle::make('ada_wali')->label('Memiliki Wali Siswa')->reactive(),
                        Grid::make(2)->schema([
                            TextInput::make('wali_nama')->label('Nama Wali'),
                            TextInput::make('wali_hubungan_keluarga')->label('Hubungan Keluarga'),
                            TextInput::make('wali_pekerjaan')->label('Pekerjaan Wali'),
                            TextInput::make('wali_nomor_hp')->label('No. HP Wali'),
                            Textarea::make('wali_alamat')->columnSpanFull(),
                        ])->visible(fn ($get) => $get('ada_wali')),
                    ]),

                // TAB F
                Tabs\\Tab::make('Bagian F: Lulus / Pindah')
                    ->icon('heroicon-o-check-badge')
                    ->schema([
                        Select::make('status_siswa')->options([
                            'Aktif' => 'Aktif', 'Lulus' => 'Lulus', 'Pindah' => 'Pindah', 'Keluar' => 'Keluar'
                        ])->required(),
                        Grid::make(3)->schema([
                            TextInput::make('tahun_lulus')->numeric(),
                            TextInput::make('nomor_ijazah_sma')->label('No. Ijazah SMA'),
                            DatePicker::make('tanggal_ijazah_sma'),
                        ]),
                        TextInput::make('melanjutkan_ke')->label('Melanjutkan ke (PTN / Kerja)'),
                        Textarea::make('bakat_dan_prestasi')->label('Bakat & Prestasi Unggulan'),
                        Textarea::make('catatan_guru_bk')->label('Catatan Khusus BP / BK'),
                    ]),
            ])->columnSpanFull(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('nis')->searchable()->sortable(),
                TextColumn::make('nisn')->searchable(),
                TextColumn::make('nama_lengkap')->searchable()->sortable()->weight('bold'),
                TextColumn::make('jenis_kelamin')->badge()->color(fn ($state) => $state === 'L' ? 'info' : 'warning'),
                TextColumn::make('diterima_di_kelas')->label('Kelas')->sortable(),
                TextColumn::make('jurusan_peminatan')->label('Jurusan')->badge(),
                TextColumn::make('status_siswa')->badge()->color(fn ($state) => match($state) {
                    'Aktif' => 'success',
                    'Lulus' => 'primary',
                    'Pindah', 'Keluar' => 'danger',
                    default => 'gray'
                }),
            ])
            ->filters([
                SelectFilter::make('jurusan_peminatan')->options(['MIPA' => 'MIPA', 'IPS' => 'IPS']),
                SelectFilter::make('status_siswa')->options(['Aktif' => 'Aktif', 'Lulus' => 'Lulus', 'Pindah' => 'Pindah']),
            ])
            ->actions([
                Tables\\Actions\\EditAction::make(),
                // Action Cetak Single Siswa
                Action::make('cetak_pdf')
                    ->label('Cetak PDF')
                    ->icon('heroicon-o-printer')
                    ->color('success')
                    ->action(function (Student $record) {
                        PdfExportJob::dispatch(
                            auth()->id(),
                            'single',
                            $record->nis,
                            $record->id
                        );

                        Notification::make()
                            ->title('Job Cetak Dikirim ke Antrean')
                            ->body("Buku Induk {$record->nama_lengkap} sedang diproses di background. Anda akan menerima notifikasi lonceng ketika siap diunduh.")
                            ->info()
                            ->send();
                    }),
            ])
            ->bulkActions([
                Tables\\Actions\\DeleteBulkAction::make(),
                // BULK ACTION CETAK MASSAL TERPILIH
                BulkAction::make('cetak_massal')
                    ->label('Cetak Buku Induk (Massal)')
                    ->icon('heroicon-o-document-arrow-down')
                    ->color('warning')
                    ->requiresConfirmation()
                    ->modalHeading('Cetak Buku Induk Siswa Terpilih')
                    ->modalDescription('Proses ini akan mengirim job ke Laravel Queue untuk merender berkas PDF dan menggabungkannya ke ZIP file.')
                    ->action(function (Collection $records) {
                        // Dispatch batch job untuk siswa terpilih
                        foreach ($records as $student) {
                            PdfExportJob::dispatch(
                                auth()->id(),
                                'single',
                                $student->nis,
                                $student->id
                            );
                        }

                        Notification::make()
                            ->title('Cetak Massal Diterima')
                            ->body(count($records) . ' siswa telah dijadwalkan untuk dicetak di background worker.')
                            ->success()
                            ->send();
                    }),
            ]);
    }
}`,
    explanation: [
      'Menyediakan tab form interaktif Bagian A sampai F di Filament v3 sesuai standar buku induk.',
      'Menyediakan Action per-siswa dan BulkAction untuk mencetak PDF secara massal melalui antrean queue background.',
      'Menggunakan database notification yang langsung muncul di pojok kanan atas Filament.',
    ],
  },
  {
    id: 'filament-attendance-page',
    title: '5. Filament Page: Absensi Harian dengan "Isi Cepat Semua Hadir"',
    filename: 'app/Filament/Pages/DailyAttendancePage.php',
    description: 'Filament Custom Page untuk Absensi Harian (Fase 1) dengan Header Action "Isi Cepat Semua Hadir" dan toggle status H/S/I/A.',
    category: 'Filament Resource',
    code: `<?php

namespace App\\Filament\\Pages;

use App\\Models\\DailyAttendance;
use App\\Models\\Student;
use Filament\\Actions\\Action;
use Filament\\Forms\\Components\\DatePicker;
use Filament\\Forms\\Components\\Select;
use Filament\\Notifications\\Notification;
use Filament\\Pages\\Page;
use Illuminate\\Support\\Facades\\DB;

class DailyAttendancePage extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-calendar-days';
    protected static ?string $navigationGroup = 'Absensi & Akademik';
    protected static ?string $title = 'Absensi Harian Siswa';
    protected static string $view = 'filament.pages.daily-attendance-page';

    public ?string $selectedClass = 'XI-MIPA-1';
    public ?string $selectedDate = null;
    public array $attendanceStates = [];

    public function mount(): void
    {
        $this->selectedDate = now()->format('Y-m-d');
        $this->loadStudents();
    }

    public function updatedSelectedClass(): void
    {
        $this->loadStudents();
    }

    public function updatedSelectedDate(): void
    {
        $this->loadStudents();
    }

    public function loadStudents(): void
    {
        $students = Student::where('diterima_di_kelas', $this->selectedClass)
            ->where('status_siswa', 'Aktif')
            ->orderBy('nama_lengkap')
            ->get();

        $existing = DailyAttendance::where('kelas', $this->selectedClass)
            ->where('tanggal', $this->selectedDate)
            ->get()
            ->keyBy('student_id');

        $this->attendanceStates = [];
        foreach ($students as $student) {
            $this->attendanceStates[$student->id] = [
                'student_id' => $student->id,
                'nama' => $student->nama_lengkap,
                'nisn' => $student->nisn,
                'status' => $existing->has($student->id) ? $existing[$student->id]->status : 'H',
                'keterangan' => $existing->has($student->id) ? $existing[$student->id]->keterangan : '',
            ];
        }
    }

    /**
     * FITUR UTAMA FASE 1: "ISI CEPAT SEMUA HADIR"
     */
    public function quickFillAllPresent(): void
    {
        foreach ($this->attendanceStates as $studentId => $data) {
            $this->attendanceStates[$studentId]['status'] = 'H';
        }

        Notification::make()
            ->title('Semua Siswa Diisi Hadir')
            ->body('Seluruh status kehadiran berhasil diset ke Hadir (H). Klik "Simpan Presensi" untuk mengunci ke database.')
            ->success()
            ->send();
    }

    public function saveAttendance(): void
    {
        DB::transaction(function () {
            foreach ($this->attendanceStates as $studentId => $data) {
                DailyAttendance::updateOrCreate(
                    [
                        'student_id' => $studentId,
                        'tanggal' => $this->selectedDate,
                    ],
                    [
                        'kelas' => $this->selectedClass,
                        'status' => $data['status'],
                        'keterangan' => $data['keterangan'] ?? null,
                        'recorded_by' => auth()->id(),
                    ]
                );
            }
        });

        Notification::make()
            ->title('Presensi Berhasil Disimpan')
            ->body("Presensi kelas {$this->selectedClass} tanggal {$this->selectedDate} telah diperbarui.")
            ->success()
            ->send();
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('quickFill')
                ->label('⚡ Isi Cepat Semua Hadir')
                ->color('success')
                ->action('quickFillAllPresent'),
            Action::make('save')
                ->label('Simpan Presensi')
                ->color('primary')
                ->icon('heroicon-o-check')
                ->action('saveAttendance'),
        ];
    }
}`,
    explanation: [
      'Menampilkan daftar absensi per kelas dan tanggal dengan performa instan Livewire TALL Stack.',
      'Tombol "⚡ Isi Cepat Semua Hadir" di Header Action menghemat waktu guru piket/wali kelas.',
      'Menggunakan `DB::transaction()` dan `updateOrCreate` untuk menjaga konsistensi data saat disimpan ke database.',
    ],
  },
  {
    id: 'spatie-backup-setup',
    title: '6. Panduan Setup Spatie Backup & Integrasi Action di Filament',
    filename: 'app/Filament/Pages/ManageBackups.php',
    description: 'Panduan instalasi spatie/laravel-backup dan Filament Action untuk men-trigger pencadangan database melalui tombol UI.',
    category: 'Backup',
    code: `<?php

/**
 * =========================================================================
 * LANGKAH 1: INSTALASI SPATIE LARAVEL BACKUP VIA TERMINAL
 * =========================================================================
 * composer require spatie/laravel-backup
 * php artisan vendor:publish --provider="Spatie\\Backup\\BackupServiceProvider"
 *
 * Pastikan mysqldump / pg_dump terpasang di server:
 * Ubuntu: sudo apt install mysql-client (atau mariadb-client / postgresql-client)
 *
 * Pada config/backup.php, sesuaikan nama aplikasi dan disk tujuan:
 * 'destination' => [
 *     'disks' => ['local', 'google', 's3'], // Sesuaikan disk
 * ],
 */

namespace App\\Filament\\Pages;

use Filament\\Actions\\Action;
use Filament\\Notifications\\Notification;
use Filament\\Pages\\Page;
use Illuminate\\Support\\Facades\\Artisan;
use Illuminate\\Support\\Facades\\File;
use Illuminate\\Support\\Facades\\Storage;

class ManageBackups extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-server-stack';
    protected static ?string $navigationGroup = 'Sistem & Pengaturan';
    protected static ?string $title = 'Pencadangan Database & Sistem';
    protected static string $view = 'filament.pages.manage-backups';

    public function getBackupFilesProperty(): array
    {
        $backupDisk = config('backup.backup.destination.disks')[0] ?? 'local';
        $appName = config('backup.backup.name', 'Laravel');
        
        $files = Storage::disk($backupDisk)->allFiles($appName);
        
        return collect($files)->map(function ($filePath) use ($backupDisk) {
            return [
                'path' => $filePath,
                'filename' => basename($filePath),
                'size' => round(Storage::disk($backupDisk)->size($filePath) / 1024 / 1024, 2) . ' MB',
                'last_modified' => date('Y-m-d H:i:s', Storage::disk($backupDisk)->lastModified($filePath)),
            ];
        })->sortByDesc('last_modified')->values()->all();
    }

    /**
     * ACTION FILAMENT UNTUK TRIGGER BACKUP DARI TOMBOL UI
     */
    protected function getHeaderActions(): array
    {
        return [
            Action::make('runDatabaseBackup')
                ->label('⚡ Jalankan Backup Database Sekarang')
                ->color('primary')
                ->icon('heroicon-o-circle-stack')
                ->requiresConfirmation()
                ->modalHeading('Konfirmasi Backup Database')
                ->modalDescription('Sistem akan mengeksekusi spatie/laravel-backup untuk mencadangkan database dan mengompresnya ke format .zip.')
                ->action(function () {
                    try {
                        // Jalankan Artisan command spatie
                        Artisan::call('backup:run', [
                            '--only-db' => true,
                            '--disable-notifications' => false,
                        ]);

                        $output = Artisan::output();

                        Notification::make()
                            ->title('Backup Database Berhasil')
                            ->body('Proses pencadangan selesai dieksekusi. Berkas baru telah ditambahkan ke daftar riwayat backup.')
                            ->success()
                            ->send();
                    } catch (\\Throwable $e) {
                        Notification::make()
                            ->title('Backup Gagal Dieksekusi')
                            ->body('Pesan Error: ' . $e->getMessage())
                            ->danger()
                            ->send();
                    }
                }),

            Action::make('runFullBackup')
                ->label('Backup Penuh (DB + File Foto)')
                ->color('warning')
                ->icon('heroicon-o-archive-box')
                ->requiresConfirmation()
                ->action(function () {
                    // Dispatch ke background queue agar tidak timeout pada ukuran file besar
                    dispatch(function () {
                        Artisan::call('backup:run');
                    });

                    Notification::make()
                        ->title('Backup Penuh Dijadwalkan')
                        ->body('Backup menyeluruh sedang berjalan di background worker.')
                        ->info()
                        ->send();
                }),
        ];
    }

    public function downloadBackup(string $path)
    {
        $backupDisk = config('backup.backup.destination.disks')[0] ?? 'local';
        return Storage::disk($backupDisk)->download($path);
    }

    public function deleteBackup(string $path)
    {
        $backupDisk = config('backup.backup.destination.disks')[0] ?? 'local';
        Storage::disk($backupDisk)->delete($path);

        Notification::make()
            ->title('Berkas Backup Dihapus')
            ->warning()
            ->send();
    }
}`,
    explanation: [
      'Panduan lengkap instalasi `spatie/laravel-backup` via Composer dan registrasi Service Provider.',
      'Menyediakan tombol interaktif `Action::make("runDatabaseBackup")` di Filament Header Action yang mengeksekusi `Artisan::call("backup:run")`.',
      'Menampilkan tabel riwayat berkas `.zip` backup dengan tanggal dan ukuran, serta tombol unduh langsung.',
    ],
  },
  {
    id: 'server-optimization',
    title: '7. Server Optimization: Chromium Puppeteer, Supervisor Queue & PHP Tuning',
    filename: 'docs/SERVER_OPTIMIZATION_GUIDE.md',
    description: 'Panduan arsitektur server production Ubuntu/Debian untuk menjalankan Spatie Browsershot, Node.js Puppeteer, Supervisor Worker, dan Nginx.',
    category: 'Server Config',
    code: `# PANDUAN OPTIMALISASI SERVER BUKU INDUK SISWA DIGITAL SMA
# Laravel 11, Filament v3, Spatie Browsershot, PHP 8.3 & Supervisor

---

## 1. Dependensi Headless Chromium / Puppeteer di Ubuntu 22.04 / 24.04 LTS
Spatie Browsershot membutuhkan Google Chrome / Chromium headless serta pustaka sistem grafis Linux.
Jalankan perintah berikut pada server:

\`\`\`bash
# 1. Update paket dan instalasi Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 2. Instalasi dependensi libnss, libatk, alsa untuk Chromium Headless
sudo apt install -y ca-certificates fonts-liberation libasound2 libatk-bridge2.0-0 \\
    libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 \\
    libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 \\
    libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 \\
    libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 \\
    libxss1 libxtst6 lsb-release wget xdg-utils

# 3. Instalasi Puppeteer di root aplikasi Laravel
npm install puppeteer --save
\`\`\`

---

## 2. Konfigurasi Supervisor (Laravel Queue Worker)
Untuk memastikan background job \`PdfExportJob\` berjalan otomatis dan tidak pernah mati:

File: \`/etc/supervisor/conf.d/laravel-worker.conf\`

\`\`\`ini
[program:laravel-buku-induk-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/buku-induk/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600 --timeout=1800
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=4
redirect_stderr=true
stdout_logfile=/var/www/buku-induk/storage/logs/worker.log
stopwaitsecs=1800
\`\`\`

Reload Supervisor:
\`\`\`bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start laravel-buku-induk-worker:*
\`\`\`

---

## 3. Tuning PHP-FPM & php.ini (\`/etc/php/8.3/fpm/php.ini\`)

\`\`\`ini
; Batas memori untuk render batch data
memory_limit = 512M

; Maksimal ukuran upload berkas impor excel dan foto siswa 3x4
upload_max_filesize = 50M
post_max_size = 50M

; Batas eksekusi HTTP request (Queue worker memiliki timeout sendiri di supervisor)
max_execution_time = 120
max_input_time = 120

; Opcache untuk performa Filament v3 Livewire
opcache.enable = 1
opcache.memory_consumption = 256
opcache.max_accelerated_files = 20000
opcache.validate_timestamps = 0
\`\`\`

---

## 4. Cron Job Laravel Scheduler (\`crontab -e\` user www-data)
Untuk menjalankan otomatisasi presensi harian dan backup harian Spatie:

\`\`\`cron
* * * * * cd /var/www/buku-induk && php artisan schedule:run >> /dev/null 2>&1
\`\`\`

Di dalam \`routes/console.php\` (Laravel 11):
\`\`\`php
use Illuminate\\Support\\Facades\\Schedule;

// Backup database setiap jam 02:00 dini hari
Schedule::command('backup:run --only-db')->dailyAt('02:00');

// Bersihkan file backup lama yang melebihi retensi (misal 30 hari)
Schedule::command('backup:clean')->dailyAt('03:00');
\`\`\``,
    explanation: [
      'Menyediakan daftar paket Linux Ubuntu yang dibutuhkan Puppeteer agar Spatie Browsershot tidak error libnss3 / libgbm1.',
      'Konfigurasi Supervisor worker 4 proses dengan timeout 1800 detik dan graceful stop.',
      'Tuning PHP 8.3 Opcache dan memory limit untuk memaksimalkan performa Filament v3.',
      'Integrasi cron scheduler Laravel untuk backup harian otomatis.',
    ],
  },
];
