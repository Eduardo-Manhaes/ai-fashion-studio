// Aplica a migration 007 para corrigir RLS
require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const fs = require('fs');
const { supabaseAdmin } = require('./middleware/auth');

async function applyMigration() {
  try {
    console.log('\n🔧 APLICANDO CORREÇÃO RLS\n');

    // Lê o arquivo SQL
    const sql = fs.readFileSync('./supabase/migrations/007_fix_rls_for_rpc.sql', 'utf8');

    // Remove comentários e divide em statements individuais
    const statements = sql
      .split('\n')
      .filter(line => !line.trim().startsWith('--') && line.trim() !== '')
      .join('\n')
      .split(';')
      .filter(stmt => stmt.trim() !== '');

    console.log(`📝 Executando ${statements.length} statements SQL...\n`);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i].trim();
      if (stmt === '') continue;

      console.log(`${i + 1}. Executando:`);
      console.log(`   ${stmt.substring(0, 80)}...`);

      const { error } = await supabaseAdmin.rpc('exec_sql', { sql_query: stmt + ';' });

      if (error) {
        // Tenta executar diretamente se exec_sql não existir
        console.log('   ⚠️  exec_sql não disponível, tentando método alternativo...');

        // Como não temos exec_sql, vamos usar uma abordagem diferente
        // Vamos executar via POST direto na API do Supabase
        const response = await fetch(
          `${process.env.SUPABASE_URL}/rest/v1/rpc/exec_sql`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify({ sql_query: stmt + ';' }),
          }
        );

        if (!response.ok) {
          console.log(`   ❌ Erro: ${response.status} ${response.statusText}`);

          // Vamos tentar uma abordagem manual: mostrar o SQL para o usuário executar
          console.log('\n⚠️  Não foi possível aplicar via API.');
          console.log('Por favor, execute manualmente no Supabase SQL Editor:\n');
          console.log('------------------------------------------------------------');
          console.log(sql);
          console.log('------------------------------------------------------------\n');
          process.exit(1);
        }
      }

      console.log('   ✅ Executado com sucesso');
    }

    console.log('\n🎉 Migration aplicada com sucesso!');
    console.log('\n🧪 Testando função debit_credits novamente...\n');

    // Testa novamente
    const { data: result, error: rpcError } = await supabaseAdmin.rpc('debit_credits', {
      p_user_id: '61bf7fb2-5e73-4d77-b66d-f91ff68fe454',
      p_generation_type: 'video_movement',
      p_job_id: '00000000-0000-0000-0000-000000000001',
    });

    if (rpcError) {
      console.log('❌ Erro no teste:', rpcError);
    } else if (!result.success) {
      console.log('❌ Ainda falhando:', result);
    } else {
      console.log('✅ SUCESSO! Débito funcionou:', result);

      // Reverte o teste
      await supabaseAdmin.rpc('refund_credits', {
        p_job_id: '00000000-0000-0000-0000-000000000001'
      });
      console.log('✅ Débito de teste revertido');
    }

    console.log('\n✨ Correção aplicada! Tente gerar vídeo novamente.\n');

  } catch (err) {
    console.error('\n❌ ERRO:', err.message);
    console.error(err.stack);
  }
}

applyMigration();
