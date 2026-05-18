const Stripe = require('stripe');

// Stripe é opcional até Fase 1F — não lança erro se a chave estiver ausente.
// Os handlers de rota já retornam 503 quando stripe === null.
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
      typescript: false,
    })
  : null;

module.exports = { stripe };
