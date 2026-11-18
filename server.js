import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'buku-induk-sma-jwt-secret-key-2025';

// 1. Pastikan direktori ./data tersedia untuk menyimpan file SQLite
const dataDir = path.resolve(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'bis.sqlite');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// 2. Buat tabel users dan app_store jika belum ada
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    nama_lengkap TEXT DEFAULT 'Administrator Buku Induk',
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS app_store (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// 3. Fitur Auto-Seed: Jika tabel users kosong, otomatis buat akun default admin / admin123
const userCountRow = db.prepare('SELECT COUNT(*) as count FROM users').get();
if (!userCountRow || userCountRow.count === 0) {
  const defaultPasswordHash = bcrypt.hashSync('admin123', 10);
  db.prepare(
    `INSERT INTO users (username, password_hash, role, nama_lengkap) VALUES (?, ?, ?, ?)`
  ).run('admin', defaultPasswordHash, 'admin', 'Administrator Utama (Operator TU)');
  console.log('[Auto-Seed] Akun default berhasil dibuat: username="admin" | role="admin"');
}

const app = express();

// Middleware dasar
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Middleware proteksi JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token autentikasi tidak ditemukan. Silakan login kembali.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Sesi atau token JWT tidak valid / telah kedaluwarsa.' });
  }
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    database: './data/bis.sqlite',
    timestamp: new Date().toISOString()
  });
});

// POST /api/login : Validasi username & password, kembalikan JWT token
app.post('/api/login', (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ error: 'Username dan password wajib diisi.' });
    }

    const userRow = db
      .prepare('SELECT id, username, password_hash, role, nama_lengkap FROM users WHERE username = ?')
      .get(String(username).trim());

    if (!userRow) {
      return res.status(401).json({ error: 'Username atau password tidak sesuai.' });
    }

    const isPasswordValid = bcrypt.compareSync(String(password), userRow.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Username atau password tidak sesuai.' });
    }

    const mappedRole = userRow.role === 'admin' ? 'super_admin' : userRow.role;
    const payload = {
      id: String(userRow.id),
      username: userRow.username,
      role: mappedRole,
      dbRole: userRow.role,
      namaLengkap: userRow.nama_lengkap || 'Administrator Buku Induk'
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      token,
      user: {
        id: String(userRow.id),
        username: userRow.username,
        namaLengkap: userRow.nama_lengkap || 'Administrator Buku Induk',
        role: mappedRole
      }
    });
  } catch (error) {
    console.error('Error pada POST /api/login:', error);
    return res.status(500).json({ error: 'Terjadi kesalahan pada server saat memproses login.' });
  }
});

// POST /api/change-password : Ganti password akun yang sedang login (terproteksi JWT)
app.post('/api/change-password', authenticateToken, (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Password saat ini dan password baru wajib diisi.' });
    }

    if (String(newPassword).length < 4) {
      return res.status(400).json({ error: 'Password baru minimal harus terdiri dari 4 karakter.' });
    }

    const username = req.user.username;
    const userRow = db
      .prepare('SELECT id, username, password_hash FROM users WHERE username = ?')
      .get(username);

    if (!userRow) {
      return res.status(404).json({ error: 'Data pengguna tidak ditemukan di database.' });
    }

    const isCurrentValid = bcrypt.compareSync(String(currentPassword), userRow.password_hash);
    if (!isCurrentValid) {
      return res.status(400).json({ error: 'Password lama yang Anda masukkan salah.' });
    }

    const newHash = bcrypt.hashSync(String(newPassword), 10);
    db.prepare(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(newHash, userRow.id);

    return res.json({
      success: true,
      message: 'Password berhasil diperbarui dan disimpan di database SQLite.'
    });
  } catch (error) {
    console.error('Error pada POST /api/change-password:', error);
    return res.status(500).json({ error: 'Gagal mengubah password di server.' });
  }
});

// GET /api/data : Ambil seluruh state data aplikasi dari tabel app_store (terproteksi JWT)
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

    return res.json({
      isEmpty: rows.length === 0,
      lastUpdatedAt,
      data
    });
  } catch (error) {
    console.error('Error pada GET /api/data:', error);
    return res.status(500).json({ error: 'Gagal mengambil data dari database SQLite.' });
  }
});

// POST /api/data : Simpan state data aplikasi (siswa, kelas, nilai, absensi, master data) ke SQLite
const upsertStmt = db.prepare(`
  INSERT INTO app_store (key, value, updated_at)
  VALUES (?, ?, CURRENT_TIMESTAMP)
  ON CONFLICT(key) DO UPDATE SET
    value = excluded.value,
    updated_at = CURRENT_TIMESTAMP
`);

const saveStoreTransaction = db.transaction((entries) => {
  for (const [key, val] of entries) {
    if (val !== undefined) {
      upsertStmt.run(key, JSON.stringify(val));
    }
  }
});

app.post('/api/data', authenticateToken, (req, res) => {
  try {
    const payload = req.body?.data || req.body;
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ error: 'Format payload data tidak valid.' });
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
    return res.status(500).json({ error: 'Gagal menyimpan data ke database SQLite.' });
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
      console.log('[Server] Mode Development aktif menggunakan Vite Middleware.');
    } catch (viteErr) {
      // Fallback jika vite dev tidak tersedia dan dist sudah ada
      if (fs.existsSync(distPath)) {
        app.use(express.static(distPath));
        app.use((req, res, next) => {
          if (req.path.startsWith('/api')) return next();
          res.sendFile(indexHtmlPath);
        });
      } else {
        console.error('Folder dist tidak ditemukan dan Vite gagal dimuat:', viteErr);
      }
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`================================================================`);
    console.log(`Server Buku Induk Siswa Digital SMA berjalan di port ${PORT}`);
    console.log(`Database SQLite Persistent : ${dbPath}`);
    console.log(`URL Akses                  : http://localhost:${PORT}`);
    console.log(`================================================================`);
  });
}

startServer();
