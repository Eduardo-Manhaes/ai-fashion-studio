require('dotenv').config();

const required = [
  'FAL_API_KEY',
  'OPENAI_API_KEY',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'STRIPE_SECRET_KEY',
];

console.log('=== VARIÁVEIS DE AMBIENTE ===');
required.forEach(key => {
  const val = process.env[key];
  console.log(`${key}: ${val ? '✅ ' + val.substring(0, 15) + '...' : '❌ AUSENTE'}`);
});
