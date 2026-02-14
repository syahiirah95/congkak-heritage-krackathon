# Congkak Quest: Heritage Reimagined

Welcome to **Congkak Quest**, a polished mobile-first adventure game that brings the traditional Malay game of Congkak to life with a modern RPG interface and semi-realistic village aesthetics.

---

## 🏆 Krackathon - Prompt 02: Heritage Reimagined Checklist

This project is built for the **KrackedDevs Hackathon**. Below is the checklist of requirements and how we've addressed them:

### 🎯 Core Requirements
- [x] **Web-Based Game**: Built using Vite, Three.js, and Vanilla CSS for seamless browser performance.
- [x] **Inspired by Traditional Pastime**: A modern retelling of the classic Malay game, **Congkak**.
- [x] **Innovative Mechanics**: 
    - Introduced **Special Gulis**: 🔵 Blue (Extra Turn) and 🟡 Gold (Double Points).
    - RPG-style progression with **Energy** and **Coin** systems.
- [x] **Unconventional Level Design**: Not just a board game, but a **3D World Exploration** game where you hunt for gulis in a tropical village.
- [x] **Unique Storytelling**: Features **Tok Aki**, the village guardian, with a dialogue system and a mystery to solve (the scattered gulis).
- [x] **Visually Distinct**: Blends low-poly 3D environments with a premium, high-fidelity mobile RPG HUD.
- [x] **Technically Impressive**: 
    - Custom implemented **Congkak Physics Engine**.
    - Mobile-optimized **Virtual Joystick** (NippleJS).
    - Custom **AABB Collision System** for village exploration.

### 🌟 Bonus & Advanced Goals
- [x] **Exploration & Progression**: Integrated a **World Map** and level-based quest system.
- [x] **Mobile-First Optimization**: Designed specifically to be played on smartphones with touch-friendly controls and responsive UI.
- [ ] **Real-time Multiplayer**: Currently Single Player vs. Smart AI (Strategic Tok Aki).
- [x] **Seamless Performance**: Optimized 3D assets and efficient rendering loop for smooth 60FPS mobile play.

---

## 🌟 Game Features

### 🌎 Exploration Mode
- **3rd Person Perspective**: Explore a beautifully crafted low-poly village.
- **Dynamic Quest System**: Receive missions from NPCs like Tok Aki.
- **Guli Collection**: Hunt for hidden gulis (marbles) scattered throughout the environment.
- **Traditional Malay Architecture**: Discover detailed wood-carved houses and lush tropical flora.

### 🎲 Congkak Mode
- **Traditional Rules**: Fully implemented Congkak mechanics including:
  - **Counter-Clockwise Distribution**: Move seeds across 14 holes and 2 storehouses.
  - **Tembak (Capture)**: Capture your opponent's seeds by landing in an empty hole on your side.
  - **Extra Turns**: Granting another move if land in your home store.
- **Special Gulis**: 
  - 🟡 **Gold Guli**: Counts as double points (2 points) when stored.
  - 🔵 **Blue Guli**: Grants an immediate bonus extra turn effect.
- **Smart AI**: Face off against Tok Aki, who strategically prioritizes board control and extra turns.

### 📱 Premium UI/UX
- **Mobile-First Design**: Optimized for touch controls with a responsive joystick and adaptive layouts.
- **Adventure HUD**: Tracking energy, coins, gulis, and player level via a sleek top status bar.
- **World Map**: Navigate through levels with a winding path and star rating system.
- **Story Overlay**: Engaging dialogue with character portraits and typewriter effects.

## 🛠️ Technology Stack
- **Engine**: Three.js (3D Rendering)
- **Physics**: Custom AABB Collision System
- **Input**: NippleJS (Mobile Joystick)
- **Styling**: Vanilla CSS (Modern RPG Aesthetics)

## 🚀 Getting Started

1. **Prerequisites**: Ensure you have [Node.js](https://nodejs.org/) installed.
2. **Installation**:
   ```bash
   npm install
   ```
3. **Run Locally**:
   ```bash
   npm run dev
   ```

## 🎮 How to Play
1. **Explore**: Use the joystick (or WASD) to move. Find 10 gulis hidden around the village.
2. **Meet Tok Aki**: Approach the main Congkak board once you've collected enough gulis.
3. **Compete**: Select a hole on your side (bottom row) to start distributing gulis. Outsmart Tok Aki to win rewards!

---
*Created for the KrackedDevs Hackathon - Heritage Reimagined.*
