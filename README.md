# Out of the Loop 🕵️‍♂️ (Party Social Deduction Game)

A real-time, multi-device (mobile & laptop) party social deduction web game inspired by *Out of the Loop*, featuring themed categories such as **Indian Cuisine**, **Wildlife & Animals**, and **Indian Landmarks & Places**.

---

## 🌟 Key Features

- **📱 Multi-Device & Mobile Friendly**: Players join easily from mobile browsers by scanning a QR code or accessing the local network URL (`http://<ip>:3000`).
- **👑 Host Dashboard**: Password-protected host control panel (`Brock1122`) for game orchestration, lobby management, timers, and question flow.
- **🎯 Multi-Category Themes**:
  - 🍲 **Indian Cuisine** (Biryani, Butter Chicken, Pani Puri, Masala Dosa, etc.)
  - 🐅 **Wildlife & Animals** (Bengal Tiger, Indian Elephant, King Cobra, Peacock, etc.)
  - 🏰 **Indian Places & Landmarks** (Taj Mahal, Varanasi Ghats, Goa Beaches, Ladakh, etc.)
- **🎭 Blind Counter Role ("Hijack" / Similar Word)**: 
  - One non-imposter player secretly receives a closely related word (e.g. *Biryani* vs *Veg Pulao*, *Bengal Tiger* vs *Leopard*).
  - The player doesn't know they have a different word, leading to hilarious discrepancies in discussion and masking the true imposter!
- **❓ Tiered Dynamic Questionnaire**: Over 100+ questions per category across 4 difficulty tiers (Easy, Medium, Hard, Expert) with automatic 4-game history memory to avoid repetition.
- **🗳️ Live Voting & Elimination System**:
  - Live voting status tracker (`✅ Voted` vs `⏳ Deciding...`).
  - Privacy toggles to hide vote origins or vote counts on the host screen.
  - Custom countdown timer with automatic vote submission.
- **🤫 Multi-Imposter End-Game Guessing Phase**:
  - All Out of the Loop imposters get a secret item guess screen at the end of the round.
  - Correct guess awards **+75 Bonus Points**!
- **🏆 Persistent Leaderboard & Funny Animations**:
  - Full-screen funny animated imposter reveals with custom sound synthesis.
  - Persistent player score tracking saved across rounds.
- **🔄 Host Restart Game Button**: Instantly reset and restart back to the lobby anytime from the host header.

---

## 🚀 Quick Start

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- Devices connected to the same Wi-Fi network

### 2. Installation
```bash
git clone https://github.com/vedant1717/Outofloop.git
cd Outofloop
npm install
```

### 3. Run the Game
```bash
npm start
# or
node server.js
```

### 4. How to Play
1. **Host Screen**: Open `http://localhost:3000` on a laptop/desktop, select **Host Login**, and enter the host password (`Brock1122`).
2. **Players Join**: Players on the same Wi-Fi network scan the QR code or navigate to `http://<Host-IP>:3000` on their phones, choose an avatar, and enter their name.
3. **Configure & Start**: Host selects the theme category, number of Out of the Loop imposters, toggles the Counter Role, and starts the game!

---

## 🛠️ Tech Stack
- **Backend**: Node.js, Express, Socket.IO
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3 Glassmorphism
- **Network & Utils**: `qrcode`, `ip`
