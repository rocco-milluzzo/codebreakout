// CODEBREAKOUT - Enhanced Audio System
// ============================================================================
// Procedural synthwave music + enhanced sound effects using Web Audio API
// ============================================================================

/**
 * Musical scales for procedural generation (pentatonic for easy harmony)
 */
const SCALES = {
    minor: [0, 3, 5, 7, 10, 12, 15, 17, 19, 22, 24],
    major: [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24],
};

/**
 * Base frequencies for different "moods" per level theme
 */
const LEVEL_MOODS = {
    default: { root: 55, scale: 'minor', tempo: 120 },      // A1
    html: { root: 55, scale: 'major', tempo: 110 },         // Warm, welcoming
    css: { root: 62, scale: 'minor', tempo: 115 },          // D#, stylish
    javascript: { root: 65, scale: 'minor', tempo: 130 },   // F, energetic
    python: { root: 58, scale: 'major', tempo: 100 },       // Bb, smooth
    ruby: { root: 73, scale: 'minor', tempo: 125 },         // D, passionate
    java: { root: 49, scale: 'minor', tempo: 105 },         // G, heavy
    assembly: { root: 41, scale: 'minor', tempo: 140 },     // F, intense
};

/**
 * Enhanced sound definitions with multiple layers
 */
const SOUNDS = {
    brick: {
        layers: [
            { freq: 440, duration: 0.08, type: 'square', gain: 0.08 },
            { freq: 880, duration: 0.05, type: 'sine', gain: 0.04 },
        ],
        pitchVar: 50,
    },
    brickStrong: {
        layers: [
            { freq: 330, duration: 0.12, type: 'square', gain: 0.1 },
            { freq: 165, duration: 0.15, type: 'triangle', gain: 0.06 },
        ],
        pitchVar: 30,
    },
    brickExplode: {
        layers: [
            { freq: 80, duration: 0.3, type: 'sawtooth', gain: 0.12 },
            { freq: 120, duration: 0.2, type: 'square', gain: 0.08 },
            { freq: 200, duration: 0.15, type: 'triangle', gain: 0.05 },
        ],
        pitchVar: 20,
        sweep: true,
    },
    paddle: {
        layers: [
            { freq: 220, duration: 0.08, type: 'sine', gain: 0.1 },
            { freq: 440, duration: 0.04, type: 'triangle', gain: 0.05 },
        ],
        pitchVar: 20,
    },
    wall: {
        layers: [
            { freq: 280, duration: 0.04, type: 'triangle', gain: 0.06 },
        ],
        pitchVar: 40,
    },
    powerupGood: {
        layers: [
            { freq: 523, duration: 0.1, type: 'sine', gain: 0.08 },
            { freq: 659, duration: 0.1, type: 'sine', gain: 0.06, delay: 0.05 },
            { freq: 784, duration: 0.15, type: 'sine', gain: 0.05, delay: 0.1 },
        ],
        pitchVar: 0,
    },
    powerupBad: {
        layers: [
            { freq: 200, duration: 0.15, type: 'sawtooth', gain: 0.08 },
            { freq: 150, duration: 0.2, type: 'square', gain: 0.06, delay: 0.05 },
        ],
        pitchVar: 10,
    },
    shield: {
        layers: [
            { freq: 660, duration: 0.12, type: 'sine', gain: 0.07 },
            { freq: 990, duration: 0.08, type: 'triangle', gain: 0.04 },
        ],
        pitchVar: 30,
    },
    laser: {
        layers: [
            { freq: 1800, duration: 0.06, type: 'sawtooth', gain: 0.05 },
            { freq: 900, duration: 0.08, type: 'square', gain: 0.03 },
        ],
        pitchVar: 200,
        sweep: true,
    },
    combo: {
        layers: [
            { freq: 440, duration: 0.15, type: 'sine', gain: 0.1 },
            { freq: 554, duration: 0.15, type: 'sine', gain: 0.08, delay: 0.05 },
            { freq: 659, duration: 0.2, type: 'sine', gain: 0.06, delay: 0.1 },
        ],
        pitchVar: 0,
    },
    comboMilestone: {
        layers: [
            { freq: 880, duration: 0.08, type: 'sine', gain: 0.12 },
            { freq: 1320, duration: 0.1, type: 'sine', gain: 0.08, delay: 0.04 },
        ],
        pitchVar: 0,
    },
    levelUp: {
        layers: [
            { freq: 392, duration: 0.12, type: 'sine', gain: 0.1 },
            { freq: 494, duration: 0.12, type: 'sine', gain: 0.08, delay: 0.1 },
            { freq: 587, duration: 0.12, type: 'sine', gain: 0.07, delay: 0.2 },
            { freq: 784, duration: 0.25, type: 'sine', gain: 0.1, delay: 0.3 },
        ],
        pitchVar: 0,
    },
    gameOver: {
        layers: [
            { freq: 392, duration: 0.3, type: 'sawtooth', gain: 0.08 },
            { freq: 311, duration: 0.3, type: 'sawtooth', gain: 0.06, delay: 0.15 },
            { freq: 261, duration: 0.5, type: 'sawtooth', gain: 0.05, delay: 0.3 },
        ],
        pitchVar: 0,
    },
    extraLife: {
        layers: [
            { freq: 523, duration: 0.1, type: 'sine', gain: 0.12 },
            { freq: 659, duration: 0.1, type: 'sine', gain: 0.1, delay: 0.08 },
            { freq: 784, duration: 0.1, type: 'sine', gain: 0.08, delay: 0.16 },
            { freq: 1047, duration: 0.2, type: 'sine', gain: 0.1, delay: 0.24 },
        ],
        pitchVar: 0,
    },
};

/**
 * Audio manager class with procedural music
 */
export class AudioManager {
    constructor() {
        this.enabled = true;
        this.musicEnabled = true;
        this.masterVolume = 0.7;
        this.musicVolume = 0.3;  // 30% default, matches UI slider
        this.sfxVolume = 0.5;    // 50% default, matches UI slider
        this.audioContext = null;

        // Music state
        this.musicPlaying = false;
        this.currentMood = LEVEL_MOODS.default;
        this.intensity = 0.3; // 0-1, increases with combo
        this.musicNodes = {};
        this.nextBeatTime = 0;
        this.schedulerTimer = null;
        this.currentBeat = 0;

        // Look-ahead scheduling (in seconds)
        this.scheduleAheadTime = 0.1;
        this.schedulerInterval = 25; // ms between scheduler calls

        // Arpeggio pattern
        this.arpPattern = [0, 2, 4, 5, 4, 2];
        this.arpIndex = 0;

        // For smooth transitions
        this.targetIntensity = 0.3;

        // Pre-allocated noise buffers (created on first use)
        this.snareBuffer = null;
        this.hihatBuffer = null;
    }

    /**
     * Get or create audio context
     * @returns {AudioContext|null}
     */
    getAudioContext() {
        if (!this.audioContext) {
            try {
                const AudioContextClass = window.AudioContext || window['webkitAudioContext'];
                this.audioContext = new AudioContextClass();
            } catch (e) {
                return null;
            }
        }
        // Resume if suspended (autoplay policy)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        return this.audioContext;
    }

    /**
     * Create a filter for synth sounds
     */
    createFilter(audioCtx, type = 'lowpass', freq = 2000) {
        const filter = audioCtx.createBiquadFilter();
        filter.type = type;
        filter.frequency.value = freq;
        filter.Q.value = 1;
        return filter;
    }

    /**
     * Create reverb effect
     */
    createReverb(audioCtx, duration = 1.5) {
        const convolver = audioCtx.createConvolver();
        const rate = audioCtx.sampleRate;
        const length = rate * duration;
        const impulse = audioCtx.createBuffer(2, length, rate);

        for (let channel = 0; channel < 2; channel++) {
            const data = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
            }
        }
        convolver.buffer = impulse;
        return convolver;
    }

    /**
     * Play a layered sound effect
     * @param {string} type - Sound type key
     * @param {object} options - Additional options
     */
    playSound(type, options = {}) {
        if (!this.enabled) return;

        const audioCtx = this.getAudioContext();
        if (!audioCtx) return;

        const sound = SOUNDS[type] || SOUNDS.brick;
        const volume = this.masterVolume * this.sfxVolume * (options.volume || 1);

        try {
            sound.layers.forEach(layer => {
                const delay = layer.delay || 0;
                const startTime = audioCtx.currentTime + delay;

                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                const filter = this.createFilter(audioCtx, 'lowpass', 3000 + this.intensity * 2000);

                oscillator.connect(filter);
                filter.connect(gainNode);
                gainNode.connect(audioCtx.destination);

                // Apply pitch variation
                let freq = layer.freq;
                if (sound.pitchVar) {
                    freq += (Math.random() - 0.5) * sound.pitchVar;
                }
                // Pitch based on combo - increases more dramatically with higher combos
                // comboBonus is (multiplier - 1), so at 2x multiplier it's 1, at 5x it's 4
                if (options.comboBonus && options.comboBonus > 0) {
                    // Pitch increases by semitones: +1 semitone at 2x, +2 at 3x, etc.
                    // Each semitone is 2^(1/12) ≈ 1.0595
                    const semitones = Math.min(options.comboBonus * 2, 12); // Cap at 12 semitones (1 octave)
                    freq *= Math.pow(2, semitones / 12);
                }

                oscillator.type = layer.type;
                oscillator.frequency.setValueAtTime(freq, startTime);

                // Frequency sweep for explosions/lasers
                if (sound.sweep) {
                    oscillator.frequency.exponentialRampToValueAtTime(
                        freq * 0.3,
                        startTime + layer.duration
                    );
                }

                const layerGain = layer.gain * volume;
                gainNode.gain.setValueAtTime(layerGain, startTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + layer.duration);

                oscillator.start(startTime);
                oscillator.stop(startTime + layer.duration + 0.01);
            });
        } catch (e) {
            // Audio playback failed
        }
    }

    /**
     * Set music mood based on level
     * @param {string} levelName - Level name (lowercase)
     */
    setMood(levelName) {
        const name = levelName?.toLowerCase() || 'default';
        this.currentMood = LEVEL_MOODS[name] || LEVEL_MOODS.default;

        // Update tempo if music is playing
        if (this.schedulerTimer) {
            clearInterval(this.schedulerTimer);
            this.startMusicLoop();
        }
    }

    /**
     * Set music intensity based on gameplay (combo, danger, etc.)
     * @param {number} intensity - 0 to 1
     */
    setIntensity(intensity) {
        this.targetIntensity = Math.max(0, Math.min(1, intensity));
    }

    /**
     * Create pre-allocated noise buffers
     */
    createNoiseBuffers(audioCtx) {
        if (!this.snareBuffer) {
            const snareSize = Math.floor(audioCtx.sampleRate * 0.1);
            this.snareBuffer = audioCtx.createBuffer(1, snareSize, audioCtx.sampleRate);
            const snareData = this.snareBuffer.getChannelData(0);
            for (let i = 0; i < snareSize; i++) {
                snareData[i] = Math.random() * 2 - 1;
            }
        }
        if (!this.hihatBuffer) {
            const hihatSize = Math.floor(audioCtx.sampleRate * 0.05);
            this.hihatBuffer = audioCtx.createBuffer(1, hihatSize, audioCtx.sampleRate);
            const hihatData = this.hihatBuffer.getChannelData(0);
            for (let i = 0; i < hihatSize; i++) {
                hihatData[i] = Math.random() * 2 - 1;
            }
        }
    }

    /**
     * Start the procedural music
     */
    startMusic() {
        if (!this.musicEnabled || this.musicPlaying) return;

        const audioCtx = this.getAudioContext();
        if (!audioCtx) return;

        // Pre-create noise buffers
        this.createNoiseBuffers(audioCtx);

        this.musicPlaying = true;
        this.nextBeatTime = audioCtx.currentTime;
        this.startMusicLoop();
    }

    /**
     * Internal music loop using look-ahead scheduling
     */
    startMusicLoop() {
        if (this.schedulerTimer) {
            clearInterval(this.schedulerTimer);
        }

        const beatDuration = 60 / this.currentMood.tempo / 2; // Sixteenth notes

        // Scheduler function - schedules notes ahead of time
        const scheduler = () => {
            if (!this.musicPlaying || !this.musicEnabled) return;

            const audioCtx = this.audioContext;
            if (!audioCtx) return;

            // Schedule all beats that fall within the look-ahead window
            while (this.nextBeatTime < audioCtx.currentTime + this.scheduleAheadTime) {
                // Smooth intensity transition
                this.intensity += (this.targetIntensity - this.intensity) * 0.1;

                this.playMusicBeat(this.nextBeatTime);
                this.currentBeat = (this.currentBeat + 1) % 32;
                this.nextBeatTime += beatDuration;
            }
        };

        // Run scheduler at regular intervals
        this.schedulerTimer = setInterval(scheduler, this.schedulerInterval);
    }

    /**
     * Play a single beat of procedural music at scheduled time
     */
    playMusicBeat(time) {
        const audioCtx = this.audioContext;
        if (!audioCtx) return;

        const mood = this.currentMood;
        const scale = SCALES[mood.scale];
        const root = mood.root;
        const volume = this.masterVolume * this.musicVolume;
        const beat = this.currentBeat;

        try {
            // Bass drum on beats 0, 8, 16, 24
            if (beat % 8 === 0 && this.intensity > 0.2) {
                this.playDrum(audioCtx, 'kick', volume * 0.6, time);
            }

            // Snare/clap on beats 4, 12, 20, 28
            if (beat % 8 === 4 && this.intensity > 0.3) {
                this.playDrum(audioCtx, 'snare', volume * 0.4, time);
            }

            // Hi-hat pattern
            if (this.intensity > 0.4 && beat % 2 === 0) {
                this.playDrum(audioCtx, 'hihat', volume * 0.15 * this.intensity, time);
            }

            // Bass line on beats 0, 6, 8, 14, 16, 22, 24, 30
            if ([0, 6, 8, 14, 16, 22, 24, 30].includes(beat)) {
                const bassNote = scale[beat % 3] || 0;
                this.playBass(audioCtx, root * Math.pow(2, bassNote / 12), volume * 0.35, time);
            }

            // Arpeggio - more active with higher intensity
            if (this.intensity > 0.3) {
                const arpFreq = beat % Math.max(1, Math.floor(4 - this.intensity * 3));
                if (arpFreq === 0) {
                    const noteIndex = scale[this.arpPattern[this.arpIndex]];
                    const freq = root * 2 * Math.pow(2, noteIndex / 12);
                    this.playArp(audioCtx, freq, volume * 0.12 * this.intensity, time);
                    this.arpIndex = (this.arpIndex + 1) % this.arpPattern.length;
                }
            }

            // Pad chord - plays softly in background
            if (beat === 0 && this.intensity > 0.2) {
                this.playPad(audioCtx, root, scale, volume * 0.08, time);
            }

        } catch (e) {
            // Music playback failed
        }
    }

    /**
     * Play a drum sound at scheduled time
     */
    playDrum(audioCtx, type, volume, time) {
        if (!audioCtx) return;

        try {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            if (type === 'kick') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(150, time);
                osc.frequency.exponentialRampToValueAtTime(40, time + 0.1);
                gain.gain.setValueAtTime(volume, time);
                gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
                osc.start(time);
                osc.stop(time + 0.2);
            } else if (type === 'snare') {
                // Use pre-allocated noise buffer
                if (!this.snareBuffer) return;
                const noise = audioCtx.createBufferSource();
                noise.buffer = this.snareBuffer;
                const noiseGain = audioCtx.createGain();
                const filter = audioCtx.createBiquadFilter();
                filter.type = 'highpass';
                filter.frequency.value = 1000;
                noise.connect(filter);
                filter.connect(noiseGain);
                noiseGain.connect(audioCtx.destination);
                noiseGain.gain.setValueAtTime(volume * 0.8, time);
                noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
                noise.start(time);
                noise.stop(time + 0.1);

                // Body
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(200, time);
                gain.gain.setValueAtTime(volume * 0.5, time);
                gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
                osc.start(time);
                osc.stop(time + 0.08);
            } else if (type === 'hihat') {
                // Use pre-allocated noise buffer
                if (!this.hihatBuffer) return;
                const noise = audioCtx.createBufferSource();
                noise.buffer = this.hihatBuffer;
                const filter = audioCtx.createBiquadFilter();
                filter.type = 'highpass';
                filter.frequency.value = 7000;
                noise.connect(filter);
                filter.connect(gain);
                gain.connect(audioCtx.destination);
                gain.gain.setValueAtTime(volume, time);
                gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
                noise.start(time);
                noise.stop(time + 0.05);
                return; // Don't start the oscillator
            }
        } catch (e) {
            // Audio playback failed silently
        }
    }

    /**
     * Play bass note at scheduled time
     */
    playBass(audioCtx, freq, volume, time) {
        if (!audioCtx) return;

        try {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            const filter = this.createFilter(audioCtx, 'lowpass', 400);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, time);
            gain.gain.setValueAtTime(volume, time);
            gain.gain.setValueAtTime(volume, time + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

            osc.start(time);
            osc.stop(time + 0.25);
        } catch (e) {
            // Audio playback failed silently
        }
    }

    /**
     * Play arpeggio note at scheduled time
     */
    playArp(audioCtx, freq, volume, time) {
        if (!audioCtx) return;

        try {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            const filter = this.createFilter(audioCtx, 'lowpass', 2000 + this.intensity * 3000);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);

            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, time);
            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(volume, time + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

            osc.start(time);
            osc.stop(time + 0.15);
        } catch (e) {
            // Audio playback failed silently
        }
    }

    /**
     * Play pad chord at scheduled time
     */
    playPad(audioCtx, root, scale, volume, time) {
        if (!audioCtx) return;

        const chordNotes = [0, 2, 4]; // Root, third, fifth from scale

        chordNotes.forEach((noteIdx) => {
            try {
                const freq = root * Math.pow(2, scale[noteIdx] / 12);

                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                const filter = this.createFilter(audioCtx, 'lowpass', 800);

                osc.connect(filter);
                filter.connect(gain);
                gain.connect(audioCtx.destination);

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, time);

                // Slow attack, long sustain
                gain.gain.setValueAtTime(0, time);
                gain.gain.linearRampToValueAtTime(volume, time + 0.3);
                gain.gain.setValueAtTime(volume, time + 1.5);
                gain.gain.exponentialRampToValueAtTime(0.001, time + 2.5);

                osc.start(time);
                osc.stop(time + 2.5);
            } catch (e) {
                // Audio playback failed silently
            }
        });
    }

    /**
     * Stop the music
     */
    stopMusic() {
        this.musicPlaying = false;
        if (this.schedulerTimer) {
            clearInterval(this.schedulerTimer);
            this.schedulerTimer = null;
        }
    }

    /**
     * Toggle sound on/off
     * @returns {boolean} New enabled state
     */
    toggle() {
        this.enabled = !this.enabled;
        if (!this.enabled) {
            this.stopMusic();
        }
        return this.enabled;
    }

    /**
     * Toggle music on/off
     * @returns {boolean} New music enabled state
     */
    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        if (!this.musicEnabled) {
            this.stopMusic();
        } else if (this.enabled) {
            this.startMusic();
        }
        return this.musicEnabled;
    }

    /**
     * Set master volume
     * @param {number} volume - 0 to 1
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }

    /**
     * Set music volume
     * @param {number} volume - 0 to 1
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
    }

    /**
     * Set SFX volume
     * @param {number} volume - 0 to 1
     */
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }

    /**
     * Get current volumes
     */
    getVolumes() {
        return {
            master: this.masterVolume,
            music: this.musicVolume,
            sfx: this.sfxVolume,
        };
    }

    /**
     * Check if sound is enabled
     * @returns {boolean}
     */
    isEnabled() {
        return this.enabled;
    }

    /**
     * Check if music is enabled
     * @returns {boolean}
     */
    isMusicEnabled() {
        return this.musicEnabled;
    }

    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
        this.stopMusic();
    }
}

/**
 * Create a new audio manager instance
 * @returns {AudioManager}
 */
export function createAudioManager() {
    return new AudioManager();
}
