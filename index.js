require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5011;
const UPLOAD_ROOT = process.env.UPLOAD_ROOT;
const BASE_URL = process.env.BASE_URL;

// ✅ Configure Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const now = new Date();
    const folder = `${String(now.getMonth() + 1).padStart(2, '0')}_${now.getFullYear()}`;
    const uploadPath = path.join(UPLOAD_ROOT, folder);

    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-z0-9.\-_]/gi, '_').toLowerCase();
    cb(null, `${timestamp}_${safeName}`);
  }
});

const upload = multer({ storage });

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const folder = path.basename(path.dirname(req.file.path));
  const filename = req.file.filename;

  const fileUrl = `${BASE_URL}/email-templates/${folder}/${filename}`;
  res.json({ success: true, url: fileUrl });
});

app.listen(PORT, () => {
  console.log(`✅ Upload server running at ${BASE_URL}/upload`);
});
