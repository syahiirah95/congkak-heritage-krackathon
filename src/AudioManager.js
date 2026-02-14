export class AudioManager {
    constructor() {
        this.bgMusic = null;
        this.ambient = null;
        this.isMuted = false;

        // Using sample URLs for demo purposes
        this.urls = {
            bg: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8a012d4.mp3', // Relaxing track
            ambient: 'https://cdn.pixabay.com/audio/2021/08/04/audio_13b5a1b5c4.mp3' // Forest ambience
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
