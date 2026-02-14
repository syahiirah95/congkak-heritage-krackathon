import * as THREE from 'three';

export class Player {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.textureLoader = new THREE.TextureLoader();

        // Player Group
        this.mesh = new THREE.Group();
        this.createHumanoid();
        this.mesh.position.set(0, 0, 5); // Start away from board/NPCs
        this.scene.add(this.mesh);

        // Movement state
        this.keys = {};
        this.speed = 0.15;
        this.baseSpeed = 0.15;
        this.rotationSpeed = 0.003;

        // Physics/Minecraft-style
        this.velocity = new THREE.Vector3();
        this.isGrounded = true;
        this.gravity = -0.015;
        this.jumpForce = 0.35;
        this.playerHeight = 2.0;

        // Camera parameters (Restored to 3rd Person)
        this.zoomDistance = 6;
        this.minZoom = 3;
        this.maxZoom = 15;
        this.cameraOffset = new THREE.Vector3(0, 3, -this.zoomDistance);
        this.currentCameraPos = new THREE.Vector3();
        this.currentLookAt = new THREE.Vector3();

        // Mouse look state
        this.isPointerLocked = false;
        this.isMouseDown = false;

        this.initInput();
    }

    loadTex(path) {
        const tex = this.textureLoader.load(path);
        tex.colorSpace = THREE.SRGBColorSpace;
        return tex;
    }

    createHumanoid() {
        const shirtTex = this.loadTex('/assets/textures/player/player_shirt.png');
        const skinTex = this.loadTex('/assets/textures/player/player_skin.png');
        const pantsTex = this.loadTex('/assets/textures/player/player_pants.png');
        const faceTex = this.loadTex('/assets/textures/player/player_face.png');

        const bodyMat = new THREE.MeshStandardMaterial({ map: shirtTex, roughness: 0.8 });
        const skinMat = new THREE.MeshStandardMaterial({ map: skinTex, roughness: 0.9 });
        const faceMat = new THREE.MeshStandardMaterial({ map: faceTex, roughness: 0.9 });
        const pantMat = new THREE.MeshStandardMaterial({ map: pantsTex, roughness: 0.8 });

        // Torso
        const torsoGeo = new THREE.BoxGeometry(0.6, 0.8, 0.3);
        const torso = new THREE.Mesh(torsoGeo, bodyMat);
        torso.position.y = 1.3;
        torso.castShadow = true;
        this.mesh.add(torso);

        // Head
        const headGeo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
        const headMats = [skinMat, skinMat, skinMat, skinMat, faceMat, skinMat];
        const head = new THREE.Mesh(headGeo, headMats);
        head.position.y = 1.95;
        head.castShadow = true;
        this.mesh.add(head);

        // Arms/Legs
        const armGeo = new THREE.BoxGeometry(0.2, 0.7, 0.2);
        this.leftArm = new THREE.Mesh(armGeo, bodyMat); this.leftArm.position.set(0.45, 1.35, 0); this.mesh.add(this.leftArm);
        this.rightArm = new THREE.Mesh(armGeo, bodyMat); this.rightArm.position.set(-0.45, 1.35, 0); this.mesh.add(this.rightArm);

        const legGeo = new THREE.BoxGeometry(0.25, 0.8, 0.25);
        this.leftLeg = new THREE.Mesh(legGeo, pantMat); this.leftLeg.position.set(0.2, 0.5, 0); this.mesh.add(this.leftLeg);
        this.rightLeg = new THREE.Mesh(legGeo, pantMat); this.rightLeg.position.set(-0.2, 0.5, 0); this.mesh.add(this.rightLeg);
    }

    initInput() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Space' && this.isGrounded) {
                this.velocity.y = this.jumpForce;
                this.isGrounded = false;
            }
        });
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);

        // Drag to rotate logic
        window.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // Left click
                // Check if we're clicking UI
                if (e.target.closest('.ui-interactable') || e.target.closest('button')) return;
                this.isMouseDown = true;
            }
        });

        window.addEventListener('mouseup', () => {
            this.isMouseDown = false;
        });

        window.addEventListener('mousemove', (e) => {
            // Rotate camera/player only when left mouse is held OR if pointer is locked (optional)
            if (this.isMouseDown || this.isPointerLocked) {
                this.mesh.rotation.y -= e.movementX * this.rotationSpeed;
            }
        });

        const canvas = document.querySelector('#bg');
        // We still allow pointer lock if users WANT it (e.g., clicking on background),
        // but it's no longer the only way to rotate. 
        // Also added a hint to ESC.
        canvas.addEventListener('dblclick', () => {
            if (!this.isPointerLocked) canvas.requestPointerLock();
        });

        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = document.pointerLockElement !== null;
            document.body.classList.toggle('pointer-locked', this.isPointerLocked);
        });

        window.addEventListener('wheel', (e) => {
            this.zoomDistance += e.deltaY * 0.01;
            this.zoomDistance = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoomDistance));
        });
    }


    update(dt, worldProps = []) {
        let moveForward = 0;
        let moveSide = 0;

        if (this.keys['KeyW'] || this.keys['ArrowUp']) moveForward = 1;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) moveForward = -1;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveSide = 1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) moveSide = -1;

        // Apply WASD Movement relative to rotation
        if (moveForward !== 0 || moveSide !== 0) {
            const moveDir = new THREE.Vector3(moveSide, 0, moveForward);
            moveDir.applyQuaternion(this.mesh.quaternion);
            moveDir.normalize();

            // Movement without collision (ghost mode)
            const nextPos = this.mesh.position.clone().addScaledVector(moveDir, this.speed);
            this.mesh.position.copy(nextPos);

            const time = Date.now() * 0.01;
            this.leftLeg.rotation.x = Math.sin(time) * 0.5;
            this.rightLeg.rotation.x = -Math.sin(time) * 0.5;
        } else {
            this.leftLeg.rotation.x = 0;
            this.rightLeg.rotation.x = 0;
        }

        // Apply Minecraft Physics (Gravity & Jump)
        this.velocity.y += this.gravity;
        this.mesh.position.y += this.velocity.y;

        // Ground Collision
        if (this.mesh.position.y <= 0) {
            this.mesh.position.y = 0;
            this.velocity.y = 0;
            this.isGrounded = true;
        }

        this.updateCamera(dt);
    }

    updateCamera(dt) {
        const idealOffset = new THREE.Vector3(0, 3, -this.zoomDistance);
        idealOffset.applyQuaternion(this.mesh.quaternion);
        idealOffset.add(this.mesh.position);

        const idealLookAt = this.mesh.position.clone();
        idealLookAt.y += 1.5;

        const t = 1.0 - Math.pow(0.01, dt);
        this.currentCameraPos.lerp(idealOffset, t);
        this.currentLookAt.lerp(idealLookAt, t);

        this.camera.position.copy(this.currentCameraPos);
        this.camera.lookAt(this.currentLookAt);
    }
}
