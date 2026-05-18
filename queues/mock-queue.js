// Mock Queue - Para testes sem Redis
// Processa jobs diretamente em background

class MockQueue {
  constructor(name) {
    this.name = name;
    this.processor = null;
  }

  async add(jobName, data, options) {
    console.log(`[MOCK QUEUE ${this.name}] Adicionando job ${data.jobId}`);

    // Processa em background (simula o worker)
    if (this.processor) {
      setImmediate(async () => {
        try {
          await this.processor({ id: data.jobId, data });
          console.log(`[MOCK QUEUE ${this.name}] Job ${data.jobId} completado`);
        } catch (err) {
          console.error(`[MOCK QUEUE ${this.name}] Job ${data.jobId} falhou:`, err.message);
        }
      });
    }

    return { id: data.jobId };
  }

  // Para compatibilidade com workers
  setProcessor(fn) {
    this.processor = fn;
  }

  on(event, handler) {
    // Mock - não faz nada
  }
}

// FORÇANDO MOCK QUEUE - Redis desabilitado
let photoQueue, videoQueue;

console.warn('⚠️  Usando Mock Queue (processamento direto - Redis desabilitado)');

photoQueue = new MockQueue('photo');
videoQueue = new MockQueue('video');

/* CÓDIGO ORIGINAL - Reativar quando Redis estiver disponível
try {
  const { Queue } = require('bullmq');
  const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    connectTimeout: 2000,
    maxRetriesPerRequest: 1,
  };

  photoQueue = new Queue('photo-generation', { connection: redisConfig });
  videoQueue = new Queue('video-generation', { connection: redisConfig });

  console.log('✅ Usando Redis para job queue');
} catch (err) {
  console.warn('⚠️  Redis não disponível, usando mock queue');
  photoQueue = new MockQueue('photo');
  videoQueue = new MockQueue('video');
}
*/

module.exports = { photoQueue, videoQueue, redisConfig: {} };
