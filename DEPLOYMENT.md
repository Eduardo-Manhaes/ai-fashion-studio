# Guia de Deploy — Modelo Fácil

## Pré-requisitos

- **Railway Account** (ou outro provedor que suporte Node.js + Redis)
- **Redis Database** (pode usar Railway Redis plugin)
- **Variáveis de ambiente** configuradas

---

## 1. Configurar Redis no Railway

### Opção A: Railway Redis Plugin (Recomendado)

1. No dashboard do Railway, abra seu projeto
2. Clique em **"New"** → **"Database"** → **"Add Redis"**
3. Railway vai automaticamente:
   - Criar a instância de Redis
   - Adicionar a variável `REDIS_URL` ao seu serviço principal
   - Conectar os serviços na mesma rede privada

### Opção B: Redis Externo (Upstash, etc.)

1. Crie uma instância Redis em [Upstash](https://upstash.com/) ou outro provedor
2. Copie a URL de conexão (formato: `redis://default:senha@host:port`)
3. Adicione a variável de ambiente `REDIS_URL` no Railway

---

## 2. Configurar Workers

O sistema usa **BullMQ** para processar jobs de foto e vídeo em background.

### Arquitetura

```
┌─────────────────┐      ┌──────────────┐      ┌─────────────────┐
│   API Server    │ ───▶ │    Redis     │ ◀─── │    Workers      │
│  (server.js)    │      │    Queue     │      │ (start-workers) │
└─────────────────┘      └──────────────┘      └─────────────────┘
     Adiciona jobs           Gerencia fila        Processa jobs
```

### Deploy no Railway

#### Passo 1: Criar serviço de Workers

1. No Railway, dentro do seu projeto, clique **"New"** → **"Empty Service"**
2. Nomeie: **"workers"**
3. Conecte ao mesmo repositório GitHub
4. Configure o **Build Command**: `npm install`
5. Configure o **Start Command**: `npm run workers`

#### Passo 2: Copiar variáveis de ambiente

O serviço de workers precisa das MESMAS variáveis que o servidor principal:

```bash
# Copie estas variáveis do serviço principal para o serviço workers:
REDIS_URL=redis://...
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
FAL_API_KEY=...
```

**IMPORTANTE:** O Railway já compartilha `REDIS_URL` automaticamente se ambos serviços estão conectados ao mesmo Redis.

#### Passo 3: Deploy

1. Faça commit e push das mudanças
2. Railway vai automaticamente:
   - Rebuildar o serviço principal (API)
   - Buildar e iniciar o serviço de workers

---

## 3. Verificar se está funcionando

### Logs do Servidor Principal

```
✅ BullMQ ativo (Redis conectado)
⚠️  IMPORTANTE: Inicie os workers com: npm run workers
```

### Logs do Workers

```
🚀 Iniciando workers...

[ENV CHECK] REDIS_URL: ✅ Disponível (redis://...)
[ENV CHECK] SUPABASE_URL: ✅ Disponível
[ENV CHECK] FAL_API_KEY: ✅ Disponível

[Photo Worker] Conectado ao Redis
[Video Worker] Conectado ao Redis

✅ Todos os workers ativos
📝 Logs serão exibidos conforme jobs forem processados
```

### Testar geração

1. Gere uma foto ou vídeo pela interface
2. Verifique os logs do **workers**:

```
[PROCESSOR abc123] Processando job abc123
[PROCESSOR abc123] Iniciando GPT Image 2...
[PROCESSOR abc123] ✅ Concluído
```

---

## 4. Modo Desenvolvimento Local

### Com Redis (produção-like)

```bash
# Terminal 1: API Server
npm start

# Terminal 2: Workers
npm run workers
```

### Sem Redis (MockQueue)

Se você **NÃO** tiver `REDIS_URL` configurado, o sistema automaticamente usa **MockQueue** (processamento in-memory):

```bash
# Apenas 1 terminal necessário
npm start
```

**MockQueue** processa jobs automaticamente em background, mas:
- ❌ Jobs são perdidos se o servidor reiniciar
- ❌ Não escala para múltiplos workers
- ✅ Perfeito para desenvolvimento local

---

## 5. Monitoramento

### Verificar saúde do Redis

No Railway, vá para o serviço Redis → **Metrics** para ver:
- CPU usage
- Memory usage
- Connections

### Logs importantes

**API Server:**
```bash
[PHOTO QUEUE] Job abc123 adicionado à fila
[VIDEO QUEUE] Job xyz789 adicionado à fila
```

**Workers:**
```bash
[PROCESSOR abc123] Processando job abc123
[PROCESSOR abc123] ✅ Concluído em 45s
```

---

## 6. Troubleshooting

### Erro: "REDIS_URL não configurado"

**Solução:** Configure `REDIS_URL` no Railway ou use MockQueue localmente.

### Workers não processam jobs

1. Verifique se o serviço **workers** está rodando no Railway
2. Verifique logs do workers para erros de conexão
3. Confirme que `REDIS_URL` é a mesma para API e Workers

### Jobs ficam presos em "processing"

1. Verifique se os workers têm as chaves de API (`FAL_API_KEY`, etc.)
2. Verifique logs do workers para erros na API externa
3. Jobs com erro são automaticamente reembolsados

---

## 7. Escalabilidade

### Aumentar capacidade de processamento

Para processar mais jobs simultaneamente:

1. No Railway, aumente o número de **replicas** do serviço workers
2. Ou adicione mais **workers concorrentes** modificando `workers/photo-worker.js`:

```javascript
const worker = new Worker('photo-queue', processPhoto, {
  connection,
  concurrency: 5,  // Aumentar de 1 para 5
});
```

### Limites recomendados

- **API Server:** 1-2 instâncias (stateless)
- **Workers:** 1-3 instâncias (depende do volume)
- **Redis:** 256MB mínimo (Railway padrão)

---

## 8. Custos

### Railway (estimativa mensal)

| Recurso       | Uso Estimado | Custo    |
|---------------|--------------|----------|
| API Server    | ~$5-10       | $5-10    |
| Workers       | ~$5-10       | $5-10    |
| Redis (256MB) | Fixo         | $5       |
| **Total**     |              | **$15-25/mês** |

### Otimização de custos

- Use **MockQueue** em desenvolvimento (sem Redis local)
- Configure **autoscaling** no Railway para desligar workers fora do horário de pico
- Use **Redis Upstash** (plano gratuito até 10k comandos/dia)

---

## Resumo: Checklist de Deploy ✅

- [ ] Redis configurado no Railway
- [ ] Serviço **workers** criado
- [ ] Variáveis de ambiente copiadas para workers
- [ ] Deploy do código mais recente
- [ ] Logs do servidor mostram "BullMQ ativo"
- [ ] Logs dos workers mostram "Todos os workers ativos"
- [ ] Teste de geração de foto funciona
- [ ] Teste de geração de vídeo funciona

---

**Pronto para produção! 🚀**
