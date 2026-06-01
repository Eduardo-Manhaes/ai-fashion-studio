#!/usr/bin/env node
// Script de verificação de ambiente de produção
require('dotenv').config();

console.log('\n🔍 VERIFICAÇÃO DE AMBIENTE PRODUÇÃO\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const checks = {
  redis: {
    name: 'Redis',
    check: () => !!process.env.REDIS_URL,
    value: () => process.env.REDIS_URL ? process.env.REDIS_URL.substring(0, 30) + '...' : null,
    required: false,
    note: 'Sem Redis = MockQueue (in-memory)',
  },
  supabase: {
    name: 'Supabase URL',
    check: () => !!process.env.SUPABASE_URL,
    value: () => process.env.SUPABASE_URL,
    required: true,
  },
  supabaseKey: {
    name: 'Supabase Service Role Key',
    check: () => !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    value: () => process.env.SUPABASE_SERVICE_ROLE_KEY ? '***' + process.env.SUPABASE_SERVICE_ROLE_KEY.slice(-8) : null,
    required: true,
  },
  falKey: {
    name: 'Fal.ai API Key',
    check: () => !!process.env.FAL_API_KEY,
    value: () => process.env.FAL_API_KEY ? process.env.FAL_API_KEY.substring(0, 15) + '...' : null,
    required: true,
  },
  stripe: {
    name: 'Stripe Secret Key',
    check: () => !!process.env.STRIPE_SECRET_KEY,
    value: () => {
      const key = process.env.STRIPE_SECRET_KEY;
      if (!key) return null;
      const isLive = key.startsWith('sk_live_');
      const preview = key.substring(0, 15) + '...';
      return `${preview} (${isLive ? '🟢 LIVE' : '🟡 TEST'})`;
    },
    required: true,
  },
  stripeWebhook: {
    name: 'Stripe Webhook Secret',
    check: () => !!process.env.STRIPE_WEBHOOK_SECRET,
    value: () => process.env.STRIPE_WEBHOOK_SECRET ? process.env.STRIPE_WEBHOOK_SECRET.substring(0, 15) + '...' : null,
    required: true,
  },
};

let hasErrors = false;
let hasWarnings = false;

for (const [key, config] of Object.entries(checks)) {
  const status = config.check();
  const icon = status ? '✅' : (config.required ? '❌' : '⚠️');

  console.log(`${icon} ${config.name}`);

  if (status) {
    console.log(`   ${config.value()}`);
    if (config.note) {
      console.log(`   💡 ${config.note}`);
    }
  } else {
    if (config.required) {
      console.log('   🚨 OBRIGATÓRIA - Sistema não vai funcionar sem ela!');
      hasErrors = true;
    } else {
      console.log(`   ⚠️  ${config.note}`);
      hasWarnings = true;
    }
  }
  console.log('');
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Teste de conexão Redis (se configurado)
if (process.env.REDIS_URL) {
  console.log('🔌 Testando conexão Redis...\n');

  const Redis = require('ioredis');
  const testClient = new Redis(process.env.REDIS_URL, {
    connectTimeout: 5000,
    maxRetriesPerRequest: 2,
  });

  testClient.ping()
    .then(() => {
      console.log('✅ Redis conectado com sucesso!');
      console.log('   → BullMQ vai funcionar normalmente');
      console.log('   → Certifique-se de que os workers estão rodando: npm run workers\n');
      testClient.quit();
      printSummary();
    })
    .catch((err) => {
      console.log('❌ Erro ao conectar Redis:', err.message);
      console.log('   → Sistema vai usar MockQueue (fallback)\n');
      hasErrors = true;
      testClient.quit();
      printSummary();
    });
} else {
  printSummary();
}

function printSummary() {
  if (hasErrors) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚨 ATENÇÃO: Variáveis obrigatórias ausentes!');
    console.log('   Sistema NÃO vai funcionar corretamente.');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  Sistema funcional, mas com avisos.');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } else {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Todas as variáveis configuradas!');
    console.log('   Sistema pronto para produção.');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }
}
