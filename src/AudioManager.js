export class AudioManager {
    constructor() {
        this.bgMusic = null;
        this.ambient = null;
        this.isMuted = false;

        // Using sample URLs for demo purposes
        this.urls = {
            bg: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Lagu_Padi.ogg',
            ambient: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
        };
    }

    init() {
        this.bgMusic = new Audio(this.urls.bg);
        this.bgMusic.loop = true;
        this.bgMusic.volume = 0.3;

        this.ambient = new Audio(this.urls.ambient);
        this.ambient.loop = true;
        this.ambient.volume = 0.2;
    }

    start() {
        if (!this.bgMusic) this.init();

        // Browsers require user interaction to play audio
        this.bgMusic.play().catch(e => console.warn("Audio play blocked", e));
        this.ambient.play().catch(e => console.warn("Audio play blocked", e));
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        const volume = this.isMuted ? 0 : 1;
        if (this.bgMusic) this.bgMusic.volume = 0.3 * volume;
        if (this.ambient) this.ambient.volume = 0.2 * volume;
    }
}
