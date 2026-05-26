# Checklist Final para Lançamento — Modelo Fácil

**Data:** 2026-05-26  
**URL Produção:** https://web-production-6ab20.up.railway.app

---

## ✅ Testes Críticos (JÁ REALIZADOS)

- [x] **v1 "Atitude Natural" gerado com sucesso**
- [x] **v2 "Look Completo" gerado com sucesso**
- [x] **Vídeos funcionaram** (confirmado pelo usuário)

---

## 📋 Verificação Rápida de Qualidade dos Vídeos

### v1 "Atitude Natural" — Checklist Visual

Assista o vídeo gerado e marque:

- [ ] **Gestos sequenciais visíveis:**
  - [ ] Mão no cabelo (2-4s)
  - [ ] Ajuste do tecido (4-6s)
  - [ ] Olhar direto para câmera com sorriso (6-7s)

- [ ] **SEM rotação 360°** (diferenciador vs v2)

- [ ] **Zoom moderado (7-9s):**
  - [ ] Mostra detalhes da roupa claramente
  - [ ] Modelo ainda visível no frame (não cortada)

- [ ] **Recuo suave da câmera (9-10s):**
  - [ ] Volta ao plano médio sem "salto"
  - [ ] Face da modelo consistente (sem distorção)

- [ ] **Identidade consistente:** mesma modelo do início ao fim

---

### v2 "Look Completo" — Checklist Visual

Assista o vídeo gerado e marque:

- [ ] **Rotação 360° completa:**
  - [ ] Mostra frente → lateral direita → costas → lateral esquerda → frente
  - [ ] Apenas UMA rotação (não duas)
  - [ ] Velocidade natural (não lenta demais)

- [ ] **Plano aberto full body:**
  - [ ] Modelo visível da cabeça aos pés durante rotação
  - [ ] Look completo sempre no enquadramento

- [ ] **Modelo para após rotação (6-7s):**
  - [ ] Pose frontal confiante
  - [ ] Olhando para câmera

- [ ] **Zoom moderado (7-9s):**
  - [ ] Foca no TECIDO (não no rosto)
  - [ ] Detalhes de textura e costura visíveis
  - [ ] Modelo parcialmente no frame

- [ ] **Recuo para plano aberto (9-10s):**
  - [ ] Modelo em pose final parada

- [ ] **Identidade consistente:** mesma modelo do início ao fim

---

## 🎯 Diferenciação v1 vs v2 (CRÍTICO)

Após assistir ambos os vídeos, confirme:

- [ ] **v1 e v2 são VISIVELMENTE DIFERENTES**
  - v1 = personalidade, gestos, sem rotação
  - v2 = técnico, rotação 360°, sem gestos

- [ ] **Não há confusão visual entre as variantes**

**Se estiverem muito parecidos:** ❌ NÃO LANÇAR — reportar problema

---

## 🧪 Testes de Regressão (Rápidos)

### Teste 1: m1-m6 ainda funcionam?

Selecione pelo menos **2 movimentos antigos** (ex: m1 Natural, m5 Giro elegante):

- [ ] m1 ou outro movimento → botão habilita IMEDIATAMENTE (sem variantes)
- [ ] Gerar vídeo funciona normalmente
- [ ] Se gerou vídeo: zoom moderado aplicado no final?

### Teste 2: m6 renomeado corretamente?

- [ ] m6 mostra label **"Vista no espelho"** (não "Look completo")
- [ ] Ícone correto: 🪞
- [ ] Subtítulo: "Frente e costas"

### Teste 3: UI de variantes funciona?

- [ ] Clicar m7 → aparecem 2 botões de variante abaixo
- [ ] Botão "Gerar Vídeo" está DESABILITADO até selecionar variante
- [ ] Clicar v1 → variante fica destacada → botão HABILITA
- [ ] Clicar v2 → v1 desmarca, v2 marca → botão permanece habilitado
- [ ] Trocar de m7 para m1 → variantes somem
- [ ] Voltar para m7 → variantes aparecem novamente

### Teste 4: Console limpo?

Abra DevTools (F12) → aba Console:

- [ ] **Sem erros vermelhos** relacionados a:
  - selectedMovementVariant
  - getElementById variants
  - API 404 errors

- [ ] **Warnings aceitáveis** (podem existir):
  - Cache/service worker
  - Third-party scripts

**Se houver erros vermelhos:** anote e reporte

---

## ⚡ Teste de Integração (Opcional mas Recomendado)

### Navegação entre modos:

- [ ] Gerar movimento m7-v1 → depois Talking video → voltar para Movimento
  - Estado limpa corretamente?
  - Sem erros ao alternar?

- [ ] Alternar rapidamente: m1 → m7 → m2 → m7 → m5
  - UI responde bem?
  - Sem travamentos?

---

## 🚀 Critérios de Aprovação para Lançamento

### OBRIGATÓRIO (Se falhar = NÃO LANÇAR):

- [x] v1 e v2 geraram vídeos com sucesso
- [ ] v1 e v2 são visualmente diferentes
- [ ] Zoom moderado (não cortado extremo)
- [ ] Face da modelo consistente (sem distorção no recuo)
- [ ] Console sem erros críticos
- [ ] UI de variantes funciona (botões aparecem, seleção funciona)

### DESEJÁVEL (Se falhar = analisar gravidade):

- [ ] m1-m6 testados e funcionando
- [ ] m6 mostra "Vista no espelho"
- [ ] Navegação entre modos funciona
- [ ] Performance aceitável

---

## 📊 Resultado Final

**Complete o checklist acima e depois responda:**

### Todos os itens OBRIGATÓRIOS estão ✅?

- **SIM** → ✅ **SISTEMA PRONTO PARA LANÇAMENTO**
- **NÃO** → ❌ **Reportar problemas encontrados para correção**

---

## 📝 Notas de Teste

Use este espaço para anotar observações durante os testes:

**v1 "Atitude Natural":**
- Qualidade visual: 
- Gestos visíveis: 
- Zoom adequado: 
- Problemas encontrados: 

**v2 "Look Completo":**
- Qualidade visual: 
- Rotação completa: 
- Zoom adequado: 
- Problemas encontrados: 

**Regressão (m1-m6):**
- Movimentos testados: 
- Funcionaram: 
- Problemas: 

**Console/Erros:**
- Erros críticos: 
- Warnings: 

---

**Tempo estimado para completar checklist:** 5-10 minutos

**Última atualização:** 2026-05-26
