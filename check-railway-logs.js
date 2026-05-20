// Bypass SSL
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

async function check() {
  console.log('🔍 Verificando Railway...\n');

  try {
    const res = await fetch('https://web-production-6ab20.up.railway.app/api/public-config');
    console.log('Status:', res.status);
    console.log('Status Text:', res.statusText);
    console.log('\nHeaders:');
    const headers = Object.fromEntries(res.headers.entries());
    console.log(JSON.stringify(headers, null, 2));

    const data = await res.text();
    console.log('\nBody (primeiros 300 chars):');
    console.log(data.substring(0, 300));

    if (res.ok) {
      console.log('\n✅ Servidor Railway está online e respondendo');
    } else {
      console.log('\n⚠️  Servidor retornou erro');
    }
  } catch (err) {
    console.error('❌ Erro ao conectar:', err.message);
  }
}

check();
