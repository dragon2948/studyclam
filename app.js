// ── Navigation ──────────────────────────────────────────────
function navigate(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  document.getElementById('page-' + page).classList.add('active');
  const idx = ['home','tools','journal','support','profile'].indexOf(page);
  if (idx >= 0) document.querySelectorAll('.nav-btn')[idx].classList.add('active');

  window.scrollTo(0, 0);
  if (page === 'journal') drawChart();
}

// ── Mood Selection ───────────────────────────────────────────
document.querySelectorAll('.mood-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  });
});

// ── Add Task ─────────────────────────────────────────────────
function addTask() {
  const text = prompt('New task:');
  if (!text) return;
  const list = document.querySelector('.task-list');
  const id = 'task-' + Date.now();
  const div = document.createElement('div');
  div.className = 'task-item';
  div.innerHTML = `<input type="checkbox" id="${id}"><label for="${id}">${text}</label>`;
  list.insertBefore(div, list.querySelector('.btn-text'));
  const cb = div.querySelector('input');
  cb.addEventListener('change', () => {
    div.querySelector('label').style.textDecoration = cb.checked ? 'line-through' : '';
    div.querySelector('label').style.color = cb.checked ? 'var(--text-sub)' : '';
  });
}

// ── Tool Overlays ────────────────────────────────────────────
function openTool(name) {
  const el = document.getElementById('overlay-' + name);
  if (!el) return;
  el.classList.add('open');
  if (name === 'cbt') initCBT();
}

function closeOverlay() {
  document.querySelectorAll('.overlay').forEach(o => o.classList.remove('open'));
  stopBreathe();
  stopTimer();
}

document.querySelectorAll('.overlay').forEach(o => {
  o.addEventListener('click', e => { if (e.target === o) closeOverlay(); });
});

// ── Breathing Exercise ───────────────────────────────────────
let breatheInterval = null;
let breathePhase = 'idle';

function toggleBreathe() {
  const btn = document.getElementById('breatheBtn');
  if (breathePhase === 'idle') {
    btn.textContent = 'Stop';
    runBreathe();
  } else {
    btn.textContent = 'Start';
    stopBreathe();
  }
}

function runBreathe() {
  const circle = document.getElementById('breatheCircle');
  const label  = document.getElementById('breatheLabel');

  function cycle() {
    breathePhase = 'inhale';
    label.textContent = 'Inhale...';
    circle.classList.add('inhale');
    circle.classList.remove('exhale');

    setTimeout(() => {
      label.textContent = 'Hold...';
    }, 4000);

    setTimeout(() => {
      breathePhase = 'exhale';
      label.textContent = 'Exhale...';
      circle.classList.remove('inhale');
      circle.classList.add('exhale');
    }, 8000);
  }

  cycle();
  breatheInterval = setInterval(cycle, 12000);
}

function stopBreathe() {
  clearInterval(breatheInterval);
  breatheInterval = null;
  breathePhase = 'idle';
  const circle = document.getElementById('breatheCircle');
  const label  = document.getElementById('breatheLabel');
  if (circle) { circle.classList.remove('inhale', 'exhale'); }
  if (label)  { label.textContent = 'Inhale'; }
  const btn = document.getElementById('breatheBtn');
  if (btn) btn.textContent = 'Start';
}

// ── Focus Timer ───────────────────────────────────────────────
let timerSecs = 25 * 60;
let timerInterval = null;
let timerRunning = false;

function setTimer(mins) {
  stopTimer();
  timerSecs = mins * 60;
  renderTimer();
}

function toggleTimer() {
  const btn = document.getElementById('timerBtn');
  if (timerRunning) {
    stopTimer();
    btn.textContent = 'Resume';
  } else {
    timerRunning = true;
    btn.textContent = 'Pause';
    timerInterval = setInterval(() => {
      timerSecs--;
      renderTimer();
      if (timerSecs <= 0) { stopTimer(); alert('Time\'s up! Great focus session! 🎉'); }
    }, 1000);
  }
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  timerRunning = false;
  const btn = document.getElementById('timerBtn');
  if (btn) btn.textContent = timerSecs > 0 ? 'Start' : 'Start';
}

function renderTimer() {
  const m = String(Math.floor(timerSecs / 60)).padStart(2, '0');
  const s = String(timerSecs % 60).padStart(2, '0');
  const el = document.getElementById('timerDisplay');
  if (el) el.textContent = `${m}:${s}`;
}

// ── CBT Steps ─────────────────────────────────────────────────
let cbtStep = 1;
const CBT_TOTAL = 5;

function initCBT() {
  cbtStep = 1;
  showCBTStep(1);
  buildDots();
}

function buildDots() {
  const container = document.getElementById('cbt-dots');
  container.innerHTML = '';
  for (let i = 1; i <= CBT_TOTAL; i++) {
    const d = document.createElement('div');
    d.className = 'cbt-dot' + (i === 1 ? ' active' : '');
    container.appendChild(d);
  }
}

function showCBTStep(step) {
  document.querySelectorAll('.cbt-step').forEach(s => s.classList.remove('active'));
  const el = document.querySelector(`.cbt-step[data-step="${step}"]`);
  if (el) el.classList.add('active');

  document.getElementById('cbt-back').style.display = step > 1 ? 'inline-block' : 'none';
  const nextBtn = document.getElementById('cbt-next');
  nextBtn.textContent = step < CBT_TOTAL ? 'Next' : 'Save Reflection';

  document.querySelectorAll('.cbt-dot').forEach((d, i) => {
    d.classList.toggle('active', i + 1 === step);
  });

  if (step > CBT_TOTAL) {
    nextBtn.style.display = 'none';
    document.getElementById('cbt-back').style.display = 'none';
  } else {
    nextBtn.style.display = 'inline-block';
  }
}

function cbtNext() {
  if (cbtStep <= CBT_TOTAL) cbtStep++;
  showCBTStep(cbtStep);
}

function cbtBack() {
  if (cbtStep > 1) cbtStep--;
  showCBTStep(cbtStep);
}

// ── Stress Chart (canvas) ─────────────────────────────────────
function drawChart() {
  const canvas = document.getElementById('stressChart');
  if (!canvas) return;
  canvas.width  = canvas.offsetWidth  || 300;
  canvas.height = 90;
  const ctx = canvas.getContext('2d');

  const data = [2, 4, 3, 5, 4, 3, 5];
  const max  = 6;
  const w    = canvas.width;
  const h    = canvas.height;
  const padX = 8;
  const stepX = (w - padX * 2) / (data.length - 1);

  const pts = data.map((v, i) => ({
    x: padX + i * stepX,
    y: h - (v / max) * (h - 10) - 4
  }));

  // gradient fill
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, 'rgba(124,92,252,.35)');
  grad.addColorStop(1, 'rgba(124,92,252,0)');

  ctx.beginPath();
  ctx.moveTo(pts[0].x, h);
  ctx.lineTo(pts[0].x, pts[0].y);
  pts.slice(1).forEach((p, i) => {
    const prev = pts[i];
    const cpx  = (prev.x + p.x) / 2;
    ctx.bezierCurveTo(cpx, prev.y, cpx, p.y, p.x, p.y);
  });
  ctx.lineTo(pts[pts.length - 1].x, h);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // line
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  pts.slice(1).forEach((p, i) => {
    const prev = pts[i];
    const cpx  = (prev.x + p.x) / 2;
    ctx.bezierCurveTo(cpx, prev.y, cpx, p.y, p.x, p.y);
  });
  ctx.strokeStyle = '#7C5CFC';
  ctx.lineWidth   = 2.5;
  ctx.stroke();

  // dots
  pts.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#7C5CFC';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth   = 2;
    ctx.stroke();
  });
}

// ── Journal Tabs ─────────────────────────────────────────────
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    drawChart();
  });
});

// ── Init ─────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  const jp = document.getElementById('page-journal');
  if (jp && jp.classList.contains('active')) drawChart();
});
