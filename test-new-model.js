require('dotenv').config();

if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

async function testNewModel() {
  const BASE_URL = 'https://web-production-6ab20.up.railway.app';

  console.log('🧪 Testando se a nova modelo está disponível no frontend...\n');

  try {
    const res = await fetch(`${BASE_URL}/api/preset-models`);

    if (!res.ok) {
      console.error(`❌ Erro ${res.status}: ${res.statusText}`);
      return;
    }

    const data = await res.json();

    // Verifica se é array ou objeto com data
    const models = Array.isArray(data) ? data : (data.data || data.models || []);

    console.log(`✅ Total de modelos ativos: ${models.length}\n`);

    // Busca a nova modelo
    const newModel = models.find(m => m.slug === 'morena-labios-preenchidos');

    if (newModel) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🎉 NOVA MODELO ENCONTRADA!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`Nome: ${newModel.name}`);
      console.log(`Slug: ${newModel.slug}`);
      console.log(`ID: ${newModel.id}`);
      console.log(`Gênero: ${newModel.gender}`);
      console.log(`Etnia: ${newModel.ethnicity}`);
      console.log(`Ordem: ${newModel.sort_order}`);
      console.log(`Ativa: ${newModel.is_active}`);
      console.log(`\n🔗 URL da imagem:`);
      console.log(newModel.reference_url);
      console.log('\n✅ A nova modelo está disponível para os usuários!');
    } else {
      console.log('⚠️  Nova modelo não encontrada na API.');
      console.log('Modelos disponíveis:');
      models.forEach(m => console.log(`  - ${m.name} (${m.slug})`));
    }

  } catch (err) {
    console.error('❌ Erro ao testar:', err.message);
  }
}

testNewModel();
