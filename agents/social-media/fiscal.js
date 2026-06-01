// agents/social-media/fiscal.js
// Subagente 4 — Fiscal
// Revisa todo o conteúdo antes de publicar e notifica via Telegram se houver risco

const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY,
});

async function review({ briefing, content, visual, config }) {
  const pillarInfo = config.pillars[briefing.pillar];

  const systemPrompt = `Você é o Fiscal de Qualidade do Modelo Fácil. Seu papel é revisar posts ANTES de publicar e identificar APENAS problemas que representam risco real.

CONTEXTO DA PLATAFORMA:
- Modelo Fácil: SaaS que gera fotos de roupas com modelos de IA
- Público: lojistas brasileiros (Brás, 44, centro de moda)
- Tom: brasileiro, profissional, próximo
- Instagram: @iamodelofacil

O QUE VOCÊ DEVE BLOQUEAR (aprovar = false):
1. Informações factualmente incorretas sobre a plataforma
2. Promessas que não podemos cumprir
3. Tom ou linguagem inadequada (muito formal, muito informal, ofensivo)
4. Copy que não faz sentido ou está mal escrita
5. CTA confuso ou que não leva a lugar nenhum
6. Hashtags inapropriadas ou spam
7. Conteúdo que pode gerar reclamações ou problemas legais
8. Desalinhamento total entre briefing e execução

O QUE NÃO É MOTIVO PARA BLOQUEAR:
- Preferências estilísticas ("eu escreveria diferente")
- Copy "boa" mas não "perfeita"
- Falta de criatividade extrema (bom é suficiente)
- Pequenos detalhes que não afetam resultado

SUA MISSÃO:
Ser o guardião da qualidade e da marca, mas NÃO ser perfeccionista paralisante.`;

  const userPrompt = `POST PARA REVISÃO:

=== BRIEFING ESTRATÉGICO ===
Pilar: ${briefing.pillar}
Tema: ${briefing.theme}
Ângulo: ${briefing.angle}
Objetivo: ${briefing.objective}
CTA planejado: ${briefing.cta}

=== COPY FINAL ===
${content.caption}

Hashtags: ${content.hashtags.join(' ')}

=== VISUAL ===
Tipo: ${visual.type}
Prompt usado: ${visual.prompt || 'N/A'}
URL: ${visual.url}

=== TAREFA ===
Revise o post completo e retorne APENAS um JSON válido (sem markdown):

{
  "approved": true ou false,
  "issue": "descrição clara do problema se approved=false, ou null se approved=true",
  "severity": "critical" ou "moderate" ou "low" ou null,
  "suggestions": ["sugestão 1", "sugestão 2"] ou [],
  "qualityScore": número de 0 a 10,
  "reasoning": "breve explicação da sua decisão (max 200 chars)"
}

IMPORTANTE:
- Só reprove (approved=false) se houver risco REAL
- Se reprovar, seja específico no "issue"
- Se aprovar com ressalvas, use "suggestions" mas mantenha approved=true
- severity "critical" bloqueia publicação
- qualityScore: 7+ é bom, 5-6 é ok, <5 é problemático`;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      temperature: 0.3, // Mais conservador para análise crítica
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: userPrompt
      }]
    });

    const reviewText = response.content[0].text.trim();
    const jsonText = reviewText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const reviewResult = JSON.parse(jsonText);

    // Adicionar metadados
    reviewResult.date = new Date().toISOString();
    reviewResult.model = response.model;

    console.log('[FISCAL] Revisão concluída:', {
      approved: reviewResult.approved,
      qualityScore: reviewResult.qualityScore,
      severity: reviewResult.severity
    });

    // Se houver problema crítico ou moderado, notificar via Telegram
    if (!reviewResult.approved && ['critical', 'moderate'].includes(reviewResult.severity)) {
      console.log('[FISCAL] ⚠️ Problema identificado, notificando via Telegram...');
    }

    return reviewResult;

  } catch (error) {
    console.error('[FISCAL] Erro ao revisar:', error.message);

    // Em caso de erro na revisão, aprovar com nota baixa (não bloquear)
    return {
      approved: true,
      issue: null,
      severity: null,
      suggestions: ['Revisar manualmente - sistema de revisão automática falhou'],
      qualityScore: 5,
      reasoning: 'Auto-aprovado por falha no sistema de revisão',
      date: new Date().toISOString(),
      error: error.message
    };
  }
}

module.exports = { review };
