import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { Player } from './src/Player.js';
import { World } from './src/world/World.js';
import { GuliManager } from './src/guli/GuliManager.js';
import { CongkakEngine } from './src/congkak/CongkakEngine.js';
import { CongkakBoard } from './src/congkak/CongkakBoard.js';
import { AudioManager } from './src/AudioManager.js';
import { Story } from './src/ui/Story.js';
import { signInWithGoogle, signOut, onAuthStateChange, getCurrentUser, loadProfile, updateProfile, saveMatchResult, getLeaderboard } from './src/lib/supabase.js';

class Game {
    constructor() {
        this.levels = [
            { id: 1, target: 49, types: ['black', 'blue', 'yellow', 'red', 'white'] },
            { id: 2, target: 49, types: ['black', 'blue', 'yellow', 'red', 'white'] },
            { id: 3, target: 49, types: ['black', 'blue', 'yellow', 'red', 'white'] }
        ];
        this.currentLevelIdx = 0;
        this.gameState = 'MENU';

        this.init();
        this.setupEvents();

        // Sound Toggle
        document.getElementById('mute-btn')?.addEventListener('click', (e) => {
            this.audioManager.toggleMute();
            const btn = e.currentTarget;
            const icon = btn.querySelector('i, svg');
            if (icon) {
                const newIconName = this.audioManager.isMuted ? 'volume-x' : 'volume-2';
                icon.setAttribute('data-lucide', newIconName);
                if (window.lucide) lucide.createIcons();
            }
        });

        this.clock = new THREE.Clock();
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.audioManager = new AudioManager();

        this.storyMode = new Story(() => {
            this.gameState = 'EXPLORE';
            const talkBtn = document.getElementById('tok-aki-talk-btn');
            if (talkBtn) talkBtn.style.display = 'none';
        });

        this.storyCompleted = false;
        // Match Settings
        this.difficulty = 'normal';
        this.rewards = { easy: 50, normal: 100, hard: 150 };
        this.penalty = 10;
        this.joystickEnabled = true; // Manual toggle state

        // Lazy load Tok Aki
        if (this.world) {
            this.tokAki = this.world.npcs.find(n => n.name === 'Tok Aki');
            if (this.tokAki) this.tokAki.showQuestMarker();
        }

        this.createTalkButton();

        window.addEventListener('story-complete', (e) => {
            this.addEnergy(e.detail?.energyReward || 50);
        });

        window.addEventListener('energy-spend', (e) => {
            this.addEnergy(-e.detail.amount);
        });

        this.setupAuth();
        this.updateUIVisibility();
        if (window.lucide) lucide.createIcons();
        this.animate();

        // 🟢 Hide Preloader once game is ready
        setTimeout(() => {
            const preloader = document.getElementById('preloader');
            if (preloader) {
                preloader.style.opacity = '0';
                setTimeout(() => preloader.style.display = 'none', 500);
            }
            // Re-trigger icon creation just in case
            if (window.lucide) lucide.createIcons();
        }, 800);
    }

    async setupAuth() {
        try {
            const user = await getCurrentUser();
            if (user) await this.onUserLogin(user);
            onAuthStateChange(async (user) => {
                if (user) await this.onUserLogin(user);
                else this.onUserLogout();
            });
        } catch (e) {
            console.warn('Supabase not configured, playing offline:', e.message);
        }
        // These button listeners are safe even without Supabase
        const loginBtn = document.getElementById('google-login-btn');
        if (loginBtn) loginBtn.addEventListener('click', async () => {
            try {
                const data = await signInWithGoogle();
                if (!data) alert("Supabase tak dijumpai! Pastikan bos dah restart Vite lepas update .env.");
            } catch (e) {
                console.warn('Login unavailable', e);
            }
        });
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) logoutBtn.addEventListener('click', async () => {
            try { await signOut(); this.onUserLogout(); } catch (e) { }
        });
        const rankBtn = document.getElementById('nav-rank');
        if (rankBtn) rankBtn.addEventListener('click', () => this.toggleLeaderboard());

        const histBtn = document.getElementById('nav-history');
        if (histBtn) histBtn.addEventListener('click', () => this.toggleHistory());
    }

    async onUserLogin(user) {
        this.currentUser = user;
        const profile = await loadProfile(user.id);
        if (profile) {
            if (profile.collected_gulis) {
                this.guliManager.inventory = { ...this.guliManager.inventory, ...profile.collected_gulis };
                this.guliManager.updateVault();
                this.guliManager.updateHUD();
            }
            const coinEl = document.getElementById('coin-val');
            if (coinEl) coinEl.textContent = profile.coins ?? 0;
            const energyEl = document.getElementById('energy-val');
            if (energyEl) energyEl.textContent = profile.energy ?? 100;
            this.guliManager.xp = profile.xp || 0;
            this.guliManager.updateHUD();
        }
        const nameEl = document.getElementById('player-name');
        if (nameEl) nameEl.textContent = user.user_metadata?.full_name || 'Pemain';
        const avatarEl = document.getElementById('avatar-icon');
        if (avatarEl && user.user_metadata?.avatar_url) avatarEl.src = user.user_metadata.avatar_url;
        const loginBtn = document.getElementById('google-login-btn');
        if (loginBtn) loginBtn.classList.add('hidden');
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) logoutBtn.classList.remove('hidden');

        // Auto-refresh panels on login
        this.refreshLeaderboard();
        this.refreshHistory();
    }

    onUserLogout() {
        this.currentUser = null;
        const nameEl = document.getElementById('player-name');
        if (nameEl) nameEl.textContent = 'Pemain';
        const avatarEl = document.getElementById('avatar-icon');
        if (avatarEl) avatarEl.src = '/assets/textures/player/player_face.png';
        const loginBtn = document.getElementById('google-login-btn');
        if (loginBtn) loginBtn.classList.remove('hidden');
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) logoutBtn.classList.add('hidden');
    }

    async toggleLeaderboard() {
        const panel = document.getElementById('leaderboard-panel');
        if (!panel) return;
        const isHidden = panel.classList.toggle('hidden');
        if (!isHidden) {
            this.refreshLeaderboard();
        }
    }

    async refreshLeaderboard() {
        const tbody = document.getElementById('leaderboard-body');
        if (!tbody) return;

        // Optionally show loading if it's currently empty
        if (tbody.innerHTML.includes('Tiada data lagi')) {
            tbody.innerHTML = '<tr><td colspan="5" style="padding:12px;text-align:center;opacity:0.5">Loading...</td></tr>';
        }

        const data = await getLeaderboard();
        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="padding:12px;text-align:center;opacity:0.5">Tiada data lagi</td></tr>';
            return;
        }

        tbody.innerHTML = data.map((row, i) => `
            <tr style="border-bottom:1px solid rgba(255,255,255,0.05); white-space: nowrap;">
                <td style="padding:8px 4px;color:var(--primary);font-weight:900">${row.rank || i + 1}</td>
                <td style="padding:8px 4px; display: flex; align-items: center; gap: 6px;">
                    <img src="${row.avatar_url || ''}" style="width:22px;height:22px;border-radius:50%;border:1px solid rgba(255,255,255,0.1)" onerror="this.style.display='none'">
                    <span style="max-width: 120px; overflow: hidden; text-overflow: ellipsis;">${row.name || 'Pemain'}</span>
                </td>
                <td style="padding:8px 4px;color:#ffd700;font-weight:700">${row.xp || 0}</td>
                <td style="padding:8px 4px;opacity:0.9">${row.high_score || 0}</td>
                <td style="padding:8px 4px;opacity:0.9">${row.total_wins || 0}/${row.total_matches || 0}</td>
            </tr>
        `).join('');
    }

    async toggleHistory() {
        const panel = document.getElementById('history-panel');
        if (!panel) return;
        const isHidden = panel.classList.toggle('hidden');
        if (!isHidden) {
            this.refreshHistory();
        }
    }

    async refreshHistory() {
        if (!this.currentUser) return;
        const tbody = document.getElementById('history-body');
        if (!tbody) return;

        const { getMatchHistory } = await import('./src/lib/supabase.js');
        const history = await getMatchHistory(this.currentUser.id);

        if (!history || history.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="padding:12px;text-align:center;opacity:0.5">Tiada rekod lagi</td></tr>';
            return;
        }

        tbody.innerHTML = history.map(row => {
            const date = new Date(row.match_date).toLocaleDateString();
            const resultColor = row.won ? '#4ade80' : '#f87171';
            const resultText = row.won ? 'WIN' : 'LOSS';
            return `
                <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
                    <td style="padding:6px 4px;opacity:0.7">${date}</td>
                    <td style="padding:6px 4px;color:${resultColor};font-weight:800">${resultText}</td>
                    <td style="padding:6px 4px;font-weight:700">${row.player_score} vs ${row.ai_score}</td>
                    <td style="padding:6px 4px;color:#ffd700">+${row.coins_earned}🪙</td>
                </tr>
            `;
        }).join('');
    }

    init() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        this.renderer = new THREE.WebGLRenderer({
            canvas: document.querySelector('#bg'),
            antialias: true,
            powerPreference: "high-performance"
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
        sunLight.position.set(20, 50, 20);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        this.scene.add(sunLight);

        // Fixed Fog: density was way too high (0.012 -> 0.0025)
        this.scene.fog = new THREE.FogExp2(0xd4a373, 0.0025);

        this.world = new World(this.scene);
        this.player = new Player(this.scene, this.camera);
        this.player.mesh.position.y = 0.1; // Spawn slightly above to avoid sticking
        this.congkakEngine = new CongkakEngine();
        this.guliManager = new GuliManager(this.scene, this.player, this.congkakEngine, this.world);
        this.congkakBoard = new CongkakBoard(this.scene, this.camera, this.player);

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.resizeScaleOverlays();
        });
    }

    setupEvents() {
        // Main Menu -> Explore directly
        const startBtn = document.getElementById('start-btn');
        startBtn.addEventListener('click', () => {
            document.getElementById('main-menu').classList.add('hidden');
            this.audioManager.start();

            // Set state first to enable update loop
            this.gameState = 'EXPLORE';

            // Go straight to exploration — spawn gulis
            const level = this.levels[0];
            this.guliManager.targetScore = level.target;
            this.guliManager.spawn(60, level.types);
            this.guliManager.updateHUD();

            this.startLevel(this.currentLevelIdx);

            // Force focus back to window for keyboard input
            window.focus();
        });

        // Map Button Toggle
        document.querySelectorAll('.nav-link-map').forEach(el => {
            el.addEventListener('click', () => {
                document.getElementById('world-map')?.classList.toggle('hidden');
            });
        });

        // Level Nodes in Map
        const nodes = document.querySelectorAll('.level-node-mini');
        nodes.forEach((node, idx) => {
            node.addEventListener('click', () => {
                if (node.classList.contains('locked')) return;
                this.currentLevelIdx = idx;
                document.getElementById('world-map').classList.add('hidden');
                this.startLevel(this.currentLevelIdx);
            });
        });

        // Inventory Toggle
        document.querySelectorAll('.nav-link-inventory').forEach(el => {
            el.addEventListener('click', () => {
                document.getElementById('guli-vault-mini')?.classList.toggle('hidden');
            });
        });

        // Missions Toggle
        document.querySelectorAll('.nav-link-missions').forEach(el => {
            el.addEventListener('click', () => {
                document.getElementById('bounty-hud')?.classList.toggle('hidden');
            });
        });

        // Win Screen -> Next Level
        const nextLevelBtn = document.getElementById('next-level-btn');
        nextLevelBtn.addEventListener('click', () => {
            document.getElementById('win-screen').classList.add('hidden');
            this.currentLevelIdx = (this.currentLevelIdx + 1) % this.levels.length;
            this.startLevel(this.currentLevelIdx);
        });

        window.addEventListener('guli-goal-met', () => {
            const btn = document.getElementById('start-congkak-btn');
            const indicator = document.getElementById('guli-ready-indicator');
            if (btn) btn.classList.remove('hidden');
            if (indicator) indicator.classList.remove('hidden');

            // Mark quest as done
            const q = document.getElementById('quest-guli');
            if (q) {
                q.classList.add('completed');
            }
        });

        const challengeBtn = document.getElementById('start-congkak-btn');
        const triggerCongkak = () => {
            const selector = document.getElementById('difficulty-selector');
            if (selector) selector.classList.remove('hidden');
        };

        if (challengeBtn) challengeBtn.addEventListener('click', () => triggerCongkak());
        document.querySelectorAll('.nav-link-play').forEach(el => {
            el.addEventListener('click', () => triggerCongkak());
        });

        // HUB Toggle
        const hubBtn = document.getElementById('hub-trigger-btn');
        const hubMenu = document.getElementById('mobile-hub-menu');
        if (hubBtn && hubMenu) {
            hubBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                hubMenu.classList.remove('hidden');
            });
        }

        document.getElementById('close-hub-btn')?.addEventListener('click', () => {
            hubMenu.classList.add('hidden');
        });

        // Close hub when any link inside is clicked
        hubMenu?.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => hubMenu.classList.add('hidden'));
        });

        // Joystick Toggle Logic
        const toggleJoystick = () => {
            this.joystickEnabled = !this.joystickEnabled;
            this.updateUIVisibility();
        };

        document.querySelectorAll('.nav-link-joystick').forEach(el => {
            el.addEventListener('click', () => toggleJoystick());
        });

        const deskJoyBtn = document.getElementById('nav-joystick');
        if (deskJoyBtn) deskJoyBtn.addEventListener('click', () => toggleJoystick());

        // Rank Toggle
        document.querySelectorAll('.nav-link-rank').forEach(el => {
            el.addEventListener('click', () => {
                this.toggleLeaderboard();
            });
        });

        // History Toggle
        document.querySelectorAll('.nav-link-history').forEach(el => {
            el.addEventListener('click', () => {
                this.toggleHistory();
            });
        });

        // HUD Visibility Toggle (Eye icon)
        document.getElementById('hud-toggle-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            document.body.classList.toggle('hud-hidden');
            const btn = e.currentTarget;
            const isHidden = document.body.classList.contains('hud-hidden');

            // Update Lucide icon
            const icon = btn.querySelector('i, svg');
            if (icon) {
                icon.setAttribute('data-lucide', isHidden ? 'eye-off' : 'eye');
                if (window.lucide) lucide.createIcons();
            }
        });

        // Minigame Selection logic (for when people click cards in main menu)
        const selectQuiz = document.getElementById('select-quiz');
        const selectMatch3 = document.getElementById('select-match3');
        if (selectQuiz) selectQuiz.addEventListener('click', () => {
            document.getElementById('main-menu')?.classList.add('hidden');
            document.getElementById('quiz-game')?.classList.remove('hidden');
        });
        if (selectMatch3) selectMatch3.addEventListener('click', () => {
            document.getElementById('main-menu')?.classList.add('hidden');
            document.getElementById('match3-game')?.classList.remove('hidden');
        });

        // Close buttons for minigames
        document.getElementById('match3-exit')?.addEventListener('click', () => {
            document.getElementById('match3-game')?.classList.add('hidden');
            this.updateUIVisibility();
        });

        // Exit Congkak button
        document.getElementById('exit-congkak-btn')?.addEventListener('click', () => {
            this.gameState = 'EXPLORE';
            this.congkakBoard.hide();
            this.updateUIVisibility();
        });

        // Difficulty Selection
        const diffCards = document.querySelectorAll('.difficulty-card');
        diffCards.forEach(card => {
            card.addEventListener('click', () => {
                this.difficulty = card.dataset.level;
                document.getElementById('difficulty-selector').classList.add('hidden');
                this.startCongkakMatch();
            });
        });

        document.getElementById('close-diff-btn')?.addEventListener('click', () => {
            document.getElementById('difficulty-selector').classList.add('hidden');
        });

        // Energy gain when catching animals
        window.addEventListener('animal-caught', (e) => {
            const energyRewards = { chicken: 2, cat: 4, sheep: 8, cow: 16 };
            const reward = energyRewards[e.detail.type] || 2;
            this.addEnergy(reward);
            // Show recharge UI
            const popup = document.getElementById('energy-popup');
            if (popup) {
                popup.textContent = `+${reward} ⚡ ${e.detail.type.toUpperCase()}`;
                popup.style.color = '#4ade80';
                popup.classList.remove('animate-popup');
                void popup.offsetWidth;
                popup.classList.add('animate-popup');
                setTimeout(() => { popup.style.color = ''; popup.textContent = 'ENERGY RECHARGE! ⚡'; }, 2000);
            }
        });

        // Auto-Save: Guli Collection
        window.addEventListener('guli-collected', (e) => {
            if (this.currentUser) {
                // Batch updates into one call to be efficient
                updateProfile(this.currentUser.id, {
                    collected_gulis: this.guliManager.inventory,
                    xp: this.guliManager.xp
                });
            }
        });

        // Auto-Save: Energy Spend
        window.addEventListener('energy-spend', (e) => {
            this.addEnergy(-e.detail.amount);
        });

        // 2D Congkak Hole Mouse Events
        for (let i = 0; i < 16; i++) {
            const el = document.getElementById(`hole-${i}-2d`);
            if (el) {
                // Click (Only for kampung 0-13)
                if (i < 14) {
                    el.addEventListener('click', () => {
                        // Turn validation
                        if (this.gameState !== 'CONGKAK') return;
                        if (this.congkakEngine.currentPlayer !== 1) return;
                        if (this.isProcessingMove) return;

                        if (i <= 6) this.handleCongkakMove(i);
                    });
                }

                // Hover (Inspector)
                el.addEventListener('mouseenter', () => this.updateInspector(i));
                el.addEventListener('mouseleave', () => this.clearInspector());
            }
        }

        const exitCongkak = document.getElementById('exit-congkak-btn');
        if (exitCongkak) {
            exitCongkak.addEventListener('click', () => {
                this.gameState = 'EXPLORE';
                this.updateUIVisibility();
            });
        }

        // Help Button Toggle
        const helpBtn = document.getElementById('help-btn');
        const mouseHint = document.getElementById('mouse-hint');
        const toggleHelp = (e) => {
            if (e) e.stopPropagation();
            mouseHint?.classList.toggle('hidden');
        };

        if (helpBtn && mouseHint) {
            helpBtn.addEventListener('click', toggleHelp);
            window.addEventListener('click', () => {
                mouseHint.classList.add('hidden');
            });
        }

        // Integrated Hub Help
        document.querySelectorAll('.nav-link-help').forEach(el => {
            el.addEventListener('click', toggleHelp);
        });

        window.addEventListener('click', (e) => this.onPlayerClick(e));
    }

    startCongkakMatch() {
        this.gameState = 'CONGKAK';
        if (document.pointerLockElement) document.exitPointerLock();
        this.updateUIVisibility();

        this.congkakEngine.reset(this.guliManager.inventory);
        this.congkakBoard.show();
        this.update2DUI(this.congkakEngine.holes);
        this.updateCongkakUI();
        this.resizeScaleOverlays();

        const challengeBtn = document.getElementById('start-congkak-btn');
        if (challengeBtn) challengeBtn.classList.add('hidden');
    }

    updateUIVisibility() {
        // Elements from HUB
        const hud = document.getElementById('hud');
        const worldMap = document.getElementById('world-map');
        const bountyHud = document.getElementById('bounty-hud');
        const guliVault = document.getElementById('guli-vault-mini');
        const topBar = document.getElementById('top-bar');
        const bottomNav = document.getElementById('mobile-bottom-nav');

        // Screens / Overlays
        const mainMenu = document.getElementById('main-menu');
        const diffSelector = document.getElementById('difficulty-selector');
        const congkakOverlay = document.getElementById('congkak-2d-overlay');
        const leaderboardPanel = document.getElementById('leaderboard-panel');
        const historyPanel = document.getElementById('history-panel');
        const winScreen = document.getElementById('win-screen');
        const joystick = document.getElementById('joystick-zone');
        const helpHint = document.getElementById('help-hint-container');

        if (this.gameState === 'MENU') {
            [hud, worldMap, bountyHud, guliVault, topBar, bottomNav, diffSelector, congkakOverlay, leaderboardPanel, historyPanel, winScreen, joystick, helpHint].forEach(el => el?.classList.add('hidden'));
            mainMenu?.classList.remove('hidden');
            return;
        }

        // Standard Gameplay UI (Available for Explore & Congkak)
        mainMenu?.classList.add('hidden');
        [hud, topBar, helpHint].forEach(el => el?.classList.remove('hidden'));

        // Responsive Default HUD Panels
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            // Mobile: Show only Guli Bag by default
            guliVault?.classList.remove('hidden');
            worldMap?.classList.add('hidden');
            bountyHud?.classList.add('hidden');
            leaderboardPanel?.classList.add('hidden');
            historyPanel?.classList.add('hidden');
        } else {
            // Desktop: Show all panels including Leaderboard and History
            [worldMap, bountyHud, guliVault, leaderboardPanel, historyPanel].forEach(el => el?.classList.remove('hidden'));
        }

        // Reset specific gameplay overlays safely
        [bottomNav, congkakOverlay, diffSelector, joystick].forEach(el => el?.classList.add('hidden'));

        // Update joystick button state
        const joyBtn = document.getElementById('nav-joystick');
        if (joyBtn) {
            joyBtn.style.opacity = this.joystickEnabled ? '1' : '0.4';
            joyBtn.style.filter = this.joystickEnabled ? 'none' : 'grayscale(1)';
        }

        if (this.gameState === 'EXPLORE') {
            bottomNav?.classList.remove('hidden');
            if (this.joystickEnabled && isMobile) joystick?.classList.remove('hidden');
        } else if (this.gameState === 'CONGKAK') {
            congkakOverlay?.classList.remove('hidden');
        }
    }

    createTalkButton() {
        if (document.getElementById('tok-aki-talk-btn')) return;
        const btn = document.createElement('div');
        btn.id = 'tok-aki-talk-btn';
        btn.innerHTML = '💬 LIHAT SEJARAH';
        btn.style.cssText = `
            position: fixed;
            background: #191008;
            color: #ffffff;
            padding: 4px 18px;
            border-radius: 8px;
            font-family: 'Nunito', sans-serif;
            font-size: 0.72rem;
            font-weight: 800;
            border: 1px solid #FFB800;
            z-index: 999999;
            pointer-events: auto;
            text-transform: uppercase;
            display: none; 
            opacity: 0;
            transition: opacity 0.3s ease;
            align-items: center;
            justify-content: center;
            height: 28px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.8);
            white-space: nowrap;
            cursor: pointer;
            transform: translate(-50%, -100%);
        `;
        btn.onclick = () => {
            if (!this.activeNPC) return;
            const npcName = this.activeNPC.name;
            btn.style.display = 'none';
            this.gameState = 'STORY';

            if (npcName === 'Tok Aki') {
                this.tokAki = this.activeNPC;
                this.storyMode.start([
                    { name: "Tok Aki", portrait: "/assets/textures/player/tok_aki_face.png", text: "Assalamualaikum, cu! Dah sedia nak jadi Master Congkak?" },
                    { name: "Pemain", portrait: "/assets/textures/player/player_face.png", text: "Waalaikumussalam, Tok Aki! Saya sedia!" },
                    { name: "Tok Aki", portrait: "/assets/textures/player/tok_aki_face.png", text: "Bagus. Peraturan utama: Kumpul 49 biji guli dulu di kampung ni. Guli ni lah yang akan kita susun dalam lubang nanti." }
                ], 50);
                this.storyCompleted = true;
                this.tokAki.hideQuestMarker();
            } else if (npcName === 'Sejarah Perigi') {
                this.storyMode.start([
                    { name: "Pemain", portrait: "/assets/textures/player/player_face.png", text: "Kenapa nama permaianan ni 'Congkak'?" },
                    { name: "Sifu", portrait: "/assets/textures/player/tok_aki_face.png", text: "Ia dari perkataan 'Mencongak' — bermaksud mengira dalam kepala tanpa bantuan alat lain." },
                    { name: "Sifu", portrait: "/assets/textures/player/tok_aki_face.png", text: "Zaman dulu, pedagang asing pun kagum tengok orang kita pakar matematik secara spontan!" }
                ], 20);
                this.activeNPC.hideQuestMarker();
            } else if (npcName === 'Sejarah Tradisi') {
                this.storyMode.start([
                    { name: "Pemain", portrait: "/assets/textures/player/player_face.png", text: "Tok, macam mana nak mula jalan?" },
                    { name: "Sifu", portrait: "/assets/textures/player/tok_aki_face.png", text: "Kita panggil 'Menyemai'. Ambil semua guli dari satu lubang, dan jatuhkan satu-satu ikut pusingan jam." },
                    { name: "Sifu", portrait: "/assets/textures/player/tok_aki_face.png", text: "Kalau guli terakhir jatuh dalam lubang yang ada guli, amik semua guli tu dan sambung jalan!" }
                ], 20);
                this.activeNPC.hideQuestMarker();
            } else if (npcName === 'Seni Ukiran') {
                this.storyMode.start([
                    { name: "Pemain", portrait: "/assets/textures/player/player_face.png", text: "Cantiknya papan ni..." },
                    { name: "Sifu", portrait: "/assets/textures/player/tok_aki_face.png", text: "Papan kayu ni biasanya ada 7 lubang 'Kampung' di kiri dan kanan, serta 2 lubang 'Induk' di hujung." },
                    { name: "Sifu", portrait: "/assets/textures/player/tok_aki_face.png", text: "Kayu Cengal digunakan supaya papan ni tahan lama sampai ke anak cucu!" }
                ], 20);
                this.activeNPC.hideQuestMarker();
            } else if (npcName === 'Ilmu Hisab') {
                this.storyMode.start([
                    { name: "Pemain", portrait: "/assets/textures/player/player_face.png", text: "Macam mana nak dapat giliran lebih (Extra Turn)?" },
                    { name: "Sifu", portrait: "/assets/textures/player/tok_aki_face.png", text: "Itulah teknik 'Langkah Kanan'. Pastikan guli terakhir kamu jatuh tepat dalam 'Rumah' (Induk) kamu." },
                    { name: "Sifu", portrait: "/assets/textures/player/tok_aki_face.png", text: "Bila jatuh dalam Rumah, kamu boleh pilih mana-mana lubang lain untuk sambung pusingan!" }
                ], 20);
                this.activeNPC.hideQuestMarker();
            } else if (npcName === 'Guli Kerang') {
                this.storyMode.start([
                    { name: "Pemain", portrait: "/assets/textures/player/player_face.png", text: "Dulu orang guna guli kaca jugak ke?" },
                    { name: "Sifu", portrait: "/assets/textures/player/tok_aki_face.png", text: "Eh tak, dulu kami guna kulit kerang, biji saga, atau batu sungai." },
                    { name: "Sifu", portrait: "/assets/textures/player/tok_aki_face.png", text: "Setiap satu ada berat yang beza, jadi cara jatuhnya pun ada 'bunyi' tersendiri." }
                ], 20);
                this.activeNPC.hideQuestMarker();
            } else if (npcName === 'Lubang Induk') {
                this.storyMode.start([
                    { name: "Pemain", portrait: "/assets/textures/player/player_face.png", text: "Boleh ke saya letak guli dalam rumah lawan?" },
                    { name: "Sifu", portrait: "/assets/textures/player/tok_aki_face.png", text: "Jangan, cu! Itu panggil 'Langkau'. Kamu kena isi Rumah sendiri, tapi wajib langkau (skip) Rumah lawan." },
                    { name: "Sifu", portrait: "/assets/textures/player/tok_aki_face.png", text: "Bila guli jatuh kat Rumah sendiri, itulah mata kamu! Simpan elok-elok rezeki tu." }
                ], 20);
                this.activeNPC.hideQuestMarker();
            } else if (npcName === 'Hubungan Kasih') {
                this.storyMode.start([
                    { name: "Pemain", portrait: "/assets/textures/player/player_face.png", text: "Kenapa kita kena main berdepan?" },
                    { name: "Sifu", portrait: "/assets/textures/player/tok_aki_face.png", text: "Sebab Congkak ni game silaturahim. Sambil main, kita kena pandang muka lawan sebagai tanda hormat." },
                    { name: "Sifu", portrait: "/assets/textures/player/tok_aki_face.png", text: "Tak boleh main sorok-sorok, kena jujur dalam agihan guli!" }
                ], 20);
                this.activeNPC.hideQuestMarker();
            } else if (npcName === 'Varia Global') {
                this.storyMode.start([
                    { name: "Pemain", portrait: "/assets/textures/player/player_face.png", text: "Betul ke game ni ada kat Afrika?" },
                    { name: "Sifu", portrait: "/assets/textures/player/tok_aki_face.png", text: "Ya, di sana panggil 'Mancala'. Dunia ni luas, tapi minat manusia mengira dan menyusun strategi tetap sama." }
                ], 20);
                this.activeNPC.hideQuestMarker();
            } else if (npcName === 'Taktik Apit') {
                this.storyMode.start([
                    { name: "Pemain", portrait: "/assets/textures/player/player_face.png", text: "Lawan saya ada guli banyak sangat, saya nak curi boleh?" },
                    { name: "Sifu", portrait: "/assets/textures/player/tok_aki_face.png", text: "Boleh! Itu panggil 'Menembak' atau 'Apit'. Jika guli terakhir kamu jatuh di lubang kosong sebelah kamu..." },
                    { name: "Sifu", portrait: "/assets/textures/player/tok_aki_face.png", text: "...dan lubang lawan di hadapannya ada guli, amik semua guli tu masuk Rumah kamu!" }
                ], 20);
                this.activeNPC.hideQuestMarker();
            }
        };
        document.body.appendChild(btn);
    }

    startExploration() {
        this.startLevel(this.currentLevelIdx);
    }

    async onPlayerClick(event) {
        if (this.gameState !== 'CONGKAK' || this.isProcessingMove) return;
        if (this.congkakEngine.currentPlayer !== 1) return;
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.congkakBoard.group.children, true);
        if (intersects.length > 0) {
            const hole = intersects.find(i => i.object.userData && i.object.userData.id < 14);
            if (hole) await this.handleCongkakMove(hole.object.userData.id);
        }
    }

    async handleCongkakMove(holeIdx) {
        if (this.isProcessingMove) return;
        this.isProcessingMove = true;
        try {
            const moveGenerator = this.congkakEngine.makeMoveAnimated(holeIdx);
            for await (const step of moveGenerator) {
                if (step.currentPos !== undefined) this.update2DHighlights(step.currentPos);

                if (step.status === 'dropping' || step.status === 'pickup_continue' || step.status === 'steal') {
                    const handInfo = step.handCount !== undefined ? ` (${step.handCount})` : "";
                    const statusEl = document.getElementById('game-status');
                    if (statusEl) {
                        if (step.status === 'steal') {
                            statusEl.textContent = `STOLE ${step.stolenCount} GULIS! 💎`;
                            statusEl.style.color = "#4ade80";
                            await new Promise(r => setTimeout(r, 600));
                        } else {
                            statusEl.textContent = `SOWING${handInfo}`;
                        }
                    }
                }

                if (step.holes) {
                    this.update2DUI(step.holes);
                    this.updateCongkakUI();
                }

                const delay = step.status === 'dropping' ? 400 : 250;
                await new Promise(resolve => setTimeout(resolve, delay));

                if (step.status === 'end') {
                    this.update2DHighlights(null);
                    if (step.gameOver) {
                        this.handleGameOver();
                        return;
                    } else if (step.currentPlayer === 2) {
                        // Crucial: End THIS move processing before starting AI's
                        this.isProcessingMove = false;
                        this.updateCongkakUI();

                        setTimeout(() => {
                            this.triggerAIMove();
                        }, 1200);
                        return;
                    }
                }
            }
        } finally {
            this.isProcessingMove = false;
            this.updateCongkakUI();
        }
    }

    async triggerAIMove() {
        if (this.gameState !== 'CONGKAK' || this.congkakEngine.gameOver) return;
        if (this.congkakEngine.currentPlayer !== 2) return;

        // Small thinking delay for Tok Aki
        const statusEl = document.getElementById('game-status');
        if (statusEl) statusEl.textContent = "TOK AKI IS THINKING...";

        const aiMove = this.congkakEngine.getAIRecommendation(this.difficulty);
        if (aiMove !== null) {
            // Wait a bit more for realistic thinking
            await new Promise(r => setTimeout(r, 600));
            await this.handleCongkakMove(aiMove);
        } else {
            // No moves left - check game over
            this.congkakEngine.checkGameOver();
            this.updateCongkakUI();
            if (this.congkakEngine.gameOver) this.handleGameOver();
        }
    }

    handleGameOver() {
        if (this.gameState === 'WIN') return; // Avoid double triggering
        this.gameState = 'WIN';
        this.isProcessingMove = false;
        this.updateCongkakUI();

        // CRITICAL: Hide congkak overlay FIRST so win screen is visible
        document.getElementById('congkak-2d-overlay')?.classList.add('hidden');

        const playerScore = this.congkakEngine.getWeightedScore(1);
        const aiScore = this.congkakEngine.getWeightedScore(2);
        const won = playerScore > aiScore;

        const winMsg = document.getElementById('win-msg');
        const wonGulis = this.congkakEngine.getPlayerStoreGulis();

        // Return gulis logic
        wonGulis.forEach(type => {
            if (this.guliManager.inventory.hasOwnProperty(type)) {
                this.guliManager.inventory[type]++;
            }
        });
        this.guliManager.updateVault();

        const coinsEarned = won ? (this.rewards[this.difficulty] || 100) : -this.penalty;
        const xpEarned = won ? 200 : 50;
        this.addCoins(coinsEarned);
        this.guliManager.xp += xpEarned;
        this.guliManager.updateHUD();

        // Update win screen content with actual scores
        if (winMsg) {
            if (!won) {
                winMsg.innerHTML = `DEFEATED!<br><span style="font-size:1rem;color:#f87171">Lost ${this.penalty} 🪙</span>`;
            } else {
                winMsg.innerHTML = `VICTORY!<br><span style="font-size:1rem;color:#4ade80">+${coinsEarned} 🪙</span>`;
            }
        }

        // Update the sub-text and rewards with actual data
        const winSub = document.querySelector('#win-screen .win-sub');
        if (winSub) {
            winSub.innerHTML = `Skor Anda: <b>${playerScore}</b> vs Tok Aki: <b>${aiScore}</b>`;
        }
        const winRewards = document.querySelector('#win-screen .win-rewards');
        if (winRewards) {
            const coinSign = coinsEarned >= 0 ? '+' : '';
            winRewards.innerHTML = `
                <div class="reward-item">🪙 ${coinSign}${coinsEarned}</div>
                <div class="reward-item">🌟 +${xpEarned} XP</div>
            `;
        }

        // Update stars based on result
        const winStars = document.querySelector('#win-screen .win-stars');
        if (winStars) {
            winStars.textContent = won ? '★★★' : '☆☆☆';
            winStars.style.color = won ? '' : '#666';
        }

        // NOW show win screen
        document.getElementById('win-screen')?.classList.remove('hidden');

        // 🎉 Confetti celebration on VICTORY!
        if (won) {
            const end = Date.now() + 2500;
            const colors = ['#FFB800', '#FF6B35', '#FFD54F', '#4CAF50', '#ffffff'];
            (function frame() {
                confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0, y: 0.6 }, colors });
                confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1, y: 0.6 }, colors });
                if (Date.now() < end) requestAnimationFrame(frame);
            })();
            // Big center burst
            setTimeout(() => confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 }, colors }), 300);
        }

        if (this.currentUser) {
            saveMatchResult(this.currentUser.id, {
                playerScore, aiScore, won,
                gulisSpent: 49,
                gulisWon: wonGulis.length,
                coinsEarned, xpEarned
            });
            // Also persist XP to profile
            updateProfile(this.currentUser.id, { xp: this.guliManager.xp });
        }
    }

    addCoins(amount) {
        const el = document.getElementById('coin-val');
        const current = parseInt(el.textContent);
        const newVal = current + amount;
        el.textContent = newVal;

        // Persist to DB
        if (this.currentUser) {
            updateProfile(this.currentUser.id, { coins: newVal });
        }
    }

    addEnergy(amount) {
        const el = document.getElementById('energy-val');
        const current = parseInt(el.textContent);
        const newVal = Math.max(0, current + amount);
        el.textContent = newVal;

        // Persist to DB if logged in
        if (this.currentUser) {
            updateProfile(this.currentUser.id, { energy: newVal });
        }
    }

    updateCongkakUI() {
        const p1Turn = this.congkakEngine.currentPlayer === 1;
        const statusEl = document.getElementById('game-status');

        if (statusEl) {
            statusEl.textContent = this.isProcessingMove ? "DISTRIBUTING..." : (p1Turn ? "YOUR TURN" : "TOK AKI'S TURN");
            statusEl.style.color = p1Turn ? "var(--primary)" : "#FFB800";
        }

        document.getElementById('p1-score').textContent = this.congkakEngine.getScore(1);
        document.getElementById('ai-score').textContent = this.congkakEngine.getScore(2);

        // Individual Turn Indicators - Stay visible throughout the entire turn
        const p1Label = document.getElementById('p1-turn-indicator');
        const aiLabel = document.getElementById('ai-turn-indicator');

        if (p1Label) p1Label.classList.toggle('active', p1Turn);
        if (aiLabel) aiLabel.classList.toggle('active', !p1Turn);

        // Avatar Border Highlights
        const p1Av = document.getElementById('player-avatar');
        const aiAv = document.getElementById('ai-avatar');
        if (p1Av) p1Av.classList.toggle('active-turn', p1Turn);
        if (aiAv) aiAv.classList.toggle('active-turn', !p1Turn);

        // Safety: If board is empty but game not marked over, mark it!
        const boardEmpty = this.congkakEngine.holes.slice(0, 14).every(h => h.length === 0);
        if (boardEmpty && !this.congkakEngine.gameOver) {
            this.congkakEngine.checkGameOver();
            this.handleGameOver();
        }

        this.update2DUI(this.congkakEngine.holes);
    }

    update2DUI(holes) {
        holes.forEach((data, i) => {
            const el = document.getElementById(`hole-${i}-2d`);
            if (el) {
                const count = Array.isArray(data) ? data.length : data;
                const span = el.querySelector('span');
                if (span) span.textContent = count;
                else el.textContent = count;
            }
        });
    }

    updateInspector(idx) {
        const content = document.getElementById('inspector-content');
        if (!content) return;

        const data = this.congkakEngine.holes[idx];
        if (!data || data.length === 0) {
            content.innerHTML = '<div class="inspector-empty">EMPTY HOLE</div>';
            return;
        }

        const counts = { white: 0, yellow: 0, red: 0, blue: 0 };
        data.forEach(type => {
            if (counts[type] !== undefined) counts[type]++;
        });

        let html = '';
        if (counts.white > 0) {
            html += `<div class="inspector-item"><div class="inspector-guli guli-white"></div><span>White: ${counts.white}</span></div>`;
        }
        if (counts.yellow > 0) {
            html += `<div class="inspector-item"><div class="inspector-guli guli-yellow"></div><span>Yellow: ${counts.yellow}</span></div>`;
        }
        if (counts.red > 0) {
            html += `<div class="inspector-item"><div class="inspector-guli guli-red"></div><span>Red: ${counts.red}</span></div>`;
        }
        if (counts.blue > 0) {
            html += `<div class="inspector-item"><div class="inspector-guli guli-blue"></div><span>Blue: ${counts.blue}</span></div>`;
        }

        content.innerHTML = html;
    }

    clearInspector() {
        const content = document.getElementById('inspector-content');
        if (content) {
            content.innerHTML = '<span class="inspector-hint">HOVER OVER A HOLE TO VIEW GULI DETAILS</span>';
        }
    }

    update2DHighlights(activeIdx) {
        const isAI = this.congkakEngine.currentPlayer === 2;
        for (let i = 0; i < 16; i++) {
            const el = document.getElementById(`hole-${i}-2d`);
            if (el) {
                el.classList.remove('active');
                el.classList.remove('tok-aki-move');
            }
        }
        if (activeIdx !== null) {
            const activeEl = document.getElementById(`hole-${activeIdx}-2d`);
            if (activeEl) {
                activeEl.classList.add('active');
                if (isAI) activeEl.classList.add('tok-aki-move');
            }

            if (this.congkakBoard) {
                this.congkakBoard.highlightHole(activeIdx, isAI ? 0x4ade80 : 0xffd700);
            }
        } else {
            if (this.congkakBoard) this.congkakBoard.highlightHole(null);
        }
    }

    updateMapUI() {
        const nodes = document.querySelectorAll('.level-node');
        nodes.forEach((node, idx) => {
            if (idx <= this.currentLevelIdx) {
                node.classList.remove('locked');
                node.classList.add('active');
            } else {
                node.classList.add('locked');
                node.classList.remove('active');
            }

            // Show stars based on completion (placeholder logic for now)
            const stars = node.querySelectorAll('.star');
            if (idx < this.currentLevelIdx) {
                stars.forEach((s, i) => s.classList.add('filled'));
            }
        });
    }

    startLevel(idx) {
        const level = this.levels[idx];
        const levelEl = document.getElementById('level-val');
        if (levelEl) levelEl.textContent = level.id;
        this.updateMapUI();

        this.gameState = 'EXPLORE';
        this.updateUIVisibility();
        this.refreshLeaderboard();

        this.guliManager.score = 0;
        this.guliManager.targetScore = level.target;
        this.guliManager.goalMet = false; // Reset for new level
        this.guliManager.updateHUD();
        this.guliManager.spawn(100, level.types);
        this.congkakBoard.hide();
        document.getElementById('congkak-2d-overlay').classList.add('hidden');
        this.player.mesh.position.set(0, 0, 0);
        // Face the bounty board (at -4, 0, -2)
        this.player.mesh.rotation.y = Math.atan2(-4 - 0, -2 - 0);

        const btn = document.getElementById('start-congkak-btn');
        const indicator = document.getElementById('guli-ready-indicator');
        if (btn) btn.classList.add('hidden');
        if (indicator) indicator.classList.add('hidden');

        // Reset quest UI
        const q = document.getElementById('quest-guli');
        if (q) {
            q.classList.remove('completed');
            q.classList.add('active');
        }
        const qc = document.getElementById('quest-congkak');
        if (qc) qc.classList.add('locked');
    }

    animate() {
        const dt = this.clock.getDelta();
        requestAnimationFrame(() => this.animate());

        if (this.gameState === 'EXPLORE' || this.gameState === 'STORY') {
            this.player.update(dt, this.world.props);
            this.world.update(dt, this.camera, this.player);

            if (this.gameState === 'EXPLORE') {
                this.guliManager.update();

                // NPC Interaction Logic (Tok Aki & Story Points)
                const talkBtn = document.getElementById('tok-aki-talk-btn');
                if (this.world && talkBtn) {
                    let nearestNPC = null;
                    let minDist = 2; // Reverted to 2 as per user request

                    this.world.npcs.forEach(npc => {
                        const dist = this.player.mesh.position.distanceTo(npc.mesh.position);
                        if (dist < minDist) {
                            nearestNPC = npc;
                            minDist = dist; // Update minDist to find the closest
                        }
                    });

                    if (nearestNPC && nearestNPC.questMarker) {
                        this.activeNPC = nearestNPC;
                        talkBtn.innerHTML = `💬 ${nearestNPC.name.toUpperCase()}`;

                        const vector = new THREE.Vector3();
                        this.player.mesh.getWorldPosition(vector);
                        vector.y += 2.2;
                        vector.project(this.camera);

                        talkBtn.style.display = 'flex';
                        setTimeout(() => talkBtn.style.opacity = '1', 10);
                        talkBtn.style.left = `${(vector.x * 0.5 + 0.5) * window.innerWidth}px`;
                        talkBtn.style.top = `${(-vector.y * 0.5 + 0.5) * window.innerHeight}px`;
                    } else {
                        this.activeNPC = null;
                        talkBtn.style.display = 'none';
                        talkBtn.style.opacity = '0';
                    }
                }
            }
        }
        this.renderer.render(this.scene, this.camera);
    }

    resizeScaleOverlays() {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // Base width for scaling is slightly more than our largest modal (1280px)
        const baseWidth = 1280;
        const baseHeight = 940;

        const scaleW = (windowWidth * 0.96) / baseWidth;
        const scaleH = (windowHeight * 0.96) / baseHeight;

        const scale = Math.min(scaleW, scaleH, 1);

        // Set variable on root so all modals can use it
        document.documentElement.style.setProperty('--modal-scale', scale);
    }
}

new Game();
