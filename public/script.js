// --------------------------
// QR Generator (Purple QR)
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

  // Generate purple QR
  QRCode.toDataURL(
    text,
    {
      width: 300,
      margin: 2,
      colorDark: "#9b5de5", // Purple QR
      colorLight: "#0a0a0a" // Dark background
    },
    (err, url) => {
      if (err) return console.error(err);
      drawQR(url);
    }
  );
});

// Draw QR with logo
function drawQR(dataUrl) {
  const ctx = qrCanvas.getContext("2d");
  const img = new Image();
  img.src = dataUrl;

  img.onload = () => {
    qrCanvas.width = 300;
    qrCanvas.height = 300;
    ctx.clearRect(0, 0, qrCanvas.width, qrCanvas.height);

    // Fill dark background
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, qrCanvas.width, qrCanvas.height);

    // Draw QR
    ctx.drawImage(img, 0, 0, qrCanvas.width, qrCanvas.height);

    // Draw logo
    const drawLogo = () => {
      const size = qrCanvas.width * 0.2;
      const x = (qrCanvas.width - size) / 2;
      const y = (qrCanvas.height - size) / 2;
      ctx.drawImage(logo, x, y, size, size);
    };

    if (logo.complete) drawLogo();
    else logo.onload = drawLogo;

    // Enable download
    if (downloadBtn) {
      downloadBtn.href = qrCanvas.toDataURL("image/png");
      downloadBtn.download = "qr.png";
      downloadBtn.style.display = "inline-block";
    }
  };
}

// --------------------------
// QR Scanner with Flip Camera
// --------------------------
const scanBtn = document.getElementById("scanBtn");
const scanResult = document.getElementById("scanResult");
const preview = document.getElementById("preview");

// Flip camera button
const flipBtn = document.createElement("button");
flipBtn.textContent = "Flip Camera";
flipBtn.style.marginTop = "10px";
scanBtn.parentNode.insertBefore(flipBtn, scanBtn.nextSibling);

let scanning = false;
let html5QrCode = null;
let cameras = [];
let currentCameraIndex = 0;

// Start/Stop Scan
scanBtn.addEventListener("click", async () => {
  if (!scanning) {
    try {
      cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) return alert("No camera found.");

      currentCameraIndex = 0;
      startScan(cameras[currentCameraIndex].id);
    } catch (err) {
      console.error(err);
      alert("Camera error. Ensure permission granted and HTTPS used.");
    }
  } else {
    await html5QrCode.stop();
    scanning = false;
    scanBtn.textContent = "Start Scan";
  }
});

// Flip Camera
flipBtn.addEventListener("click", async () => {
  if (!scanning || cameras.length < 2) return;

  await html5QrCode.stop();
  currentCameraIndex = (currentCameraIndex + 1) % cameras.length;
  startScan(cameras[currentCameraIndex].id);
});

// Helper: Start scanning with a camera
async function startScan(cameraId) {
  html5QrCode = new Html5Qrcode("preview");

  try {
    await html5QrCode.start(
      cameraId,
      { fps: 10, qrbox: 250, disableFlip: false },
      (decodedText) => {
        scanResult.innerHTML = `Scanned: <a href="${decodedText}" target="_blank">${decodedText}</a>`;
        if (/^https?:\/\//.test(decodedText)) window.open(decodedText, "_blank");

        html5QrCode.stop();
        scanning = false;
        scanBtn.textContent = "Start Scan";
      }
    );

    scanning = true;
    scanBtn.textContent = "Stop Scan";
  } catch (err) {
    console.error("Failed to start camera:", err);
    alert("Camera failed. Try a different camera or check permissions.");
  }
}
