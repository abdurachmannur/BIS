# Rencana Implementasi: Kelengkapan Penuh Impor/Ekspor Excel Siswa (Bagian A–F), Upload Foto Manual Siswa, Tombol Edit & Master Mata Pelajaran, serta Impor Nilai Fleksibel Tanpa Kode

Pembaruan ini menyempurnakan keselarasan data antara **Formulir Input Manual Siswa**, **Template Impor/Ekspor Excel (`.xlsx`)**, **Menu Input & Edit Nilai**, dan **Hasil Cetak Buku Induk PDF** agar seluruh atribut yang tampil di hasil cetak tersedia lengkap, mudah diedit, dan tidak lagi membingungkan akibat penggunaan kode singkatan mata pelajaran.

### User Review & Critical Decisions

> [!IMPORTANT]
> **Keputusan Terkonfirmasi Pengguna (Phase 1):**
> - **Kelengkapan 100% Data Siswa pada Impor/Ekspor Excel & Input Manual (Bagian A s/d F)**:
>   - Menambahkan seluruh kolom yang tampil di lembar cetak ke dalam **Template Impor Excel Siswa**, **Ekspor Excel Siswa**, dan **Form Input/Edit Manual Siswa**:
>     - **Bagian A (Pribadi)**: `NIS`, `NISN`, `Nama Lengkap`, `Nama Panggilan`, `Jenis Kelamin`, `Tempat Lahir`, `Tanggal Lahir`, `Agama`, `Kewarganegaraan`, `Anak Ke`, `Jumlah Saudara Kandung`, `Bahasa Sehari-hari`, `Alamat`, `Kelurahan`, `Kecamatan`, `Kota/Kabupaten`, `Tinggal Bersama`, `No. HP Siswa/Ortu`, serta **Upload Pas Foto Siswa 3x4** langsung di form manual.
>     - **Bagian B (Jasmani)**: `Berat Badan (kg)`, `Tinggi Badan (cm)`, `Golongan Darah`, `Riwayat Penyakit`.
>     - **Bagian C (Pendidikan Sebelumnya)**: `Asal Sekolah SMP`, `Nomor Ijazah SMP`, `Diterima di Kelas`, `Jurusan Peminatan`, `Tahun Ajaran Masuk`, `Tanggal Diterima`.
>     - **Bagian D (Orang Tua Kandung)**: `Nama Ayah`, `Tempat & Tanggal Lahir Ayah`, `Pendidikan Ayah`, `Pekerjaan Ayah`, `Penghasilan Ayah`, `No. HP Ayah`, serta `Nama Ibu`, `Tempat & Tanggal Lahir Ibu`, `Pendidikan Ibu`, `Pekerjaan Ibu`, `Penghasilan Ibu`, `No. HP Ibu`.
>     - **Bagian E (Wali Siswa)**: `Ada Wali (Ya/Tidak)`, `Nama Wali`, `Hubungan Keluarga`, `Pekerjaan Wali`, `Penghasilan Wali`, `No. HP Wali`.
>     - **Bagian F (Kelulusan / Meninggalkan Sekolah)**: `Status Siswa`, `Nomor Ijazah SMA`, `Melanjutkan Ke Perguruan Tinggi`.
> - **Master Mata Pelajaran Fleksibel + Tombol Edit Mapel & Nilai**:
>   - Menyediakan **Pengelola Master Mata Pelajaran** (dapat diakses langsung di menu Nilai maupun Master Data) berisi daftar Nama Mata Pelajaran, Kelompok (`Wajib A`, `Wajib B`, `Peminatan`, `Lintas Minat`), dan KKM Default, ditambah opsi **Input Bebas** saat menambah mapel baru pada siswa tertentu.
>   - Menambahkan **Tombol Edit (`Edit`)** yang jelas pada setiap baris **Mata Pelajaran** dan setiap baris **Ekstrakurikuler** di halaman Input Nilai untuk membuka modal edit lengkap (mengubah nama mapel, memilih dari Master Mapel, mengubah kelompok, KKM Pengetahuan & Keterampilan, Nilai, Predikat, serta Ketentuan Tuntas/Belum Tuntas).
> - **Impor Excel Nilai Mendukung 2 Format Tanpa Kode Singkatan**:
>   - **Format 1 — Baris Dinamis per Mapel (Direkomendasikan untuk Mapel Berbeda tiap Siswa)**: Setiap baris berisi `NIS`, `Nama Siswa`, `Semester`, `Tahun Ajaran`, `Kelas`, `Nama Mata Pelajaran` (nama asli seperti *FISIKA*, *EKONOMI*, *BAHASA SUNDA*), `Kelompok` (*Umum / Peminatan / Lintas Minat*), `KKM Pengetahuan`, `Nilai Pengetahuan`, `KKM Keterampilan`, `Nilai Keterampilan`, `Ketentuan`. Dilengkapi sheet/kolom untuk Ekstrakurikuler dan Kehadiran.
>   - **Format 2 — Kolom Melebar dengan Nama Mapel Asli**: Menggunakan header nama mata pelajaran yang jelas (misal `Pengetahuan - Pendidikan Agama`, `Keterampilan - Pendidikan Agama`, dst.) dan otomatis mendeteksi kolom mata pelajaran tambahan yang dibuat pengguna di Excel.

---

### 1. Overview & Core Concept

- **What It Does**: Menghilangkan seluruh kesenjangan data antara Excel, Form Input Manual, dan Lembar Cetak Buku Induk, serta menghadirkan manajemen mata pelajaran dan impor nilai yang fleksibel untuk mengakomodasi perbedaan mata pelajaran (Peminatan & Lintas Minat) antar siswa.
- **Target Audience / Persona**: Operator Dapodik, Staf Tata Usaha (TU), dan Wali Kelas SMA.
- **Key Value**: Operator dapat mengimpor seluruh data Buku Induk (Bagian A–F) dalam sekali unggah Excel, mengunggah pas foto langsung saat tambah/edit siswa manual, mengedit mata pelajaran/nilai lewat tombol Edit yang jelas, dan mengimpor nilai tanpa perlu menghafal kode singkatan mata pelajaran.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Input & Edit Manual Siswa Lengkap + Upload Pas Foto (Bagian A–F)**:
     - Pada **Tab A (Pribadi)** di modal Tambah/Edit Siswa, tersedia kotak **Upload Pas Foto Siswa (3x4)** dengan pratinjau langsung (mendukung unggah file gambar `.jpg/.png/.webp` dari perangkat maupun input URL), serta input lengkap (`Anak Ke`, `Jumlah Saudara`, `Bahasa Sehari-hari`, `Tinggal Bersama`).
     - Pada **Tab D (Orang Tua)** & **Tab E (Wali)**, seluruh field yang tampil di hasil cetak (`Tempat Lahir`, `Tanggal Lahir`, `Pendidikan Terakhir`, `Pekerjaan`, `Penghasilan`, `Hubungan Keluarga Wali`) tersedia lengkap.
  2. **Impor & Ekspor Excel Siswa Selengkap Hasil Cetak (38 Kolom Bagian A–F)**:
     - Saat mengunduh **Template Impor Siswa (`.xlsx`)** atau menekan **Ekspor Excel Siswa**, file Excel memuat 38 kolom terstruktur dari Bagian A hingga Bagian F.
     - Saat file Excel diunggah kembali, parser otomatis membaca ke-38 kolom tersebut (termasuk Berat/Tinggi Badan, Golongan Darah, Riwayat Penyakit, No. Ijazah SMP, TTL/Pendidikan/Pekerjaan/Penghasilan Ayah & Ibu, serta Nama/Hubungan/Pekerjaan Wali) sehingga langsung muncul lengkap di lembar cetak.
  3. **Master Mata Pelajaran + Tombol Edit Mapel & Ekstrakurikuler di Menu Nilai**:
     - Di halaman **Input & Rekapitulasi Nilai Akademik**, terdapat tombol **Kelola Master Mata Pelajaran** untuk menambah/mengedit/menghapus daftar mata pelajaran standar sekolah (beserta kelompok & KKM).
     - Saat menambah atau mengedit mapel pada siswa, pengguna dapat **memilih dari Dropdown Master Mata Pelajaran** atau **mengetik Nama Mapel Bebas**.
     - Setiap baris tabel Mata Pelajaran dan Ekstrakurikuler memiliki tombol **Edit (ikon pensil)** di samping tombol **Hapus**, yang membuka modal Edit untuk mengubah Nama Mapel, Kelompok (`Wajib A/B`, `Peminatan`, `Lintas Minat`), KKM, Nilai, Predikat, dan Ketentuan.
  4. **Impor Excel Nilai Ganda (Format Baris Dinamis & Format Kolom Nama Mapel Asli)**:
     - Pada tab **Impor Nilai** di Pusat Impor Excel, pengguna dapat memilih atau mengunduh 2 jenis template:
       - **Template Format Baris Dinamis (Fleksibel per Siswa)**: Sangat cocok bila tiap siswa mengambil mata pelajaran Lintas Minat atau Peminatan yang berbeda.
       - **Template Format Kolom Nama Mapel Asli**: Menggunakan nama mata pelajaran lengkap (bukan kode `P_PAIBP`), dan otomatis mengenali kolom mata pelajaran apa pun yang ditambahkan di sebelah kanan.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Mendukung Dual-Parser (Deteksi Otomatis Format Baris vs Format Kolom) pada Impor Excel Nilai**
  - *Chosen Approach*: Mesin pembaca Excel memeriksa baris header. Jika terdapat kolom `Nama_Mata_Pelajaran` / `Mata_Pelajaran`, sistem memproses sebagai **Format Baris Dinamis** (mengelompokkan baris berdasarkan `NIS` + `Semester`). Jika header berisi daftar mata pelajaran menyamping, sistem memproses sebagai **Format Kolom Nama Mapel Asli** secara dinamis.
  - *Why*: Memberikan kebebasan penuh bagi sekolah—baik yang terbiasa dengan tabel rekap menyamping per kelas maupun tabel baris per mata pelajaran untuk siswa dengan lintas minat berbeda.
- **Decision 2: Penyimpanan Pas Foto Unggahan Manual sebagai Data URL Terkompresi Ringan**
  - *Chosen Approach*: Saat pengguna memilih file foto di form Tambah/Edit Siswa, foto langsung dikonversi dan disimpan ke `personal.fotoUrl` sehingga tampil seketika di tabel siswa, modal detail, dan lembar cetak PDF.
  - *Why*: Bekerja instan tanpa ketergantungan server eksternal dan tetap tersimpan di penyimpanan lokal aplikasi.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:
```
┌──────────────────────────────────────────────────────────────────────────────┐
│                         STATE UTAMA & MASTER DATA                            │
│  · students (StudentFullRecord[]) — Bagian A s/d F lengkap                   │
│  · masterSubjects (MasterSubjectRecord[]) — Nama Mapel, Kelompok, KKM        │
└──────────────────┬─────────────────────────────┬─────────────────────────────┘
                   │                             │
                   ▼                             ▼
┌─────────────────────────────────────┐ ┌──────────────────────────────────────┐
│  MENU DATA SISWA & FORM MANUAL      │ │  MENU INPUT NILAI & MASTER MAPEL     │
│  · Upload Pas Foto 3x4 (File/URL)   │ │  · Modal Kelola Master Mapel         │
│  · Form Lengkap Bagian A - F        │ │  · Dropdown Master Mapel + Input     │
│  · Ekspor/Impor Excel 38 Kolom:     │ │    Bebas saat Tambah/Edit Mapel      │
│    ├─ Jasmani (BB, TB, Gol. Darah,  │ │  · Tombol Edit (Modal Edit Mapel) &  │
│    │  Riwayat Penyakit)             │ │    Tombol Edit Ekstrakurikuler       │
│    ├─ SMP (Asal, No. Ijazah, Tgl)   │ └──────────────────┬───────────────────┘
│    ├─ Ortu (TTL, Pendidikan, Kerja, │                    │
│    │  Penghasilan, HP Ayah & Ibu)   │                    ▼
│    └─ Wali (Nama, Hubungan, Kerja)  │ ┌──────────────────────────────────────┐
└─────────────────────────────────────┘ │  PUSAT IMPOR EXCEL NILAI TANPA KODE  │
                                        │  · Mode 1: Format Baris Dinamis      │
                                        │    (Tiap siswa bebas beda mapel)     │
                                        │  · Mode 2: Format Kolom Nama Mapel   │
                                        │    Asli (Deteksi header otomatis)    │
                                        └──────────────────────────────────────┘
```

- **Data Model Enhancements (`src/types/buku-induk.ts`)**:
  - Menambahkan interface `MasterSubjectRecord`:
    - `id: string`
    - `namaMapel: string` (contoh: `'Pendidikan Agama dan Budi Pekerti'`, `'Fisika'`, `'Ekonomi'`)
    - `kelompok: 'A' | 'B' | 'C' | 'Lintas Minat'`
    - `kkmDefault: number`
    - `kkmKeterampilanDefault: number`

- **Complete 38-Column Student Excel Schema (`Template_Impor_Siswa_SMA_Lengkap.xlsx`)**:
  1. `NIS`, 2. `NISN`, 3. `Nama_Lengkap`, 4. `Nama_Panggilan`, 5. `Jenis_Kelamin`, 6. `Tempat_Lahir`, 7. `Tanggal_Lahir`, 8. `Agama`, 9. `Kewarganegaraan`, 10. `Anak_Ke`, 11. `Jumlah_Saudara_Kandung`, 12. `Bahasa_Sehari_Hari`, 13. `Alamat`, 14. `Kelurahan`, 15. `Kecamatan`, 16. `Kota_Kabupaten`, 17. `Tinggal_Bersama`, 18. `No_HP_Siswa`,
  19. `Berat_Badan_Kg`, 20. `Tinggi_Badan_Cm`, 21. `Golongan_Darah`, 22. `Riwayat_Penyakit`,
  23. `Asal_SMP`, 24. `No_Ijazah_SMP`, 25. `Diterima_Di_Kelas`, 26. `Jurusan_Peminatan`, 27. `Tahun_Ajaran_Masuk`, 28. `Tanggal_Diterima`,
  29. `Nama_Ayah`, 30. `TTL_Ayah`, 31. `Pendidikan_Ayah`, 32. `Pekerjaan_Ayah`, 33. `Penghasilan_Ayah`, 34. `No_HP_Ayah`,
  35. `Nama_Ibu`, 36. `TTL_Ibu`, 37. `Pendidikan_Ibu`, 38. `Pekerjaan_Ibu`, 39. `Penghasilan_Ibu`, 40. `No_HP_Ibu`,
  41. `Nama_Wali`, 42. `Hubungan_Keluarga_Wali`, 43. `Pekerjaan_Wali`, 44. `Penghasilan_Wali`,
  45. `Status_Siswa`, 46. `No_Ijazah_SMA`, 47. `Melanjutkan_Ke`.
