import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import cors from 'cors';
import express from 'express';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import pg from 'pg';

const {
  DATABASE_URL,
  ADMIN_PASSWORD,
  JWT_SECRET,
  PORT = 8787,
  UPLOAD_DIR = '/data/uploads',
} = process.env;

if (!DATABASE_URL || !ADMIN_PASSWORD || !JWT_SECRET) {
  console.error('Missing required env vars: DATABASE_URL, ADMIN_PASSWORD, JWT_SECRET');
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: DATABASE_URL });

async function initSchema() {
  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
    CREATE TABLE IF NOT EXISTS articles (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      slug text UNIQUE NOT NULL,
      title text NOT NULL,
      content text NOT NULL,
      cover_image text,
      published_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      deleted_at timestamptz
    );
    CREATE TABLE IF NOT EXISTS scrapbook_entries (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      caption text NOT NULL DEFAULT '',
      images jsonb NOT NULL DEFAULT '[]',
      deleted_at timestamptz
    );
  `);
}

const app = express();
app.set('trust proxy', 1);
app.use(cors());
app.use(express.json({ limit: '5mb' }));

/* ── Auth ── */
function requireAuth(req, res, next) {
  const token = (req.headers.authorization ?? '').replace(/^Bearer /, '');
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

app.post('/api/login', (req, res) => {
  const supplied = Buffer.from(String(req.body?.password ?? ''));
  const expected = Buffer.from(ADMIN_PASSWORD);
  const ok = supplied.length === expected.length && crypto.timingSafeEqual(supplied, expected);
  if (!ok) return res.status(401).json({ error: 'Wrong password' });
  res.json({ token: jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '90d' }) });
});

/* ── Articles ── */
app.get('/api/articles', async (_req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM articles WHERE deleted_at IS NULL ORDER BY published_at DESC',
  );
  res.json(rows);
});

app.get('/api/articles/slug/:slug', async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM articles WHERE slug = $1 AND deleted_at IS NULL',
    [req.params.slug],
  );
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

app.get('/api/articles/:id', async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM articles WHERE id = $1 AND deleted_at IS NULL',
    [req.params.id],
  );
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

app.post('/api/articles', requireAuth, async (req, res) => {
  const { slug, title, content } = req.body;
  const { rows } = await pool.query(
    'INSERT INTO articles (slug, title, content) VALUES ($1, $2, $3) RETURNING *',
    [slug, title, content],
  );
  res.json(rows[0]);
});

app.put('/api/articles/:id', requireAuth, async (req, res) => {
  const { title, content } = req.body;
  const { rows } = await pool.query(
    'UPDATE articles SET title = $1, content = $2, updated_at = now() WHERE id = $3 RETURNING *',
    [title, content, req.params.id],
  );
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

/* ── Scrapbook ── */
app.get('/api/scrapbook', async (req, res) => {
  const offset = Number(req.query.offset ?? 0);
  const limit = Math.min(Number(req.query.limit ?? 10), 50);
  const { rows } = await pool.query(
    'SELECT * FROM scrapbook_entries WHERE deleted_at IS NULL ORDER BY created_at DESC OFFSET $1 LIMIT $2',
    [offset, limit],
  );
  res.json(rows);
});

app.post('/api/scrapbook', requireAuth, async (req, res) => {
  const { caption = '', images = [] } = req.body;
  const { rows } = await pool.query(
    'INSERT INTO scrapbook_entries (caption, images) VALUES ($1, $2) RETURNING *',
    [caption, JSON.stringify(images)],
  );
  res.json(rows[0]);
});

app.put('/api/scrapbook/:id', requireAuth, async (req, res) => {
  const { caption = '', images = [] } = req.body;
  const { rows } = await pool.query(
    'UPDATE scrapbook_entries SET caption = $1, images = $2, updated_at = now() WHERE id = $3 RETURNING *',
    [caption, JSON.stringify(images), req.params.id],
  );
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

app.delete('/api/scrapbook/:id', requireAuth, async (req, res) => {
  await pool.query(
    'UPDATE scrapbook_entries SET deleted_at = now() WHERE id = $1',
    [req.params.id],
  );
  res.json({ ok: true });
});

/* ── Images: upload to the volume, serve statically ── */
const uploadHandler = multer({ storage: multer.memoryStorage(), limits: { fileSize: 30 * 1024 * 1024 } });

app.post('/api/upload', requireAuth, uploadHandler.single('file'), (req, res) => {
  const filename = String(req.body?.filename ?? '');
  if (!req.file || !filename || filename.includes('..') || filename.startsWith('/')) {
    return res.status(400).json({ error: 'Bad upload' });
  }
  const target = path.join(UPLOAD_DIR, filename);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, req.file.buffer);
  const base = `${req.protocol}://${req.get('host')}`;
  res.json({ url: `${base}/images/${filename}` });
});

app.use('/images', express.static(UPLOAD_DIR, { maxAge: '365d', immutable: true }));

app.get('/health', (_req, res) => res.json({ ok: true }));

initSchema()
  .then(() => {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    app.listen(PORT, () => console.log(`API listening on :${PORT}`));
  })
  .catch((err) => {
    console.error('Schema init failed:', err);
    process.exit(1);
  });
