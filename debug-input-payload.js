// Debug: verifica input_payload da última foto gerada
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

async function debug() {
  console.log('🔍 Verificando última foto gerada...\n');

  const { data: jobs, error } = await supabase
    .from('generation_jobs')
    .select('id, generation_type, status, created_at, input_payload')
    .eq('generation_type', 'photo')
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('❌ Erro:', error.message);
    return;
  }

  if (!jobs || jobs.length === 0) {
    console.log('⚠️  Nenhuma foto completa encontrada.');
    return;
  }

  const job = jobs[0];
  console.log('📸 Última foto gerada:');
  console.log(`   ID: ${job.id}`);
  console.log(`   Data: ${new Date(job.created_at).toLocaleString('pt-BR')}`);
  console.log(`   Status: ${job.status}\n`);

  console.log('📦 input_payload:');

  if (!job.input_payload) {
    console.log('   ❌ NULL - não foi salvo!\n');
    console.log('💡 Possível causa:');
    console.log('   - Foto gerada antes do fix ser aplicado');
    console.log('   - Servidor não foi reiniciado após commit');
    return;
  }

  console.log('   ✅ Existe!\n');

  console.log('📋 Campos em inputs:');
  if (job.input_payload.inputs) {
    Object.keys(job.input_payload.inputs).forEach(key => {
      const value = job.input_payload.inputs[key];
      if (typeof value === 'string' && value.length > 100) {
        console.log(`   - ${key}: [string ${(value.length / 1024).toFixed(1)} KB]`);
      } else {
        console.log(`   - ${key}: ${JSON.stringify(value)}`);
      }
    });
  }
  console.log('');

  // Verifica se tem product_image
  const productImage = job.input_payload?.inputs?.product_image;

  if (!productImage) {
    console.log('❌ inputs.product_image NÃO ENCONTRADO\n');
    console.log('📋 Campos disponíveis em inputs:');
    if (job.input_payload.inputs) {
      console.log(Object.keys(job.input_payload.inputs).join(', '));
    } else {
      console.log('   inputs: undefined');
    }
  } else {
    const size = productImage.length;
    const isBase64 = productImage.startsWith('data:image');
    console.log('✅ inputs.product_image ENCONTRADO');
    console.log(`   Tamanho: ${(size / 1024).toFixed(1)} KB`);
    console.log(`   Base64: ${isBase64 ? '✅' : '❌'}`);
    console.log(`   Preview: ${productImage.substring(0, 50)}...`);
  }
}

debug().catch(console.error);
