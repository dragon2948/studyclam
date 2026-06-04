// ── Navigation ──────────────────────────────────────────────
function navigate(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  document.getElementById('page-' + page).classList.add('active');
  const idx = ['home','tools','journal','support','profile'].indexOf(page);
  if (idx >= 0) document.querySelectorAll('.nav-btn')[idx].classList.add('active');

  window.scrollTo(0, 0);
  if (page === 'journal') drawChart();
  if (page === 'groups')  renderAllGroups();
  if (page === 'notes')   renderNotes();
  if (page === 'support') updateBotStatus();
  if (page === 'home')    updateNudge();
  if (page === 'profile') updateProfileStats();
  if (page === 'journal') updateChartLabels(document.querySelector('.tab.active')?.dataset.tab || 'week');
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
  if (name === 'cbt')  initCBT();
  if (name === 'rant') loadRant();
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

// ── Mood Chart (canvas) ───────────────────────────────────────
function getMoodDataForPeriod(period) {
  const history = JSON.parse(localStorage.getItem('sc_mood_history') || '{}');
  const today = new Date();
  if (period === 'week') {
    return Array.from({length: 7}, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      return history[d.toISOString().split('T')[0]] ?? null;
    });
  }
  if (period === 'month') {
    return Array.from({length: 7}, (_, i) => {
      let sum = 0, count = 0;
      for (let j = 0; j < 7; j++) {
        const d = new Date(today);
        d.setDate(today.getDate() - (6 - i) * 7 - j);
        const v = history[d.toISOString().split('T')[0]];
        if (v) { sum += v; count++; }
      }
      return count > 0 ? Math.round(sum / count * 10) / 10 : null;
    });
  }
  // year: last 7 months
  return Array.from({length: 7}, (_, i) => {
    const d = new Date(today);
    d.setMonth(today.getMonth() - (6 - i));
    const mk = d.toISOString().slice(0, 7);
    const entries = Object.entries(history).filter(([k]) => k.startsWith(mk));
    return entries.length ? Math.round(entries.reduce((s, [, v]) => s + v, 0) / entries.length * 10) / 10 : null;
  });
}

function updateChartLabels(tab) {
  const el = document.getElementById('chart-labels');
  if (!el) return;
  const today = new Date();
  const dayA  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const monA  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  let labels;
  if (tab === 'week') {
    labels = Array.from({length: 7}, (_, i) => {
      const d = new Date(today); d.setDate(today.getDate() - (6 - i));
      return dayA[d.getDay()];
    });
  } else if (tab === 'month') {
    labels = Array.from({length: 7}, (_, i) => i === 6 ? 'This wk' : `-${6 - i}w`);
  } else {
    labels = Array.from({length: 7}, (_, i) => {
      const d = new Date(today); d.setMonth(today.getMonth() - (6 - i));
      return monA[d.getMonth()];
    });
  }
  el.innerHTML = labels.map(l => `<span>${l}</span>`).join('');
}

function updateChartSubtitle(rawData) {
  const el = document.getElementById('chart-subtitle');
  if (!el) return;
  const real = rawData.filter(v => v !== null);
  if (!real.length) { el.textContent = 'Check in daily to see your trend here.'; return; }
  const avg = real.reduce((a, b) => a + b, 0) / real.length;
  const moodLabel = ['', 'Anxious', 'Stressed', 'Okay', 'Good', 'Great'][Math.round(avg)] || 'Okay';
  if (avg >= 4)      el.textContent = `You've been feeling ${moodLabel} this week 🌟`;
  else if (avg >= 3) el.textContent = 'You\'ve been feeling okay on average.';
  else               el.textContent = 'It\'s been a tough week. You\'re not alone 💜';
}

function drawChart() {
  const canvas = document.getElementById('stressChart');
  if (!canvas) return;
  canvas.width  = canvas.offsetWidth || 300;
  canvas.height = 90;
  const ctx = canvas.getContext('2d');

  const tab    = document.querySelector('.tab.active')?.dataset.tab || 'week';
  const rawData = getMoodDataForPeriod(tab);
  updateChartLabels(tab);
  updateChartSubtitle(rawData);

  // Fill nulls with previous real value (or 3) for smooth curve
  let last = 3;
  const data = rawData.map(v => { if (v !== null) { last = v; return v; } return last; });

  const max  = 6;
  const w    = canvas.width;
  const h    = canvas.height;
  const padX = 8;
  const stepX = (w - padX * 2) / (data.length - 1);
  const pts   = data.map((v, i) => ({ x: padX + i * stepX, y: h - (v / max) * (h - 10) - 4 }));

  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, 'rgba(124,92,252,.35)');
  grad.addColorStop(1, 'rgba(124,92,252,0)');

  ctx.beginPath();
  ctx.moveTo(pts[0].x, h);
  ctx.lineTo(pts[0].x, pts[0].y);
  pts.slice(1).forEach((p, i) => {
    const prev = pts[i], cpx = (prev.x + p.x) / 2;
    ctx.bezierCurveTo(cpx, prev.y, cpx, p.y, p.x, p.y);
  });
  ctx.lineTo(pts[pts.length - 1].x, h);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  pts.slice(1).forEach((p, i) => {
    const prev = pts[i], cpx = (prev.x + p.x) / 2;
    ctx.bezierCurveTo(cpx, prev.y, cpx, p.y, p.x, p.y);
  });
  ctx.strokeStyle = '#7C5CFC';
  ctx.lineWidth   = 2.5;
  ctx.stroke();

  pts.forEach((p, i) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    if (rawData[i] !== null) {
      ctx.fillStyle = '#7C5CFC'; ctx.fill();
      ctx.strokeStyle = '#fff';  ctx.lineWidth = 2;
    } else {
      ctx.fillStyle = '#EDE8FF'; ctx.fill();
      ctx.strokeStyle = '#C4B5FD'; ctx.lineWidth = 1.5;
    }
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

// ── Groups Data ───────────────────────────────────────────────
const GROUPS = [
  { id: 'gaming',      name: 'Gaming Circle',     emoji: '🎮', tag: 'Social',   color: 'blue',   desc: 'Unwind and connect over games',            matchHobbies: ['Gaming'],      matchCoping: ['Gaming'],    members: 48 },
  { id: 'music',       name: 'Music & Chill',      emoji: '🎵', tag: 'Creative', color: 'pink',   desc: 'Jam sessions and playlist sharing',        matchHobbies: ['Music'],       matchCoping: ['Music'],     members: 35 },
  { id: 'fitness',     name: 'Campus Fitness',     emoji: '🏃', tag: 'Active',   color: 'green',  desc: 'Group runs and workout buddies',           matchHobbies: ['Sports'],      matchCoping: ['Exercise'],  members: 62 },
  { id: 'study',       name: 'Study Together',     emoji: '📚', tag: 'Academic', color: 'purple', desc: 'Focused group study and peer support',     matchHobbies: ['Reading'],     matchCoping: [],            members: 94 },
  { id: 'art',         name: 'Art & Design',       emoji: '🎨', tag: 'Creative', color: 'pink',   desc: 'Create, share, and get inspired',         matchHobbies: ['Art'],         matchCoping: [],            members: 29 },
  { id: 'mindfulness', name: 'Mindfulness Circle', emoji: '🧘', tag: 'Wellness', color: 'purple', desc: 'Meditation, breathing and stress relief',  matchHobbies: [],              matchCoping: ['Meditation'], members: 41 },
  { id: 'photography', name: 'Photo Society',      emoji: '📷', tag: 'Creative', color: 'blue',   desc: 'Explore campus through a lens',            matchHobbies: ['Photography'], matchCoping: [],            members: 23 },
  { id: 'cooking',     name: 'Cooking Club',       emoji: '🍳', tag: 'Social',   color: 'green',  desc: 'Cook, eat, and bond with others',         matchHobbies: ['Cooking'],     matchCoping: [],            members: 31 },
];

// ── Survey State ──────────────────────────────────────────────
let obStep = 0;
let surveyAnswers = {};

function showObStep(step) {
  document.querySelectorAll('.ob-step').forEach(s => s.classList.remove('active'));
  const el = document.querySelector(`.ob-step[data-step="${step}"]`);
  if (el) {
    el.classList.add('active');
    const inner = document.querySelector('.ob-inner');
    if (inner) inner.scrollTop = 0;
  }
}

function obNext() {
  if (obStep === 1) surveyAnswers.hobbies  = getSelectedChips('chips-hobbies');
  if (obStep === 2) surveyAnswers.course   = getSelectedOption('options-course');
  if (obStep === 3) surveyAnswers.coping   = getSelectedChips('chips-coping');
  if (obStep === 4) surveyAnswers.struggle = getSelectedOption('options-struggle');
  obStep++;
  showObStep(obStep);
}

function obBack() {
  if (obStep > 1) { obStep--; showObStep(obStep); }
}

function obFinish() {
  surveyAnswers.connect = getSelectedOption('options-connect');
  const matches = computeMatches(surveyAnswers);
  renderMatchCards(matches, document.getElementById('ob-matches'));
  obStep = 6;
  showObStep(6);
}

function finishOnboarding() {
  localStorage.setItem('sc_survey_done', '1');
  localStorage.setItem('sc_survey_answers', JSON.stringify(surveyAnswers));
  document.getElementById('onboarding').classList.add('hidden');
  requestNotificationPermission();
  navigate('home');
}

function getSelectedChips(containerId) {
  return Array.from(document.querySelectorAll(`#${containerId} .ob-chip.selected`))
    .map(el => el.dataset.val);
}

function getSelectedOption(containerId) {
  const el = document.querySelector(`#${containerId} .ob-option.selected`);
  return el ? el.dataset.val : null;
}

// ── Matching Algorithm ────────────────────────────────────────
function computeMatches(answers) {
  const scored = GROUPS.map(g => {
    const mH = (answers.hobbies || []).filter(h => g.matchHobbies.includes(h));
    const mC = (answers.coping  || []).filter(c => g.matchCoping.includes(c));
    let score = mH.length * 2 + mC.length * 2;
    if (answers.struggle === 'Isolation' && ['Social', 'Active'].includes(g.tag)) score++;
    if (answers.struggle === 'Motivation' && g.id === 'study') score++;
    if (['Computer Science', 'Engineering'].includes(answers.course) && ['gaming', 'study'].includes(g.id)) score++;
    if (answers.course === 'Design' && ['art', 'photography'].includes(g.id)) score++;
    if (answers.course === 'Health' && ['mindfulness', 'fitness'].includes(g.id)) score++;
    if (answers.course === 'Business' && g.id === 'study') score++;
    const all = [...mH, ...mC];
    const reason = all.length > 0
      ? `Matches your interest in ${all.slice(0, 2).join(' & ')}`
      : score > 0 ? 'Great for reducing academic stress' : 'Recommended for your wellbeing';
    return { ...g, score, reason };
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored.filter(g => g.score > 0).slice(0, 4);

  if (top.length < 3) {
    ['study', 'mindfulness'].forEach(id => {
      if (!top.find(m => m.id === id) && top.length < 4) {
        const g = GROUPS.find(g => g.id === id);
        if (g) top.push({ ...g, score: 0, reason: 'Recommended for your wellbeing' });
      }
    });
  }
  return top.slice(0, 4);
}

// ── Render Cards ──────────────────────────────────────────────
function renderMatchCards(matches, container) {
  if (!container) return;
  const joined = JSON.parse(localStorage.getItem('sc_joined_groups') || '[]');
  container.innerHTML = matches.map(g => `
    <div class="match-card">
      <div class="match-emoji ${g.color}">${g.emoji}</div>
      <div class="match-info">
        <div class="match-name">${g.name}</div>
        <span class="match-tag">${g.tag}</span>
        <div class="match-desc">${g.desc}</div>
        <div class="match-meta">${g.members} members · Low commitment</div>
        ${g.reason ? `<div class="match-why">${g.reason}</div>` : ''}
      </div>
      <button class="match-join${joined.includes(g.id) ? ' joined' : ''}" onclick="joinGroup('${g.id}', this)">${joined.includes(g.id) ? 'Joined ✓' : 'Join'}</button>
    </div>
  `).join('');
}

function renderAllGroups() {
  renderMatchCards(GROUPS, document.getElementById('all-groups-list'));
}

function joinGroup(id, btn) {
  const joined = JSON.parse(localStorage.getItem('sc_joined_groups') || '[]');
  if (!joined.includes(id)) {
    joined.push(id);
    localStorage.setItem('sc_joined_groups', JSON.stringify(joined));
  }
  btn.textContent = 'Joined ✓';
  btn.classList.add('joined');
}

function openMatches() {
  if (!localStorage.getItem('sc_survey_done')) {
    document.getElementById('onboarding').classList.remove('hidden');
    obStep = 0;
    showObStep(0);
    return;
  }
  const matches = computeMatches(surveyAnswers);
  renderMatchCards(matches, document.getElementById('overlay-matches-list'));
  document.getElementById('overlay-matches').classList.add('open');
}

// ── Chip / Option Interaction ─────────────────────────────────
document.querySelectorAll('.ob-chips').forEach(container => {
  container.addEventListener('click', e => {
    const chip = e.target.closest('.ob-chip');
    if (chip) chip.classList.toggle('selected');
  });
});

document.querySelectorAll('.ob-options').forEach(container => {
  container.addEventListener('click', e => {
    const opt = e.target.closest('.ob-option');
    if (opt) {
      container.querySelectorAll('.ob-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
    }
  });
});

// ── Onboarding Init Check ─────────────────────────────────────
if (localStorage.getItem('sc_survey_done')) {
  document.getElementById('onboarding').classList.add('hidden');
  const saved = localStorage.getItem('sc_survey_answers');
  if (saved) surveyAnswers = JSON.parse(saved);
}

// ── StudyBot Chat ─────────────────────────────────────────────
const TIPS = [
  "Try the Pomodoro technique: 25 min focus, 5 min break. It really works! 🍅",
  "Even a 10-minute walk lowers your cortisol (stress hormone) significantly. 🚶",
  "Writing down worries before bed can help you sleep better. 📝",
  "Social connection is one of the strongest predictors of wellbeing. 👥",
  "5-4-3-2-1 grounding: name 5 things you see, 4 you hear, 3 you feel, 2 you smell, 1 you taste. 🧘",
  "Breaking one big task into 3 small steps makes it feel achievable. ✅",
  "Staying hydrated throughout the day reduces fatigue and improves focus. 💧",
];
let tipIndex = 0;
let typingBubble = null;

const CHAT_FLOWS = {
  'Stressed 😟': {
    messages: [
      "I hear you 💜 Stress hits hard, especially with academic pressure.",
      "You're already doing something right by checking in. What would help most right now?"
    ],
    replies: ['Try breathing', 'Challenge a thought', 'Connect with peers', 'Just needed to vent']
  },
  'Overwhelmed 😰': {
    messages: [
      "That sounds really tough 💜 When everything piles up it can feel impossible.",
      "Let's take this one step at a time. What feels most urgent?"
    ],
    replies: ['Help me calm down', 'Talk through my thoughts', 'Connect with peers', 'Just needed to vent']
  },
  'Pretty okay 😐': {
    messages: [
      "Okay is totally valid 😊 Steady days count!",
      "Anything on your mind, or just checking in?"
    ],
    replies: ['Actually a bit stressed', 'Find a study group', 'Share a tip', 'All good, thanks']
  },
  'Feeling good 🙂': {
    messages: [
      "Love to hear it! 🌟 Keep riding that wave!",
      "Want to connect with others or explore a new community?"
    ],
    replies: ['Show me communities', 'Share a tip', 'All good, thanks']
  },
  'Try breathing': {
    messages: ["Opening the Breathing Exercise for you 💨"],
    action: () => { closeOverlay(); setTimeout(() => openTool('breathing'), 350); }
  },
  'Help me calm down': {
    messages: ["Let's try a breathing exercise — just follow the circle 💨"],
    action: () => { closeOverlay(); setTimeout(() => openTool('breathing'), 350); }
  },
  'Challenge a thought': {
    messages: ["Let's work through that thought with the CBT tool 💬"],
    action: () => { closeOverlay(); setTimeout(() => openTool('cbt'), 350); }
  },
  'Talk through my thoughts': {
    messages: ["The Thought Challenger is great for this 💬"],
    action: () => { closeOverlay(); setTimeout(() => openTool('cbt'), 350); }
  },
  'Connect with peers': {
    messages: ["There are some great communities here for you 👥"],
    action: () => { closeOverlay(); setTimeout(() => navigate('groups'), 350); }
  },
  'Show me communities': {
    messages: ["Let me show you what's available 👥"],
    action: () => { closeOverlay(); setTimeout(() => navigate('groups'), 350); }
  },
  'Find a study group': {
    messages: ["Checking out the study communities for you 📚"],
    action: () => { closeOverlay(); setTimeout(() => navigate('groups'), 350); }
  },
  'Try focus timer': {
    messages: ["Opening the Focus Timer — try a 25-min session! ⏱️"],
    action: () => { closeOverlay(); setTimeout(() => openTool('focus'), 350); }
  },
  'Just needed to vent': {
    messages: [
      "That's totally okay 💜 I'm here.",
      "How are you feeling right now?"
    ],
    replies: ['A bit better', 'Still stressed', 'Thanks for listening']
  },
  'A bit better': {
    messages: ["I'm glad 💜 Remember — one day at a time. You've got this!"],
    replies: ['Share a tip', 'Close chat']
  },
  'Still stressed': {
    messages: ["Let's try something practical — even 2 minutes of breathing can shift things."],
    replies: ['Try breathing', 'Challenge a thought']
  },
  'Thanks for listening': {
    messages: ["Always here for you 💜 Take care of yourself."],
    replies: ['Close chat']
  },
  'Actually a bit stressed': {
    messages: ["Hey, it's okay to admit that 💜 What's been stressing you out?"],
    replies: ['Exams', 'Heavy workload', 'Social stuff', 'Everything at once']
  },
  'Exams': {
    messages: [
      "Exam stress is so common 😮‍💨 You're not alone.",
      "Try breaking your study into 25-min sprints. Want to use the Focus Timer?"
    ],
    replies: ['Try focus timer', 'Connect with peers', 'Share a tip']
  },
  'Heavy workload': {
    messages: [
      "Heavy workloads can feel crushing 💜 One task at a time.",
      "A focus timer can help you chip away at it steadily."
    ],
    replies: ['Try focus timer', 'Just needed to vent', 'Share a tip']
  },
  'Social stuff': {
    messages: [
      "Social dynamics can be really draining 💜",
      "Connecting with even one like-minded person can make a big difference."
    ],
    replies: ['Show me communities', 'Just needed to vent']
  },
  'Everything at once': {
    messages: [
      "Breathe 💜 You don't have to solve everything today.",
      "What's the ONE thing you'd tackle first?"
    ],
    replies: ['Help me calm down', 'Challenge a thought', 'Just needed to vent']
  },
  'Share a tip': { messages: [], replies: ['Another tip', "That's helpful!", 'Close chat'] },
  'Another tip':  { messages: [], replies: ['Another tip', "That's helpful!", 'Close chat'] },
  "That's helpful!": {
    messages: ["Great! Small steps add up 💜 You've got this."],
    replies: ['Close chat']
  },
  'All good, thanks': {
    messages: ["Great! Come back anytime 😊 Take care!"],
    close: true
  },
  'Close chat': {
    messages: ["Take care 💜 I'm here whenever you need me!"],
    close: true
  }
};

function updateBotStatus() {
  const el = document.getElementById('bot-status-msg');
  if (!el) return;
  const h = new Date().getHours();
  if (h >= 22 || h < 3)  el.textContent = "It's late — checking in on you 🌙";
  else if (h >= 19)       el.textContent = "Good evening — how are you holding up? 🌆";
  else                    el.textContent = "Here to check in on you 💜";
}

function openChat() {
  document.getElementById('overlay-chat').classList.add('open');
  document.getElementById('chat-messages').innerHTML = '';
  document.getElementById('chat-quick-replies').innerHTML = '';
  typingBubble = null;

  const h = new Date().getHours();
  let openingMsgs;
  if (h >= 22 || h < 3)   openingMsgs = ["Hey, it's pretty late 🌙 Are you doing okay?", "Late nights can be tough. How are you feeling?"];
  else if (h >= 19)        openingMsgs = ["Good evening! 🌆", "How are you holding up today?"];
  else if (h >= 6 && h < 12) openingMsgs = ["Good morning! ☀️", "How are you feeling today?"];
  else                     openingMsgs = ["Hey there! 😊", "How are you doing right now?"];

  openingMsgs.forEach((msg, i) => {
    setTimeout(() => {
      showBotTyping();
      setTimeout(() => {
        hideBotTyping();
        showBotMessage(msg);
        if (i === openingMsgs.length - 1) {
          setTimeout(() => showQuickReplies(
            ['Stressed 😟', 'Overwhelmed 😰', 'Pretty okay 😐', 'Feeling good 🙂']
          ), 350);
        }
      }, 750);
    }, i * 1300);
  });
}

function processChatFlow(key) {
  let flow = CHAT_FLOWS[key] || detectChatKeywords(key);
  let msgs = flow.messages ? [...flow.messages] : [];

  if (key === 'Share a tip' || key === 'Another tip') {
    msgs = [TIPS[tipIndex % TIPS.length]];
    tipIndex++;
  }

  if (msgs.length === 0) {
    if (flow.action) { flow.action(); return; }
    showQuickReplies(flow.replies || []);
    return;
  }

  msgs.forEach((msg, i) => {
    setTimeout(() => {
      showBotTyping();
      setTimeout(() => {
        hideBotTyping();
        showBotMessage(msg);
        if (i === msgs.length - 1) {
          if (flow.action)        setTimeout(flow.action, 600);
          else if (flow.close)    setTimeout(closeOverlay, 1800);
          else                    setTimeout(() => showQuickReplies(flow.replies || []), 350);
        }
      }, 750);
    }, i * 1500);
  });
}

function detectChatKeywords(text) {
  const t = text.toLowerCase();
  if (/exam|test|quiz|assignment|deadline|grades|study/.test(t)) return CHAT_FLOWS['Exams'];
  if (/overwhelm|too much|can't cope|panic/.test(t))             return CHAT_FLOWS['Overwhelmed 😰'];
  if (/lonely|alone|isolated|no friends/.test(t))               return CHAT_FLOWS['Social stuff'];
  if (/tired|exhausted|sleep|fatigue/.test(t))                  return { messages: ["Rest is productive too 💜 Give yourself real permission to rest. Sleep matters more than one more hour of studying."], replies: ['Share a tip', 'Close chat'] };
  if (/stress|anxious|anxiety|worried|scared/.test(t))          return CHAT_FLOWS['Stressed 😟'];
  if (/good|great|fine|well|happy/.test(t))                     return CHAT_FLOWS['Feeling good 🙂'];
  return { messages: ["Thanks for sharing 💜 I hear you. What would help most right now?"], replies: ['Try breathing', 'Challenge a thought', 'Connect with peers', 'Share a tip'] };
}

function showBotMessage(text) {
  const el = document.createElement('div');
  el.className = 'chat-bubble bot';
  el.textContent = text;
  appendChatBubble(el);
}

function showUserMessage(text) {
  const el = document.createElement('div');
  el.className = 'chat-bubble user';
  el.textContent = text;
  appendChatBubble(el);
}

function showBotTyping() {
  const el = document.createElement('div');
  el.className = 'chat-bubble bot';
  el.innerHTML = '<span class="typing-dots"><span>●</span><span>●</span><span>●</span></span>';
  appendChatBubble(el);
  typingBubble = el;
}

function hideBotTyping() {
  if (typingBubble) { typingBubble.remove(); typingBubble = null; }
}

function appendChatBubble(el) {
  const messages = document.getElementById('chat-messages');
  messages.appendChild(el);
  messages.scrollTop = messages.scrollHeight;
}

function showQuickReplies(replies) {
  const c = document.getElementById('chat-quick-replies');
  c.innerHTML = replies.map(r =>
    `<button class="chat-qr" onclick="handleQuickReply(this.textContent)">${r}</button>`
  ).join('');
}

function handleQuickReply(text) {
  showUserMessage(text);
  document.getElementById('chat-quick-replies').innerHTML = '';
  setTimeout(() => processChatFlow(text), 400);
}

function sendChatMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  handleQuickReply(text);
}

updateBotStatus();

// ── Streak & Check-in ─────────────────────────────────────────
function todayKey() {
  return new Date().toISOString().split('T')[0];
}

// Returns the ISO date of Monday for the given date's week
function weekKey(d = new Date()) {
  const day = d.getDay() || 7;
  const monday = new Date(d);
  monday.setDate(d.getDate() - day + 1);
  return monday.toISOString().split('T')[0];
}

function prevWeekKey() {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return weekKey(d);
}

function doCheckin() {
  const selected = document.querySelector('.mood-btn.selected');
  const moodVal  = selected ? parseInt(selected.dataset.mood) : null;

  if (moodVal) {
    const history = JSON.parse(localStorage.getItem('sc_mood_history') || '{}');
    history[todayKey()] = moodVal;
    localStorage.setItem('sc_mood_history', JSON.stringify(history));
  }

  // Weekly streak: only increment once per week
  const thisWeek = weekKey();
  const lastWeek = localStorage.getItem('sc_streak_week');
  if (lastWeek !== thisWeek) {
    const streak = parseInt(localStorage.getItem('sc_streak') || '0');
    localStorage.setItem('sc_streak', lastWeek === prevWeekKey() ? streak + 1 : 1);
    localStorage.setItem('sc_streak_week', thisWeek);
  }

  localStorage.setItem('sc_last_checkin', todayKey());
  updateNudge();
  navigate('journal');
}

function updateNudge() {
  const nudge = document.getElementById('checkin-nudge');
  if (!nudge) return;
  const lastCheckin = localStorage.getItem('sc_last_checkin');
  const checkedThisWeek = lastCheckin && weekKey(new Date(lastCheckin)) === weekKey();
  if (checkedThisWeek) { nudge.style.display = 'none'; return; }
  const streak = parseInt(localStorage.getItem('sc_streak') || '0');
  nudge.style.display = 'flex';
  nudge.querySelector('.nudge-text').textContent = streak > 0
    ? `Check in this week to keep your ${streak}-week streak! 🔥`
    : 'Start your weekly check-in streak! 🌟';
}

function updateProfileStats() {
  const streak  = localStorage.getItem('sc_streak') || '0';
  const history = JSON.parse(localStorage.getItem('sc_mood_history') || '{}');
  const vals    = Object.values(history);
  const avg     = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '—';

  const sEl = document.getElementById('stat-streak');
  const cEl = document.getElementById('stat-sessions');
  const mEl = document.getElementById('stat-mood');
  if (sEl) sEl.textContent = streak;
  if (cEl) cEl.textContent = vals.length;
  if (mEl) mEl.textContent = avg;
}

// ── Rant Box ──────────────────────────────────────────────────
function loadRant() {
  const el = document.getElementById('rant-input');
  if (el) el.value = localStorage.getItem('sc_rant') || '';
}

function saveRant() {
  const el = document.getElementById('rant-input');
  if (el) localStorage.setItem('sc_rant', el.value);
}

function clearRant() {
  localStorage.removeItem('sc_rant');
  const el = document.getElementById('rant-input');
  if (!el) return;
  el.value = '';
  el.placeholder = 'All clear 🌬️ Feeling a little lighter?';
}

// ── Notifications ─────────────────────────────────────────────
function requestNotificationPermission() {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') { scheduleStreakReminder(); return; }
  if (Notification.permission === 'default') {
    const res = Notification.requestPermission();
    if (res && res.then) res.then(() => scheduleStreakReminder());
    else scheduleStreakReminder();
  }
}

function fireNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body });
  }
}

function scheduleStreakReminder() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  // Check immediately on page open (re-engagement)
  const lastCheckin = localStorage.getItem('sc_last_checkin') || '';
  const checkedThisWeek = lastCheckin && weekKey(new Date(lastCheckin)) === weekKey();
  if (!checkedThisWeek && localStorage.getItem('sc_notif_shown') !== weekKey()) {
    setTimeout(() => {
      fireNotification('StudyCalm 💜', "You haven't checked in this week yet. Keep that streak going! 🔥");
      localStorage.setItem('sc_notif_shown', weekKey());
    }, 6000);
  }
  // Hourly check: fire reminder at user's chosen hour (default 8pm)
  setInterval(() => {
    const h = new Date().getHours();
    const target = parseInt(localStorage.getItem('sc_reminder_hour') || '20');
    if (h !== target) return;
    const lc = localStorage.getItem('sc_last_checkin') || '';
    const done = lc && weekKey(new Date(lc)) === weekKey();
    const shown = localStorage.getItem('sc_notif_shown') === weekKey();
    if (!done && !shown) {
      fireNotification('StudyCalm 💜', "Don't forget to check in this week! Keep your streak alive 🔥");
      localStorage.setItem('sc_notif_shown', weekKey());
    }
  }, 60 * 1000);
}

// ── Notes / Forum ─────────────────────────────────────────────
const SAMPLE_NOTES = [
  {
    id: 'n1', course: 'Computer Science',
    title: 'Data Structures — Final Exam Tips',
    author: 'Marcus · Year 3 · CS', time: '2 days ago',
    tags: ['Exams', 'Tips'],
    content: `Key topics that always come up:\n\n1. Binary Trees & BST traversal (inorder, preorder, postorder)\n2. Graph algorithms — BFS and DFS are almost always tested\n3. Dynamic programming — start with simple DP before complex\n4. Time complexity — know Big O for all of the above\n\nTip: Draw out trees on paper before coding. Examiners want to see your reasoning, not just the answer.`
  },
  {
    id: 'n2', course: 'General',
    title: 'How I Balanced School & My Mental Health',
    author: 'Priya · Year 4 · Business', time: '1 week ago',
    tags: ['Wellness', 'Life'],
    content: `My Year 2 burnout taught me a lot:\n\n1. Schedule rest like you schedule assignments — put it in your calendar.\n2. The 2-minute rule: if it takes less than 2 min, do it now.\n3. Weekly reviews on Sundays help you feel in control.\n4. Saying no to one thing is saying yes to your wellbeing.\n\nYou don't have to be productive every moment. Progress is non-linear.`
  },
  {
    id: 'n3', course: 'Business',
    title: 'Statistics — Key Formulas (Don\'t Memorise These 😅)',
    author: 'Aiden · Year 3 · Business', time: '3 days ago',
    tags: ['Formulas', 'Exams'],
    content: `Formulas the prof says "you don't need to memorise" but definitely tests:\n\n• Z-score: (X - μ) / σ\n• Confidence interval: x̄ ± z*(σ/√n)\n• Always state H0 and H1 clearly before testing\n• p-value < 0.05 = reject null hypothesis\n\nPractise with past year papers. The question style repeats a lot.`
  },
  {
    id: 'n4', course: 'Design',
    title: 'Design Thinking for Project Modules',
    author: 'Yuki · Year 4 · Design', time: '5 days ago',
    tags: ['Projects', 'Tips'],
    content: `For any project module, structure your work around the Double Diamond:\n\n1. Discover — user research, interviews, empathy maps\n2. Define — problem statement, HMW questions\n3. Develop — ideation, prototyping, iteration\n4. Deliver — final solution + user testing results\n\nProfs love when you show the iteration process, not just the final output. Document your failures too — they show critical thinking.`
  },
  {
    id: 'n5', course: 'General',
    title: 'Surviving Internship Application Season',
    author: 'Jun Wei · Year 3 · Engineering', time: '1 week ago',
    tags: ['Career', 'Tips'],
    content: `Internship season stress is real. What actually helped me:\n\n1. Apply early (Nov–Dec) — most deadlines are Jan–Feb\n2. Tailor your resume per company, not a blanket send\n3. 1–2 Leetcode problems a day beats cramming\n4. If rejected, ask for feedback — most companies give it\n5. Your classmates are not your competition — help each other\n\nGot rejected 12 times before my offer. Persistence matters more than talent.`
  }
];

let currentNoteFilter = 'All';
let currentThreadId   = null;

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function loadNotes() {
  const user = JSON.parse(localStorage.getItem('sc_user_notes') || '[]');
  return [...user, ...SAMPLE_NOTES];
}

function getComments(noteId) {
  return JSON.parse(localStorage.getItem(`sc_comments_${noteId}`) || '[]');
}

function renderNotes(filter) {
  if (filter !== undefined) currentNoteFilter = filter;
  const notes    = loadNotes();
  const filtered = currentNoteFilter === 'All' ? notes : notes.filter(n => n.course === currentNoteFilter);

  // Filter chips
  const courses  = ['All', ...new Set(notes.map(n => n.course))];
  const fEl = document.getElementById('note-filters');
  if (fEl) fEl.innerHTML = courses.map(c =>
    `<div class="nf-chip${c === currentNoteFilter ? ' active' : ''}" onclick="renderNotes('${escHtml(c)}')">${escHtml(c)}</div>`
  ).join('');

  const listEl = document.getElementById('notes-list');
  if (!listEl) return;

  if (!filtered.length) {
    listEl.innerHTML = '<div class="no-notes">No notes yet for this course. Be the first to share! 📝</div>';
    return;
  }

  listEl.innerHTML = filtered.map(note => {
    const count = getComments(note.id).length;
    const preview = escHtml(note.content.replace(/\n/g, ' ').slice(0, 120));
    return `
      <div class="card note-card" onclick="openThread('${note.id}')">
        <div class="note-tags">
          <span class="note-tag">${escHtml(note.course)}</span>
          ${(note.tags || []).map(t => `<span class="note-tag" style="background:var(--bg);color:var(--text-sub)">${escHtml(t)}</span>`).join('')}
        </div>
        <p class="note-title">${escHtml(note.title)}</p>
        <p class="note-meta">${escHtml(note.author)} · ${escHtml(note.time)}</p>
        <p class="note-preview">${preview}…</p>
        <div class="note-footer">
          <span class="note-comment-count">💬 ${count} comment${count !== 1 ? 's' : ''}</span>
          <span style="font-size:.8rem;color:var(--primary);font-weight:600">Read ›</span>
        </div>
      </div>`;
  }).join('');
}

function openThread(noteId) {
  currentThreadId = noteId;
  const note = loadNotes().find(n => n.id === noteId);
  if (!note) return;
  const tagEl = document.getElementById('thread-course-tag');
  if (tagEl) tagEl.textContent = note.course;
  renderThreadBody(note);
  document.getElementById('overlay-note-thread').classList.add('open');
}

function renderThreadBody(note) {
  const comments = getComments(note.id);
  const body = document.getElementById('thread-body');
  if (!body) return;
  const noComments = comments.length === 0
    ? '<p style="font-size:.83rem;color:var(--text-sub);margin-bottom:12px">No comments yet — start the discussion!</p>'
    : '';
  body.innerHTML = `
    <p class="thread-note-title">${escHtml(note.title)}</p>
    <p class="thread-note-meta">${escHtml(note.author)} · ${escHtml(note.time)}</p>
    <p class="thread-note-content">${escHtml(note.content)}</p>
    <div class="thread-divider">💬 Discussion · ${comments.length} comment${comments.length !== 1 ? 's' : ''}</div>
    ${noComments}
    ${comments.map(c => `
      <div class="thread-comment">
        <div class="comment-av">${escHtml(c.author[0].toUpperCase())}</div>
        <div class="comment-body">
          <div class="comment-author">${escHtml(c.author)}</div>
          <div class="comment-text">${escHtml(c.text)}</div>
          <div class="comment-time">${escHtml(c.time)}</div>
        </div>
      </div>`).join('')}
  `;
  body.scrollTop = body.scrollHeight;
}

function submitComment() {
  const input = document.getElementById('comment-input');
  const text  = input?.value.trim();
  if (!text || !currentThreadId) return;
  input.value = '';
  const comments = getComments(currentThreadId);
  comments.push({ author: 'You', text, time: 'Just now' });
  localStorage.setItem(`sc_comments_${currentThreadId}`, JSON.stringify(comments));
  const note = loadNotes().find(n => n.id === currentThreadId);
  if (note) renderThreadBody(note);
  // Refresh the notes list comment count in the background
  renderNotes();
}

function openShareNote() {
  document.getElementById('overlay-share-note').classList.add('open');
}

function submitNote() {
  const title   = document.getElementById('share-title')?.value.trim();
  const course  = document.getElementById('share-course')?.value;
  const author  = document.getElementById('share-author')?.value.trim() || 'Anonymous';
  const content = document.getElementById('share-content')?.value.trim();
  if (!title || !course || !content) {
    // Inline validation — highlight empty fields
    [['share-title', title], ['share-course', course], ['share-content', content]].forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) el.style.borderColor = val ? '#E8E0FF' : '#e74c3c';
    });
    return;
  }
  const note = {
    id: 'user-' + Date.now(),
    title, course, author, content,
    time: 'Just now', tags: []
  };
  const userNotes = JSON.parse(localStorage.getItem('sc_user_notes') || '[]');
  userNotes.unshift(note);
  localStorage.setItem('sc_user_notes', JSON.stringify(userNotes));
  ['share-title', 'share-author', 'share-content'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.value = ''; el.style.borderColor = ''; }
  });
  const sel = document.getElementById('share-course');
  if (sel) { sel.selectedIndex = 0; sel.style.borderColor = ''; }
  closeOverlay();
  renderNotes();
}

// ── Page Init ─────────────────────────────────────────────────
updateNudge();
updateProfileStats();
scheduleStreakReminder();
