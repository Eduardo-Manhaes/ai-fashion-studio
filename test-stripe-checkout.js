// test-stripe-checkout.js
require('dotenv').config();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

async function test() {
  console.log('Testando criação de checkout Stripe...\n');

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: process.env.STRIPE_PRICE_STARTER,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: 'https://web-production-6ab20.up.railway.app/billing/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://web-production-6ab20.up.railway.app/billing/cancel',
    });

    console.log('✅ Checkout criado com sucesso!');
    console.log('\nDetalhes:');
    console.log('  Session ID:', session.id);
    console.log('  Plano:', 'Starter - R$ 79/mês');
    console.log('  Modo:', session.mode);
    console.log('\n🔗 URL de teste:');
    console.log(session.url);
    console.log('\n💳 Cartão de teste: 4242 4242 4242 4242');
    console.log('   Data: qualquer data futura (ex: 12/34)');
    console.log('   CVV: qualquer 3 dígitos (ex: 123)');
    console.log('   CEP: qualquer (ex: 12345-678)');
  } catch (error) {
    console.error('\n❌ Erro ao criar checkout:', error.message);
    process.exit(1);
  }
}

test();
