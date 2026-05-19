// public/lib/auth.js — versão corrigida
// Problema original: import() dinâmico do CDN é lento, getSession() era chamado antes do cliente estar pronto

let _supabaseClient = null;
let _loadPromise = null;
let _publicConfig = null;

// Carrega uma única vez e reutiliza
async function loadSupabase() {
  if (_supabaseClient) return _supabaseClient;

  // Garante que só uma chamada concorrente roda por vez
  if (_loadPromise) return _loadPromise;

  _loadPromise = (async () => {
    // 1. Busca config do backend
    const configRes = await fetch('/api/public-config');
    if (!configRes.ok) throw new Error('Falha ao carregar config pública');
    _publicConfig = await configRes.json();

    // 2. Carrega Supabase do CDN
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');

    // 3. Cria cliente com persistência de sessão
    _supabaseClient = createClient(_publicConfig.supabaseUrl, _publicConfig.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
      }
    });

    return _supabaseClient;
  })();

  try {
    return await _loadPromise;
  } finally {
    _loadPromise = null;
  }
}

async function getSession() {
  const sb = await loadSupabase();

  // Aguarda o cliente verificar o localStorage e sessão ativa
  const { data, error } = await sb.auth.getSession();
  if (error) {
    console.error('[AUTH] getSession error:', error.message);
    return null;
  }
  return data.session;
}

async function getJWT() {
  const session = await getSession();
  return session?.access_token || null;
}

async function requireSession() {
  const session = await getSession();
  if (!session) {
    console.warn('[AUTH] Sem sessão ativa, redirecionando para login');
    window.location.href = '/login.html';
    return null;
  }
  return session;
}

async function logout() {
  const sb = await loadSupabase();
  await sb.auth.signOut();
  window.location.href = '/login.html';
}

async function authFetch(url, options = {}, _isRetry = false) {
  const jwt = await getJWT();

  if (!jwt) {
    console.warn('[AUTH] authFetch: sem JWT, redirecionando para login');
    window.location.href = '/login.html';
    throw new Error('No session');
  }

  const headers = {
    ...(options.headers || {}),
    'Authorization': `Bearer ${jwt}`,
  };

  const res = await fetch(url, { ...options, headers });

  console.log('[AUTH] Response:', res.status, res.statusText, 'URL:', url);

  if (res.status === 401 && !_isRetry) {
    console.warn('[AUTH] 401 recebido, tentando refresh do token...');
    const sb = await loadSupabase();

    try {
      const { data, error } = await sb.auth.refreshSession();

      if (!error && data.session) {
        console.log('[AUTH] Token refreshed com sucesso, retentando...');
        return authFetch(url, options, true);
      }

      console.error('[AUTH] Refresh falhou:', error?.message || 'Unknown error');
      await logout();
      throw new Error('Unauthorized after refresh attempt');
    } catch (refreshErr) {
      console.error('[AUTH] Erro ao tentar refresh:', refreshErr);
      await logout();
      throw refreshErr;
    }
  }

  if (res.status === 401 && _isRetry) {
    console.error('[AUTH] 401 após retry, fazendo logout');
    await logout();
    throw new Error('Unauthorized after retry');
  }

  return res;
}

// Expõe globalmente
window.AuthLib = { loadSupabase, getSession, getJWT, requireSession, logout, authFetch };
