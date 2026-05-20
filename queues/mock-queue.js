// Mock Queue - processamento inline sem Redis
// Usado automaticamente quando REDIS_URL não está configurado

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

  // Para compatibilidade com BullMQ Worker API
  setProcessor(fn) {
    this.processor = fn;
  }

  on(event, handler) {
    // Mock - eventos não são emitidos
  }
}

const photoQueue = new MockQueue('photo');
const videoQueue = new MockQueue('video');

module.exports = { photoQueue, videoQueue };
