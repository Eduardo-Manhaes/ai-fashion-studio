// Abre o SQL Editor do Supabase e copia o SQL para área de transferência
require('dotenv').config();
const fs = require('fs');
const { exec } = require('child_process');

async function openSqlEditor() {
  console.log('\n🚀 ABRINDO SQL EDITOR DO SUPABASE\n');

  // Lê o SQL
  const sql = fs.readFileSync('./supabase/migrations/008_fix_debit_credits_rls.sql', 'utf8');

  // Extrai apenas as funções (remove comentários)
  const cleanSql = sql
    .split('\n')
    .filter(line => !line.trim().startsWith('--'))
    .join('\n')
    .trim();

  // Salva em um arquivo temporário para fácil cópia
  fs.writeFileSync('./COPIE-ESTE-SQL.sql', cleanSql);

  console.log('✅ SQL salvo em: COPIE-ESTE-SQL.sql\n');
  console.log('📋 PASSOS:');
  console.log('');
  console.log('1. Vou abrir o SQL Editor do Supabase no seu navegador');
  console.log('2. Copie o conteúdo do arquivo COPIE-ESTE-SQL.sql');
  console.log('3. Cole no SQL Editor');
  console.log('4. Clique em "Run" (ou Ctrl+Enter)');
  console.log('5. Aguarde "Success. No rows returned"');
  console.log('6. Volte aqui e digite: node test-final.js');
  console.log('');

  // Extrai project ref do SUPABASE_URL
  const supabaseUrl = process.env.SUPABASE_URL;
  const projectRef = supabaseUrl?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

  if (projectRef) {
    const sqlEditorUrl = `https://supabase.com/dashboard/project/${projectRef}/sql/new`;
    console.log(`🌐 Abrindo: ${sqlEditorUrl}\n`);

    // Abre o navegador
    const command = process.platform === 'win32' ? 'start' : 'open';
    exec(`${command} "${sqlEditorUrl}"`);
  } else {
    console.log('⚠️  Não foi possível extrair project ref.');
    console.log('   Abra manualmente: https://supabase.com/dashboard\n');
  }

  console.log('💡 Dica: O SQL está no arquivo COPIE-ESTE-SQL.sql');
  console.log('   Você pode abri-lo com: code COPIE-ESTE-SQL.sql');
  console.log('   Ou: notepad COPIE-ESTE-SQL.sql\n');
}

openSqlEditor();
