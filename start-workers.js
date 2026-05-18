// Inicia todos os workers em um único processo
require('dotenv').config();

console.log('🚀 Iniciando workers...\n');

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
