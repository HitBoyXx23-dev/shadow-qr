const input = document.getElementById("qrInput");
const generateBtn = document.getElementById("generateBtn");
const qrCanvas = document.getElementById("qrCanvas");
const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");

// --- Text / URL QR ---
generateBtn.addEventListener("click", async () => {
  const data = input.value.trim();
  if (!data) return alert("Enter text or URL first!");

  const res = await fetch("/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data })
  });
  const result = await res.json();
  drawQR(result.qr);
});

// --- File Upload QR ---
uploadBtn.addEventListener("click", async () => {
  const file = fileInput.files[0];
  if (!file) return alert("Select a file first!");

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/upload", {
    method: "POST",
    body: formData
  });
  const result = await res.json();
  drawQR(result.qr);
  alert("File uploaded! QR links to:\n" + result.fileUrl);
});

// --- Helper ---
function drawQR(dataUrl) {
  const ctx = qrCanvas.getContext("2d");
  const img = new Image();
  img.src = dataUrl;
  img.onload = () => {
    qrCanvas.width = img.width;
    qrCanvas.height = img.height;
    ctx.drawImage(img, 0, 0);
  };
}
