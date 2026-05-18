// collect-assets.js
require('dotenv').config();

// Bypass SSL para desenvolvimento (Windows)
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function collect() {
  // 1. Fotos das modelos preset
  const { data: models, error: modelsErr } = await supabase
    .from('preset_models')
    .select('slug, name, reference_url, thumbnail_url, ethnicity, body_type, age_group, gender')
    .eq('is_active', true)
    .order('sort_order');

  if (modelsErr) console.error('Erro modelos:', modelsErr);

  // 2. Fotos geradas concluídas (para galeria)
  const { data: photos, error: photosErr } = await supabase
    .from('generation_jobs')
    .select('id, result_url, storage_path, created_at, input_payload')
    .eq('status', 'completed')
    .eq('generation_type', 'photo')
    .not('result_url', 'is', null)
    .order('created_at', { ascending: false })
    .limit(10);

  if (photosErr) console.error('Erro fotos:', photosErr);

  // 3. Vídeos gerados concluídos
  const { data: videos, error: videosErr } = await supabase
    .from('generation_jobs')
    .select('id, result_url, storage_path, created_at, generation_type, provider')
    .eq('status', 'completed')
    .in('generation_type', ['video_movement', 'video_talking'])
    .not('result_url', 'is', null)
    .order('created_at', { ascending: false })
    .limit(4);

  if (videosErr) console.error('Erro vídeos:', videosErr);

  console.log('\n=== MODELOS PRESET ===');
  console.log(JSON.stringify(models?.map(m => ({
    name: m.name, slug: m.slug,
    ref: m.reference_url?.substring(0, 80),
    thumb: m.thumbnail_url?.substring(0, 80),
    ethnicity: m.ethnicity, body: m.body_type,
    age: m.age_group, gender: m.gender
  })), null, 2));

  console.log('\n=== FOTOS GERADAS ===');
  console.log(JSON.stringify(photos?.map(p => ({
    id: p.id,
    url: p.result_url?.substring(0, 100),
    date: p.created_at?.substring(0, 10)
  })), null, 2));

  console.log('\n=== VÍDEOS GERADOS ===');
  console.log(JSON.stringify(videos?.map(v => ({
    id: v.id,
    url: v.result_url?.substring(0, 100),
    type: v.generation_type,
    provider: v.provider,
    date: v.created_at?.substring(0, 10)
  })), null, 2));

  console.log('\nTOTAIS:');
  console.log('Modelos:', models?.length);
  console.log('Fotos:', photos?.length);
  console.log('Vídeos:', videos?.length);
}

collect().catch(console.error);
