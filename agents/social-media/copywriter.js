// agents/social-media/copywriter.js
// Subagente 2 — Roteirista
// Cria o conteúdo textual do post baseado no briefing do Estrategista

const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY,
});

async function write({ briefing, config }) {
  const pillarInfo = config.pillars[briefing.pillar];

  const systemPrompt = `Você é o Roteirista de Conteúdo do Modelo Fácil (@iamodelofacil).

CONTEXTO DA PLATAFORMA:
- SaaS brasileiro que gera fotos e vídeos profissionais de roupas com modelos de IA
- Público: lojistas do Brás, 44, centro de moda (pequenos e médios negócios)
- Problema: custo alto de fotografia (R$ 200-500 por produto)
- Solução: fotos com IA por fração do custo
- Site: https://www.modelofacil.ia.br

TOM DE VOZ:
${pillarInfo.tom}
- Brasileiro, conversacional, autêntico
- Evitar jargões técnicos ou marketês
- Usar linguagem do lojista real
- Emojis com moderação (1-2 por post)

FORMATO INSTAGRAM:
- Caption: 600-800 caracteres idealmente
- Primeira linha: gancho forte (aparece no feed)
- Quebras de linha para respiração
- CTA claro e direto
- Hashtags: 8-12, relevantes e estratégicas

SEU PAPEL:
Transformar o briefing estratégico em copy persuasiva que converte.`;

  const userPrompt = `BRIEFING ESTRATÉGICO:
Tema: ${briefing.theme}
Ângulo: ${briefing.angle}
Objetivo: ${briefing.objective}
Hook sugerido: ${briefing.hook}
CTA: ${briefing.cta}
Insights: ${briefing.insights.join(' | ')}

PILAR: ${briefing.pillar.toUpperCase()}
Tom esperado: ${pillarInfo.tom}

TAREFA:
Crie a copy completa para o post do Instagram. Retorne APENAS um JSON válido (sem markdown) com esta estrutura:

{
  "caption": "texto completo da caption com quebras de linha (use \\n), emojis moderados, gancho forte no início",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5", "hashtag6", "hashtag7", "hashtag8"],
  "firstLine": "primeira linha da caption (max 60 chars) - o que aparece no feed",
  "wordCount": número_de_palavras_na_caption
}

DIRETRIZES:
- Comece com o gancho do briefing ou algo ainda mais forte
- Use casos reais de lojistas (sem nomes, situações genéricas)
- Números concretos quando falar de custo/economia
- CTA claro e específico (não genérico)
- Hashtags mix: branded (#modelofacil), nicho (#fotografiamoda), alcance (#ecommerce)
- Máximo 2 emojis na caption principal
- Tom ${pillarInfo.tom}`;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      temperature: 0.9,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: userPrompt
      }]
    });

    const contentText = response.content[0].text.trim();
    const jsonText = contentText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const content = JSON.parse(jsonText);

    // Adicionar metadados
    content.briefing = briefing;
    content.pillar = briefing.pillar;
    content.date = new Date().toISOString();
    content.model = response.model;

    console.log('[COPYWRITER] Copy criada:', {
      firstLine: content.firstLine,
      wordCount: content.wordCount,
      hashtagCount: content.hashtags.length
    });

    return content;

  } catch (error) {
    console.error('[COPYWRITER] Erro ao criar copy:', error.message);

    // Fallback
    return {
      caption: `${briefing.hook}\n\n${briefing.angle}\n\n${briefing.cta}\n\nAcesse: modelofacil.ia.br`,
      hashtags: ['#modelofacil', '#fotografiamoda', '#ecommerce', '#lojista', '#moda'],
      firstLine: briefing.hook,
      wordCount: 50,
      briefing,
      pillar: briefing.pillar,
      date: new Date().toISOString(),
      fallback: true
    };
  }
}

module.exports = { write };
