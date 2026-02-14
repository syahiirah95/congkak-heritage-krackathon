export class Story {
    constructor(onComplete) {
        this.onComplete = onComplete;
        this.overlay = document.getElementById('story-overlay');
        this.textElement = document.getElementById('story-text');
        this.nameElement = document.getElementById('story-name');
        this.portraitElement = document.getElementById('story-portrait');
        this.nextBtn = document.getElementById('story-next');
        this.skipBtn = document.getElementById('story-skip');

        this.slides = [
            {
                name: "Tok Aki",
                portrait: "/assets/textures/player/tok_aki_face.png",
                text: "Welcome, young traveler. You have entered the realm of Congkak, where wisdom and strategy reign supreme.",
            },
            {
                name: "Tok Aki",
                portrait: "/assets/textures/player/tok_aki_face.png",
                text: "I am Tok Aki, the guardian of this village. Long ago, the guli (marbles) were used to settle disputes and bring peace.",
            },
            {
                name: "Tok Aki",
                portrait: "/assets/textures/player/tok_aki_face.png",
                text: "But alas! My precious guli collection has been scattered by the winds... hidden behind houses and tucked away in bushes.",
            },
            {
                name: "You",
                portrait: "/assets/textures/player/player_face.png",
                text: "Don't worry, Tok Aki! I'll find them all and return them to you.",
            },
            {
                name: "Tok Aki",
                portrait: "/assets/textures/player/tok_aki_face.png",
                text: "I hope so. Once you collect 10 guli, meet me at the Main Congkak Board. We shall see if you have what it takes to be a master!",
            }
        ];

        this.currentSlide = 0;
        this.nextBtn.onclick = () => this.next();
        if (this.skipBtn) this.skipBtn.onclick = () => this.finish();
    }

    start() {
        this.overlay.classList.remove('hidden');
        this.currentSlide = 0;
        this.showSlide();
    }

    showSlide() {
        const slide = this.slides[this.currentSlide];
        this.nameElement.innerHTML = `<span>${slide.name}</span>`;
        this.portraitElement.src = slide.portrait;
        this.textElement.textContent = '';

        // Typewriter effect
        let i = 0;
        const speed = 25;
        const typeWriter = () => {
            if (i < slide.text.length) {
                this.textElement.textContent += slide.text.charAt(i);
                i++;
                this.timer = setTimeout(typeWriter, speed);
            }
        };
        if (this.timer) clearTimeout(this.timer);
        typeWriter();
    }

    next() {
        this.currentSlide++;
        if (this.currentSlide >= this.slides.length) {
            this.finish();
        } else {
            this.showSlide();
        }
    }

    finish() {
        this.overlay.classList.add('hidden');
        if (this.onComplete) this.onComplete();
    }
}
