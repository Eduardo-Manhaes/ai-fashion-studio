require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Bypass SSL
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function insertPresetModel() {
  console.log('📤 Fazendo upload da imagem final para Supabase Storage...\n');

  // 1. Upload da imagem para storage permanente
  const localPath = path.join(__dirname, 'modelo-kontext-final.jpg');
  const buffer = fs.readFileSync(localPath);
  const fileName = `preset-models/morena-labios-preenchidos-${Date.now()}.jpg`;

  const { error: uploadError } = await supabase.storage
    .from('generations')
    .upload(fileName, buffer, {
      contentType: 'image/jpeg',
      cacheControl: '31536000', // 1 ano
      upsert: false
    });

  if (uploadError) {
    console.error('❌ Erro no upload:', uploadError);
    return;
  }

  const { data: urlData } = supabase.storage
    .from('generations')
    .getPublicUrl(fileName);

  const imageUrl = urlData.publicUrl;
  console.log('✅ Upload concluído:', imageUrl);

  // 2. Buscar o próximo sort_order
  const { data: existingModels } = await supabase
    .from('preset_models')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1);

  const nextSortOrder = existingModels && existingModels.length > 0
    ? existingModels[0].sort_order + 1
    : 1;

  // 3. Inserir na tabela preset_models
  console.log('\n💾 Cadastrando modelo preset no banco...\n');

  const modelData = {
    name: 'Morena Lábios Preenchidos',
    slug: 'morena-labios-preenchidos',
    reference_url: imageUrl,
    thumbnail_url: imageUrl,
    ethnicity: 'morena',
    body_type: 'slim',
    age_group: 'young',
    age_range: '20-30',
    gender: 'female',
    is_active: true,
    sort_order: nextSortOrder
  };

  const { data: insertedModel, error: insertError } = await supabase
    .from('preset_models')
    .insert(modelData)
    .select()
    .single();

  if (insertError) {
    console.error('❌ Erro ao inserir:', insertError);
    return;
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ MODELO CADASTRADA COM SUCESSO!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📋 Dados cadastrados:');
  console.log(JSON.stringify(insertedModel, null, 2));
  console.log('\n🔗 URL da imagem:', imageUrl);
  console.log('🆔 ID da modelo:', insertedModel.id);
  console.log('📊 Sort order:', insertedModel.sort_order);
  console.log('\n✨ A nova modelo já está disponível na plataforma!');
}

insertPresetModel().catch(console.error);
