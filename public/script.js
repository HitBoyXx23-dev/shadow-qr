const input = document.getElementById("qrInput");
const generateBtn = document.getElementById("generateBtn");
const qrCanvas = document.getElementById("qrCanvas");
const scanBtn = document.getElementById("scanBtn");
const scanResult = document.getElementById("scanResult");

generateBtn.addEventListener("click", async () => {
  const data = input.value.trim();
  if (!data) return alert("Enter text or URL first!");

  const res = await fetch("/generate", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ data })
  });

  const result = await res.json();
  const ctx = qrCanvas.getContext("2d");
  const img = new Image();
  img.src = result.qr;
  img.onload = () => {
    qrCanvas.width = img.width;
    qrCanvas.height = img.height;
    ctx.drawImage(img, 0, 0);
  };
});

// --- QR Scanner ---
let scanning = false;
let html5QrCode;

scanBtn.addEventListener("click", () => {
  if (!scanning) {
    html5QrCode = new Html5Qrcode("preview");
    html5QrCode.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      (decodedText) => {
        scanResult.textContent = "Result: " + decodedText;
        html5QrCode.stop();
        scanning = false;
      }
    ).catch(err => console.error("Scan failed:", err));
    scanning = true;
    scanBtn.textContent = "Stop Scan";
  } else {
    html5QrCode.stop();
    scanning = false;
    scanBtn.textContent = "Start Scan";
  }
});
