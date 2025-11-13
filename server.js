const express = require("express");
const path = require("path");
const QRCode = require("qrcode");
const multer = require("multer");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(express.static("public"));

// Create uploads directory if missing
const uploadPath = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, unique);
  }
});
const upload = multer({ storage });

// --- QR from text/URL ---
app.post("/generate", async (req, res) => {
  try {
    const { data } = req.body;
    const qr = await QRCode.toDataURL(data, {
      color: { dark: "#7a00ff", light: "#000014" },
      margin: 2,
      width: 400
    });
    res.json({ qr });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "QR generation failed" });
  }
});

// --- File upload + QR generation ---
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    const qr = await QRCode.toDataURL(fileUrl, {
      color: { dark: "#5a00ff", light: "#000014" },
      margin: 2,
      width: 400
    });
    res.json({ qr, fileUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

app.listen(3000, () => console.log("⚫ Shadow QR ready at http://localhost:3000"));
