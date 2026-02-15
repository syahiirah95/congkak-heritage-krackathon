import * as THREE from 'three';
import { NPC } from './NPC.js';

const ANIMAL_QUOTES = {
    chicken: ["Kwek! Kwek!", "Tok Aki ada guli?", "Mana cacing ni...", "Kwek?", "Jom main Congkak!"],
    cat: ["Meow~", "Nak ikan...", "Purrr...", "Tepi sikit, aku nak tidur.", "Miau!"],
    sheep: ["Mbeee!", "Rumput sedap!", "Mana kambing lain?", "Mbeee~", "Kite geng Tok Aki!"],
    cow: ["Moooo!", "Lembunya!", "Susu segar!", "Moo?", "Rileks la bro."]
};

export class World {
    constructor(scene) {
        this.scene = scene;
        this.textureLoader = new THREE.TextureLoader();
        this.props = [];
        this.animals = [];
        this.npcs = [];
        this.hidingSpots = []; // Positions for guli
        this.animalBubbles = new Map(); // Store DOM elements for bubbles

        // Clean up any stale bubbles from HMR
        document.querySelectorAll('.animal-bubble').forEach(el => el.remove());

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
        });

        // NON-OVERLAPPING HIDING SPOTS
        const minDistance = 3;
        for (let i = 0; i < 250; i++) { // Increased pool for better distribution
            let rx, rz, isTooClose;
            let attempts = 0;

            do {
                rx = (Math.random() - 0.5) * 120;
                rz = (Math.random() - 0.5) * 30;
                isTooClose = this.hidingSpots.some(spot =>
                    Math.sqrt(Math.pow(spot.x - rx, 2) + Math.pow(spot.z - rz, 2)) < minDistance
                );
                attempts++;
            } while (isTooClose && attempts < 10);

            if (!isTooClose) {
                this.hidingSpots.push(new THREE.Vector3(rx, 0.5, rz));
            }
        }
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

        // Bounty Board & Tok Aki: Moved away from center to clear the path
        this.createBountyBoard(-4, 0, -2);
        this.createNPC(4, 0, -2, "Tok Aki", "Kampung Tok Aki");
        for (let i = 0; i < 20; i++) {
            const bx = (Math.random() - 0.5) * 80;
            const bz = (Math.random() - 0.5) * 10;
            if (Math.abs(bx) > 3) {
                this.createBush(bx, bz);
            }
        }

        this.createDirtPaths();
        this.createWell(-5, -5);

        // --- 10 STORY POINTS / LORE NPCs ---
        this.createNPC(-6.5, 0, -5, "Sejarah Perigi");   // 1. Well
        this.createNPC(-32, 0, 5, "Sejarah Tradisi");    // 2. Bushes
        this.createNPC(5, 0, -15, "Seni Ukiran");         // 3. Near wood/house
        this.createNPC(-15, 0, 10, "Ilmu Hisab");         // 4. Open area
        this.createNPC(20, 0, 15, "Guli Kerang");         // 5. Rocks
        this.createNPC(-25, 0, -20, "Lubang Induk");      // 6. Large forest area
        this.createNPC(10, 0, 25, "Hubungan Kasih");      // 7. Garden area
        this.createNPC(-35, 0, -10, "Varia Global");      // 8. Distant path
        this.createNPC(30, 0, -5, "Taktik Apit");         // 9. Edge of village
        // Tok Aki is point #10, created in main.js

        this.createLanterns();

        // --- NEW CONTENT: TRADITIONAL GAME SCENES ---
        this.createGasingArena(-28, 2);
        this.createBatuSerembanArena(18, 1);
        this.createWauDisplay(35, -4);

        // --- NEW CONTENT: ANIMALS ---
        this.createChicken(-12, 3);
        this.createChicken(-30, 4);
        this.createChicken(22, 2);
        this.createCat(8, -2);
        this.createCat(-35, -1);
        this.createSheep(-20, 2);
        this.createSheep(-25, -1);
        this.createCow(30, 1);
        this.createCow(-45, -2);
        this.createBird(-10, 8); // Flying bird
        this.createBird(15, 6);

        // --- ADDITIONAL NPCs ---
        this.createNPC(-26, 0, 3, "Tok Mat"); // Watching Gasing
        this.createNPC(20, 0, 2, "Kak Long"); // Playing Batu Seremban
        this.createNPC(38, 0, -3, "Pak Abu"); // Fixing Wau
    }

    createSky() {
        const skyTex = this.loadTex('/assets/textures/environment/sky_panorama.png');
        skyTex.mapping = THREE.EquirectangularReflectionMapping;
        this.scene.background = skyTex;
        this.scene.environment = skyTex;
        this.scene.fog = new THREE.FogExp2(0xd4a373, 0.0025);
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

        // Windows
        const windowGeo = new THREE.PlaneGeometry(1.2, 1.2);
        // Window 1 is now a DOOR
        const doorGeo = new THREE.BoxGeometry(1.2, 2.0, 0.1);
        const door = new THREE.Mesh(doorGeo, woodMat);
        door.position.set(0, 2.5, 2.0); // Front door
        group.add(door);

        // Add a simple door frame/detail
        const frame = new THREE.Mesh(new THREE.BoxGeometry(1.3, 2.1, 0.05), new THREE.MeshStandardMaterial({ color: 0x3E2723 }));
        frame.position.set(0, 2.5, 1.98);
        group.add(frame);

        const w2 = new THREE.Mesh(windowGeo, windowMat); w2.position.set(0, 2.8, -2.01); w2.rotation.y = Math.PI; group.add(w2);
        const w3 = new THREE.Mesh(windowGeo, windowMat); w3.position.set(2.01, 2.8, 0); w3.rotation.y = Math.PI / 2; group.add(w3);
        const w4 = new THREE.Mesh(windowGeo, windowMat); w4.position.set(-2.01, 2.8, 0); w4.rotation.y = -Math.PI / 2; group.add(w4);

        // Stairs (Wooden planks) - LEGIT CONSTRUCTION
        const stepWidth = 1.4;
        const stepDepth = 0.4;
        const stepHeight = 0.3;
        const numSteps = 5;
        const stairAngle = 38 * (Math.PI / 180); // Roughly 38 degrees

        // Side Beams (Stringers)
        const stringerGeo = new THREE.BoxGeometry(0.1, 0.2, 2.2);
        const stringerMat = new THREE.MeshStandardMaterial({ color: 0x3E2723, roughness: 0.9 });

        const leftStringer = new THREE.Mesh(stringerGeo, stringerMat);
        leftStringer.position.set(-0.7, 0.9, 2.76);
        leftStringer.rotation.x = stairAngle;
        group.add(leftStringer);

        const rightStringer = new THREE.Mesh(stringerGeo, stringerMat);
        rightStringer.position.set(0.7, 0.9, 2.76);
        rightStringer.rotation.x = stairAngle;
        group.add(rightStringer);

        // Steps
        const stepGeo = new THREE.BoxGeometry(stepWidth, 0.1, stepDepth);
        for (let i = 0; i < numSteps; i++) {
            const step = new THREE.Mesh(stepGeo, woodMat);
            // Distribute steps from ground to floor height (1.5m)
            const stepY = (i + 1) * 0.3;
            const stepZ = 3.65 - (i * 0.44);
            step.position.set(0, stepY, stepZ);
            group.add(step);
        }
        group.position.set(x, 0, z);
        group.rotation.y = Math.random() * 0.5;
        this.scene.add(group);
        this.props.push(group);
    }

    createNPC(x, y, z, name, bannerText) {
        const npc = new NPC(this.scene, this.textureLoader, {
            position: new THREE.Vector3(x, y, z),
            name,
            bannerText
        });
        // Show quest marker for all story points
        npc.showQuestMarker();
        this.npcs.push(npc);
        return npc;
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
        // Removed from this.props to allow player to walk through (easier collection)
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

    // --- NEW TRADITIONAL GAME SCENES ---

    createGasingArena(x, z) {
        const group = new THREE.Group();
        // Dirt circle
        const circle = new THREE.Mesh(
            new THREE.CircleGeometry(3, 32),
            new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 1 })
        );
        circle.rotation.x = -Math.PI / 2;
        circle.position.y = 0.02;
        group.add(circle);

        // Gasings (Cones)
        const gasingGeo = new THREE.ConeGeometry(0.3, 0.4, 8);
        const colors = [0xffd700, 0x8b4513, 0xff0000];
        for (let i = 0; i < 3; i++) {
            const gasingTop = new THREE.Mesh(gasingGeo, new THREE.MeshStandardMaterial({ color: colors[i] }));
            const gasingBottom = new THREE.Mesh(gasingGeo, new THREE.MeshStandardMaterial({ color: colors[i] }));
            gasingBottom.rotation.x = Math.PI;

            const gasingGroup = new THREE.Group();
            gasingGroup.add(gasingTop);
            gasingGroup.add(gasingBottom);
            gasingGroup.position.set((Math.random() - 0.5) * 3, 0.3, (Math.random() - 0.5) * 3);
            gasingGroup.rotation.z = Math.random() * 0.2;
            group.add(gasingGroup);
        }

        group.position.set(x, 0, z);
        this.scene.add(group);
        this.props.push(group);
    }

    createBatuSerembanArena(x, z) {
        const group = new THREE.Group();
        // Mat (Tikar)
        const mat = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 2),
            new THREE.MeshStandardMaterial({ color: 0xdaa520, roughness: 1 })
        );
        mat.rotation.x = -Math.PI / 2;
        mat.position.y = 0.02;
        group.add(mat);

        // Small cubes (The stones/seeds)
        const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xffffff];
        for (let i = 0; i < 5; i++) {
            const stone = new THREE.Mesh(
                new THREE.BoxGeometry(0.1, 0.1, 0.1),
                new THREE.MeshStandardMaterial({ color: colors[i] })
            );
            stone.position.set((Math.random() - 0.5) * 1.5, 0.1, (Math.random() - 0.5) * 1.5);
            group.add(stone);
        }

        group.position.set(x, 0, z);
        this.scene.add(group);
        this.props.push(group);
    }

    createWauDisplay(x, z) {
        const group = new THREE.Group();
        // Vertical post
        const pole = new THREE.Mesh(new THREE.BoxGeometry(0.1, 4, 0.1), new THREE.MeshStandardMaterial({ color: 0x4d2911 }));
        pole.position.y = 2;
        group.add(pole);

        // Wau Bulan (The Kite)
        const wauGroup = new THREE.Group();
        const wing = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.05, 8, 4), new THREE.MeshStandardMaterial({ color: 0xff4444 }));
        wing.scale.set(1.5, 1, 1);
        wauGroup.add(wing);

        const body = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.8, 0.05), new THREE.MeshStandardMaterial({ color: 0xffffff }));
        wauGroup.add(body);

        const crescent = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.1, 12, 12, Math.PI), new THREE.MeshStandardMaterial({ color: 0xffd700 }));
        crescent.position.y = -0.5;
        crescent.rotation.z = Math.PI;
        wauGroup.add(crescent);

        wauGroup.position.y = 2.5;
        wauGroup.rotation.z = Math.PI / 4;
        group.add(wauGroup);

        group.position.set(x, 0, z);
        this.scene.add(group);
        this.props.push(group);
    }

    // --- ANIMALS ---

    createChicken(x, z) {
        const group = new THREE.Group();
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.45), new THREE.MeshStandardMaterial({ color: 0xffffff }));
        body.position.y = 0.45;
        group.add(body);

        const head = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.25, 0.2), new THREE.MeshStandardMaterial({ color: 0xffffff }));
        head.position.set(0, 0.7, 0.15);
        group.add(head);

        const beak = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.1, 4), new THREE.MeshStandardMaterial({ color: 0xffaa00 }));
        beak.rotation.x = -Math.PI / 2;
        beak.position.set(0, 0.65, 0.3);
        group.add(beak);

        const crest = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.12, 0.15), new THREE.MeshStandardMaterial({ color: 0xff0000 }));
        crest.position.set(0, 0.85, 0.1);
        group.add(crest);

        // Legs
        const legGeom = new THREE.BoxGeometry(0.05, 0.3, 0.05);
        const legMat = new THREE.MeshStandardMaterial({ color: 0xffaa00 });
        const legL = new THREE.Mesh(legGeom, legMat);
        legL.position.set(0.1, 0.15, 0);
        group.add(legL);
        const legR = new THREE.Mesh(legGeom, legMat);
        legR.position.set(-0.1, 0.15, 0);
        group.add(legR);

        group.position.set(x, 0, z);
        this.scene.add(group);

        // Add movement state
        this.animals.push({
            mesh: group,
            velocity: new THREE.Vector3(),
            timer: 0,
            type: 'chicken'
        });
    }

    createCat(x, z) {
        const group = new THREE.Group();
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 0.5), new THREE.MeshStandardMaterial({ color: 0xff9800 })); // Ginger cat
        body.position.y = 0.25;
        group.add(body);

        const head = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 0.2), new THREE.MeshStandardMaterial({ color: 0xff9800 }));
        head.position.set(0, 0.45, 0.25);
        group.add(head);

        const earL = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.15, 3), new THREE.MeshStandardMaterial({ color: 0xff9800 }));
        earL.position.set(0.08, 0.6, 0.25);
        group.add(earL);
        const earR = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.15, 3), new THREE.MeshStandardMaterial({ color: 0xff9800 }));
        earR.position.set(-0.08, 0.6, 0.25);
        group.add(earR);

        // Tail
        const tail = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.4), new THREE.MeshStandardMaterial({ color: 0xff9800 }));
        tail.position.set(0, 0.4, -0.4);
        tail.rotation.x = 0.5;
        group.add(tail);

        // Legs
        const legMat = new THREE.MeshStandardMaterial({ color: 0xff9800 });
        const legGeom = new THREE.BoxGeometry(0.08, 0.2, 0.08);
        [[-0.1, 0.1, 0.2], [0.1, 0.1, 0.2], [-0.1, 0.1, -0.2], [0.1, 0.1, -0.2]].forEach(p => {
            const leg = new THREE.Mesh(legGeom, legMat);
            leg.position.set(p[0], p[1], p[2]);
            group.add(leg);
        });

        group.position.set(x, 0, z);
        group.rotation.y = Math.random() * Math.PI * 2;
        this.scene.add(group);

        // Add movement state
        this.animals.push({
            mesh: group,
            velocity: new THREE.Vector3(),
            timer: 0,
            type: 'cat'
        });
    }

    createSheep(x, z) {
        const group = new THREE.Group();
        const wool = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.6), new THREE.MeshStandardMaterial({ color: 0xeeeeee }));
        wool.position.y = 0.4;
        group.add(wool);

        const head = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 0.2), new THREE.MeshStandardMaterial({ color: 0x333333 }));
        head.position.set(0, 0.5, 0.35);
        group.add(head);

        // Ears
        const earGeom = new THREE.BoxGeometry(0.1, 0.2, 0.05);
        const earL = new THREE.Mesh(earGeom, new THREE.MeshStandardMaterial({ color: 0x333333 }));
        earL.position.set(0.12, 0.6, 0.35);
        earL.rotation.z = 0.4;
        group.add(earL);
        const earR = new THREE.Mesh(earGeom, new THREE.MeshStandardMaterial({ color: 0x333333 }));
        earR.position.set(-0.12, 0.6, 0.35);
        earR.rotation.z = -0.4;
        group.add(earR);

        // Legs
        const legGeom = new THREE.BoxGeometry(0.12, 0.3, 0.12);
        const lMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        [[-0.15, 0.15, 0.2], [0.15, 0.15, 0.2], [-0.15, 0.15, -0.2], [0.15, 0.15, -0.2]].forEach(p => {
            const leg = new THREE.Mesh(legGeom, lMat);
            leg.position.set(p[0], p[1], p[2]);
            group.add(leg);
        });

        group.position.set(x, 0, z);
        this.scene.add(group);
        this.animals.push({ mesh: group, velocity: new THREE.Vector3(), timer: 0, type: 'sheep' });
    }

    createCow(x, z) {
        const group = new THREE.Group();
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.7, 1.2), new THREE.MeshStandardMaterial({ color: 0xffffff }));
        body.position.y = 0.6;
        group.add(body);

        // Spots
        const spot = new THREE.Mesh(new THREE.BoxGeometry(0.81, 0.4, 0.4), new THREE.MeshStandardMaterial({ color: 0x333333 }));
        spot.position.y = 0.7;
        body.add(spot);

        const head = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.3), new THREE.MeshStandardMaterial({ color: 0xffffff }));
        head.position.set(0, 0.8, 0.7);
        group.add(head);

        const snout = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.2, 0.2), new THREE.MeshStandardMaterial({ color: 0xffcccc }));
        snout.position.set(0, 0.7, 0.9);
        group.add(snout);

        // Horns
        const hornGeom = new THREE.BoxGeometry(0.08, 0.25, 0.08);
        const hMat = new THREE.MeshStandardMaterial({ color: 0xdddddd });
        const hL = new THREE.Mesh(hornGeom, hMat);
        hL.position.set(0.15, 1.05, 0.7);
        group.add(hL);
        const hR = new THREE.Mesh(hornGeom, hMat);
        hR.position.set(-0.15, 1.05, 0.7);
        group.add(hR);

        // Legs
        const legGeom = new THREE.BoxGeometry(0.2, 0.5, 0.2);
        const lMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
        [[-0.3, 0.25, 0.4], [0.3, 0.25, 0.4], [-0.3, 0.25, -0.4], [0.3, 0.25, -0.4]].forEach(p => {
            const leg = new THREE.Mesh(legGeom, lMat);
            leg.position.set(p[0], p[1], p[2]);
            group.add(leg);
        });

        group.position.set(x, 0, z);
        this.scene.add(group);
        this.animals.push({ mesh: group, velocity: new THREE.Vector3(), timer: 0, type: 'cow' });
    }

    createBird(x, z) {
        const group = new THREE.Group();
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.1, 0.2), new THREE.MeshStandardMaterial({ color: 0x3333ff }));
        body.position.y = 3 + Math.random() * 2; // Fly high
        group.add(body);

        const wings = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.02, 0.1), new THREE.MeshStandardMaterial({ color: 0x5555ff }));
        wings.position.set(0, body.position.y, 0);
        group.add(wings);

        const tail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.02, 0.15), new THREE.MeshStandardMaterial({ color: 0x3333ff }));
        tail.position.set(0, body.position.y, -0.15);
        group.add(tail);

        const beak = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.08, 4), new THREE.MeshStandardMaterial({ color: 0xffdd00 }));
        beak.rotation.x = -Math.PI / 2;
        beak.position.set(0, body.position.y, 0.15);
        group.add(beak);

        group.position.set(x, 0, z);
        this.scene.add(group);
        this.animals.push({ mesh: group, velocity: new THREE.Vector3(), timer: 0, type: 'bird', baseHeight: body.position.y });
    }


    update(dt, camera, player) {
        // Update NPCs (for billboarding, etc)
        this.npcs.forEach(npc => npc.update(camera));

        const time = Date.now() * 0.001;
        this.animals.forEach(animal => {
            animal.timer -= dt;
            // Movement speeds
            let speed = 0.03;
            if (animal.type === 'chicken') speed = 0.05;
            if (animal.type === 'cow') speed = 0.02;
            if (animal.type === 'bird') speed = 0.08;

            if (animal.timer <= 0) {
                // Change direction
                const angle = Math.random() * Math.PI * 2;
                animal.mesh.rotation.y = angle;
                animal.velocity.set(Math.sin(angle) * speed, 0, Math.cos(angle) * speed);
                animal.timer = 1 + Math.random() * 3;
            }

            // Move
            if (animal.subType !== 'climber') {
                animal.mesh.position.add(animal.velocity);

                // Boundary check
                if (Math.abs(animal.mesh.position.x) > 50) animal.velocity.x *= -1;
                if (Math.abs(animal.mesh.position.z) > 15) animal.velocity.z *= -1;
            }

            // ANIMATIONS
            if (animal.type === 'chicken') {
                animal.mesh.position.y = Math.abs(Math.sin(Date.now() * 0.01)) * 0.1;
            }
            if (animal.type === 'bird') {
                // Flapping wings and wavy flight
                const wings = animal.mesh.children[1];
                if (wings) wings.rotation.z = Math.sin(Date.now() * 0.02) * 0.5;
                animal.mesh.position.y = animal.baseHeight + Math.sin(Date.now() * 0.005) * 0.5;
            }

            // TOOLTIP AND CATCH LOGIC
            const dist = player.mesh.position.distanceTo(animal.mesh.position);

            // Animals flee from player when nearby
            if (dist < 5 && animal.type !== 'bird') {
                const dir = animal.mesh.position.clone().sub(player.mesh.position).normalize();
                const fleeSpeed = speed * 3;
                animal.velocity.set(dir.x * fleeSpeed, 0, dir.z * fleeSpeed);
                animal.mesh.rotation.y = Math.atan2(dir.x, dir.z);
            }

            // CATCH: Player touches the animal
            if (dist < 1.5 && animal.type !== 'bird') {
                // Remove animal from scene
                this.scene.remove(animal.mesh);
                this.hideAnimalBubble(animal);
                // Dispatch catch event
                window.dispatchEvent(new CustomEvent('animal-caught', { detail: { type: animal.type } }));
                // Mark for removal
                animal.caught = true;
            } else if (dist < 5 && animal.type !== 'bird') {
                this.showAnimalBubble(animal, camera);
            } else {
                this.hideAnimalBubble(animal);
            }
        });

        // Remove caught animals
        this.animals = this.animals.filter(a => !a.caught);
    }

    showAnimalBubble(animal, camera) {
        let bubbleData = this.animalBubbles.get(animal);

        if (!bubbleData) {
            const el = document.createElement('div');
            el.className = 'animal-bubble';
            const quotes = ANIMAL_QUOTES[animal.type];
            el.textContent = quotes[Math.floor(Math.random() * quotes.length)];
            document.body.appendChild(el);

            bubbleData = { el, isHiding: false, timeout: null };
            this.animalBubbles.set(animal, bubbleData);
        }

        if (bubbleData.isHiding) {
            bubbleData.isHiding = false;
            if (bubbleData.timeout) {
                clearTimeout(bubbleData.timeout);
                bubbleData.timeout = null;
            }
        }

        const bubble = bubbleData.el;
        const pos = animal.mesh.position.clone().add(new THREE.Vector3(0, 1.2, 0));
        pos.project(camera);

        const x = (pos.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-(pos.y * 0.5) + 0.5) * window.innerHeight;

        bubble.style.left = `${x}px`;
        bubble.style.top = `${y}px`;
        bubble.style.opacity = '1';
        bubble.style.display = 'block';
    }

    hideAnimalBubble(animal) {
        const bubbleData = this.animalBubbles.get(animal);
        if (bubbleData && !bubbleData.isHiding) {
            bubbleData.isHiding = true;
            bubbleData.el.style.opacity = '0';

            bubbleData.timeout = setTimeout(() => {
                if (bubbleData.el.parentElement) bubbleData.el.remove();
                this.animalBubbles.delete(animal);
            }, 300);
        }
    }
}
