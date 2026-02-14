import * as THREE from 'three';

export class GuliManager {
    constructor(scene, player, congkakEngine, world) {
        this.scene = scene;
        this.player = player;
        this.congkakEngine = congkakEngine;
        this.world = world;
        this.textureLoader = new THREE.TextureLoader();
        this.gulis = [];
        this.score = 0;
        this.targetScore = 10;

        this.inventory = { blue: 0, yellow: 0, red: 0, white: 0 };

        this.textures = {};
        ['blue', 'yellow', 'red', 'white'].forEach(type => {
            const tex = this.textureLoader.load(`/assets/textures/congkak/guli_${type}.png`);
            tex.colorSpace = THREE.SRGBColorSpace;
            this.textures[type] = tex;
        });

        this.glowTexture = this.createGlowTexture();
    }

    createGlowTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64; canvas.height = 64;
        const ctx = canvas.getContext('2d');
        const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 32);
        g.addColorStop(0, 'rgba(255, 255, 200, 0.6)');
        g.addColorStop(1, 'rgba(255, 200, 100, 0)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64);
        return new THREE.CanvasTexture(canvas);
    }

    spawn(count, types) {
        this.gulis.forEach(g => this.scene.remove(g.group));
        this.gulis = [];

        // Use world hiding spots for spawning guli
        const spots = [...this.world.hidingSpots];
        // Shuffle spots
        for (let i = spots.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [spots[i], spots[j]] = [spots[j], spots[i]];
        }

        for (let i = 0; i < Math.min(count, spots.length); i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            const spot = spots[i];
            this.createGuli(spot.x, spot.y, spot.z, type);
        }
    }

    createGuli(x, y, z, type) {
        const group = new THREE.Group();
        const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.3, 16, 16),
            new THREE.MeshStandardMaterial({ map: this.textures[type], metalness: 0.1, roughness: 0.2 })
        );
        mesh.castShadow = true;
        group.add(mesh);

        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTexture, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.3 }));
        sprite.scale.set(1.2, 1.2, 1);
        sprite.position.y = -0.2;
        group.add(sprite);

        group.position.set(x, y, z);
        const guli = { group, type, collected: false, bobPhase: Math.random() * 6.28 };
        this.scene.add(group);
        this.gulis.push(guli);
    }

    update() {
        const p = this.player.mesh.position;
        const time = Date.now() * 0.003;

        this.gulis.forEach(g => {
            if (g.collected) return;

            // Bobbing animation
            g.group.position.y = 0.6 + Math.sin(time + g.bobPhase) * 0.2;
            g.group.rotation.y += 0.02;

            const dist = p.distanceTo(g.group.position);

            // Magnet Effect: Pull guli towards player when close
            if (dist < 3.5) {
                const pullDir = new THREE.Vector3().subVectors(p, g.group.position).normalize();
                g.group.position.addScaledVector(pullDir, 0.15);
            }

            // Collection
            if (dist < 2.2) this.collect(g);
        });
    }

    collect(guli) {
        if (guli.isCollecting) return;
        guli.isCollecting = true;

        // Visual collection sequence
        const startScale = guli.group.scale.x;
        const duration = 400; // ms
        const startTime = Date.now();

        const animateCollection = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Spin faster and shrink
            guli.group.rotation.y += 0.3;
            const s = startScale * (1 - progress);
            guli.group.scale.set(s, s, s);

            if (progress < 1) {
                requestAnimationFrame(animateCollection);
            } else {
                this.finalizeCollection(guli);
            }
        };

        // Trigger UI Effects
        this.triggerRechargeUI();

        requestAnimationFrame(animateCollection);
    }

    finalizeCollection(guli) {
        guli.collected = true;
        this.scene.remove(guli.group);

        this.inventory[guli.type]++;
        this.score += (guli.type === 'yellow' ? 2 : 1);

        this.updateVault();
        this.updateHUD();

        // Dispatch event for Main.js to handle energy recharge
        window.dispatchEvent(new CustomEvent('guli-collected', { detail: { type: guli.type } }));

        if (this.score >= this.targetScore) window.dispatchEvent(new CustomEvent('guli-goal-met'));
    }

    triggerRechargeUI() {
        const flash = document.getElementById('recharge-flash');
        const popup = document.getElementById('energy-popup');

        if (flash) {
            flash.classList.remove('animate-recharge');
            void flash.offsetWidth; // Force reflow
            flash.classList.add('animate-recharge');
        }

        if (popup) {
            popup.classList.remove('animate-popup');
            void popup.offsetWidth; // Force reflow
            popup.classList.add('animate-popup');
            // Randomize position slightly for variety
            popup.style.left = `${40 + Math.random() * 20}%`;
            popup.style.top = `${40 + Math.random() * 20}%`;
        }
    }

    updateVault() {
        const vault = document.getElementById('guli-vault');
        vault.classList.remove('hidden');
        ['blue', 'yellow', 'red', 'white'].forEach(type => {
            document.getElementById(`vault-${type}`).textContent = this.inventory[type];
        });
    }

    updateHUD() {
        const el = document.getElementById('guli-val');
        if (el) el.textContent = `${this.score} / ${this.targetScore}`;
    }
}
