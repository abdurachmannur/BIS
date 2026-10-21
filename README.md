# Buku Induk Siswa Digital SMA — Sistem Informasi Akademik & Arsip Resmi Sekolah

Aplikasi **Buku Induk Siswa Digital SMA** adalah sistem manajemen arsip induk siswa, nilai rapor akademik (Semester 1 s/d 6 Kurikulum Merdeka & K-13), presensi harian, manajemen master data sekolah, impor/ekspor massal Excel (`.xlsx`), serta pencetakan dokumen resmi Buku Induk berstandar A4.

Dilengkapi antarmuka modern **Linear & Notion Workspace** secara *default*, **Sidebar Ringkas yang Dapat Dilipat (*Collapsible Sidebar*)**, **Command Palette Cepat (`Ctrl+K` / `⌘K`)**, serta **Multi-UI Theme Switcher (7 Gaya Desain UI)** yang dapat diganti kapan saja.

---

## Daftar Isi

1. [Fitur Utama Aplikasi](#-fitur-utama-aplikasi)
2. [Pilihan Sistem Desain UI (7 Tema Terintegrasi)](#-pilihan-sistem-desain-ui-7-tema-terintegrasi)
3. [Akun Login Default (Demo & Operasional Awal)](#-akun-login-default-demo--operasional-awal)
4. [Prasyarat Sistem](#-prasyarat-sistem)
5. [Panduan Instalasi di Linux (Native, NPM/Bun, PM2, Systemd & Nginx)](#-panduan-instalasi-di-linux-native-npmbun-pm2-systemd--nginx)
6. [Panduan Instalasi menggunakan Docker & Docker Compose](#-panduan-instalasi-menggunakan-docker--docker-compose)
7. [Panduan Instalasi di Windows (Windows 10/11 & Windows Server)](#-panduan-instalasi-di-windows-windows-1011--windows-server)
8. [Panduan Penggunaan & Alur Kerja Operasional Sekolah](#-panduan-penggunaan--alur-kerja-operasional-sekolah)
9. [Format Impor & Ekspor Excel (Siswa 49 Kolom & Nilai Rapor Tanpa Kode)](#-format-impor--ekspor-excel-siswa-49-kolom--nilai-rapor-tanpa-kode)
10. [Pemecahan Masalah Umum (Troubleshooting)](#-pemecahan-masalah-umum-troubleshooting)

---

## Fitur Utama Aplikasi

### 1. Manajemen Buku Induk Siswa Lengkap (Bagian A s/d F + Pas Foto 3x4)
- **Bagian A (Keterangan Pribadi)**: Nama lengkap, nama panggilan, NIS, NISN, jenis kelamin, tempat/tanggal lahir, agama, kewarganegaraan, anak ke-, jumlah saudara (kandung/tiri/angkat), status anak, bahasa sehari-hari, alamat lengkap (RT/RW, Kelurahan, Kecamatan, Kab/Kota, Provinsi, Kode Pos), telepon/HP, tempat tinggal, jarak ke sekolah, dan transportasi.
- **Upload Pas Foto 3x4**: Mendukung unggah foto manual langsung per siswa (`.jpg`, `.png`, `.webp`) maupun sinkronisasi massal via arsip `.zip` berdasarkan nomor NIS/NISN.
- **Bagian B (Keterangan Kesehatan & Fisik)**: Berat badan (kg), tinggi badan (cm), golongan darah, riwayat penyakit kronis, dan kelainan jasmani.
- **Bagian C (Keterangan Pendidikan Sebelumnya)**: Asal SMP/MTs, Nomor & Tanggal Ijazah SMP, Nomor SKHUN, lama belajar, kelas diterima, jurusan/peminatan, tahun ajaran masuk, serta riwayat mutasi masuk/pindahan.
- **Bagian D & E (Keterangan Orang Tua Kandung — Ayah & Ibu)**: Nama, tempat/tanggal lahir, agama, kewarganegaraan, pendidikan terakhir, pekerjaan, penghasilan bulanan, alamat, nomor HP, dan status masih hidup/meninggal.
- **Bagian F (Keterangan Wali & Meninggalkan Sekolah)**: Data wali lengkap beserta hubungan keluarga, serta catatan kelulusan (Nomor Ijazah SMA, tanggal lulus, melanjutkan ke perguruan tinggi) atau mutasi keluar.
- **Aksi Massal (*Bulk Actions*)**: Pilih banyak siswa sekaligus untuk **Bulk Ubah Kelas** (otomatis menyesuaikan Kelas, Jurusan, dan Tahun Ajaran baru) atau **Bulk Hapus Siswa**.

### 2. Manajemen Nilai Akademik & Rapor (Semester 1 s/d 6)
- Mencakup **Nilai Pengetahuan**, **Nilai Keterampilan**, **Predikat Otomatis/Manual (A/B/C/D)**, dan status **Ketuntasan (Tuntas / Belum Tuntas)** berdasarkan KKM masing-masing mata pelajaran.
- **Master Mata Pelajaran Fleksibel**: Kelola daftar mata pelajaran standar sekolah (Kelompok A Umum, Kelompok B Umum, Kelompok C Peminatan MIPA/IPS/Bahasa, dan Lintas Minat) sekaligus mendukung **input nama mata pelajaran bebas** untuk siswa pindahan atau kurikulum khusus.
- **Tombol Edit Langsung**: Setiap baris nilai mata pelajaran dan kegiatan ekstrakurikuler memiliki tombol **Edit** untuk memperbarui nama mapel, KKM, nilai pengetahuan/keterampilan, dan ketuntasan secara instan.
- **Rekap Per Semester**: Nilai Ekstrakurikuler, Rekap Ketidakhadiran (Sakit, Izin, Tanpa Keterangan), Keterangan/Catatan Semester, dan Tanggal Rapor di setiap semester.

### 3. Pencetakan Dokumen Resmi PDF (Standar A4)
- **Header Otomatis di Setiap Halaman**: Menampilkan Nama Siswa, NIS/NISN, Kelas, dan Penomoran Halaman (`Halaman X dari Y`) secara konsisten di setiap lembar cetak.
- **3 Pilihan Tata Letak Tabel Nilai Rapor**:
  1. **2 Semester per Halaman** *(Standar Rapi Tahun ke-1, ke-2, ke-3)*
  2. **1 Semester per Halaman** *(Detail Ukuran Font Besar)*
  3. **6 Semester dalam 1 Halaman** *(Ringkas Komprehensif)*
- **Kustomisasi Pengesahan**: Pengaturan Kop Surat Resmi, Sampul Depan (*Cover*), Watermark Logo Sekolah, serta blok tanda tangan Kepala Sekolah & Wali Kelas.

### 4. Produktivitas Workspace Modern
- **Command Palette (`Ctrl+K` / `⌘K`)**: Pencarian cepat dari papan ketik untuk mencari siswa (Nama/NIS/NISN), melompat langsung ke Nilai Rapor atau Cetak PDF, berpindah menu, dan mengganti tema UI.
- **Collapsible Sidebar**: Sidebar dapat dilipat menjadi bilah ikon `68px` untuk memperluas ruang horizontal tabel data.

---

## Pilihan Sistem Desain UI (7 Tema Terintegrasi)

Anda dapat mengganti gaya antarmuka kapan saja melalui tombol **Pilih Gaya Desain UI** di bilah atas (*Top Bar*) atau melalui menu `Ctrl+K`:

| Kode Tema | Nama Sistem Desain | Karakteristik Utama |
| :--- | :--- | :--- |
| `linear-notion` | **Linear & Notion Workspace** *(Default)* | Kanvas bersih ultra-ringkas, sidebar terang hangat, aksen Indigo presisi |
| `shadcn-slate` | **Shadcn Minimalist Slate** | Monokrom Zinc/Slate tajam bergaya Vercel & Shadcn UI |
| `sapphire-modern` | **Academic Institutional Navy** | Biru Safir Resmi Pendidikan / E-Rapor Kemendikbud Modern |
| `emerald-kedinasan` | **Emerald Kedinasan** | Nuansa Hijau Zamrud resmi instansi pemerintahan |
| `filament-amber` | **Filament Amber Classic** | Tampilan klasik Filament v3 dengan aksen Amber & sidebar gelap |
| `ruby-maroon` | **Ruby Maroon** | Nuansa almamater Merah Marun akademik |
| `obsidian-dark` | **Obsidian Dark Pro** | Mode gelap kontras terukur untuk kenyamanan mata di ruang redup |

---

## Akun Login Default (Demo & Operasional Awal)

Saat pertama kali membuka aplikasi, Anda dapat masuk menggunakan salah satu akun berikut (atau klik tombol **Login Instan 1-Klik** pada halaman masuk):

| Peran Pengguna | Username | Password | Hak Akses Utama |
| :--- | :--- | :--- | :--- |
| **Super Admin (Operator TU)** | `admin_tu` | `password123` | Akses penuh seluruh Master Data, Siswa, Nilai, Impor Excel & Pengaturan |
| **Wali Kelas** | `wali_x_mipa1` | `password123` | Pengelolaan data siswa kelas binaan, nilai rapor, dan presensi |
| **Guru Mata Pelajaran** | `guru_matematika` | `password123` | Input dan pembaruan nilai akademik mata pelajaran |

---

## Prasyarat Sistem

Aplikasi ini dapat dijalankan di hampir semua perangkat komputer maupun server lokal sekolah:

- **Untuk Instalasi Native (Linux / Windows / macOS)**:
  - **Node.js**: Versi `20.x LTS` atau `22.x LTS` (direkomendasikan)
  - **Package Manager**: `npm` (bawaan Node.js) atau `bun`
  - **Git**: Untuk mengunduh dan memperbarui kode dari GitHub
- **Untuk Instalasi Container**:
  - **Docker Engine** `>= 24.0` & **Docker Compose** `v2`

---

## Panduan Instalasi di Linux (Native, NPM/Bun, PM2, Systemd & Nginx)

Panduan ini berlaku untuk **Ubuntu (20.04 / 22.04 / 24.04 LTS)**, **Debian (11 / 12)**, **RHEL / AlmaLinux / Rocky Linux / Fedora**, dan **Arch Linux**.

### Langkah 1: Instalasi Git dan Node.js LTS

#### A. Ubuntu / Debian
```bash
# 1. Perbarui repositori paket dan pasang curl serta git
sudo apt update && sudo apt install -y curl git build-essential

# 2. Pasang Node.js 22 LTS menggunakan repositori resmi NodeSource
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Verifikasi instalasi
node -v
npm -v
```

#### B. RHEL / AlmaLinux / Rocky Linux / Fedora
```bash
sudo dnf install -y curl git
curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -
sudo dnf install -y nodejs
```

#### C. Alternatif Menggunakan NVM (Node Version Manager — Tanpa Root)
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install 22
nvm use 22
```

---

### Langkah 2: Clone Repositori & Instal Dependensi

```bash
# 1. Clone repositori dari GitHub
git clone <URL_REPOSITORY_GITHUB_ANDA> buku-induk-sma
cd buku-induk-sma

# 2. Salin file contoh environment
cp .env.example .env

# 3. Instal seluruh dependensi paket
npm install
```

*(Opsional jika Anda menggunakan **Bun** untuk instalasi super cepat)*:
```bash
curl -fsSL https://bun.sh/install | bash
bun install
```

---

### Langkah 3: Menjalankan Aplikasi (Development vs Production)

#### Opsi 1: Mode Pengembangan (Development)
Cocok untuk pengujian langsung di port `3000`:
```bash
npm run dev
```
Buka browser dan akses: **`http://localhost:3000`** (atau `http://<IP-SERVER-LINUX>:3000`).

#### Opsi 2: Build untuk Produksi (Production)
Mengompilasi aset yang telah dioptimasi ke dalam direktori `dist/`:
```bash
npm run build

# Menjalankan server pratinjau produksi pada port 3000
npx vite preview --port 3000 --host 0.0.0.0
```

---

### Langkah 4: Menjalankan Secara Permanen di Background (PM2 / Systemd)

Agar aplikasi tetap berjalan otomatis meskipun terminal ditutup atau server di-*restart*:

#### Metode A: Menggunakan PM2 (Sangat Direkomendasikan)
```bash
# 1. Instal PM2 dan paket static server 'serve' secara global
sudo npm install -g pm2 serve

# 2. Pastikan aplikasi sudah di-build
npm run build

# 3. Jalankan folder hasil build (dist) pada port 3000 dengan dukungan SPA (-s)
pm2 start "serve -s dist -l 3000" --name "buku-induk-sma"

# 4. Simpan konfigurasi PM2 dan aktifkan auto-start saat server booting
pm2 save
pm2 startup
# (Jalankan perintah 'sudo env PATH=...' yang muncul di layar Anda)
```

Perintah pengelolaan PM2 sehari-hari:
- Cek status aplikasi: `pm2 status`
- Cek log aplikasi: `pm2 logs buku-induk-sma`
- Restart aplikasi: `pm2 restart buku-induk-sma`

#### Metode B: Menggunakan Linux Systemd Service Native
Buat file service di `/etc/systemd/system/buku-induk.service`:
```bash
sudo nano /etc/systemd/system/buku-induk.service
```
Isi dengan konfigurasi berikut (sesuaikan `/var/www/buku-induk-sma` dengan lokasi folder Anda):
```ini
[Unit]
Description=Buku Induk Siswa Digital SMA Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/buku-induk-sma
ExecStart=/usr/bin/npx vite preview --port 3000 --host 127.0.0.1
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```
Aktifkan service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now buku-induk.service
sudo systemctl status buku-induk.service
```

---

### Langkah 5: Konfigurasi Nginx Web Server (Produksi Cepat)

Untuk performa terbaik di Linux, sajikan folder hasil `npm run build` (`dist/`) langsung menggunakan **Nginx**:

```bash
# 1. Instal Nginx
sudo apt install -y nginx

# 2. Salin hasil build ke direktori web server
sudo mkdir -p /var/www/buku-induk-sma
sudo cp -r dist/* /var/www/buku-induk-sma/
sudo chown -R www-data:www-data /var/www/buku-induk-sma

# 3. Salin konfigurasi nginx.conf yang sudah tersedia di repositori
sudo cp nginx.conf /etc/nginx/sites-available/buku-induk-sma
```
Sesuaikan baris `root /usr/share/nginx/html;` pada `/etc/nginx/sites-available/buku-induk-sma` menjadi `root /var/www/buku-induk-sma;`, lalu aktifkan:
```bash
sudo ln -s /etc/nginx/sites-available/buku-induk-sma /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Panduan Instalasi menggunakan Docker & Docker Compose

Repositori ini telah dilengkapi dengan **`Dockerfile`** (*Multi-Stage Build* dengan Node 22 Alpine + Nginx Stable Alpine), **`docker-compose.yml`**, dan **`nginx.conf`**. Anda tidak perlu menginstal Node.js secara manual di host server jika menggunakan Docker.

### Cara 1: Menggunakan Docker Compose (Paling Mudah — 1 Perintah)

```bash
# 1. Masuk ke direktori proyek
git clone <URL_REPOSITORY_GITHUB_ANDA> buku-induk-sma
cd buku-induk-sma

# 2. Build dan jalankan container di background (detached mode)
docker compose up -d --build
```
Aplikasi langsung aktif dan dapat diakses melalui browser di:
- **`http://localhost:3000`** (atau `http://<IP-SERVER-ANDA>:3000`)

#### Perintah Manajemen Docker Compose:
- Melihat status container: `docker compose ps`
- Melihat log akses/error: `docker compose logs -f`
- Menghentikan aplikasi: `docker compose down`
- Memperbarui aplikasi setelah ada perubahan di GitHub:
  ```bash
  git pull origin main
  docker compose up -d --build
  ```

### Cara 2: Menggunakan Docker CLI Murni (Tanpa Docker Compose)

```bash
# 1. Build Docker image
docker build -t buku-induk-sma:latest .

# 2. Jalankan container pada port 3000
docker run -d \
  --name buku-induk-siswa-sma \
  --restart unless-stopped \
  -p 3000:80 \
  buku-induk-sma:latest
```

*(Tips: Jika ingin menjalankan pada port selain `3000`, misalnya port `8080`, cukup ubah `-p 8080:80` pada perintah di atas atau ubah `"8080:80"` di dalam file `docker-compose.yml`).*

---

## Panduan Instalasi di Windows (Windows 10/11 & Windows Server)

Panduan ini ditujukan untuk komputer Tata Usaha (TU), operator sekolah, maupun komputer server lokal sekolah berbasis **Windows 10/11** atau **Windows Server**.

### Langkah 1: Instalasi Git dan Node.js di Windows

Anda dapat memilih **Cara A (Installer Grafis)** atau **Cara B (Winget Terminal)**:

#### Cara A: Menggunakan Installer Resmi (Direkomendasikan untuk Pemula)
1. Unduh dan pasang **Node.js LTS (v20 atau v22)** dari situs resmi: [https://nodejs.org](https://nodejs.org) (pilih tombol **LTS** `.msi`).
2. Unduh dan pasang **Git for Windows** dari: [https://git-scm.com/download/win](https://git-scm.com/download/win).
3. Setelah selesai, tutup dan buka kembali **Command Prompt (CMD)** atau **PowerShell**, lalu pastikan keduanya sudah terpasang:
   ```powershell
   node -v
   npm -v
   git --version
   ```

#### Cara B: Menggunakan Winget (Cepat via PowerShell)
Buka **PowerShell** sebagai Administrator, lalu jalankan:
```powershell
winget install OpenJS.NodeJS.LTS
winget install Git.Git
```

---

### Langkah 2: Mengunduh & Memasang Aplikasi di Windows

Buka **PowerShell** atau **Command Prompt (CMD)**, lalu arahkan ke folder tempat Anda ingin menyimpan aplikasi (misalnya `C:\AplikasiSekolah` atau `D:\`):

```powershell
# 1. Buat dan masuk ke folder kerja
mkdir C:\AplikasiSekolah
cd C:\AplikasiSekolah

# 2. Clone repositori dari GitHub
git clone <URL_REPOSITORY_GITHUB_ANDA> buku-induk-sma
cd buku-induk-sma

# 3. Salin file konfigurasi environment
copy .env.example .env

# 4. Instal seluruh dependensi
npm install
```

---

### Langkah 3: Menjalankan Aplikasi di Windows

#### Mode Harian / Lokal (Development Server)
```powershell
npm run dev
```
Setelah muncul pesan `Local: http://localhost:3000/`, buka browser (Chrome / Edge / Firefox) dan ketik:
**`http://localhost:3000`**

#### Mode Produksi Cepat (Production Build di Windows)
```powershell
npm run build
npx vite preview --port 3000 --host 0.0.0.0
```
- Dengan opsi `--host 0.0.0.0`, komputer guru atau kepala sekolah lain yang berada di jaringan Wi-Fi / LAN sekolah yang sama dapat ikut mengakses aplikasi melalui alamat IP komputer server Windows tersebut (cek IP dengan perintah `ipconfig`, misalnya `http://192.168.1.10:3000`).

---

### Langkah 4: Membuat Pintasan Klik-Ganda (`Jalankan-Buku-Induk.bat`) di Desktop Windows

Agar staf Tata Usaha tidak perlu mengetik perintah di CMD setiap hari:
1. Buat file teks baru di dalam folder `buku-induk-sma` bernama **`Jalankan-Buku-Induk.bat`**.
2. Isi dengan kode berikut:
   ```bat
   @echo off
   title Server Buku Induk Siswa Digital SMA
   cd /d "%~dp0"
   echo Memulai aplikasi Buku Induk Siswa Digital SMA pada http://localhost:3000 ...
   start http://localhost:3000
   npm run dev
   pause
   ```
3. Klik kanan file **`Jalankan-Buku-Induk.bat`** -> **Send to** -> **Desktop (create shortcut)**. Kini operator cukup mengklik dua kali ikon tersebut di Desktop.

---

### Langkah 5: Menggunakan Laragon atau WSL2 di Windows (Opsional)

- **Pengguna Laragon**:
  - Simpan folder `buku-induk-sma` di dalam `C:\laragon\www\buku-induk-sma`.
  - Jalankan `npm install && npm run build` melalui Terminal Laragon.
  - Arahkan Document Root Nginx/Apache Laragon ke folder `C:\laragon\www\buku-induk-sma\dist`.
- **Pengguna Docker Desktop / WSL2 di Windows**:
  - Pastikan **Docker Desktop for Windows** sudah berjalan, lalu buka PowerShell di folder proyek dan jalankan:
    ```powershell
    docker compose up -d --build
    ```

---

## Panduan Penggunaan & Alur Kerja Operasional Sekolah

Untuk ketertiban administrasi sekolah pada awal tahun ajaran, ikuti urutan langkah berikut:

### 1. Pengaturan Identitas & Kop Sekolah
- Buka menu **Pengaturan Sistem -> Profil Sekolah & Tema UI**.
- Lengkapi Nama Sekolah, NPSN, NSS, Akreditasi, Alamat lengkap, Nama & NIP Kepala Sekolah, serta unggah **Logo Resmi Sekolah**.
- Pilih gaya antarmuka favorit Anda (misalnya **Linear & Notion Workspace**, **Shadcn Minimalist Slate**, atau **Academic Institutional Navy**).

### 2. Pengisian Master Data Terstruktur (Tahap 1 s/d 5)
Aplikasi menyediakan alur berurutan di sidebar kiri:
1. **1. Tahun Ajaran**: Tambahkan tahun ajaran (contoh: `2024/2025`, Semester `Ganjil`/`Genap`, `Kurikulum Merdeka`).
2. **2. Data Guru & Wali**: Input daftar Guru beserta NIP. Data ini otomatis muncul pada pilihan Wali Kelas dan Ketua Jurusan.
3. **3. Data Jurusan**: Kelola peminatan (`MIPA`, `IPS`, `BAHASA`, atau `UMUM`).
4. **4. Tingkat Kelas**: Kelola tingkat `X`, `XI`, dan `XII`.
5. **5. Rombel Kelas**: Buat kelas (misal `X-MIPA-1`). Setiap kelas memiliki ID internal unik per Tahun Ajaran sehingga nama kelas yang sama di tahun ajaran berbeda tidak akan bentrok.
   - *Catatan Keamanan Data*: Apabila sebuah Kelas atau Master Data dihapus, data siswa di dalamnya **tidak akan terhapus permanen**, melainkan hanya dikosongkan penempatan kelasnya agar aman.

### 3. Pengelolaan Buku Induk Siswa (Tahap 6)
- Buka menu **6. Buku Induk Siswa (A–F)**.
- **Tambah/Edit Manual**: Klik tombol **Tambah Siswa Baru** atau ikon **Edit** pada baris siswa. Formulir terbagi rapi menjadi Tab **A (Pribadi & Foto 3x4)**, **B (Fisik & Kesehatan)**, **C (Pendidikan SMP)**, **D (Ayah)**, **E (Ibu)**, dan **F (Wali & Kelulusan)**.
- **Bulk Ubah Kelas & Bulk Hapus**: Centang kotak pilihan (*checkbox*) pada beberapa siswa sekaligus untuk memindahkan kelas mereka secara serentak (otomatis memperbarui Kelas, Jurusan, dan Tahun Ajaran) atau menghapus data terpilih.

### 4. Pengelolaan Nilai Akademik & Master Mapel (Tahap 7)
- Buka menu **7. Nilai Rapor Sem 1–6**.
- Klik tombol **Master Mata Pelajaran** untuk mengelola katalog mata pelajaran standar beserta KKM Pengetahuan & Keterampilan.
- Klik tombol **Tambah Mapel** untuk menambahkan nilai mata pelajaran dari daftar Master Mapel maupun mengetik nama mata pelajaran bebas (*custom*).
- Klik ikon **Edit (Pensil)** pada baris mata pelajaran atau ekstrakurikuler mana pun untuk mengedit nama mapel, KKM, nilai, predikat, dan ketuntasan.

### 5. Pencarian Instan dengan Command Palette (`Ctrl+K`)
- Tekan **`Ctrl + K`** (Windows/Linux) atau **`⌘ + K`** (macOS) kapan saja.
- Ketik potongan **Nama Siswa**, **NIS**, **NISN**, atau **Kelas** untuk langsung melompat ke data siswa, nilai rapor, atau pratinjau cetak PDF siswa tersebut.

---

## Format Impor & Ekspor Excel (Siswa 49 Kolom & Nilai Rapor Tanpa Kode)

Klik tombol **Impor Excel** di bilah atas untuk membuka **Pusat Impor Massal Excel & ZIP Foto**:

### A. Impor & Ekspor Data Siswa Lengkap (49 Kolom Bagian A–F)
- Unduh file template **`Template_Impor_Siswa_SMA_Lengkap_A_sd_F.xlsx`**.
- Mencakup seluruh **49 kolom** yang tampil di hasil cetak Buku Induk:
  - Identitas Pribadi, Alamat Lengkap, Tempat Tinggal, Jarak & Transportasi
  - Berat Badan, Tinggi Badan, Golongan Darah, Riwayat Penyakit, Kelainan Jasmani
  - Asal SMP, Nomor & Tanggal Ijazah SMP, Nomor SKHUN, Kelas & Tahun Ajaran Diterima
  - Data Lengkap Ayah, Ibu (termasuk Pekerjaan & Penghasilan), dan Wali (Nama, Hubungan Keluarga, Pekerjaan, Penghasilan)
  - Data Kelulusan / Mutasi Keluar

### B. Impor Nilai Rapor Fleksibel (Mendukung 2 Format Tanpa Kode Singkatan)
Mengingat setiap siswa SMA dapat memiliki mata pelajaran Peminatan atau Lintas Minat yang berbeda, sistem mendukung **dua format template Excel** sekaligus (otomatis terdeteksi saat diunggah):
1. **Format 1 — Baris Dinamis per Mata Pelajaran (Direkomendasikan)**:
   - Setiap baris mewakili satu mata pelajaran menggunakan **Nama Mata Pelajaran Asli** (misal `Matematika (Umum)`, `Fisika`, `Sosiologi`, `Bahasa Jepang`).
   - Siswa hanya perlu memiliki baris sesuai mata pelajaran yang diambilnya.
   - Dilengkapi **Sheet 2 (`EKSKUL_DAN_KEHADIRAN`)** untuk mengimpor nilai ekstrakurikuler dan rekap kehadiran (Sakit/Izin/Alpa) per semester.
2. **Format 2 — Kolom Nama Mapel Asli (Lebar per Kelas)**:
   - Menggunakan nama mata pelajaran asli langsung sebagai judul kolom (`Pengetahuan - Matematika (Umum)`, `Keterampilan - Matematika (Umum)`, dst.).
   - Jika seorang siswa tidak mengambil mata pelajaran tertentu, cukup kosongkan sel kolom tersebut dan sistem akan otomatis melewatinya.

---

## Pemecahan Masalah Umum (Troubleshooting)

1. **Port 3000 sudah digunakan oleh aplikasi lain (`EADDRINUSE`)**
   - Jalankan pada port berbeda, misalnya port `3005`:
     ```bash
     npx vite --port 3005
     ```
2. **Gagal `npm install` karena konflik versi paket di Node.js terbaru**
   - Gunakan flag `--legacy-peer-deps`:
     ```bash
     npm install --legacy-peer-deps
     ```
3. **Hasil cetak PDF terpotong atau warna latar tabel tidak muncul saat `Ctrl+P`**
   - Pada jendela dialog cetak browser (Chrome/Edge):
     - Pastikan **Ukuran Kertas (Paper Size)** diatur ke **A4**.
     - Pastikan opsi **Background graphics (Grafis latar belakang)** dalam keadaan **Dicentang (Aktif)**.
     - Atur **Margin** ke **Default** atau **Minimum**.
4. **Data tidak berubah setelah pembaruan di browser**
   - Anda dapat mencadangkan data terlebih dahulu di menu **Cadangan & Restore Data** (unduh file `.json`), atau menekan tombol **Reset ke Data Awal** jika ingin menyegarkan struktur penyimpanan lokal browser (`localStorage`).
