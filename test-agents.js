// test-agents.js
// Script para testar o sistema de agentes manualmente (sem esperar o cron)

require('dotenv').config();
const { runDailyPost } = require('./agents/social-media/index');

console.log('🧪 TESTE DO SISTEMA DE AGENTES — Modelo Fácil\n');
console.log('Este script vai rodar o pipeline completo:');
console.log('1️⃣  Estrategista → define briefing');
console.log('2️⃣  Roteirista → cria copy');
console.log('3️⃣  Produtor → gera visual');
console.log('4️⃣  Fiscal → revisa tudo');
console.log('5️⃣  Publicador → agenda post\n');

// Verificar variáveis necessárias
const requiredEnvVars = [
  'ANTHROPIC_API_KEY',
  'OPENAI_API_KEY',
  'INSTAGRAM_USERNAME',
  'INSTAGRAM_PASSWORD',
  'TELEGRAM_BOT_TOKEN'
];

const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  console.warn('⚠️  AVISO: Variáveis de ambiente faltando:');
  missingVars.forEach(v => console.warn(`   - ${v}`));
  console.warn('\nO sistema vai usar fallbacks. Para teste completo, configure todas as variáveis.\n');
}

// Rodar o pipeline
runDailyPost()
  .then(() => {
    console.log('\n✅ Teste concluído com sucesso!');
    console.log('\nVerifique:');
    console.log('- Logs acima para ver cada etapa');
    console.log('- Pasta public/generated-posts/ para a imagem gerada');
    console.log('- Telegram para notificações (se configurado)');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Erro durante o teste:', err.message);
    console.error('\nStack trace:', err.stack);
    process.exit(1);
  });
