// Testa se API /api/me/generations retorna input_payload
require('dotenv').config();

// SSL fix
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testAPI() {
  console.log('🧪 Testando query simulando /api/me/generations\n');

  // Simula a query exata do endpoint
  const { data: jobs, error } = await supabase
    .from('generation_jobs')
    .select('id, generation_type, provider, status, credits_cost, storage_path, result_url, created_at, completed_at, expires_at, input_payload')
    .eq('generation_type', 'photo')
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('❌ Erro:', error.message);
    return;
  }

  if (!jobs || jobs.length === 0) {
    console.log('⚠️  Nenhuma foto encontrada');
    return;
  }

  const job = jobs[0];

  console.log('📸 Último job retornado pela query:');
  console.log(`   ID: ${job.id}`);
  console.log(`   Data: ${new Date(job.created_at).toLocaleString('pt-BR')}\n`);

  console.log('🔑 Campos retornados:');
  Object.keys(job).forEach(key => {
    const value = job[key];
    if (key === 'input_payload') {
      console.log(`   ✅ ${key}: ${value ? 'EXISTS' : 'NULL'}`);
      if (value) {
        console.log(`      - Tipo: ${typeof value}`);
        console.log(`      - Tem inputs: ${!!value.inputs}`);
        console.log(`      - Tem product_image: ${!!value.inputs?.product_image}`);
      }
    } else if (typeof value === 'string' && value.length > 50) {
      console.log(`   - ${key}: [string ${value.length} chars]`);
    } else {
      console.log(`   - ${key}: ${JSON.stringify(value)}`);
    }
  });
}

testAPI().catch(console.error);
