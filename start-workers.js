// Inicia todos os workers em um único processo
require('dotenv').config();

console.log('🚀 Iniciando workers...\n');

// Debug: verificar variáveis de ambiente críticas
console.log('[ENV CHECK] REDIS_URL:', process.env.REDIS_URL ? '✅ Disponível (' + process.env.REDIS_URL.substring(0, 30) + '...)' : '❌ AUSENTE');
console.log('[ENV CHECK] SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Disponível' : '❌ AUSENTE');
console.log('[ENV CHECK] FAL_API_KEY:', process.env.FAL_API_KEY ? '✅ Disponível' : '❌ AUSENTE');
console.log('');

// Importa os workers (eles se auto-inicializam)
require('./workers/photo-worker');
require('./workers/video-worker');

console.log('\n✅ Todos os workers ativos');
console.log('📝 Logs serão exibidos conforme jobs forem processados');
console.log('⚠️  Pressione Ctrl+C para parar\n');

// Keepalive: mantém o processo vivo mesmo sem jobs
// Envia heartbeat a cada 30 segundos para evitar timeout do Railway
const keepaliveInterval = setInterval(() => {
  console.log(`[KEEPALIVE] Workers ativos - ${new Date().toISOString()}`);
}, 30000); // 30 segundos

// Graceful shutdown
function shutdown(signal) {
  console.log(`\n🛑 Recebido ${signal}, parando workers...`);
  clearInterval(keepaliveInterval);

  // Aguarda 5 segundos para workers finalizarem jobs em andamento
  setTimeout(() => {
    console.log('✅ Workers finalizados');
    process.exit(0);
  }, 5000);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Previne crashes não tratados
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  // Não encerra o processo - apenas loga
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
  // Não encerra o processo - apenas loga
});
