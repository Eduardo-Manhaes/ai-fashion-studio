require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkStructure() {
  const { data, error } = await supabase
    .from('preset_models')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Erro:', error);
    return;
  }

  if (data && data.length > 0) {
    console.log('Colunas disponíveis:');
    console.log(Object.keys(data[0]));
  } else {
    console.log('Tabela vazia, verificando com describe...');
  }
}

checkStructure();
