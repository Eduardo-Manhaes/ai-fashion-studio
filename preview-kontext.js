require('dotenv').config();
const fs = require('fs');
const path = require('path');

if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

async function preview() {
  const imageUrl = 'https://v3b.fal.media/files/b/0a9ae071/ajbIxq3Wb5w7ouooLqRp1_7d65c5eefd7d406aaac60dc91a8b496f.jpg';

  console.log('⬇️  Baixando imagem gerada...');
  const res = await fetch(imageUrl);
  const buffer = Buffer.from(await res.arrayBuffer());

  const localPath = path.join(__dirname, 'modelo-kontext-final.jpg');
  fs.writeFileSync(localPath, buffer);

  const sizeKB = (buffer.length / 1024).toFixed(2);
  console.log(`✅ Salva: ${sizeKB} KB`);

  const base64 = buffer.toString('base64');
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Nova Modelo Preset - FLUX Kontext Pro</title>
<style>
body{margin:0;padding:30px;background:#000;display:flex;flex-direction:column;align-items:center;min-height:100vh;font-family:'Segoe UI',Arial}
h1{color:#fff;font-size:26px;margin-bottom:5px}
.subtitle{color:#4CAF50;font-size:14px;margin-bottom:30px}
img{max-width:95%;max-height:85vh;border:4px solid #222;box-shadow:0 10px 40px rgba(255,255,255,0.1);border-radius:8px}
.info{color:#888;margin-top:20px;font-size:14px;text-align:center}
.info strong{color:#fff}
</style>
</head>
<body>
<h1>✨ Modelo Preset Final - img2img FLUX Kontext Pro</h1>
<div class="subtitle">Mantém características faciais + Roupa branca + Fundo branco</div>
<img src="data:image/jpeg;base64,${base64}" alt="Modelo Kontext Final">
<div class="info">
<p><strong>Tamanho:</strong> ${sizeKB} KB | <strong>Método:</strong> img2img | <strong>Modelo:</strong> FLUX Kontext Pro</p>
<p>Características mantidas: lábios preenchidos, cabelo ondulado, sobrancelhas grossas, pele morena</p>
</div>
</body>
</html>`;

  const htmlPath = path.join(__dirname, 'preview-kontext-final.html');
  fs.writeFileSync(htmlPath, html);

  console.log('🌐 Abrindo preview...');
  const { exec } = require('child_process');
  exec(`start "" "${htmlPath}"`);
}

preview().catch(console.error);
