# 🏆 Krackathon: Heritage Reimagined

## 📜 The Challenge: Prompt 02
> "Breathe new life into Malaysia's rich cultural legacy by developing a web-based game inspired by traditional pastimes (e.g., Congkak, Gasing, Batu Seremban, or Wau Bulan)."

## ✅ Krackathon Alignment Checklist
We have reimagined the traditional game of **Congkak** by mapping its evolution to the specific innovation categories requested in the hackathon brief:

| Innovation Category | Our Implementation (Congkak Quest) | Status |
| :--- | :--- | :---: |
| **01 Environmental & Dynamic Boards** | **Dynamic Seed Physics**: Introduced **Special Gulis** with unique properties. Blue Guli (Extra Turn/Speed) and Black Guli (Heritage Shadow) transform the static board into a dynamic tactical field. | [x] |
| **02 Roguelike or Progression Mechanics** | **Large-Scale Adventure**: Turned the short 5-minute Congkak session into a **Long-form 3D Adventure**. Players must explore the village, interact with Tok Aki, and "farm" gulis to progress. | [x] |
| **03 Rhythm & Precision Integration** | **Mechanical Precision**: Merged traditional board play with an **Exploration Scavenger Hunt**, requiring precision in finding hidden assets and strategic distribution of seeds. | [x] |
| **04 Asymmetrical Dynamics** | **Smart AI Strategist**: Implemented a "Master vs Apprentice" dynamic where Tok Aki (AI) uses an asymmetrical weighted strategy to challenge the player's collection-based progression. | [x] |
| **Bonus: Technical Excellence** | **Seamless Browser Performance**: Optimized Three.js rendering and custom collision engines ensure a "Vite-fast" 60FPS experience on mobile browsers. | [x] |

---

## 🚀 The Vibe Coding Tech Stack
This project was developed using a cutting-edge **Vibe Coding** workflow, combining advanced AI agency with modern web technologies.

### 🤖 AI Agentic Workflow
| Component | Technology | Role |
| :--- | :--- | :--- |
| **Agentic IDE** | **Antigravity** | Orchestrating complex code edits and world building. |
| **Brain (Logic)** | **Claude Opus 4.6** | Algorithm design, Congkak engine logic, and AI strategy. |
| **Brain (Speed)** | **Gemini 3 Flash** | Rapid prototyping, UI adjustments, and system optimization. |
| **Art (Gen)** | **Flux Kontext Dev** | Realistic textures, character portraits, and UI textures. |
| **Art (Polish)** | **Canva** | Background removal, retouching, and asset composition. |

### 💻 Development & Runtime
| Component | Technology | Detail |
| :--- | :--- | :--- |
| **3D Rendering** | **Three.js** | Core WebGL engine for the 3D village and board. |
| **Frontend Tooling** | **Vite** | Lightning-fast build tool and dev server. |
| **Styling** | **Vanilla CSS3** | Custom glassmorphism, RPG typography, and animations. |
| **Language** | **Modern JavaScript (ES6+)** | Clean, modular, and asynchronous game logic. |
| **Version Control** | **Git / GitHub** | Source control and collaboration. |
| **Physics** | **Custom AABB** | Hand-coded Axis-Aligned Bounding Box collision system. |
| **Persistence** | **Supabase** | Cloud database for profiles, leaderboard & match history. |

---

## 🏆 The Path to Championship
In this reimagined heritage experience, players don't just jump into a game. They must prove their worth through collection, survival, and mastery.

---

## ⚡ Energy System (Tenaga)

Energy is the core survival resource. Players start with **100 Energy** (100%). Collecting gulis costs energy, so players must manage their stamina wisely.

### 🔮 Guli Collection — Energy Cost

| Guli Type | Color | Rarity | Energy Cost | XP Reward | Congkak Ability |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **White** | ⚪ White | Common | **2** ⚡ | 10 XP | Standard (1 pt) |
| **Yellow** | 🟡 Yellow | Uncommon | **4** ⚡ | 25 XP | Strategic (2 pts) |
| **Red** | 🔴 Red | Rare | **6** ⚡ | 50 XP | High Value (3 pts) |
| **Blue** |  Blue | Epic | **8** ⚡ | 100 XP | Extra Turn (Bonus) |
| **Black** | ⚫ Black | Mythic | **10** ⚡ | 250 XP | Heritage Shadow (5 pts) |
| **Scam** | 🟣 Purple | ⚠️ TRAP | **15** ⚡ | 0 XP | **SCAM!** Wastes energy, gives nothing |
| **Scam** | 🟢 Green | ⚠️ TRAP | **12** ⚡ | 0 XP | **SCAM!** Disguised as "nature" guli |
| **Scam** |  Orange | ⚠️ TRAP | **10** ⚡ | 0 XP | **SCAM!** Disguised as "rare gold" guli |
| **Scam** | 🟤 Brown | ⚠️ TRAP | **8** ⚡ | 0 XP | **SCAM!** Disguised as "ancient" guli |
| **Scam** | 💗 Pink | ⚠️ TRAP | **14** ⚡ | 0 XP | **SCAM!** Disguised as "love" guli |

> **⚠️ Guli Scam (5 Colors!)**: These bright, tempting gulis come in **Purple, Green, Orange, Brown, and Pink** — they are ALL traps! They look like valuable gulis but when collected, they drain energy, add **no XP**, and trigger a "SCAM!" popup. Each color has a different energy cost (8–15 ⚡). Players must learn to identify and avoid ALL of them!

> **Note**: If the player's energy is below the required cost, they **cannot collect** the guli. A warning popup will appear: *"⚡ TENAGA HABIS! Tangkap haiwan!"*

###  Animal Catching — Energy Recovery

The only way to restore energy is by **catching animals** roaming the kampung. Animals will **flee** when the player approaches, creating an exciting chase mechanic!

| Animal | Size | Energy Reward | Speed | Difficulty |
| :--- | :--- | :---: | :--- | :--- |
| 🐔 **Ayam (Chicken)** | Smallest | **+2** ⚡ | Fast | Easy (lots available) |
| 🐱 **Kucing (Cat)** | Small | **+4** ⚡ | Medium | Medium |
| 🐑 **Kambing (Sheep)** | Medium | **+8** ⚡ | Slow | Medium-Hard |
| 🐄 **Lembu (Cow)** | Largest | **+16** ⚡ | Very Slow | Hard (rare, big reward!) |

> **Mechanic**: Walk within **1.5 units** of an animal to catch it. Animals begin fleeing when you're within **5 units**, so you need to chase them down! Once caught, they disappear and grant energy instantly.

> **Strategy Tip**: Cows are slow but rare — catching one gives massive energy. Chickens are fast but plentiful for small top-ups.

### 📍 Quest Marks ( ! ) — Exploration & Lore

Players can find flashing Red **"!"** marks around the village. These represent **Heritage Story Points**.

- **Lore Discovery**: Interacting with these points triggers a dialogue that explains real-world Malaysian history (e.g., the origin of the word 'Mencongak').
- **Energy Recharge**: Completing a story interaction rewards the player with bonus energy, making exploration a vital part of the energy management strategy.
- **Dynamic HUD**: Proximity to a Quest Mark triggers the `💬 VIEW HISTORY` button when within 2 units of the point.

| Location / NPC | Heritage Lore Focus | Energy Reward |
| :--- | :--- | :---: |
| **Tok Aki (Home)** | Collection quest & the path to becoming a Master. | **+50** ⚡ |
| **Sejarah Perigi** | Etymology of 'Mencongak' and Malacca Sultanate trade. | **+20** ⚡ |
| **Sejarah Tradisi** | 'Congkak Tanah' & the history of playing in the ground. | **+20** ⚡ |
| **Seni Ukiran** | Malay woodwork, Cengal/Mahogany, and board symbolism. | **+20** ⚡ |
| **Ilmu Hisab** | Ancient Mathematics, mental calculation, and logic training. | **+20** ⚡ |
| **Guli Kerang** | Original seeds: Shells, rubber seeds, and the glass evolution. | **+20** ⚡ |
| **Lubang Induk** | The 'Mother' hole philosophy: Sowing vs Reaping rezeki. | **+20** ⚡ |
| **Hubungan Kasih** | Social bonding, community spirit, and the 'Face-to-Face' adab. | **+20** ⚡ |
| **Varia Global** | Global cousins: Dakon, Sungka, and the African Mancala. | **+20** ⚡ |
| **Taktik Apit** | Advanced strategy: The 'Capture' move and fair play ethics. | **+20** ⚡ |

---

### 🕹️ Two Ways to Play

You can challenge Tok Aki in two distinct ways:

1.  **Quick Play (Top Bar 🎲)**:
    *   Click the **PLAY** button in the top navigation bar at any time.
    *   **No collection required**: If your bag is empty, Tok Aki will provide a standard set of white gulis.
    *   Great for quick matches or practicing your strategy.

2.  **Strategic Match (Missions 📜)**:
    *   Explore the village and collect exactly **49 gulis** (7 for each hole).
    *   Once collected, the **CHALLENGE TOK AKI** button unlocks in your mission list.
    *   **Strategic Advantage**: The specific gulis you collected (Red, Blue, Black, etc.) are used to seed your side of the board, giving you special point values and extra-turn potentials!

---

### 🤖 Tok Aki AI Difficulty Levels

Before starting a match, you can choose the difficulty of Tok Aki's AI:

| Difficulty | AI Logic Description | Win Reward | Loss Penalty |
| :--- | :--- | :---: | :---: |
| **Easy** | Random moves, good for beginners. | **+50 🪙** | **-10 🪙** |
| **Normal** | Prioritizes extra turns (landing in own store). | **+100 🪙** | **-10 🪙** |
| **Hard** | Extra turns + Search for capture (Tembak) moves. | **+150 🪙** | **-10 🪙** |

---

### 🎮 Game Rules Summary

*   **Menyemai (Sowing):** Pick up all seeds from a hole and drop them one by one clockwise.
*   **Pusingan (Continuous):** If the last seed lands in a non-empty hole, pick up those seeds and continue.
*   **Langkah Kanan (Extra Turn):** Land exactly in your own Rumah (Storehouse) to get another turn.
*   **Langkau (Skip):** Always skip the opponent's storehouse but fill your own.
*   **Menembak (Capture):** If the last seed lands in an empty hole on your side, and the opposite hole has seeds, capture all of them into your storehouse.


## 🪙 Coin System (Duit)

Coins are earned exclusively through **completing Congkak matches**. Players start with **0 coins**.

| Action | Coins Earned |
| :--- | :---: |
| **Win (Easy)** | **+50** 🪙 |
| **Win (Normal)** | **+100** 🪙 |
| **Win (Hard)** | **+150** 🪙 |
| **Lose (Any)** | **-10** 🪙 |

> Coins will be used for future features: cosmetics, power-ups, and unlocking new kampung areas.

---

## 🔮 Guli Collection Quest

- **Objective**: Collect a total of **49 Gulis** (7 per kampung hole) from the 3D world.
- **Energy Management**: Choose wisely — rare gulis cost more energy but score higher in Congkak!
- **Persistence**: Your collection is saved to the **Supabase** cloud (prefixed with `congkakheritage_`).

---

## 🎲 Challenging Tok Aki
Once you have amassed 49 gulis, the "CHALLENGE TOK AKI" button unlocks. These 49 gulis aren't just for show—they are literally used to seed the board for your match, making your collection choices strategic!

---

## 🎮 Game Rules & Logic

### Scoring System
- **Black**: 5 Points (Mythic value)
- **White**: 1 Point (Base value)
- **Yellow**: 2 Points (Strategic value)
- **Red**: 3 Points (High value)
- **Blue**: 1 Point + **EXTRA TURN** (When it lands in your store/rumah)

### Core Mechanics
- **Sowing**: Players move clockwise, dropping one guli into each hole.
- **Skipping Opponent**: During your turn, you skip your opponent's store but drop gulis in your own.
- **Extra Turn**: If your last guli lands in your store, you get another turn.
- **Capturing**: If your last guli lands in an empty hole on your side and the opposite hole has gulis, you capture all of them into your store.
- **End Game**: The game ends when one side is empty. The player with the highest total points wins.

### Hole Inspector
Hover your mouse over any hole to see a detailed breakdown of the guli distribution. This helps you plan your moves and maximize your score!

---

## 🏆 Leaderboard & Cloud Saves

- **Google OAuth**: Sign in with Google to save your progress.
- **Leaderboard**: Real-time ranking panel visible during gameplay (🏆 RANK in the nav bar).
- **Auto-Profile**: Profiles are automatically created on first login.
- **Match History**: Every Congkak match is recorded with scores, gulis won, and coins earned.

---

## 📁 Project Structure
- `/src/guli/`: Logic for spawning, collecting, energy costs, and scam gulis.
- `/src/world/`: 3D environment construction, NPC management, and animal AI (flee + catch).
- `/src/congkak/`: Core engine for the traditional board game simulation.
- `/src/ui/`: Interactive story and HUD components.
- `/src/lib/`: Supabase client, auth, and cloud save functions.
- `/assets/`: High-quality textures, models, and audio files.
- `/scripts/`: Database setup SQL for Supabase.

## 🛠️ Technical Integration
- **Prefixes**: All backend tables and functions use `congkakheritage_` for namespace safety.
- **Resource Management**: Real-time tracking of Energy (⚡ 0–100), Coins (🪙), XP (🌟), and Guli inventory (🔮).
- **Responsive Design**: Optimized for both Desktop (Mouse/WASD) and Mobile (Touch/Joystick).
- **Offline Mode**: Game works fully without Supabase — login is optional for saving progress.
