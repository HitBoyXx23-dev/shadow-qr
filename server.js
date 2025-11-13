const express = require("express");
const path = require("path");
const app = express();
const QRCode = require("qrcode");

app.use(express.json());
app.use(express.static("public"));

app.post("/generate", async (req, res) => {
  try {
    const { data } = req.body;
    const qr = await QRCode.toDataURL(data);
    res.json({ qr });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate QR code" });
  }
});

app.listen(3000, () => console.log("⚫ Shadow QR running at http://localhost:3000"));
