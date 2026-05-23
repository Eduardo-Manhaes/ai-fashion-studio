// Queue para processamento de vídeos
const { Queue } = require('bullmq');
const { redisConfig } = require('./photo-queue');

// Fila de vídeos (Kling e Veo)
console.log('[VIDEO QUEUE] Importou redisConfig tipo:', typeof redisConfig);
console.log('[VIDEO QUEUE] Criando Queue com connection:', typeof redisConfig === 'string' ? 'STRING (URL)' : 'OBJECT');
const videoQueue = new Queue('video-generation', {
  connection: redisConfig,
  defaultJobOptions: {
    attempts: 2, // Vídeos são caros, menos retries
    backoff: {
      type: 'exponential',
      delay: 15000, // 15s, 30s
    },
    removeOnComplete: {
      age: 86400,
      count: 500,
    },
    removeOnFail: {
      age: 604800,
    },
  },
});

videoQueue.on('error', (err) => {
  console.error('[VIDEO QUEUE] ❌ Erro detectado:');
  console.error('[VIDEO QUEUE] Mensagem:', err.message);
  console.error('[VIDEO QUEUE] Stack:', err.stack);
  console.error('[VIDEO QUEUE] REDIS_URL ainda disponível?', process.env.REDIS_URL ? 'SIM' : 'NÃO');
  console.error('[VIDEO QUEUE] redisConfig type:', typeof redisConfig);
  console.error('[VIDEO QUEUE] redisConfig value:', typeof redisConfig === 'string' ? redisConfig.substring(0, 40) + '...' : JSON.stringify(redisConfig));
});

module.exports = { videoQueue };
