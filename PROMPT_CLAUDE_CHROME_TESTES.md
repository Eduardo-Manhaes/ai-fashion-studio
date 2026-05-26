# Prompt para Claude Chrome — Testes de Lançamento

**Copie e cole este prompt completo no Claude Chrome (claude.ai) enquanto estiver com a aba de produção aberta:**

---

Você é um QA especialista em testar aplicações web de geração de vídeo com IA. Preciso que me guie através de testes de pré-lançamento de uma plataforma SaaS de moda brasileira chamada "Modelo Fácil".

## CONTEXTO DO SISTEMA

**URL de Produção:** https://web-production-6ab20.up.railway.app

**Funcionalidade sendo testada:** Novo estilo de vídeo "m7 Pose de Modelo" com 2 variantes:
- **v1 "Atitude Natural"**: Foco em personalidade, gestos naturais (mão no cabelo, ajuste de roupa), sem rotação 360°
- **v2 "Look Completo"**: Foco técnico, rotação 360° completa mostrando o look de todos os ângulos

**Mudanças recentes implementadas:**
1. Adicionado m7 com sistema de variantes
2. m6 renomeado de "Look completo" para "Vista no espelho"
3. Zoom moderado aplicado a todos os vídeos de movimento (não extremo)
4. Prompts detalhados cena-por-cena para v1 e v2
5. Recuo suave da câmera (não snap rápido que distorcia face)

**Status atual:** Vídeos de v1 e v2 foram gerados com sucesso. Agora preciso verificar qualidade visual e UI.

## SUA TAREFA

Me guie através dos seguintes testes de forma estruturada, um passo de cada vez:

### FASE 1: Análise Visual dos Vídeos Gerados

**Vou compartilhar screenshots ou descrições dos vídeos gerados. Para cada vídeo, analise:**

**Para v1 "Atitude Natural":**
1. Identifique se há gestos sequenciais visíveis (mão no cabelo, ajuste de roupa, olhar para câmera)
2. Confirme se NÃO há rotação 360° da modelo
3. Verifique se o zoom (por volta de 7-9s) mostra detalhes da roupa sem cortar a modelo completamente
4. Confirme se o recuo da câmera (9-10s) é suave, sem "saltos" ou distorção facial
5. Verifique se a identidade da modelo permanece consistente do início ao fim

**Para v2 "Look Completo":**
1. Confirme se há uma rotação 360° completa (frente → lateral → costas → lateral → frente)
2. Verifique se é APENAS UMA rotação (não duas)
3. Confirme se o enquadramento é full body (cabeça aos pés) durante a rotação
4. Verifique se o zoom foca no TECIDO (não no rosto) mostrando textura
5. Confirme se a modelo para após a rotação em pose frontal
6. Verifique se a identidade permanece consistente

**CRÍTICO:** Confirme se v1 e v2 são VISIVELMENTE DIFERENTES (não parecidos demais).

### FASE 2: Testes de Interface (UI)

**Me guie através destes testes e peça screenshots quando necessário:**

1. **Teste de variantes:**
   - Verificar se ao clicar m7, aparecem 2 botões de variante abaixo
   - Verificar se o botão "Gerar Vídeo" está desabilitado antes de selecionar variante
   - Testar seleção de v1 e v2 (alternância)

2. **Teste de m6 renomeado:**
   - Verificar se m6 mostra "Vista no espelho" (não "Look completo")

3. **Teste de navegação:**
   - Alternar entre m1, m7, m5
   - Verificar se variantes aparecem/desaparecem corretamente

### FASE 3: Console Errors

**Peça para eu abrir DevTools (F12) e compartilhar:**
- Erros vermelhos no Console
- Warnings relevantes
- Status de requisições de API (Network tab)

### FASE 4: Análise e Recomendação

**Após coletar todas as informações, forneça:**

1. **Análise de Qualidade:**
   - v1 e v2 estão suficientemente diferentes?
   - Zoom está adequado (moderado, não extremo)?
   - Recuo da câmera suave sem distorções?
   - UI funciona corretamente?

2. **Problemas Encontrados:**
   - Liste todos os problemas identificados
   - Classifique por severidade (CRÍTICO, ALTO, MÉDIO, BAIXO)

3. **Recomendação Final:**
   - ✅ APROVADO PARA LANÇAMENTO (se todos critérios críticos atendidos)
   - ⚠️ APROVADO COM RESSALVAS (problemas menores aceitáveis)
   - ❌ NÃO APROVADO (problemas críticos encontrados)

## CRITÉRIOS CRÍTICOS DE APROVAÇÃO

**Para aprovar o lançamento, TODOS devem ser atendidos:**
- [ ] v1 e v2 são visualmente distintos
- [ ] Zoom moderado (não corta/distorce a modelo)
- [ ] Face da modelo consistente (sem distorção no recuo da câmera)
- [ ] UI de variantes funciona (botões aparecem, seleção funciona)
- [ ] Console sem erros críticos relacionados a variantes ou API

**Critérios desejáveis (não bloqueantes):**
- [ ] m6 mostra "Vista no espelho"
- [ ] Navegação entre movimentos funciona bem
- [ ] Performance aceitável

---

## COMO PROCEDER

**Inicie perguntando:**

"Vamos começar os testes de pré-lançamento. Primeiro, vou analisar a qualidade visual dos vídeos gerados.

**Por favor, me forneça uma das opções:**
1. Compartilhe screenshots ou screen recordings dos vídeos v1 'Atitude Natural' e v2 'Look Completo' gerados
2. Descreva em detalhes o que você vê em cada vídeo (gestos, rotações, zoom, recuo da câmera)
3. Compartilhe os links dos vídeos se estiverem acessíveis

Começando com o **v1 'Atitude Natural'**: o que você observa no vídeo gerado?"

---

**Copie todo este texto acima e cole no Claude Chrome. Ele te guiará passo a passo pelos testes.**
