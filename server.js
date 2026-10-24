const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const ip = require('ip');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const { GAME_CATEGORIES, FOOD_DATABASE, TIERED_QUESTIONS } = require('./public/js/foodData.js');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const SERVER_PASSWORD = "Brock1122";
const HISTORY_FILE = path.join(__dirname, 'recent_questions_history.json');
const SCORES_FILE = path.join(__dirname, 'player_scores_history.json');

app.use(express.static(path.join(__dirname, 'public')));

const localIp = ip.address();
const joinUrl = `http://${localIp}:${PORT}`;
let qrCodeDataUrl = '';

QRCode.toDataURL(joinUrl, { margin: 2, color: { dark: '#00e5ff', light: '#0d1117' } })
  .then(url => {
    qrCodeDataUrl = url;
  })
  .catch(err => {
    console.error('QR code generation error:', err);
  });

// Persistent Question Memory
let recentGamesHistory = [];
function loadQuestionHistory() {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      const data = fs.readFileSync(HISTORY_FILE, 'utf8');
      recentGamesHistory = JSON.parse(data);
      if (!Array.isArray(recentGamesHistory)) recentGamesHistory = [];
    }
  } catch (err) {
    console.error('Error loading question history:', err);
    recentGamesHistory = [];
  }
}
function saveQuestionHistory() {
  try {
    if (recentGamesHistory.length > 4) {
      recentGamesHistory = recentGamesHistory.slice(recentGamesHistory.length - 4);
    }
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(recentGamesHistory, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving question history:', err);
  }
}

// Persistent Player Scores
let playerScores = {};
function loadPlayerScores() {
  try {
    if (fs.existsSync(SCORES_FILE)) {
      const data = fs.readFileSync(SCORES_FILE, 'utf8');
      playerScores = JSON.parse(data);
      if (typeof playerScores !== 'object') playerScores = {};
    }
  } catch (err) {
    console.error('Error loading scores:', err);
    playerScores = {};
  }
}
function savePlayerScores() {
  try {
    fs.writeFileSync(SCORES_FILE, JSON.stringify(playerScores, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving scores:', err);
  }
}

loadQuestionHistory();
loadPlayerScores();

// Active Game State
let gameState = {
  status: 'LOBBY', // 'LOBBY', 'PLAYING_QUESTIONS', 'VOTING', 'ROUND_ELIMINATION', 'IMPOSTER_GUESS', 'REVEAL'
  roundNumber: 1,
  selectedCategory: 'INDIAN_CUISINE',
  enableCounterRole: false,
  counterPlayerToken: null,
  relatedFoodItem: null,
  players: [],
  imposterIds: [],
  imposterCount: 1,
  secretFood: null,
  foodDecoys: [],
  currentTurnIndex: 0,
  playerQuestions: [],
  usedQuestionTexts: [],
  unlockedTurnTokens: [],
  isTieBreaker: false,
  tiedPlayerTokens: [],
  hideVotes: false,
  hideVoteCounts: false,
  votingTimerActive: false,
  votingTimerSeconds: 0,
  votes: {},
  imposterGuesses: {},
  imposterGuessCorrect: {},
  pendingWinnerTeam: null,
  pendingWinners: [],
  lastEliminated: null,
  winnerTeam: null,
  winners: []
};

let timerIntervalId = null;

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getRandomColor() {
  const colors = [
    '#ff4081', '#00e5ff', '#7c4dff', '#00e676', 
    '#ffab00', '#ff3d00', '#651fff', '#00b0ff'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

function getBlockedQuestionsFromHistory() {
  const blocked = new Set();
  recentGamesHistory.forEach(gameList => {
    if (Array.isArray(gameList)) {
      gameList.forEach(q => blocked.add(q));
    }
  });
  return blocked;
}

function clearVotingTimer() {
  if (timerIntervalId) {
    clearInterval(timerIntervalId);
    timerIntervalId = null;
  }
  gameState.votingTimerActive = false;
  gameState.votingTimerSeconds = 0;
}

io.on('connection', (socket) => {
  const clientIp = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
  console.log(`Client connected: ${socket.id} (IP: ${clientIp})`);

  socket.emit('init-info', {
    localIp,
    joinUrl,
    qrCodeDataUrl
  });

  socket.on('verify-server-password', (password, callback) => {
    if (password === SERVER_PASSWORD) {
      socket.join('host-room');
      callback({ success: true, gameState: getSanitizedGameState(true) });
    } else {
      callback({ success: false, error: 'Incorrect password! Access denied.' });
    }
  });

  socket.on('check-session', ({ playerToken, name }, callback) => {
    let existingPlayer = gameState.players.find(p => 
      (playerToken && p.playerToken === playerToken) ||
      (clientIp && p.ip && p.ip === clientIp) ||
      (name && p.name.trim().toLowerCase() === name.trim().toLowerCase())
    );

    if (existingPlayer) {
      existingPlayer.id = socket.id;
      existingPlayer.ip = clientIp;
      existingPlayer.isOnline = true;
      existingPlayer.score = playerScores[existingPlayer.playerToken] || 0;
      socket.join('player-room');

      if (typeof callback === 'function') {
        callback({
          restored: true,
          playerId: socket.id,
          playerToken: existingPlayer.playerToken,
          playerName: existingPlayer.name,
          avatar: existingPlayer.avatar,
          gameState: getSanitizedGameState(false)
        });
      }

      if (gameState.status !== 'LOBBY' && gameState.secretFood) {
        const isImposter = gameState.imposterIds.includes(existingPlayer.playerToken);
        const isCounter = gameState.counterPlayerToken === existingPlayer.playerToken;
        let itemToAssign = null;
        let descToAssign = null;
        let catToAssign = null;

        if (isImposter) {
          itemToAssign = null;
        } else if (isCounter && gameState.relatedFoodItem) {
          itemToAssign = gameState.relatedFoodItem.name;
          descToAssign = gameState.relatedFoodItem.description;
          catToAssign = gameState.secretFood ? gameState.secretFood.category : "SECRET ITEM";
        } else {
          itemToAssign = gameState.secretFood.name;
          descToAssign = gameState.secretFood.description;
          catToAssign = gameState.secretFood.category;
        }

        socket.emit('secret-card-assign', {
          isOut: isImposter,
          foodName: itemToAssign,
          description: descToAssign,
          category: catToAssign
        });
      }

      broadcastGameState();
    } else {
      if (typeof callback === 'function') {
        callback({ restored: false });
      }
    }
  });

  socket.on('join-game', ({ name, avatar, playerToken }, callback) => {
    let token = playerToken;
    if (!token || token === 'null' || token === 'undefined') {
      token = 'token-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
    }

    const cleanName = name ? name.trim() : '';

    let existingPlayer = gameState.players.find(p => 
      (token && p.playerToken === token) ||
      (clientIp && p.ip && p.ip === clientIp) ||
      (cleanName && p.name.toLowerCase() === cleanName.toLowerCase())
    );

    if (existingPlayer) {
      existingPlayer.id = socket.id;
      existingPlayer.ip = clientIp;
      existingPlayer.isOnline = true;
      if (cleanName) existingPlayer.name = cleanName;
      if (avatar) existingPlayer.avatar = avatar;
      existingPlayer.score = playerScores[existingPlayer.playerToken] || 0;
    } else {
      if (!cleanName) {
        return callback({ success: false, error: 'Please enter a valid name.' });
      }
      existingPlayer = {
        id: socket.id,
        playerToken: token,
        ip: clientIp,
        name: cleanName,
        avatar: avatar || '🍔',
        color: getRandomColor(),
        isEliminated: false,
        isOnline: true,
        vote: null,
        score: playerScores[token] || 0
      };
      gameState.players.push(existingPlayer);
    }

    socket.join('player-room');

    if (typeof callback === 'function') {
      callback({
        success: true,
        playerId: socket.id,
        playerToken: existingPlayer.playerToken,
        playerData: {
          name: existingPlayer.name,
          avatar: existingPlayer.avatar,
          isEliminated: existingPlayer.isEliminated
        }
      });
    }

    if (gameState.status !== 'LOBBY' && gameState.secretFood) {
      const isImposter = gameState.imposterIds.includes(existingPlayer.playerToken);
      const isCounter = gameState.counterPlayerToken === existingPlayer.playerToken;
      let itemToAssign = null;
      let descToAssign = null;
      let catToAssign = null;

      if (isImposter) {
        itemToAssign = null;
      } else if (isCounter && gameState.relatedFoodItem) {
        itemToAssign = gameState.relatedFoodItem.name;
        descToAssign = gameState.relatedFoodItem.description;
        catToAssign = gameState.secretFood ? gameState.secretFood.category : "SECRET ITEM";
      } else {
        itemToAssign = gameState.secretFood.name;
        descToAssign = gameState.secretFood.description;
        catToAssign = gameState.secretFood.category;
      }

      socket.emit('secret-card-assign', {
        isOut: isImposter,
        foodName: itemToAssign,
        description: descToAssign,
        category: catToAssign
      });
    }

    broadcastGameState();
  });

  socket.on('toggle-player-turn-permission', (targetPlayerToken) => {
    const idx = gameState.unlockedTurnTokens.indexOf(targetPlayerToken);
    if (idx >= 0) {
      gameState.unlockedTurnTokens.splice(idx, 1);
    } else {
      gameState.unlockedTurnTokens.push(targetPlayerToken);
    }
    broadcastGameState();
  });

  socket.on('kick-player', (targetPlayerToken) => {
    const targetPlayer = gameState.players.find(p => p.playerToken === targetPlayerToken);
    if (targetPlayer) {
      console.log(`Host kicked player: ${targetPlayer.name}`);
      io.to(targetPlayer.id).emit('kicked-from-room');
      
      gameState.players = gameState.players.filter(p => p.playerToken !== targetPlayerToken);
      gameState.imposterIds = gameState.imposterIds.filter(id => id !== targetPlayerToken);
      gameState.unlockedTurnTokens = gameState.unlockedTurnTokens.filter(id => id !== targetPlayerToken);

      if (gameState.players.length === 0) {
        gameState.status = 'LOBBY';
      }

      recalculateVotes();
      broadcastGameState();
    }
  });

  socket.on('select-category', (catKey) => {
    if (GAME_CATEGORIES[catKey]) {
      gameState.selectedCategory = catKey;
      broadcastGameState();
    }
  });

  socket.on('toggle-counter-role', (enabled) => {
    gameState.enableCounterRole = !!enabled;
    broadcastGameState();
  });

  socket.on('set-imposter-count', (count) => {
    const validCount = Math.max(1, Math.min(count, Math.max(1, gameState.players.length - 1)));
    gameState.imposterCount = validCount;
    broadcastGameState();
  });

  socket.on('start-game', () => {
    if (gameState.players.length < 3) {
      return socket.emit('error-msg', 'At least 3 players are required to start!');
    }

    clearVotingTimer();
    gameState.roundNumber = 1;
    gameState.lastEliminated = null;
    gameState.winnerTeam = null;
    gameState.winners = [];
    gameState.pendingWinnerTeam = null;
    gameState.pendingWinners = [];
    gameState.usedQuestionTexts = [];
    gameState.isTieBreaker = false;
    gameState.tiedPlayerTokens = [];
    gameState.imposterGuesses = {};
    gameState.imposterGuessCorrect = {};

    const activeCategory = GAME_CATEGORIES[gameState.selectedCategory] || GAME_CATEGORIES.INDIAN_CUISINE;
    const categoryDatabase = activeCategory.items;

    const randomIndex = Math.floor(Math.random() * categoryDatabase.length);
    gameState.secretFood = categoryDatabase[randomIndex];

    const otherFoods = categoryDatabase.filter(f => f.name !== gameState.secretFood.name);
    const chosenDecoys = shuffleArray(otherFoods).slice(0, 3).map(f => f.name);
    gameState.foodDecoys = shuffleArray([gameState.secretFood.name, ...chosenDecoys]);

    gameState.players.forEach(p => {
      p.isEliminated = false;
      p.vote = null;
      p.score = playerScores[p.playerToken] || 0;
    });
    gameState.votes = {};

    const actualImposterCount = Math.min(gameState.imposterCount, gameState.players.length - 1);
    const shuffledPlayers = shuffleArray(gameState.players);
    gameState.imposterIds = shuffledPlayers.slice(0, actualImposterCount).map(p => p.playerToken);

    // Assign Counter Role (Similar Word Player) if enabled
    gameState.counterPlayerToken = null;
    gameState.relatedFoodItem = null;
    const nonImposters = gameState.players.filter(p => !gameState.imposterIds.includes(p.playerToken));
    if (gameState.enableCounterRole && nonImposters.length > 1 && gameState.secretFood.related) {
      const chosenCounter = shuffleArray(nonImposters)[0];
      gameState.counterPlayerToken = chosenCounter.playerToken;
      gameState.relatedFoodItem = gameState.secretFood.related;
    }

    startRoundQuestions();
  });

  function getTierForRound(roundNum) {
    const activeCategory = GAME_CATEGORIES[gameState.selectedCategory] || GAME_CATEGORIES.INDIAN_CUISINE;
    const tieredQ = activeCategory.questions;
    if (roundNum === 1) return tieredQ.EASY;
    if (roundNum === 2) return tieredQ.MEDIUM;
    if (roundNum === 3) return tieredQ.HARD;
    return tieredQ.EXPERT;
  }

  function startRoundQuestions() {
    clearVotingTimer();
    const activePlayers = gameState.players.filter(p => !p.isEliminated);
    const currentTierQuestions = getTierForRound(gameState.roundNumber);
    const historicalBlocked = getBlockedQuestionsFromHistory();

    const activeCategory = GAME_CATEGORIES[gameState.selectedCategory] || GAME_CATEGORIES.INDIAN_CUISINE;
    const tieredQ = activeCategory.questions;

    let availablePool = currentTierQuestions.filter(q => 
      !gameState.usedQuestionTexts.includes(q) && !historicalBlocked.has(q)
    );

    if (availablePool.length < activePlayers.length) {
      const allUnusedInCurrentGame = [
        ...tieredQ.EASY,
        ...tieredQ.MEDIUM,
        ...tieredQ.HARD,
        ...tieredQ.EXPERT
      ].filter(q => !gameState.usedQuestionTexts.includes(q) && !historicalBlocked.has(q));
      availablePool = allUnusedInCurrentGame;
    }

    if (availablePool.length < activePlayers.length) {
      availablePool = [
        ...tieredQ.EASY,
        ...tieredQ.MEDIUM,
        ...tieredQ.HARD,
        ...tieredQ.EXPERT
      ].filter(q => !gameState.usedQuestionTexts.includes(q));
    }

    const shuffledPool = shuffleArray(availablePool);
    const chosenQuestions = shuffledPool.slice(0, activePlayers.length);
    chosenQuestions.forEach(q => gameState.usedQuestionTexts.push(q));

    gameState.playerQuestions = activePlayers.map((player, idx) => ({
      playerId: player.id,
      playerToken: player.playerToken,
      playerName: player.name,
      question: chosenQuestions[idx % chosenQuestions.length] || "Describe how this item looks or feels."
    }));

    gameState.currentTurnIndex = 0;
    gameState.status = 'PLAYING_QUESTIONS';

    gameState.players.forEach(player => {
      const isImposter = gameState.imposterIds.includes(player.playerToken);
      const isCounter = gameState.counterPlayerToken === player.playerToken;

      let itemToAssign = null;
      let descToAssign = null;
      let catToAssign = null;

      if (isImposter) {
        itemToAssign = null;
      } else if (isCounter && gameState.relatedFoodItem) {
        itemToAssign = gameState.relatedFoodItem.name;
        descToAssign = gameState.relatedFoodItem.description;
        catToAssign = gameState.secretFood ? gameState.secretFood.category : "SECRET ITEM";
      } else {
        itemToAssign = gameState.secretFood.name;
        descToAssign = gameState.secretFood.description;
        catToAssign = gameState.secretFood.category;
      }

      io.to(player.id).emit('secret-card-assign', {
        isOut: isImposter,
        foodName: itemToAssign,
        description: descToAssign,
        category: catToAssign
      });
    });

    broadcastGameState();
  }

  socket.on('next-turn', () => {
    if (gameState.status !== 'PLAYING_QUESTIONS') return;

    if (gameState.currentTurnIndex < gameState.playerQuestions.length - 1) {
      gameState.currentTurnIndex++;
      broadcastGameState();
    } else {
      gameState.status = 'VOTING';
      gameState.players.forEach(p => p.vote = null);
      gameState.votes = {};
      broadcastGameState();
    }
  });

  socket.on('previous-turn', () => {
    if (gameState.status !== 'PLAYING_QUESTIONS') return;

    if (gameState.currentTurnIndex > 0) {
      gameState.currentTurnIndex--;
      broadcastGameState();
    }
  });

  socket.on('skip-to-voting', () => {
    if (gameState.status !== 'PLAYING_QUESTIONS') return;
    gameState.status = 'VOTING';
    gameState.players.forEach(p => p.vote = null);
    gameState.votes = {};
    broadcastGameState();
  });

  socket.on('player-navigate-turn', (direction) => {
    if (gameState.status !== 'PLAYING_QUESTIONS') return;
    
    const sender = gameState.players.find(p => p.id === socket.id);
    if (!sender) return;

    const isUnlocked = gameState.unlockedTurnTokens.includes(sender.playerToken);
    if (!isUnlocked) return;

    if (direction === 'next' && gameState.currentTurnIndex < gameState.playerQuestions.length - 1) {
      gameState.currentTurnIndex++;
      broadcastGameState();
    } else if (direction === 'prev' && gameState.currentTurnIndex > 0) {
      gameState.currentTurnIndex--;
      broadcastGameState();
    }
  });

  socket.on('toggle-hide-votes', () => {
    gameState.hideVotes = !gameState.hideVotes;
    broadcastGameState();
  });

  socket.on('toggle-hide-vote-counts', () => {
    gameState.hideVoteCounts = !gameState.hideVoteCounts;
    broadcastGameState();
  });

  socket.on('start-voting-timer', (seconds) => {
    if (gameState.status !== 'VOTING') return;

    clearVotingTimer();
    const duration = Math.max(5, parseInt(seconds) || 30);
    gameState.votingTimerActive = true;
    gameState.votingTimerSeconds = duration;
    broadcastGameState();

    timerIntervalId = setInterval(() => {
      gameState.votingTimerSeconds--;
      if (gameState.votingTimerSeconds <= 0) {
        clearVotingTimer();
        const activePlayers = gameState.players.filter(p => !p.isEliminated);
        activePlayers.forEach(voter => {
          if (!voter.vote) {
            const targets = activePlayers.filter(p => p.playerToken !== voter.playerToken);
            if (targets.length > 0) {
              voter.vote = targets[Math.floor(Math.random() * targets.length)].playerToken;
            }
          }
        });
        recalculateVotes();
        executeEliminationProcess();
      } else {
        broadcastGameState();
      }
    }, 1000);
  });

  // End-of-Game Imposter Secret Food Guess Submission (+75 Bonus Points)
  socket.on('imposter-guess-food', (guessedFoodName) => {
    const player = gameState.players.find(p => p.id === socket.id);
    if (!player) return;

    const isImposter = gameState.imposterIds.includes(player.playerToken);
    if (isImposter && gameState.secretFood && gameState.status === 'IMPOSTER_GUESS') {
      gameState.imposterGuesses[player.playerToken] = guessedFoodName;
      const isCorrect = guessedFoodName === gameState.secretFood.name;
      gameState.imposterGuessCorrect[player.playerToken] = isCorrect;

      if (isCorrect) {
        playerScores[player.playerToken] = (playerScores[player.playerToken] || 0) + 75;
        player.score = playerScores[player.playerToken];
      }

      // Check if all imposters have submitted their guess
      const unsubmittedImposters = gameState.imposterIds.filter(id => !gameState.imposterGuesses[id]);
      if (unsubmittedImposters.length === 0) {
        finalizeGameReveal();
      } else {
        broadcastGameState();
      }
    }
  });

  // Host bypass to finish imposter guess phase
  socket.on('skip-imposter-guess', () => {
    if (gameState.status === 'IMPOSTER_GUESS') {
      finalizeGameReveal();
    }
  });

  socket.on('submit-vote', (targetPlayerToken) => {
    if (gameState.status !== 'VOTING') return;

    const voter = gameState.players.find(p => p.id === socket.id);
    if (voter && !voter.isEliminated) {
      voter.vote = targetPlayerToken;
    }

    recalculateVotes();
    broadcastGameState();
  });

  socket.on('process-elimination', () => {
    if (gameState.status !== 'VOTING') return;
    executeEliminationProcess();
  });

  function executeEliminationProcess() {
    clearVotingTimer();
    recalculateVotes();

    const activePlayers = gameState.players.filter(p => !p.isEliminated);
    if (activePlayers.length === 0) return;

    let maxVoteCount = -1;
    activePlayers.forEach(p => {
      const vCount = gameState.votes[p.playerToken] || 0;
      if (vCount > maxVoteCount) maxVoteCount = vCount;
    });

    const tiedPlayers = activePlayers.filter(p => (gameState.votes[p.playerToken] || 0) === maxVoteCount);

    if (maxVoteCount > 0 && tiedPlayers.length > 1) {
      if (gameState.isTieBreaker) {
        gameState.isTieBreaker = false;
        gameState.tiedPlayerTokens = [];
        gameState.lastEliminated = {
          noOneEliminated: true,
          reason: 'SECOND_TIE',
          tiedNames: tiedPlayers.map(p => p.name)
        };
        gameState.status = 'ROUND_ELIMINATION';
        broadcastGameState();
        return;
      } else {
        gameState.isTieBreaker = true;
        gameState.tiedPlayerTokens = tiedPlayers.map(p => p.playerToken);
        gameState.status = 'VOTING';
        gameState.players.forEach(p => p.vote = null);
        gameState.votes = {};
        broadcastGameState();
        return;
      }
    }

    let eliminatedCandidate = null;
    if (tiedPlayers.length === 1) {
      eliminatedCandidate = tiedPlayers[0];
    } else {
      eliminatedCandidate = activePlayers[Math.floor(Math.random() * activePlayers.length)];
    }

    gameState.isTieBreaker = false;
    gameState.tiedPlayerTokens = [];
    eliminatedCandidate.isEliminated = true;

    const wasImposter = gameState.imposterIds.includes(eliminatedCandidate.playerToken);
    gameState.lastEliminated = {
      noOneEliminated: false,
      name: eliminatedCandidate.name,
      avatar: eliminatedCandidate.avatar,
      isOut: wasImposter
    };

    checkWinConditions();
  }

  function checkWinConditions() {
    const remainingActive = gameState.players.filter(p => !p.isEliminated);
    const activeImposters = remainingActive.filter(p => gameState.imposterIds.includes(p.playerToken));
    const activeInTheLoop = remainingActive.filter(p => !gameState.imposterIds.includes(p.playerToken));

    // Check if IN THE LOOP team wins
    if (activeImposters.length === 0) {
      recordGameQuestionsInHistory();
      gameState.pendingWinnerTeam = 'IN_THE_LOOP';
      gameState.pendingWinners = gameState.players.filter(p => !gameState.imposterIds.includes(p.playerToken));
      
      // Shift to END-OF-GAME IMPOSTER GUESS PHASE!
      gameState.status = 'IMPOSTER_GUESS';
      broadcastGameState();
      return;
    }

    // Check if OUT OF THE LOOP imposters win
    if (activeImposters.length >= activeInTheLoop.length) {
      recordGameQuestionsInHistory();
      gameState.pendingWinnerTeam = 'OUT_OF_THE_LOOP';
      gameState.pendingWinners = gameState.players.filter(p => gameState.imposterIds.includes(p.playerToken));

      // Shift to END-OF-GAME IMPOSTER GUESS PHASE!
      gameState.status = 'IMPOSTER_GUESS';
      broadcastGameState();
      return;
    }

    // Game continues to next round
    gameState.status = 'ROUND_ELIMINATION';
    broadcastGameState();
  }

  function finalizeGameReveal() {
    gameState.winnerTeam = gameState.pendingWinnerTeam;
    gameState.winners = gameState.pendingWinners;

    if (gameState.winnerTeam === 'IN_THE_LOOP') {
      gameState.players.forEach(p => {
        const isImp = gameState.imposterIds.includes(p.playerToken);
        if (!isImp) {
          playerScores[p.playerToken] = (playerScores[p.playerToken] || 0) + 100;
          if (p.vote && gameState.imposterIds.includes(p.vote)) {
            playerScores[p.playerToken] += 50;
          }
        }
        p.score = playerScores[p.playerToken] || 0;
      });
    } else if (gameState.winnerTeam === 'OUT_OF_THE_LOOP') {
      gameState.players.forEach(p => {
        const isImp = gameState.imposterIds.includes(p.playerToken);
        if (isImp) {
          playerScores[p.playerToken] = (playerScores[p.playerToken] || 0) + 200;
        }
        p.score = playerScores[p.playerToken] || 0;
      });
    }

    savePlayerScores();
    gameState.status = 'REVEAL';
    broadcastGameState();
  }

  function recordGameQuestionsInHistory() {
    if (gameState.usedQuestionTexts && gameState.usedQuestionTexts.length > 0) {
      recentGamesHistory.push([...gameState.usedQuestionTexts]);
      saveQuestionHistory();
    }
  }

  socket.on('continue-next-round', () => {
    gameState.roundNumber++;
    startRoundQuestions();
  });

  socket.on('reset-to-lobby', () => {
    clearVotingTimer();
    gameState.status = 'LOBBY';
    gameState.roundNumber = 1;
    gameState.imposterIds = [];
    gameState.secretFood = null;
    gameState.foodDecoys = [];
    gameState.currentTurnIndex = 0;
    gameState.playerQuestions = [];
    gameState.usedQuestionTexts = [];
    gameState.unlockedTurnTokens = [];
    gameState.isTieBreaker = false;
    gameState.tiedPlayerTokens = [];
    gameState.imposterGuesses = {};
    gameState.imposterGuessCorrect = {};
    gameState.pendingWinnerTeam = null;
    gameState.pendingWinners = [];
    gameState.votes = {};
    gameState.lastEliminated = null;
    gameState.winnerTeam = null;
    gameState.winners = [];
    gameState.players.forEach(p => {
      p.isEliminated = false;
      p.vote = null;
      p.score = playerScores[p.playerToken] || 0;
    });

    broadcastGameState();
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    const player = gameState.players.find(p => p.id === socket.id);
    if (player) {
      player.isOnline = false;
    }
    broadcastGameState();
  });
});

function recalculateVotes() {
  const tallies = {};
  gameState.players.filter(p => !p.isEliminated).forEach(p => {
    if (p.vote) {
      tallies[p.vote] = (tallies[p.vote] || 0) + 1;
    }
  });
  gameState.votes = tallies;
}

function getSanitizedGameState(isHost = false) {
  const isReveal = gameState.status === 'REVEAL';
  const isGuess = gameState.status === 'IMPOSTER_GUESS';

  const impostersList = (isReveal || isGuess)
    ? gameState.players.filter(p => gameState.imposterIds.includes(p.playerToken)).map(p => ({
        playerToken: p.playerToken,
        name: p.name,
        avatar: p.avatar,
        color: p.color,
        score: playerScores[p.playerToken] || 0,
        guessedFood: gameState.imposterGuesses[p.playerToken] || null,
        guessCorrect: gameState.imposterGuessCorrect[p.playerToken] || false
      }))
    : [];

  const normalCrowdList = (isReveal || isGuess)
    ? gameState.players.filter(p => !gameState.imposterIds.includes(p.playerToken)).map(p => ({
        playerToken: p.playerToken,
        name: p.name,
        avatar: p.avatar,
        color: p.color,
        score: playerScores[p.playerToken] || 0
      }))
    : [];

  const activePlayers = gameState.players.filter(p => !p.isEliminated);
  const totalVotesCast = activePlayers.filter(p => !!p.vote).length;

  const leaderboard = [...gameState.players]
    .map(p => ({ playerToken: p.playerToken, name: p.name, avatar: p.avatar, color: p.color, score: playerScores[p.playerToken] || 0 }))
    .sort((a, b) => b.score - a.score);

  const counterPlayerInfo = (isReveal || isGuess) && gameState.counterPlayerToken ? (() => {
    const p = gameState.players.find(x => x.playerToken === gameState.counterPlayerToken);
    return p ? {
      playerToken: p.playerToken,
      name: p.name,
      avatar: p.avatar,
      color: p.color,
      relatedItem: gameState.relatedFoodItem
    } : null;
  })() : null;

  return {
    status: gameState.status,
    roundNumber: gameState.roundNumber,
    selectedCategory: gameState.selectedCategory,
    enableCounterRole: gameState.enableCounterRole,
    counterPlayerToken: (isReveal || isGuess) ? gameState.counterPlayerToken : null,
    counterPlayer: counterPlayerInfo,
    relatedFoodItem: isReveal ? gameState.relatedFoodItem : null,
    imposterCount: gameState.imposterCount,
    hideVotes: gameState.hideVotes,
    hideVoteCounts: gameState.hideVoteCounts,
    votingTimerActive: gameState.votingTimerActive,
    votingTimerSeconds: gameState.votingTimerSeconds,
    unlockedTurnTokens: gameState.unlockedTurnTokens,
    currentTurnIndex: gameState.currentTurnIndex,
    playerQuestions: gameState.playerQuestions,
    isTieBreaker: gameState.isTieBreaker,
    tiedPlayerTokens: gameState.tiedPlayerTokens,
    votes: gameState.votes,
    foodDecoys: gameState.foodDecoys,
    imposterGuesses: gameState.imposterGuesses,
    totalActivePlayers: activePlayers.length,
    totalVotesCast: totalVotesCast,
    lastEliminated: gameState.lastEliminated,
    winnerTeam: gameState.winnerTeam || gameState.pendingWinnerTeam,
    winners: gameState.winners.map(w => ({ name: w.name, avatar: w.avatar })),
    imposters: impostersList,
    normalCrowd: normalCrowdList,
    leaderboard: leaderboard,
    players: gameState.players.map(p => ({
      id: p.id,
      playerToken: p.playerToken,
      name: p.name,
      avatar: p.avatar,
      color: p.color,
      score: playerScores[p.playerToken] || 0,
      isEliminated: p.isEliminated,
      isOnline: p.isOnline,
      hasVoted: !!p.vote,
      votedFor: (!gameState.hideVotes || isReveal) ? p.vote : null
    })),
    secretFood: isReveal ? gameState.secretFood : null,
    imposterIds: (isReveal || isGuess) ? gameState.imposterIds : []
  };
}

function broadcastGameState() {
  io.to('host-room').emit('game-state-update', getSanitizedGameState(true));
  io.to('player-room').emit('game-state-update', getSanitizedGameState(false));
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=================================================`);
  console.log(`🔥 OUT OF THE LOOP (END-GAME IMPOSTER GUESS) RUNNING 🔥`);
  console.log(`Local Host Access : http://localhost:3000`);
  console.log(`Network Join Link : ${joinUrl}`);
  console.log(`Server Password   : ${SERVER_PASSWORD}`);
  console.log(`=================================================`);
});
