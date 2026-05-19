const fs = require('fs');
const path = require('path');

const imagePath = path.join(__dirname, 'modelo-safe.png');
const imageBuffer = fs.readFileSync(imagePath);
const base64Image = imageBuffer.toString('base64');

const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Modelo Morena - Preview</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            background: #1a1a1a;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            font-family: Arial, sans-serif;
        }
        h1 {
            color: white;
            margin-bottom: 20px;
        }
        img {
            max-width: 90%;
            max-height: 80vh;
            border: 3px solid #333;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }
        .info {
            color: #999;
            margin-top: 20px;
            text-align: center;
        }
    </style>
</head>
<body>
    <h1>🎨 Nova Modelo Preset - Morena com Lábios Preenchidos</h1>
    <img src="data:image/png;base64,${base64Image}" alt="Modelo">
    <div class="info">
        <p>Tamanho do arquivo: ${(imageBuffer.length / 1024).toFixed(2)} KB</p>
        <p>Se você consegue ver esta imagem, ela está pronta para ser adicionada ao banco!</p>
    </div>
</body>
</html>
`;

const htmlPath = path.join(__dirname, 'preview-modelo.html');
fs.writeFileSync(htmlPath, html);

console.log('✅ HTML criado:', htmlPath);
console.log('🌐 Abrindo no navegador...');

const { exec } = require('child_process');
exec(`start "" "${htmlPath}"`);
