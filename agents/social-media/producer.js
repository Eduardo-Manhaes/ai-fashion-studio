// agents/social-media/producer.js
// Subagente 3 — Produtor
// Cria o visual do post (imagem ou vídeo) usando as APIs disponíveis

const Anthropic = require('@anthropic-ai/sdk');
const fetch = require('node-fetch');
const fs = require('fs').promises;
const path = require('path');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY,
});

async function create({ briefing, content, config }) {
  // Criar pasta para armazenar as imagens se não existir
  const imagesDir = path.join(process.cwd(), 'public', 'generated-posts');
  await fs.mkdir(imagesDir, { recursive: true });

  // Usar Claude para criar prompt otimizado para geração de imagem
  const imagePrompt = await generateImagePrompt({ briefing, content });

  // Gerar imagem usando OpenAI DALL-E 3
  const visual = await generateImage(imagePrompt, imagesDir);

  console.log('[PRODUCER] Visual criado:', visual.path);

  return {
    type: visual.type,
    url: visual.url,
    path: visual.path,
    prompt: imagePrompt,
    briefing: briefing,
    date: new Date().toISOString()
  };
}

async function generateImagePrompt({ briefing, content }) {
  const systemPrompt = `Você é o Diretor de Arte do Modelo Fácil. Seu trabalho é criar prompts para geração de imagens que representem visualmente o conteúdo dos posts.

CONTEXTO:
- Plataforma: Modelo Fácil (gera fotos de roupas com modelos de IA)
- Público: lojistas brasileiros
- Estética: profissional, moderna, fashion, brasileira

IMPORTANTE:
- A imagem deve reforçar a mensagem do post
- Estilo fotográfico profissional, não ilustração
- Modelos diversos (brasileiro, inclusivo)
- Roupas em destaque
- Iluminação profissional
- Fundo limpo ou cenário de e-commerce`;

  const userPrompt = `BRIEFING:
Tema: ${briefing.theme}
Ângulo: ${briefing.angle}
Pilar: ${briefing.pillar}

COPY DO POST (primeira linha):
${content.firstLine}

TAREFA:
Crie um prompt conciso (max 200 chars) para DALL-E 3 gerar a imagem deste post. Retorne APENAS o texto do prompt, sem JSON, sem explicações.

DIRETRIZES:
- Estilo: "professional fashion photography"
- Foco: roupa + modelo + cenário
- Tom: moderno, clean, brasileiro
- Evitar texto na imagem
- Composição para Instagram (quadrado ou 4:5)`;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 256,
      temperature: 0.7,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: userPrompt
      }]
    });

    return response.content[0].text.trim();

  } catch (error) {
    console.error('[PRODUCER] Erro ao gerar prompt:', error.message);
    return `Professional fashion photography of Brazilian model wearing modern clothing, clean background, e-commerce style, high quality lighting`;
  }
}

async function generateImage(prompt, outputDir) {
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!openaiKey) {
    console.warn('[PRODUCER] OPENAI_API_KEY não encontrada, usando placeholder');
    return {
      type: 'image',
      url: 'https://placehold.co/1080x1080/png?text=Modelo+Facil',
      path: 'placeholder.png'
    };
  }

  try {
    // Gerar imagem com DALL-E 3
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        style: 'natural'
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const imageUrl = data.data[0].url;

    // Download da imagem
    const imageResponse = await fetch(imageUrl);
    const buffer = await imageResponse.buffer();

    // Salvar localmente
    const filename = `post-${Date.now()}.png`;
    const filepath = path.join(outputDir, filename);
    await fs.writeFile(filepath, buffer);

    console.log('[PRODUCER] Imagem gerada e salva:', filename);

    return {
      type: 'image',
      url: imageUrl,
      path: filepath,
      filename: filename
    };

  } catch (error) {
    console.error('[PRODUCER] Erro ao gerar imagem:', error.message);

    // Fallback: placeholder
    return {
      type: 'image',
      url: 'https://placehold.co/1080x1080/png?text=Modelo+Facil',
      path: 'placeholder.png',
      error: error.message
    };
  }
}

module.exports = { create };
