export class Story {
    constructor(onComplete) {
        this.onComplete = onComplete;
        this.overlay = document.getElementById('story-overlay');
        this.textElement = document.getElementById('story-text');
        this.nameElement = document.getElementById('story-name');
        this.portraitElement = document.getElementById('story-portrait');
        this.nextBtn = document.getElementById('story-next');
        this.skipBtn = document.getElementById('story-skip');

        this.defaultSlides = [
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
                name: "Pemain",
                portrait: "/assets/textures/player/player_face.png",
                text: "Don't worry, Tok Aki! I'll find them all and return them to you.",
            },
            {
                name: "Tok Aki",
                portrait: "/assets/textures/player/tok_aki_face.png",
                text: "I hope so. Once you collect 49 guli, meet me at the Main Congkak Board. We shall see if you have what it takes to be a master!",
            }
        ];

        this.slides = this.defaultSlides;
        this.energyReward = 50;
        this.currentSlide = 0;
        this.nextBtn.onclick = () => this.next();
        if (this.skipBtn) this.skipBtn.onclick = () => this.finish();
    }

    start(customSlides = null, energyReward = 50) {
        this.slides = customSlides || this.defaultSlides;
        this.energyReward = energyReward;
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

        // Custom Energy reward for completing the story
        window.dispatchEvent(new CustomEvent('story-complete', { detail: { energyReward: this.energyReward } }));

        // Show reward popup
        const reward = document.createElement('div');
        reward.innerHTML = `⚡ +${this.energyReward} TENAGA`;
        reward.style.cssText = `
            position: fixed;
            top: 30%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(30, 15, 5, 0.9);
            backdrop-filter: blur(10px);
            color: #FFD54F;
            padding: 14px 32px;
            border-radius: 14px;
            font-family: 'Nunito', sans-serif;
            font-size: 1.2rem;
            font-weight: 900;
            letter-spacing: 2px;
            border: 2px solid rgba(255, 184, 0, 0.6);
            box-shadow: 0 0 30px rgba(255, 184, 0, 0.3);
            pointer-events: none;
            z-index: 9999;
            animation: collectPopAnim 1.5s ease-out forwards;
        `;
        document.body.appendChild(reward);
        setTimeout(() => reward.remove(), 1600);

        if (this.onComplete) this.onComplete();
    }
}
