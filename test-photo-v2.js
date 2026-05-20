require('dotenv').config();

// Bypass SSL
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

async function test() {
  const BASE_URL = 'https://web-production-6ab20.up.railway.app';

  console.log('🧪 Testando /api/run-photo-v2 no Railway...\n');

  try {
    const res = await fetch(`${BASE_URL}/api/run-photo-v2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fake-token-for-test'
      },
      body: JSON.stringify({
        inputs: {
          model_image: 'https://test.com/img.jpg',
          product_image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
        }
      })
    });

    console.log('Status:', res.status);
    console.log('Status Text:', res.statusText);
    console.log('\nHeaders:');
    for (const [key, value] of res.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }

    const contentType = res.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
      console.log('\nResponse Body (JSON):');
      console.log(JSON.stringify(data, null, 2));
    } else {
      data = await res.text();
      console.log('\nResponse Body (Text):');
      console.log(data.substring(0, 500));
    }

  } catch (err) {
    console.error('❌ Erro na requisição:', err.message);
    console.error('Stack:', err.stack);
  }
}

test();
