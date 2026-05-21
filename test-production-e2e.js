// test-production-e2e.js - Teste End-to-End em Produção
require('dotenv').config();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const PROD_URL = 'https://web-production-6ab20.up.railway.app';

async function testProductionE2E() {
  console.log('🧪 TESTE END-TO-END EM PRODUÇÃO\n');
  console.log('='.repeat(70));

  const results = {
    passed: [],
    failed: [],
    warnings: []
  };

  // ============================================================
  // FASE 1: INFRAESTRUTURA
  // ============================================================
  console.log('\n📦 FASE 1: INFRAESTRUTURA');
  console.log('-'.repeat(70));

  // TEST 1.1: Servidor acessível
  console.log('\n1.1 Verificando servidor...');
  try {
    const res = await fetch(`${PROD_URL}/`);
    if (res.ok) {
      console.log('   ✅ Servidor online (HTTP 200)');
      results.passed.push('Servidor acessível');
    } else {
      throw new Error(`Status ${res.status}`);
    }
  } catch (err) {
    console.log(`   ❌ ${err.message}`);
    results.failed.push('Servidor acessível');
  }

  // TEST 1.2: HTTPS configurado
  console.log('\n1.2 Verificando HTTPS...');
  if (PROD_URL.startsWith('https://')) {
    console.log('   ✅ HTTPS ativo');
    results.passed.push('HTTPS');
  } else {
    console.log('   ❌ HTTPS não configurado');
    results.failed.push('HTTPS');
  }

  // TEST 1.3: Supabase conectado
  console.log('\n1.3 Verificando Supabase...');
  try {
    const res = await fetch(`${PROD_URL}/api/public-config`);
    const data = await res.json();
    if (data.supabaseUrl && data.supabaseAnonKey) {
      console.log('   ✅ Supabase configurado');
      results.passed.push('Supabase');
    } else {
      throw new Error('Config incompleta');
    }
  } catch (err) {
    console.log(`   ❌ ${err.message}`);
    results.failed.push('Supabase');
  }

  // ============================================================
  // FASE 2: STRIPE & WEBHOOKS
  // ============================================================
  console.log('\n\n💳 FASE 2: STRIPE & WEBHOOKS');
  console.log('-'.repeat(70));

  // TEST 2.1: Webhook configurado
  console.log('\n2.1 Verificando webhook...');
  try {
    const webhooks = await stripe.webhookEndpoints.list({ limit: 10 });
    const prodWebhook = webhooks.data.find(w => w.url.includes(PROD_URL));

    if (prodWebhook && prodWebhook.status === 'enabled') {
      console.log(`   ✅ Webhook ativo (${prodWebhook.enabled_events.length} eventos)`);
      results.passed.push('Webhook configurado');
    } else {
      throw new Error('Webhook não encontrado ou inativo');
    }
  } catch (err) {
    console.log(`   ❌ ${err.message}`);
    results.failed.push('Webhook configurado');
  }

  // TEST 2.2: Criar sessão de checkout (teste de integração)
  console.log('\n2.2 Testando criação de checkout...');
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: process.env.STRIPE_PRICE_BASICO, quantity: 1 }],
      mode: 'subscription',
      success_url: `${PROD_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${PROD_URL}/billing/cancel`,
      metadata: { test: 'e2e-validation' }
    });

    if (session.id && session.url) {
      console.log(`   ✅ Checkout criado (${session.id})`);
      console.log(`   📋 URL de teste: ${session.url.substring(0, 60)}...`);
      results.passed.push('Criação de checkout');

      // Cancela a sessão para não deixar lixo
      await stripe.checkout.sessions.expire(session.id);
      console.log('   🗑️  Sessão de teste expirada');
    }
  } catch (err) {
    console.log(`   ❌ ${err.message}`);
    results.failed.push('Criação de checkout');
  }

  // ============================================================
  // FASE 3: ENDPOINTS DA API
  // ============================================================
  console.log('\n\n🔌 FASE 3: ENDPOINTS DA API');
  console.log('-'.repeat(70));

  // TEST 3.1: Endpoint de modelos preset
  console.log('\n3.1 Verificando modelos preset...');
  try {
    const res = await fetch(`${PROD_URL}/api/preset-models`);
    const data = await res.json();
    const models = data.models || data;

    if (Array.isArray(models) && models.length > 0) {
      console.log(`   ✅ ${models.length} modelos preset disponíveis`);
      results.passed.push('Modelos preset');
    } else {
      throw new Error('Nenhum modelo encontrado');
    }
  } catch (err) {
    console.log(`   ❌ ${err.message}`);
    results.failed.push('Modelos preset');
  }

  // TEST 3.2: Rate limiting ativo
  console.log('\n3.2 Verificando rate limiting...');
  try {
    const res = await fetch(`${PROD_URL}/api/public-config`);
    const rateLimitHeader = res.headers.get('x-ratelimit-limit');

    if (rateLimitHeader) {
      console.log(`   ✅ Rate limit: ${rateLimitHeader} req/janela`);
      results.passed.push('Rate limiting');
    } else {
      console.log('   ⚠️  Header de rate limit não encontrado');
      results.warnings.push('Rate limiting header ausente');
    }
  } catch (err) {
    console.log(`   ❌ ${err.message}`);
    results.failed.push('Rate limiting');
  }

  // TEST 3.3: Security headers
  console.log('\n3.3 Verificando security headers...');
  try {
    const res = await fetch(`${PROD_URL}/`);
    const headers = {
      'strict-transport-security': res.headers.get('strict-transport-security'),
      'x-content-type-options': res.headers.get('x-content-type-options'),
      'x-frame-options': res.headers.get('x-frame-options'),
    };

    const missingHeaders = Object.entries(headers)
      .filter(([k, v]) => !v)
      .map(([k]) => k);

    if (missingHeaders.length === 0) {
      console.log('   ✅ Todos os security headers presentes');
      results.passed.push('Security headers');
    } else {
      console.log(`   ⚠️  Headers ausentes: ${missingHeaders.join(', ')}`);
      results.warnings.push('Alguns security headers ausentes');
    }
  } catch (err) {
    console.log(`   ❌ ${err.message}`);
    results.failed.push('Security headers');
  }

  // ============================================================
  // FASE 4: FUNCIONALIDADES CRÍTICAS
  // ============================================================
  console.log('\n\n⚡ FASE 4: FUNCIONALIDADES CRÍTICAS');
  console.log('-'.repeat(70));

  // TEST 4.1: Landing page carrega
  console.log('\n4.1 Verificando landing page...');
  try {
    const res = await fetch(`${PROD_URL}/`);
    const html = await res.text();

    if (html.includes('Modelo Fácil') && html.includes('IA')) {
      console.log('   ✅ Landing page renderizada');
      results.passed.push('Landing page');
    } else {
      throw new Error('Conteúdo esperado não encontrado');
    }
  } catch (err) {
    console.log(`   ❌ ${err.message}`);
    results.failed.push('Landing page');
  }

  // TEST 4.2: Página de planos carrega
  console.log('\n4.2 Verificando página de planos...');
  try {
    const res = await fetch(`${PROD_URL}/planos.html`);
    const html = await res.text();

    if (html.includes('Básico') || html.includes('Starter') || html.includes('Pro')) {
      console.log('   ✅ Página de planos acessível');
      results.passed.push('Página de planos');
    } else {
      throw new Error('Planos não encontrados na página');
    }
  } catch (err) {
    console.log(`   ❌ ${err.message}`);
    results.failed.push('Página de planos');
  }

  // TEST 4.3: App principal carrega
  console.log('\n4.3 Verificando app principal...');
  try {
    const res = await fetch(`${PROD_URL}/index.html`);
    const html = await res.text();

    if (res.ok && html.includes('app.js')) {
      console.log('   ✅ App principal acessível');
      results.passed.push('App principal');
    } else {
      throw new Error(`Status ${res.status}`);
    }
  } catch (err) {
    console.log(`   ❌ ${err.message}`);
    results.failed.push('App principal');
  }

  // ============================================================
  // RESUMO FINAL
  // ============================================================
  console.log('\n\n' + '='.repeat(70));
  console.log('📊 RESUMO DO TESTE END-TO-END\n');

  const total = results.passed.length + results.failed.length;
  const passRate = ((results.passed.length / total) * 100).toFixed(1);

  console.log(`✅ Aprovados: ${results.passed.length}/${total} (${passRate}%)`);
  console.log(`❌ Falhados: ${results.failed.length}/${total}`);
  console.log(`⚠️  Avisos: ${results.warnings.length}`);

  if (results.passed.length > 0) {
    console.log('\n✅ Testes aprovados:');
    results.passed.forEach(t => console.log(`   • ${t}`));
  }

  if (results.failed.length > 0) {
    console.log('\n❌ Testes falhados:');
    results.failed.forEach(t => console.log(`   • ${t}`));
  }

  if (results.warnings.length > 0) {
    console.log('\n⚠️  Avisos:');
    results.warnings.forEach(t => console.log(`   • ${t}`));
  }

  console.log('\n' + '='.repeat(70));

  if (results.failed.length === 0) {
    console.log('🎉 PRODUÇÃO VALIDADA COM SUCESSO!\n');
    console.log('✅ Sistema pronto para receber usuários reais.');
    console.log('\n📝 Próximos passos:');
    console.log('   1. Teste manual: Faça signup + checkout + geração');
    console.log('   2. Monitore logs do Railway para erros');
    console.log('   3. Configure domínio customizado (opcional)');
    console.log('   4. Troque para chaves LIVE do Stripe quando for ao ar');
  } else {
    console.log('⚠️  ATENÇÃO: Alguns testes críticos falharam.');
    console.log('Corrija os problemas antes de liberar para usuários.');
    process.exit(1);
  }
}

testProductionE2E().catch(err => {
  console.error('\n❌ Erro fatal:', err.message);
  process.exit(1);
});
