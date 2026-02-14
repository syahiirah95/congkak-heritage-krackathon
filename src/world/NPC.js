import * as THREE from 'three';

export class NPC {
    constructor(scene, textureLoader, options = {}) {
        this.scene = scene;
        this.textureLoader = textureLoader;
        this.position = options.position || new THREE.Vector3();
        this.name = options.name || 'NPC';

        this.mesh = new THREE.Group();
        this.createBody(options);
        this.mesh.position.copy(this.position);
        this.scene.add(this.mesh);

        // Quest marker (hidden by default)
        this.questMarker = null;
        this.questActive = false;
    }

    loadTex(path) {
        const tex = this.textureLoader.load(path);
        tex.colorSpace = THREE.SRGBColorSpace;
        return tex;
    }

    createBody(options) {
        // Textures
        let facePath = options.facePath || '/assets/textures/player/player_face.png';
        if (this.name === 'Tok Aki' && !options.facePath) {
            facePath = '/assets/textures/player/tok_aki_face.png';
        }

        const faceTex = this.loadTex(facePath);
        const shirtTex = this.loadTex(options.shirtPath || '/assets/textures/player/player_shirt.png');
        const skinTex = this.loadTex(options.skinPath || '/assets/textures/player/player_skin.png');
        const pantsTex = this.loadTex(options.pantsPath || '/assets/textures/player/player_pants.png');

        const bodyMat = new THREE.MeshStandardMaterial({ map: shirtTex, roughness: 0.8 });
        const skinMat = new THREE.MeshStandardMaterial({ map: skinTex, roughness: 0.9 });
        const faceMat = new THREE.MeshStandardMaterial({ map: faceTex, roughness: 0.9 });
        const pantMat = new THREE.MeshStandardMaterial({ map: pantsTex, roughness: 0.8 });

        // Torso
        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.3), bodyMat);
        torso.position.y = 1.15;
        torso.castShadow = true;
        this.mesh.add(torso);

        // Head
        const headGeo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
        const headMats = [skinMat, skinMat, skinMat, skinMat, faceMat, skinMat];
        const head = new THREE.Mesh(headGeo, headMats);
        head.position.y = 1.75;
        head.castShadow = true;
        this.mesh.add(head);

        // Songkok
        const songkok = new THREE.Mesh(
            new THREE.BoxGeometry(0.42, 0.15, 0.42),
            new THREE.MeshStandardMaterial({ color: 0x111111 })
        );
        songkok.position.y = 1.98;
        this.mesh.add(songkok);

        // Arms
        const armGeo = new THREE.BoxGeometry(0.2, 0.7, 0.2);
        const leftArm = new THREE.Mesh(armGeo, bodyMat);
        leftArm.position.set(0.45, 1.2, 0);
        this.mesh.add(leftArm);
        const rightArm = new THREE.Mesh(armGeo, bodyMat);
        rightArm.position.set(-0.45, 1.2, 0);
        this.mesh.add(rightArm);

        // Hands
        const handGeo = new THREE.BoxGeometry(0.18, 0.2, 0.18);
        const leftHand = new THREE.Mesh(handGeo, skinMat);
        leftHand.position.set(0.45, 0.75, 0);
        this.mesh.add(leftHand);
        const rightHand = new THREE.Mesh(handGeo, skinMat);
        rightHand.position.set(-0.45, 0.75, 0);
        this.mesh.add(rightHand);

        // Legs
        const legGeo = new THREE.BoxGeometry(0.25, 0.75, 0.25);
        const leftLeg = new THREE.Mesh(legGeo, pantMat);
        leftLeg.position.set(0.2, 0.375, 0);
        this.mesh.add(leftLeg);
        const rightLeg = new THREE.Mesh(legGeo, pantMat);
        rightLeg.position.set(-0.2, 0.375, 0);
        this.mesh.add(rightLeg);

        if (options.bannerText) {
            this.createBanner(options.bannerText);
        }
    }

    createBanner(text) {
        // This group will act as the "pivot" above the head
        this.bannerPivot = new THREE.Group();
        this.bannerPivot.position.set(0, 2.8, 0); // Directly above Tok Aki's head
        this.mesh.add(this.bannerPivot);

        // Canvas for Text
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        const bgTex = new Image();
        bgTex.src = '/assets/textures/ui/button_texture.png';
        bgTex.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw original texture
            ctx.drawImage(bgTex, 0, 0, canvas.width, canvas.height);

            // Apply darkening ONLY to the visible pixels (the wood)
            ctx.globalCompositeOperation = 'source-atop';
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Reset to default for text
            ctx.globalCompositeOperation = 'source-over';

            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 100px "Cinzel Decorative", serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = 'rgba(0,0,0,1)';
            ctx.shadowBlur = 10;
            ctx.fillText("KAMPUNG", canvas.width / 2, canvas.height / 2 - 70);
            ctx.fillText("TOK AKI", canvas.width / 2, canvas.height / 2 + 70);
            texture.needsUpdate = true;
        };

        const texture = new THREE.CanvasTexture(canvas);
        texture.anisotropy = 16;

        const boardMat = new THREE.MeshStandardMaterial({
            map: texture,
            side: THREE.DoubleSide,
            transparent: true,
            alphaTest: 0.1,
            roughness: 0.7
        });

        // The board is now centered above the head
        const board = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.2), boardMat);
        board.position.set(0, 0, 0); // Centered on the pivot
        this.bannerPivot.add(board);
        this.bannerBoard = board;
    }

    showQuestMarker() {
        if (this.questMarker) return;
        this.questActive = true;

        // Create "!" canvas
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        // Just the exclamation mark, NO circle
        ctx.fillStyle = '#ff0000'; // Pure Red
        ctx.font = 'bold 120px Nunito, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // Add a subtle white outline to make it pop against any background
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.strokeText('!', 64, 64);
        ctx.fillText('!', 64, 64);

        const texture = new THREE.CanvasTexture(canvas);
        this.questMarker = new THREE.Sprite(new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false
        }));
        this.questMarker.scale.set(0.8, 0.8, 1);
        this.questMarker.position.set(0, 1.4, 0.45); // Depan dada
        this.mesh.add(this.questMarker);
    }

    hideQuestMarker() {
        if (this.questMarker) {
            this.mesh.remove(this.questMarker);
            this.questMarker.material.map.dispose();
            this.questMarker.material.dispose();
            this.questMarker = null;
        }
        this.questActive = false;
    }

    update(camera) {
        if (this.bannerPivot) {
            const pivotPos = new THREE.Vector3();
            this.bannerPivot.getWorldPosition(pivotPos);
            const camPos = new THREE.Vector3();
            camera.getWorldPosition(camPos);
            const angle = Math.atan2(camPos.x - pivotPos.x, camPos.z - pivotPos.z);
            this.bannerPivot.rotation.y = angle;
        }

        // Quest marker bobbing animation
        if (this.questMarker) {
            const t = Date.now() * 0.003;
            this.questMarker.position.y = 1.4 + Math.sin(t) * 0.1;
            // Pulse scale
            const s = 0.8 + Math.sin(t * 2) * 0.05;
            this.questMarker.scale.set(s, s, 1);
        }
    }
}
