// Script para corrigir créditos dos planos
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixPlans() {
  console.log('\n🔧 CORRIGINDO CRÉDITOS DOS PLANOS\n');

  // 1. Atualiza os planos com os créditos corretos
  const plansToFix = [
    { name: 'Starter', quota_credits: 50 },
    { name: 'Pro', quota_credits: 200 },
    { name: 'Premium', quota_credits: 500 },
    { name: 'Enterprise', quota_credits: 500 },
  ];

  for (const plan of plansToFix) {
    const { data, error } = await supabaseAdmin
      .from('plans')
      .update({ quota_credits: plan.quota_credits })
      .eq('name', plan.name)
      .select();

    if (error) {
      console.error(`❌ Erro atualizando ${plan.name}:`, error.message);
    } else if (data && data.length > 0) {
      console.log(`✅ ${plan.name}: ${plan.quota_credits} créditos configurados`);
    } else {
      console.log(`⚠️  ${plan.name}: não encontrado no banco`);
    }
  }

  console.log('\n📊 Verificando planos atualizados:\n');

  const { data: plans } = await supabaseAdmin
    .from('plans')
    .select('*')
    .order('display_order');

  plans?.forEach(plan => {
    console.log(`   ${plan.name}: ${plan.quota_credits} créditos/mês`);
  });

  console.log('\n✅ Correção concluída!\n');
}

fixPlans().catch(console.error);
