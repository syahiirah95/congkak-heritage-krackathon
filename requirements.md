# Congkak Quest Requirements

## Project Overview
**Congkak Quest** is a 3D third-person adventure game where players explore a traditional Southeast Asian village to collect marbles (guli) before competing in a traditional Congkak match against an AI.

## Technical Stack
- **Engine:** Three.js
- **Physics:** Cannon-es (or simple collision detection)
- **Bundler:** Vite
- **Language:** JavaScript (Vanilla)
- **Compatibility:** Web-based (Desktop, Tablet, Mobile)
- **Multiplayer Backend:** Real-time sync (e.g., Supabase Realtime or Socket.io).
- **Deployment:** Vercel (Production-ready web build).
- **PerformanceTarget:** 60 FPS on modern mobile devices, low-poly assets.

## Game Modules

### 1. Exploration Mode (Third-Person)
- **Character Controller:** Simple move/rotate/jump.
- **Camera:** Smooth third-person follow.
- **Environment:**
    - Wooden houses (Malay style)
    - Dirt paths
    - Coconut trees
    - Tropical lighting
- **Guli System (Jalur Gemilang Colors):**
    - **Blue (Perpaduan):** Grants an extra turn in Congkak.
    - **Yellow (Kedaulatan):** Counts as 2 guli toward the level goal.
    - **Red (Keberanian):** Provides a temporary speed boost in exploration mode.
    - **White (Kesucian):** Acts as a "magnet" to attract nearby guli.

### 2. Congkak Match Mode
- **Standard Mode:** VS AI (Easy, Medium, Hard).
- **Multiplayer Mode:** Real-time 1v1 (Asymmetrical potential).
    - **Asymmetrical Twist:** One player collects guli (Runner) while the other sets board traps (Tactician) before the match, OR standard real-time competitive play.
- **Dynamic Boards:** 
    - Holes can have "Elemental Properties" (Gravity, Multiplier, Teleportation).
- **Rules:** Standard 2-player Congkak rules as the base.

### 3. Level System
- **Level 1:** Need 10 guli, Easy AI, Normal guli only.
- **Level 2:** Need 12 guli, Medium AI, Introduce Gold guli.
- **Level 3:** Need 15 guli, Hard AI, Mix of all guli types.

## UI/UX
- **HUD:** Guli counter, Level indicator, Compass/Mini-map (optional).
- **Menu:** Start screen, Level select (unlocked by progress), Win/Lose screens.
- **Interaction:** Mobile joystick for movement, touch/click for Congkak.

## Audio
- **Ambient:** Tropical village sounds (birds, wind).
- **Music:** Soft traditional Malay (Gamelan/Asli style).

## Assets
- **3D Models:** Character, Houses, Trees, Guli, Congkak Board.
- **2D UI:** Icons for guli, Joysticks, Buttons.
- **Textures:** Stylized/Semi-realistic.
