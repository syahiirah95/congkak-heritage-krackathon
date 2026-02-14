# 🏆 Krackathon: Heritage Reimagined

## 📝 The Challenge: Prompt 02
> "Breathe new life into Malaysia's rich cultural legacy by developing a web-based game inspired by traditional pastimes (e.g., Congkak, Gasing, Batu Seremban, or Wau Bulan)."

---

## ✅ Krackathon Alignment Checklist

We have reimagined the traditional game of **Congkak** by mapping its evolution to the specific innovation categories requested in the hackathon brief:

| Innovation Category | Our Implementation (Congkak Quest) | Status |
| :--- | :--- | :---: |
| **01 Environmental & Dynamic Boards** | **Dynamic Seed Physics**: Introduced **Special Gulis** with unique properties. Blue Guli (Extra Turn/Speed) and Gold Guli (Score Multiplier) transform the static board into a dynamic tactical field. | [x] |
| **02 Roguelike or Progression Mechanics** | **Large-Scale Adventure**: Turned the short 5-minute Congkak session into a **Long-form 3D Adventure**. Players must explore the village, interact with Tok Aki, and "farm" gulis to progress. | [x] |
| **03 Rhythm & Precision Integration** | **Mechanical Precision**: Merged traditional board play with an **Exploration Scavenger Hunt**, requiring precision in finding hidden assets and strategic distribution of seeds. | [x] |
| **04 Asymmetrical Dynamics** | **Smart AI Strategist**: Implemented a "Master vs Apprentice" dynamic where Tok Aki (AI) uses an asymmetrical weighted strategy to challenge the player’s collection-based progression. | [x] |
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
| **Art (Gen)** | **FLUX.1 [dev]** | Realistic textures, character portraits, and UI textures. |
| **Art (Polish)** | **Canva** | Background removal, retouching, and asset composition. |

### 💻 Development & Runtime
| Component | Technology | Detail |
| :--- | :--- | :--- |
| **3D Rendering** | **Three.js** | Core WebGL engine for the 3D village and board. |
| **Frontend Tooling**| **Vite** | Lightning-fast build tool and dev server. |
| **Styling** | **Vanilla CSS3** | Custom glassmorphism, RPG typography, and animations. |
| **Language** | **Modern JavaScript (ES6+)** | Clean, modular, and asynchronous game logic. |
| **Version Control** | **Git / GitHub** | Source control and collaboration. |
| **Physics** | **Custom AABB** | Hand-coded Axis-Aligned Bounding Box collision system. |

---

## 🎮 Project Overview: Congkak Quest

### 🌎 Exploration Mode
| Feature | Description |
| :--- | :--- |
| **Perspective** | 3rd Person camera with localized movement. |
| **Quest System** | Dynamic NPC dialogue with typewriter effects. |
| **Scavenger Hunt** | Hidden gulis scattered across the village environment. |
| **Environment** | Traditional Malay Architecture with tropical foliage. |

### 🎲 Congkak Mode
| Mechanic | Description |
| :--- | :--- |
| **Core Rules** | Full traditional rules (Counter-clockwise, Capture, Extra Turns). |
| **Special Seeds** | 🟡 Gold (2x Score) and 🔵 Blue (Immediate Extra Turn). |
| **AI Opponent** | **Tok Aki**: A strategic AI that calculates optimal moves. |
| **Visuals** | Animated 3D seeds and dynamic hole highlighting. |

### 📱 Premium UI/UX
| Element | Description |
| :--- | :--- |
| **Keyboard Controls**| Intuitive WASD + Space movement and mouse look. |
| **RPG HUD** | Top status bar for Energy, Coins, Gulis, and XP. |
| **World Map** | Level selection with a winding path and star ratings. |
| **Navigation** | Seamless transitions between Story, Explore, and Board modes. |

---

## 🛠️ Infrastructure & Setup

| Command | Purpose |
| :--- | :--- |
| `npm install` | Install all dependencies. |
| `npm run dev` | Launch local development server (Vite). |
| `npm run build` | Generate production bundle. |

---
*Developed for the KrackedDevs Hackathon - Heritage Reimagined.*
