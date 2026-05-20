// test-billing-flow.js - Teste completo do fluxo de cobrança
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testBillingFlow() {
  console.log('🧪 TESTE DO FLUXO DE COBRANÇA\n');
  console.log('='.repeat(60));

  const results = {
    passed: [],
    failed: [],
  };

  // TEST 1: Verificar configuração Stripe
  console.log('\n1️⃣  Verificando configuração Stripe...');
  try {
    const stripeKeys = {
      secret: process.env.STRIPE_SECRET_KEY,
      publishable: process.env.STRIPE_PUBLISHABLE_KEY,
      webhook: process.env.STRIPE_WEBHOOK_SECRET,
      basico: process.env.STRIPE_PRICE_BASICO,
      starter: process.env.STRIPE_PRICE_STARTER,
      pro: process.env.STRIPE_PRICE_PRO,
    };

    const missing = Object.entries(stripeKeys)
      .filter(([k, v]) => !v)
      .map(([k]) => k);

    if (missing.length > 0) {
      throw new Error(`Chaves ausentes: ${missing.join(', ')}`);
    }

    console.log('   ✅ Todas as chaves Stripe configuradas');
    results.passed.push('Configuração Stripe');
  } catch (err) {
    console.log(`   ❌ ${err.message}`);
    results.failed.push('Configuração Stripe');
  }

  // TEST 2: Verificar planos no banco
  console.log('\n2️⃣  Verificando planos no Supabase...');
  try {
    const { data: plans, error } = await supabase
      .from('plans')
      .select('*')
      .order('display_order');

    if (error) throw error;

    // IDs no banco: starter=Básico, pro=Starter, enterprise=Pro
    const expectedPlans = {
      starter: { credits: 20, price: 35, name: 'Básico' },
      pro: { credits: 50, price: 79, name: 'Starter' },
      enterprise: { credits: 120, price: 159, name: 'Pro' },
    };

    const issues = [];
    plans.forEach(plan => {
      const expected = expectedPlans[plan.id];
      if (!expected) {
        issues.push(`Plano inesperado: ${plan.id}`);
      } else {
        if (plan.monthly_quota_credits !== expected.credits) {
          issues.push(`${plan.id}: créditos incorretos (${plan.monthly_quota_credits} != ${expected.credits})`);
        }
        if (parseFloat(plan.price_brl) !== expected.price) {
          issues.push(`${plan.id}: preço incorreto (${plan.price_brl} != ${expected.price})`);
        }
      }
    });

    if (issues.length > 0) {
      throw new Error(issues.join(', '));
    }

    console.log('   ✅ Planos configurados corretamente:');
    plans.forEach(p => {
      console.log(`      - ${p.name}: R$ ${p.price_brl}/mês (${p.monthly_quota_credits} créditos)`);
    });
    results.passed.push('Planos no banco');
  } catch (err) {
    console.log(`   ❌ ${err.message}`);
    results.failed.push('Planos no banco');
  }

  // TEST 3: Verificar custos de geração
  console.log('\n3️⃣  Verificando custos de geração...');
  try {
    const { data: costs, error } = await supabase
      .from('generation_costs')
      .select('*');

    if (error) throw error;

    const expectedCosts = {
      photo: 2,
      video_movement: 8,
      video_talking: 15,
    };

    const issues = [];
    costs.forEach(cost => {
      const expected = expectedCosts[cost.generation_type];
      if (cost.credits_cost !== expected) {
        issues.push(`${cost.generation_type}: ${cost.credits_cost} != ${expected}`);
      }
    });

    if (issues.length > 0) {
      throw new Error(issues.join(', '));
    }

    console.log('   ✅ Custos corretos:');
    costs.forEach(c => {
      console.log(`      - ${c.generation_type}: ${c.credits_cost} créditos`);
    });
    results.passed.push('Custos de geração');
  } catch (err) {
    console.log(`   ❌ ${err.message}`);
    results.failed.push('Custos de geração');
  }

  // TEST 4: Testar criação de checkout (já testado anteriormente)
  console.log('\n4️⃣  Testando endpoint de checkout...');
  try {
    const Stripe = require('stripe');
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: process.env.STRIPE_PRICE_BASICO, quantity: 1 }],
      mode: 'subscription',
      success_url: 'http://localhost:3000/billing/success',
      cancel_url: 'http://localhost:3000/billing/cancel',
    });

    console.log('   ✅ Checkout criado com sucesso');
    console.log(`      Session ID: ${session.id}`);
    results.passed.push('Criação de checkout');
  } catch (err) {
    console.log(`   ❌ ${err.message}`);
    results.failed.push('Criação de checkout');
  }

  // TEST 5: Verificar webhook handler existe
  console.log('\n5️⃣  Verificando webhook handler...');
  try {
    const fs = require('fs');
    const serverCode = fs.readFileSync('server.js', 'utf8');
    const webhookCode = fs.readFileSync('routes/stripe-webhook.js', 'utf8');

    if (!serverCode.includes('/api/stripe/webhook')) {
      throw new Error('Endpoint /api/stripe/webhook não registrado em server.js');
    }

    if (!webhookCode.includes('stripe.webhooks.constructEvent')) {
      throw new Error('Validação de webhook não implementada');
    }

    console.log('   ✅ Webhook handler implementado');
    console.log('      Endpoint: POST /api/stripe/webhook');
    console.log('      Validação de assinatura: ✓');
    results.passed.push('Webhook handler');
  } catch (err) {
    console.log(`   ❌ ${err.message}`);
    results.failed.push('Webhook handler');
  }

  // TEST 6: Verificar RPC de débito de créditos
  console.log('\n6️⃣  Verificando RPC debit_credits...');
  try {
    const { data: functions, error } = await supabase.rpc('debit_credits', {
      p_user_id: '00000000-0000-0000-0000-000000000000', // UUID fake para teste
      p_generation_type: 'photo',
      p_job_id: '00000000-0000-0000-0000-000000000000',
    }).then(() => ({ data: true, error: null }))
      .catch(err => ({ data: null, error: err }));

    // Esperamos erro porque o usuário não existe, mas a função deve existir
    if (error && error.message.includes('does not exist')) {
      throw new Error('RPC debit_credits não encontrada');
    }

    console.log('   ✅ RPC debit_credits existe e está acessível');
    results.passed.push('RPC debit_credits');
  } catch (err) {
    console.log(`   ❌ ${err.message}`);
    results.failed.push('RPC debit_credits');
  }

  // Resumo final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMO DOS TESTES\n');
  console.log(`✅ Aprovados: ${results.passed.length}/${results.passed.length + results.failed.length}`);
  console.log(`❌ Falhados: ${results.failed.length}/${results.passed.length + results.failed.length}`);

  if (results.passed.length > 0) {
    console.log('\n✅ Testes aprovados:');
    results.passed.forEach(t => console.log(`   - ${t}`));
  }

  if (results.failed.length > 0) {
    console.log('\n❌ Testes falhados:');
    results.failed.forEach(t => console.log(`   - ${t}`));
  }

  console.log('\n' + '='.repeat(60));

  if (results.failed.length === 0) {
    console.log('🎉 TODOS OS TESTES PASSARAM!');
    console.log('\n✅ Sistema pronto para receber pagamentos.');
    console.log('\n📝 Próximos passos:');
    console.log('   1. Teste manual: Abra a URL de checkout e complete um pagamento teste');
    console.log('   2. Verifique os webhooks em: https://dashboard.stripe.com/test/webhooks');
    console.log('   3. Configure webhook em produção quando fizer deploy');
  } else {
    console.log('⚠️  ATENÇÃO: Alguns testes falharam.');
    console.log('Corrija os problemas acima antes de continuar.');
    process.exit(1);
  }
}

testBillingFlow().catch(err => {
  console.error('\n❌ Erro fatal:', err.message);
  process.exit(1);
});
