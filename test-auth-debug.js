// Script de debug para testar autenticação
// Bypass SSL em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const supabaseAuth = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  { auth: { persistSession: false } }
);

async function testAuth() {
  console.log('\n🔍 TESTE DE AUTENTICAÇÃO\n');

  // Teste 1: Configuração
  console.log('1. Configuração Supabase:');
  console.log('   URL:', process.env.SUPABASE_URL?.substring(0, 30) + '...');
  console.log('   ANON_KEY:', process.env.SUPABASE_ANON_KEY?.substring(0, 30) + '...');
  console.log('   SERVICE_ROLE:', process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 30) + '...');

  // Teste 2: Token inválido
  console.log('\n2. Testando token inválido:');
  try {
    const { data, error } = await supabaseAuth.auth.getUser('fake-token-12345');
    console.log('   Resultado:', error ? `❌ ${error.message}` : '✅ OK (inesperado!)');
  } catch (err) {
    console.log('   Erro:', err.message);
  }

  // Teste 3: Sem token
  console.log('\n3. Testando sem token:');
  try {
    const { data, error } = await supabaseAuth.auth.getUser();
    console.log('   Resultado:', error ? `❌ ${error.message}` : '✅ OK (inesperado!)');
  } catch (err) {
    console.log('   Erro:', err.message);
  }

  // Teste 4: Login real
  console.log('\n4. Para testar token REAL, faça login no navegador e cole aqui:');
  console.log('   Execute no console (F12):');
  console.log('   const { data } = await supabase.auth.getSession();');
  console.log('   console.log(data.session.access_token);');
  console.log('\n   Depois rode este script passando o token:');
  console.log('   node test-auth-debug.js SEU_TOKEN_AQUI');

  if (process.argv[2]) {
    console.log('\n5. Testando token fornecido:');
    const token = process.argv[2];
    console.log('   Token (primeiros 50 chars):', token.substring(0, 50) + '...');

    try {
      const { data, error } = await supabaseAuth.auth.getUser(token);

      if (error) {
        console.log('   ❌ ERRO:', error.message);
        console.log('   Detalhe:', JSON.stringify(error, null, 2));
      } else if (data?.user) {
        console.log('   ✅ TOKEN VÁLIDO!');
        console.log('   User ID:', data.user.id);
        console.log('   Email:', data.user.email);
      } else {
        console.log('   ❌ Token retornou sucesso mas sem user');
      }
    } catch (err) {
      console.log('   ❌ EXCEÇÃO:', err.message);
      console.log('   Stack:', err.stack);
    }
  }

  console.log('\n✅ Teste concluído\n');
}

testAuth().catch(console.error);
