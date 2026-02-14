import * as THREE from 'three';

export class CongkakBoard {
    constructor(scene, camera, player) {
        this.scene = scene;
        this.camera = camera;
        this.player = player;
        this.textureLoader = new THREE.TextureLoader();
        this.group = new THREE.Group();
        this.holeMeshes = new Array(16);
        this.seedGroup = new THREE.Group();
        this.labelGroup = new THREE.Group();
        this.group.add(this.seedGroup);
        this.group.add(this.labelGroup);

        // Preload guli textures once
        this.seedMats = [];
        const guliNames = ['blue', 'yellow', 'red', 'white'];
        guliNames.forEach(name => {
            const tex = this.textureLoader.load(`/assets/textures/congkak/guli_${name}.png`);
            tex.colorSpace = THREE.SRGBColorSpace;
            this.seedMats.push(new THREE.MeshStandardMaterial({
                map: tex,
                metalness: 0.1,
                roughness: 0.15
            }));
        });

        this.seedGeo = new THREE.SphereGeometry(0.12, 16, 16);

        // Deterministic seed color per hole index (so colors don't change randomly)
        this.seedColors = [];
        for (let i = 0; i < 200; i++) {
            this.seedColors.push(Math.floor(Math.random() * this.seedMats.length));
        }

        // Track highlighted hole
        this.highlightedHole = null;

        this.createBoard();
    }

    createBoard() {
        const boardTex = this.textureLoader.load('/assets/textures/congkak/congkak_wood.png');
        boardTex.colorSpace = THREE.SRGBColorSpace;

        // Main board body — elongated oval shape
        const baseGeo = new THREE.BoxGeometry(12, 0.6, 3.5);
        const baseMat = new THREE.MeshStandardMaterial({
            map: boardTex,
            roughness: 0.6,
            metalness: 0.1
        });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.receiveShadow = true;
        base.castShadow = true;
        this.group.add(base);

        // Raised rim around the board
        const rimMat = new THREE.MeshStandardMaterial({
            map: boardTex,
            roughness: 0.5,
            metalness: 0.15
        });
        const rimGeo = new THREE.BoxGeometry(12.2, 0.15, 3.7);
        const rim = new THREE.Mesh(rimGeo, rimMat);
        rim.position.y = 0.35;
        this.group.add(rim);

        // Hole material — dark interior
        const holeMat = new THREE.MeshStandardMaterial({
            color: 0x1a0e05,
            roughness: 0.95,
            metalness: 0.0
        });

        // Small Holes (Kampung) — carved deeper
        for (let i = 0; i < 7; i++) {
            const xPos = -3.6 + (i * 1.2);
            this.holeMeshes[i] = this.createHole(xPos, 0.15, 0.7, i, holeMat);           // Player 1 row (front)
            this.holeMeshes[7 + i] = this.createHole(-3.6 + ((6 - i) * 1.2), 0.15, -0.7, 7 + i, holeMat); // Player 2 row (back)
        }

        // Storehouses (Induk) — larger
        this.holeMeshes[14] = this.createStorehouse(5.2, 14, holeMat);  // P1 right
        this.holeMeshes[15] = this.createStorehouse(-5.2, 15, holeMat); // P2 left
    }

    createHole(x, y, z, id, mat) {
        // Bowl-shaped depression
        const outerGeo = new THREE.CylinderGeometry(0.45, 0.35, 0.35, 20);
        const hole = new THREE.Mesh(outerGeo, mat);
        hole.position.set(x, y, z);
        hole.userData = { id, type: 'kampung' };
        this.group.add(hole);
        return hole;
    }

    createStorehouse(x, id, mat) {
        const geo = new THREE.CylinderGeometry(0.9, 0.7, 0.35, 20);
        const store = new THREE.Mesh(geo, mat);
        store.position.set(x, 0.15, 0);
        store.userData = { id, type: 'induk' };
        this.group.add(store);
        return store;
    }

    createCountLabel(text, x, y, z) {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        // Clear
        ctx.clearRect(0, 0, 128, 128);

        // Draw number circle background
        ctx.beginPath();
        ctx.arc(64, 64, 50, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fill();
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Draw number
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 56px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 64, 64);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMat = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false
        });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.position.set(x, y, z);
        sprite.scale.set(0.6, 0.6, 1);
        return sprite;
    }

    updateSeeds(holeValues) {
        // Clear old seeds and labels
        while (this.seedGroup.children.length > 0) {
            this.seedGroup.remove(this.seedGroup.children[0]);
        }
        while (this.labelGroup.children.length > 0) {
            this.labelGroup.remove(this.labelGroup.children[0]);
        }

        holeValues.forEach((gulis, holeIdx) => {
            const count = gulis.length;
            if (count === 0) return;

            const holeMesh = this.holeMeshes[holeIdx];
            const isInduk = holeIdx >= 14;
            const holeRadius = isInduk ? 0.6 : 0.3;
            const holeX = holeMesh.position.x;
            const holeY = holeMesh.position.y;
            const holeZ = holeMesh.position.z;

            // Place seeds inside the hole
            const maxPerLayer = isInduk ? 8 : 5;
            gulis.forEach((type, i) => {
                const layer = Math.floor(i / maxPerLayer);
                const idxInLayer = i % maxPerLayer;
                const seedsInThisLayer = Math.min(maxPerLayer, count - layer * maxPerLayer);

                let sx, sz;
                if (seedsInThisLayer === 1 && layer === 0) {
                    sx = holeX;
                    sz = holeZ;
                } else {
                    const angle = (idxInLayer / seedsInThisLayer) * Math.PI * 2;
                    const r = holeRadius * 0.6;
                    sx = holeX + Math.cos(angle) * r;
                    sz = holeZ + Math.sin(angle) * r;
                }

                const sy = holeY + 0.05 + layer * 0.18;

                // Map type to material index
                let matIdx = 3; // default white/normal
                if (type === 'blue') matIdx = 0;
                else if (type === 'gold') matIdx = 1;
                else if (type === 'red') matIdx = 2;

                const seed = new THREE.Mesh(this.seedGeo, this.seedMats[matIdx]);
                seed.position.set(sx, sy, sz);
                seed.rotation.set(Math.random(), Math.random(), Math.random());
                seed.castShadow = true;
                this.seedGroup.add(seed);
            });

            // Count label floating above hole
            const labelY = holeY + 0.8 + (Math.ceil(count / maxPerLayer) * 0.15);
            // Display internal score for stores (induk) taking gold multipliers into account? 
            // Or just guli count? The prompt says "clear counters", usually it's guli count.
            // Let's just show guli count on board, but use weighted score in HUD.
            const label = this.createCountLabel(String(count), holeX, labelY, holeZ);
            this.labelGroup.add(label);
        });
    }

    highlightHole(holeIdx) {
        // Reset previous highlight
        if (this.highlightedHole !== null && this.holeMeshes[this.highlightedHole]) {
            this.holeMeshes[this.highlightedHole].material.emissive.setHex(0x000000);
        }

        if (holeIdx !== null && this.holeMeshes[holeIdx]) {
            this.holeMeshes[holeIdx].material.emissive.setHex(0x443300);
            this.highlightedHole = holeIdx;
        } else {
            this.highlightedHole = null;
        }
    }

    show() {
        this.scene.add(this.group);
        this.group.position.set(0, 5, 0);
        this.camera.position.set(0, 12, 5);
        this.camera.lookAt(0, 5, 0);
    }

    hide() {
        this.scene.remove(this.group);
        this.highlightedHole = null;
    }
}
