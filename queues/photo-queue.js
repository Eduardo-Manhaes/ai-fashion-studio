// Queue para processamento de fotos
const { Queue } = require('bullmq');

// Configuração Redis - prioriza REDIS_URL do Railway/Upstash
function getRedisConfig() {
  const redisUrl = process.env.REDIS_URL;

  if (redisUrl) {
    console.log('[REDIS CONFIG] ✅ REDIS_URL detectado:', redisUrl.substring(0, 40) + '...');

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

      console.log('[REDIS CONFIG] ✅ Parse manual da URL:');
      console.log('[REDIS CONFIG]    host:', config.host);
      console.log('[REDIS CONFIG]    port:', config.port);
      console.log('[REDIS CONFIG]    tls:', config.tls ? 'enabled' : 'disabled');

      return config;
    } catch (err) {
      console.error('[REDIS CONFIG] ❌ Erro ao fazer parse da URL:', err.message);
      console.log('[REDIS CONFIG] ✅ Retornando string de conexão completa (fallback)');
      return redisUrl;
    }
  }

  // Fallback para configuração manual (desenvolvimento)
  console.warn('[REDIS CONFIG] ⚠️  REDIS_URL NÃO encontrado - usando fallback localhost');
  console.warn('[REDIS CONFIG] ⚠️  Isto NÃO deve acontecer em produção!');

  const config = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
  };

  console.log('[REDIS CONFIG] Fallback config:', JSON.stringify(config));
  return config;
}

const redisConfig = getRedisConfig();
console.log('[REDIS CONFIG] redisConfig final type:', typeof redisConfig);

// Log URL completa mascarando senha
if (typeof redisConfig === 'string') {
  const maskedUrl = redisConfig.replace(/:([^@]+)@/, ':***@');
  console.log('[REDIS CONFIG] URL completa (senha mascarada):', maskedUrl);
  console.log('[REDIS CONFIG] URL length:', redisConfig.length);
  console.log('[REDIS CONFIG] URL format check:',redisConfig.startsWith('redis://') || redisConfig.startsWith('rediss://') ? '✅ Valid' : '❌ Invalid');
} else {
  console.log('[REDIS CONFIG] Config object:', JSON.stringify(redisConfig));
}

// Fila de fotos
console.log('[PHOTO QUEUE] Criando Queue com connection:', typeof redisConfig === 'string' ? 'STRING (URL)' : 'OBJECT');
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
  console.error('[PHOTO QUEUE] ❌ Erro detectado:');
  console.error('[PHOTO QUEUE] Mensagem:', err.message);
  console.error('[PHOTO QUEUE] Stack:', err.stack);
  console.error('[PHOTO QUEUE] REDIS_URL ainda disponível?', process.env.REDIS_URL ? 'SIM' : 'NÃO');
});

module.exports = { photoQueue, redisConfig };
