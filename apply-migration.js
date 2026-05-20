// apply-migration.js - Aplica migration 009_update_pricing.sql
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyMigration() {
  console.log('Aplicando migration 009_update_pricing.sql...\n');

  // Lê o arquivo SQL
  const sql = fs.readFileSync('supabase/migrations/009_update_pricing.sql', 'utf8');

  try {
    // Atualiza custos de geração
    console.log('1. Atualizando custos de crédito...');
    await supabase.from('generation_costs').update({ credits_cost: 2, description: 'Foto com IA (GPT Image 2 + Clarity)' }).eq('generation_type', 'photo');
    await supabase.from('generation_costs').update({ credits_cost: 8, description: 'Vídeo com movimento (Kling)' }).eq('generation_type', 'video_movement');
    await supabase.from('generation_costs').update({ credits_cost: 15, description: 'Vídeo com fala (Veo 3.1)' }).eq('generation_type', 'video_talking');
    console.log('   ✅ Custos atualizados: foto=2, vídeo movimento=8, vídeo falando=15');

    // Atualiza planos
    console.log('\n2. Atualizando planos...');

    // Atualiza o plano 'starter' (será 'basico')
    await supabase.from('plans').update({
      name: 'Básico',
      description: 'Ideal para começar — ~10 fotos ou 2 vídeos',
      monthly_quota_credits: 20,
      price_brl: 35.00,
      display_order: 1,
      stripe_price_id: 'price_1TZI7y2KyFcexK6NDYjNYVHg',
      features: ["20 créditos/mês", "~10 fotos ou 2 vídeos", "Suporte por e-mail"]
    }).eq('id', 'starter');

    // Atualiza o plano 'pro' (será 'starter')
    await supabase.from('plans').update({
      name: 'Starter',
      description: 'Para lojas em crescimento — ~25 fotos ou 6 vídeos',
      monthly_quota_credits: 50,
      price_brl: 79.00,
      display_order: 2,
      stripe_price_id: 'price_1TZI7y2KyFcexK6NEi3RWiHS',
      features: ["50 créditos/mês", "~25 fotos ou 6 vídeos", "Suporte WhatsApp"]
    }).eq('id', 'pro');

    // Atualiza o plano 'enterprise' (será 'pro')
    await supabase.from('plans').update({
      name: 'Pro',
      description: 'Volume profissional — ~60 fotos ou 15 vídeos',
      monthly_quota_credits: 120,
      price_brl: 159.00,
      display_order: 3,
      stripe_price_id: 'price_1TZI7z2KyFcexK6Nuh6jr52G',
      features: ["120 créditos/mês", "~60 fotos ou 15 vídeos", "Suporte dedicado"]
    }).eq('id', 'enterprise');

    console.log('   ✅ Planos criados:');
    console.log('      - Básico: R$ 35/mês (20 créditos)');
    console.log('      - Starter: R$ 79/mês (50 créditos)');
    console.log('      - Pro: R$ 159/mês (120 créditos)');

    // Verifica resultado
    console.log('\n3. Verificando mudanças...');
    const { data: costs } = await supabase.from('generation_costs').select('*');
    const { data: plans } = await supabase.from('plans').select('*').order('display_order');

    console.log('\n   Custos de geração:');
    costs.forEach(c => console.log(`      ${c.generation_type}: ${c.credits_cost} créditos`));

    console.log('\n   Planos disponíveis:');
    plans.forEach(p => console.log(`      ${p.name}: R$ ${p.price_brl}/mês (${p.monthly_quota_credits} créditos)`));

    console.log('\n✅ Migration aplicada com sucesso!');
  } catch (error) {
    console.error('\n❌ Erro ao aplicar migration:', error.message);
    process.exit(1);
  }
}

applyMigration();
