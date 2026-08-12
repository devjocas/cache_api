const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Fundo
ctx.fillStyle = "#f0f0f0";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Sol
ctx.beginPath();
ctx.arc(320, 60, 30, 0, Math.PI * 2);
ctx.fillStyle = "yellow";
ctx.fill();

// Casa
ctx.fillStyle = "#8B4513";
ctx.fillRect(100, 150, 150, 100);

// Telhado
ctx.beginPath();
ctx.moveTo(90, 150);
ctx.lineTo(175, 100);
ctx.lineTo(260, 150);
ctx.closePath();
ctx.fillStyle = "#A52A2A";
ctx.fill();

// Texto
ctx.font = "20px Arial";
ctx.fillStyle = "#333";
ctx.fillText("Cena com Canvas", 100, 270);