// setup-stripe-products.js
require('dotenv').config();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

async function setup() {
  console.log('Criando produtos no Stripe (modo TEST)...\n');

  const planos = [
    {
      name: 'Modelo Fácil - Básico',
      desc: '20 créditos/mês — ~10 fotos ou 2 vídeos de movimento',
      amount: 3500,
      key: 'STRIPE_PRICE_BASICO'
    },
    {
      name: 'Modelo Fácil - Starter',
      desc: '50 créditos/mês — ~25 fotos ou 6 vídeos de movimento',
      amount: 7900,
      key: 'STRIPE_PRICE_STARTER'
    },
    {
      name: 'Modelo Fácil - Pro',
      desc: '120 créditos/mês — ~60 fotos ou 15 vídeos de movimento',
      amount: 15900,
      key: 'STRIPE_PRICE_PRO'
    },
  ];

  const results = [];

  for (const p of planos) {
    const product = await stripe.products.create({
      name: p.name,
      description: p.desc
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: p.amount,
      currency: 'brl',
      recurring: { interval: 'month' },
    });

    results.push({ key: p.key, priceId: price.id });
    console.log(`✅ ${p.name}: ${price.id}`);
  }

  console.log('\n=== COLE NO .env ===');
  results.forEach(r => console.log(`${r.key}=${r.priceId}`));
}

setup().catch(console.error);
