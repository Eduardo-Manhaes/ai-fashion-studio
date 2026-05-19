require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Bypass SSL em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function viewImage() {
  const fileName = 'preset-models/morena-lips-1779218194226.png';

  console.log('🔄 Gerando nova URL signed...\n');

  // Gera URL pública signed (válida por 1 hora = 3600 segundos)
  const { data, error } = await supabase.storage
    .from('generations')
    .createSignedUrl(fileName, 3600);

  if (error) {
    console.error('❌ Erro:', error);
    return;
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ URL VÁLIDA POR 1 HORA:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n' + data.signedUrl);
  console.log('\n🔗 Copie e cole no navegador para visualizar.');
  console.log('');
}

viewImage();
