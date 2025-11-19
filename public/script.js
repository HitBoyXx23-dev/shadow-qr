const input = document.getElementById("qrInput");
const fileInput = document.getElementById("fileInput");
const generateBtn = document.getElementById("generateBtn");
const qrCanvas = document.getElementById("qrCanvas");

const scanBtn = document.getElementById("scanBtn");
const scanResult = document.getElementById("scanResult");
const preview = document.getElementById("preview");

let scanning = false;
let html5QrCode;

// ----------------------
// Generate QR
// ----------------------
generateBtn.addEventListener("click", async () => {
  const text = input.value.trim();
  const file = fileInput.files[0];

  if (!text && !file) {
    return alert("Enter text/URL or select a file!");
  }

  let res, result;

  if (file) {
    const formData = new FormData();
    formData.append("file", file);

    res = await fetch("/upload", { method: "POST", body: formData });
    result = await res.json();
    alert("File uploaded! Scan QR to open:\n" + result.fileUrl);

  } else {
    res = await fetch("/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: text })
    });
    result = await res.json();
  }

  drawQR(result.qr);
});

// ----------------------
// Draw QR Helper (with logo)
// ----------------------
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
    logo.src = "logo.png";
    logo.onload = () => {
      const logoSize = img.width * 0.2;
      const x = (img.width - logoSize) / 2;
      const y = (img.height - logoSize) / 2;
      ctx.drawImage(logo, x, y, logoSize, logoSize);
    };
  };
}

// ----------------------
// QR Scanner (FULLY FIXED)
// ----------------------
scanBtn.addEventListener("click", async () => {
  if (!scanning) {
    html5QrCode = new Html5Qrcode("preview");

    try {
      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          disableFlip: false
        },
        (decodedText) => {
          scanResult.textContent = "Result: " + decodedText;

          html5QrCode.stop().then(() => {
            scanning = false;
            scanBtn.textContent = "Start Scan";
          });
        }
      );
    } catch (err) {
      console.error("Scan failed:", err);
      return;
    }

    scanning = true;
    scanBtn.textContent = "Stop Scan";

  } else {
    try {
      await html5QrCode.stop();
    } catch (e) {
      console.warn("Stop error:", e);
    }

    scanning = false;
    scanBtn.textContent = "Start Scan";
  }
});
