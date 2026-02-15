import * as THREE from 'three';

export class GuliManager {
    constructor(scene, player, congkakEngine, world) {
        this.scene = scene;
        this.player = player;
        this.congkakEngine = congkakEngine;
        this.world = world;
        this.textureLoader = new THREE.TextureLoader();
        this.goalMet = false;
        this.gulis = [];
        this.inventory = { black: 0, blue: 0, yellow: 0, red: 0, white: 0 };
        this.xp = 0;
        this.xpRewards = { black: 250, blue: 100, red: 50, yellow: 25, white: 10 };
        this.energyCost = {
            white: 2, yellow: 4, red: 6, blue: 8, black: 10,
            scam: 15, scam_green: 12, scam_orange: 10, scam_brown: 8, scam_pink: 14
        };
        this.scamTypes = ['scam', 'scam_green', 'scam_orange', 'scam_brown', 'scam_pink'];

        this.textures = {};
        ['black', 'blue', 'yellow', 'red', 'white'].forEach(type => {
            const tex = this.textureLoader.load(`/assets/textures/congkak/guli_${type}.png`);
            tex.colorSpace = THREE.SRGBColorSpace;
            this.textures[type] = tex;
        });
        // Scam gulis — no texture file, pure color (they look tempting by color alone!)
        this.textures['scam'] = null;
        this.textures['scam_green'] = null;
        this.textures['scam_orange'] = null;
        this.textures['scam_brown'] = null;
        this.textures['scam_pink'] = null;
        this.score = 0; // Initialize score
        this.targetScore = 49;

        this.glowTexture = this.createGlowTexture();

        // Listen for scam close
        const scamClose = document.getElementById('scam-close');
        if (scamClose) {
            scamClose.onclick = () => {
                document.getElementById('scam-overlay').classList.add('hidden');
            };
        }
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
            // Pick equal random type
            const pickedType = types[Math.floor(Math.random() * types.length)];
            const spot = spots[i];
            this.createGuli(spot.x, spot.y, spot.z, pickedType);
        }

        // Always spawn SCAM gulis randomly (mixed colors!)
        for (let j = 0; j < 8; j++) {
            const scamSpot = spots[Math.floor(Math.random() * spots.length)];
            const scamType = this.scamTypes[Math.floor(Math.random() * this.scamTypes.length)];
            this.createGuli(scamSpot.x + 1, scamSpot.y, scamSpot.z + 1, scamType);
        }
    }

    createGuli(x, y, z, type) {
        const group = new THREE.Group();
        const typeColors = {
            black: 0x000000, blue: 0x00f2ff, yellow: 0xffe600,
            red: 0xff3333, white: 0xffffff, scam: 0xff00ff,
            scam_green: 0x00ff66, scam_orange: 0xff8800,
            scam_brown: 0x8B4513, scam_pink: 0xff69b4
        };
        const color = typeColors[type];
        const isRare = (type === 'blue' || type === 'black');

        const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.5, 24, 24), // Smoother sphere
            new THREE.MeshStandardMaterial({
                map: this.textures[type],
                color: type === 'black' ? 0x333333 : 0xffffff, // Use white/grey so texture shows original colors
                emissive: color,
                emissiveIntensity: 0.4, // Lowered significantly to see texture details
                metalness: 0.4,
                roughness: 0.05, // Very shiny glass look
                envMapIntensity: 1.0
            })
        );
        mesh.castShadow = true;
        group.add(mesh);

        // PointLight from below for a very subtle under-glow
        const light = new THREE.PointLight(color, 2, 3);
        light.position.set(0, -0.4, 0);
        group.add(light);

        // Glow sprite (Standardized to rare guli size/opacity)
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
            map: this.glowTexture,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 0.6 // Slightly lower to not over-glow the texture
        }));
        sprite.scale.set(1.8, 1.8, 1);
        sprite.position.y = -0.1;
        group.add(sprite);

        group.position.set(x, y, z);
        this.scene.add(group);
        this.gulis.push({ group, type, collected: false });
    }

    update() {
        const p = this.player.mesh.position;

        this.gulis.forEach(g => {
            if (g.collected) return;

            // Guli is STATIC — no rotation, no bobbing
            // Collection — increased threshold for better feel
            const dist = p.distanceTo(g.group.position);
            if (dist < 2.8) this.collect(g);
        });
    }

    collect(guli) {
        if (guli.isCollecting) return;

        // Check energy BEFORE animation (skip check for scam — scam always drains)
        if (!guli.type.startsWith('scam')) {
            const cost = this.energyCost[guli.type] ?? 1;
            const energyEl = document.getElementById('energy-val');
            // More robust parsing in case of icons/text
            const energyText = energyEl?.textContent || '0';
            const currentEnergy = parseInt(energyText.replace(/[^0-9]/g, '')) || 0;

            if (currentEnergy < cost) {
                this.showEnergyWarning();
                return; // Don't collect, don't animate
            }
        }

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

        requestAnimationFrame(animateCollection);
    }

    finalizeCollection(guli) {
        guli.collected = true;
        this.scene.remove(guli.group);

        if (guli.type.startsWith('scam')) {
            // Scam drains energy
            const cost = this.energyCost[guli.type] ?? 5;
            window.dispatchEvent(new CustomEvent('energy-spend', { detail: { amount: cost, type: guli.type } }));
            this.triggerScamUI(guli.group.position.clone());
            return;
        }

        // Deduct energy (already validated in collect())
        const cost = this.energyCost[guli.type] ?? 1;
        window.dispatchEvent(new CustomEvent('energy-spend', { detail: { amount: cost, type: guli.type } }));

        this.inventory[guli.type]++;
        this.score++;
        this.xp += this.xpRewards[guli.type];

        this.updateVault();
        this.updateHUD();

        // Show collection popup
        this.showCollectPopup(guli.type, cost);

        // Dispatch event for Main.js to handle
        window.dispatchEvent(new CustomEvent('guli-collected', { detail: { type: guli.type } }));

        // Fire goal-met when player has enough gulis for Congkak (49 minimum)
        if (this.getTotalGulis() >= 49 && !this.goalMet) {
            this.goalMet = true;
            window.dispatchEvent(new CustomEvent('guli-goal-met'));
        }
    }

    showEnergyWarning() {
        const popup = document.getElementById('energy-popup');
        if (popup) {
            popup.textContent = '⚡ TENAGA HABIS! Tangkap haiwan!';
            popup.style.color = '#ff4d4f';
            popup.classList.remove('animate-popup');
            void popup.offsetWidth;
            popup.classList.add('animate-popup');
            setTimeout(() => {
                popup.textContent = 'ENERGY RECHARGE! ⚡';
                popup.style.color = '';
            }, 2000);
        }
    }

    showCollectPopup(type, energyCost) {
        const colorMap = { white: '#fff', yellow: '#FFB800', red: '#FF6B35', blue: '#00f2ff', black: '#9966ff' };
        const emojis = { white: '⚪', yellow: '🟡', red: '🔴', blue: '🔵', black: '⚫' };
        const xp = this.xpRewards[type] || 0;
        const guliColor = colorMap[type] || '#FFB800';

        const tooltip = document.createElement('div');
        tooltip.innerHTML = `
            <span style="font-size:1.5rem">${emojis[type] || '🔮'}</span>
            <span style="color:${guliColor};text-transform:uppercase;font-weight:900;letter-spacing:1px">${type}</span>
            <span style="color:#4CAF50;font-weight:700">+${xp} XP</span>
            <span style="color:#FFD54F;font-weight:700">-${energyCost} ⚡</span>
        `;
        tooltip.style.cssText = `
            position: fixed;
            top: 28%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(30, 15, 5, 0.88);
            backdrop-filter: blur(10px);
            color: #FFF8E1;
            padding: 10px 24px;
            border-radius: 14px;
            font-family: 'Nunito', sans-serif;
            font-size: 0.95rem;
            display: flex;
            align-items: center;
            gap: 12px;
            border: 2px solid rgba(255, 184, 0, 0.5);
            box-shadow: 0 0 25px rgba(255, 184, 0, 0.2), 0 4px 15px rgba(0,0,0,0.4);
            pointer-events: none;
            z-index: 9999;
            animation: collectPopAnim 1s ease-out forwards;
        `;
        document.body.appendChild(tooltip);
        setTimeout(() => tooltip.remove(), 1100);
    }

    getTotalGulis() {
        return Object.values(this.inventory).reduce((sum, v) => sum + (Number(v) || 0), 0);
    }

    triggerScamUI(position) {
        // 1. Spawn a small monkey at the guli's position that runs away
        this.spawnScamAnimal(position);

        // 2. Show floating tooltip "KENA SCAM!" at screen position
        this.showScamTooltip(position);
    }

    spawnScamAnimal(pos) {
        const group = new THREE.Group();
        const furMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const skinMat = new THREE.MeshStandardMaterial({ color: 0xffd699 });
        const darkMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
        const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff });

        // Body
        const body = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 10), furMat);
        body.scale.set(1, 1.2, 0.9);
        body.position.y = 0.45;
        group.add(body);

        // Head
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 10), furMat);
        head.position.set(0, 0.78, 0.08);
        group.add(head);

        // Face/snout
        const face = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8), skinMat);
        face.position.set(0, 0.74, 0.2);
        group.add(face);

        // Ears
        const earL = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), skinMat);
        earL.position.set(0.18, 0.88, 0.05);
        group.add(earL);
        const earR = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), skinMat);
        earR.position.set(-0.18, 0.88, 0.05);
        group.add(earR);

        // Eyes
        const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), whiteMat);
        eyeL.position.set(0.08, 0.82, 0.22);
        group.add(eyeL);
        const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), whiteMat);
        eyeR.position.set(-0.08, 0.82, 0.22);
        group.add(eyeR);
        // Pupils
        const pupilL = new THREE.Mesh(new THREE.SphereGeometry(0.02, 4, 4), darkMat);
        pupilL.position.set(0.08, 0.82, 0.26);
        group.add(pupilL);
        const pupilR = new THREE.Mesh(new THREE.SphereGeometry(0.02, 4, 4), darkMat);
        pupilR.position.set(-0.08, 0.82, 0.26);
        group.add(pupilR);

        // Arms
        const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.35), furMat);
        armL.rotation.z = 0.4;
        armL.position.set(0.25, 0.5, 0);
        group.add(armL);
        const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.35), furMat);
        armR.rotation.z = -0.4;
        armR.position.set(-0.25, 0.5, 0);
        group.add(armR);

        // Legs
        const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.25), furMat);
        legL.position.set(0.1, 0.15, 0);
        group.add(legL);
        const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.25), furMat);
        legR.position.set(-0.1, 0.15, 0);
        group.add(legR);

        // Tail (curly)
        const tail = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.02, 6, 12, Math.PI * 1.5), furMat);
        tail.rotation.y = Math.PI / 2;
        tail.position.set(0, 0.35, -0.25);
        group.add(tail);

        group.position.set(pos.x, 0, pos.z);
        this.scene.add(group);

        // Phase 1: Circle around the player, Phase 2: Run away
        const playerPos = this.player.mesh.position;
        const circleRadius = 2.5;
        const startAngle = Math.atan2(pos.z - playerPos.z, pos.x - playerPos.x);
        let frame = 0;
        const circleFrames = 150;  // ~2 slow loops
        const runFrames = 90;

        const animate = () => {
            frame++;

            if (frame <= circleFrames) {
                // Phase 1: Circle around player slowly
                const angle = startAngle + (frame / circleFrames) * Math.PI * 4;
                const cx = playerPos.x + Math.cos(angle) * circleRadius;
                const cz = playerPos.z + Math.sin(angle) * circleRadius;
                group.position.set(cx, Math.abs(Math.sin(frame * 0.15)) * 0.25, cz);
                group.lookAt(playerPos.x, 0.5, playerPos.z);
            } else {
                // Phase 2: Run away slowly
                const runFrame = frame - circleFrames;
                const runDir = new THREE.Vector3(
                    group.position.x - playerPos.x, 0,
                    group.position.z - playerPos.z
                ).normalize();
                group.position.addScaledVector(runDir, 0.15);
                group.position.y = Math.abs(Math.sin(runFrame * 0.2)) * 0.2;
                group.rotation.y += 0.15;
            }

            if (frame < circleFrames + runFrames) {
                requestAnimationFrame(animate);
            } else {
                this.scene.remove(group);
            }
        };
        requestAnimationFrame(animate);
    }

    showScamTooltip(pos) {
        // Create a floating HTML tooltip at the scam position
        const tooltip = document.createElement('div');
        tooltip.textContent = '🐒 KENA SCAM!';
        tooltip.style.cssText = `
            position: fixed;
            top: 40%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.85);
            color: #ff4d4f;
            padding: 10px 24px;
            border-radius: 12px;
            font-family: 'Nunito', sans-serif;
            font-size: 1.4rem;
            font-weight: 900;
            border: 2px solid #ff4d4f;
            pointer-events: none;
            z-index: 9999;
            animation: scamTooltipAnim 1.5s ease-out forwards;
        `;
        document.body.appendChild(tooltip);

        // Remove after animation
        setTimeout(() => tooltip.remove(), 1600);
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
        ['black', 'blue', 'yellow', 'red', 'white'].forEach(type => {
            const el = document.getElementById(`vault-${type}-mini`);
            if (el) el.textContent = this.inventory[type];
        });
    }

    updateHUD() {
        const total = this.getTotalGulis();
        const guliEl = document.getElementById('guli-val');
        if (guliEl) guliEl.textContent = `${total} guli`;

        const xpEl = document.getElementById('xp-val');
        if (xpEl) xpEl.textContent = `${this.xp} XP`;
    }
}
