// Script para debugar créditos do usuário
require('dotenv').config();

// Desabilita verificação SSL em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const { supabaseAdmin } = require('./middleware/auth');

async function debugCredits() {
  try {
    const email = 'eduardomanhaesmaciel@gmail.com';

    // 1. Buscar usuário
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
      console.error('❌ Usuário não encontrado');
      process.exit(1);
    }

    console.log('\n═══════════════════════════════════════════════════');
    console.log('📊 DEBUG DE CRÉDITOS');
    console.log('═══════════════════════════════════════════════════\n');
    console.log('👤 Usuário:', user.email);
    console.log('🆔 ID:', user.id);
    console.log('');

    // 2. Verificar assinatura ativa
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('*, plans(*)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    console.log('📋 ASSINATURA:');
    if (subError) {
      console.error('   ❌ Erro:', subError);
    } else if (!subscription) {
      console.log('   ❌ Nenhuma assinatura ativa encontrada');
    } else {
      console.log('   ✅ Status:', subscription.status);
      console.log('   📦 Plano:', subscription.plans.name);
      console.log('   💳 ID:', subscription.id);
      console.log('   📅 Período:', subscription.current_period_start, '→', subscription.current_period_end);
    }
    console.log('');

    // 3. Verificar quota do período atual
    if (subscription) {
      const { data: quota, error: quotaError } = await supabaseAdmin
        .from('quota_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('subscription_id', subscription.id)
        .maybeSingle();

      console.log('📊 QUOTA DO PERÍODO:');
      if (quotaError) {
        console.error('   ❌ Erro:', quotaError);
      } else if (!quota) {
        console.log('   ⚠️  Nenhuma quota encontrada para o período atual');
      } else {
        console.log('   💰 Limite:', quota.credits_limit);
        console.log('   📉 Usado:', quota.credits_used);
        console.log('   ✅ Disponível:', quota.credits_limit - quota.credits_used);
        console.log('   📅 Período:', quota.period_start, '→', quota.period_end);
      }
      console.log('');
    }

    // 4. Verificar pacotes de créditos
    const { data: packs, error: packsError } = await supabaseAdmin
      .from('credit_packs')
      .select('*')
      .eq('user_id', user.id)
      .gt('credits_remaining', 0);

    console.log('🎁 PACOTES DE CRÉDITOS:');
    if (packsError) {
      console.error('   ❌ Erro:', packsError);
    } else if (!packs || packs.length === 0) {
      console.log('   ⚠️  Nenhum pacote com créditos disponível');
    } else {
      console.log('   📦 Total de pacotes:', packs.length);
      packs.forEach((pack, i) => {
        console.log(`   ${i + 1}. ID: ${pack.id}`);
        console.log(`      Comprados: ${pack.credits_purchased}`);
        console.log(`      Restantes: ${pack.credits_remaining}`);
        console.log(`      Data: ${pack.purchased_at}`);
      });
      const totalPackCredits = packs.reduce((sum, p) => sum + p.credits_remaining, 0);
      console.log('   💰 Total de créditos em pacotes:', totalPackCredits);
    }
    console.log('');

    // 5. Verificar custos de geração
    const { data: costs } = await supabaseAdmin
      .from('generation_costs')
      .select('*')
      .order('credits_cost');

    console.log('💵 CUSTOS DE GERAÇÃO:');
    costs.forEach(cost => {
      console.log(`   ${cost.generation_type}: ${cost.credits_cost} créditos - ${cost.description}`);
    });
    console.log('');

    // 6. Tentar simular débito (sem realmente debitar)
    console.log('🧪 TESTANDO FUNÇÃO debit_credits:');
    console.log('   Tentando debitar 5 créditos (video_movement)...');

    const { data: result, error: rpcError } = await supabaseAdmin
      .rpc('debit_credits', {
        p_user_id: user.id,
        p_generation_type: 'video_movement',
        p_job_id: '00000000-0000-0000-0000-000000000000', // job fake para teste
      });

    if (rpcError) {
      console.log('   ❌ Erro RPC:', rpcError);
      console.log('   Detalhes:', JSON.stringify(rpcError, null, 2));
    } else {
      console.log('   Resultado:', JSON.stringify(result, null, 2));

      if (!result.success) {
        console.log('   ❌ Débito falhou:', result.error);
        console.log('   Custo necessário:', result.cost_required);
        console.log('   Quota disponível:', result.quota_available);
        console.log('   Pacote disponível:', result.pack_available);
      } else {
        console.log('   ✅ Débito bem-sucedido!');
        console.log('   Créditos cobrados:', result.credits_charged);
        console.log('   Fonte:', result.source);

        // Reverter o débito de teste
        console.log('   🔄 Revertendo débito de teste...');
        await supabaseAdmin.rpc('refund_credits', {
          p_job_id: '00000000-0000-0000-0000-000000000000'
        });
        console.log('   ✅ Revertido');
      }
    }

    console.log('\n═══════════════════════════════════════════════════\n');

  } catch (err) {
    console.error('\n❌ ERRO:', err);
    console.error(err.stack);
  }
}

debugCredits();
