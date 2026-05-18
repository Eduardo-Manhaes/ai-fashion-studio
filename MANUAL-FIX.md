# 🔧 CORREÇÃO MANUAL NECESSÁRIA

## ❌ Problema Identificado

A função `debit_credits` não consegue acessar a tabela `credit_packs` devido a conflito entre:
- **Row Level Security (RLS)** - Política que só permite `auth.uid() = user_id`
- **SECURITY DEFINER** - Função roda como service_role, não como usuário

## ✅ Solução

Execute o SQL abaixo no **Supabase SQL Editor**:

### 📍 Como Acessar o SQL Editor:
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Clique em **SQL Editor** no menu lateral
4. Clique em **New Query**
5. Cole o SQL abaixo e clique em **Run**

---

### 📝 SQL para Executar:

```sql
-- ============================================================
-- Fix RLS para permitir funções RPC acessarem tabelas
-- ============================================================

-- SUBSCRIPTIONS
CREATE POLICY "subscriptions_service_role_full_access"
  ON subscriptions
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- QUOTA_USAGE
CREATE POLICY "quota_service_role_full_access"
  ON quota_usage
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- CREDIT_PACKS (PRINCIPAL PROBLEMA)
CREATE POLICY "packs_service_role_full_access"
  ON credit_packs
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- GENERATION_JOBS
CREATE POLICY "jobs_service_role_full_access"
  ON generation_jobs
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
```

---

### ✅ Verificação

Após executar, rode este teste no mesmo SQL Editor:

```sql
-- Deve retornar TRUE se funcionou
SELECT EXISTS (
  SELECT 1 FROM pg_policies 
  WHERE tablename = 'credit_packs' 
    AND policyname = 'packs_service_role_full_access'
) AS policy_exists;
```

---

### 🧪 Teste Final

Após aplicar a correção, volte ao navegador e tente gerar o vídeo novamente.
O erro 402 não deve mais aparecer!

---

## 📊 Resumo do Problema

**Antes:**
```
User Request → requireCredits → debit_credits (SECURITY DEFINER)
                                      ↓
                              Query credit_packs
                                      ↓
                      RLS: auth.uid() = user_id ❌ (auth.uid() = NULL)
                                      ↓
                           Nenhum registro encontrado
                                      ↓
                          Erro: no_single_pack_covers_cost
```

**Depois:**
```
User Request → requireCredits → debit_credits (SECURITY DEFINER)
                                      ↓
                              Query credit_packs
                                      ↓
        RLS: auth.uid() = user_id OU role = 'service_role' ✅
                                      ↓
                              Pacote encontrado (500 créditos)
                                      ↓
                                 Débito bem-sucedido!
```
