const STORAGE_KEY = 'syncmatch-state-v1';
const todayFocus = document.getElementById('todayFocus');
const examCountdown = document.getElementById('examCountdown');
const navItems = document.querySelectorAll('.nav-item');
const screens = document.querySelectorAll('.screen');
const authScreen = document.getElementById('auth-screen');
const appShell = document.getElementById('app-shell');
const authForm = document.getElementById('auth-form');
const toggleButtons = document.querySelectorAll('.toggle-btn');
const signupFields = document.getElementById('signup-fields');
const taskList = document.getElementById('task-list');
const matchList = document.getElementById('match-list');
const messageList = document.getElementById('message-list');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const profileSummary = document.getElementById('profile-summary');
const profileForm = document.getElementById('profile-form');
const logoutBtn = document.getElementById('logout-btn');
const timerDisplay = document.getElementById('timer-display');
const startTimerBtn = document.getElementById('start-timer');
const resetTimerBtn = document.getElementById('reset-timer');
const streakChip = document.getElementById('streak-chip');
const tasksChip = document.getElementById('tasks-chip');

const focusOptions = ['Biology flashcards + Maths past paper', 'History essay plan + Chemistry recap', 'Physics problem set + English reading', 'French vocab drill + Economics notes'];
const countdownOptions = ['10 days', '7 days', '3 days', '1 day'];

const defaultState = {
  isAuthenticated: false,
  user: {
    name: '',
    username: '',
    level: '',
    password: '',
    bio: 'Revision focused and loves helping others.',
    subjects: 'Biology, Maths, English',
    goals: 'Improve exam confidence',
    avatar: 'A'
  },
  tasks: [
    { id: 1, text: 'Submit Chemistry homework', done: false },
    { id: 2, text: 'Revise cell biology', done: true },
    { id: 3, text: 'Reply to Maya in messages', done: false }
  ],
  matches: [
    { id: 1, name: 'Maya', detail: 'Strong in Biology • Needs Maths help', level: 'A-Level', connected: false },
    { id: 2, name: 'Owen', detail: 'A-Level Physics • Loves explaining', level: 'A-Level', connected: true },
    { id: 3, name: 'Aisha', detail: 'GCSE English • Wants essay support', level: 'GCSE', connected: false }
  ],
  messages: [
    { id: 1, from: 'Maya', text: 'Shall we do flashcards tonight?' },
    { id: 2, from: 'You', text: 'Yes, let us start with Biology.' }
  ],
  timer: 2700,
  timerRunning: false,
  screen: 'hub-screen'
};

let state = loadState();

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved
      ? {
          ...defaultState,
          ...saved,
          isAuthenticated: Boolean(saved.isAuthenticated),
          user: { ...defaultState.user, ...(saved.user || {}) },
          tasks: saved.tasks || defaultState.tasks,
          matches: saved.matches || defaultState.matches,
          messages: saved.messages || defaultState.messages
        }
      : structuredClone(defaultState);
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function updateDailyMessage() {
  todayFocus.textContent = focusOptions[Math.floor(Math.random() * focusOptions.length)];
  examCountdown.textContent = countdownOptions[Math.floor(Math.random() * countdownOptions.length)];
}

function switchScreen(targetId) {
  screens.forEach((screen) => screen.classList.toggle('active', screen.id === targetId));
  navItems.forEach((item) => item.classList.toggle('active', item.dataset.target === targetId));
  state.screen = targetId;
  saveState();
}

function renderTasks() {
  const remaining = state.tasks.filter((task) => !task.done).length;
  streakChip.textContent = `${Math.max(5, 8 - remaining)} day streak`;
  tasksChip.textContent = `${remaining} tasks left`;
  taskList.innerHTML = state.tasks.map((task) => `
    <div class="task-item ${task.done ? 'done' : ''}">
      <span>${task.text}</span>
      <button class="btn secondary" data-task-id="${task.id}">${task.done ? 'Undo' : 'Done'}</button>
    </div>
  `).join('');
}

function renderMatches() {
  matchList.innerHTML = state.matches.map((match) => `
    <article class="match-card">
      <div class="match-top">
        <div class="avatar">${match.name[0]}</div>
        <div>
          <h3>${match.name}</h3>
          <p>${match.detail}</p>
        </div>
      </div>
      <div class="match-actions">
        <span class="chip">${match.level}</span>
        <button class="btn secondary" data-match-id="${match.id}">${match.connected ? 'Connected' : 'Connect'}</button>
      </div>
    </article>
  `).join('');
}

function renderMessages() {
  messageList.innerHTML = state.messages.map((message) => `
    <article class="chat-card">
      <p class="chat-label">${message.from}</p>
      <p>${message.text}</p>
    </article>
  `).join('');
}

function renderProfile() {
  profileSummary.innerHTML = `
    <p><strong>${state.user.name}</strong></p>
    <p>${state.user.bio}</p>
    <p>Level: ${state.user.level}</p>
    <p>Subjects: ${state.user.subjects}</p>
    <p>Goals: ${state.user.goals}</p>
  `;
  document.getElementById('profile-name').value = state.user.name;
  document.getElementById('profile-level').value = state.user.level;
  document.getElementById('profile-subjects').value = state.user.subjects;
  document.getElementById('profile-goals').value = state.user.goals;
}

function render() {
  renderTasks();
  renderMatches();
  renderMessages();
  renderProfile();
  updateDailyMessage();
  switchScreen(state.screen || 'hub-screen');
}

function showApp() {
  authScreen.classList.add('hidden');
  appShell.classList.remove('hidden');
  render();
}

function showAuth() {
  authScreen.classList.remove('hidden');
  appShell.classList.add('hidden');
}

function setAuthMode(mode) {
  document.querySelectorAll('.toggle-btn').forEach((btn) => btn.classList.toggle('active', btn.dataset.mode === mode));
  signupFields.classList.toggle('hidden', mode !== 'signup');
}

function loginUser() {
  if (!state.user?.username) {
    state.user = { ...defaultState.user };
  }
  saveState();
  showApp();
}

authForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const mode = document.querySelector('.toggle-btn.active').dataset.mode;
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  if (mode === 'signup') {
    const name = document.getElementById('name').value.trim();
    const level = document.getElementById('level').value.trim();
    state.user = { ...defaultState.user, name, username, level, password, avatar: name[0]?.toUpperCase() || 'S' };
  } else {
    state.user = { ...state.user, username, password };
  }
  state.isAuthenticated = true;
  saveState();
  showApp();
});

toggleButtons.forEach((button) => button.addEventListener('click', () => setAuthMode(button.dataset.mode)));

navItems.forEach((item) => item.addEventListener('click', () => switchScreen(item.dataset.target)));

taskList.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-task-id]');
  if (!button) return;
  const taskId = Number(button.dataset.taskId);
  state.tasks = state.tasks.map((task) => task.id === taskId ? { ...task, done: !task.done } : task);
  saveState();
  renderTasks();
});

matchList.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-match-id]');
  if (!button) return;
  const matchId = Number(button.dataset.matchId);
  state.matches = state.matches.map((match) => match.id === matchId ? { ...match, connected: true } : match);
  saveState();
  renderMatches();
});

messageForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = messageInput.value.trim();
  if (!text) return;
  state.messages.push({ id: Date.now(), from: 'You', text });
  saveState();
  renderMessages();
  messageInput.value = '';
});

profileForm.addEventListener('submit', (event) => {
  event.preventDefault();
  state.user = {
    ...state.user,
    name: document.getElementById('profile-name').value.trim() || state.user.name,
    level: document.getElementById('profile-level').value.trim() || state.user.level,
    subjects: document.getElementById('profile-subjects').value.trim() || state.user.subjects,
    goals: document.getElementById('profile-goals').value.trim() || state.user.goals
  };
  saveState();
  renderProfile();
});

logoutBtn.addEventListener('click', () => {
  state.isAuthenticated = false;
  state.user = { ...defaultState.user };
  saveState();
  showAuth();
});

let timerSeconds = state.timer;
function formatTime(seconds) { const m = String(Math.floor(seconds / 60)).padStart(2, '0'); const s = String(seconds % 60).padStart(2, '0'); return `${m}:${s}`; }
function updateTimer() { timerDisplay.textContent = formatTime(timerSeconds); }
startTimerBtn.addEventListener('click', () => {
  if (state.timerRunning) {
    state.timerRunning = false;
    startTimerBtn.textContent = 'Start';
  } else {
    state.timerRunning = true;
    startTimerBtn.textContent = 'Pause';
    const interval = setInterval(() => {
      if (!state.timerRunning) {
        clearInterval(interval);
        return;
      }
      timerSeconds = Math.max(0, timerSeconds - 1);
      updateTimer();
      if (timerSeconds === 0) {
        state.timerRunning = false;
        startTimerBtn.textContent = 'Start';
        clearInterval(interval);
      }
    }, 1000);
  }
  saveState();
});
resetTimerBtn.addEventListener('click', () => { timerSeconds = 2700; state.timerRunning = false; startTimerBtn.textContent = 'Start'; updateTimer(); saveState(); });

if (state.isAuthenticated && state.user?.username) {
  showApp();
} else {
  showAuth();
}
setAuthMode('login');
updateTimer();
setInterval(updateDailyMessage, 10000);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(console.error));
}
