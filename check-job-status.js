// Check job status - requires authentication token
require('dotenv').config();

async function checkJobStatus() {
  const jobId = process.argv[2];

  if (!jobId) {
    console.log('❌ Usage: node check-job-status.js <job-id>');
    console.log('Example: node check-job-status.js df27e094-dee7-4488-92ee-5a78d3ce8b42');
    process.exit(1);
  }

  console.log(`🔍 Verificando status do job: ${jobId}\n`);

  try {
    // Você precisa passar o token de autenticação
    console.log('⚠️  Para verificar o job, você precisa:');
    console.log('1. Abrir o DevTools (F12)');
    console.log('2. Aba Console');
    console.log('3. Executar: window.AuthLib.authFetch("/api/me/generations").then(r => r.json()).then(d => console.log(d))');
    console.log('4. Procurar pelo job ID:', jobId);
    console.log('\nOu verificar diretamente nos logs do Railway:');
    console.log('https://railway.app/dashboard → Logs → buscar por:', jobId);

  } catch (err) {
    console.error('❌ Erro:', err.message);
  }
}

checkJobStatus();
