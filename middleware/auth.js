// IMPORTANTE: Bypass SSL em desenvolvimento para validação de tokens funcionar
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  console.log('[AUTH] ⚠️  TLS verification disabled (development only)');
}

const { createClient } = require('@supabase/supabase-js');

// Cliente com service role (bypass RLS) — uso interno do backend
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

// Cliente com anon key — usado pra validar JWTs de usuários
const supabaseAuth = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  { auth: { persistSession: false } }
);

/**
 * Middleware que valida o JWT do Supabase no header Authorization.
 * Em caso de sucesso, popula req.user com { id, email }.
 */
async function requireAuth(req, res, next) {
  console.log('[AUTH] Verificando autenticação para:', req.method, req.path);

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('[AUTH] Token ausente ou inválido');
    return res.status(401).json({ error: 'missing_auth_token' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const { data, error } = await supabaseAuth.auth.getUser(token);

    if (error || !data?.user) {
      console.log('[AUTH] Token inválido:', error?.message);
      return res.status(401).json({ error: 'invalid_token', detail: error?.message });
    }

    console.log('[AUTH] Usuário autenticado:', data.user.id);
    req.user = { id: data.user.id, email: data.user.email };
    next();
  } catch (err) {
    console.error('[AUTH] Erro inesperado:', err);
    return res.status(500).json({ error: 'auth_validation_failed' });
  }
}

async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const { data, error } = await supabaseAuth.auth.getUser(token);
    
    if (!error && data?.user) {
      req.user = { id: data.user.id, email: data.user.email };
    }
  } catch (err) {
    console.warn('[optionalAuth] Token inválido ignorado:', err.message);
  }
  next();
}

module.exports = { requireAuth, optionalAuth, supabaseAdmin };
