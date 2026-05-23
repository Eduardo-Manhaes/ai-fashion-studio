// Queue para processamento de fotos
const { Queue } = require('bullmq');

// Configuração Redis - prioriza REDIS_URL do Railway/Upstash
function getRedisConfig() {
  const redisUrl = process.env.REDIS_URL;

  if (redisUrl) {
    console.log('[REDIS CONFIG] Usando REDIS_URL:', redisUrl.substring(0, 30) + '...');
    return redisUrl;
  }

  // Fallback para configuração manual (desenvolvimento)
  const config = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
  };

  console.log('[REDIS CONFIG] Usando config manual:', config.host + ':' + config.port);
  return config;
}

const redisConfig = getRedisConfig();

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
