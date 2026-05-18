// Aplica correção via REST API do Supabase (sem precisar de pg)
require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const fs = require('fs');

async function applyFixViaRest() {
  console.log('\n🔧 APLICANDO CORREÇÃO VIA REST API\n');

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não encontrados');
    process.exit(1);
  }

  // Lê o SQL
  const fullSql = fs.readFileSync('./supabase/migrations/008_fix_debit_credits_rls.sql', 'utf8');

  // Extrai apenas as duas funções CREATE OR REPLACE
  const functions = fullSql.match(/CREATE OR REPLACE FUNCTION[\s\S]+?\$\$;/g);

  if (!functions || functions.length < 2) {
    console.error('❌ Não foi possível extrair as funções do SQL');
    process.exit(1);
  }

  console.log(`📝 Encontradas ${functions.length} funções para atualizar\n`);

  // Tenta executar via query SQL no Supabase
  for (let i = 0; i < functions.length; i++) {
    const func = functions[i];
    const funcName = func.match(/FUNCTION\s+(\w+)/)?.[1] || `função ${i + 1}`;

    console.log(`${i + 1}. Atualizando ${funcName}...`);

    try {
      // Usa o endpoint de query SQL do Supabase
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ query: func })
      });

      if (!response.ok) {
        console.log(`   ⚠️  Endpoint /rpc/exec não disponível (${response.status})`);
        console.log('   Tentando abordagem alternativa...\n');
        break;
      }

      console.log('   ✅ Atualizada');
    } catch (err) {
      console.log(`   ❌ Erro: ${err.message}`);
    }
  }

  // Abordagem alternativa: usar o supabaseAdmin diretamente
  console.log('\n📌 Usando método alternativo: Supabase Admin Client\n');

  const { supabaseAdmin } = require('./middleware/auth');

  // Executa cada função separadamente
  for (let i = 0; i < functions.length; i++) {
    const func = functions[i];
    const funcName = func.match(/FUNCTION\s+(\w+)/)?.[1] || `função ${i + 1}`;

    console.log(`${i + 1}. Executando ${funcName}...`);

    try {
      // Tenta via query direta (se disponível)
      const { error } = await supabaseAdmin.rpc('exec', { sql: func });

      if (error && error.code === '42883') {
        // Função exec não existe, vamos tentar outra abordagem
        console.log('   ⚠️  RPC exec não disponível');
        console.log('');
        console.log('📋 SOLUÇÃO MANUAL NECESSÁRIA');
        console.log('');
        console.log('Copie e execute este SQL no Supabase SQL Editor:');
        console.log('='.repeat(60));
        console.log(fullSql);
        console.log('='.repeat(60));
        console.log('');
        console.log('Link direto: https://supabase.com/dashboard/project/_/sql/new');
        console.log('');
        process.exit(1);
      }

      if (error) {
        throw error;
      }

      console.log('   ✅ Executada');
    } catch (err) {
      console.error(`   ❌ Erro: ${err.message}`);
    }
  }

  // Testa se funcionou
  console.log('\n🧪 Testando função corrigida...\n');

  const { data: result, error } = await supabaseAdmin.rpc('debit_credits', {
    p_user_id: '61bf7fb2-5e73-4d77-b66d-f91ff68fe454',
    p_generation_type: 'video_movement',
    p_job_id: '00000000-0000-0000-0000-000000000066',
  });

  if (error) {
    console.error('❌ Erro no teste:', error);
  } else if (!result.success) {
    console.log('❌ Teste falhou:', result);
    console.log('\n⚠️  A função ainda não foi atualizada.');
    console.log('Por favor, execute o SQL manualmente no Supabase Dashboard.');
  } else {
    console.log('✅ SUCESSO! Função corrigida:', result);

    // Reverte
    await supabaseAdmin.rpc('refund_credits', {
      p_job_id: '00000000-0000-0000-0000-000000000066'
    });

    console.log('✅ Teste revertido\n');
    console.log('🎉 Correção aplicada! Teste no navegador agora.\n');
  }
}

applyFixViaRest();
