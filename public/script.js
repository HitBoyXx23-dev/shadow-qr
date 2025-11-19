const qrInput = document.getElementById("qrInput");
const fileInput = document.getElementById("fileInput");
const generateBtn = document.getElementById("generateBtn");
const qrCanvas = document.getElementById("qrCanvas");

const scanBtn = document.getElementById("scanBtn");
const scanResult = document.getElementById("scanResult");
const preview = document.getElementById("preview");

let scanning = false;
let html5QrCode = null;

// --------------------------
// Generate QR
// --------------------------
generateBtn.addEventListener("click", async () => {
  let text = qrInput.value.trim();
  const file = fileInput.files[0];

  if (!text && !file) return alert("Enter text or select a file!");

  if (file) {
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

  // Generate colored QR (purple)
  QRCode.toDataURL(
    text,
    {
      width: 300,
      margin: 2,
      colorDark: "#9b59b6",  // Purple
      colorLight: "#0a0a0a"  // Dark background
    },
    (err, url) => {
      if (err) return console.error(err);
      drawQR(url);
    }
  );
});

// --------------------------
// Draw QR with logo
// --------------------------
function drawQR(dataUrl) {
  const ctx = qrCanvas.getContext("2d");
  const img = new Image();
  img.src = dataUrl;

  img.onload = () => {
    qrCanvas.width = img.width;
    qrCanvas.height = img.height;
    ctx.clearRect(0, 0, qrCanvas.width, qrCanvas.height);
    ctx.drawImage(img, 0, 0);

    // Overlay logo
    const logo = new Image();
    logo.src = "logo.png"; // replace with your logo path
    logo.onload = () => {
      const size = img.width * 0.2;
      const x = (img.width - size) / 2;
      const y = (img.height - size) / 2;
      ctx.drawImage(logo, x, y, size, size);
    };
  };
}

// --------------------------
// QR Scanner
// --------------------------
scanBtn.addEventListener("click", async () => {
  if (!scanning) {
    try {
      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) return alert("No camera found.");

      const cameraId = cameras[0].id;
      html5QrCode = new Html5Qrcode("preview");

      await html5QrCode.start(
        cameraId,
        { fps: 10, qrbox: 250, disableFlip: false },
        (decodedText) => {
          // Show scanned text as clickable link
          scanResult.innerHTML = `Scanned: <a href="${decodedText}" target="_blank">${decodedText}</a>`;

          // Automatically open if URL
          if (/^https?:\/\//.test(decodedText)) {
            window.open(decodedText, "_blank");
          }

          html5QrCode.stop();
          scanning = false;
          scanBtn.textContent = "Start Scan";
        }
      );

      scanning = true;
      scanBtn.textContent = "Stop Scan";

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
