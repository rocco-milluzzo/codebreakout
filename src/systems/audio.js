// CODEBREAKOUT - Audio System
// ============================================================================
// Sound effects using Web Audio API
// ============================================================================

/**
 * Sound definitions
 */
const SOUNDS = {
    brick: { freq: 440, duration: 0.1, type: 'square' },
    paddle: { freq: 220, duration: 0.1, type: 'sine' },
    wall: { freq: 330, duration: 0.05, type: 'triangle' },
    powerup: { freq: 880, duration: 0.2, type: 'sine' },
    shield: { freq: 660, duration: 0.15, type: 'sawtooth' },
    laser: { freq: 1200, duration: 0.08, type: 'sawtooth' },
};

/**
 * Audio manager class
 */
export class AudioManager {
    constructor() {
        this.enabled = true;
        this.audioContext = null;
    }

    /**
     * Get or create audio context
     * @returns {AudioContext|null}
     */
    getAudioContext() {
        if (!this.audioContext) {
            try {
                // @ts-ignore - webkitAudioContext for Safari compatibility
                const AudioContextClass = window.AudioContext || window['webkitAudioContext'];
                this.audioContext = new AudioContextClass();
            } catch (e) {
                // Audio not supported
                return null;
            }
        }
        return this.audioContext;
    }

    /**
     * Play a sound effect
     * @param {string} type - Sound type key
     */
    playSound(type) {
        if (!this.enabled) return;

        const audioCtx = this.getAudioContext();
        if (!audioCtx) return;

        try {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            const sound = SOUNDS[type] || SOUNDS.brick;
            oscillator.type = sound.type;
            oscillator.frequency.setValueAtTime(sound.freq, audioCtx.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + sound.duration);

            oscillator.start();
            oscillator.stop(audioCtx.currentTime + sound.duration);
        } catch (e) {
            // Audio playback failed
        }
    }

    /**
     * Toggle sound on/off
     * @returns {boolean} New enabled state
     */
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    /**
     * Enable sound
     */
    enable() {
        this.enabled = true;
    }

    /**
     * Disable sound
     */
    disable() {
        this.enabled = false;
    }

    /**
     * Check if sound is enabled
     * @returns {boolean}
     */
    isEnabled() {
        return this.enabled;
    }
}

/**
 * Create a new audio manager instance
 * @returns {AudioManager}
 */
export function createAudioManager() {
    return new AudioManager();
}
