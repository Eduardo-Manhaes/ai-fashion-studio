// Inspeciona estrutura das tabelas
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspectSchema() {
  console.log('\n🔍 INSPECIONANDO SCHEMA\n');

  // Busca um plano para ver as colunas
  const { data: plans } = await supabaseAdmin
    .from('plans')
    .select('*')
    .limit(1);

  console.log('📋 Colunas da tabela PLANS:');
  if (plans && plans[0]) {
    Object.keys(plans[0]).forEach(col => {
      console.log(`   - ${col}: ${typeof plans[0][col]} = ${plans[0][col]}`);
    });
  }

  // Busca uma subscription para ver as colunas
  const { data: subs } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .limit(1);

  console.log('\n📋 Colunas da tabela SUBSCRIPTIONS:');
  if (subs && subs[0]) {
    Object.keys(subs[0]).forEach(col => {
      console.log(`   - ${col}: ${typeof subs[0][col]} = ${JSON.stringify(subs[0][col]).substring(0, 50)}`);
    });
  }

  // Busca um credit pack para ver as colunas
  const { data: packs } = await supabaseAdmin
    .from('credit_packs')
    .select('*')
    .limit(1);

  console.log('\n📋 Colunas da tabela CREDIT_PACKS:');
  if (packs && packs[0]) {
    Object.keys(packs[0]).forEach(col => {
      console.log(`   - ${col}: ${typeof packs[0][col]} = ${JSON.stringify(packs[0][col]).substring(0, 50)}`);
    });
  }
}

inspectSchema().catch(console.error);
