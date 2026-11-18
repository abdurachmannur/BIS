import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'buku-induk-sma-jwt-secret-key-2025';
const APP_VERSION = 'v1.0.0-beta.1';
const GITHUB_REPO_URL = 'https://github.com/abdurachmannur/BIS';

// 1. Pastikan direktori ./data tersedia untuk menyimpan file SQLite
const dataDir = path.resolve(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'bis.sqlite');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// 2. Buat tabel users, settings, dan app_store jika belum ada
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    nama_lengkap TEXT DEFAULT 'Administrator',
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS app_store (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// 3. Auto-Seed Akun Default (admin / admin123) HANYA jika tabel users masih kosong
const userCountRow = db.prepare('SELECT COUNT(*) as count FROM users').get();
if (!userCountRow || userCountRow.count === 0) {
  const defaultPasswordHash = bcrypt.hashSync('admin123', 10);
  db.prepare(
    `INSERT INTO users (username, password_hash, role, nama_lengkap) VALUES (?, ?, ?, ?)`
  ).run('admin', defaultPasswordHash, 'admin', 'Administrator');
}

// 4. Auto-Seed Profil Sekolah Default HANYA jika tabel settings belum memiliki school_profile
const defaultSchoolProfile = {
  namaSekolah: 'SMA NEGERI 1 NUSANTARA',
  npsn: '20219001',
  nss: '301020101001',
  akreditasi: 'A (Unggul)',
  alamat: 'Jl. Pendidikan Raya No. 45',
  kelurahan: 'Menteng',
  kecamatan: 'Menteng',
  kabupatenKota: 'Jakarta Pusat',
  provinsi: 'DKI Jakarta',
  kodePos: '10310',
  nomorTelepon: '(021) 31900123',
  email: 'info@sman1nusantara.sch.id',
  website: 'https://sman1nusantara.sch.id',
  namaKepalaSekolah: 'Dr. H. Hendra Wijaya, M.Pd.',
  nipKepalaSekolah: '19720514 199802 1 001',
  logoUrl: ''
};

const existingProfileRow = db.prepare('SELECT value FROM settings WHERE key = ?').get('school_profile');
if (!existingProfileRow) {
  // Cek apakah sudah ada di app_store dari versi sebelumnya
  const legacyStoreProfile = db.prepare('SELECT value FROM app_store WHERE key = ?').get('schoolProfile');
  const initialProfileJson = legacyStoreProfile ? legacyStoreProfile.value : JSON.stringify(defaultSchoolProfile);
  db.prepare(
    'INSERT INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)'
  ).run('school_profile', initialProfileJson);
}

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Middleware proteksi JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Sesi autentikasi tidak ditemukan. Silakan masuk kembali.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (_err) {
    return res.status(401).json({ error: 'Sesi telah berakhir. Silakan masuk kembali.' });
  }
}

// ============================================================================
// PUBLIC ENDPOINTS
// ============================================================================

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    version: APP_VERSION,
    timestamp: new Date().toISOString()
  });
});

// GET /api/public/school-profile : Endpoint publik untuk Halaman Login & Kop Rapor PDF
app.get('/api/public/school-profile', (_req, res) => {
  try {
    const settingRow = db.prepare('SELECT value FROM settings WHERE key = ?').get('school_profile');
    if (settingRow && settingRow.value) {
      return res.json(JSON.parse(settingRow.value));
    }

    const storeRow = db.prepare('SELECT value FROM app_store WHERE key = ?').get('schoolProfile');
    if (storeRow && storeRow.value) {
      return res.json(JSON.parse(storeRow.value));
    }

    return res.json(defaultSchoolProfile);
  } catch (error) {
    console.error('Error pada GET /api/public/school-profile:', error);
    return res.json(defaultSchoolProfile);
  }
});

// ============================================================================
// AUTHENTICATION ENDPOINTS
// ============================================================================

function handleLoginRequest(req, res) {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ error: 'Username dan password wajib diisi.' });
    }

    const userRow = db
      .prepare('SELECT id, username, password_hash, role, nama_lengkap FROM users WHERE username = ?')
      .get(String(username).trim());

    if (!userRow) {
      return res.status(401).json({ error: 'Username atau password tidak valid.' });
    }

    const isPasswordValid = bcrypt.compareSync(String(password), userRow.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Username atau password tidak valid.' });
    }

    const mappedRole = userRow.role === 'admin' ? 'super_admin' : userRow.role;
    const payload = {
      id: String(userRow.id),
      username: userRow.username,
      role: mappedRole,
      dbRole: userRow.role,
      namaLengkap: userRow.nama_lengkap || 'Administrator'
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      token,
      user: {
        id: String(userRow.id),
        username: userRow.username,
        namaLengkap: userRow.nama_lengkap || 'Administrator',
        role: mappedRole
      }
    });
  } catch (error) {
    console.error('Error pada login:', error);
    return res.status(500).json({ error: 'Terjadi kesalahan pada server saat memproses login.' });
  }
}

app.post('/api/login', handleLoginRequest);
app.post('/api/auth/login', handleLoginRequest);

function handleChangePasswordRequest(req, res) {
  try {
    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Password lama dan password baru wajib diisi.' });
    }

    if (String(newPassword).length < 4) {
      return res.status(400).json({ error: 'Password baru minimal terdiri dari 4 karakter.' });
    }

    const username = req.user.username;
    const userRow = db
      .prepare('SELECT id, username, password_hash FROM users WHERE username = ?')
      .get(username);

    if (!userRow) {
      return res.status(404).json({ error: 'Akun pengguna tidak ditemukan.' });
    }

    const isCurrentValid = bcrypt.compareSync(String(currentPassword), userRow.password_hash);
    if (!isCurrentValid) {
      return res.status(400).json({ error: 'Password lama yang dimasukkan tidak sesuai.' });
    }

    const newHash = bcrypt.hashSync(String(newPassword), 10);
    db.prepare(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(newHash, userRow.id);

    return res.json({
      success: true,
      message: 'Password akun berhasil diperbarui.'
    });
  } catch (error) {
    console.error('Error pada change-password:', error);
    return res.status(500).json({ error: 'Gagal memperbarui password.' });
  }
}

app.post('/api/auth/change-password', authenticateToken, handleChangePasswordRequest);
app.post('/api/change-password', authenticateToken, handleChangePasswordRequest);

// ============================================================================
// SETTINGS & SYSTEM UPDATE ENDPOINTS
// ============================================================================

app.put('/api/settings/school-profile', authenticateToken, (req, res) => {
  try {
    const profile = req.body;
    if (!profile || typeof profile !== 'object') {
      return res.status(400).json({ error: 'Data profil sekolah tidak valid.' });
    }

    const jsonStr = JSON.stringify(profile);
    db.prepare(`
      INSERT INTO settings (key, value, updated_at)
      VALUES ('school_profile', ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
    `).run(jsonStr);

    db.prepare(`
      INSERT INTO app_store (key, value, updated_at)
      VALUES ('schoolProfile', ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
    `).run(jsonStr);

    return res.json({
      success: true,
      schoolProfile: profile
    });
  } catch (error) {
    console.error('Error pada PUT /api/settings/school-profile:', error);
    return res.status(500).json({ error: 'Gagal menyimpan profil sekolah.' });
  }
});

// POST /api/system/update : Tarik pembaruan dari GitHub, install, build, dan restart
app.post('/api/system/update', authenticateToken, (_req, res) => {
  const updateCmd = 'git pull origin main && npm install && npm run build';
  const startedAt = new Date().toISOString();

  exec(
    updateCmd,
    { cwd: __dirname, maxBuffer: 1024 * 1024 * 10 },
    (error, stdout, stderr) => {
      const combinedLog = [
        `[${startedAt}] Menjalankan pembaruan dari ${GITHUB_REPO_URL}`,
        `$ ${updateCmd}`,
        '--------------------------------------------------------------------------------',
        stdout ? stdout.trim() : '',
        stderr ? stderr.trim() : ''
      ]
        .filter(Boolean)
        .join('\n');

      if (error) {
        return res.status(200).json({
          success: false,
          version: APP_VERSION,
          repository: GITHUB_REPO_URL,
          stdout: stdout || '',
          stderr: stderr || error.message,
          output: `${combinedLog}\n--------------------------------------------------------------------------------\n[STATUS] Pembaruan gagal: ${error.message}`
        });
      }

      res.status(200).json({
        success: true,
        version: APP_VERSION,
        repository: GITHUB_REPO_URL,
        stdout: stdout || '',
        stderr: stderr || '',
        output: `${combinedLog}\n--------------------------------------------------------------------------------\n[STATUS] Pembaruan berhasil! Memulai ulang layanan dalam 3 detik...`
      });

      // Jadwalkan restart otomatis 3 detik setelah berhasil agar Docker menyalakan ulang container
      setTimeout(() => {
        process.exit(0);
      }, 3000);
    }
  );
});

// ============================================================================
// APPLICATION DATA ENDPOINTS (GET & POST /api/data)
// ============================================================================

app.get('/api/data', authenticateToken, (_req, res) => {
  try {
    const rows = db.prepare('SELECT key, value, updated_at FROM app_store').all();
    const data = {};
    let lastUpdatedAt = null;

    for (const row of rows) {
      try {
        data[row.key] = JSON.parse(row.value);
        if (!lastUpdatedAt || row.updated_at > lastUpdatedAt) {
          lastUpdatedAt = row.updated_at;
        }
      } catch (parseErr) {
        console.error(`Gagal mem-parsing JSON untuk key="${row.key}":`, parseErr);
      }
    }

    // Pastikan schoolProfile selalu sinkron dengan tabel settings
    const settingRow = db.prepare('SELECT value FROM settings WHERE key = ?').get('school_profile');
    if (settingRow && settingRow.value) {
      try {
        data.schoolProfile = JSON.parse(settingRow.value);
      } catch (_e) {
        // ignore
      }
    }

    return res.json({
      isEmpty: rows.length === 0,
      lastUpdatedAt,
      data
    });
  } catch (error) {
    console.error('Error pada GET /api/data:', error);
    return res.status(500).json({ error: 'Gagal mengambil data aplikasi.' });
  }
});

const upsertStoreStmt = db.prepare(`
  INSERT INTO app_store (key, value, updated_at)
  VALUES (?, ?, CURRENT_TIMESTAMP)
  ON CONFLICT(key) DO UPDATE SET
    value = excluded.value,
    updated_at = CURRENT_TIMESTAMP
`);

const upsertSettingsStmt = db.prepare(`
  INSERT INTO settings (key, value, updated_at)
  VALUES (?, ?, CURRENT_TIMESTAMP)
  ON CONFLICT(key) DO UPDATE SET
    value = excluded.value,
    updated_at = CURRENT_TIMESTAMP
`);

const saveStoreTransaction = db.transaction((entries) => {
  for (const [key, val] of entries) {
    if (val !== undefined) {
      const jsonStr = JSON.stringify(val);
      upsertStoreStmt.run(key, jsonStr);
      if (key === 'schoolProfile') {
        upsertSettingsStmt.run('school_profile', jsonStr);
      }
    }
  }
});

app.post('/api/data', authenticateToken, (req, res) => {
  try {
    const payload = req.body?.data || req.body;
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ error: 'Format data tidak valid.' });
    }

    const allowedKeys = [
      'students',
      'attendanceRecords',
      'schoolProfile',
      'academicYears',
      'teachers',
      'departments',
      'gradeLevels',
      'schoolClasses',
      'masterSubjects'
    ];

    const entriesToSave = [];
    for (const key of allowedKeys) {
      if (Object.prototype.hasOwnProperty.call(payload, key)) {
        entriesToSave.push([key, payload[key]]);
      }
    }

    saveStoreTransaction(entriesToSave);

    return res.json({
      success: true,
      savedKeys: entriesToSave.map(([k]) => k),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error pada POST /api/data:', error);
    return res.status(500).json({ error: 'Gagal menyimpan data aplikasi.' });
  }
});

// ============================================================================
// BACKUP & RESTORE DATABASE (.sqlite & .json) ENDPOINTS
// ============================================================================

app.get('/api/backup/sqlite', authenticateToken, async (_req, res) => {
  const tempBackupPath = path.join(dataDir, `bis_backup_${Date.now()}.sqlite`);
  try {
    await db.backup(tempBackupPath);
    const fileBuffer = fs.readFileSync(tempBackupPath);
    const dateStr = new Date().toISOString().slice(0, 10);

    res.setHeader('Content-Type', 'application/x-sqlite3');
    res.setHeader('Content-Disposition', `attachment; filename="bis_backup_${dateStr}.sqlite"`);
    res.setHeader('Content-Length', String(fileBuffer.length));
    res.send(fileBuffer);
  } catch (error) {
    console.error('Error pada GET /api/backup/sqlite:', error);
    res.status(500).json({ error: 'Gagal membuat cadangan file database SQLite.' });
  } finally {
    if (fs.existsSync(tempBackupPath)) {
      try {
        fs.unlinkSync(tempBackupPath);
      } catch (_e) {
        // ignore cleanup error
      }
    }
  }
});

app.post('/api/restore/sqlite', authenticateToken, (req, res) => {
  const tempRestorePath = path.join(dataDir, `bis_restore_${Date.now()}.sqlite`);
  let uploadedDb = null;

  try {
    const { sqliteBase64 } = req.body || {};
    if (!sqliteBase64 || typeof sqliteBase64 !== 'string') {
      return res.status(400).json({ error: 'File SQLite tidak ditemukan dalam permintaan.' });
    }

    const base64Clean = sqliteBase64.includes(',')
      ? sqliteBase64.split(',')[1]
      : sqliteBase64;
    const buffer = Buffer.from(base64Clean, 'base64');

    // Validasi header magic string SQLite ("SQLite format 3\0")
    if (buffer.length < 100 || buffer.subarray(0, 15).toString('utf8') !== 'SQLite format 3') {
      return res.status(400).json({
        error: 'File yang diunggah bukan file database SQLite (.sqlite / .db) yang valid.'
      });
    }

    fs.writeFileSync(tempRestorePath, buffer);
    uploadedDb = new Database(tempRestorePath, { readonly: true });

    // Baca isi tabel app_store dan settings dari file SQLite yang diunggah
    const tables = uploadedDb
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all()
      .map((t) => t.name);

    if (!tables.includes('app_store') && !tables.includes('settings')) {
      return res.status(400).json({
        error: 'Struktur tabel BIS (app_store / settings) tidak ditemukan pada file SQLite ini.'
      });
    }

    const uploadedStoreRows = tables.includes('app_store')
      ? uploadedDb.prepare('SELECT key, value, updated_at FROM app_store').all()
      : [];
    const uploadedSettingRows = tables.includes('settings')
      ? uploadedDb.prepare('SELECT key, value, updated_at FROM settings').all()
      : [];

    const restoreTx = db.transaction(() => {
      db.prepare('DELETE FROM app_store').run();
      for (const row of uploadedStoreRows) {
        db.prepare(
          'INSERT INTO app_store (key, value, updated_at) VALUES (?, ?, COALESCE(?, CURRENT_TIMESTAMP))'
        ).run(row.key, row.value, row.updated_at || null);
      }

      for (const sRow of uploadedSettingRows) {
        db.prepare(`
          INSERT INTO settings (key, value, updated_at)
          VALUES (?, ?, COALESCE(?, CURRENT_TIMESTAMP))
          ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
        `).run(sRow.key, sRow.value, sRow.updated_at || null);
      }
    });

    restoreTx();

    // Ambil seluruh state terbaru setelah restore untuk dikirim balik ke frontend
    const currentRows = db.prepare('SELECT key, value FROM app_store').all();
    const restoredData = {};
    for (const row of currentRows) {
      try {
        restoredData[row.key] = JSON.parse(row.value);
      } catch (_e) {
        // ignore
      }
    }

    const settingProfile = db.prepare('SELECT value FROM settings WHERE key = ?').get('school_profile');
    if (settingProfile && settingProfile.value) {
      try {
        restoredData.schoolProfile = JSON.parse(settingProfile.value);
      } catch (_e) {
        // ignore
      }
    }

    return res.json({
      success: true,
      message: 'Database SQLite berhasil dipulihkan.',
      restoredKeysCount: currentRows.length,
      data: restoredData
    });
  } catch (error) {
    console.error('Error pada POST /api/restore/sqlite:', error);
    return res.status(500).json({
      error: 'Gagal memulihkan file SQLite. Pastikan file cadangan tidak rusak.'
    });
  } finally {
    if (uploadedDb) {
      try {
        uploadedDb.close();
      } catch (_e) {
        // ignore
      }
    }
    if (fs.existsSync(tempRestorePath)) {
      try {
        fs.unlinkSync(tempRestorePath);
      } catch (_e) {
        // ignore
      }
    }
  }
});

// ============================================================================
// PENYAJIAN FRONTEND (Static 'dist' untuk Produksi / Vite Middleware untuk Dev)
// ============================================================================
async function startServer() {
  const distPath = path.resolve(__dirname, 'dist');
  const indexHtmlPath = path.join(distPath, 'index.html');
  const isProd = process.env.NODE_ENV === 'production' || (fs.existsSync(indexHtmlPath) && !process.env.VITE_DEV_SERVER);

  if (isProd && fs.existsSync(indexHtmlPath)) {
    app.use(express.static(distPath));

    app.use((req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(indexHtmlPath);
    });
  } else {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa'
      });
      app.use(vite.middlewares);
    } catch (viteErr) {
      if (fs.existsSync(distPath)) {
        app.use(express.static(distPath));
        app.use((req, res, next) => {
          if (req.path.startsWith('/api')) return next();
          res.sendFile(indexHtmlPath);
        });
      } else {
        console.error('Gagal memuat frontend:', viteErr);
      }
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BIS ${APP_VERSION} aktif pada port ${PORT}`);
  });
}

startServer();
