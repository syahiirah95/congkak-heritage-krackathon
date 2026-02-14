export class CongkakEngine {
    constructor() {
        this.reset();
    }

    // The correct circular path for Congkak: 
    // P1 Kampung (0-6) -> P1 Store (14) -> P2 Kampung (7-13) -> P2 Store (15)
    static PATH = [0, 1, 2, 3, 4, 5, 6, 14, 7, 8, 9, 10, 11, 12, 13, 15];

    reset(playerInventory = null) {
        this.holes = new Array(16).fill(null).map(() => []);

        if (playerInventory) {
            const guliPool = [];
            for (const [type, count] of Object.entries(playerInventory)) {
                for (let i = 0; i < count; i++) guliPool.push(type);
            }

            // Shuffle for fun
            for (let i = guliPool.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [guliPool[i], guliPool[j]] = [guliPool[j], guliPool[i]];
            }

            // Exactly 7 seeds per hole for Player 1
            for (let i = 0; i < 7; i++) {
                for (let j = 0; j < 7; j++) {
                    this.holes[i].push(guliPool.length > 0 ? guliPool.pop() : 'white');
                }
            }

            // Exactly 7 seeds per hole for AI
            for (let i = 7; i < 14; i++) {
                for (let j = 0; j < 7; j++) {
                    let type = 'white';
                    const rand = Math.random();
                    if (rand < 0.05) type = 'blue';
                    else if (rand < 0.1) type = 'red';
                    else if (rand < 0.2) type = 'yellow';
                    this.holes[i].push(type);
                }
            }
        } else {
            for (let i = 0; i < 14; i++) {
                for (let j = 0; j < 7; j++) {
                    let type = 'white';
                    const rand = Math.random();
                    if (rand < 0.05) type = 'blue';
                    else if (rand < 0.1) type = 'red';
                    else if (rand < 0.2) type = 'yellow';
                    this.holes[i].push(type);
                }
            }
        }

        this.currentPlayer = 1;
        this.gameOver = false;
        this.extraTurns = 0;
    }

    getNextPos(currentPos) {
        const idx = CongkakEngine.PATH.indexOf(currentPos);
        return CongkakEngine.PATH[(idx + 1) % 16];
    }

    getHoleCount(idx) {
        return this.holes[idx].length;
    }

    getScore(playerIdx) {
        const storeIdx = playerIdx === 1 ? 14 : 15;
        return this.holes[storeIdx].reduce((total, type) => {
            if (type === 'black') return total + 5;
            if (type === 'red') return total + 3;
            if (type === 'yellow') return total + 2;
            return total + 1;
        }, 0);
    }

    getPlayerStoreGulis() {
        return this.holes[14];
    }

    isValidMove(holeIdx) {
        if (this.gameOver) return false;
        if (this.currentPlayer === 1 && (holeIdx < 0 || holeIdx > 6)) return false;
        if (this.currentPlayer === 2 && (holeIdx < 7 || holeIdx > 13)) return false;
        if (this.getHoleCount(holeIdx) === 0) return false;
        return true;
    }

    async *makeMoveAnimated(holeIdx) {
        if (!this.isValidMove(holeIdx)) return;

        let hand = [...this.holes[holeIdx]];
        this.holes[holeIdx] = [];
        let currentPos = holeIdx;
        const p1Store = 14;
        const p2Store = 15;

        yield { holes: this.cloneHoles(), status: 'pickup' };

        while (hand.length > 0) {
            currentPos = this.getNextPos(currentPos);

            // Skip opponent store
            if (this.currentPlayer === 1 && currentPos === p2Store) {
                currentPos = this.getNextPos(currentPos);
            }
            if (this.currentPlayer === 2 && currentPos === p1Store) {
                currentPos = this.getNextPos(currentPos);
            }

            const guli = hand.pop();
            this.holes[currentPos].push(guli);

            // SPECIAL GULI EFFECT: Blue guli gives an extra turn when landed in store
            if (guli === 'blue' && (currentPos === p1Store || currentPos === p2Store)) {
                this.extraTurns++;
            }

            yield { holes: this.cloneHoles(), status: 'dropping', currentPos, handCount: hand.length };

            // Traditional Rules (Pusingan): 
            // If last guli lands in a non-empty kampung (either side), pick up all and continue
            if (hand.length === 0 && currentPos !== p1Store && currentPos !== p2Store && this.getHoleCount(currentPos) > 1) {
                yield { status: 'thinking' };
                hand = [...this.holes[currentPos]];
                this.holes[currentPos] = [];
                yield { holes: this.cloneHoles(), status: 'pickup_continue', currentPos, handCount: hand.length };
            }
        }

        const landedInOwnStore = (this.currentPlayer === 1 && currentPos === p1Store) ||
            (this.currentPlayer === 2 && currentPos === p2Store);

        if (landedInOwnStore) {
            this.extraTurns++;
            yield { status: 'extra_turn_bonus' };
        } else {
            // Tembak (Capture) logic: last guli landed in empty hole on OWN side
            if (this.isOwnHole(currentPos) && this.getHoleCount(currentPos) === 1) {
                const oppositeHole = 13 - currentPos;
                if (this.getHoleCount(oppositeHole) > 0) {
                    const capturedGulis = [...this.holes[oppositeHole], ...this.holes[currentPos]];
                    this.holes[oppositeHole] = [];
                    this.holes[currentPos] = [];
                    const storeIdx = this.currentPlayer === 1 ? p1Store : p2Store;
                    this.holes[storeIdx].push(...capturedGulis);
                    yield { holes: this.cloneHoles(), status: 'capture', currentPos };
                }
            }

            // Switch player if no extra turns available
            if (this.extraTurns > 0) {
                this.extraTurns--;
            } else {
                this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
            }
        }

        this.checkGameOver();
        yield {
            holes: this.cloneHoles(),
            currentPlayer: this.currentPlayer,
            gameOver: this.gameOver,
            status: 'end'
        };
    }

    cloneHoles() {
        return this.holes.map(stack => [...stack]);
    }

    isOwnHole(idx) {
        if (this.currentPlayer === 1) return idx >= 0 && idx <= 6;
        return idx >= 7 && idx <= 13;
    }

    checkGameOver() {
        const p1Empty = this.holes.slice(0, 7).every(h => h.length === 0);
        const p2Empty = this.holes.slice(7, 14).every(h => h.length === 0);

        if (p1Empty || p2Empty) {
            this.gameOver = true;
            for (let i = 0; i < 7; i++) {
                this.holes[14].push(...this.holes[i]);
                this.holes[i] = [];
            }
            for (let i = 7; i < 14; i++) {
                this.holes[15].push(...this.holes[i]);
                this.holes[i] = [];
            }
        }
    }

    getAIRecommendation(difficulty = 'normal') {
        const moves = this.currentPlayer === 1 ? [0, 1, 2, 3, 4, 5, 6] : [7, 8, 9, 10, 11, 12, 13];
        const validMoves = moves.filter(m => this.getHoleCount(m) > 0);

        if (validMoves.length === 0) return null;

        if (difficulty === 'easy') {
            return validMoves[Math.floor(Math.random() * validMoves.length)];
        }

        // --- NORMAL & HARD: Prioritize Extra Turns ---
        for (const m of validMoves) {
            const count = this.getHoleCount(m);
            let checkPos = m;
            for (let i = 0; i < count; i++) {
                checkPos = this.getNextPos(checkPos);
                if (this.currentPlayer === 1 && checkPos === 15) checkPos = this.getNextPos(checkPos); // Skip opponent store
                if (this.currentPlayer === 2 && checkPos === 14) checkPos = this.getNextPos(checkPos); // Skip opponent store
            }
            const ownStore = this.currentPlayer === 1 ? 14 : 15;
            if (checkPos === ownStore) return m; // Land in own store
        }

        if (difficulty === 'normal') {
            return validMoves[Math.floor(Math.random() * validMoves.length)];
        }

        // --- HARD: Also look for Capture (Tembak) opportunities ---
        for (const m of validMoves) {
            const count = this.getHoleCount(m);
            if (count === 0) continue; // Should already be filtered by validMoves, but good for safety

            let checkPos = m;
            // Simulate the drops to find the last landing position
            for (let i = 0; i < count; i++) {
                checkPos = this.getNextPos(checkPos);
                if (this.currentPlayer === 1 && checkPos === 15) { // Skip P2 store for P1
                    checkPos = this.getNextPos(checkPos);
                } else if (this.currentPlayer === 2 && checkPos === 14) { // Skip P1 store for P2
                    checkPos = this.getNextPos(checkPos);
                }
            }

            // Check if the last guli lands in an empty hole on AI's side
            const isOwnHole = (this.currentPlayer === 1 && checkPos >= 0 && checkPos <= 6) ||
                (this.currentPlayer === 2 && checkPos >= 7 && checkPos <= 13);

            if (isOwnHole && this.getHoleCount(checkPos) === 0) { // It's empty *before* the current guli lands
                const oppositeHole = 13 - checkPos; // This works for 0-13 symmetric
                if (this.getHoleCount(oppositeHole) > 0) {
                    return m; // Found a capture opportunity
                }
            }
        }

        return validMoves[Math.floor(Math.random() * validMoves.length)];
    }
}
