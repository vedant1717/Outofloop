// Client-side Application Logic for Out of the Loop - End-of-Game Imposter Guess Edition
const socket = io();

// Web Audio API Sound Synthesizer
class SoundFX {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  playPop() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playRevealSecret() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.2);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(now + 0.3);
  }

  playFunnyImposterSiren() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.linearRampToValueAtTime(900, now + 0.3);
    osc.frequency.linearRampToValueAtTime(400, now + 0.6);
    osc.frequency.linearRampToValueAtTime(900, now + 0.9);
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 1.2);
  }

  playFanfare() {
    this.init();
    if (!this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime + (idx * 0.1);
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    });
  }
}

const sound = new SoundFX();

// Session Token Management
let myPlayerToken = localStorage.getItem('loop_player_token');
if (!myPlayerToken) {
  myPlayerToken = 'token-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
  localStorage.setItem('loop_player_token', myPlayerToken);
}

let currentRole = null;
let myPlayerId = null;
let currentSecretCard = null;
let selectedAvatar = '🍔';
let latestGameState = null;
let mySelectedVoteToken = null;
let hasShownFunnyReveal = false;
let mySelectedImposterGuess = null;

// Views
const views = {
  landing: document.getElementById('landing-view'),
  passwordModal: document.getElementById('password-modal'),
  playerJoin: document.getElementById('player-join-view'),
  playerLobby: document.getElementById('player-lobby-view'),
  serverControl: document.getElementById('server-view')
};

function showView(viewName) {
  Object.keys(views).forEach(key => {
    if (views[key]) views[key].classList.add('hidden');
  });
  if (views[viewName]) views[viewName].classList.remove('hidden');

  const leftAdmin = document.getElementById('admin-left-turn-permissions-panel');
  const rightAdmin = document.getElementById('admin-right-kick-panel');
  if (leftAdmin && rightAdmin) {
    if (viewName === 'serverControl' && currentRole === 'HOST') {
      leftAdmin.classList.remove('hidden');
      rightAdmin.classList.remove('hidden');
    } else {
      leftAdmin.classList.add('hidden');
      rightAdmin.classList.add('hidden');
    }
  }
}

// Kicked by Host Handler
socket.on('kicked-from-room', () => {
  alert('🛑 You were kicked from the room by the host!');
  localStorage.removeItem('loop_player_token');
  localStorage.removeItem('loop_player_name');
  location.reload();
});

// Avatar Picker
document.querySelectorAll('.avatar-option').forEach(opt => {
  opt.addEventListener('click', () => {
    sound.playPop();
    document.querySelectorAll('.avatar-option').forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
    selectedAvatar = opt.dataset.avatar;
  });
});

// Auto Session Reconnection
socket.on('connect', () => {
  console.log('Socket connected:', socket.id);
  const savedName = localStorage.getItem('loop_player_name');

  if (currentRole !== 'HOST') {
    socket.emit('check-session', { playerToken: myPlayerToken, name: savedName }, (res) => {
      if (res && res.restored) {
        currentRole = 'PLAYER';
        myPlayerId = res.playerId;
        showView('playerLobby');
        if (res.gameState) {
          latestGameState = res.gameState;
          updatePlayerUI(res.gameState);
        }
      }
    });
  }
});

socket.on('init-info', ({ localIp, joinUrl, qrCodeDataUrl }) => {
  document.getElementById('server-ip-display').innerText = joinUrl;
  const qrImg = document.getElementById('server-qr-code');
  if (qrImg && qrCodeDataUrl) qrImg.src = qrCodeDataUrl;
});

// Navigation Handlers
document.getElementById('btn-select-server').addEventListener('click', () => {
  sound.playPop();
  views.passwordModal.classList.remove('hidden');
});

document.getElementById('btn-cancel-pass').addEventListener('click', () => {
  sound.playPop();
  views.passwordModal.classList.add('hidden');
});

document.getElementById('btn-submit-pass').addEventListener('click', () => {
  sound.playPop();
  const password = document.getElementById('server-pass-input').value;
  const errorEl = document.getElementById('password-error');
  errorEl.innerText = '';

  socket.emit('verify-server-password', password, (res) => {
    if (res.success) {
      currentRole = 'HOST';
      views.passwordModal.classList.add('hidden');
      showView('serverControl');
      updateServerUI(res.gameState);
    } else {
      errorEl.innerText = res.error;
    }
  });
});

document.getElementById('btn-select-player').addEventListener('click', () => {
  sound.playPop();
  const savedName = localStorage.getItem('loop_player_name');
  if (savedName) {
    document.getElementById('player-name-input').value = savedName;
  }
  showView('playerJoin');
});

document.querySelectorAll('.btn-back-home').forEach(btn => {
  btn.addEventListener('click', () => {
    sound.playPop();
    showView('landing');
  });
});

// Submit Join Form
document.getElementById('btn-join-submit').addEventListener('click', () => {
  sound.playPop();
  const name = document.getElementById('player-name-input').value;
  const errorEl = document.getElementById('join-error');
  errorEl.innerText = '';

  if (name.trim()) {
    localStorage.setItem('loop_player_name', name.trim());
  }

  socket.emit('join-game', { name: name.trim(), avatar: selectedAvatar, playerToken: myPlayerToken }, (res) => {
    if (res.success) {
      currentRole = 'PLAYER';
      myPlayerId = res.playerId;
      showView('playerLobby');
    } else {
      errorEl.innerText = res.error;
    }
  });
});

// Stepper Controls
document.getElementById('btn-imposter-minus').addEventListener('click', () => {
  sound.playPop();
  if (latestGameState && latestGameState.imposterCount > 1) {
    socket.emit('set-imposter-count', latestGameState.imposterCount - 1);
  }
});

document.getElementById('btn-imposter-plus').addEventListener('click', () => {
  sound.playPop();
  if (latestGameState) {
    socket.emit('set-imposter-count', latestGameState.imposterCount + 1);
  }
});

// Category Selection Handler
document.querySelectorAll('.btn-category-pill').forEach(btn => {
  btn.addEventListener('click', () => {
    sound.playPop();
    socket.emit('select-category', btn.dataset.cat);
  });
});

// Counter Role Toggle Handler
document.getElementById('btn-toggle-counter-role').addEventListener('click', () => {
  sound.playPop();
  if (latestGameState) {
    socket.emit('toggle-counter-role', !latestGameState.enableCounterRole);
  }
});

// Host Actions
document.getElementById('btn-start-game').addEventListener('click', () => {
  sound.playFanfare();
  hasShownFunnyReveal = false;
  mySelectedImposterGuess = null;
  socket.emit('start-game');
});

document.getElementById('btn-server-restart-game').addEventListener('click', () => {
  sound.playPop();
  if (confirm('Are you sure you want to restart the game and return to the lobby?')) {
    socket.emit('reset-to-lobby');
  }
});

document.getElementById('btn-next-turn').addEventListener('click', () => {
  sound.playPop();
  socket.emit('next-turn');
});

document.getElementById('btn-previous-turn').addEventListener('click', () => {
  sound.playPop();
  socket.emit('previous-turn');
});

document.getElementById('btn-skip-questions').addEventListener('click', () => {
  sound.playPop();
  socket.emit('skip-to-voting');
});

document.getElementById('btn-start-voting-timer').addEventListener('click', () => {
  sound.playPop();
  const secondsInput = document.getElementById('input-voting-timer-seconds').value;
  socket.emit('start-voting-timer', secondsInput);
});

// Host bypass imposter guess button
document.getElementById('btn-skip-imposter-guess').addEventListener('click', () => {
  sound.playPop();
  socket.emit('skip-imposter-guess');
});

document.getElementById('btn-player-prev-turn').addEventListener('click', () => {
  sound.playPop();
  socket.emit('player-navigate-turn', 'prev');
});

document.getElementById('btn-player-next-turn').addEventListener('click', () => {
  sound.playPop();
  socket.emit('player-navigate-turn', 'next');
});

document.getElementById('btn-toggle-hide-votes').addEventListener('click', () => {
  sound.playPop();
  socket.emit('toggle-hide-votes');
});

document.getElementById('btn-toggle-hide-counts').addEventListener('click', () => {
  sound.playPop();
  socket.emit('toggle-hide-vote-counts');
});

document.getElementById('btn-process-elimination').addEventListener('click', () => {
  sound.playFanfare();
  socket.emit('process-elimination');
});

document.getElementById('btn-continue-round').addEventListener('click', () => {
  sound.playPop();
  socket.emit('continue-next-round');
});

document.getElementById('btn-reset-lobby').addEventListener('click', () => {
  sound.playPop();
  hasShownFunnyReveal = false;
  mySelectedImposterGuess = null;
  socket.emit('reset-to-lobby');
});

// Secret Card Reveal Logic (Clean Mid-Game Card without Decooy Guesses)
const secretCard = document.getElementById('secret-card');
let isCardHeld = false;

function revealCard() {
  if (!currentSecretCard) return;
  sound.playRevealSecret();
  secretCard.classList.add('revealed');
  const contentEl = document.getElementById('card-content-inner');

  if (currentSecretCard.isOut) {
    secretCard.classList.add('imposter');
    contentEl.innerHTML = `
      <div class="imposter-title">🤫 YOU ARE OUT OF THE LOOP!</div>
      <p style="color: var(--text-muted); font-size: 0.95rem; margin-top: 8px;">
        Act natural! Blend in with your answers to avoid getting voted out!
      </p>
    `;
  } else {
    secretCard.classList.remove('imposter');
    contentEl.innerHTML = `
      <div class="badge badge-primary" style="margin-bottom: 12px;">${currentSecretCard.category || 'SECRET ITEM'}</div>
      <div class="food-title">${currentSecretCard.foodName}</div>
      <div class="food-desc">(${currentSecretCard.description})</div>
    `;
  }
}

function hideCard() {
  secretCard.classList.remove('revealed');
  const contentEl = document.getElementById('card-content-inner');
  contentEl.innerHTML = `
    <div class="secret-card-hint">
      <span style="font-size: 2.5rem;">🔒</span>
      <span>PRESS & HOLD OR TAP TO REVEAL YOUR SECRET DISH</span>
    </div>
  `;
}

secretCard.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  isCardHeld = true;
  revealCard();
});

secretCard.addEventListener('pointerup', () => {
  isCardHeld = false;
  hideCard();
});

secretCard.addEventListener('pointerleave', () => {
  if (isCardHeld) {
    isCardHeld = false;
    hideCard();
  }
});

socket.on('secret-card-assign', (cardData) => {
  currentSecretCard = cardData;
  hideCard();
});

socket.on('game-state-update', (state) => {
  latestGameState = state;

  if (currentRole === 'HOST') {
    updateServerUI(state);
  } else if (currentRole === 'PLAYER') {
    updatePlayerUI(state);
  }
});

socket.on('error-msg', (msg) => {
  alert(msg);
});

function getTierLabel(roundNum) {
  if (roundNum === 1) return 'Round 1 (Easy Difficulty)';
  if (roundNum === 2) return 'Round 2 (Medium Difficulty)';
  if (roundNum === 3) return 'Round 3 (Hard Difficulty)';
  return `Round ${roundNum} (Expert Difficulty)`;
}

// Server UI Update
function updateServerUI(state) {
  document.getElementById('imposter-count-val').innerText = state.imposterCount;
  document.getElementById('server-player-count').innerText = state.players.length;

  // Update Category Pill buttons active state
  document.querySelectorAll('.btn-category-pill').forEach(btn => {
    if (btn.dataset.cat === state.selectedCategory) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update Counter Role toggle button state
  const toggleBtn = document.getElementById('btn-toggle-counter-role');
  if (toggleBtn) {
    toggleBtn.innerText = state.enableCounterRole ? '🎭 Counter Role: ON' : '🔒 Counter Role: OFF';
    toggleBtn.style.background = state.enableCounterRole ? 'rgba(0, 230, 118, 0.2)' : 'rgba(255, 255, 255, 0.05)';
    toggleBtn.style.borderColor = state.enableCounterRole ? 'var(--success)' : 'var(--border-color)';
    toggleBtn.style.color = state.enableCounterRole ? 'var(--success)' : 'var(--text-muted)';
  }

  renderLeftTurnPermissionsPanel(state);
  renderRightKickPlayersPanel(state);

  const sections = ['server-lobby-section', 'server-play-section', 'server-vote-section', 'server-elim-section', 'server-imposter-guess-section', 'server-reveal-section'];
  sections.forEach(s => document.getElementById(s).classList.add('hidden'));

  if (state.status === 'LOBBY') {
    document.getElementById('server-lobby-section').classList.remove('hidden');
  } else if (state.status === 'PLAYING_QUESTIONS') {
    document.getElementById('server-play-section').classList.remove('hidden');
    renderQuestionTurn(state);
  } else if (state.status === 'VOTING') {
    document.getElementById('server-vote-section').classList.remove('hidden');
    renderServerVoteResults(state);
  } else if (state.status === 'ROUND_ELIMINATION') {
    document.getElementById('server-elim-section').classList.remove('hidden');
    renderServerEliminationModal(state);
  } else if (state.status === 'IMPOSTER_GUESS') {
    document.getElementById('server-imposter-guess-section').classList.remove('hidden');
    renderServerImposterGuessScreen(state);
  } else if (state.status === 'REVEAL') {
    document.getElementById('server-reveal-section').classList.remove('hidden');
    renderUniversalReveal(state);
  }
}

// Render Server Side Imposter Guess Monitor Screen
function renderServerImposterGuessScreen(state) {
  const container = document.getElementById('server-imposter-guess-status');
  if (!container || !state.imposterIds) return;

  const totalImposters = state.imposterIds.length;
  const submittedCount = Object.keys(state.imposterGuesses || {}).length;

  const statusRows = state.imposterIds.map(token => {
    const p = state.players.find(player => player.playerToken === token);
    const name = p ? p.name : 'Imposter';
    const avatar = p ? p.avatar : '🤫';
    const guessed = !!(state.imposterGuesses && state.imposterGuesses[token]);

    return `
      <div style="display: inline-block; background: rgba(0,229,255,0.1); padding: 8px 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); margin: 6px;">
        ${avatar} <strong>${name}</strong>: ${guessed ? '✅ Guess Submitted' : '⏳ Deciding...'}
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div style="margin-bottom: 12px; font-size: 1.2rem; color: var(--warning);">Progress: ${submittedCount} / ${totalImposters} Guesses Received</div>
    <div>${statusRows}</div>
  `;
}

// Render Left Corner Admin Panel
function renderLeftTurnPermissionsPanel(state) {
  const container = document.getElementById('admin-left-turn-permissions-panel');
  if (!container) return;

  const rowsHTML = state.players.map(p => {
    const isUnlocked = state.unlockedTurnTokens && state.unlockedTurnTokens.includes(p.playerToken);
    return `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
        <div style="font-size: 0.9rem;">${p.avatar} <strong>${p.name}</strong></div>
        <button class="btn btn-secondary btn-perm-toggle" data-token="${p.playerToken}" style="padding: 4px 10px; font-size: 0.75rem;">
          ${isUnlocked ? '🔓 Unlocked' : '🔒 Locked'}
        </button>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div style="background: rgba(10, 15, 26, 0.6); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 16px;">
      <h4 style="font-size: 0.95rem; color: var(--primary); margin-bottom: 8px;">👈 PLAYER TURN PERMISSIONS</h4>
      <div style="max-height: 180px; overflow-y: auto;">${rowsHTML || '<span style="font-size:0.85rem; color:var(--text-muted);">No players</span>'}</div>
    </div>
  `;

  container.querySelectorAll('.btn-perm-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      sound.playPop();
      socket.emit('toggle-player-turn-permission', btn.dataset.token);
    });
  });
}

// Render Right Corner Admin Panel
function renderRightKickPlayersPanel(state) {
  const container = document.getElementById('admin-right-kick-panel');
  if (!container) return;

  const rowsHTML = state.players.map(p => `
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
      <div style="font-size: 0.9rem;">${p.avatar} <strong>${p.name}</strong></div>
      <button class="btn btn-danger btn-kick-player" data-token="${p.playerToken}" style="padding: 4px 10px; font-size: 0.75rem;">
        🛑 Kick
      </button>
    </div>
  `).join('');

  container.innerHTML = `
    <div style="background: rgba(10, 15, 26, 0.6); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 16px;">
      <h4 style="font-size: 0.95rem; color: var(--danger); margin-bottom: 8px;">👉 ADMIN KICK PANEL</h4>
      <div style="max-height: 180px; overflow-y: auto;">${rowsHTML || '<span style="font-size:0.85rem; color:var(--text-muted);">No players</span>'}</div>
    </div>
  `;

  container.querySelectorAll('.btn-kick-player').forEach(btn => {
    btn.addEventListener('click', () => {
      sound.playPop();
      if (confirm(`Are you sure you want to kick this player?`)) {
        socket.emit('kick-player', btn.dataset.token);
      }
    });
  });
}

// Player UI Update
function updatePlayerUI(state) {
  const me = state.players.find(p => p.playerToken === myPlayerToken);
  const isImposter = state.imposterIds && state.imposterIds.includes(myPlayerToken);
  const lobbyView = document.getElementById('player-lobby-view');

  const isMyTurnUnlocked = state.unlockedTurnTokens && state.unlockedTurnTokens.includes(myPlayerToken);
  const pNavContainer = document.getElementById('player-turn-nav-buttons');
  const btnPrev = document.getElementById('btn-player-prev-turn');
  const btnNext = document.getElementById('btn-player-next-turn');

  if (isMyTurnUnlocked && state.status === 'PLAYING_QUESTIONS') {
    pNavContainer.classList.remove('hidden');
    btnPrev.disabled = state.currentTurnIndex <= 0;
    btnNext.disabled = state.currentTurnIndex >= state.playerQuestions.length - 1;
  } else {
    pNavContainer.classList.add('hidden');
  }

  const pSections = ['player-card-section', 'player-question-section', 'player-vote-section', 'player-eliminated-banner', 'player-imposter-guess-view', 'player-reveal-section'];
  pSections.forEach(s => document.getElementById(s).classList.add('hidden'));

  if (state.status === 'LOBBY') {
    document.getElementById('player-lobby-status').innerText = 'Waiting for Host to start the game...';
  } else if (state.status === 'IMPOSTER_GUESS') {
    lobbyView.classList.remove('hidden');
    if (isImposter) {
      document.getElementById('player-imposter-guess-view').classList.remove('hidden');
      renderImposterFoodGuessScreen(state);
    } else {
      document.getElementById('player-lobby-status').innerText = '🤫 GAME OVER! Waiting for Imposter to guess the secret food item...';
    }
  } else if (me && me.isEliminated && state.status !== 'REVEAL') {
    lobbyView.classList.remove('hidden');
    document.getElementById('player-eliminated-banner').classList.remove('hidden');
  } else if (state.status === 'PLAYING_QUESTIONS') {
    lobbyView.classList.remove('hidden');
    document.getElementById('player-card-section').classList.remove('hidden');
    document.getElementById('player-question-section').classList.remove('hidden');
    renderQuestionTurn(state);
  } else if (state.status === 'VOTING') {
    lobbyView.classList.remove('hidden');
    document.getElementById('player-vote-section').classList.remove('hidden');
    renderPlayerVotingScreen(state);
  } else if (state.status === 'REVEAL') {
    lobbyView.classList.remove('hidden');
    document.getElementById('player-reveal-section').classList.remove('hidden');
    renderUniversalReveal(state);
  }
}

// Render End-of-Game Imposter Secret Food Guess Screen on Imposter's Mobile Screen
function renderImposterFoodGuessScreen(state) {
  const container = document.getElementById('imposter-food-guess-container');
  if (!container || !state.foodDecoys) return;

  const choicesHTML = state.foodDecoys.map(foodName => `
    <button class="btn btn-secondary btn-endgame-guess ${mySelectedImposterGuess === foodName ? 'selected-guess' : ''}"
            data-food="${foodName}"
            style="width: 100%; padding: 14px; font-size: 1.1rem; border: 1.5px solid var(--warning);">
      ${foodName}
    </button>
  `).join('');

  const hasGuessed = !!state.imposterGuesses[myPlayerToken];

  container.innerHTML = `
    <div class="question-banner" style="border-color: var(--secondary);">
      <div class="badge badge-danger" style="margin-bottom: 12px;">END OF GAME BONUS</div>
      <h2 style="color: var(--secondary); font-size: 1.8rem; margin-bottom: 8px;">🤫 GUESS THE SECRET INDIAN DISH!</h2>
      <p style="color: var(--text-muted); margin-bottom: 20px;">
        Guess correctly to earn <strong style="color: var(--warning);">+75 BONUS POINTS</strong>!
      </p>

      ${hasGuessed ? `
        <div class="badge badge-primary" style="font-size: 1.1rem; padding: 10px 20px;">
          ✅ Guess Submitted: "${state.imposterGuesses[myPlayerToken]}"! Waiting for reveal...
        </div>
      ` : `
        <div style="display: flex; flex-direction: column; gap: 12px; max-width: 320px; margin: 0 auto;">
          ${choicesHTML}
        </div>
      `}
    </div>
  `;

  container.querySelectorAll('.btn-endgame-guess').forEach(btn => {
    btn.addEventListener('click', () => {
      sound.playPop();
      const food = btn.dataset.food;
      mySelectedImposterGuess = food;
      socket.emit('imposter-guess-food', food);
    });
  });
}

// Render Turn Questions
function renderQuestionTurn(state) {
  if (!state.playerQuestions || state.playerQuestions.length === 0) return;

  const currentTurn = state.playerQuestions[state.currentTurnIndex];
  const speakerEl = document.querySelectorAll('.question-speaker-name');
  const textEl = document.querySelectorAll('.question-text-content');
  const counterEl = document.querySelectorAll('.turn-counter-display');

  speakerEl.forEach(el => el.innerText = `${currentTurn.playerName}'s Turn!`);
  textEl.forEach(el => el.innerText = `"${currentTurn.question}"`);
  counterEl.forEach(el => el.innerText = `${getTierLabel(state.roundNumber)} • Turn ${state.currentTurnIndex + 1} of ${state.playerQuestions.length}`);
}

// Render Player Voting Screen
function renderPlayerVotingScreen(state) {
  const grid = document.getElementById('player-vote-options');
  grid.innerHTML = '';

  const activePlayers = state.players.filter(p => !p.isEliminated);
  renderVotingReadinessChips(state);

  activePlayers.forEach(p => {
    if (p.playerToken === myPlayerToken) return;

    const card = document.createElement('div');
    card.className = `vote-card ${mySelectedVoteToken === p.playerToken ? 'selected' : ''}`;
    card.innerHTML = `
      <div class="player-avatar" style="border: 2px solid ${p.color}">${p.avatar}</div>
      <div class="player-name">${p.name}</div>
    `;

    card.addEventListener('click', () => {
      sound.playPop();
      mySelectedVoteToken = p.playerToken;
      document.querySelectorAll('#player-vote-options .vote-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      socket.emit('submit-vote', p.playerToken);
    });

    grid.appendChild(card);
  });
}

// Render Voting Readiness Chips
function renderVotingReadinessChips(state) {
  const containers = document.querySelectorAll('.voting-readiness-container');
  const activePlayers = state.players.filter(p => !p.isEliminated);

  const chipsHTML = activePlayers.map(p => {
    if (p.hasVoted) {
      return `<span class="badge badge-primary" style="padding: 6px 12px; margin: 3px; font-size: 0.9rem;">✅ ${p.avatar} ${p.name} (Voted)</span>`;
    } else {
      return `<span class="badge badge-warning" style="padding: 6px 12px; margin: 3px; font-size: 0.9rem;">⏳ ${p.avatar} ${p.name} (Deciding...)</span>`;
    }
  }).join('');

  let tieNoticeHTML = '';
  if (state.isTieBreaker && state.tiedPlayerTokens) {
    const tiedNames = state.players.filter(p => state.tiedPlayerTokens.includes(p.playerToken)).map(p => p.name).join(', ');
    tieNoticeHTML = `
      <div class="badge badge-danger" style="font-size: 0.95rem; margin-bottom: 10px; display: inline-block;">
        ⚠️ TIE-BREAKER VOTE! Tied between: ${tiedNames}. Discuss and cast final vote!
      </div>
    `;
  }

  let timerNoticeHTML = '';
  if (state.votingTimerActive) {
    timerNoticeHTML = `
      <div class="badge badge-danger" style="font-size: 1.1rem; margin-bottom: 10px; padding: 8px 16px; animation: captionPulse 0.5s infinite alternate;">
        ⏱️ VOTING TIMER: ${state.votingTimerSeconds}s REMAINING!
      </div>
    `;
  }

  const summaryText = `Votes Cast: <strong>${state.totalVotesCast} / ${state.totalActivePlayers}</strong>`;

  containers.forEach(c => {
    c.innerHTML = `
      <div style="background: rgba(10, 15, 26, 0.6); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 20px; text-align: center;">
        ${timerNoticeHTML}
        ${tieNoticeHTML}
        <div style="font-size: 1rem; color: var(--text-main); margin-bottom: 10px;">${summaryText}</div>
        <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 4px;">${chipsHTML}</div>
      </div>
    `;
  });
}

// Render Server Vote Dashboard
function renderServerVoteResults(state) {
  const btnToggleOrigins = document.getElementById('btn-toggle-hide-votes');
  btnToggleOrigins.innerText = state.hideVotes ? '👁️ Origins: Hidden' : '🙈 Origins: Visible';

  const btnToggleCounts = document.getElementById('btn-toggle-hide-counts');
  btnToggleCounts.innerText = state.hideVoteCounts ? '👁️ Vote Numbers: Hidden' : '🔢 Vote Numbers: Visible';

  renderVotingReadinessChips(state);

  const grid = document.getElementById('server-vote-tally-grid');
  grid.innerHTML = '';

  const activePlayers = state.players.filter(p => !p.isEliminated);
  const totalVotesCast = Object.values(state.votes).reduce((a, b) => a + b, 0);

  activePlayers.forEach(p => {
    const voteCount = state.votes[p.playerToken] || 0;
    const pct = totalVotesCast > 0 ? Math.round((voteCount / totalVotesCast) * 100) : 0;

    const tile = document.createElement('div');
    tile.className = 'vote-card';
    tile.style.cursor = 'default';

    let votersText = '';
    if (!state.hideVotes) {
      const voters = state.players.filter(v => v.votedFor === p.playerToken).map(v => v.name);
      if (voters.length > 0) {
        votersText = `<div style="font-size: 0.85rem; color: var(--text-muted);">Voted by: ${voters.join(', ')}</div>`;
      }
    }

    const displayCount = state.hideVoteCounts ? '🔒' : voteCount;

    tile.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px; width: 100%;">
        <div class="player-avatar" style="border: 2px solid ${p.color}">${p.avatar}</div>
        <div style="flex-grow: 1;">
          <div style="font-weight: bold; font-size: 1.1rem;">${p.name}</div>
          ${votersText}
        </div>
        <div style="font-size: 1.4rem; font-weight: 800; color: var(--secondary);">${displayCount}</div>
      </div>
      <div class="vote-tally-bar">
        <div class="vote-tally-fill" style="width: ${state.hideVoteCounts ? '0%' : pct + '%'};"></div>
      </div>
    `;

    grid.appendChild(tile);
  });
}

// Render Server Elimination Modal
function renderServerEliminationModal(state) {
  const elimBox = document.getElementById('server-elim-box');
  if (state.lastEliminated) {
    if (state.lastEliminated.noOneEliminated) {
      const tiedList = state.lastEliminated.tiedNames ? state.lastEliminated.tiedNames.join(', ') : 'tied players';
      elimBox.innerHTML = `
        <div class="badge badge-warning" style="margin-bottom: 12px;">ROUND ${state.roundNumber} TIE RESULT</div>
        <div style="font-size: 3rem; margin-bottom: 8px;">🤝</div>
        <h2 style="font-size: 2rem; color: var(--warning); margin-bottom: 8px;">Tie-Breaker Vote Resulted in Another Tie!</h2>
        <p style="font-size: 1.1rem; color: var(--text-muted);">
          Tied between: <strong>${tiedList}</strong>.<br>
          <span style="color: var(--success); font-weight: bold;">No player was eliminated in this round!</span>
        </p>
      `;
    } else {
      const wasOut = state.lastEliminated.isOut;
      elimBox.innerHTML = `
        <div class="badge badge-danger" style="margin-bottom: 12px;">ROUND ${state.roundNumber} ELIMINATION</div>
        <div style="font-size: 3rem; margin-bottom: 8px;">${state.lastEliminated.avatar}</div>
        <h2 style="font-size: 2rem; color: var(--danger); margin-bottom: 8px;">${state.lastEliminated.name} Was Voted Out!</h2>
        <p style="font-size: 1.2rem; font-weight: bold; color: ${wasOut ? 'var(--secondary)' : 'var(--success)'};">
          ${wasOut ? '🤫 They WERE Out of the Loop!' : '😇 They were IN THE LOOP (Innocent)!'}
        </p>
      `;
    }
  }
}

// Render Universal Reveal on ALL Screens
function renderUniversalReveal(state) {
  if (!hasShownFunnyReveal) {
    hasShownFunnyReveal = true;
    showFunnyImposterOverlay(state);
  }

  const revealTitle = document.querySelectorAll('.reveal-winner-title');
  const winnerNamesList = document.querySelectorAll('.reveal-winner-names');
  const foodTitle = document.querySelectorAll('.reveal-food-name');
  const foodDesc = document.querySelectorAll('.reveal-food-desc');

  let titleHTML = '';
  if (state.winnerTeam === 'IN_THE_LOOP') {
    titleHTML = `🏆 IN THE LOOP TEAM VICTORY!`;
  } else {
    titleHTML = `🤫 OUT OF THE LOOP IMPOSTERS WIN!`;
  }

  revealTitle.forEach(el => el.innerText = titleHTML);

  let namesText = state.winners ? state.winners.map(w => `${w.avatar} ${w.name}`).join(' • ') : '';
  winnerNamesList.forEach(el => el.innerText = `Winners: ${namesText}`);

  if (state.secretFood) {
    foodTitle.forEach(el => el.innerText = state.secretFood.name);
    foodDesc.forEach(el => el.innerText = `(${state.secretFood.description})`);
  }

  const imposterListContainers = document.querySelectorAll('.reveal-imposters-container');
  const normalCrowdContainers = document.querySelectorAll('.reveal-normal-crowd-container');
  const counterPlayerContainers = document.querySelectorAll('.reveal-counter-player-container');

  const impostersHTML = (state.imposters && state.imposters.length > 0)
    ? state.imposters.map(p => {
        let guessTag = '';
        if (p.guessedFood) {
          guessTag = p.guessCorrect 
            ? `<div style="font-size:0.85rem; color: var(--warning); margin-top:2px;">🎯 Guessed "${p.guessedFood}" (+75 Bonus Pts!)</div>`
            : `<div style="font-size:0.85rem; color: var(--text-muted); margin-top:2px;">❌ Guessed "${p.guessedFood}" (Incorrect)</div>`;
        }
        return `
          <div class="badge badge-danger" style="font-size: 0.95rem; padding: 8px 14px; margin: 4px; display: inline-block;">
            ${p.avatar} ${p.name}
            ${guessTag}
          </div>
        `;
      }).join('')
    : '<span style="color: var(--text-muted);">None</span>';

  const normalCrowdHTML = (state.normalCrowd && state.normalCrowd.length > 0)
    ? state.normalCrowd.map(p => `<span class="badge badge-primary" style="font-size: 1rem; padding: 6px 12px; margin: 4px;">${p.avatar} ${p.name}</span>`).join('')
    : '<span style="color: var(--text-muted);">None</span>';

  imposterListContainers.forEach(container => {
    container.innerHTML = `
      <div style="margin-top: 16px;">
        <h4 style="color: var(--secondary); font-size: 1.1rem; margin-bottom: 8px;">🤫 Out of the Loop Imposter(s):</h4>
        <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 6px;">${impostersHTML}</div>
      </div>
    `;
  });

  if (state.counterPlayer && state.counterPlayer.relatedItem) {
    const cp = state.counterPlayer;
    const rel = cp.relatedItem;
    counterPlayerContainers.forEach(container => {
      container.innerHTML = `
        <div style="margin-top: 16px; background: rgba(255, 171, 0, 0.1); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--warning);">
          <h4 style="color: var(--warning); font-size: 1.1rem; margin-bottom: 6px;">🎭 Counter Role (Similar Word Player):</h4>
          <div style="font-size: 1.05rem; font-weight: bold; color: var(--text-main);">
            ${cp.avatar} ${cp.name} received related word: <span style="color: var(--warning);">"${rel.name}"</span>
          </div>
          <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">
            (${rel.description})
          </div>
        </div>
      `;
    });
  } else {
    counterPlayerContainers.forEach(container => container.innerHTML = '');
  }

  normalCrowdContainers.forEach(container => {
    container.innerHTML = `
      <div style="margin-top: 16px;">
        <h4 style="color: var(--primary); font-size: 1.1rem; margin-bottom: 8px;">😇 In the Loop (Normal Crowd):</h4>
        <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 6px;">${normalCrowdHTML}</div>
      </div>
    `;
  });

  renderLeaderboardTable(state.leaderboard);
}

// Render Leaderboard Table
function renderLeaderboardTable(leaderboard) {
  const containers = document.querySelectorAll('.leaderboard-table-container');
  if (!leaderboard || leaderboard.length === 0) return;

  const rowsHTML = leaderboard.map((player, idx) => `
    <tr>
      <td class="leaderboard-rank">#${idx + 1}</td>
      <td>
        <span style="font-size: 1.4rem; margin-right: 8px;">${player.avatar}</span>
        <strong>${player.name}</strong>
      </td>
      <td style="font-weight: bold; color: var(--warning); text-align: right;">${player.score} pts</td>
    </tr>
  `).join('');

  containers.forEach(c => {
    c.innerHTML = `
      <div class="leaderboard-container">
        <h3 style="text-align: center; color: var(--warning); margin-bottom: 8px;">⭐ PERSISTENT LEADERBOARD</h3>
        <table class="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th style="text-align: right;">Score</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHTML}
          </tbody>
        </table>
      </div>
    `;
  });
}

// Funny Imposter Reveal Overlay Modal
function showFunnyImposterOverlay(state) {
  sound.playFunnyImposterSiren();

  const overlay = document.getElementById('funny-reveal-overlay');
  const avatarEl = document.getElementById('funny-imposter-avatar');
  const captionEl = document.getElementById('funny-imposter-caption');

  const imposters = state.imposters || [];
  const imposterNames = imposters.map(i => i.name).join(' & ');
  const imposterAvatars = imposters.map(i => i.avatar).join(' ');

  avatarEl.innerText = imposterAvatars || '🤫';

  if (state.winnerTeam === 'OUT_OF_THE_LOOP') {
    captionEl.innerHTML = `🚨 BLUFF MASTER SUPREME! 🚨<br><span style="color: #fff; font-size: 1.8rem;">${imposterNames} FOOLED EVERYONE & WON!</span>`;
  } else {
    captionEl.innerHTML = `🚨 CAUGHT RED-HANDED! 🚨<br><span style="color: #fff; font-size: 1.8rem;">${imposterNames} WAS BUSTED!</span>`;
  }

  overlay.classList.remove('hidden');
}

// Dismiss Funny Overlay
document.getElementById('btn-close-funny-overlay').addEventListener('click', () => {
  sound.playPop();
  document.getElementById('funny-reveal-overlay').classList.add('hidden');
});
