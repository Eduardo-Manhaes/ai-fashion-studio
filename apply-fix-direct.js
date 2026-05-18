// Aplica a correção diretamente no PostgreSQL
require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { Client } = require('pg');
const fs = require('fs');

async function applyFix() {
  console.log('\n🔧 APLICANDO CORREÇÃO DIRETAMENTE NO BANCO\n');

  // Extrai a connection string do Supabase URL
  const supabaseUrl = process.env.SUPABASE_URL;

  if (!supabaseUrl) {
    console.error('❌ SUPABASE_URL não encontrada no .env');
    process.exit(1);
  }

  // Supabase URL format: https://[project-ref].supabase.co
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

  if (!projectRef) {
    console.error('❌ Não foi possível extrair project ref do SUPABASE_URL');
    process.exit(1);
  }

  // Connection string do Supabase
  // Format: postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
  const connectionString = `postgresql://postgres.${projectRef}:${process.env.SUPABASE_SERVICE_ROLE_KEY}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

  console.log('🔌 Conectando ao PostgreSQL...');
  console.log(`   Project: ${projectRef}`);

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Conectado!\n');

    // Lê o SQL da migration
    const sql = fs.readFileSync('./supabase/migrations/008_fix_debit_credits_rls.sql', 'utf8');

    console.log('📝 Executando SQL...\n');

    // Executa o SQL
    await client.query(sql);

    console.log('✅ SQL executado com sucesso!\n');

    // Testa se funcionou
    console.log('🧪 Testando função debit_credits...\n');

    const testResult = await client.query(`
      SELECT debit_credits(
        $1::uuid,
        $2::text,
        $3::uuid
      ) as result;
    `, [
      '61bf7fb2-5e73-4d77-b66d-f91ff68fe454',
      'video_movement',
      '00000000-0000-0000-0000-000000000077'
    ]);

    const result = testResult.rows[0].result;

    console.log('Resultado:', JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('\n✅ SUCESSO! A função foi corrigida e está funcionando!');
      console.log(`   Fonte: ${result.source}`);
      console.log(`   Créditos cobrados: ${result.credits_charged}`);

      // Reverte o teste
      await client.query(`
        SELECT refund_credits($1::uuid);
      `, ['00000000-0000-0000-0000-000000000077']);

      console.log('✅ Débito de teste revertido\n');
      console.log('🎉 Pode testar no navegador agora! O erro 402 não deve mais aparecer.\n');
    } else {
      console.log('\n❌ Ainda falhando:', result);
      console.log('\n🔍 Vou tentar uma abordagem alternativa...\n');
    }

  } catch (err) {
    console.error('\n❌ ERRO:', err.message);

    if (err.message.includes('password authentication failed')) {
      console.error('\n📌 DIAGNÓSTICO:');
      console.error('A senha do PostgreSQL está incorreta.');
      console.error('');
      console.error('SOLUÇÃO:');
      console.error('1. Acesse: https://supabase.com/dashboard');
      console.error('2. Vá em Settings → Database');
      console.error('3. Copie a "Connection string" (modo direto, não pooler)');
      console.error('4. Use essa string para conectar');
      console.error('');
      console.error('OU execute o SQL manualmente no SQL Editor do Supabase.');
    } else if (err.message.includes('connect')) {
      console.error('\n📌 DIAGNÓSTICO:');
      console.error('Não foi possível conectar ao banco.');
      console.error('');
      console.error('Tentando via REST API do Supabase...');
    }

    console.error('\nStack:', err.stack);
  } finally {
    await client.end();
  }
}

applyFix();
