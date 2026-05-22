// Queue para processamento de fotos
const { Queue } = require('bullmq');

// Configuração Redis - aceita REDIS_URL (Upstash/Railway) ou variáveis separadas
const redisConfig = process.env.REDIS_URL || {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
};

// Fila de fotos
const photoQueue = new Queue('photo-generation', {
  connection: redisConfig,
  defaultJobOptions: {
    attempts: 3, // Retry até 3 vezes
    backoff: {
      type: 'exponential',
      delay: 10000, // 10s, 20s, 40s
    },
    removeOnComplete: {
      age: 86400, // Remove jobs completos após 24h
      count: 1000, // Mantém últimos 1000
    },
    removeOnFail: {
      age: 604800, // Remove jobs falhados após 7 dias
    },
  },
});

// Eventos para monitoramento
photoQueue.on('error', (err) => {
  console.error('[PHOTO QUEUE] Erro:', err);
});

module.exports = { photoQueue, redisConfig };
