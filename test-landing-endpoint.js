require('dotenv').config();

// Bypass SSL em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

async function testLandingEndpoint() {
  console.log('🧪 Testando endpoint /api/landing-data...\n');

  // Forçar produção para testar Railway
  const BASE_URL = 'https://web-production-6ab20.up.railway.app';

  try {
    const res = await fetch(`${BASE_URL}/api/landing-data`);

    if (!res.ok) {
      console.error(`❌ Erro ${res.status}: ${res.statusText}`);
      process.exit(1);
    }

    const data = await res.json();

    console.log('✅ Endpoint respondeu com sucesso!\n');
    console.log(`📊 Estatísticas:`);
    console.log(`   - Modelos: ${data.models?.length || 0}`);
    console.log(`   - Fotos: ${data.photos?.length || 0}`);
    console.log(`   - Vídeos: ${data.videos?.length || 0}`);
    console.log('');

    if (data.videos && data.videos.length > 0) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📹 VÍDEOS RETORNADOS:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      data.videos.forEach((video, i) => {
        console.log(`${i + 1}. Tipo: ${video.generation_type} | Provider: ${video.provider}`);
        console.log(`   ID: ${video.id}`);
        console.log(`   URL: ${video.result_url.substring(0, 80)}...`);
        console.log('');
      });
    } else {
      console.log('⚠️  Nenhum vídeo retornado pelo endpoint.');
    }

  } catch (err) {
    console.error('❌ Erro ao testar endpoint:', err.message);
    process.exit(1);
  }
}

testLandingEndpoint();
