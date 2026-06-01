// agents/social-media/config.js
module.exports = {
  // Quadros por dia da semana
  schedule: {
    0: 'conversao',   // Domingo
    1: 'dor',         // Segunda
    2: 'plataforma',  // Terça
    3: 'atracao',     // Quarta
    4: 'conversao',   // Quinta
    5: 'atracao',     // Sexta
    6: 'plataforma',  // Sábado
  },

  // Horário de publicação
  publishTime: '19:00', // Horário de Brasília

  // Instagram
  instagram: {
    username: 'iamodelofacil',
    profileUrl: 'https://www.instagram.com/iamodelofacil'
  },

  // Telegram — notificações do Fiscal
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    chatId: process.env.TELEGRAM_CHAT_ID,
  },

  // Plataforma Modelo Fácil
  platform: {
    url: 'https://www.modelofacil.ia.br',
    description: 'SaaS brasileiro que gera fotos e vídeos profissionais de roupas com modelos de IA para lojistas'
  },

  // Pilares de conteúdo
  pillars: {
    dor: {
      objetivo: 'Conectar com o problema real do lojista — alto custo de fotografia',
      tom: 'empático, próximo, brasileiro',
      exemplos: ['custo de fotos', 'tempo perdido', 'dependência de fotógrafo', 'coleção nova toda semana']
    },
    plataforma: {
      objetivo: 'Mostrar como o Modelo Fácil funciona na prática',
      tom: 'demonstrativo, confiante, simples',
      exemplos: ['tutorial', 'resultado real', 'modelos preset', 'cenários disponíveis']
    },
    atracao: {
      objetivo: 'Atrair novos seguidores — conteúdo viral ou tendência',
      tom: 'animado, atual, engajador',
      exemplos: ['tendência de moda', 'resultado impressionante', 'antes e depois', 'notícia do nicho']
    },
    conversao: {
      objetivo: 'Transformar seguidores em assinantes pagantes',
      tom: 'persuasivo, urgente, com CTA claro',
      exemplos: ['planos e preços', 'depoimento', 'ROI', 'comparativo custo']
    }
  }
};
