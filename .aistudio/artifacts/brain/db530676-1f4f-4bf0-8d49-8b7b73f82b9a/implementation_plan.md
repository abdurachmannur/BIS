# Transformasi UI Linear & Notion Workspace + Dokumentasi GitHub & Deployment Multi-Platform

Pembaruan ini menggabungkan dua peningkatan utama:
1. **Transformasi Antarmuka Linear & Notion Workspace** dengan **Sidebar Ringkas (*Collapsible*)**, **Command Palette (`Ctrl+K`)**, dan **Multi-UI Theme Switcher**.
2. **Dokumentasi `README.md` GitHub Lengkap & Konfigurasi Deployment** untuk pemasangan dan penggunaan aplikasi di **Linux (Native, NPM, PM2, Nginx)**, **Docker / Docker Compose**, serta **Windows (Native Node.js, Winget, WSL2)**.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Rencana ini telah diperbarui untuk menyertakan dokumentasi lengkap repositori GitHub dan berkas pendukung *containerization* tanpa mengubah fitur Buku Induk yang sudah berjalan.

- **Confirmed Decision 1 (Gaya Desain Utama)**: Menggunakan **Linear & Notion Workspace** sebagai tampilan *default* — kanvas bersih berfokus pada konten, garis pembatas tipis (`1px hairline border`), tipografi presisi (`Plus Jakarta Sans` & `JetBrains Mono` dengan angka *tabular-nums*), dan kontras warna Indigo/Slate modern.
- **Confirmed Decision 2 (Multi-UI Design System Switcher)**: Menyediakan pemilih sistem desain (*UI Style Switcher*) langsung di bilah atas (*Top Bar*) untuk beralih kapan saja antara:
  1. **Linear & Notion Workspace** *(Default Baru — Ultra-Clean & Compact)*
  2. **Shadcn Minimalist Slate** *(Monokrom Zinc/Slate tajam bergaya Vercel)*
  3. **Academic Institutional Navy** *(Biru Resmi Pendidikan / Kemendikbud Modern)*
  4. **Emerald Kedinasan** *(Hijau Resmi Instansi)*
  5. **Filament v3 Classic** *(Gaya Amber klasik)*
  6. **Obsidian Dark Pro** *(Mode gelap kontras terukur)*
- **Confirmed Decision 3 (Navigasi & Produktivitas)**: Menggunakan **Collapsible Ultra-Compact Sidebar** (dapat dilipat ke mode ikon `64px`) ditambah **Command Palette (`Ctrl+K`)** untuk mencari siswa (Nama/NIS/NISN) atau berpindah menu secara instan.
- **Confirmed Decision 4 (Dokumentasi GitHub & Dukungan Multi-Platform)**: Menyusun dokumentasi `README.md` berbahasa Indonesia yang komprehensif untuk repositori GitHub, disertai konfigurasi siap pakai (`Dockerfile`, `docker-compose.yml`, dan konfigurasi produksi) agar aplikasi dapat langsung dijalankan di Linux, Docker, maupun Windows.

---

## 1. Overview & Core Concept

- **What It Does**:
  - Menyegarkan antarmuka aplikasi menjadi ruang kerja modern ala Linear/Notion dengan fitur pencarian instan `Ctrl+K` dan *Theme Switcher*.
  - Menyediakan panduan instalasi, *deployment*, dan manual penggunaan lengkap di `README.md` sehingga tim IT sekolah atau pengembang dapat memasang aplikasi di server lokal sekolah (Linux/Windows) maupun server *cloud* berbasis Docker.
- **Target Audience / Persona**:
  - **Operator TU, Wali Kelas & Kepala Sekolah**: Pengguna harian aplikasi Buku Induk Siswa.
  - **Teknisi / Admin Server Sekolah**: Pihak yang melakukan *clone* dari GitHub dan men-*deploy* aplikasi di server Linux, Docker, atau PC Windows sekolah.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Navigasi Sidebar Ringkas & Mode Lipat (*Collapsible*)**:
   - Tombol pelipat sidebar menyusutkan menu dari lebar `248px` menjadi `64px` (hanya ikon dengan *tooltip* instan), memberikan ruang ekstra lebar untuk tabel Data Siswa dan Nilai Rapor.
2. **Pencarian Cepat & Lompat Modul via Command Palette (`Ctrl+K` / `⌘K`)**:
   - Menekan `Ctrl+K` membuka jendela pencarian terpusat untuk mencari siswa berdasarkan Nama/NIS/NISN, berpindah ke modul mana pun, atau memicu aksi cepat (*Impor Excel*, *Tambah Siswa*, *Cetak PDF*).
3. **Pergantian Gaya UI Instan (*UI Style Switcher*)**:
   - Pemilih gaya UI di bilah atas mengubah skema warna permukaan, aksen, dan nuansa sidebar secara *real-time* dan menyimpannya di *browser*.

### Visual Identity & Theme
- **Aesthetic Direction**: *Linear / Notion Productivity Workspace* — bersih, tenang, dan berfokus pada keterbacaan data tabel.
- **Color Palette & Mood (60-30-10 Rule)**:
  - **60% Dominant Neutral Canvas**: Putih bersih (`#FAFAFA` / `#FFFFFF`) pada kanvas kerja utama.
  - **30% Structural Surfaces**: Abu-abu sejuk lembut (`#F4F4F5` / `#F8FAFC`) dengan pembatas `1px solid #E4E4E7`.
  - **10% Accent Budget**: Indigo Elektrik (`#4F46E5` / `#5E6AD2`) untuk elemen aktif dan tombol utama.
- **Typography & Hierarchy**:
  - *Display & UI Navigation*: `Plus Jakarta Sans` (SemiBold 600 & Medium 500).
  - *Numeric & Tabular Data*: `JetBrains Mono` / `tabular-nums` untuk seluruh kolom NIS, NISN, KKM, dan nilai akademik.

---

## 3. Struktur Dokumentasi GitHub (`README.md`) & Paket Deployment

Dokumentasi yang akan disusun mencakup bagian-bagian berikut secara terstruktur:

1. **Gambaran Umum & Fitur Utama Aplikasi**:
   - Penjelasan arsitektur aplikasi Buku Induk Siswa Digital SMA (Manajemen Siswa Bagian A–F, Pas Foto 3x4, Nilai Akademik Semester 1–6 Kurikulum Merdeka/K13, Master Mata Pelajaran, Presensi & Mutasi, Impor/Ekspor Excel, dan Cetak PDF Massal).
   - Daftar Akun Demo Default (Admin TU, Kepala Sekolah, Wali Kelas) beserta kredensialnya.
2. **Panduan Instalasi di Linux (Native / Bare-Metal)**:
   - Persiapan prasyarat di Ubuntu/Debian, CentOS/RHEL/AlmaLinux, dan Arch Linux (`curl`, `git`, `nodejs` v20/v22 LTS via NodeSource atau NVM, `npm` / `bun`).
   - Langkah *clone* repositori, instalasi dependensi (`npm install`), mode pengembangan (`npm run dev`), dan kompilasi produksi (`npm run build` & `npm run preview`).
   - Menjalankan aplikasi di latar belakang menggunakan **PM2** (`pm2 start`, `pm2 startup`, `pm2 save`) atau **Systemd Service** (`/etc/systemd/system/buku-induk.service`).
   - Konfigurasi **Nginx Reverse Proxy** siap pakai untuk menyajikan *build* statis (`dist/`) dengan dukungan *routing* SPA dan SSL/HTTPS.
3. **Panduan Instalasi via Docker & Docker Compose (Linux / macOS / Windows)**:
   - Penyediaan konfigurasi *Multi-Stage Build* (`Node.js Alpine` untuk *build* + `Nginx Alpine` ringan untuk *serving* pada port 80/3000).
   - Perintah cepat satu baris: `docker compose up -d --build` serta perintah *build* manual (`docker build -t buku-induk-sma .` dan `docker run`).
   - Cara memperbarui versi aplikasi dari GitHub (`git pull && docker compose up -d --build`).
4. **Panduan Instalasi di Windows (Windows 10 / 11 & Windows Server)**:
   - Instalasi Git & Node.js LTS menggunakan **Installer Resmi (.msi)**, **Winget** (`winget install OpenJS.NodeJS.LTS`), atau **Laragon / XAMPP**.
   - Langkah menjalankan aplikasi melalui **PowerShell / Command Prompt (CMD)**.
   - Cara membuat pintasan (*shortcut*) klik-ganda atau menjalankan aplikasi secara otomatis saat Windows menyala menggunakan PM2-Windows / NSSM.
   - Opsi menjalankan di dalam **WSL2 (Windows Subsystem for Linux)** bagi pengguna Docker Desktop di Windows.
5. **Panduan Penggunaan Operasional Sekolah (User Manual Singkat)**:
   - Alur kerja awal tahun ajaran: Pengaturan Profil Sekolah -> Master Data (Tahun Ajaran, Jurusan, Tingkat, Kelas, Guru, Mata Pelajaran).
   - Alur Impor & Ekspor Excel Siswa (49 Kolom Bagian A–F) serta Impor Nilai Rapor (Format Baris Dinamis & Format Kolom Nama Mapel Asli).
   - Alur Pencetakan PDF Buku Induk (Pengaturan tata letak nilai 1/2/6 semester per halaman, header otomatis tiap halaman, dan tanda tangan Kepala Sekolah).

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        WORKSPACE SHELL (Linear / Notion)                   │
│                                                                            │
│  ┌──────────────┐  ┌────────────────────────────────────────────────────┐  │
│  │ Collapsible  │  │ Minimal Top Bar: Breadcrumb · [Ctrl+K] · UI Theme  │  │
│  │   Sidebar    │  ├────────────────────────────────────────────────────┤  │
│  │ (248px/64px) │  │                                                    │  │
│  │              │  │               ACTIVE WORKSPACE VIEW                │  │
│  │ • Ringkasan  │  │  • Dashboard Analitik Sekolah                      │  │
│  │ • Data Siswa │  │  • Data Buku Induk (Bagian A-F + Foto + Bulk Aksi) │  │
│  │ • Nilai Rapor│  │  • Nilai Akademik (Sem 1-6 + Master Mapel + Edit)  │  │
│  │ • Presensi   │  │  • Presensi, Mutasi & Catatan Wali Kelas           │  │
│  │ • Master Data│  │  • Master Data, Profil Sekolah & Pratinjau Cetak   │  │
│  │ • Cetak PDF  │  │                                                    │  │
│  └──────────────┘  └────────────────────────────────────────────────────┘  │
└───────────────────────────────────────┬────────────────────────────────────┘
                                        │
        ┌───────────────────────────────┼───────────────────────────────┐
        ▼                               ▼                               ▼
┌──────────────────────┐  ┌──────────────────────────┐  ┌────────────────────┐
│ COMMAND PALETTE      │  │ MULTI-UI THEME ENGINE    │  │ DEPLOYMENT SUITE   │
│ • Cari Siswa (Ctrl+K)│  │ • linear-notion (Default)│  │ • README.md Lengkap│
│ • Lompat Modul Cepat │  │ • shadcn-slate           │  │ • Dockerfile       │
│ • Trigger Impor/Cetak│  │ • academic-navy          │  │ • docker-compose   │
│ • Navigasi Keyboard  │  │ • emerald / filament     │  │ • Linux/Win Guide  │
└──────────────────────┘  └──────────────────────────┘  └────────────────────┘
```

### Data Model & State
- **Sidebar & Workspace State**:
  - `isSidebarCollapsed` (`boolean`, disimpan di `localStorage`): Mengatur mode lebar penuh atau mode ikon ringkas.
  - `uiTheme` (`string`, disimpan di `localStorage`, *default* `'linear-notion'`): Mengatur sistem desain aktif di seluruh aplikasi.
  - `isCommandPaletteOpen` (`boolean`): Mengatur modal pencarian cepat `Ctrl+K` / `⌘K`.
- **Deployment & Containerization Strategy**:
  - Menyertakan konfigurasi *container* ringan berbasis *multi-stage build* sehingga pengguna yang mengunduh dari GitHub dapat langsung menjalankan `docker compose up -d` tanpa perlu mengonfigurasi server web dari nol.
