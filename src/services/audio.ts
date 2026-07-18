
const SOUNDS = {
    TAP: "https://www.soundjay.com/buttons/button-16.mp3",
    SUCCESS: "https://www.soundjay.com/buttons/button-3.mp3",
    SWOOSH: "https://www.soundjay.com/free-music/iron-man-1.mp3", // Just a placeholder
    NOTIFICATION: "https://www.soundjay.com/buttons/button-09.mp3",
};

class AudioService {
    private enabled: boolean = true;

    play(soundUrl: string, volume: number = 0.2) {
        if (!this.enabled) return;
        try {
            const audio = new Audio(soundUrl);
            audio.volume = volume;
            audio.play().catch(e => console.warn("Audio play blocked by browser:", e));
        } catch (err) {
            console.warn("Audio service error:", err);
        }
    }

    tap() { this.play(SOUNDS.TAP, 0.1); }
    success() { this.play(SOUNDS.SUCCESS, 0.2); }
    swoosh() { this.play(SOUNDS.SWOOSH, 0.15); }
    notify() { this.play(SOUNDS.NOTIFICATION, 0.2); }

    setEnabled(val: boolean) { this.enabled = val; }
}

export const auraAudio = new AudioService();
