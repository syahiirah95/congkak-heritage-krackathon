import * as THREE from 'three';
import { Player } from './src/Player.js';
import { World } from './src/world/World.js';
import { GuliManager } from './src/guli/GuliManager.js';
import { CongkakEngine } from './src/congkak/CongkakEngine.js';
import { CongkakBoard } from './src/congkak/CongkakBoard.js';
import { AudioManager } from './src/AudioManager.js';
import { Story } from './src/ui/Story.js';

class Game {
    constructor() {
        this.levels = [
            { id: 1, target: 10, types: ['blue', 'yellow'] },
            { id: 2, target: 12, types: ['blue', 'yellow', 'red'] },
            { id: 3, target: 15, types: ['blue', 'yellow', 'red', 'white'] }
        ];
        this.currentLevelIdx = 0;
        this.gameState = 'MENU';

        this.init();
        this.setupEvents();

        this.clock = new THREE.Clock();
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.audioManager = new AudioManager();

        this.storyMode = new Story(() => this.startExploration());

        this.isProcessingMove = false;
        this.animate();
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

        this.world = new World(this.scene);
        this.player = new Player(this.scene, this.camera);
        this.congkakEngine = new CongkakEngine();
        this.guliManager = new GuliManager(this.scene, this.player, this.congkakEngine, this.world);
        this.congkakBoard = new CongkakBoard(this.scene, this.camera, this.player);

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    setupEvents() {
        // Main Menu -> Story
        const startBtn = document.getElementById('start-btn');
        startBtn.addEventListener('click', () => {
            document.getElementById('main-menu').classList.add('hidden');
            this.audioManager.start();
            this.gameState = 'STORY';
            this.storyMode.start();
            this.updateUIVisibility();
        });

        // Map Button (Bottom Nav)
        document.getElementById('nav-map').addEventListener('click', () => {
            document.getElementById('world-map').classList.remove('hidden');
        });

        // Close Map
        document.getElementById('map-close-btn').addEventListener('click', () => {
            document.getElementById('world-map').classList.add('hidden');
        });

        // Level Nodes in Map
        const nodes = document.querySelectorAll('.level-node');
        nodes.forEach((node, idx) => {
            node.addEventListener('click', () => {
                if (node.classList.contains('locked')) return;
                this.currentLevelIdx = idx;
                document.getElementById('world-map').classList.add('hidden');
                this.startLevel(this.currentLevelIdx);
            });
        });

        // Inventory Toggle (Bottom Nav)
        document.getElementById('nav-inventory').addEventListener('click', () => {
            const vault = document.getElementById('guli-vault');
            vault.classList.toggle('hidden');
        });

        // Missions Toggle (Bottom Nav)
        document.getElementById('nav-missions').addEventListener('click', () => {
            const bounty = document.getElementById('bounty-hud');
            bounty.classList.toggle('hidden');
        });

        // Win Screen -> Next Level
        const nextLevelBtn = document.getElementById('next-level-btn');
        nextLevelBtn.addEventListener('click', () => {
            document.getElementById('win-screen').classList.add('hidden');
            this.currentLevelIdx = (this.currentLevelIdx + 1) % this.levels.length;
            this.startLevel(this.currentLevelIdx);
        });

        window.addEventListener('guli-goal-met', () => {
            this.gameState = 'CONGKAK';
            if (document.pointerLockElement) document.exitPointerLock();
            this.updateUIVisibility();

            // Mark quest as done
            const q = document.getElementById('quest-guli');
            if (q) {
                q.classList.remove('active');
                q.classList.add('completed');
            }

            this.congkakEngine.reset();
            this.congkakBoard.show();
            this.congkakBoard.updateSeeds(this.congkakEngine.holes);
            this.updateCongkakUI();
        });

        window.addEventListener('guli-collected', (e) => {
            this.addEnergy(2); // Recharge energy on collection
        });

        window.addEventListener('click', (e) => this.onPlayerClick(e));
    }

    updateUIVisibility() {
        const hud = document.getElementById('hud');
        const topBar = document.getElementById('top-bar');
        const bottomNav = document.getElementById('bottom-nav');
        const exploreHud = document.getElementById('explore-hud');
        const bountyHud = document.getElementById('bounty-hud');
        const guliVault = document.getElementById('guli-vault');
        const congkakHud = document.getElementById('congkak-hud');

        // Reset all
        [hud, topBar, bottomNav, exploreHud, bountyHud, guliVault, congkakHud].forEach(el => el?.classList.add('hidden'));

        if (this.gameState === 'STORY') {
            // Only show story elements and minimal top bar
            topBar.classList.remove('hidden');
        } else if (this.gameState === 'EXPLORE') {
            hud.classList.remove('hidden');
            topBar.classList.remove('hidden');
            bottomNav.classList.remove('hidden');
            exploreHud.classList.remove('hidden');
            bountyHud.classList.remove('hidden');
            guliVault.classList.remove('hidden');
        } else if (this.gameState === 'CONGKAK') {
            hud.classList.remove('hidden');
            topBar.classList.remove('hidden');
            congkakHud.classList.remove('hidden');
        }
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
        const moveGenerator = this.congkakEngine.makeMoveAnimated(holeIdx);
        for await (const step of moveGenerator) {
            if (step.currentPos !== undefined) this.congkakBoard.highlightHole(step.currentPos);
            if (step.holes) {
                this.congkakBoard.updateSeeds(step.holes);
                this.updateCongkakUI();
            }
            await new Promise(resolve => setTimeout(resolve, step.status === 'dropping' ? 400 : 250));
            if (step.status === 'end') {
                this.congkakBoard.highlightHole(null);
                if (step.gameOver) {
                    this.gameState = 'WIN';
                    const winScreen = document.getElementById('win-screen');
                    winScreen.classList.remove('hidden');

                    const won = this.congkakEngine.getScore(1) > this.congkakEngine.getScore(2);
                    document.getElementById('win-msg').textContent = won ? "VICTORY!" : "TRY AGAIN!";

                    if (won) {
                        this.addCoins(50);
                        this.addEnergy(5);
                    }
                } else if (step.currentPlayer === 2) {
                    setTimeout(async () => {
                        const aiMove = this.congkakEngine.getAIRecommendation();
                        await this.handleCongkakMove(aiMove);
                    }, 1000);
                }
            }
        }
        this.isProcessingMove = false;
    }

    addCoins(amount) {
        const el = document.getElementById('coin-val');
        const current = parseInt(el.textContent);
        el.textContent = current + amount;
    }

    addEnergy(amount) {
        const el = document.getElementById('energy-val');
        const current = parseInt(el.textContent);
        el.textContent = current + amount;
    }

    updateCongkakUI() {
        const turnText = this.congkakEngine.currentPlayer === 1 ? "YOUR TURN" : "AI THINKING...";
        document.getElementById('game-status').textContent = this.isProcessingMove ? "DISTRIBUTING..." : turnText;
        document.getElementById('p1-score').textContent = this.congkakEngine.getScore(1);
        document.getElementById('ai-score').textContent = this.congkakEngine.getScore(2);
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
        document.getElementById('level-val').textContent = level.id;
        this.updateMapUI();

        this.gameState = 'EXPLORE';
        this.updateUIVisibility();

        this.guliManager.score = 0;
        this.guliManager.targetScore = level.target;
        this.guliManager.updateHUD();
        this.guliManager.spawn(12, level.types);

        this.congkakBoard.hide();
        this.player.mesh.position.set(0, 0, 0);

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
            if (this.gameState === 'EXPLORE') this.guliManager.update();
        }
        this.renderer.render(this.scene, this.camera);
    }
}

new Game();
