require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkData() {
  const { data } = await supabase
    .from('preset_models')
    .select('name, age_group, age_range')
    .limit(3);

  console.log('Exemplos existentes:');
  console.log(JSON.stringify(data, null, 2));
}

checkData();
