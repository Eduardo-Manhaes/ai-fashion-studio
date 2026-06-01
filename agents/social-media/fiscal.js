// agents/social-media/fiscal.js
// Subagente 4 — Fiscal
// Revisa todo o conteúdo antes de publicar

async function review({ briefing, content, visual, config }) {
  // TODO: Implementar lógica do fiscal
  // - Verificar alinhamento com briefing
  // - Validar qualidade do copy e visual
  // - Checar compliance (termos, marca, etc)
  // - Aprovar ou rejeitar com motivo

  return {
    approved: true,
    issue: null
  };
}

module.exports = { review };
