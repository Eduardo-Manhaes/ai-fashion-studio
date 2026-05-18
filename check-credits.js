// Script para verificar créditos do usuário
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkCredits() {
  console.log('\n💰 VERIFICANDO CRÉDITOS\n');

  // Lista todos os usuários
  const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

  if (usersError) {
    console.error('Erro listando usuários:', usersError);
    return;
  }

  console.log(`📋 Total de usuários: ${users.users.length}\n`);

  for (const user of users.users) {
    console.log(`👤 Usuário: ${user.email}`);
    console.log(`   ID: ${user.id}\n`);

    // Verifica assinatura ativa
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('*, plans(*)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (subscription) {
      console.log('   ✅ Assinatura ATIVA:');
      console.log(`      Plano: ${subscription.plans?.name || 'N/A'}`);
      console.log(`      Quota mensal: ${subscription.plans?.quota_credits || 0} créditos`);

      // Verifica uso da quota
      const { data: usage } = await supabaseAdmin
        .from('quota_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('period_start', subscription.current_period_start)
        .maybeSingle();

      if (usage) {
        const remaining = subscription.plans?.quota_credits - usage.credits_used;
        console.log(`      Usado: ${usage.credits_used} créditos`);
        console.log(`      Restante: ${remaining} créditos`);
      } else {
        console.log(`      Uso atual: 0 créditos (período novo)`);
      }
    } else {
      console.log('   ❌ SEM assinatura ativa');
    }

    // Verifica pacotes de créditos
    const { data: packs } = await supabaseAdmin
      .from('credit_packs')
      .select('*')
      .eq('user_id', user.id)
      .gt('credits_remaining', 0);

    if (packs && packs.length > 0) {
      console.log('\n   💎 Pacotes de créditos:');
      packs.forEach(pack => {
        console.log(`      - ${pack.credits_remaining} créditos restantes (Total: ${pack.credits_total})`);
      });
    } else {
      console.log('\n   ❌ SEM pacotes de créditos');
    }

    console.log('\n' + '─'.repeat(60) + '\n');
  }
}

checkCredits().catch(console.error);
