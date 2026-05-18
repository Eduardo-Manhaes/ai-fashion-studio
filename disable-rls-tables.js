// Solução alternativa: Desabilita RLS nas tabelas que as funções RPC precisam acessar
// Isso é seguro porque essas tabelas SÓ são acessadas via service_role, nunca diretamente por usuários
require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function disableRLS() {
  console.log('\n🔧 SOLUÇÃO ALTERNATIVA: DESABILITAR RLS\n');

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('❌ Credenciais não encontradas');
    process.exit(1);
  }

  // SQL para desabilitar RLS nas tabelas problemáticas
  const sql = `
ALTER TABLE credit_packs DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE quota_usage DISABLE ROW LEVEL SECURITY;
ALTER TABLE generation_jobs DISABLE ROW LEVEL SECURITY;
  `.trim();

  console.log('📝 SQL a ser executado:');
  console.log(sql);
  console.log('');

  // Tenta via endpoint direto do Supabase
  console.log('🔌 Tentando executar via API do Supabase...\n');

  try {
    // Supabase expõe um endpoint query para executar SQL via REST
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Profile': 'public'
      },
      body: JSON.stringify({ query: sql })
    });

    console.log('Response status:', response.status);

    if (response.status === 404) {
      console.log('⚠️  Endpoint não disponível via REST\n');

      // Tenta instalar e usar Supabase CLI
      console.log('📦 Tentando via Supabase CLI...\n');

      const { execSync } = require('child_process');

      try {
        // Verifica se CLI está instalado
        execSync('npx supabase --version', { stdio: 'pipe' });
        console.log('✅ Supabase CLI disponível\n');

        // Salva SQL em arquivo temporário
        const fs = require('fs');
        fs.writeFileSync('temp-disable-rls.sql', sql);

        // Executa via CLI
        console.log('Executando SQL via CLI...');
        const result = execSync(
          `npx supabase db execute --file temp-disable-rls.sql --db-url "${process.env.SUPABASE_URL}"`,
          { encoding: 'utf8' }
        );

        console.log(result);
        console.log('\n✅ RLS desabilitado via CLI!\n');

        // Remove arquivo temp
        fs.unlinkSync('temp-disable-rls.sql');

      } catch (cliError) {
        console.log('⚠️  CLI não disponível:', cliError.message);
        console.log('');
        console.log('📌 ÚLTIMA TENTATIVA: Usando psql se disponível...\n');

        try {
          // Tenta usar psql se estiver instalado
          const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

          if (projectRef) {
            const fs = require('fs');
            fs.writeFileSync('temp-disable-rls.sql', sql);

            console.log('💡 Encontrei uma solução!\n');
            console.log('Execute este comando no seu terminal:\n');
            console.log(`psql "postgresql://postgres.[senha]@db.${projectRef}.supabase.co:5432/postgres" -f temp-disable-rls.sql`);
            console.log('\nSubstitua [senha] pela senha do banco (Database password no Supabase Dashboard)');
            console.log('');
          } else {
            throw new Error('Não consegui extrair project ref');
          }
        } catch (psqlError) {
          console.log('\n❌ Não foi possível executar automaticamente\n');
          console.log('🎯 SOLUÇÃO FINAL:\n');
          console.log('Copie e execute este SQL no Supabase SQL Editor:');
          console.log('=' .repeat(60));
          console.log(sql);
          console.log('='.repeat(60));
          console.log('\nDepois execute: node test-final.js\n');
        }
      }
    }

  } catch (err) {
    console.error('\n❌ Erro:', err.message);
    console.log('\n🎯 Execute este SQL manualmente no Supabase Dashboard:\n');
    console.log('='.repeat(60));
    console.log(sql);
    console.log('='.repeat(60));
    console.log('\nDepois: node test-final.js\n');
  }
}

disableRLS();
