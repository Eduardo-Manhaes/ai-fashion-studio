// Teste final após aplicar o SQL
require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { supabaseAdmin } = require('./middleware/auth');

async function testFinal() {
  console.log('\n🧪 TESTE FINAL\n');

  const userId = '61bf7fb2-5e73-4d77-b66d-f91ff68fe454';
  const testJobId = '00000000-0000-0000-0000-000000000055';

  console.log('Testando débito de 5 créditos (video_movement)...\n');

  const { data: result, error } = await supabaseAdmin.rpc('debit_credits', {
    p_user_id: userId,
    p_generation_type: 'video_movement',
    p_job_id: testJobId,
  });

  if (error) {
    console.error('❌ Erro RPC:', error);
    console.log('\n⚠️  A função ainda não foi atualizada ou houve erro no SQL.');
    console.log('Verifique se há mensagens de erro no SQL Editor do Supabase.\n');
    process.exit(1);
  }

  if (!result.success) {
    console.log('❌ Débito falhou:', JSON.stringify(result, null, 2));
    console.log('\n⚠️  A função ainda não está funcionando.');
    console.log('');
    console.log('VERIFIQUE:');
    console.log('1. O SQL foi executado sem erros no SQL Editor?');
    console.log('2. Apareceu "Success. No rows returned"?');
    console.log('3. Você executou AMBAS as funções (debit_credits e refund_credits)?');
    console.log('');
    process.exit(1);
  }

  console.log('✅ SUCESSO! Função corrigida!');
  console.log('');
  console.log('Resultado:', JSON.stringify(result, null, 2));
  console.log('');

  // Reverte o teste
  console.log('Revertendo teste...');
  await supabaseAdmin.rpc('refund_credits', { p_job_id: testJobId });
  console.log('✅ Revertido\n');

  console.log('🎉 PRONTO! Agora teste no navegador:');
  console.log('   http://localhost:3000');
  console.log('');
  console.log('O erro 402 não deve mais aparecer!\n');
}

testFinal();
