require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Bypass SSL
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function uploadFromUrl(imageUrl) {
  console.log('Baixando imagem de referência...');

  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error(`Falha ao baixar: ${response.status}`);

  const buffer = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get('content-type') || 'image/jpeg';
  const ext = contentType.split('/')[1] || 'jpg';
  const fileName = `preset-models/reference-nova-modelo-${Date.now()}.${ext}`;

  console.log('Fazendo upload para Supabase Storage...');

  const { error } = await supabase.storage
    .from('generations')
    .upload(fileName, buffer, { contentType, upsert: true });

  if (error) throw new Error(`Upload falhou: ${error.message}`);

  const { data: urlData } = supabase.storage
    .from('generations')
    .getPublicUrl(fileName);

  console.log('\n✅ Upload concluído!');
  console.log('URL pública:', urlData.publicUrl);
  return urlData.publicUrl;
}

async function uploadFromLocal(localPath) {
  console.log('Lendo arquivo local:', localPath);

  const buffer = fs.readFileSync(localPath);
  const ext = path.extname(localPath).substring(1) || 'png';
  const contentType = `image/${ext}`;
  const fileName = `preset-models/reference-nova-modelo-${Date.now()}.${ext}`;

  console.log('Fazendo upload para Supabase Storage...');

  const { error } = await supabase.storage
    .from('generations')
    .upload(fileName, buffer, { contentType, upsert: true });

  if (error) throw new Error(`Upload falhou: ${error.message}`);

  const { data: urlData } = supabase.storage
    .from('generations')
    .getPublicUrl(fileName);

  console.log('\n✅ Upload concluído!');
  console.log('URL pública:', urlData.publicUrl);
  return urlData.publicUrl;
}

// URL da foto de referência enviada pelo cliente ou caminho local
const input = process.argv[2];
if (!input) {
  console.error('Uso: node upload-reference.js <url-da-imagem-ou-caminho-local>');
  process.exit(1);
}

// Verifica se é URL ou caminho local
if (input.startsWith('http://') || input.startsWith('https://')) {
  uploadFromUrl(input).catch(console.error);
} else {
  uploadFromLocal(input).catch(console.error);
}
