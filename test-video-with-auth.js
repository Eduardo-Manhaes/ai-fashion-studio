// Testa geração de vídeo com autenticação real
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function testVideoWithAuth() {
  console.log('\n🔐 TESTE COM AUTENTICAÇÃO REAL\n');

  // 1. Login via Supabase
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  console.log('1. Fazendo login no Supabase...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'eduardomanhaesmaciel@gmail.com',
    password: 'senha123' // Você pode precisar usar a senha correta
  });

  if (authError) {
    console.log('   ❌ Login falhou:', authError.message);
    console.log('   Tentando criar conta...');

    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: 'eduardomanhaesmaciel@gmail.com',
      password: 'senha123'
    });

    if (signupError) {
      console.log('   ❌ Signup falhou:', signupError.message);
      return;
    }

    console.log('   ✅ Conta criada! User ID:', signupData.user.id);
  } else {
    console.log('   ✅ Login OK! User ID:', authData.user.id);
  }

  const token = authData?.session?.access_token;

  if (!token) {
    console.log('   ❌ Sem token de acesso');
    return;
  }

  console.log('   Token:', token.substring(0, 50) + '...');
  console.log('');

  // 2. Testa /api/run-video
  console.log('2. Testando /api/run-video...');
  const videoRes = await fetch('http://localhost:3000/api/run-video', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      style: 'movement',
      inputs: {
        image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
        prompt: 'test video',
        aspect_ratio: '9:16'
      }
    })
  });

  console.log('   Status HTTP:', videoRes.status);

  const responseText = await videoRes.text();
  console.log('   Response:', responseText.substring(0, 500));
  console.log('');

  if (videoRes.status === 200) {
    const videoData = JSON.parse(responseText);
    console.log('✅ SUCESSO! Video ID:', videoData.id);
  } else {
    console.log('❌ ERRO!');
  }
}

testVideoWithAuth().catch(console.error);
