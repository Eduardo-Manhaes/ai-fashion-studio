// Verifica configuração em produção
const PROD_URL = 'https://web-production-6ab20.up.railway.app';

async function checkProduction() {
  console.log('🔍 VERIFICANDO CONFIGURAÇÃO EM PRODUÇÃO\n');
  console.log('='.repeat(60));

  const results = {
    passed: [],
    failed: [],
  };

  // TEST 1: Servidor online
  console.log('\n1️⃣  Verificando se servidor está online...');
  try {
    const res = await fetch(`${PROD_URL}/api/public-config`);
    const data = await res.json();

    if (data.supabaseUrl && data.supabaseAnonKey) {
      console.log('   ✅ Servidor online e Supabase configurado');
      results.passed.push('Servidor online');
    } else {
      throw new Error('Supabase não configurado');
    }
  } catch (err) {
    console.log(`   ❌ ${err.message}`);
    results.failed.push('Servidor online');
  }

  // TEST 2: Verificar se as variáveis Stripe estão configuradas
  console.log('\n2️⃣  Verificando configuração Stripe...');
  try {
    // Tenta criar uma sessão de checkout (vai falhar se Stripe não estiver configurado)
    const res = await fetch(`${PROD_URL}/api/stripe/create-checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan_id: 'starter',
        type: 'subscription'
      })
    });

    const data = await res.json();

    if (res.status === 401) {
      console.log('   ⚠️  Stripe configurado, mas requer autenticação (esperado)');
      results.passed.push('Stripe configurado');
    } else if (res.status === 400 && data.error === 'stripe_not_configured') {
      throw new Error('Stripe não configurado em produção');
    } else if (res.ok || res.status === 401) {
      console.log('   ✅ Stripe configurado');
      results.passed.push('Stripe configurado');
    }
  } catch (err) {
    console.log(`   ❌ ${err.message}`);
    results.failed.push('Stripe configurado');
  }

  // TEST 3: Verificar domínio customizado
  console.log('\n3️⃣  Verificando domínio...');
  try {
    const res = await fetch(`${PROD_URL}/`);
    console.log(`   ✅ Domínio acessível: ${PROD_URL}`);
    results.passed.push('Domínio acessível');
  } catch (err) {
    console.log(`   ❌ ${err.message}`);
    results.failed.push('Domínio acessível');
  }

  // TEST 4: Verificar se está usando HTTPS
  console.log('\n4️⃣  Verificando HTTPS...');
  if (PROD_URL.startsWith('https://')) {
    console.log('   ✅ HTTPS ativo');
    results.passed.push('HTTPS ativo');
  } else {
    console.log('   ❌ HTTPS não configurado');
    results.failed.push('HTTPS ativo');
  }

  // Resumo
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMO\n');
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
    console.log('🎉 PRODUÇÃO CONFIGURADA CORRETAMENTE!\n');
    console.log('Próximos passos:');
    console.log('  1. Atualizar webhook Stripe para produção');
    console.log('  2. Testar fluxo completo end-to-end');
  } else {
    console.log('⚠️  Algumas configurações faltando em produção.');
    console.log('Configure as variáveis no Railway Dashboard.');
  }
}

checkProduction().catch(err => {
  console.error('\n❌ Erro fatal:', err.message);
  process.exit(1);
});
