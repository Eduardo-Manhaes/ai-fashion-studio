// Script para adicionar créditos de teste
require('dotenv').config();

// Desabilita verificação SSL em desenvolvimento (igual ao server.js)
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  console.log('[SSL] Modo desenvolvimento: verificação SSL desabilitada');
}

const { supabaseAdmin } = require('./middleware/auth');

async function addTestCredits() {
  try {
    // Pega o primeiro usuário ou usa um email específico
    const email = process.argv[2] || 'eduardomanhaesmaciel@gmail.com';

    console.log(`Buscando usuário: ${email}`);

    // Busca o usuário
    const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers();

    if (userError) {
      console.error('Erro ao buscar usuários:', userError);
      process.exit(1);
    }

    const user = users.find(u => u.email === email) || users[0];

    if (!user) {
      console.error('Nenhum usuário encontrado');
      process.exit(1);
    }

    console.log(`✅ Usuário encontrado: ${user.email} (ID: ${user.id})`);

    // Verifica se já existe um plano ativo
    const { data: plans } = await supabaseAdmin
      .from('plans')
      .select('*')
      .eq('is_active', true)
      .order('display_order')
      .limit(1);

    if (!plans || plans.length === 0) {
      console.error('❌ Nenhum plano ativo encontrado no banco. Crie os planos primeiro.');
      process.exit(1);
    }

    const plan = plans[0];
    console.log(`📋 Usando plano: ${plan.name}`);

    // Verifica se já existe assinatura ativa
    const { data: existingSub } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (existingSub) {
      console.log('✅ Usuário já tem assinatura ativa:', existingSub.id);
    } else {
      // Cria assinatura de teste
      const now = new Date();
      const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 dias

      const { data: newSub, error: subError } = await supabaseAdmin
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_id: plan.id,
          stripe_subscription_id: 'test_sub_' + Date.now(),
          status: 'active',
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
        })
        .select()
        .single();

      if (subError) {
        console.error('Erro ao criar assinatura:', subError);
        process.exit(1);
      }

      console.log('✅ Assinatura criada:', newSub.id);

      // Cria entrada de quota
      const { error: quotaError } = await supabaseAdmin
        .from('quota_usage')
        .insert({
          user_id: user.id,
          subscription_id: newSub.id,
          credits_limit: plan.credits_per_period || 100,
          credits_used: 0,
          period_start: now.toISOString(),
          period_end: periodEnd.toISOString(),
        });

      if (quotaError) {
        console.error('Erro ao criar quota:', quotaError);
        process.exit(1);
      }

      console.log('✅ Quota criada com', plan.credits_per_period || 100, 'créditos');
    }

    // Adiciona um pacote de créditos extra para testes
    const { data: pack, error: packError } = await supabaseAdmin
      .from('credit_packs')
      .insert({
        user_id: user.id,
        credits_purchased: 500,
        credits_remaining: 500,
        price_paid_brl: 0.00, // Teste grátis
        stripe_payment_id: 'test_pack_' + Date.now(),
      })
      .select()
      .single();

    if (packError) {
      console.error('Erro ao criar pacote:', packError);
      process.exit(1);
    }

    console.log('✅ Pacote de 500 créditos criado:', pack.id);
    console.log('');
    console.log('🎉 Sucesso! Usuário agora tem créditos para testar.');
    console.log('');

    process.exit(0);

  } catch (err) {
    console.error('Erro:', err);
    process.exit(1);
  }
}

addTestCredits();
