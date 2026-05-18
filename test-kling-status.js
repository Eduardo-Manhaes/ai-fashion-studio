// Testa o endpoint de status do Kling diretamente
require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function testKlingStatus() {
  const klingJobId = '019e30d5-8d36-7770-ba1e-595f943fffcf'; // Um dos jobs antigos

  console.log('\n🧪 TESTANDO ENDPOINT DE STATUS DO KLING\n');
  console.log(`Job ID do Kling: ${klingJobId}`);
  console.log('');

  try {
    // Testa via servidor local
    console.log('1. Testando via servidor local (http://localhost:3000)...');
    const localRes = await fetch(`http://localhost:3000/api/status/kling/${klingJobId}`);
    const localData = await localRes.json();

    console.log(`   Status HTTP: ${localRes.status}`);
    console.log(`   Resposta:`, JSON.stringify(localData, null, 2));
    console.log('');

    // Testa diretamente na API do Fal.ai
    console.log('2. Testando diretamente na API do Fal.ai...');
    const directRes = await fetch(
      `https://queue.fal.run/fal-ai/kling-video/requests/${klingJobId}/status`,
      {
        headers: { 'Authorization': `Key ${process.env.FAL_API_KEY}` }
      }
    );

    const directText = await directRes.text();
    console.log(`   Status HTTP: ${directRes.status}`);
    console.log(`   Resposta raw: ${directText}`);

    if (directText) {
      try {
        const directData = JSON.parse(directText);
        console.log(`   Resposta JSON:`, JSON.stringify(directData, null, 2));
      } catch (e) {
        console.log(`   ⚠️  Não é JSON válido`);
      }
    }

  } catch (err) {
    console.error('❌ Erro:', err.message);
  }
}

testKlingStatus();
