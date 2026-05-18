// Verifica o código fonte da função no banco
require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { supabaseAdmin } = require('./middleware/auth');

async function checkFunction() {
  console.log('\n🔍 VERIFICANDO CÓDIGO DA FUNÇÃO debit_credits\n');

  // Query para ver o código fonte da função
  const { data, error } = await supabaseAdmin
    .rpc('exec_sql', {
      sql_query: `
        SELECT pg_get_functiondef('debit_credits(uuid, text, uuid)'::regprocedure);
      `
    })
    .single();

  if (error) {
    console.log('⚠️  Não conseguiu via exec_sql, tentando alternativa...\n');

    // Testa se a função tem SET LOCAL row_security = off
    // Fazemos isso tentando executar e vendo se funciona
    console.log('🧪 Teste direto: vou criar um pacote com 1000 créditos e testar\n');

    const userId = '61bf7fb2-5e73-4d77-b66d-f91ff68fe454';

    // Cria um pacote gigante de teste
    const { data: newPack, error: packError } = await supabaseAdmin
      .from('credit_packs')
      .insert({
        user_id: userId,
        credits_purchased: 1000,
        credits_remaining: 1000,
        price_paid_brl: 0.00,
        stripe_payment_id: 'debug_pack_' + Date.now(),
      })
      .select()
      .single();

    if (packError) {
      console.error('❌ Erro ao criar pacote:', packError);
    } else {
      console.log('✅ Pacote de teste criado:', newPack.id);
      console.log('   Créditos: 1000\n');

      // Agora testa debit_credits
      const testJobId = '00000000-0000-0000-0000-' + Date.now().toString().slice(-12).padStart(12, '0');

      const { data: result, error: rpcError } = await supabaseAdmin
        .rpc('debit_credits', {
          p_user_id: userId,
          p_generation_type: 'video_movement',
          p_job_id: testJobId,
        });

      if (rpcError) {
        console.log('❌ Erro RPC:', rpcError);
      } else if (!result.success) {
        console.log('❌ Ainda falhando:', result);
        console.log('\n📌 DIAGNÓSTICO:');
        console.log('A função NÃO foi atualizada no banco.');
        console.log('');
        console.log('POSSÍVEIS CAUSAS:');
        console.log('1. Houve erro ao executar o SQL (verifique no SQL Editor)');
        console.log('2. Você executou em um projeto diferente');
        console.log('3. O SQL foi executado mas deu erro silencioso');
        console.log('');
        console.log('PRÓXIMO PASSO:');
        console.log('Vou criar um script que mostra exatamente o que fazer.');
      } else {
        console.log('✅ SUCESSO! A função foi atualizada e funcionou:', result);

        // Reverte
        await supabaseAdmin.rpc('refund_credits', { p_job_id: testJobId });
        console.log('✅ Débito revertido');
      }

      // Remove o pacote de teste
      await supabaseAdmin
        .from('credit_packs')
        .delete()
        .eq('id', newPack.id);
      console.log('✅ Pacote de teste removido\n');
    }
  } else {
    console.log('Código fonte:');
    console.log(data);
  }
}

checkFunction();
