require('dotenv').config();

// Bypass SSL em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getLatestVideos() {
  console.log('🔍 Buscando os 2 vídeos mais recentes...\n');

  const { data, error } = await supabase
    .from('generation_jobs')
    .select('id, result_url, storage_path, generation_type, provider, created_at')
    .eq('status', 'completed')
    .in('generation_type', ['video_movement', 'video_talking'])
    .not('result_url', 'is', null)
    .order('created_at', { ascending: false })
    .limit(2);

  if (error) {
    console.error('❌ Erro ao buscar vídeos:', error);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.log('⚠️  Nenhum vídeo encontrado no banco.');
    process.exit(0);
  }

  console.log(`✅ Encontrados ${data.length} vídeo(s):\n`);

  data.forEach((video, i) => {
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`VÍDEO ${i + 1}:`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`ID: ${video.id}`);
    console.log(`Tipo: ${video.generation_type}`);
    console.log(`Provider: ${video.provider}`);
    console.log(`Criado em: ${video.created_at}`);
    console.log(`Storage Path: ${video.storage_path || 'N/A'}`);
    console.log(`\n📹 URL COMPLETA:`);
    console.log(video.result_url);
    console.log('\n');
  });

  return data;
}

getLatestVideos();
