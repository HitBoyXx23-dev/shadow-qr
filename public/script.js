// --------------------------
// QR Generator (Purple QR + Logo)
// --------------------------
const qrInput = document.getElementById("qrInput");
const fileInput = document.getElementById("fileInput");
const generateBtn = document.getElementById("generateBtn");
const qrCanvas = document.getElementById("qrCanvas");
const downloadBtn = document.getElementById("downloadBtn");

// Preload logo
const logo = new Image();
logo.src = "logo.png";

generateBtn.addEventListener("click", async () => {
  let text = qrInput.value.trim();
  const file = fileInput.files[0];

  if (!text && !file) return alert("Enter text or select a file/video!");

  // Handle file/video uploads
  if (file) {
    const allowedTypes = ["image", "video"];
    if (!allowedTypes.some(type => file.type.startsWith(type))) {
      return alert("Only images and videos are allowed!");
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/upload", { method: "POST", body: formData });
      const result = await res.json();
      text = result.fileUrl;
      alert(`File uploaded! QR will link to: ${text}`);
    } catch (err) {
      return alert("File upload failed!");
    }
  }

  // Generate QR directly on canvas (purple)
  QRCode.toCanvas(qrCanvas, text, {
    width: 300,
    margin: 2,
    color: {
      dark: "#9b5de5",  // Purple QR
      light: "#0a0a0a"  // Dark background
    }
  }, function (err) {
    if (err) return console.error(err);

    // Draw logo on top
    const ctx = qrCanvas.getContext("2d");
    const size = qrCanvas.width * 0.2;
    const x = (qrCanvas.width - size) / 2;
    const y = (qrCanvas.height - size) / 2;

    if (logo.complete) ctx.drawImage(logo, x, y, size, size);
    else logo.onload = () => ctx.drawImage(logo, x, y, size, size);

    // Enable download
    if (downloadBtn) {
      downloadBtn.href = qrCanvas.toDataURL("image/png");
      downloadBtn.download = "qr.png";
      downloadBtn.style.display = "inline-block";
    }
  });
});
