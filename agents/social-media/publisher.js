// agents/social-media/publisher.js
// Subagente 5 — Publicador
// Agenda e publica o post no Instagram via Chrome automation (Playwright)

const { chromium } = require('playwright');
const fs = require('fs').promises;

async function schedule({ content, visual, config }) {
  const publishTime = config.publishTime; // "19:00"
  const now = new Date();

  // Calcular quando publicar
  const [hours, minutes] = publishTime.split(':').map(Number);
  const scheduledDate = new Date();
  scheduledDate.setHours(hours, minutes, 0, 0);

  // Se o horário já passou hoje, agendar para amanhã
  if (scheduledDate <= now) {
    scheduledDate.setDate(scheduledDate.getDate() + 1);
  }

  const delayMs = scheduledDate.getTime() - now.getTime();

  console.log('[PUBLISHER] Post agendado para:', scheduledDate.toLocaleString('pt-BR'));
  console.log('[PUBLISHER] Aguardando', Math.round(delayMs / 1000 / 60), 'minutos...');

  // Agendar publicação
  setTimeout(async () => {
    await publishToInstagram({ content, visual, config });
  }, delayMs);

  return {
    scheduled: true,
    scheduledTime: scheduledDate.toISOString(),
    publishTime: publishTime,
    delayMinutes: Math.round(delayMs / 1000 / 60)
  };
}

async function publishToInstagram({ content, visual, config }) {
  const username = process.env.INSTAGRAM_USERNAME || config.instagram.username;
  const password = process.env.INSTAGRAM_PASSWORD;

  if (!password) {
    console.error('[PUBLISHER] ❌ INSTAGRAM_PASSWORD não configurada no .env');
    return {
      published: false,
      error: 'INSTAGRAM_PASSWORD missing'
    };
  }

  let browser;
  try {
    console.log('[PUBLISHER] 🚀 Iniciando publicação no Instagram...');

    // Iniciar navegador
    browser = await chromium.launch({
      headless: false, // Mostrar navegador para debug (mudar para true em produção)
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();

    // 1. Login no Instagram
    console.log('[PUBLISHER] 1/5 Fazendo login...');
    await page.goto('https://www.instagram.com/accounts/login/');
    await page.waitForTimeout(2000);

    // Aceitar cookies se aparecer
    try {
      await page.click('button:has-text("Permitir todos os cookies")', { timeout: 3000 });
    } catch (e) {
      // Ignorar se não aparecer
    }

    // Preencher credenciais
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');

    // Aguardar login
    await page.waitForNavigation({ timeout: 15000 });
    console.log('[PUBLISHER] ✅ Login realizado');

    // Lidar com "Salvar informações de login?" - clicar em "Agora não"
    try {
      await page.click('button:has-text("Agora não")', { timeout: 5000 });
    } catch (e) {
      // Ignorar se não aparecer
    }

    // Lidar com "Ativar notificações?" - clicar em "Agora não"
    try {
      await page.click('button:has-text("Agora não")', { timeout: 5000 });
    } catch (e) {
      // Ignorar se não aparecer
    }

    // 2. Navegar para criar post
    console.log('[PUBLISHER] 2/5 Criando novo post...');
    await page.waitForTimeout(2000);

    // Clicar em "Criar" (ícone +)
    await page.click('[aria-label="Criar"], [aria-label="Create"]');
    await page.waitForTimeout(1000);

    // 3. Upload da imagem
    console.log('[PUBLISHER] 3/5 Fazendo upload da imagem...');

    // Verificar se o arquivo existe
    try {
      await fs.access(visual.path);
    } catch (err) {
      throw new Error(`Imagem não encontrada: ${visual.path}`);
    }

    // Upload do arquivo
    const fileInput = await page.$('input[type="file"]');
    await fileInput.setInputFiles(visual.path);
    await page.waitForTimeout(3000);

    // Clicar em "Avançar"
    await page.click('button:has-text("Avançar"), button:has-text("Next")');
    await page.waitForTimeout(2000);

    // Clicar em "Avançar" novamente (filtros)
    await page.click('button:has-text("Avançar"), button:has-text("Next")');
    await page.waitForTimeout(2000);

    // 4. Adicionar caption
    console.log('[PUBLISHER] 4/5 Adicionando caption...');
    const fullCaption = `${content.caption}\n\n${content.hashtags.join(' ')}`;
    await page.fill('textarea[aria-label="Escreva uma legenda..."]', fullCaption);
    await page.waitForTimeout(1000);

    // 5. Publicar
    console.log('[PUBLISHER] 5/5 Publicando...');
    await page.click('button:has-text("Compartilhar"), button:has-text("Share")');

    // Aguardar confirmação
    await page.waitForTimeout(5000);

    console.log('[PUBLISHER] ✅ Post publicado com sucesso!');

    await browser.close();

    return {
      published: true,
      date: new Date().toISOString(),
      username: username,
      caption: fullCaption.substring(0, 100) + '...'
    };

  } catch (error) {
    console.error('[PUBLISHER] ❌ Erro ao publicar:', error.message);

    if (browser) {
      await browser.close();
    }

    return {
      published: false,
      error: error.message,
      date: new Date().toISOString()
    };
  }
}

module.exports = { schedule, publishToInstagram };
