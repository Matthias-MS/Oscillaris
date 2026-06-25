const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// Self-ping keepalive for Render free tier
const SELF_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
setInterval(() => {
  fetch(`${SELF_URL}/ping`).catch(() => {});
}, 14 * 60 * 1000);

// Storage for uploaded images
const IMAGES_DIR = path.join(__dirname, 'public', 'images');
if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, IMAGES_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + '-' + Math.round(Math.random() * 1e6) + ext;
    cb(null, name);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|mp4|mov/;
    cb(null, allowed.test(file.mimetype));
  }
});

// Content file — edit this to update site content
const CONTENT_FILE = path.join(__dirname, 'content.json');
function getContent() {
  if (!fs.existsSync(CONTENT_FILE)) return defaultContent();
  try { return JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf8')); }
  catch { return defaultContent(); }
}
function defaultContent() {
  return {
    title: 'Oscillaris',
    subtitle: 'Hydroszilla / Oscillaria',
    tagline: 'Sensorisch-Resonante Stehleuchte',
    description: 'Ein flüssiger Transduktor — Wasser wandelt mechanische und akustische Energie in sichtbare Oberflächenmodulationen um. RGBWW-LEDs reflektieren die Muster an die Raumdecke.',
    year: '2025',
    location: 'Wien',
    materials: 'Zement · Keramik · Eisen · Glas · Arduino · RGBWW · PAM8610',
    images: [],
    showWaves: true
  };
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views', 'index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'views', 'admin.html')));
app.get('/ping', (req, res) => res.send('ok'));

// API — get content
app.get('/api/content', (req, res) => {
  const content = getContent();
  // enrich with actual image files
  const files = fs.readdirSync(IMAGES_DIR)
    .filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
    .map(f => ({ filename: f, url: `/images/${f}` }));
  content.images = files;
  res.json(content);
});

// API — update content
app.post('/api/content', (req, res) => {
  const current = getContent();
  const updated = { ...current, ...req.body };
  delete updated.images; // images managed separately
  fs.writeFileSync(CONTENT_FILE, JSON.stringify(updated, null, 2));
  res.json({ ok: true });
});

// API — upload image
app.post('/api/upload', upload.array('images', 20), (req, res) => {
  const files = (req.files || []).map(f => ({ filename: f.filename, url: `/images/${f.filename}` }));
  res.json({ ok: true, files });
});

// API — delete image
app.delete('/api/image/:filename', (req, res) => {
  const file = path.join(IMAGES_DIR, path.basename(req.params.filename));
  if (fs.existsSync(file)) fs.unlinkSync(file);
  res.json({ ok: true });
});

app.listen(PORT, () => console.log(`Oscillaris running on port ${PORT}`));
