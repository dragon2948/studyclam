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
  if (page === 'support') updateBotStatus();
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
  if (obStep === 2) surveyAnswers.coping   = getSelectedChips('chips-coping');
  if (obStep === 3) surveyAnswers.struggle = getSelectedOption('options-struggle');
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
  obStep = 5;
  showObStep(5);
}

function finishOnboarding() {
  localStorage.setItem('sc_survey_done', '1');
  localStorage.setItem('sc_survey_answers', JSON.stringify(surveyAnswers));
  document.getElementById('onboarding').classList.add('hidden');
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
