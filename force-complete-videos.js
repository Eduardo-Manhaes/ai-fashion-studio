// FORÇA COMPLETAR VÍDEOS PENDENTES
require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function forceComplete() {
  console.log('\n🔧 FORÇANDO COMPLETAR VÍDEOS PENDENTES\n');

  // IDs dos vídeos recentes que sabemos que foram gerados
  const videoIds = [
    '019e3157-9023-7281-ae38-0c32f3f35fbe',
    '019e3157-a9e2-78f0-a77d-a616503e197d',
    '019e3162-f6be-7243-bbce-ff34089586a9',
    '019e3164-2358-7a22-bf50-8e9f0aaad1fb',
    '019e3167-b904-7b50-b13e-a5d17c8dc317'
  ];

  for (const id of videoIds) {
    console.log(`\n📹 Verificando ${id}...`);

    try {
      // Checa status via nosso servidor (que já tem a lógica correta)
      const res = await fetch(`http://localhost:3000/api/status/kling/${id}`);
      const data = await res.json();

      console.log(`   Status: ${data.status}`);

      if (data.status === 'completed' && data.output && data.output[0]) {
        console.log(`   ✅ COMPLETO! URL: ${data.output[0].substring(0, 60)}...`);
      } else if (data.status === 'processing' || data.status === 'in_queue') {
        console.log(`   ⏳ Ainda processando...`);
      } else if (data.error) {
        console.log(`   ❌ Erro: ${data.error.message}`);
      }
    } catch (err) {
      console.log(`   ❌ Erro: ${err.message}`);
    }
  }

  console.log('\n✅ Verificação completa!');
  console.log('\n💡 Agora recarregue a página e veja a galeria em "Completos"');
}

forceComplete();
