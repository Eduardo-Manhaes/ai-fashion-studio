// agents/social-media/strategist.js
// Subagente 1 — Estrategista
// Analisa o pilar do dia e define briefing estratégico para o post

const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY,
});

async function analyze({ pillar, config }) {
  const pillarInfo = config.pillars[pillar];
  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const systemPrompt = `Você é o Estrategista de Conteúdo do Modelo Fácil, uma plataforma brasileira que gera fotos e vídeos profissionais de roupas com modelos de IA para lojistas.

CONTEXTO DA PLATAFORMA:
- Nome: Modelo Fácil (@iamodelofacil)
- Público: lojistas brasileiros do Brás/44 (pequenos e médios)
- Problema que resolve: alto custo de fotografia profissional (R$ 200-500 por produto)
- Solução: fotos com modelos de IA por fração do custo
- Site: https://www.modelofacil.ia.br

TOM DE VOZ:
- Próximo, brasileiro, direto
- Profissional mas não corporativo
- Empático com as dores do lojista
- Evitar jargões de marketing ou tech

SEU PAPEL:
Analisar o pilar de conteúdo do dia e criar um briefing estratégico que o Roteirista usará para escrever o post.`;

  const userPrompt = `DATA: ${today}
PILAR DO DIA: ${pillar.toUpperCase()}

CONFIGURAÇÃO DO PILAR:
- Objetivo: ${pillarInfo.objetivo}
- Tom: ${pillarInfo.tom}
- Exemplos de ângulos: ${pillarInfo.exemplos.join(', ')}

TAREFA:
Crie um briefing estratégico para o post de hoje. Retorne APENAS um JSON válido (sem markdown, sem explicações) com esta estrutura:

{
  "theme": "tema principal do post (max 100 chars)",
  "angle": "ângulo específico que vamos explorar (max 150 chars)",
  "objective": "o que queremos que o lojista faça/sinta (max 100 chars)",
  "hook": "gancho inicial para chamar atenção (max 80 chars)",
  "cta": "call-to-action específico para este post (max 60 chars)",
  "insights": ["insight 1", "insight 2", "insight 3"]
}

IMPORTANTE:
- O briefing deve ser específico, não genérico
- Considere que estamos em ${today}
- Fale a língua do lojista brasileiro (Brás, 44, centro de moda)
- O post será publicado às 19h no Instagram`;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      temperature: 0.8,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: userPrompt
      }]
    });

    const briefingText = response.content[0].text.trim();

    // Remover possíveis markdown wrappers se houver
    const jsonText = briefingText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const briefing = JSON.parse(jsonText);

    // Adicionar metadados
    briefing.pillar = pillar;
    briefing.date = new Date().toISOString();
    briefing.model = response.model;

    console.log('[STRATEGIST] Briefing criado:', {
      theme: briefing.theme,
      angle: briefing.angle.substring(0, 50) + '...'
    });

    return briefing;

  } catch (error) {
    console.error('[STRATEGIST] Erro ao criar briefing:', error.message);

    // Fallback caso a API falhe
    return {
      theme: `Post sobre ${pillar}`,
      angle: pillarInfo.objetivo,
      objective: 'Engajar seguidores',
      hook: 'E se eu te contar que...',
      cta: 'Saiba mais no link da bio',
      insights: pillarInfo.exemplos,
      pillar,
      date: new Date().toISOString(),
      fallback: true
    };
  }
}

module.exports = { analyze };
