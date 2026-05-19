require('dotenv').config();
const fs = require('fs');
const path = require('path');

if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

async function preview() {
  const imageUrl = 'https://v3b.fal.media/files/b/0a9adf81/EP7x-H6cHBXF0g_KmmfFc_878f932045a54425bfd9a3e6ea333d14.jpg';

  console.log('⬇️  Baixando imagem...');
  const res = await fetch(imageUrl);
  const buffer = Buffer.from(await res.arrayBuffer());

  const pngPath = path.join(__dirname, 'modelo-final.png');
  fs.writeFileSync(pngPath, buffer);

  const sizeKB = (buffer.length / 1024).toFixed(2);
  console.log(`✅ Salva: ${sizeKB} KB`);

  const base64 = buffer.toString('base64');
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Nova Modelo Preset - Morena Lábios Preenchidos</title>
<style>
body{margin:0;padding:30px;background:#000;display:flex;flex-direction:column;align-items:center;min-height:100vh;font-family:'Segoe UI',Arial}
h1{color:#fff;font-size:26px;margin-bottom:10px}
.subtitle{color:#888;font-size:14px;margin-bottom:30px}
img{max-width:95%;max-height:85vh;border:4px solid #222;box-shadow:0 10px 40px rgba(255,255,255,0.1);border-radius:8px}
.checklist{color:#4CAF50;margin-top:30px;text-align:left;max-width:600px;font-size:15px}
.checklist div{margin:8px 0;padding:8px;background:#111;border-radius:4px}
.info{color:#666;margin-top:20px;font-size:13px}
</style>
</head>
<body>
<h1>✨ Modelo Preset - Morena Brasileira com Lábios Preenchidos</h1>
<div class="subtitle">Gerada com FLUX Pro Ultra v1.1 • Fotorrealismo máximo</div>
<img src="data:image/jpeg;base64,${base64}" alt="Modelo Final">
<div class="checklist">
<h3 style="color:#fff;margin-bottom:15px">📋 Critérios de Aprovação:</h3>
<div>✅ Lábios claramente volumosos/preenchidos</div>
<div>✅ Cabelo escuro ondulado com volume</div>
<div>✅ Pele morena caramelo natural</div>
<div>✅ Camiseta branca lisa</div>
<div>✅ Fundo branco puro</div>
<div>✅ Corpo inteiro visível</div>
<div>✅ Aparência fotorrealista (não CGI)</div>
</div>
<div class="info">
<p><strong>Tamanho:</strong> ${sizeKB} KB | <strong>Formato:</strong> JPEG | <strong>Resolução:</strong> 832x1216</p>
</div>
</body>
</html>`;

  const htmlPath = path.join(__dirname, 'preview-final.html');
  fs.writeFileSync(htmlPath, html);

  console.log('🌐 Abrindo preview...');
  const { exec } = require('child_process');
  exec(`start "" "${htmlPath}"`);
}

preview().catch(console.error);
