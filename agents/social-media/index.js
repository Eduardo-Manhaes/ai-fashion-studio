// agents/social-media/index.js
require('dotenv').config();
const config = require('./config');
const strategist = require('./strategist');
const copywriter = require('./copywriter');
const producer = require('./producer');
const fiscal = require('./fiscal');
const publisher = require('./publisher');

async function runDailyPost() {
  console.log('[SOCIAL MEDIA] 🚀 Iniciando geração do post diário...');

  const today = new Date();
  const dayOfWeek = today.getDay();
  const pillar = config.schedule[dayOfWeek];

  console.log(`[SOCIAL MEDIA] 📅 Dia: ${today.toLocaleDateString('pt-BR')} | Quadro: ${pillar}`);

  try {
    // ETAPA 1 — Estrategista define o briefing
    console.log('[SOCIAL MEDIA] 1/5 Estrategista analisando...');
    const briefing = await strategist.analyze({ pillar, config });
    console.log(`[SOCIAL MEDIA] ✅ Briefing: ${briefing.theme}`);

    // ETAPA 2 — Roteirista cria o conteúdo textual
    console.log('[SOCIAL MEDIA] 2/5 Roteirista criando copy...');
    const content = await copywriter.write({ briefing, config });
    console.log('[SOCIAL MEDIA] ✅ Copy criada');

    // ETAPA 3 — Produtor cria o visual
    console.log('[SOCIAL MEDIA] 3/5 Produtor criando visual...');
    const visual = await producer.create({ briefing, content, config });
    console.log('[SOCIAL MEDIA] ✅ Visual criado');

    // ETAPA 4 — Fiscal revisa tudo
    console.log('[SOCIAL MEDIA] 4/5 Fiscal revisando...');
    const review = await fiscal.review({ briefing, content, visual, config });

    if (review.approved) {
      console.log('[SOCIAL MEDIA] ✅ Post aprovado pelo Fiscal');
    } else {
      console.log(`[SOCIAL MEDIA] ⚠️ Fiscal identificou problema: ${review.issue}`);
      // Notifica Eduardo via Telegram
      await notifyTelegram(review);
      return;
    }

    // ETAPA 5 — Publicador agenda o post
    console.log('[SOCIAL MEDIA] 5/5 Publicador agendando...');
    await publisher.schedule({ content, visual, config });
    console.log('[SOCIAL MEDIA] ✅ Post agendado com sucesso!');

  } catch (err) {
    console.error('[SOCIAL MEDIA] ❌ Erro:', err.message);
    await notifyTelegram({ issue: err.message, approved: false });
  }
}

async function notifyTelegram({ issue, approved }) {
  if (!config.telegram.chatId || !config.telegram.botToken) return;

  const message = approved
    ? '✅ Post do dia aprovado e agendado!'
    : `⚠️ Post precisa de revisão:\n${issue}`;

  await fetch(`https://api.telegram.org/bot${config.telegram.botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: config.telegram.chatId,
      text: message,
      parse_mode: 'HTML'
    })
  });
}

module.exports = { runDailyPost, notifyTelegram };
