import * as THREE from 'three';

export class NPC {
    constructor(scene, textureLoader, options = {}) {
        this.scene = scene;
        this.textureLoader = textureLoader;
        this.position = options.position || new THREE.Vector3();

        this.mesh = new THREE.Group();
        this.createBody(options);
        this.mesh.position.copy(this.position);
        this.scene.add(this.mesh);
    }

    loadTex(path) {
        const tex = this.textureLoader.load(path);
        tex.colorSpace = THREE.SRGBColorSpace;
        return tex;
    }

    createBody(options) {
        // Textures
        const faceTex = this.loadTex(options.facePath || '/assets/textures/player/player_face.png');
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
    }
}
