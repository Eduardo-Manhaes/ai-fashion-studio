// Script para tornar bucket público e gerar URLs públicas permanentes
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixVideos() {
  console.log('🔧 Corrigindo vídeos da landing page...\n');

  // 1. Buscar vídeos do banco
  const { data: videos, error } = await supabase
    .from('generation_jobs')
    .select('id, result_url, generation_type')
    .eq('status', 'completed')
    .in('generation_type', ['video_movement', 'video_talking'])
    .not('result_url', 'is', null)
    .order('created_at', { ascending: false })
    .limit(2);

  if (error) {
    console.error('❌ Erro ao buscar vídeos:', error.message);
    return;
  }

  console.log(`✅ Encontrados ${videos.length} vídeos\n`);

  // 2. Para cada vídeo, extrair o path e gerar URL pública
  for (const video of videos) {
    console.log(`📹 ${video.generation_type} (${video.id})`);
    console.log(`   URL atual: ${video.result_url.substring(0, 80)}...`);

    // Extrair path do storage
    const urlObj = new URL(video.result_url);
    const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/(?:sign\/)?(.+?)(?:\?|$)/);

    if (pathMatch) {
      const fullPath = pathMatch[1].replace('generations/', '');
      console.log(`   Path: ${fullPath}`);

      // Gerar URL pública (sem expiração)
      const { data: publicUrlData } = supabase.storage
        .from('generations')
        .getPublicUrl(fullPath);

      if (publicUrlData?.publicUrl) {
        console.log(`   ✅ URL pública: ${publicUrlData.publicUrl}\n`);
      } else {
        console.log(`   ⚠️  Bucket não é público - tentando signed URL (1 ano)...`);

        // Fallback: signed URL com 1 ano de validade
        const { data: signedData } = await supabase.storage
          .from('generations')
          .createSignedUrl(fullPath, 31536000); // 1 ano

        if (signedData?.signedUrl) {
          console.log(`   ✅ Signed URL (1 ano): ${signedData.signedUrl.substring(0, 80)}...\n`);
        }
      }
    }
  }

  console.log('\n💡 PRÓXIMOS PASSOS:');
  console.log('1. Se URLs públicas funcionaram → bucket é público ✅');
  console.log('2. Se só signed URLs → precisa tornar bucket público no Supabase Dashboard');
  console.log('3. Acesse: https://supabase.com/dashboard → Storage → generations → Settings → Public');
}

fixVideos().catch(console.error);
