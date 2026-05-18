// Verifica se as policies foram aplicadas corretamente
require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { supabaseAdmin } = require('./middleware/auth');

async function verifyPolicies() {
  console.log('\n🔍 VERIFICANDO POLICIES RLS\n');

  // 1. Verificar se as policies existem
  const { data: policies, error: policiesError } = await supabaseAdmin
    .from('pg_policies')
    .select('*')
    .in('tablename', ['credit_packs', 'subscriptions', 'quota_usage', 'generation_jobs'])
    .like('policyname', '%service_role%');

  console.log('📋 POLICIES ENCONTRADAS:');
  if (policiesError) {
    console.error('❌ Erro:', policiesError);
  } else if (!policies || policies.length === 0) {
    console.log('❌ Nenhuma policy service_role encontrada!');
    console.log('');
    console.log('As policies NÃO foram aplicadas corretamente.');
    console.log('Por favor, verifique se há algum erro no SQL Editor.');
  } else {
    console.log(`✅ ${policies.length} policies encontradas:`);
    policies.forEach(p => {
      console.log(`   - ${p.tablename}: ${p.policyname}`);
    });
  }
  console.log('');

  // 2. Testar acesso direto via service_role
  console.log('🧪 TESTANDO ACESSO DIRETO VIA SERVICE_ROLE:\n');

  const userId = '61bf7fb2-5e73-4d77-b66d-f91ff68fe454';

  const { data: packs, error: packsError } = await supabaseAdmin
    .from('credit_packs')
    .select('*')
    .eq('user_id', userId);

  console.log('📦 Acesso a credit_packs via supabaseAdmin:');
  if (packsError) {
    console.error('   ❌ Erro:', packsError);
  } else {
    console.log(`   ✅ ${packs.length} pacote(s) encontrado(s)`);
    if (packs.length > 0) {
      console.log(`   💰 Créditos: ${packs[0].credits_remaining}`);
    }
  }
  console.log('');

  // 3. Testar a função debit_credits novamente
  console.log('🧪 TESTANDO FUNÇÃO debit_credits:\n');

  const testJobId = '00000000-0000-0000-0000-' + Date.now().toString().slice(-12).padStart(12, '0');

  const { data: result, error: rpcError } = await supabaseAdmin
    .rpc('debit_credits', {
      p_user_id: userId,
      p_generation_type: 'video_movement',
      p_job_id: testJobId,
    });

  if (rpcError) {
    console.log('❌ Erro RPC:', rpcError);
    console.log('');
    console.log('DIAGNÓSTICO:');
    console.log('A função RPC ainda não consegue acessar as tabelas.');
    console.log('');
    console.log('POSSÍVEIS CAUSAS:');
    console.log('1. As policies usam auth.jwt() que pode não funcionar em funções SECURITY DEFINER');
    console.log('2. O cache do PostgREST precisa ser recarregado');
    console.log('3. A abordagem das policies precisa ser diferente');
    console.log('');
    console.log('SOLUÇÃO ALTERNATIVA: Vou modificar a função RPC para desabilitar RLS internamente.');
  } else if (!result.success) {
    console.log('❌ Débito falhou:', result);
    console.log('');
    console.log('Erro:', result.error);
    console.log('Custo necessário:', result.cost_required);
    console.log('');
    console.log('DIAGNÓSTICO:');
    console.log('As policies podem não estar funcionando dentro da função RPC.');
    console.log('Vou criar uma correção alternativa.');
  } else {
    console.log('✅ SUCESSO! Débito funcionou:', result);
    console.log('');
    console.log('Revertendo teste...');
    await supabaseAdmin.rpc('refund_credits', { p_job_id: testJobId });
    console.log('✅ Teste revertido');
    console.log('');
    console.log('🎉 O sistema está funcionando! Tente gerar vídeo novamente.');
  }

  console.log('\n');
}

verifyPolicies();
