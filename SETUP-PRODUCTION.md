# 🚀 Setup de Produção — Arquitetura Escalável

## 📋 O que mudou?

Agora o sistema usa **Job Queue** (BullMQ + Redis) para processar fotos e vídeos em background. Isso permite:

✅ **Escala horizontal** — adicione mais workers conforme o tráfego cresce  
✅ **Retry automático** — se falhar, tenta novamente  
✅ **Rate limiting** — controla quantos jobs processam por minuto  
✅ **Zero bloqueio** — servidor web fica leve e rápido  
✅ **Pronto para centenas de usuários simultâneos**

## 🏗️ Arquitetura

```
User → Server → Redis Queue → Workers → Fal.ai
                      ↓
                 Banco atualiza
```

**Server:** Recebe requisições e adiciona jobs na fila  
**Redis:** Armazena a fila de jobs  
**Workers:** Processam jobs em paralelo (GPT Image 2, Clarity, Kling, Veo)

---

## 1️⃣ Configurar Redis

### Opção A: Redis Local (Desenvolvimento)

**Windows (Docker):**
```powershell
docker run -d --name redis -p 6379:6379 redis:latest
```

**Linux/Mac:**
```bash
docker run -d --name redis -p 6379:6379 redis:latest
```

### Opção B: Upstash (Grátis + Produção)

1. Acesse https://upstash.com/
2. Crie uma conta
3. Redis → **Create Database**
4. Copie as credenciais

---

## 2️⃣ Configurar .env

Adicione as variáveis Redis no `.env`:

```bash
# Redis local
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# OU Redis Cloud/Upstash
REDIS_HOST=us1-merry-llama-12345.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=seu-password-aqui
REDIS_TLS=true
```

**IMPORTANTE:** Descomente `REDIS_TLS=true` se usar Upstash/Redis Cloud.

---

## 3️⃣ Iniciar o Sistema

Agora você precisa rodar **2 processos**:

### Terminal 1 — Servidor Web
```bash
npm start
# Ou: node server.js
```

### Terminal 2 — Workers
```bash
node start-workers.js
```

**✅ Pronto!** O sistema está rodando em arquitetura escalável.

---

## 📊 Monitoramento

### Ver jobs na fila
```bash
# Em produção, use BullMQ Board (UI visual)
npm install -g bull-board
bull-board
```

### Logs dos workers
```
[PHOTO WORKER] Job abc123 completado
[VIDEO WORKER] Job xyz789 completado
```

### Postgres — verificar jobs
```sql
SELECT id, status, generation_type, created_at 
FROM generation_jobs 
WHERE status = 'processing' 
ORDER BY created_at DESC;
```

---

## 🚀 Deploy em Produção

### 1. Servidor Web (Node.js)
Deploy no **Render**, **Railway**, **Fly.io**, ou **Vercel**

```bash
# Dockerfile não necessário - apenas rode:
npm start
```

### 2. Workers
**Opção A:** Mesmo servidor (usa mais CPU)  
**Opção B:** Servidor separado (recomendado)

```bash
node start-workers.js
```

### 3. Redis
Use **Upstash** (grátis até 10k comandos/dia) ou **Redis Cloud**

### 4. Escalar Horizontalmente

**1 worker** = ~3 fotos + 2 vídeos em paralelo  
**3 workers** = ~9 fotos + 6 vídeos em paralelo  
**10 workers** = ~30 fotos + 20 vídeos em paralelo

Basta rodar `node start-workers.js` em múltiplos servidores apontando para o mesmo Redis.

---

## 🔧 Configurações Avançadas

### Ajustar Concorrência
Edite `workers/photo-worker.js`:
```javascript
{
  concurrency: 5, // Mais jobs em paralelo
  limiter: {
    max: 20, // Mais jobs por minuto
    duration: 60000,
  },
}
```

### Retry Logic
Edite `queues/photo-queue.js`:
```javascript
defaultJobOptions: {
  attempts: 5, // Mais retries
  backoff: {
    type: 'exponential',
    delay: 5000, // Delay menor
  },
}
```

---

## ❓ Troubleshooting

### Workers não processam jobs
```bash
# Teste conexão Redis
redis-cli -h localhost -p 6379 ping
# Deve retornar: PONG
```

### Jobs ficam presos em "processing"
- Verifique se os workers estão rodando
- Cheque logs do worker para erros
- Reinicie os workers: `Ctrl+C` e `node start-workers.js`

### Redis fora do ar
- Jobs ficam na fila
- Quando Redis voltar, processa normalmente

---

## 📈 Custos Estimados (1000 usuários/dia)

| Serviço | Plano | Custo/mês |
|---------|-------|-----------|
| Servidor Web | Render Basic | $7 |
| Workers (3x) | Render Basic | $21 |
| Redis | Upstash Pay-as-you-go | ~$5 |
| **Total** | | **~$33/mês** |

Para comparação, arquitetura antiga travaria com ~50 usuários simultâneos.

---

## 🎯 Próximos Passos

1. ✅ Configure Redis (5 min)
2. ✅ Inicie workers (1 comando)
3. ✅ Teste gerando fotos/vídeos
4. 🔜 Deploy em produção
5. 🔜 Adicione mais workers conforme crescer

**Dúvidas?** Verifique os logs ou o código dos workers em `workers/`.
