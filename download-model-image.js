require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Bypass SSL em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function downloadImage() {
  const fileName = 'preset-models/morena-lips-1779218194226.png';

  console.log('⬇️  Baixando imagem do Supabase Storage...\n');

  const { data, error } = await supabase.storage
    .from('generations')
    .download(fileName);

  if (error) {
    console.error('❌ Erro:', error);
    return;
  }

  // Converte Blob para Buffer
  const buffer = Buffer.from(await data.arrayBuffer());

  // Salva localmente
  const localPath = path.join(__dirname, 'morena-model-preview.png');
  fs.writeFileSync(localPath, buffer);

  console.log('✅ Imagem baixada com sucesso!');
  console.log('📁 Salva em:', localPath);
  console.log('\n🔍 Use o comando Read para visualizar a imagem.');
}

downloadImage();
