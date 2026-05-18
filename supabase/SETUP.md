# Setup do Supabase — AI Fashion Studio

## 1. Criar projeto novo
1. Acesse https://supabase.com/dashboard
2. Clique em "New Project"
3. Nome: `ai-fashion-studio` (ou o que preferir)
4. Senha do banco: gere uma forte e GUARDE (gerenciador de senhas)
5. Region: `South America (São Paulo)` para latência baixa no Brasil
6. Aguarde o provisionamento (~2 minutos)

## 2. Pegar as credenciais
No dashboard do projeto:
- Settings → API
- Copie:
  - **Project URL** → `SUPABASE_URL`
  - **anon / public key** → `SUPABASE_ANON_KEY`
  - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ NUNCA expor no frontend)

Cole no arquivo `.env` da raiz do projeto.

## 3. Aplicar as migrations
No dashboard do Supabase:
- SQL Editor → New Query
- Cole o conteúdo de `supabase/migrations/001_initial_schema.sql` → Run
- Cole o conteúdo de `supabase/migrations/002_rpc_functions.sql` → Run
- Cole o conteúdo de `supabase/migrations/003_rls_policies.sql` → Run

Cada migration deve rodar sem erros. Se der erro, copie a mensagem e me chame.

## 4. Verificar que rodou
No SQL Editor, rode:
```sql
SELECT id, name, monthly_quota_credits, price_brl FROM plans ORDER BY display_order;
```

Deve retornar 3 linhas: starter, pro, enterprise.

## 5. Configurar Auth
- Authentication → Providers → Email: deixe HABILITADO
- Authentication → URL Configuration:
  - Site URL: `http://localhost:3000` (vai mudar quando deploy)
- Authentication → Settings:
  - Confirm email: você decide. Para testes, pode desabilitar.

## 6. Criar usuário de teste
- Authentication → Users → Add user → Create new user
- Email + senha de sua escolha
- Anote o **User UID** que aparece

## 7. Dar uma assinatura de teste pra esse usuário
No SQL Editor:
```sql
INSERT INTO subscriptions (user_id, plan_id, status)
VALUES ('COLE_O_USER_UID_AQUI', 'pro', 'active');
```

## 8. Reiniciar o servidor local
```bash
npm start
```

## 9. Testar a rota /api/me
Use Postman, Thunder Client ou curl. Primeiro pegue o JWT do usuário (no Supabase Studio → Authentication → Users → "..." → Send magic link, ou use a página de signup que vem na próxima fase).

```bash
curl http://localhost:3000/api/me \
  -H "Authorization: Bearer SEU_JWT_AQUI"
```

Resposta esperada: JSON com user, subscription, quota e pack_credits_total.

## 10. Setup do Storage (Fase 1C)

### Criar bucket
1. Storage → New bucket
2. Nome: `generations`
3. Public bucket: **NÃO marcar** (manter privado)
4. File size limit: 50 MB (suficiente pra vídeos do Kling/Veo)
5. Allowed MIME types: `image/png, image/jpeg, image/webp, video/mp4, video/webm`
6. Save

### Configurar policies de Storage via SQL Editor

Cole e execute:

```sql
-- Policy: usuários autenticados leem apenas seus próprios arquivos
CREATE POLICY "users_read_own_generations"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'generations' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Service role (backend) pode fazer qualquer operação
-- (já tem por padrão, não precisa policy explícita)
```

### Aplicar migration 005
1. SQL Editor → New Query
2. Cole o conteúdo de `supabase/migrations/005_storage_setup.sql`
3. RUN
4. Validar:
```sql
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'generation_jobs' 
AND column_name IN ('storage_path', 'file_size_bytes', 'mime_type', 'expires_at');
```
Deve retornar 4 linhas.
