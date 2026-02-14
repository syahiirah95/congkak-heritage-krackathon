export class Match3Game {
    constructor(onComplete) {
        this.onComplete = onComplete;
        this.gridSize = 8;
        this.types = ['blue', 'yellow', 'red', 'white'];
        this.grid = [];
        this.score = 0;
        this.target = 50;
        this.selectedCell = null;
        this.isAnimating = false;

        this.textures = {
            blue: '/assets/textures/congkak/guli_blue.png',
            yellow: '/assets/textures/congkak/guli_yellow.png',
            red: '/assets/textures/congkak/guli_red.png',
            white: '/assets/textures/congkak/guli_white.png'
        };
    }

    start() {
        this.score = 0;
        this.isAnimating = false;
        this.updateHUD();
        document.getElementById('match3-game').classList.remove('hidden');
        this.initGrid();

        document.getElementById('match3-exit').onclick = () => this.finish();
    }

    initGrid() {
        const container = document.getElementById('match3-grid');
        container.innerHTML = '';
        this.grid = [];

        // Fill grid without initial matches
        for (let r = 0; r < this.gridSize; r++) {
            this.grid[r] = [];
            for (let c = 0; c < this.gridSize; c++) {
                let type;
                do {
                    type = this.types[Math.floor(Math.random() * this.types.length)];
                } while (
                    (r >= 2 && type === this.grid[r - 1][c] && type === this.grid[r - 2][c]) ||
                    (c >= 2 && type === this.grid[r][c - 1] && type === this.grid[r][c - 2])
                );

                this.grid[r][c] = type;
                this.createCellElement(r, c, type, true);
            }
        }
    }

    createCellElement(r, c, type, isNew = false) {
        const container = document.getElementById('match3-grid');
        const cell = document.createElement('div');
        cell.className = 'match3-cell';
        cell.id = `cell-${r}-${c}`;
        cell.dataset.r = r;
        cell.dataset.c = c;

        const img = document.createElement('img');
        img.src = this.textures[type];
        if (isNew) img.classList.add('gem-new');
        cell.appendChild(img);

        cell.onclick = () => this.handleCellClick(r, c, cell);
        container.appendChild(cell);
        return cell;
    }

    async handleCellClick(r, c, el) {
        if (this.isAnimating) return;

        if (!this.selectedCell) {
            this.selectedCell = { r, c, el };
            el.classList.add('selected');
        } else {
            const dr = Math.abs(this.selectedCell.r - r);
            const dc = Math.abs(this.selectedCell.c - c);

            if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) {
                this.isAnimating = true;
                this.selectedCell.el.classList.remove('selected');

                await this.swap(this.selectedCell.r, this.selectedCell.c, r, c);

                const hasMatches = this.findMatches().length > 0;
                if (!hasMatches) {
                    // Swap back if no match
                    await this.swap(this.selectedCell.r, this.selectedCell.c, r, c);
                    this.isAnimating = false;
                } else {
                    await this.processTurn();
                }
            } else {
                this.selectedCell.el.classList.remove('selected');
            }
            this.selectedCell = null;
        }
    }

    async swap(r1, c1, r2, c2) {
        const type1 = this.grid[r1][c1];
        const type2 = this.grid[r2][c2];

        this.grid[r1][c1] = type2;
        this.grid[r2][c2] = type1;

        const el1 = document.getElementById(`cell-${r1}-${c1}`);
        const el2 = document.getElementById(`cell-${r2}-${c2}`);

        // Visual swap
        const img1 = el1.querySelector('img');
        const img2 = el2.querySelector('img');

        img1.src = this.textures[type2];
        img2.src = this.textures[type1];

        return new Promise(resolve => setTimeout(resolve, 200));
    }

    async processTurn() {
        let matches = this.findMatches();
        while (matches.length > 0) {
            this.score += matches.length;
            this.updateHUD();

            // Animate removal
            matches.forEach(coord => {
                const el = document.getElementById(`cell-${coord.r}-${coord.c}`);
                const img = el.querySelector('img');
                img.classList.add('gem-match');
            });

            await new Promise(resolve => setTimeout(resolve, 400));

            // Mark as null in grid
            matches.forEach(coord => {
                this.grid[coord.r][coord.c] = null;
                const el = document.getElementById(`cell-${coord.r}-${coord.c}`);
                el.querySelector('img').style.display = 'none';
                el.querySelector('img').classList.remove('gem-match');
            });

            await this.dropAndFillAnimated();
            matches = this.findMatches();
        }

        if (this.score >= this.target) {
            this.finish();
        }
        this.isAnimating = false;
    }

    findMatches() {
        const matches = [];
        const matchedCells = new Set();

        // Horizontal
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize - 2; c++) {
                const type = this.grid[r][c];
                if (type && type === this.grid[r][c + 1] && type === this.grid[r][c + 2]) {
                    matchedCells.add(`${r},${c}`);
                    matchedCells.add(`${r},${c + 1}`);
                    matchedCells.add(`${r},${c + 2}`);
                    // Check for more
                    let nextC = c + 3;
                    while (nextC < this.gridSize && this.grid[r][nextC] === type) {
                        matchedCells.add(`${r},${nextC}`);
                        nextC++;
                    }
                }
            }
        }

        // Vertical
        for (let c = 0; c < this.gridSize; c++) {
            for (let r = 0; r < this.gridSize - 2; r++) {
                const type = this.grid[r][c];
                if (type && type === this.grid[r + 1][c] && type === this.grid[r + 2][c]) {
                    matchedCells.add(`${r},${c}`);
                    matchedCells.add(`${r + 1},${c}`);
                    matchedCells.add(`${r + 2},${c}`);
                    // Check for more
                    let nextR = r + 3;
                    while (nextR < this.gridSize && this.grid[nextR][c] === type) {
                        matchedCells.add(`${nextR},${c}`);
                        nextR++;
                    }
                }
            }
        }

        matchedCells.forEach(coord => {
            const [r, c] = coord.split(',').map(Number);
            matches.push({ r, c });
        });

        return matches;
    }

    async dropAndFillAnimated() {
        // Drop existing gems
        for (let c = 0; c < this.gridSize; c++) {
            let emptySpaces = 0;
            for (let r = this.gridSize - 1; r >= 0; r--) {
                if (this.grid[r][c] === null) {
                    emptySpaces++;
                } else if (emptySpaces > 0) {
                    // Move gem down in logic
                    this.grid[r + emptySpaces][c] = this.grid[r][c];
                    this.grid[r][c] = null;
                }
            }
            // Fill new gems at top
            for (let r = 0; r < emptySpaces; r++) {
                this.grid[r][c] = this.types[Math.floor(Math.random() * this.types.length)];
            }
        }

        // Parallel update of all cells
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                const type = this.grid[r][c];
                const el = document.getElementById(`cell-${r}-${c}`);
                const img = el.querySelector('img');

                // If it was newly spawned or moved, update image
                // To make it look like dropping, we could do more complex logic, 
                // but for now, just updating the images with a small delay for spawning feel
                img.src = this.textures[type];
                img.style.display = 'block';
            }
        }

        await new Promise(resolve => setTimeout(resolve, 300));
    }

    updateHUD() {
        document.getElementById('match3-target').textContent = `${this.score} / ${this.target}`;
    }

    finish() {
        document.getElementById('match3-game').classList.add('hidden');
        const earnedGuli = Math.min(10, Math.floor(this.score / 5));
        this.onComplete(earnedGuli);
    }
}
