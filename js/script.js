'use strict';

/* =============================================
   SCROLL PROGRESS BAR
   ============================================= */
const scrollFill = document.getElementById('scroll-fill');
function updateScrollProgress() {
  const scrolled  = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const pct       = maxScroll > 0 ? (scrolled / maxScroll) * 100 : 0;
  scrollFill.style.width = pct + '%';
}
window.addEventListener('scroll', updateScrollProgress, { passive: true });
updateScrollProgress();

/* =============================================
   FLOATING PARTICLES
   ============================================= */
(function spawnParticles() {
  const container = document.getElementById('particle-bg');
  const COLORS    = ['#c084fc', '#ff4d8d', '#f59e0b', '#38bdf8', '#34d399'];
  const COUNT     = 30;

  for (let i = 0; i < COUNT; i++) {
    const el = document.createElement('div');
    el.classList.add('particle');
    const size     = Math.random() * 80 + 40;
    const color    = COLORS[Math.floor(Math.random() * COLORS.length)];
    const duration = (Math.random() * 8 + 6).toFixed(1);
    const delay    = (Math.random() * 10).toFixed(1);
    const opacity  = (Math.random() * 0.3 + 0.1).toFixed(2);

    el.style.cssText = `
      width:${size}px; height:${size}px;
      top:${Math.random() * 100}%;
      left:${Math.random() * 100}%;
      --c:${color};
      --dur:${duration}s;
      --delay:${delay}s;
      --op:${opacity};
    `;
    container.appendChild(el);
  }
})();

/* =============================================
   PARALLAX HERO LAYERS
   ============================================= */
const layerFar  = document.querySelector('.layer-far');
const layerMid  = document.querySelector('.layer-mid');
const layerNear = document.querySelector('.layer-near');

function applyParallax() {
  const scrollY = window.scrollY;
  if (layerFar)  layerFar.style.transform  = `translateY(${scrollY * 0.15}px)`;
  if (layerMid)  layerMid.style.transform  = `translateY(${scrollY * 0.25}px)`;
  if (layerNear) layerNear.style.transform = `translateY(${scrollY * 0.40}px)`;
}
window.addEventListener('scroll', applyParallax, { passive: true });

/* =============================================
   SCROLL REVEAL (Intersection Observer)
   ============================================= */
const revealEls = document.querySelectorAll('[data-scroll]');

const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    const el    = entry.target;
    const delay = parseInt(el.dataset.delay || '0', 10);

    setTimeout(() => {
      el.classList.add('is-visible');
    }, delay);

    io.unobserve(el);
  });
}, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => io.observe(el));

/* =============================================
   SECTION ACTIVE GLOW (optional highlight on scroll)
   ============================================= */
const sections = document.querySelectorAll('[data-section]');

const sectionIO = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.setProperty('--active', '1');
    } else {
      entry.target.style.setProperty('--active', '0');
    }
  });
}, { threshold: 0.3 });

sections.forEach(s => sectionIO.observe(s));

/* =============================================
   CONFETTI
   ============================================= */
const canvas = document.getElementById('confetti-canvas');
const ctx    = canvas.getContext('2d');
let pieces   = [];
let running  = false;
let rafId    = null;

function resize() {
  canvas.width  = innerWidth;
  canvas.height = innerHeight;
}
resize();
window.addEventListener('resize', resize);

const CONFETTI_COLORS = ['#ff4d8d','#7c3aed','#c084fc','#f59e0b','#34d399','#38bdf8','#f97316'];

function mkPiece(cx, cy) {
  return {
    x: cx + (Math.random() - 0.5) * 180,
    y: cy,
    vx: (Math.random() - 0.5) * 9,
    vy: -(Math.random() * 8 + 4),
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    w: Math.random() * 8 + 4,
    h: Math.random() * 4 + 2,
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.25,
    grav: 0.18 + Math.random() * 0.1,
    alpha: 1,
    shape: Math.random() > 0.45 ? 'rect' : 'circle',
  };
}

function burst(n = 70) {
  const cx = canvas.width / 2;
  const cy = canvas.height * 0.3;
  for (let i = 0; i < n; i++) pieces.push(mkPiece(cx, cy));
}

function drawPiece(p) {
  ctx.save();
  ctx.globalAlpha = p.alpha;
  ctx.fillStyle   = p.color;
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle);
  if (p.shape === 'circle') {
    ctx.beginPath();
    ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
  }
  ctx.restore();
}

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  pieces = pieces.filter(p => p.alpha > 0.02 && p.y < canvas.height + 30);
  for (const p of pieces) {
    p.x     += p.vx;
    p.y     += p.vy;
    p.vy    += p.grav;
    p.angle += p.spin;
    p.alpha  = Math.max(0, p.alpha - 0.008);
    drawPiece(p);
  }
  if (pieces.length > 0 || running) {
    rafId = requestAnimationFrame(loop);
  } else {
    cancelAnimationFrame(rafId);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

function startConfetti(durationMs = 4500) {
  running = true;
  cancelAnimationFrame(rafId);
  burst(90);
  loop();

  const iv = setInterval(() => burst(50), 600);
  setTimeout(() => { clearInterval(iv); running = false; }, durationMs);
}

/* Auto-burst on load */
window.addEventListener('load', () => setTimeout(() => startConfetti(3500), 500));

/* =============================================
   WISH BUTTON – MODAL
   ============================================= */
const wishBtn   = document.getElementById('wish-btn');
const overlay   = document.getElementById('modal-overlay');
const closeBtn  = document.getElementById('modal-close');

function openModal() {
  overlay.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
  startConfetti(6000);

  /* ripple animation */
  wishBtn.classList.add('ripple');
  setTimeout(() => wishBtn.classList.remove('ripple'), 700);
}
function closeModal() {
  overlay.setAttribute('hidden', '');
  document.body.style.overflow = '';
}

wishBtn.addEventListener('click', openModal);
closeBtn.addEventListener('click', closeModal);
overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* =============================================
   TIMELINE ITEM CARD – sparkle on hover
   ============================================= */
document.querySelectorAll('.tl-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    const r  = card.getBoundingClientRect();
    const cx = r.left + r.width  / 2;
    const cy = r.top  + r.height / 2;
    for (let i = 0; i < 10; i++) {
      const p  = mkPiece(cx, cy);
      p.vy     = (Math.random() - 0.7) * 4;
      p.vx     = (Math.random() - 0.5) * 5;
      p.w      = Math.random() * 6 + 2;
      p.alpha  = 0.85;
      pieces.push(p);
    }
    if (!running) { rafId = requestAnimationFrame(loop); }
  });
});

/* =============================================
   MESSAGE FORM – Supabase Integration
   ============================================= */
const SUPABASE_URL = 'https://osjwikdxzjvauugagboh.supabase.co';
const SUPABASE_KEY = 'sb_publishable_CAC4m-hsYgrrDzWcLoiZiA_lnI8c416';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const msgForm     = document.getElementById('msg-form');
const msgWall     = document.getElementById('msg-wall');
const msgEmpty    = document.getElementById('msg-wall-empty');
const msgToolbar  = document.getElementById('msg-wall-toolbar');
const msgClearBtn = document.getElementById('msg-clear-btn');

/* Show/hide toolbar */
function updateToolbar() {
  const hasMessages = msgWall.querySelectorAll('.msg-bubble').length > 0;
  if (msgToolbar) msgToolbar.style.display = hasMessages ? 'flex' : 'none';
}

/* Clear all messages */
if (msgClearBtn) {
  msgClearBtn.addEventListener('click', async () => {
    if (!confirm('Saare wishes delete karna chahte ho? 🗑️')) return;
    const { error } = await supabaseClient.from('wishes').delete().neq('id', 0);
    if (!error) {
      msgWall.querySelectorAll('.msg-bubble').forEach(b => b.remove());
      if (msgEmpty) msgEmpty.style.display = '';
      updateToolbar();
    }
  });
}

/* Render one message bubble */
function renderBubble(msg, animate = true) {
  const bubble = document.createElement('div');
  bubble.classList.add('msg-bubble');
  if (!animate) bubble.style.animation = 'none';

  const initial  = (msg.name || '?')[0].toUpperCase();
  const relation = msg.relation ? `• ${msg.relation}` : '';
  const timeStr  = msg.time || new Date(msg.created_at).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  bubble.innerHTML = `
    <div class="msg-bubble-header">
      <div class="msg-bubble-avatar">${initial}</div>
      <span class="msg-bubble-name">${escapeHtml(msg.name)}</span>
      <span class="msg-bubble-relation">${escapeHtml(relation)}</span>
    </div>
    <p class="msg-bubble-text">${escapeHtml(msg.message)}</p>
    <p class="msg-bubble-time">${timeStr}</p>
  `;

  msgWall.appendChild(bubble);
  updateToolbar();
}

/* Simple HTML escape */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* Format time nicely */
function formatTime() {
  return new Date().toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

/* Load all messages from Supabase on page load */
async function loadMessages() {
  const { data, error } = await supabaseClient
    .from('wishes')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) { console.error('Load error:', error); return; }

  if (data && data.length > 0) {
    if (msgEmpty) msgEmpty.style.display = 'none';
    data.forEach(msg => renderBubble(msg, false));
  }
  updateToolbar();
}

/* Real-time: auto show new messages from any user */
supabaseClient
  .channel('wishes-channel')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'wishes' },
    (payload) => {
      if (msgEmpty) msgEmpty.style.display = 'none';
      renderBubble(payload.new, true);
      msgWall.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  )
  .subscribe();

/* Handle form submit */
if (msgForm) {
  msgForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name     = document.getElementById('sender-name').value.trim();
    const relation = document.getElementById('sender-relation').value.trim();
    const message  = document.getElementById('sender-message').value.trim();

    if (!name || !message) {
      ['sender-name', 'sender-message'].forEach(id => {
        const el = document.getElementById(id);
        if (!el.value.trim()) {
          el.style.borderColor = '#ff4d8d';
          el.style.boxShadow   = '0 0 0 3px rgba(255,77,141,0.2)';
          setTimeout(() => {
            el.style.borderColor = '';
            el.style.boxShadow   = '';
          }, 1500);
        }
      });
      return;
    }

    const btn = document.getElementById('msg-submit');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<span>⏳</span><span>Sending...</span>';
    btn.disabled = true;

    const { error } = await supabaseClient
      .from('wishes')
      .insert([{ name, relation, message, time: formatTime() }]);

    if (error) {
      console.error('Insert error:', error);
      btn.innerHTML = '<span>❌</span><span>Error! Try again</span>';
      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.disabled = false;
      }, 2000);
      return;
    }

    /* Success */
    startConfetti(1800);
    msgForm.reset();
    btn.innerHTML = '<span>✅</span><span>Wish Sent!</span>';
    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.disabled  = false;
    }, 2000);
  });
}

/* Load messages on startup */
loadMessages();


