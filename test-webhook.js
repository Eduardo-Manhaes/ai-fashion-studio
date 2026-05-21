// test-webhook.js - Simula evento do Stripe para testar webhook
require('dotenv').config();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

async function testWebhook() {
  console.log('🧪 TESTE DO WEBHOOK STRIPE\n');
  console.log('='.repeat(60));

  console.log('\n📋 Configuração atual:');
  console.log('   Endpoint: https://web-production-6ab20.up.railway.app/api/stripe/webhook');
  console.log('   Webhook ID: we_1TZWLR2KyFcexK6NSSelfzSk');
  console.log('   Secret: whsec_8a... (configurado)');

  console.log('\n⚠️  IMPORTANTE:');
  console.log('   Para testar webhooks em produção, você precisa:');
  console.log('   1. Atualizar STRIPE_WEBHOOK_SECRET no Railway Dashboard');
  console.log('   2. Fazer um pagamento de teste real');
  console.log('   3. Verificar logs no Railway para confirmar recebimento');

  console.log('\n📝 Verificando webhook no Stripe Dashboard...');

  try {
    const webhooks = await stripe.webhookEndpoints.list({ limit: 10 });

    const prodWebhook = webhooks.data.find(w =>
      w.url.includes('web-production-6ab20.up.railway.app')
    );

    if (prodWebhook) {
      console.log('\n✅ Webhook encontrado:');
      console.log(`   URL: ${prodWebhook.url}`);
      console.log(`   Status: ${prodWebhook.status}`);
      console.log(`   Eventos: ${prodWebhook.enabled_events.length} configurados`);
      console.log(`   Criado: ${new Date(prodWebhook.created * 1000).toLocaleString()}`);
    } else {
      console.log('\n⚠️  Webhook de produção não encontrado na lista');
    }

    console.log('\n📊 Todos os webhooks ativos:');
    webhooks.data.forEach(w => {
      console.log(`   - ${w.url.substring(0, 50)}... (${w.status})`);
    });

  } catch (err) {
    console.error('\n❌ Erro ao listar webhooks:', err.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n✅ PRÓXIMOS PASSOS:');
  console.log('   1. Atualize STRIPE_WEBHOOK_SECRET no Railway (ver UPDATE-RAILWAY-ENV.md)');
  console.log('   2. Aguarde redeploy (1-2 min)');
  console.log('   3. Faça teste end-to-end com checkout real');
  console.log('   4. Verifique logs do Railway para confirmar webhook recebido');
}

testWebhook().catch(err => {
  console.error('❌ Erro:', err.message);
  process.exit(1);
});
