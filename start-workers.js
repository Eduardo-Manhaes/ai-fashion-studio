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

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Parando workers...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Parando workers...');
  process.exit(0);
});
