// IMPORTANTE: Bypass SSL em desenvolvimento para validação de tokens funcionar
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  console.log('[AUTH] ⚠️  TLS verification disabled (development only)');
}

const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');

// Cliente com service role (bypass RLS) — uso interno do backend
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { persistSession: false },
    realtime: { transport: ws },
  }
);

// Cliente com anon key — usado pra validar JWTs de usuários
const supabaseAuth = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: { persistSession: false },
    realtime: { transport: ws },
  }
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

/**
 * Middleware que verifica se o usuário autenticado é administrador.
 * Requer que requireAuth tenha sido executado antes (req.user deve existir).
 * Admins são definidos via env var ADMIN_EMAILS (comma-separated).
 */
function requireAdmin(req, res, next) {
  console.log('[AUTH] Verificando permissão de admin para:', req.user?.email);

  if (!req.user) {
    console.log('[AUTH] requireAdmin chamado sem requireAuth - usuário não autenticado');
    return res.status(401).json({ error: 'unauthorized' });
  }

  const adminEmailsRaw = process.env.ADMIN_EMAILS || '';
  const adminEmails = adminEmailsRaw
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(email => email.length > 0);

  if (adminEmails.length === 0) {
    console.warn('[AUTH] ⚠️  ADMIN_EMAILS não configurado - acesso admin bloqueado');
    return res.status(403).json({ error: 'forbidden_admin_not_configured' });
  }

  const userEmail = req.user.email.toLowerCase();

  if (!adminEmails.includes(userEmail)) {
    console.log('[AUTH] Acesso negado - usuário não é admin:', userEmail);
    return res.status(403).json({ error: 'forbidden_admin_only' });
  }

  console.log('[AUTH] ✓ Admin autorizado:', userEmail);
  next();
}

module.exports = { requireAuth, optionalAuth, requireAdmin, supabaseAdmin };
