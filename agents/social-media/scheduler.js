// agents/social-media/scheduler.js
const cron = require('node-cron');
const { runDailyPost } = require('./index');

// Roda todo dia às 8h horário de Brasília (11h UTC)
cron.schedule('0 11 * * *', async () => {
  console.log('[SCHEDULER] ⏰ Iniciando post diário...');
  await runDailyPost();
}, {
  timezone: 'America/Sao_Paulo'
});

console.log('[SCHEDULER] ✅ Agendador de posts ativo — roda todo dia às 8h');
