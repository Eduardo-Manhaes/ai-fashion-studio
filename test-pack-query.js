// Testa a query que deveria encontrar o pacote
require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { supabaseAdmin } = require('./middleware/auth');

async function testQuery() {
  const userId = '61bf7fb2-5e73-4d77-b66d-f91ff68fe454';
  const cost = 5;

  console.log('\n🧪 TESTANDO QUERY DO PACOTE\n');
  console.log('User ID:', userId);
  console.log('Custo:', cost);
  console.log('');

  // Query exata que está na função RPC (linhas 102-109)
  const { data, error } = await supabaseAdmin
    .from('credit_packs')
    .select('*')
    .eq('user_id', userId)
    .gte('credits_remaining', cost)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order('purchased_at', { ascending: true })
    .limit(1);

  if (error) {
    console.error('❌ Erro na query:', error);
  } else if (!data || data.length === 0) {
    console.log('❌ Nenhum pacote encontrado!');
    console.log('');

    // Testar sem a condição de expires_at
    console.log('🔍 Testando SEM filtro de expires_at...');
    const { data: data2, error: error2 } = await supabaseAdmin
      .from('credit_packs')
      .select('*')
      .eq('user_id', userId)
      .gte('credits_remaining', cost)
      .order('purchased_at', { ascending: true })
      .limit(1);

    if (error2) {
      console.error('❌ Erro:', error2);
    } else if (!data2 || data2.length === 0) {
      console.log('❌ Ainda não encontrou!');

      // Teste mais básico
      console.log('');
      console.log('🔍 Testando apenas com user_id...');
      const { data: data3 } = await supabaseAdmin
        .from('credit_packs')
        .select('*')
        .eq('user_id', userId);

      console.log('Pacotes encontrados:', data3?.length || 0);
      if (data3 && data3.length > 0) {
        console.log('Primeiro pacote:', JSON.stringify(data3[0], null, 2));
      }
    } else {
      console.log('✅ Encontrou SEM filtro expires_at:', data2);
    }
  } else {
    console.log('✅ Pacote encontrado:', data);
  }

  console.log('\n');
}

testQuery();
