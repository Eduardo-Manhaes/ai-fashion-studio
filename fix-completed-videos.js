// FORÇA ATUALIZAR VÍDEOS COMPLETADOS NO BANCO
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

async function fixVideos() {
  console.log('\n🔧 ATUALIZANDO VÍDEOS COMPLETADOS NO BANCO\n');

  const completedVideos = [
    {
      provider_job_id: '019e3157-9023-7281-ae38-0c32f3f35fbe',
      url: 'https://v3b.fal.media/files/b/0a9a7428/-H3TbLBsUcp0xXJI7WWDJ_output.mp4'
    },
    {
      provider_job_id: '019e3157-a9e2-78f0-a77d-a616503e197d',
      url: 'https://v3b.fal.media/files/b/0a9a742d/DZx5J9MiGK6PssYZM7Z-v_output.mp4'
    }
  ];

  for (const video of completedVideos) {
    console.log(`\n📹 Atualizando ${video.provider_job_id}...`);

    try {
      // Busca o job no banco
      const { data: jobs, error: findError } = await supabaseAdmin
        .from('generation_jobs')
        .select('*')
        .eq('provider_job_id', video.provider_job_id);

      if (findError) {
        console.log(`   ❌ Erro buscando: ${findError.message}`);
        continue;
      }

      if (!jobs || jobs.length === 0) {
        console.log(`   ⚠️  Job não encontrado no banco`);
        continue;
      }

      const job = jobs[0];
      console.log(`   ✅ Job encontrado: ${job.id}`);
      console.log(`   Status atual: ${job.status}`);

      if (job.status === 'completed') {
        console.log(`   ℹ️  Já está marcado como completed`);
        continue;
      }

      // Atualiza para completed
      const { error: updateError } = await supabaseAdmin
        .from('generation_jobs')
        .update({
          status: 'completed',
          result_url: video.url,
          completed_at: new Date().toISOString()
        })
        .eq('id', job.id);

      if (updateError) {
        console.log(`   ❌ Erro atualizando: ${updateError.message}`);
      } else {
        console.log(`   ✅ ATUALIZADO! Status: completed`);
        console.log(`   ✅ URL: ${video.url}`);
      }

    } catch (err) {
      console.log(`   ❌ Erro: ${err.message}`);
    }
  }

  console.log('\n✅ Atualização completa!');
  console.log('\n🎉 AGORA RECARREGUE A PÁGINA E VEJA OS VÍDEOS NA GALERIA!');
}

fixVideos();
