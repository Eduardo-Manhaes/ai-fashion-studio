// Queue para processamento de fotos
const { Queue } = require('bullmq');

// Configuração Redis - prioriza REDIS_URL do Railway/Upstash
function getRedisConfig() {
  const redisUrl = process.env.REDIS_URL;

  if (redisUrl) {
    // Parse manual da URL para evitar problemas de DNS com redis.railway.internal
    try {
      const url = new URL(redisUrl);
      const config = {
        host: url.hostname,
        port: parseInt(url.port) || 6379,
        password: url.password || undefined,
        username: url.username || undefined,
        tls: redisUrl.startsWith('rediss://') ? {} : undefined,
      };

      console.log('[REDIS] Conectado em', url.hostname + ':' + config.port);
      return config;
    } catch (err) {
      console.error('[REDIS] Erro ao fazer parse da URL:', err.message, '- usando URL direta');
      return redisUrl;
    }
  }

  // Fallback para desenvolvimento local
  console.warn('[REDIS] REDIS_URL não encontrado - usando localhost:6379');

  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
  };
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
  console.error('[PHOTO QUEUE] Erro:', err.message);
});

module.exports = { photoQueue, redisConfig };
