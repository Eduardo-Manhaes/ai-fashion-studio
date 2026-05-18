# ⚡ Quick Start — Sistema com Job Queue

## 🚀 Como Iniciar (2 passos)

### 1. Configure o Redis

Escolha uma opção:

**A) Redis Local (Docker - Windows):**
```powershell
docker run -d --name redis -p 6379:6379 redis:latest
```

**B) Upstash (Grátis - Cloud):**
1. Acesse https://console.upstash.com/
2. Crie conta/login
3. Redis → **Create Database** → **Global**
4. Em "REST API" → copie as credenciais
5. Cole no `.env`:
```bash
REDIS_HOST=<seu-endpoint>.upstash.io
REDIS_PORT=6379  
REDIS_PASSWORD=<seu-password>
# Uncomment a linha abaixo:
REDIS_TLS=true
```

**C) Sem Redis (fallback - não recomendado)**
O sistema ainda funciona sem Redis, mas não é escalável.

---

### 2. Inicie os Serviços

Abra **2 terminais** (PowerShell ou CMD):

#### Terminal 1 — Servidor Web
```bash
npm start
```

#### Terminal 2 — Workers
```bash
npm run workers
```

✅ **Pronto!** Acesse http://localhost:3000

---

## 🧪 Testar se Funciona

1. Gere uma foto
2. Clique em "Criar Variações"
3. Deve redirecionar para "Processando"
4. Veja os logs no Terminal 2 (workers)

---

## 📊 O que mudou?

**ANTES:** Servidor processava tudo (travava com muitos usuários)  
**AGORA:** Workers processam em paralelo (escala para centenas de usuários)

**Benefícios:**
- ✅ Servidor web fica rápido e responsivo
- ✅ Retry automático se falhar
- ✅ Rate limiting (controla quantos jobs por minuto)
- ✅ Pronto para produção

---

## ⚠️  Troubleshooting

### "ECONNREFUSED localhost:6379"
→ Redis não está rodando. Inicie o Docker ou configure Upstash.

### Workers não processam
→ Verifique se `npm run workers` está rodando.

### Jobs ficam em "processing"
→ Reinicie os workers: Ctrl+C e `npm run workers`

---

## 📖 Documentação Completa

Leia `SETUP-PRODUCTION.md` para:
- Deploy em produção
- Escalar horizontalmente
- Monitoramento avançado
- Configurações de performance
