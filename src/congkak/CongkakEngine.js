export class CongkakEngine {
    constructor() {
        this.reset();
    }

    reset() {
        // Each hole is an array of guli types: 'normal', 'gold', 'blue'
        this.holes = new Array(16).fill(null).map(() => []);

        // Initial setup: 7 gulis per kampung hole
        for (let i = 0; i < 14; i++) {
            for (let j = 0; j < 7; j++) {
                // Randomly add special gulis (small chance)
                let type = 'normal';
                const rand = Math.random();
                if (rand < 0.1) type = 'gold'; // 10% gold
                else if (rand < 0.15) type = 'blue'; // 5% blue

                this.holes[i].push(type);
            }
        }

        this.currentPlayer = 1;
        this.gameOver = false;
        this.extraTurns = 0; // Granted by blue gulis or landing in store
    }

    getHoleCount(idx) {
        return this.holes[idx].length;
    }

    getScore(playerIdx) {
        const storeIdx = playerIdx === 1 ? 14 : 15;
        // Gold gulis count as 2 points
        return this.holes[storeIdx].reduce((total, type) => total + (type === 'gold' ? 2 : 1), 0);
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
        let p1Store = 14;
        let p2Store = 15;

        yield { holes: [...this.holes], status: 'pickup' };

        while (hand.length > 0) {
            currentPos = (currentPos + 1) % 16;

            // Skip opponent store
            if (this.currentPlayer === 1 && currentPos === p2Store) continue;
            if (this.currentPlayer === 2 && currentPos === p1Store) continue;

            const guli = hand.pop();
            this.holes[currentPos].push(guli);

            // SPECIAL GULI EFFECT: Blue guli gives an immediate extra turn flag
            if (guli === 'blue' && (currentPos === p1Store || currentPos === p2Store)) {
                this.extraTurns++;
            }

            yield { holes: [...this.holes], status: 'dropping', currentPos };

            // Traditional Rules: If last guli lands in a non-empty kampung, continue
            if (hand.length === 0 && currentPos !== p1Store && currentPos !== p2Store && this.getHoleCount(currentPos) > 1) {
                yield { status: 'thinking' };
                hand = [...this.holes[currentPos]];
                this.holes[currentPos] = [];
                yield { holes: [...this.holes], status: 'pickup_continue', currentPos };
            }
        }

        const landedInOwnStore = (this.currentPlayer === 1 && currentPos === p1Store) ||
            (this.currentPlayer === 2 && currentPos === p2Store);

        if (landedInOwnStore) {
            // Landed in own store = extra turn
            this.extraTurns++;
            yield { status: 'extra_turn_bonus' };
        } else {
            // Tembak (Capture) logic: last guli landed in empty hole on own side
            if (this.isOwnHole(currentPos) && this.getHoleCount(currentPos) === 1) {
                const oppositeHole = 13 - currentPos;
                if (this.getHoleCount(oppositeHole) > 0) {
                    const capturedGulis = [...this.holes[oppositeHole], ...this.holes[currentPos]];
                    this.holes[oppositeHole] = [];
                    this.holes[currentPos] = [];
                    const storeIdx = this.currentPlayer === 1 ? p1Store : p2Store;
                    this.holes[storeIdx].push(...capturedGulis);
                    yield { holes: [...this.holes], status: 'capture', currentPos };
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
            holes: [...this.holes],
            currentPlayer: this.currentPlayer,
            gameOver: this.gameOver,
            status: 'end'
        };
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
            // Move remaining to stores
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

    getAIRecommendation() {
        const moves = this.currentPlayer === 1 ? [0, 1, 2, 3, 4, 5, 6] : [7, 8, 9, 10, 11, 12, 13];
        const validMoves = moves.filter(m => this.getHoleCount(m) > 0);

        // Slightly smarter AI: Prefer moves that lead to own store
        for (const m of validMoves) {
            const count = this.getHoleCount(m);
            // If move lands exactly in store
            if ((this.currentPlayer === 2 && (m + count) % 15 === 0)) {
                return m;
            }
        }

        return validMoves[Math.floor(Math.random() * validMoves.length)];
    }
}
