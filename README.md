# 🏆 Krackathon: Heritage Reimagined

## 📝 The Challenge: Prompt 02
> "Breathe new life into Malaysia's rich cultural legacy by developing a web-based game inspired by traditional pastimes (e.g., Congkak, Gasing, Batu Seremban, or Wau Bulan)."

**Your mission** is to preserve the soul of the original game while introducing a clever modern twist whether through innovative mechanics, unconventional level design, or unique storytelling.

**The Goal:** Showcase how traditional play can evolve in a digital landscape. Think beyond a simple simulation; we want to see games that are addictive, visually distinct, and technically impressive.

---

## ✅ Hackathon Requirements Checklist

This project addresses the Krackathon goals through the following implementation:

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

---

## 🎮 Project Overview: Congkak Quest

**Congkak Quest** is a polished mobile-first adventure game that brings the traditional Malay game of Congkak to life with a modern RPG interface and semi-realistic village aesthetics.

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
*Developed for the KrackedDevs Hackathon - Heritage Reimagined.*
