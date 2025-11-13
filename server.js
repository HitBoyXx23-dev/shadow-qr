const express = require("express");
const path = require("path");
const QRCode = require("qrcode");
const multer = require("multer");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(express.static("public"));

// Storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads/"),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, unique);
  }
});
const upload = multer({ storage });

// --- Generate QR from text or URL ---
app.post("/generate", async (req, res) => {
  try {
    const { data } = req.body;
    const qr = await QRCode.toDataURL(data, {
      color: {
        dark: "#7a00ff",   // purple QR pixels
        light: "#000014"   // dark background
      },
      margin: 2,
      width: 400
    });
    res.json({ qr });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "QR generation failed" });
  }
});

// --- Upload file and generate QR linking to it ---
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    const qr = await QRCode.toDataURL(fileUrl, {
      color: {
        dark: "#5a00ff",
        light: "#000014"
      },
      margin: 2,
      width: 400
    });
    res.json({ qr, fileUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "File upload failed" });
  }
});

app.listen(3000, () => console.log("⚫ Shadow QR v2 running at http://localhost:3000"));
