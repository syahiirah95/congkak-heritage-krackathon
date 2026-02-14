export class QuizGame {
    constructor(onComplete) {
        this.onComplete = onComplete;
        this.questions = [
            {
                q: "What is the small hole in a Congkak board called?",
                options: ["Kampung", "Induk", "Lubang", "Pasu"],
                correct: 0
            },
            {
                q: "How many seeds (guli) are usually placed in each small hole at the start?",
                options: ["5", "7", "9", "12"],
                correct: 1
            },
            {
                q: "What is the large hole at the end of the board called?",
                options: ["Kampung", "Induk", "Store", "Goal"],
                correct: 1
            },
            {
                q: "If you land in your own 'Induk', what happens?",
                options: ["Game over", "Lose a turn", "Get an extra turn", "Capture opponent seeds"],
                correct: 2
            },
            {
                q: "Congkak is traditionally played as a ___ player game.",
                options: ["1", "2", "3", "4"],
                correct: 1
            }
        ];
        this.currentIndex = 0;
        this.score = 0;
    }

    start() {
        this.currentIndex = 0;
        this.score = 0;
        document.getElementById('quiz-game').classList.remove('hidden');
        this.showQuestion();
    }

    showQuestion() {
        const question = this.questions[this.currentIndex];
        document.getElementById('quiz-question-num').textContent = `Question ${this.currentIndex + 1}/${this.questions.length}`;
        document.getElementById('quiz-question').textContent = question.q;

        const optionsContainer = document.getElementById('quiz-options');
        optionsContainer.innerHTML = '';

        question.options.forEach((opt, idx) => {
            const btn = document.createElement('div');
            btn.className = 'quiz-option';
            btn.textContent = opt;
            btn.onclick = () => this.handleAnswer(idx);
            optionsContainer.appendChild(btn);
        });
    }

    handleAnswer(idx) {
        if (idx === this.questions[this.currentIndex].correct) {
            this.score += 2; // 2 guli per correct answer
        }

        this.currentIndex++;
        if (this.currentIndex < this.questions.length) {
            this.showQuestion();
        } else {
            this.finish();
        }
    }

    finish() {
        document.getElementById('quiz-game').classList.add('hidden');
        this.onComplete(this.score);
    }
}
