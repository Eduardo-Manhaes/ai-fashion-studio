const { supabaseAdmin } = require('../middleware/auth');

const BUCKET = 'generations';

/**
 * Baixa um arquivo de uma URL externa (provedor de IA) e retorna Buffer + metadata
 */
async function downloadFromUrl(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Falha ao baixar ${url}: HTTP ${res.status}`);
  }

  const contentType = res.headers.get('content-type') || 'application/octet-stream';
  const buffer = Buffer.from(await res.arrayBuffer());

  return { buffer, contentType, sizeBytes: buffer.length };
}

/**
 * Sobe um arquivo pro nosso bucket organizado por user/type
 * @param {string} userId
 * @param {string} type - 'photo' ou 'video'
 * @param {string} jobId
 * @param {Buffer} buffer
 * @param {string} contentType
 * @returns {Promise<{path: string, sizeBytes: number}>}
 */
async function uploadGeneration(userId, type, jobId, buffer, contentType) {
  const ext = mimeToExt(contentType);
  const path = `${userId}/${type}/${jobId}.${ext}`;

  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType,
      upsert: true,
      cacheControl: '3600',
    });

  if (error) {
    throw new Error(`Falha upload Storage: ${error.message}`);
  }

  return { path: data.path, sizeBytes: buffer.length };
}

/**
 * Gera URL assinada com expiração curta (1 hora)
 */
async function getSignedUrl(path, expiresInSeconds = 3600) {
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresInSeconds);

  if (error) {
    throw new Error(`Falha gerando URL assinada: ${error.message}`);
  }

  return data.signedUrl;
}

/**
 * Pipeline completo: baixa do provedor, sobe pro nosso Storage, retorna metadata
 */
async function downloadAndStore(providerUrl, userId, type, jobId) {
  const { buffer, contentType, sizeBytes } = await downloadFromUrl(providerUrl);
  const { path } = await uploadGeneration(userId, type, jobId, buffer, contentType);
  const signedUrl = await getSignedUrl(path);

  return {
    storage_path: path,
    result_url: signedUrl,
    file_size_bytes: sizeBytes,
    mime_type: contentType,
  };
}

/**
 * Pipeline alternativo: recebe base64, sobe pro Storage, retorna metadata
 */
async function storeFromBase64(base64String, userId, type, jobId, defaultContentType = 'video/mp4') {
  // limpa prefixo data:image/png;base64, se houver
  const b64Data = base64String.includes(',') ? base64String.split(',')[1] : base64String;
  const buffer = Buffer.from(b64Data, 'base64');
  
  // tenta extrair mimetype do data URL
  let contentType = defaultContentType;
  if (base64String.startsWith('data:')) {
    contentType = base64String.split(';')[0].split(':')[1];
  }
  
  const { path } = await uploadGeneration(userId, type, jobId, buffer, contentType);
  const signedUrl = await getSignedUrl(path);

  return {
    storage_path: path,
    result_url: signedUrl,
    file_size_bytes: buffer.length,
    mime_type: contentType,
  };
}

/**
 * Apaga um arquivo do Storage (uso futuro: cron de retenção)
 */
async function deleteGeneration(path) {
  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .remove([path]);

  if (error) {
    console.error(`[STORAGE] Falha apagando ${path}:`, error.message);
    return false;
  }

  return true;
}

function mimeToExt(mime) {
  const map = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
  };
  return map[mime] || 'bin';
}

module.exports = {
  downloadFromUrl,
  uploadGeneration,
  getSignedUrl,
  downloadAndStore,
  storeFromBase64,
  deleteGeneration,
};
