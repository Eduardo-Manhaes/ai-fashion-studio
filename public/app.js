// ===== AI Fashion Studio V2 — Frontend Logic =====

// === ÍCONES SVG (Lucide) ===
const ICONS = {
  // Navegação sidebar
  gerar:    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
  fotos:    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`,
  videos:   `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 8-6 4 6 4V8z"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>`,
  config:   `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  sair:     `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,

  // Ações
  download: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  trash:    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`,
  refresh:  `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`,
  search:   `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  close:    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  play:     `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
  star:     `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,

  // Galeria e conteúdo
  camera:   `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
  video:    `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 8-6 4 6 4V8z"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>`,
  image:    `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`,
  sparkle:  `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`,
  gem:      `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 3 18 3 22 9 12 22 2 9"/><line x1="2" y1="9" x2="22" y2="9"/><line x1="6" y1="3" x2="12" y2="22"/><line x1="18" y1="3" x2="12" y2="22"/></svg>`,
  upload:   `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
  check:    `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  alert:    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,

  // Login/signup
  lock:     `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  mail:     `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  zap:      `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  dollar:   `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  palette:  `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>`,
  city:     `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  hourglass: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>`,
  x:        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  mic:      `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`,
  save:     `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>`,
};

// === Fase 1D — Auth boot ===
let currentUser = null;
let currentQuota = null;

// === FASE DESIGN 3 — Gallery cache ===
let galleryCache = { fotos: null, videos: null, loadedAt: null };

// === FASE DESIGN 2 — SIDEBAR NAVIGATION ===
function initSidebarNav() {
  const navItems = document.querySelectorAll('.sidebar-item[data-view]');
  const views = document.querySelectorAll('.view-panel');
  const rightPanel = document.getElementById('rightPanel');

  console.log('[Sidebar] Inicializando navegação, encontrados', navItems.length, 'itens');

  navItems.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetView = btn.dataset.view;
      console.log('[Sidebar] Clique em:', targetView);

      // Atualiza item ativo na sidebar
      navItems.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Atualiza view ativa
      views.forEach(v => v.classList.remove('active'));
      const targetEl = document.getElementById('view' + targetView.charAt(0).toUpperCase() + targetView.slice(1));
      if (targetEl) {
        targetEl.classList.add('active');
        console.log('[Sidebar] View ativada:', targetEl.id);
      } else {
        console.error('[Sidebar] View não encontrada para:', targetView);
      }

      // Mostra/oculta painel direito
      if (rightPanel) {
        rightPanel.classList.toggle('hidden', targetView !== 'gerar');
      }

      // Carrega conteúdo da galeria se necessário
      if (targetView === 'fotos') loadGallery('photo');
      if (targetView === 'videos') loadGallery('video');
      if (targetView === 'config') loadSettings();

      // Se entrou na aba "gerar" (que contém photo/video tabs) e está no menu de vídeo,
      // carrega as fotos para o seletor
      if (targetView === 'gerar' && state.activeMenu === 'video' && state.videoStep === 1) {
        loadPhotosForVideoSelector();
      }
    });
  });
}

function loadSettings() {
  console.log('[Settings] Carregando configurações...');

  if (!currentUser) {
    console.error('[Settings] currentUser não disponível');
    return;
  }

  // Preenche informações da conta
  const settingsEmail = document.getElementById('settingsEmail');
  const settingsMemberSince = document.getElementById('settingsMemberSince');

  if (settingsEmail) settingsEmail.textContent = currentUser.email;
  if (settingsMemberSince && currentUser.created_at) {
    const memberDate = new Date(currentUser.created_at);
    settingsMemberSince.textContent = memberDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  // Preenche informações de assinatura
  const settingsPlan = document.getElementById('settingsPlan');
  const settingsCredits = document.getElementById('settingsCredits');
  const settingsPeriodEnd = document.getElementById('settingsPeriodEnd');
  const manageBtn = document.getElementById('manageSubscriptionBtn');
  const upgradeBtn = document.getElementById('upgradeBtn');

  // Busca dados atualizados de assinatura
  window.AuthLib.authFetch('/api/me')
    .then(res => res.json())
    .then(data => {
      if (data.subscription) {
        const planName = data.subscription.plans?.name || data.subscription.plan_id || 'Desconhecido';
        if (settingsPlan) settingsPlan.textContent = `Plano ${planName}`;

        // Mostra botão de gerenciar se tiver Stripe configurado
        if (manageBtn) manageBtn.style.display = 'inline-flex';
      } else {
        if (settingsPlan) settingsPlan.textContent = 'Sem assinatura ativa';
        if (upgradeBtn) upgradeBtn.style.display = 'inline-flex';
      }

      // Calcula total de créditos disponíveis (quota + pacotes)
      const quotaRemaining = data.quota ? data.quota.remaining : 0;
      const packTotal = data.pack_credits_total || 0;
      const totalCredits = quotaRemaining + packTotal;

      if (data.quota) {
        if (settingsCredits) {
          if (packTotal > 0) {
            settingsCredits.textContent = `${totalCredits} créditos (${quotaRemaining} mensais + ${packTotal} avulsos)`;
          } else {
            settingsCredits.textContent = `${quotaRemaining}/${data.quota.limit} créditos mensais`;
          }
        }
        if (settingsPeriodEnd) {
          const endDate = new Date(data.quota.period_end);
          settingsPeriodEnd.textContent = endDate.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          });
        }
      } else if (packTotal > 0) {
        if (settingsCredits) {
          settingsCredits.textContent = `${packTotal} créditos avulsos`;
        }
        if (settingsPeriodEnd) {
          settingsPeriodEnd.textContent = 'Não expira';
        }
      } else {
        if (settingsCredits) settingsCredits.textContent = '0 créditos';
        if (settingsPeriodEnd) settingsPeriodEnd.textContent = '—';
      }
    })
    .catch(err => {
      console.error('[Settings] Erro carregando dados:', err);
    });

  // Handler do botão "Gerenciar Assinatura"
  if (manageBtn) {
    manageBtn.onclick = () => {
      showToast('Integração com Stripe será implementada na Fase 1F', 'info');
    };
  }
}

// Helper: valida se job deve aparecer na galeria
function isValidJob(g) {
  // Exclui status inválidos
  if (g.status === 'deleted' || g.status === 'pending' || g.status === 'failed') return false;

  // Exclui jobs órfãos (processing/in_queue sem result_url)
  if ((g.status === 'processing' || g.status === 'in_queue') && !g.result_url) return false;

  return true;
}

async function loadGallery(type) {
  const view = type === 'photo' ? 'fotos' : 'videos';
  const gridId = view + 'Grid';
  const loadingId = view + 'Loading';
  const emptyId = view + 'Empty';
  const statsId = view + 'Stats';

  const grid = document.getElementById(gridId);
  const loading = document.getElementById(loadingId);
  const empty = document.getElementById(emptyId);

  if (!grid) return;

  // Mostra loading
  if (loading) loading.style.display = 'flex';
  if (empty) empty.style.display = 'none';

  try {
    const res = await window.AuthLib.authFetch('/api/me/generations');
    if (!res.ok) throw new Error('Falha ao buscar gerações');

    const data = await res.json();
    const allGenerations = data.generations || [];

    // Filtra por tipo e status
    const items = allGenerations.filter(g => {
      if (!isValidJob(g)) return false;

      // Filtra por tipo
      if (type === 'photo') return g.generation_type === 'photo';
      return g.generation_type === 'video_movement' || g.generation_type === 'video_talking';
    });

    // Atualiza cache
    galleryCache[view] = items;
    galleryCache.loadedAt = Date.now();

    // Esconde loading
    if (loading) loading.style.display = 'none';

    // Atualiza stats
    const total = items.length;
    const completed = items.filter(g => g.status === 'completed').length;
    const processing = items.filter(g => g.status === 'processing' || g.status === 'in_queue').length;

    if (document.getElementById(view + 'Total')) {
      document.getElementById(view + 'Total').textContent = total;
    }
    if (document.getElementById(view + 'Completed')) {
      document.getElementById(view + 'Completed').textContent = completed;
    }
    if (document.getElementById(view + 'Processing')) {
      document.getElementById(view + 'Processing').textContent = processing;
    }

    // Renderiza items
    renderGalleryItems(view, items);

    // Atualiza painel direito com os mais recentes de todas as gerações
    loadRecentPanel(allGenerations);

  } catch (err) {
    console.error('[Gallery] Erro carregando galeria:', err);
    if (loading) loading.style.display = 'none';
    if (empty) {
      empty.style.display = 'flex';
      empty.querySelector('p').textContent = 'Erro ao carregar galeria. Tente novamente.';
    }
  }
}

function loadRecentPanel(generations) {
  const grid = document.getElementById('recentGrid');
  if (!grid) return;

  // Painel "Recentes" mostra apenas fotos completas (não vídeos)
  const recent = (generations || [])
    .filter(g => g.result_url && g.status === 'completed' && g.generation_type === 'photo')
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 4);

  if (recent.length === 0) {
    grid.innerHTML = '<div class="recent-empty">Nenhuma geração ainda</div>';
    return;
  }

  grid.innerHTML = '';
  recent.forEach(item => {
    const isVideo = false; // Sempre false pois já filtramos apenas fotos
    const el = document.createElement('div');
    el.className = `recent-thumb${isVideo ? ' recent-thumb-video' : ''}`;
    el.title = isVideo ? 'Vídeo' : 'Foto';
    el.style.cursor = 'pointer';
    el.onclick = () => openGenerationModal(item.id);

    if (isVideo) {
      el.innerHTML = `<video src="${item.result_url}" muted style="width:100%;height:100%;object-fit:cover;"></video>`;
    } else {
      el.innerHTML = `<img src="${item.result_url}" alt="Geração recente" loading="lazy" style="width:100%;height:100%;object-fit:cover;">`;
    }

    grid.appendChild(el);
  });
}

async function downloadGeneration(url) {
  const a = document.createElement('a');
  a.href = url;
  a.download = `modelo-facil-${Date.now()}.jpg`;
  a.target = '_blank';
  a.click();
}

// === FASE DESIGN 3 — Gallery helpers ===

function renderGalleryItems(view, items) {
  const gridId = view + 'Grid';
  const emptyId = view + 'Empty';
  const grid = document.getElementById(gridId);
  const empty = document.getElementById(emptyId);

  if (!grid) return;

  // Remove itens antigos (mantém loading e empty)
  Array.from(grid.children).forEach(child => {
    if (!child.classList.contains('gallery-loading') && !child.classList.contains('gallery-empty')) {
      child.remove();
    }
  });

  if (items.length === 0) {
    if (empty) {
      empty.style.display = 'flex';
      empty.querySelector('p').textContent = view === 'fotos' ? 'Suas fotos geradas aparecerão aqui' : 'Seus vídeos gerados aparecerão aqui';
    }
    return;
  }

  if (empty) empty.style.display = 'none';

  items.forEach(item => {
    // Detecção explícita de vídeo (não assume que "tudo que não é photo é video")
    const isVideo = item.generation_type === 'video_movement' || item.generation_type === 'video_talking';
    const el = document.createElement('div');
    el.className = 'gallery-item';

    // Mobile: toggle botão de ações ao clicar no card
    let clickTimeout;
    el.onclick = (e) => {
      console.log('[DEBUG] Card clicado, item ID:', item.id);

      // Se clicou no botão de ação, não faz nada (o botão já trata)
      if (e.target.closest('.gallery-action-btn')) {
        console.log('[DEBUG] Clicou no botão de ação, ignorando');
        return;
      }

      // Mobile: primeiro clique mostra botão, segundo clique abre modal
      const isMobile = window.matchMedia('(hover: none)').matches;
      console.log('[DEBUG] É mobile?', isMobile);

      if (isMobile) {
        if (!el.classList.contains('show-actions')) {
          e.stopPropagation();
          // Remove classe de outros cards
          document.querySelectorAll('.gallery-item.show-actions').forEach(i => i.classList.remove('show-actions'));
          el.classList.add('show-actions');
          // Auto-remove após 3s
          clearTimeout(clickTimeout);
          clickTimeout = setTimeout(() => el.classList.remove('show-actions'), 3000);
          return;
        }
      }

      // Desktop ou segundo clique mobile: abre modal
      openGenerationModal(item.id);
    };

    el.style.cursor = 'pointer';

    const date = new Date(item.created_at).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });

    const typeLabel = item.generation_type === 'photo' ? 'Foto' :
                      item.generation_type === 'video_movement' ? 'Movimento' : 'Falando';

    // Badge de status
    let badge = '';
    if (item.status === 'processing' || item.status === 'in_queue') {
      badge = '<div class="gallery-badge processing">Processando</div>';
    } else if (item.status === 'failed') {
      badge = '<div class="gallery-badge failed">Falhou</div>';
    } else if (item.status === 'completed') {
      badge = '<div class="gallery-badge completed">Concluída</div>';
    }

    // Preview (só mostra se tiver result_url)
    let preview = '';
    if (item.result_url && item.status === 'completed') {
      if (isVideo) {
        preview = `<video src="${item.result_url}" muted loop style="width:100%;aspect-ratio:4/5;object-fit:cover;" onmouseenter="this.play()" onmouseleave="this.pause()"></video>`;
      } else {
        preview = `<img src="${item.result_url}" alt="Foto gerada" loading="lazy">`;
      }
    } else {
      // Placeholder para processando/falhou
      preview = `<div style="width:100%;aspect-ratio:4/5;background:var(--bg-elevado);display:flex;align-items:center;justify-content:center;color:var(--texto-muted);font-size:2rem;">${item.status === 'processing' ? '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>' : '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'}</div>`;
    }

    el.innerHTML = `
      ${preview}
      ${badge}
      <div class="gallery-item-actions">
        <button class="gallery-action-btn" data-action="delete" title="Remover">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
      <div class="gallery-item-info">
        <div class="gallery-item-type">${typeLabel}</div>
        <div class="gallery-item-date">${date}</div>
      </div>
    `;

    // Botão de delete (previne propagação para não abrir modal)
    const deleteBtn = el.querySelector('[data-action="delete"]');
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      confirmDeleteGeneration(item.id);
    };

    grid.appendChild(el);
  });
}

function filterGallery(view, filter) {
  const items = galleryCache[view];
  if (!items) return;

  // Atualiza botões de filtro
  const filterBtns = document.querySelectorAll(`#view${view.charAt(0).toUpperCase() + view.slice(1)} .filter-btn`);
  filterBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });

  let filtered = items;

  if (filter === 'completed') {
    filtered = items.filter(g => g.status === 'completed');
  } else if (filter === 'processing') {
    filtered = items.filter(g => isValidJob(g) && (g.status === 'processing' || g.status === 'in_queue'));
  } else if (filter === 'movement') {
    filtered = items.filter(g => g.generation_type === 'video_movement');
  } else if (filter === 'talking') {
    filtered = items.filter(g => g.generation_type === 'video_talking');
  }
  // 'all' não filtra

  renderGalleryItems(view, filtered);
}

async function openGenerationModal(generationId) {
  console.log('[DEBUG] openGenerationModal chamada com ID:', generationId);
  try {
    // Busca dados atualizados da geração
    const res = await window.AuthLib.authFetch('/api/me/generations');
    console.log('[DEBUG] Fetch completado, status:', res.status);
    if (!res.ok) throw new Error('Falha ao buscar gerações');

    const data = await res.json();
    const generation = (data.generations || []).find(g => g.id === generationId);

    if (!generation) {
      showToast('Geração não encontrada', 'error');
      return;
    }

    // DEBUG: verificar se input_payload está chegando
    console.log('[DEBUG] Generation object:', {
      id: generation.id,
      has_input_payload: !!generation.input_payload,
      has_product_image: !!generation.input_payload?.inputs?.product_image,
      product_image_size: generation.input_payload?.inputs?.product_image?.length
    });

    const modal = document.getElementById('generationModal');
    const modalImage = document.getElementById('modalImage');
    const modalVideo = document.getElementById('modalVideo');
    const modalTitle = document.getElementById('modalTitle');
    const modalType = document.getElementById('modalType');
    const modalStatus = document.getElementById('modalStatus');
    const modalCreated = document.getElementById('modalCreated');
    const modalCompleted = document.getElementById('modalCompleted');
    const modalCredits = document.getElementById('modalCredits');
    const modalDownload = document.getElementById('modalDownload');
    const modalVariations = document.getElementById('modalVariations');
    const modalDelete = document.getElementById('modalDelete');

    // Atualiza título
    const typeLabel = generation.generation_type === 'photo' ? 'Foto' :
                      generation.generation_type === 'video_movement' ? 'Vídeo de Movimento' : 'Vídeo Falando';
    modalTitle.textContent = typeLabel;

    // Preview
    const isVideo = generation.generation_type === 'video_movement' || generation.generation_type === 'video_talking';
    if (generation.result_url && generation.status === 'completed') {
      if (isVideo) {
        modalVideo.src = generation.result_url;
        modalVideo.style.display = 'block';
        modalImage.style.display = 'none';
      } else {
        modalImage.src = generation.result_url;
        modalImage.style.display = 'block';
        modalVideo.style.display = 'none';
      }
    } else {
      modalImage.style.display = 'none';
      modalVideo.style.display = 'none';
    }

    // Info
    modalType.textContent = typeLabel;
    modalStatus.textContent = generation.status === 'completed' ? 'Concluída' :
                              generation.status === 'processing' ? 'Processando' :
                              generation.status === 'in_queue' ? 'Na fila' :
                              generation.status === 'failed' ? 'Falhou' : generation.status;

    modalCreated.textContent = new Date(generation.created_at).toLocaleString('pt-BR');
    modalCompleted.textContent = generation.completed_at ? new Date(generation.completed_at).toLocaleString('pt-BR') : '—';
    modalCredits.textContent = generation.credits_cost || '—';

    // Botões
    if (generation.result_url && generation.status === 'completed') {
      modalDownload.style.display = 'inline-flex';
      modalDownload.onclick = () => {
        const a = document.createElement('a');
        a.href = generation.result_url;
        a.download = `modelo-facil-${generation.id}.${isVideo ? 'mp4' : 'jpg'}`;
        a.target = '_blank';
        a.click();
        showToast('Download iniciado', 'success');
      };
    } else {
      modalDownload.style.display = 'none';
    }

    // Botão "Criar Variações" - apenas para fotos completas
    if (generation.generation_type === 'photo' && generation.result_url && generation.status === 'completed') {
      modalVariations.style.display = 'inline-flex';
      modalVariations.onclick = () => {
        closeGenerationModal();
        generateVariationsFromGallery(generation);
      };
    } else {
      modalVariations.style.display = 'none';
    }

    modalDelete.onclick = () => confirmDeleteGeneration(generationId);

    // Mostra modal
    modal.style.display = 'flex';

    // Fecha com ESC
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        closeGenerationModal();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);

  } catch (err) {
    console.error('[Modal] Erro abrindo modal:', err);
    showToast('Erro ao abrir detalhes', 'error');
  }
}

function closeGenerationModal() {
  const modal = document.getElementById('generationModal');
  const modalVideo = document.getElementById('modalVideo');

  if (modalVideo) {
    modalVideo.pause();
    modalVideo.src = '';
  }

  if (modal) {
    modal.style.display = 'none';
  }
}

async function confirmDeleteGeneration(generationId) {
  if (!confirm('Tem certeza que deseja deletar esta geração? Esta ação não pode ser desfeita.')) {
    return;
  }

  try {
    const res = await window.AuthLib.authFetch(`/api/generations/${generationId}`, {
      method: 'DELETE'
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Falha ao deletar');
    }

    showToast('Geração deletada com sucesso', 'success');
    closeGenerationModal();

    // Recarrega galeria
    const activeView = document.querySelector('.sidebar-item[data-view].active');
    if (activeView) {
      const view = activeView.dataset.view;
      if (view === 'fotos') loadGallery('photo');
      if (view === 'videos') loadGallery('video');
    }

  } catch (err) {
    console.error('[Delete] Erro deletando geração:', err);
    showToast(`Erro ao deletar: ${err.message}`, 'error');
  }
}

async function bootAuth() {
  const session = await window.AuthLib.requireSession();
  if (!session) return false;
  
  try {
    const res = await window.AuthLib.authFetch('/api/me');
    if (!res.ok) throw new Error('Falha em /api/me');
    
    const data = await res.json();
    currentUser = data.user;
    currentQuota = data.quota;

    // appHeader não existe mais no layout sidebar - remover após migração completa
    const appHeader = document.getElementById('appHeader');
    if (appHeader) appHeader.style.display = 'flex';

    const profileEmail = document.getElementById('profileEmail');
    if (profileEmail) profileEmail.textContent = currentUser.email;
    
    const profilePlan = document.getElementById('profilePlan');
    const profileCredits = document.getElementById('profileCredits');
    const profilePeriod = document.getElementById('profilePeriod');

    if (data.subscription) {
      const planName = data.subscription.plans?.name || data.subscription.plan_id;
      if (profilePlan) profilePlan.textContent = `Plano ${planName}`;
    } else {
      if (profilePlan) profilePlan.textContent = 'Sem assinatura';
    }

    const quotaRemaining = data.quota ? data.quota.remaining : 0;
    const packTotal = data.pack_credits_total || 0;
    const totalCredits = quotaRemaining + packTotal;

    if (data.quota) {
      if (profileCredits) {
        if (packTotal > 0) {
          profileCredits.textContent = `${totalCredits} créditos`;
        } else {
          profileCredits.textContent = `${quotaRemaining}/${data.quota.limit} créditos`;
        }
      }
      const endDate = new Date(data.quota.period_end).toLocaleDateString('pt-BR');
      if (profilePeriod) profilePeriod.textContent = `Renova em ${endDate}`;
    } else if (packTotal > 0) {
      if (profileCredits) profileCredits.textContent = `${packTotal} créditos avulsos`;
    }

    // === FASE DESIGN 2: Preenche sidebar de créditos ===
    const sidebarCredits = document.getElementById('sidebarCredits');
    const sidebarPlan = document.getElementById('sidebarPlan');
    const sidebarCreditsCount = document.getElementById('sidebarCreditsCount');
    const sidebarPeriod = document.getElementById('sidebarPeriod');

    if (sidebarCredits) {
      sidebarCredits.style.display = 'block';

      if (data.subscription) {
        const planName = data.subscription.plans?.name || data.subscription.plan_id;
        if (sidebarPlan) sidebarPlan.textContent = `Plano ${planName}`;
      } else {
        if (sidebarPlan) sidebarPlan.textContent = 'Sem assinatura';
      }

      if (data.quota) {
        if (sidebarCreditsCount) {
          if (packTotal > 0) {
            sidebarCreditsCount.textContent = `${totalCredits} créditos`;
          } else {
            sidebarCreditsCount.textContent = `${quotaRemaining}/${data.quota.limit} créditos`;
          }
        }
        const endDate = new Date(data.quota.period_end).toLocaleDateString('pt-BR');
        if (sidebarPeriod) sidebarPeriod.textContent = `Renova em ${endDate}`;
      } else if (packTotal > 0) {
        if (sidebarCreditsCount) sidebarCreditsCount.textContent = `${packTotal} créditos`;
      }
    }

    // Listeners antigos (profileBtn não existe mais, mas mantém para compatibilidade)
    const profileBtn = document.getElementById('profileBtn');
    if (profileBtn) {
      profileBtn.addEventListener('click', () => {
        const dd = document.getElementById('profileDropdown');
        dd.style.display = dd.style.display === 'none' ? 'block' : 'none';
      });
    }

    document.addEventListener('click', (e) => {
      const dd = document.getElementById('profileDropdown');
      if (dd && !e.target.closest('.profile-menu')) {
        dd.style.display = 'none';
      }
    });

    // logoutBtn agora está na sidebar
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        window.AuthLib.logout();
      });
    }

    // navConfig agora usa data-view e é tratado por initSidebarNav()

    return true;
  } catch (err) {
    console.error('[BOOT] Erro carregando perfil:', err);
    return false;
  }
}

async function refreshProfile() {
  try {
    const res = await window.AuthLib.authFetch('/api/me');
    if (!res.ok) return;
    const data = await res.json();

    // Atualiza IDs antigos (compatibilidade)
    const quotaRemaining = data.quota ? data.quota.remaining : 0;
    const packTotal = data.pack_credits_total || 0;
    const totalCredits = quotaRemaining + packTotal;

    const profileCredits = document.getElementById('profileCredits');
    if (profileCredits) {
      if (data.quota) {
        if (packTotal > 0) {
          profileCredits.textContent = `${totalCredits} créditos`;
        } else {
          profileCredits.textContent = `${quotaRemaining}/${data.quota.limit} créditos`;
        }
      } else if (packTotal > 0) {
        profileCredits.textContent = `${packTotal} créditos avulsos`;
      }
    }

    // === FASE DESIGN 2: Atualiza sidebar também ===
    const sidebarCreditsCount = document.getElementById('sidebarCreditsCount');
    if (sidebarCreditsCount) {
      if (data.quota) {
        if (packTotal > 0) {
          sidebarCreditsCount.textContent = `${totalCredits} créditos`;
        } else {
          sidebarCreditsCount.textContent = `${quotaRemaining}/${data.quota.limit} créditos`;
        }
      } else if (packTotal > 0) {
        sidebarCreditsCount.textContent = `${packTotal} créditos`;
      }
    }
  } catch (err) {
    console.error('[refreshProfile]', err);
  }
}

// ===== DADOS: Modelos, Cenários, Poses, Estilos =====
const SCENARIOS = [
  // Parede ao fundo (com variantes)
  {
    id: 's1',
    icon: '🎨',
    label: 'Parede ao fundo',
    sub: 'Fundo neutro',
    hasVariants: true,
    variants: [
      {
        id: 'v1',
        label: 'Branca lisa',
        prompt: 'smooth white wall background, clean minimal backdrop, professional studio lighting, no texture, seamless white surface'
      },
      {
        id: 'v2',
        label: 'Ripado madeira',
        prompt: 'wooden slatted panel background, vertical wood slats, natural brown wood texture, modern interior design, warm ambient lighting'
      },
      {
        id: 'v3',
        label: 'Boiserie cinza',
        prompt: 'gray boiserie wall paneling background, elegant wainscoting, sophisticated gray panel molding, classic interior design, soft studio lighting'
      }
    ]
  },

  // Boutique brasileira
  {
    id: 's2',
    icon: '🏬',
    label: 'Boutique brasileira',
    sub: 'Shopping/classe média',
    prompt: 'modern Brazilian boutique interior, organized clothing displays, professional retail lighting, clean wooden or white furniture, Instagram-friendly store design, air-conditioned shopping mall store, elegant but accessible, middle-class fashion retail'
  },

  // Lojas do Brás (com variantes)
  {
    id: 's3',
    icon: '🏙️',
    label: 'Lojas do Brás - SP',
    sub: 'Comércio popular',
    hasVariants: true,
    variants: [
      {
        id: 'v1',
        label: 'Loja popular',
        prompt: 'interior of popular Brás fashion store São Paulo, clothing racks packed with products, typical Brás commerce atmosphere, fluorescent lighting, well-displayed merchandise, no people in background, focus on model and clothing, wholesale district retail style'
      },
      {
        id: 'v2',
        label: 'Loja organizada',
        prompt: 'organized Brás fashion store interior São Paulo, same popular store style but tidier, organized clothing racks, folded garment displays, improved lighting, clean retail space, no people in background, professional but accessible commerce environment'
      }
    ]
  },

  // Selfie no espelho
  {
    id: 's4',
    icon: '🤳',
    label: 'Selfie no espelho',
    sub: 'Instagram/TikTok',
    prompt: 'mirror selfie photo style, model holding smartphone aimed at mirror throughout entire video from start to finish, phone never moves or lowers, phone stays fixed pointing at mirror the entire time, model visible in mirror reflection holding phone up, casual Instagram selfie atmosphere, fitting room or bedroom mirror, natural lighting, phone hand remains raised and steady for the complete duration of the video'
  },

  // Mantidos
  { id: 's5', icon: '🌿', label: 'Ambiente natural', sub: 'Jardim', prompt: 'natural outdoor setting, soft green background, daylight' },
  { id: 's6', icon: '🏙️', label: 'Cenário urbano', sub: 'Cidade', prompt: 'urban cityscape background, modern city' },
];

const POSES = [
  { id: 'p1', icon: '🧍', label: 'Frente completa', prompt: 'standing facing camera, full body front view' },
  { id: 'p2', icon: '↩️', label: 'Lateral', prompt: 'side profile pose, looking sideways' },
  { id: 'p3', icon: '🔄', label: 'Pose 3/4', prompt: 'three-quarter angle pose, looking slightly away' },
  { id: 'p4', icon: '✋', label: 'Mão na cintura', prompt: 'hand on hip, confident pose' },
  { id: 'p5', icon: '🚶', label: 'Andando', prompt: 'walking pose, natural movement' },
  { id: 'p6', icon: '👀', label: 'Olhando câmera', prompt: 'direct eye contact with camera, engaging pose' },
  { id: 'p7', icon: '👗', label: 'Close do look', prompt: 'close-up of clothing details, fashion close shot' },
  { id: 'p8', icon: '📐', label: 'Meio corpo', prompt: 'half body shot, waist up' },
];

// Sufixo de zoom universal para todos os vídeos de movimento
// REMOVIDO: zoom causava deformação em m1-m6. Zoom mantido apenas em m7-v1 e m7-v2 (prompts detalhados)
const MOVEMENT_ZOOM_SUFFIX = '';

const MOVEMENT_STYLES = [
  {
    id: 'm1',
    icon: '✨',
    label: 'Natural',
    sub: 'Recomendado',
    prompt: 'Brazilian fashion model in professional studio, moving naturally as if standing in real life, subtle confident movements at normal human speed including slight body sway, natural arm movement, occasional hair touch, weight shifting naturally between feet, camera completely static, full body shot showing complete outfit from head to toe, soft warm studio lighting, no zoom, no slow motion, no freezing, model must be visibly moving throughout the entire video at real human speed',
    badge: 'Melhor resultado'
  },
  {
    id: 'm2',
    icon: '💨',
    label: 'Vento no look',
    sub: 'Tecido em movimento',
    prompt: 'Fashion model posing outdoors, fabric and hair flowing gracefully in a gentle breeze, golden hour lighting, fabric texture clearly visible, model maintaining elegant composure, soft bokeh background, camera static then quick orbit, natural real-life speed, no slow motion'
  },
  {
    id: 'm3',
    icon: '🚶',
    label: 'Modelo andando',
    sub: 'Deslocamento suave',
    prompt: 'High-fashion model walking confidently toward camera on a clean studio floor, fluid natural stride at real walking pace, arms swinging slightly, garment in full view showing fit and movement, soft diffused studio lighting, camera at eye level tracking forward at natural speed, no slow motion'
  },
  {
    id: 'm4',
    icon: '🙆',
    label: 'Gesto suave',
    sub: 'Movimento de braço',
    prompt: 'Fashion model making a graceful hand gesture, touching hair or adjusting collar with delicate movement at natural pace, close-medium shot showing garment detail, warm soft lighting, cinematic depth of field, elegant and natural expression, subtle smile, camera static then quick zoom, natural real-life speed, no slow motion'
  },
  {
    id: 'm5',
    icon: '🔄',
    label: 'Giro elegante',
    sub: 'Mostra todos os ângulos',
    prompt: 'Fashion model doing elegant 360-degree turn at natural rotation speed showing all angles of the garment, full body shot, clean white studio background, professional fashion show lighting, smooth rotation, fabric movement visible, camera stationary at medium distance, natural real-life speed, no slow motion'
  },
  {
    id: 'm6',
    icon: '🪞',
    label: 'Vista no espelho',
    sub: 'Frente e costas',
    prompt: 'Fashion model posing in front of a mirror, showing front and back of the garment simultaneously, boutique interior setting, warm ambient lighting, model adjusting outfit at natural pace, cinematic composition, camera static then quick pan to reveal both angles, natural real-life speed, no slow motion'
  },
  {
    id: 'm7',
    icon: '📸',
    label: 'Pose de Modelo',
    sub: 'Profissional fashion',
    hasVariants: true,
    variants: [
      {
        id: 'v1',
        label: 'Atitude Natural',
        prompt: 'Brazilian fashion model in professional studio with warm soft lighting, SCENE 1 (0-2s): camera static in medium shot framing model from waist to head, model looks slightly to the side with relaxed confident expression, SCENE 2 (2-4s): model naturally raises right hand and runs fingers through hair tilting head slightly, camera remains static, SCENE 3 (4-6s): model lowers hand and gently adjusts garment neckline or hem with fingertips looking briefly downward showing fabric drape and fit, SCENE 4 (6-7s): model turns head directly toward camera with soft natural smile and direct eye contact, SCENE 5 (7-9s): camera performs moderate zoom directly onto garment fabric showing texture and drape without cutting model out of frame, holds on detail for 2 seconds, SCENE 6 (9-10s): camera slowly and smoothly pulls back to medium shot revealing model standing still in confident natural pose looking directly at camera, slow gradual pull back not a snap, model face consistent and unchanged throughout, same identical model from start to finish'
      },
      {
        id: 'v2',
        label: 'Look Completo',
        prompt: 'Brazilian fashion model on clean white studio floor with professional lighting, SCENE 1 (0-1s): camera static wide shot showing complete outfit head to toe, model standing still upright posture looking forward, SCENE 2 (1-6s): model performs single smooth 360-degree rotation at natural walking pace showing complete outfit from all angles front right-side back left-side then front again, camera remains completely static and wide throughout rotation, no gestures or expressions during rotation, SCENE 3 (6-7s): model stops after completing one full rotation standing in confident frontal pose looking directly at camera, SCENE 4 (7-9s): camera performs moderate zoom directly onto garment fabric not face revealing fabric texture stitching and clothing details while keeping model partially in frame, holds on detail for 2 seconds, SCENE 5 (9-10s): camera snaps back quickly to full body wide shot with model in final standing pose, no second rotation, same identical model throughout entire video, natural real-life speed, no slow motion, professional runway showcase mood'
      }
    ]
  },
  {
    id: 'm8',
    icon: '🤳',
    label: 'Selfie no espelho',
    sub: 'Celular no espelho',
    scenarioOnly: 's4',
    prompt: 'A person is actively taking a mirror selfie, their body has continuous subtle natural movement throughout the entire video including slight breathing motion, natural body sway, and small weight shifts, one arm raised holding a smartphone pointed at the mirror, the raised arm holding the phone stays up during the video but the person is clearly alive and moving, visible reflection in mirror showing the outfit, casual everyday selfie moment, ambient room lighting, the scene has visible motion and life throughout, no freeze frames, no static poses, person must be visibly moving at all times'
  }
];

// ===== ESTADO =====
const state = {
  photoStep: 1,
  videoStep: 1,
  activeMenu: 'photo',

  productImageBase64: null,

  selectedModel: null,
  selectedPresetModel: null,
  selectedScenario: null,
  selectedVariant: null,
  selectedPoses: [],

  videoStyle: null,         // 'movement' | 'talking'
  selectedMovement: null,
  selectedMovementVariant: null,  // Separate from selectedVariant (scenarios)
  selectedSessionImage: null,

  resultImageUrl: null,
  resultVideoUrl: null,
  sessionImages: [],

  isGenerating: false,
};

const IMAGE_CREDITS = {
  fast: { '1k': 1, '2k': 2, '4k': 3 },
  balanced: { '1k': 2, '2k': 3, '4k': 4 },
  quality: { '1k': 3, '2k': 4, '4k': 5 },
};

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async () => {
  const ok = await bootAuth();
  if (!ok) return;

  // === FASE DESIGN 2: Inicializa navegação da sidebar ===
  initSidebarNav();

  // Carrega galeria em background para popular o painel direito
  loadGallery('photo').catch(err => console.log('[Init] Galeria ainda vazia:', err.message));

  buildSelectionGrid('scenarioGrid', SCENARIOS, 'scenario');
  buildSelectionGrid('poseGrid', POSES, 'pose', true);
  buildSelectionGrid('movementStyleGrid', MOVEMENT_STYLES, 'movement');

  setupFileInput('productFileInput', 'productUploadZone', 'productPreview', (b64) => {
    state.productImageBase64 = b64;
    document.getElementById('btnNextStep1').disabled = false;
  });

  setupDragDrop('productUploadZone', 'productFileInput');

  document.getElementById('resolutionSelect').addEventListener('change', updateImageCost);
  document.getElementById('modeSelect').addEventListener('change', updateImageCost);
  document.getElementById('videoDuration').addEventListener('change', updateVideoCost);
  document.getElementById('videoResolution').addEventListener('change', updateVideoCost);

  updateImageCost();
  updateVideoCost();
});

// ===== BUILDERS =====
function buildSelectionGrid(containerId, items, type, multi = false) {
  const grid = document.getElementById(containerId);
  grid.innerHTML = items.map(item => {
    let html = `
      <div class="sel-card ${item.hasVariants ? 'has-variants' : ''}" id="${type}_${item.id}" onclick="selectCard('${type}', '${item.id}', ${multi})">
        <div class="sel-card-icon">${item.icon}</div>
        <div class="sel-card-label">${item.label}${item.hasVariants ? ' ▼' : ''}</div>
        ${item.sub ? `<div class="sel-card-sub">${item.sub}</div>` : ''}
        ${item.badge ? `<div class="sel-card-sub" style="color:var(--purple-light);font-weight:600">${item.badge}</div>` : ''}
      </div>`;

    // Se tem variantes, adiciona os sub-cards (inicialmente ocultos)
    if (item.hasVariants && item.variants) {
      html += `<div class="variants-container" id="variants_${type}_${item.id}" style="display:none;margin-left:20px;">`;
      item.variants.forEach(variant => {
        html += `
          <div class="sel-card variant-card" id="${type}_${item.id}_${variant.id}" onclick="selectVariant('${type}', '${item.id}', '${variant.id}'); event.stopPropagation();">
            <div class="sel-card-label" style="font-size:0.9em;">→ ${variant.label}</div>
          </div>`;
      });
      html += `</div>`;
    }

    return html;
  }).join('');
}

// ===== SELEÇÃO DE CARDS =====
function selectCard(type, id, multi = false) {
  const el = document.getElementById(`${type}_${id}`);
  const allCards = document.querySelectorAll(`#${type}Grid .sel-card, #${type}StyleGrid .sel-card`);

  if (multi) {
    el.classList.toggle('selected');
    state.selectedPoses = [...document.querySelectorAll('#poseGrid .sel-card.selected')]
      .map(c => POSES.find(p => `pose_${p.id}` === c.id));
    document.getElementById('btnNextStep4').disabled = state.selectedPoses.length === 0;
  } else {
    allCards.forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');

    if (type === 'scenario') {
      const scenario = SCENARIOS.find(s => s.id === id);
      state.selectedScenario = scenario;
      state.selectedVariant = null; // Reset variant quando troca cenário

      // Se cenário tem variantes, mostra/oculta o container de variantes
      if (scenario && scenario.hasVariants) {
        // Oculta todos os containers de variantes
        document.querySelectorAll('.variants-container').forEach(v => v.style.display = 'none');
        // Mostra as variantes deste cenário
        const variantsContainer = document.getElementById(`variants_${type}_${id}`);
        if (variantsContainer) {
          variantsContainer.style.display = 'block';
        }
        // Não habilita o botão ainda - precisa selecionar variante
        document.getElementById('btnNextStep3').disabled = true;
      } else {
        // Cenário sem variantes - oculta todos containers e habilita botão
        document.querySelectorAll('.variants-container').forEach(v => v.style.display = 'none');
        document.getElementById('btnNextStep3').disabled = false;
      }

      // Rebuild movement grid baseado no cenário selecionado
      const visibleMovements = MOVEMENT_STYLES.filter(m => {
        if (m.scenarioOnly) {
          return state.selectedScenario?.id === m.scenarioOnly;
        }
        if (state.selectedScenario?.id === 's4') {
          return false;
        }
        return true;
      });
      buildSelectionGrid('movementStyleGrid', visibleMovements, 'movement');

      // Reset movimento se m8 e cenário não for s4
      if (state.selectedMovement?.id === 'm8' && state.selectedScenario?.id !== 's4') {
        state.selectedMovement = null;
        state.selectedMovementVariant = null;
      }

      // Mostra/oculta aviso para cenário s4
      const s4Warning = document.getElementById('s4Warning');
      if (s4Warning) {
        s4Warning.style.display = (scenario?.id === 's4') ? 'block' : 'none';
      }
    } else if (type === 'movement') {
      const movement = MOVEMENT_STYLES.find(m => m.id === id);
      state.selectedMovement = movement;
      state.selectedMovementVariant = null; // Reset variant quando troca movimento
      state.videoStyle = 'movement';
      document.getElementById('talkingForm').style.display = 'none';
      document.getElementById('btnSelectTalking').style.display = '';

      // Se movimento tem variantes, mostra/oculta o container de variantes
      if (movement && movement.hasVariants) {
        // Oculta todos os containers de variantes
        document.querySelectorAll('.variants-container').forEach(v => v.style.display = 'none');
        // Mostra as variantes deste movimento
        const variantsContainer = document.getElementById(`variants_${type}_${id}`);
        if (variantsContainer) {
          variantsContainer.style.display = 'block';
        }
        // Não habilita o botão ainda - precisa selecionar variante
        document.getElementById('btnNextVideoStep2').disabled = true;
      } else {
        // Movimento sem variantes - oculta todos containers e habilita botão
        document.querySelectorAll('.variants-container').forEach(v => v.style.display = 'none');
        document.getElementById('btnNextVideoStep2').disabled = false;
      }
    }
  }
}

function selectVariant(type, parentId, variantId) {
  // Remove seleção de todas as variantes
  document.querySelectorAll('.variant-card').forEach(v => v.classList.remove('selected'));

  // Seleciona a variante clicada
  const variantEl = document.getElementById(`${type}_${parentId}_${variantId}`);
  if (variantEl) {
    variantEl.classList.add('selected');
  }

  // Dispatch: atualiza estado baseado no tipo
  if (type === 'scenario') {
    const scenario = SCENARIOS.find(s => s.id === parentId);
    if (scenario && scenario.variants) {
      state.selectedVariant = scenario.variants.find(v => v.id === variantId);
      // Habilita botão de próximo step
      document.getElementById('btnNextStep3').disabled = false;
    }
  } else if (type === 'movement') {
    const movement = MOVEMENT_STYLES.find(m => m.id === parentId);
    if (movement && movement.variants) {
      state.selectedMovementVariant = movement.variants.find(v => v.id === variantId);
      // Habilita botão de próximo step do vídeo
      document.getElementById('btnNextVideoStep2').disabled = false;
    }
  }
}

function selectVideoType(type) {
  if (type === 'talking') {
    // Desselecionar movimento
    document.querySelectorAll('#movementStyleGrid .sel-card').forEach(c => c.classList.remove('selected'));
    state.selectedMovement = null;
    state.videoStyle = 'talking';
    document.getElementById('talkingForm').style.display = 'block';
    document.getElementById('btnSelectTalking').textContent = '✅ Modelo falando selecionado';
    document.getElementById('btnNextVideoStep2').disabled = false;
  }
}

// ===== MENU SWITCH =====
function switchMenu(menu) {
  state.activeMenu = menu;
  document.querySelectorAll('.menu-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.menu-content').forEach(c => c.classList.remove('active'));
  document.getElementById(`tab${menu.charAt(0).toUpperCase() + menu.slice(1)}`).classList.add('active');
  document.getElementById(`menu${menu.charAt(0).toUpperCase() + menu.slice(1)}`).classList.add('active');

  // Carrega fotos do banco quando entra no menu de vídeo
  if (menu === 'video' && state.videoStep === 1) {
    loadPhotosForVideoSelector();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== PHOTO STEPS =====
// ===== PRESET MODELS =====
async function loadPresetModels() {
  const container = document.getElementById('presetModelsGrid');
  if (!container) return;

  container.innerHTML = '<div style="text-align:center;color:#6b9e98;padding:40px;">Carregando modelos...</div>';

  try {
    const res = await window.AuthLib.authFetch('/api/preset-models');
    const data = await res.json();
    const models = data.models || [];

    if (models.length === 0) {
      container.innerHTML = '<div style="text-align:center;color:#6b9e98;padding:40px;">Nenhuma modelo disponível</div>';
      return;
    }

    container.innerHTML = models.map(m => `
      <div class="preset-model-card" data-id="${m.id}" data-url="${m.reference_url}" data-name="${m.name}" onclick="selectPresetModel(this)">
        <img src="${m.reference_url}" alt="${m.name}" loading="lazy" onerror="this.src='https://placehold.co/200x267/163330/6b9e98?text=${m.name}'">
        <div class="preset-model-info">
          <span class="preset-model-name">${m.name}</span>
          <span class="preset-model-tags">${m.ethnicity === 'white' ? 'Branca' : m.ethnicity === 'black' ? 'Negra' : 'Morena'} · ${m.body_type === 'slim' || m.body_type === 'magro' ? 'Magra' : m.body_type === 'plus' ? 'Plus Size' : 'Curvilínea'} · ${m.age_range} anos</span>
        </div>
      </div>
    `).join('');

  } catch (err) {
    console.error('[PRESET-MODELS] Erro:', err);
    container.innerHTML = '<div style="text-align:center;color:#FF6B6B;padding:40px;">Erro ao carregar modelos</div>';
  }
}

function selectPresetModel(card) {
  // Remove seleção anterior
  document.querySelectorAll('.preset-model-card').forEach(c => c.classList.remove('selected'));
  // Seleciona o card clicado
  card.classList.add('selected');
  // Salva no estado
  state.selectedPresetModel = {
    id: card.dataset.id,
    url: card.dataset.url,
    name: card.dataset.name
  };
  // Atualiza state.selectedModel para compatibilidade com validação existente
  state.selectedModel = state.selectedPresetModel.name;
  console.log('[PRESET-MODELS] Modelo selecionada:', state.selectedPresetModel.name);
}

// ===== PHOTO STEPS =====
function goToPhotoStep(step) {
  if (step > state.photoStep) {
    if (step === 2 && !state.productImageBase64) { showToast('Envie a foto do produto primeiro.', 'error'); return; }
    if (step === 3 && !state.selectedModel) { showToast('Selecione uma modelo.', 'error'); return; }

    if (step === 4) {
      // Cenário é obrigatório
      if (!state.selectedScenario?.id) {
        showToast('Selecione um cenário.', 'error');
        return;
      }

      // Se cenário tem variantes, variante também é obrigatória
      if (state.selectedScenario?.hasVariants && !state.selectedVariant) {
        showToast('Escolha uma variante de parede.', 'error');
        return;
      }
    }

    if (step === 5 && state.selectedPoses.length === 0) { showToast('Selecione ao menos uma pose.', 'error'); return; }
  }

  state.photoStep = step;

  // Carrega modelos preset quando entrar na etapa 2
  if (step === 2) {
    loadPresetModels();
  }

  for (let i = 1; i <= 6; i++) {
    const sec = document.getElementById(`photoSection${i}`);
    const dot = document.getElementById(`photoStep${i}Dot`);
    sec?.classList.toggle('active', i === step);

    // Animar transição quando seção fica ativa
    if (i === step && sec) {
      animateStepTransition(sec);
    }

    dot?.classList.remove('active', 'completed');
    if (i === step) dot?.classList.add('active');
    else if (i < step) dot?.classList.add('completed');
  }
  for (let i = 1; i <= 5; i++) {
    document.getElementById(`photoLine${i}`)?.classList.toggle('active', i < step);
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== VIDEO STEPS =====
function goToVideoStep(step) {
  state.videoStep = step;
  for (let i = 1; i <= 4; i++) {
    const sec = document.getElementById(`videoSection${i}`);
    sec?.classList.toggle('active', i === step);

    // Animar transição quando seção fica ativa
    if (i === step && sec) {
      animateStepTransition(sec);
    }

    const dot = document.getElementById(`videoStep${i}Dot`);
    dot?.classList.remove('active', 'completed');
    if (i === step) dot?.classList.add('active');
    else if (i < step) dot?.classList.add('completed');
  }
  for (let i = 1; i <= 3; i++) {
    document.getElementById(`videoLine${i}`)?.classList.toggle('active', i < step);
  }

  // Carrega fotos do banco quando entra na etapa 1 (seletor de foto)
  if (step === 1) {
    loadPhotosForVideoSelector();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToVideoWithImage() {
  if (state.resultImageUrl) {
    addToSessionGallery(state.resultImageUrl);
    // Pré-seleciona a foto recém-gerada
    state.selectedSessionImage = state.resultImageUrl;
  }
  switchMenu('video');
  goToVideoStep(1); // Isso já vai chamar loadPhotosForVideoSelector()
}

// ===== BUILD PROMPT =====
function buildPhotoPrompt() {
  const parts = [];
  if (state.selectedModel) parts.push(state.selectedModel.prompt);

  // Cenário: usa variante se selecionada, senão usa prompt do cenário principal
  if (state.selectedScenario) {
    if (state.selectedScenario.hasVariants && state.selectedVariant) {
      parts.push(state.selectedVariant.prompt);
    } else if (state.selectedScenario.prompt) {
      parts.push(state.selectedScenario.prompt);
    }
  }

  if (state.selectedPoses.length > 0) parts.push(state.selectedPoses.map(p => p.prompt).join(', '));
  return parts.join(', ');
}

function buildVideoPrompt() {
  if (state.videoStyle === 'talking') {
    const script = document.getElementById('modelScript')?.value?.trim() || '';
    const tone = document.getElementById('talkingTone')?.value || 'friendly';

    // Tom da fala
    const toneMap = {
      presentation: 'tom apresentando o produto com entusiasmo e energia',
      promotion:    'tom promovendo uma oferta especial de forma persuasiva',
      description:  'tom descritivo e detalhado, focando nos detalhes da peça',
      professional: 'tom profissional, confiante e elegante',
      friendly:     'tom amigável, caloroso e acessível',
    };
    const toneDesc = toneMap[tone] || toneMap.friendly;

    // Gênero da modelo selecionada
    const gender = state.selectedPresetModel?.gender || 'female';
    const modelDesc = gender === 'male'
      ? 'Modelo de moda masculino brasileiro'
      : 'Modelo de moda feminina brasileira';

    // Cenário selecionado pelo lojista (usa variante se disponível)
    let scenarioPrompt = null;
    if (state.selectedScenario) {
      if (state.selectedScenario.hasVariants && state.selectedVariant) {
        scenarioPrompt = state.selectedVariant.prompt;
      } else if (state.selectedScenario.prompt) {
        scenarioPrompt = state.selectedScenario.prompt;
      }
    }
    const scenario = scenarioPrompt
      ? `Cenário: ${scenarioPrompt}.`
      : 'Cenário: loja de moda elegante com araras e prateleiras ao fundo.';

    // Monta o prompt em camadas
    return `${modelDesc} em plano médio da cintura para cima, mostrando a roupa claramente. ${scenario} A modelo olha diretamente para a câmera e fala em português brasileiro com dicção clara e natural, lábios se movendo de forma realista e perfeitamente sincronizada com a fala, sem distorção labial, sem aceleração artificial, velocidade de fala pausada e normal. Fala com ${toneDesc}: "${script}". Iluminação de estúdio profissional suave e quente, câmera completamente estática, rosto e roupa em foco nítido, qualidade cinematográfica 4K.`;

  } else {
    // Vídeo de movimento — integra cenário + movimento
    const movement = state.selectedMovement;
    if (!movement) {
      return 'Fashion model standing naturally in elegant studio setting, subtle natural movement, professional fashion photography, cinematic quality, soft studio lighting, 4K resolution' + MOVEMENT_ZOOM_SUFFIX;
    }

    // Extrai cenário selecionado (se houver)
    let scenarioPrompt = null;
    if (state.selectedScenario) {
      if (state.selectedScenario.hasVariants && state.selectedVariant) {
        scenarioPrompt = state.selectedVariant.prompt;
      } else if (state.selectedScenario.prompt) {
        scenarioPrompt = state.selectedScenario.prompt;
      }
    }

    // Extrai movimento selecionado (variante se disponível)
    let movementPrompt = null;
    if (movement.hasVariants && state.selectedMovementVariant) {
      movementPrompt = state.selectedMovementVariant.prompt;
    } else if (movement.prompt) {
      movementPrompt = movement.prompt;
    }

    // Fallback se não houver prompt de movimento
    if (!movementPrompt) {
      return 'Fashion model standing naturally in elegant studio setting, subtle natural movement, professional fashion photography, cinematic quality, soft studio lighting, 4K resolution' + MOVEMENT_ZOOM_SUFFIX;
    }

    // Combina cenário + movimento
    const fullPrompt = scenarioPrompt
      ? `${scenarioPrompt}. ${movementPrompt}`
      : movementPrompt;

    // Caso especial: s4 "Selfie no espelho" + m1 "Natural" = adiciona realismo de pele
    if (state.selectedScenario?.id === 's4' && movement.id === 'm1') {
      const skinRealism = ', natural skin texture with visible pores, realistic skin imperfections, no skin smoothing, no beauty filter, photorealistic human skin, raw unfiltered appearance';
      return fullPrompt + skinRealism + MOVEMENT_ZOOM_SUFFIX;
    }

    return fullPrompt + MOVEMENT_ZOOM_SUFFIX;
  }
}

// ===== CLEAN BASE64 =====
// API de imagem precisa do prefixo data:image/...;base64, completo, então não removemos
const getCleanBase64 = (b64) => b64 || null;

// ===== COST =====
function updateImageCost() {
  const mode = document.getElementById('modeSelect').value;
  const res = document.getElementById('resolutionSelect').value;
  const credits = IMAGE_CREDITS[mode]?.[res] ?? 2;
  document.getElementById('costCredits').textContent = `${credits} crédito${credits > 1 ? 's' : ''}`;
}

function updateVideoCost() {
  const dur = parseInt(document.getElementById('videoDuration').value);
  const res = document.getElementById('videoResolution').value;
  const costs = { 5: { '720p': 2, '1080p': 3 }, 10: { '720p': 4, '1080p': 6 } };
  const credits = costs[dur]?.[res] ?? 3;
  document.getElementById('videoCostCredits').textContent = `${credits} crédito${credits > 1 ? 's' : ''}`;
}



// ===== SESSION GALLERY =====
function addToSessionGallery(url) {
  if (!state.sessionImages.includes(url)) state.sessionImages.push(url);
  renderSessionGallery();
}

// Carrega fotos do banco + sessão para o seletor de vídeo
async function loadPhotosForVideoSelector() {
  const container = document.getElementById('sessionGallery');

  // Mostra loading temporário
  container.innerHTML = `<div style="text-align:center;padding:3rem;color:var(--texto-muted);">
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>
    <p style="margin-top:1rem;">Carregando suas fotos...</p>
  </div>`;

  try {
    // Busca fotos do banco
    const res = await window.AuthLib.authFetch('/api/me/generations');
    if (!res.ok) throw new Error('Falha ao buscar fotos');

    const data = await res.json();
    const dbPhotos = (data.generations || [])
      .filter(g => g.generation_type === 'photo' && g.status === 'completed' && g.result_url)
      .map(g => g.result_url);

    // Combina fotos do banco + fotos da sessão (sem duplicar)
    const allPhotos = [...new Set([...dbPhotos, ...state.sessionImages])];

    renderSessionGallery(allPhotos);

  } catch (err) {
    console.error('[VideoSelector] Erro carregando fotos:', err);
    // Em caso de erro, mostra apenas as fotos da sessão
    renderSessionGallery(state.sessionImages);
  }
}

function renderSessionGallery(photosToShow = null) {
  const container = document.getElementById('sessionGallery');

  // Se não passou fotos específicas, usa apenas as da sessão (modo legado)
  const photos = photosToShow !== null ? photosToShow : state.sessionImages;

  if (photos.length === 0) {
    container.innerHTML = `<div class="empty-gallery"><div style="font-size:3rem"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg></div><p>Nenhuma foto gerada ainda.</p><button class="btn btn-outline" onclick="switchMenu('photo')"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg> Gerar Foto Primeiro</button></div>`;
    return;
  }

  container.innerHTML = `<div class="session-grid">${photos.map((url, i) => `
    <div class="session-img-item ${state.selectedSessionImage === url ? 'selected' : ''}" onclick="selectSessionImage('${url}')">
      <img src="${url}" alt="Foto ${i + 1}" loading="lazy">
      <div class="card-check">✓</div>
    </div>
  `).join('')}</div>`;
}

function selectSessionImage(url) {
  state.selectedSessionImage = url;
  document.getElementById('btnNextVideoStep1').disabled = false;

  // Atualiza apenas as classes de seleção (sem recarregar tudo)
  document.querySelectorAll('.session-img-item').forEach(item => {
    item.classList.remove('selected');
  });
  event.currentTarget.classList.add('selected');
}

// ===== POLLING GENÉRICO =====
async function pollStatus(provider, id, onUpdate) {
  const MAX = 120;
  for (let i = 0; i < MAX; i++) {
    const url = `/api/status/${provider}/${encodeURIComponent(id)}`;
    const res = await window.AuthLib.authFetch(url);
    const data = await res.json();
    if (onUpdate) onUpdate(data.status, i);
    if (data.status === 'completed') return data;
    if (data.status === 'failed') throw new Error(data.error?.message || 'Geração falhou.');
    await new Promise(r => setTimeout(r, 4000));
  }
  throw new Error('Tempo limite excedido. Tente novamente.');
}

// ===== GERAR FOTO =====
async function generatePhoto() {
  if (!state.productImageBase64 || state.isGenerating) return;
  state.isGenerating = true;

  // Limpa polling anterior se existir
  if (photoPollingInterval) {
    clearInterval(photoPollingInterval);
    photoPollingInterval = null;
  }

  goToPhotoStep(6);

  document.getElementById('photoLoading').style.display = 'flex';
  document.getElementById('photoResult').style.display = 'none';

  try {

    setPhotoStatus('Enviando para o servidor...');
    const res = await window.AuthLib.authFetch('/api/run-photo-v3', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inputs: {
          product_image: getCleanBase64(state.productImageBase64),
          model_image: state.selectedPresetModel?.url || null,
          prompt_pose: state.selectedPoses?.map(p => p.prompt).join(', ') || null,
          prompt_scenario: (() => {
            if (state.selectedScenario) {
              if (state.selectedScenario.hasVariants && state.selectedVariant) {
                return state.selectedVariant.prompt;
              } else if (state.selectedScenario.prompt) {
                return state.selectedScenario.prompt;
              }
            }
            return null;
          })(),
          aspect_ratio: document.getElementById('aspectSelect')?.value || '9:16'
        }
      }),
    });

    if (res.status === 402) {
      const data = await res.json();
      document.getElementById('noCreditsMessage').textContent = data.message || 'Você não tem créditos suficientes para esta geração.';
      document.getElementById('noCreditsModal').style.display = 'flex';
      document.getElementById('noCreditsClose').onclick = () => { document.getElementById('noCreditsModal').style.display = 'none'; };
      document.getElementById('noCreditsUpgrade').onclick = () => { window.location.href = '/planos.html'; };
      return;
    }

    const result = await res.json();

    if (result.error) throw new Error(result.error);

    // Pipeline V3 retorna job_id — inicia polling assíncrono
    if (result.job_id) {
      setPhotoStatus('Foto na fila de processamento...');
      pollPhotoJob(result.job_id);
    } else {
      throw new Error('Job ID não retornado pelo servidor');
    }
  } catch (err) {
    showToast(`Erro: ${err.message}`, 'error');
    goToPhotoStep(5);
  } finally {
    state.isGenerating = false;
  }
}

function setPhotoStatus(msg) {
  document.getElementById('photoLoadingSub').textContent = msg;
}

// ===== GERAR VARIAÇÕES =====
async function generateVariations() {
  if (state.isGenerating) return;
  state.isGenerating = true;

  const btn = document.getElementById('btnVariations');
  btn.disabled = true;
  btn.textContent = 'Gerando variações...';

  const variationPoses = [
    'side profile, looking sideways elegantly',
    'three-quarter angle, hand on hip, confident',
    'walking pose, natural movement, full body',
  ];

  try {
    showToast('Gerando 3 variações... isso pode levar um pouco.', 'info');

    const urls = [];
    for (const pose of variationPoses) {
      const res = await window.AuthLib.authFetch('/api/run-photo-v3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputs: {
            // ⚠️ CRÍTICO: Usa foto JÁ GERADA (não a foto preset!)
            // Isso preserva modelo/cenário/roupa — apenas muda pose
            model_image: state.resultImageUrl,

            // ⚠️ CRÍTICO: Mantém foto original da roupa para referência
            product_image: getCleanBase64(state.productImageBase64),

            // ⚠️ Nova pose desejada
            prompt_pose: pose,

            // ⚠️ CRÍTICO: null = não regenera cenário (já está na foto)
            // Se passar string aqui, vai gerar novo cenário (ERRADO para variações)
            prompt_scenario: null,

            aspect_ratio: document.getElementById('aspectSelect')?.value || '9:16'
          }
        }),
      });

      if (res.status === 402) {
        const data = await res.json();
        throw new Error(data.message || 'Créditos insuficientes');
      }

      const result = await res.json();
      if (result.error) throw new Error(result.error);

      // Pipeline V3 retorna job_id — aguarda processamento
      if (result.job_id) {
        const url = await waitForPhotoJob(result.job_id);
        if (url) urls.push(url);
      } else {
        throw new Error('Job ID não retornado');
      }

      // Aguarda 2s entre cada chamada para evitar rate limit
      await new Promise(r => setTimeout(r, 2000));
    }

    if (urls.length > 0) {
      const grid = document.getElementById('variationsGrid');
      grid.style.display = 'grid';
      grid.innerHTML = urls.map((url, i) => `
        <div class="variation-item">
          <img src="${url}" alt="Variação ${i + 1}" loading="lazy">
          <button class="variation-dl" onclick="downloadUrl('${url}', 'variacao-${i + 1}.jpg')">💾</button>
        </div>
      `).join('');
      urls.forEach(url => addToSessionGallery(url));
      showToast(`${urls.length} variações geradas! 🎭`, 'success');
      refreshProfile();
    }
  } catch (err) {
    showToast(`Erro: ${err.message}`, 'error');
  } finally {
    state.isGenerating = false;
    btn.disabled = false;
    btn.textContent = 'Criar Variações e Poses';
  }
}

// ===== GERAR VARIAÇÕES DA GALERIA =====
async function generateVariationsFromGallery(generation) {
  if (state.isGenerating) {
    showToast('Aguarde a geração atual terminar', 'info');
    return;
  }

  // Verifica se temos product_image salvo
  const productImageBase64 = generation.input_payload?.inputs?.product_image;
  if (!productImageBase64) {
    showToast('Esta foto não tem imagem do produto salva. Use o fluxo normal de geração.', 'error');
    return;
  }

  state.isGenerating = true;

  const variationPoses = [
    'side profile, looking sideways elegantly',
    'three-quarter angle, hand on hip, confident',
    'walking pose, natural movement, full body',
  ];

  try {
    showToast('Iniciando geração de 3 variações...', 'info');

    // Envia as 3 requisições assincronamente (sem esperar completar)
    const promises = variationPoses.map(async (pose, i) => {
      const res = await window.AuthLib.authFetch('/api/run-photo-v3-async', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputs: {
            // ⚠️ CRÍTICO: Usa foto JÁ GERADA (preserva modelo/cenário/roupa)
            model_image: generation.result_url,

            // ⚠️ CRÍTICO: Mantém foto original da roupa
            product_image: productImageBase64,

            // ⚠️ Nova pose desejada
            prompt_pose: pose,

            // ⚠️ CRÍTICO: null = não regenera cenário
            prompt_scenario: null,

            aspect_ratio: '9:16'
          }
        }),
      });

      if (res.status === 402) {
        const data = await res.json();
        throw new Error(data.message || 'Créditos insuficientes');
      }

      const result = await res.json();
      if (result.error) throw new Error(result.error);

      return result.job_id;
    });

    // Aguarda todas as 3 requisições serem enviadas
    const jobIds = await Promise.all(promises);

    showToast(`3 variações iniciadas! Acompanhe o progresso em "Minhas Fotos" → "Processando"`, 'success');

    // Redireciona para Minhas Fotos
    state.currentView = 'myphotos';
    renderView();

    // Carrega o painel com filtro "processando"
    setTimeout(() => {
      loadMyPhotosPanel();
      // Muda para aba "Processando"
      document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.includes('Processando')) {
          btn.classList.add('active');
        }
      });
      filterGallery('myphotos', 'processing');

      // Inicia polling automático
      startGalleryPolling();
    }, 100);

  } catch (err) {
    showToast(`Erro ao gerar variações: ${err.message}`, 'error');
  } finally {
    state.isGenerating = false;
  }
}

// ===== POLLING AUTOMÁTICO DA GALERIA =====
let galleryPollingInterval = null;

function startGalleryPolling() {
  // Cancela polling anterior se existir
  if (galleryPollingInterval) {
    clearInterval(galleryPollingInterval);
  }

  console.log('[POLLING] Iniciando polling automático da galeria');

  // Polling a cada 5 segundos
  galleryPollingInterval = setInterval(async () => {
    try {
      const res = await window.AuthLib.authFetch('/api/me/generations');
      if (!res.ok) {
        console.error('[POLLING] Erro ao buscar gerações');
        return;
      }

      const data = await res.json();
      const allGenerations = data.generations || [];

      // Verifica se há jobs em progresso
      const inProgress = allGenerations.filter(g =>
        g.status === 'processing' || g.status === 'in_queue' || g.status === 'pending'
      );

      if (inProgress.length === 0) {
        // Não há mais jobs em progresso, para o polling
        console.log('[POLLING] Nenhum job em progresso, parando polling');
        clearInterval(galleryPollingInterval);
        galleryPollingInterval = null;
      }

      // Atualiza a visualização se estiver em Minhas Fotos
      if (state.currentView === 'myphotos') {
        const currentFilter = state.currentGalleryFilter || 'all';
        renderGallery('myphotos', allGenerations, currentFilter);
      }

    } catch (err) {
      console.error('[POLLING] Erro:', err);
    }
  }, 5000);

  // Para o polling após 10 minutos (segurança)
  setTimeout(() => {
    if (galleryPollingInterval) {
      console.log('[POLLING] Timeout de 10 minutos, parando polling');
      clearInterval(galleryPollingInterval);
      galleryPollingInterval = null;
    }
  }, 600000);
}

function stopGalleryPolling() {
  if (galleryPollingInterval) {
    console.log('[POLLING] Parando polling manualmente');
    clearInterval(galleryPollingInterval);
    galleryPollingInterval = null;
  }
}

// ===== GERAR VÍDEO =====
async function generateVideo() {
  if (!state.selectedSessionImage || state.isGenerating) return;
  if (state.videoStyle === 'talking' && !document.getElementById('modelScript').value.trim()) {
    showToast('Escreva o que a modelo vai dizer.', 'error'); return;
  }
  state.isGenerating = true;

  // Limpa polling anterior se existir
  if (videoPollingInterval) {
    clearInterval(videoPollingInterval);
    videoPollingInterval = null;
  }

  goToVideoStep(4);

  document.getElementById('videoLoading').style.display = 'flex';
  document.getElementById('videoResult').style.display = 'none';

  try {
    const prompt = buildVideoPrompt();
    const duration = parseInt(document.getElementById('videoDuration').value);
    const resolution = document.getElementById('videoResolution').value;

    setVideoStatus('Enviando para o servidor...');

    const res = await window.AuthLib.authFetch('/api/run-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        style: state.videoStyle,
        inputs: {
          image_url: state.selectedSessionImage,
          prompt,
          duration: String(duration),
          resolution,
          aspect_ratio: '9:16',
        },
      }),
    });

    console.log('[VIDEO] Status da resposta:', res.status, res.statusText);

    if (res.status === 402) {
      const data = await res.json();
      console.log('[VIDEO] 402 - Sem créditos:', data);
      document.getElementById('noCreditsMessage').textContent = data.message || 'Você não tem créditos suficientes para esta geração.';
      document.getElementById('noCreditsModal').style.display = 'flex';
      document.getElementById('noCreditsClose').onclick = () => { document.getElementById('noCreditsModal').style.display = 'none'; };
      document.getElementById('noCreditsUpgrade').onclick = () => { window.location.href = '/planos.html'; };
      return;
    }

    if (res.status === 401) {
      console.error('[VIDEO] 401 Unauthorized - Token expirado, authFetch deveria ter tratado isso');
      showToast('Sessão expirada. Redirecionando para login...', 'error');
      setTimeout(() => window.AuthLib.logout(), 2000);
      return;
    }

    if (res.status === 403) {
      console.error('[VIDEO] 403 Forbidden - Acesso negado');
      showToast('Acesso negado. Faça logout e login novamente.', 'error');
      setTimeout(() => window.AuthLib.logout(), 2000);
      return;
    }

    if (res.status === 429) {
      const data = await res.json();
      showToast(data.message || 'Limite temporário atingido. Tente novamente em alguns minutos ou use "Modelo em Movimento".', 'error');
      goToVideoStep(3); // Volta para a etapa de configuração sem quebrar o fluxo
      return;
    }

    if (!res.ok) {
      const errorText = await res.text();
      console.error('[VIDEO] Erro HTTP', res.status, errorText);
      throw new Error(`Erro ${res.status}: ${errorText.substring(0, 100)}`);
    }

    const run = await res.json();
    console.log('[VIDEO] Resposta do servidor:', run);

    if (run.error) {
      console.error('[VIDEO] Erro na resposta:', run.error);
      throw new Error(run.error);
    }

    const provider = state.videoStyle === 'talking' ? 'veo' : 'kling';
    const providerName = 'IA de vídeo';

    console.log('[VIDEO] Mostrando toast de sucesso');

    // NOVO: Fica na página de geração mostrando progresso
    setVideoStatus(`Vídeo ${providerName} em processamento... ⏳`);
    showToast(`Vídeo ${providerName} iniciado! Processando (2-5 min)...`, 'success');

    // Salva info do vídeo atual
    state.currentVideoId = run.id;
    state.currentVideoProvider = provider;

    // Inicia polling para este vídeo específico
    pollCurrentVideo();

  } catch (err) {
    showToast(`Erro: ${err.message}`, 'error');
    goToVideoStep(3);
  } finally {
    state.isGenerating = false;
  }
}

function setVideoStatus(msg) {
  document.getElementById('videoLoadingSub').textContent = msg;
}

// Polling do vídeo atual
let videoPollingInterval = null;

async function pollCurrentVideo() {
  // Limpa polling anterior se existir
  if (videoPollingInterval) {
    clearInterval(videoPollingInterval);
  }

  const videoId = state.currentVideoId;
  const provider = state.currentVideoProvider;

  if (!videoId || !provider) {
    console.error('[VIDEO POLL] Sem ID ou provider');
    return;
  }

  console.log(`[VIDEO POLL] Iniciando polling para ${videoId} (${provider})`);

  let attempts = 0;
  const maxAttempts = 300; // 15 minutos com polling a cada 3s

  videoPollingInterval = setInterval(async () => {
    attempts++;

    try {
      const res = await window.AuthLib.authFetch(`/api/status/${provider}/${videoId}`);
      const data = await res.json();

      console.log(`[VIDEO POLL] Attempt ${attempts}: ${data.status}`);

      if (data.status === 'in_queue') {
        setVideoStatus(`Vídeo na fila de processamento... (${attempts * 3}s)`);
      } else if (data.status === 'processing') {
        setVideoStatus(`Vídeo sendo processado... (${attempts * 3}s)`);
      } else if (data.status === 'completed' && data.output && data.output[0]) {
        // SUCESSO!
        clearInterval(videoPollingInterval);

        console.log('[VIDEO POLL] ✅ Vídeo completado!', data.output[0]);

        // Salva resultado
        state.resultVideoUrl = data.output[0];

        // Mostra resultado
        showVideoResult(data.output[0]);

        showToast('Vídeo gerado com sucesso! 🎬', 'success');

      } else if (data.status === 'failed') {
        clearInterval(videoPollingInterval);
        const errorMsg = data.error?.message || 'Erro desconhecido';
        setVideoStatus(`Erro: ${errorMsg}`);
        showToast(`Erro ao gerar vídeo: ${errorMsg}`, 'error');

        // Volta para configuração após 3s
        setTimeout(() => goToVideoStep(3), 3000);
      }

      // Timeout
      if (attempts >= maxAttempts) {
        clearInterval(videoPollingInterval);
        setVideoStatus('Timeout: vídeo demorou demais');
        showToast('Vídeo demorou mais que o esperado. Verifique em "Meus Vídeos"', 'error');
        setTimeout(() => goToVideoStep(3), 3000);
      }

    } catch (err) {
      console.error('[VIDEO POLL] Erro:', err);
    }

  }, 3000); // Polling a cada 3 segundos
}

// ===== POLLING DE FOTO (PIPELINE V3) =====
let photoPollingInterval = null;

async function pollPhotoJob(jobId) {
  // Limpa polling anterior se existir
  if (photoPollingInterval) {
    clearInterval(photoPollingInterval);
  }

  if (!jobId) {
    console.error('[PHOTO POLL] Sem job ID');
    return;
  }

  console.log(`[PHOTO POLL] Iniciando polling para job ${jobId}`);

  let attempts = 0;
  const maxAttempts = 180; // 15 minutos com polling a cada 5s
  const pollInterval = 5000; // 5 segundos

  photoPollingInterval = setInterval(async () => {
    attempts++;

    try {
      const res = await window.AuthLib.authFetch('/api/me/generations');

      // Trata erro de rate limiting
      if (res.status === 429) {
        console.warn('[PHOTO POLL] Rate limit (429) - aguardando...');
        setPhotoStatus(`Processando foto... (aguarde)`);
        return; // Pula esta tentativa, aguarda próximo intervalo
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const jobs = data.generations || [];

      // Encontra o job específico
      const job = jobs.find(j => j.id === jobId);

      if (!job) {
        console.error('[PHOTO POLL] Job não encontrado:', jobId);
        return;
      }

      console.log(`[PHOTO POLL] Attempt ${attempts}: ${job.status}`);

      if (job.status === 'pending' || job.status === 'processing') {
        setPhotoStatus(`Processando foto... (${attempts * 5}s)`);
      } else if (job.status === 'completed' && job.result_url) {
        // SUCESSO!
        clearInterval(photoPollingInterval);

        console.log('[PHOTO POLL] ✅ Foto completada!', job.result_url);

        // Salva resultado
        state.resultImageUrl = job.result_url;
        addToSessionGallery(job.result_url);

        // Mostra resultado
        document.getElementById('resultImage').src = job.result_url;
        document.getElementById('photoLoading').style.display = 'none';
        document.getElementById('photoResult').style.display = 'block';
        document.getElementById('variationsGrid').style.display = 'none';
        document.getElementById('btnVariations').disabled = false;
        document.getElementById('btnVariations').textContent = 'Criar Variações e Poses';

        showToast('Foto gerada com sucesso!', 'success');
        refreshProfile();

      } else if (job.status === 'failed') {
        clearInterval(photoPollingInterval);
        const errorMsg = job.error_message || 'Erro desconhecido';
        setPhotoStatus(`Erro: ${errorMsg}`);
        showToast(`Erro ao gerar foto: ${errorMsg}`, 'error');

        // Volta para configuração após 3s
        setTimeout(() => goToPhotoStep(5), 3000);
      }

      // Timeout
      if (attempts >= maxAttempts) {
        clearInterval(photoPollingInterval);
        setPhotoStatus('Timeout: foto demorou demais');
        showToast('Foto demorou mais que o esperado. Verifique em "Minhas Fotos"', 'error');
        setTimeout(() => goToPhotoStep(5), 3000);
      }

    } catch (err) {
      console.error('[PHOTO POLL] Erro:', err);
      // Não para o polling em caso de erro - pode ser transitório
    }

  }, pollInterval); // Polling a cada 5 segundos
}

/**
 * Aguarda job de foto completar e retorna URL do resultado.
 * Usado em generateVariations() que precisa aguardar cada foto sequencialmente.
 */
async function waitForPhotoJob(jobId) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 60; // 5 minutos
    const interval = 5000; // 5 segundos

    const pollInterval = setInterval(async () => {
      attempts++;

      try {
        const res = await window.AuthLib.authFetch('/api/me/generations');

        // Trata erro de rate limiting
        if (res.status === 429) {
          console.warn('[WAIT JOB] Rate limit (429) - aguardando...');
          return; // Pula esta tentativa
        }

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        const jobs = data.generations || [];
        const job = jobs.find(j => j.id === jobId);

        if (!job) {
          clearInterval(pollInterval);
          reject(new Error('Job não encontrado'));
          return;
        }

        if (job.status === 'completed' && job.result_url) {
          clearInterval(pollInterval);
          resolve(job.result_url);
        } else if (job.status === 'failed') {
          clearInterval(pollInterval);
          reject(new Error(job.error_message || 'Job falhou'));
        }

        if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          reject(new Error('Timeout ao aguardar job'));
        }
      } catch (err) {
        // Não para o polling em caso de erro transitório
        console.error('[WAIT JOB] Erro:', err);
        if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          reject(err);
        }
      }
    }, interval);
  });
}

function showVideoResult(videoUrl) {
  console.log('[VIDEO] Mostrando resultado:', videoUrl);

  // Esconde loading
  document.getElementById('videoLoading').style.display = 'none';

  // Mostra resultado
  const resultSection = document.getElementById('videoResult');
  resultSection.style.display = 'block';

  // Define o vídeo
  document.getElementById('resultVideo').src = videoUrl;

  setVideoStatus('Vídeo concluído!');
}

function goToMyVideos() {
  // Redireciona para galeria de vídeos
  document.querySelector('.sidebar-item[data-view="videos"]')?.click();
}

// ===== DOWNLOAD =====
async function downloadResult(type) {
  const url = type === 'video' ? state.resultVideoUrl : state.resultImageUrl;
  const ext = type === 'video' ? 'mp4' : document.getElementById('formatSelect').value;
  if (!url) return;
  await downloadUrl(url, `fashion-${type}-${Date.now()}.${ext}`);
}

async function downloadUrl(url, filename) {
  try {
    showToast('Preparando download...', 'info');
    const blob = await fetch(url).then(r => r.blob());
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  } catch {
    window.open(url, '_blank');
  }
}

// ===== FILE INPUT =====
function setupFileInput(inputId, zoneId, previewId, callback) {
  const input = document.getElementById(inputId);
  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { showToast('Envie um arquivo de imagem.', 'error'); return; }
    if (file.size > 10 * 1024 * 1024) { showToast('Imagem deve ter no máximo 10MB.', 'error'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      document.getElementById(previewId).src = ev.target.result;
      document.getElementById(zoneId).classList.add('has-image');
      callback(ev.target.result);
    };
    reader.readAsDataURL(file);
  });
}

function setupDragDrop(zoneId, inputId) {
  const zone = document.getElementById(zoneId);
  zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      document.getElementById(inputId).files = files;
      document.getElementById(inputId).dispatchEvent(new Event('change'));
    }
  });
}

// ===== TOAST =====
// ===== MICRO-ANIMAÇÕES =====
function animateStepTransition(element) {
  if (!element) return;
  element.style.opacity = '0';
  element.style.transform = 'translateY(10px)';
  requestAnimationFrame(() => {
    element.style.transition = 'all 0.3s ease';
    element.style.opacity = '1';
    element.style.transform = 'translateY(0)';
  });
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed; bottom: 24px; right: 24px; z-index: 9999;
    background: ${type === 'success' ? 'var(--verde-primario)' : type === 'error' ? 'var(--acento-coral)' : 'rgba(15, 36, 33, 0.95)'};
    color: white; padding: 14px 24px; border-radius: 50px;
    font-size: 0.9rem; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    animation: slideInRight 0.3s ease forwards;
  `;

  if (type === 'info') {
    toast.style.background = 'rgba(15, 36, 33, 0.95)';
    toast.style.border = '1px solid var(--borda-hover)';
    toast.style.backdropFilter = 'blur(20px)';
  }

  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Adicionar keyframes de animação para toast
if (!document.getElementById('toast-animations')) {
  const style = document.createElement('style');
  style.id = 'toast-animations';
  style.textContent = `
    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(100px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes slideOutRight {
      from { opacity: 1; transform: translateX(0); }
      to { opacity: 0; transform: translateX(100px); }
    }
  `;
  document.head.appendChild(style);
}
