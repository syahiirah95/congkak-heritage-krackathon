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
        // All soundtracks removed to prevent lag
        this.bgMusic = null;
        this.ambient = null;
    }

    start() {
        // No audio to start
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        const volume = this.isMuted ? 0 : 1;
        if (this.bgMusic) this.bgMusic.volume = 0.3 * volume;
        if (this.ambient) this.ambient.volume = 0.2 * volume;
    }
}
