// Queue para processamento de vídeos
const { Queue } = require('bullmq');
const { redisConfig } = require('./photo-queue');

// Fila de vídeos (Kling e Veo)
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
  console.error('[VIDEO QUEUE] Erro:', err);
});

module.exports = { videoQueue };
