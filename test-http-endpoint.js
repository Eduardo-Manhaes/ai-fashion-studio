// Testa o endpoint HTTP real /api/me/generations
require('dotenv').config();

// SSL fix
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const https = require('https');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function testHTTPEndpoint() {
  console.log('🧪 Testando endpoint HTTP /api/me/generations\n');

  // 1. Faz login para pegar JWT token
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'eduardomanhaesmaciel@gmail.com',
    password: process.env.TEST_USER_PASSWORD || 'senha123' // Coloque sua senha aqui ou no .env
  });

  if (authError) {
    console.error('❌ Erro no login:', authError.message);
    console.log('💡 Adicione TEST_USER_PASSWORD no .env ou modifique o script');
    return;
  }

  const token = authData.session.access_token;
  console.log('✅ Login OK\n');

  // 2. Faz requisição HTTP ao endpoint
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/me/generations',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    },
    rejectUnauthorized: false
  };

  console.log('📡 GET http://localhost:3000/api/me/generations\n');

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log(`✅ Status: ${res.statusCode}\n`);

      try {
        const json = JSON.parse(data);
        const firstGen = json.generations?.[0];

        if (!firstGen) {
          console.log('⚠️  Nenhuma geração retornada');
          return;
        }

        console.log('📸 Primeira geração:');
        console.log(`   ID: ${firstGen.id}`);
        console.log(`   Tipo: ${firstGen.generation_type}`);
        console.log(`   Status: ${firstGen.status}\n`);

        console.log('🔑 Campos retornados:');
        Object.keys(firstGen).forEach(key => {
          const value = firstGen[key];
          if (key === 'input_payload') {
            console.log(`   ✅ ${key}: ${value ? 'EXISTS' : 'NULL'}`);
            if (value) {
              console.log(`      - Tipo: ${typeof value}`);
              console.log(`      - Tem inputs: ${!!value.inputs}`);
              console.log(`      - Tem product_image: ${!!value.inputs?.product_image}`);
              if (value.inputs?.product_image) {
                console.log(`      - Tamanho product_image: ${(value.inputs.product_image.length / 1024).toFixed(1)} KB`);
              }
            }
          } else if (typeof value === 'string' && value.length > 50) {
            console.log(`   - ${key}: [string ${value.length} chars]`);
          } else {
            console.log(`   - ${key}: ${JSON.stringify(value)}`);
          }
        });

        console.log('\n✅ Teste concluído');
        process.exit(0);
      } catch (err) {
        console.error('❌ Erro parseando JSON:', err.message);
        console.log('Resposta:', data.substring(0, 500));
        process.exit(1);
      }
    });
  });

  req.on('error', (err) => {
    console.error('❌ Erro na requisição:', err.message);
    console.log('💡 Certifique-se de que o servidor está rodando em http://localhost:3000');
    process.exit(1);
  });

  req.end();
}

testHTTPEndpoint().catch(console.error);
