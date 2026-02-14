import * as THREE from 'three';
import { NPC } from './NPC.js';

export class World {
    constructor(scene) {
        this.scene = scene;
        this.textureLoader = new THREE.TextureLoader();
        this.props = [];
        this.hidingSpots = []; // Positions for guli
        this.generateBaseWorld();
    }

    loadTex(path, repeatX, repeatY) {
        const tex = this.textureLoader.load(path);
        tex.colorSpace = THREE.SRGBColorSpace;
        if (repeatX && repeatY) {
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
            tex.repeat.set(repeatX, repeatY);
        }
        return tex;
    }

    generateBaseWorld() {
        this.createSky();
        this.createGround();

        // 2.5D LINEAR VILLAGE: Houses arranged along a side-scrolling path (X axis)
        const housePositions = [
            { x: -20, z: -5 },
            { x: -10, z: -2 },
            { x: 10, z: -3 },
            { x: 25, z: -6 },
            { x: 40, z: -2 }
        ];

        housePositions.forEach(pos => {
            this.createHouse(pos.x, pos.z);
            this.hidingSpots.push(new THREE.Vector3(pos.x, 0.5, pos.z + 2.5));
        });

        // Background Forest (Mario-style backdrop)
        for (let i = 0; i < 40; i++) {
            const tx = (Math.random() - 0.5) * 120;
            const tz = -15 - Math.random() * 20; // Behind the houses
            this.createLowPolyTree(tx, tz);
        }

        // Foreground Trees (for parallax feel)
        for (let i = 0; i < 10; i++) {
            const tx = (Math.random() - 0.5) * 100;
            const tz = 10 + Math.random() * 5; // In front of the path
            this.createLowPolyTree(tx, tz);
        }

        // Bounty Board & Tok Aki: Center of the path
        this.createBountyBoard(0, 0, 0);
        this.createNPC(1.5, 0, 0);

        // Bushes (Hiding spots near the path)
        for (let i = 0; i < 15; i++) {
            const bx = (Math.random() - 0.5) * 80;
            const bz = (Math.random() - 0.5) * 5;
            if (Math.abs(bx) > 3) {
                this.createBush(bx, bz);
                this.hidingSpots.push(new THREE.Vector3(bx, 0.5, bz));
            }
        }

        this.createDirtPaths();
        this.createWell(-5, -5);
        this.createLanterns();
    }

    createSky() {
        const skyTex = this.loadTex('/assets/textures/environment/sky_panorama.png');
        skyTex.mapping = THREE.EquirectangularReflectionMapping;
        this.scene.background = skyTex;
        this.scene.environment = skyTex;
        this.scene.fog = new THREE.FogExp2(0xd4a373, 0.012);
    }

    createGround() {
        const size = 120;
        const grassTex = this.loadTex('/assets/textures/environment/grass_seamless.png', 15, 15);
        const groundGeo = new THREE.PlaneGeometry(size, size);
        const groundMat = new THREE.MeshStandardMaterial({ map: grassTex, roughness: 0.95 });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
    }

    createHouse(x, z) {
        const group = new THREE.Group();

        // Restore High-Quality Textures
        const woodTex = this.loadTex('/assets/textures/environment/wood_planks.png');
        const woodMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.85 });
        const roofTex = this.loadTex('/assets/textures/environment/attap_roof.png');
        const roofMat = new THREE.MeshStandardMaterial({ map: roofTex, roughness: 0.95 });
        const stiltTex = this.loadTex('/assets/textures/environment/bamboo_stilt.png');
        const stiltMat = new THREE.MeshStandardMaterial({ map: stiltTex, roughness: 0.7 });
        const windowTex = this.loadTex('/assets/textures/environment/kampung_window.png');
        const windowMat = new THREE.MeshStandardMaterial({
            map: windowTex,
            transparent: true,
            alphaTest: 0.3,
            side: THREE.DoubleSide
        });

        // Stilts
        const stiltGeo = new THREE.CylinderGeometry(0.1, 0.1, 1.5, 8);
        const offsets = [[1.8, 1.8], [1.8, -1.8], [-1.8, 1.8], [-1.8, -1.8]];
        offsets.forEach(off => {
            const stilt = new THREE.Mesh(stiltGeo, stiltMat);
            stilt.position.set(off[0], 0.75, off[1]);
            group.add(stilt);
        });

        // Body
        const body = new THREE.Mesh(new THREE.BoxGeometry(4, 2.5, 4), woodMat);
        body.position.y = 2.75;
        body.castShadow = true;
        group.add(body);

        // Roof
        const roof = new THREE.Mesh(new THREE.ConeGeometry(3.8, 2.5, 4), roofMat);
        roof.position.y = 5.25;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        group.add(roof);

        // Windows (High-Quality Restoration)
        const windowGeo = new THREE.PlaneGeometry(1.2, 1.2);
        const w1 = new THREE.Mesh(windowGeo, windowMat); w1.position.set(0, 2.8, 2.01); group.add(w1);
        const w2 = new THREE.Mesh(windowGeo, windowMat); w2.position.set(0, 2.8, -2.01); w2.rotation.y = Math.PI; group.add(w2);
        const w3 = new THREE.Mesh(windowGeo, windowMat); w3.position.set(2.01, 2.8, 0); w3.rotation.y = Math.PI / 2; group.add(w3);
        const w4 = new THREE.Mesh(windowGeo, windowMat); w4.position.set(-2.01, 2.8, 0); w4.rotation.y = -Math.PI / 2; group.add(w4);

        group.position.set(x, 0, z);
        group.rotation.y = Math.random() * 0.5;
        this.scene.add(group);
        this.props.push(group);
    }

    createNPC(x, y, z) {
        const tokAki = new NPC(this.scene, this.textureLoader, {
            position: new THREE.Vector3(x, y, z),
            facePath: '/assets/textures/player/tok_aki_face.png',
            shirtPath: '/assets/textures/player/player_shirt.png', // Or a custom aged one if available
            skinPath: '/assets/textures/player/player_skin.png',
            pantsPath: '/assets/textures/player/player_pants.png'
        });
        this.props.push(tokAki.mesh);
    }

    createBountyBoard(x, y, z) {
        const group = new THREE.Group();
        const woodTex = this.loadTex('/assets/textures/environment/wood_planks.png');
        const boardTex = this.loadTex('/assets/textures/environment/bounty_board_texture.png');

        const woodMat = new THREE.MeshStandardMaterial({ map: woodTex });
        const boardMat = new THREE.MeshStandardMaterial({ map: boardTex });

        // Frame
        const board = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.7, 0.2), woodMat);
        board.position.y = 2.5;
        group.add(board);

        // Paper/Content with the generated texture
        const paper = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 2.3), boardMat);
        paper.position.set(0, 2.5, 0.11);
        group.add(paper);

        // Posts
        const postGeo = new THREE.BoxGeometry(0.2, 4, 0.2);
        const p1 = new THREE.Mesh(postGeo, woodMat); p1.position.set(-1.1, 2, 0); group.add(p1);
        const p2 = new THREE.Mesh(postGeo, woodMat); p2.position.set(1.1, 2, 0); group.add(p2);

        group.position.set(x, 0, z);
        this.scene.add(group);
        this.props.push(group);
    }

    createLowPolyTree(x, z) {
        const group = new THREE.Group();
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4d2911 });
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x2d5a27, roughness: 0.8 });

        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 3, 6), trunkMat);
        trunk.position.y = 1.5;
        group.add(trunk);

        const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2, 0), leafMat);
        crown.position.y = 3.5;
        group.add(crown);

        group.position.set(x, 0, z);
        this.scene.add(group);
        this.props.push(group);
    }

    createBush(x, z) {
        const mat = new THREE.MeshStandardMaterial({ color: 0x1e4d1a, roughness: 1.0 });
        const bush = new THREE.Mesh(new THREE.IcosahedronGeometry(0.7, 0), mat);
        bush.position.set(x, 0.35, z);
        this.scene.add(bush);
        this.props.push(bush);
    }

    createDirtPaths() {
        // Simple dirt paths
        const mat = new THREE.MeshStandardMaterial({ color: 0x8b4513, opacity: 0.3, transparent: true });
        const p = new THREE.Mesh(new THREE.PlaneGeometry(4, 20), mat);
        p.rotation.x = -Math.PI / 2;
        p.position.set(0, 0.01, 10);
        this.scene.add(p);
    }

    createWell(x, z) {
        const group = new THREE.Group();
        const stoneTex = this.loadTex('/assets/textures/environment/stone_well.png');
        const stoneMat = new THREE.MeshStandardMaterial({ map: stoneTex });

        const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 1.5, 12), stoneMat);
        cylinder.position.y = 0.75;
        group.add(cylinder);

        const roof = new THREE.Mesh(new THREE.ConeGeometry(1.5, 1, 4), new THREE.MeshStandardMaterial({ color: 0x5a3825 }));
        roof.position.y = 3.5;
        group.add(roof);

        const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.5, 0.15), stoneMat); p1.position.set(1, 2, 0); group.add(p1);
        const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.5, 0.15), stoneMat); p2.position.set(-1, 2, 0); group.add(p2);

        group.position.set(x, 0, z);
        this.scene.add(group);
        this.props.push(group);
    }

    createLanterns() {
        // Create actual lantern posts instead of floating yellow spheres
        const lanternPositions = [
            { x: -15, z: -2 }, { x: -5, z: 2 }, { x: 15, z: 0 }, { x: 30, z: -2 }
        ];

        lanternPositions.forEach(pos => {
            const group = new THREE.Group();
            const pole = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.5, 0.15), new THREE.MeshStandardMaterial({ color: 0x4d2911 }));
            pole.position.y = 1.25;
            group.add(pole);

            // The actual lamp part
            const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.4), new THREE.MeshStandardMaterial({
                color: 0xffffaa,
                emissive: 0xffcc33,
                emissiveIntensity: 2
            }));
            lamp.position.y = 2.5;
            group.add(lamp);

            // Adding a point light for better effect
            const light = new THREE.PointLight(0xffaa00, 10, 8);
            light.position.y = 2.5;
            group.add(light);

            group.position.set(pos.x, 0, pos.z);
            this.scene.add(group);
            this.props.push(group);
        });
    }
}
