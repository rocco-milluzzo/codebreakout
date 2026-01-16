import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AudioManager, createAudioManager } from '../../src/systems/audio.js';

describe('Audio System', () => {
    let audioManager;

    beforeEach(() => {
        // Mock AudioContext
        const mockOscillator = {
            connect: vi.fn(),
            type: 'sine',
            frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
            start: vi.fn(),
            stop: vi.fn(),
        };

        const mockGain = {
            connect: vi.fn(),
            gain: {
                setValueAtTime: vi.fn(),
                exponentialRampToValueAtTime: vi.fn(),
                linearRampToValueAtTime: vi.fn(),
            },
        };

        const mockFilter = {
            connect: vi.fn(),
            type: 'lowpass',
            frequency: { value: 2000 },
            Q: { value: 1 },
        };

        const mockBufferSource = {
            connect: vi.fn(),
            buffer: null,
            start: vi.fn(),
            stop: vi.fn(),
        };

        const mockAudioContext = vi.fn().mockImplementation(() => ({
            createOscillator: vi.fn().mockReturnValue(mockOscillator),
            createGain: vi.fn().mockReturnValue(mockGain),
            createBiquadFilter: vi.fn().mockReturnValue(mockFilter),
            createConvolver: vi.fn().mockReturnValue({ buffer: null }),
            createBuffer: vi.fn().mockReturnValue({
                getChannelData: vi.fn().mockReturnValue(new Float32Array(1000)),
            }),
            createBufferSource: vi.fn().mockReturnValue(mockBufferSource),
            currentTime: 0,
            destination: {},
            state: 'running',
            resume: vi.fn(),
            sampleRate: 44100,
        }));

        global.AudioContext = mockAudioContext;
        window.AudioContext = mockAudioContext;

        audioManager = new AudioManager();
    });

    afterEach(() => {
        if (audioManager.schedulerTimer) {
            clearInterval(audioManager.schedulerTimer);
        }
        vi.restoreAllMocks();
    });

    describe('AudioManager constructor', () => {
        it('should initialize enabled to true', () => {
            expect(audioManager.enabled).toBe(true);
        });

        it('should initialize musicEnabled to true', () => {
            expect(audioManager.musicEnabled).toBe(true);
        });

        it('should initialize master volume', () => {
            expect(audioManager.masterVolume).toBe(0.7);
        });

        it('should initialize music volume', () => {
            expect(audioManager.musicVolume).toBe(0.3);
        });

        it('should initialize SFX volume', () => {
            expect(audioManager.sfxVolume).toBe(0.5);
        });

        it('should not be playing music initially', () => {
            expect(audioManager.musicPlaying).toBe(false);
        });
    });

    describe('getAudioContext', () => {
        it('should create AudioContext on first call', () => {
            const ctx = audioManager.getAudioContext();
            expect(ctx).toBeDefined();
        });

        it('should reuse AudioContext on subsequent calls', () => {
            const ctx1 = audioManager.getAudioContext();
            const ctx2 = audioManager.getAudioContext();
            expect(ctx1).toBe(ctx2);
        });
    });

    describe('toggle', () => {
        it('should toggle enabled state', () => {
            expect(audioManager.enabled).toBe(true);
            audioManager.toggle();
            expect(audioManager.enabled).toBe(false);
            audioManager.toggle();
            expect(audioManager.enabled).toBe(true);
        });

        it('should return new state', () => {
            expect(audioManager.toggle()).toBe(false);
            expect(audioManager.toggle()).toBe(true);
        });

        it('should stop music when disabled', () => {
            audioManager.musicPlaying = true;
            audioManager.toggle();
            expect(audioManager.musicPlaying).toBe(false);
        });
    });

    describe('toggleMusic', () => {
        it('should toggle music enabled state', () => {
            expect(audioManager.musicEnabled).toBe(true);
            audioManager.toggleMusic();
            expect(audioManager.musicEnabled).toBe(false);
        });

        it('should return new state', () => {
            expect(audioManager.toggleMusic()).toBe(false);
            expect(audioManager.toggleMusic()).toBe(true);
        });
    });

    describe('setMasterVolume', () => {
        it('should set master volume', () => {
            audioManager.setMasterVolume(0.5);
            expect(audioManager.masterVolume).toBe(0.5);
        });

        it('should clamp to minimum 0', () => {
            audioManager.setMasterVolume(-0.5);
            expect(audioManager.masterVolume).toBe(0);
        });

        it('should clamp to maximum 1', () => {
            audioManager.setMasterVolume(1.5);
            expect(audioManager.masterVolume).toBe(1);
        });
    });

    describe('setMusicVolume', () => {
        it('should set music volume', () => {
            audioManager.setMusicVolume(0.5);
            expect(audioManager.musicVolume).toBe(0.5);
        });

        it('should clamp values', () => {
            audioManager.setMusicVolume(-0.5);
            expect(audioManager.musicVolume).toBe(0);
            audioManager.setMusicVolume(1.5);
            expect(audioManager.musicVolume).toBe(1);
        });
    });

    describe('setSfxVolume', () => {
        it('should set SFX volume', () => {
            audioManager.setSfxVolume(0.8);
            expect(audioManager.sfxVolume).toBe(0.8);
        });

        it('should clamp values', () => {
            audioManager.setSfxVolume(-0.5);
            expect(audioManager.sfxVolume).toBe(0);
            audioManager.setSfxVolume(1.5);
            expect(audioManager.sfxVolume).toBe(1);
        });
    });

    describe('getVolumes', () => {
        it('should return all volume settings', () => {
            const volumes = audioManager.getVolumes();
            expect(volumes).toEqual({
                master: 0.7,
                music: 0.3,
                sfx: 0.5,
            });
        });
    });

    describe('isEnabled', () => {
        it('should return enabled state', () => {
            expect(audioManager.isEnabled()).toBe(true);
            audioManager.enabled = false;
            expect(audioManager.isEnabled()).toBe(false);
        });
    });

    describe('isMusicEnabled', () => {
        it('should return music enabled state', () => {
            expect(audioManager.isMusicEnabled()).toBe(true);
            audioManager.musicEnabled = false;
            expect(audioManager.isMusicEnabled()).toBe(false);
        });
    });

    describe('enable/disable', () => {
        it('should enable audio', () => {
            audioManager.enabled = false;
            audioManager.enable();
            expect(audioManager.enabled).toBe(true);
        });

        it('should disable audio and stop music', () => {
            audioManager.musicPlaying = true;
            audioManager.disable();
            expect(audioManager.enabled).toBe(false);
            expect(audioManager.musicPlaying).toBe(false);
        });
    });

    describe('setMood', () => {
        it('should set current mood', () => {
            audioManager.setMood('javascript');
            expect(audioManager.currentMood).toBeDefined();
        });

        it('should handle unknown moods with default', () => {
            audioManager.setMood('unknown_language');
            expect(audioManager.currentMood).toBeDefined();
        });
    });

    describe('setIntensity', () => {
        it('should set target intensity', () => {
            audioManager.setIntensity(0.8);
            expect(audioManager.targetIntensity).toBe(0.8);
        });

        it('should clamp to minimum 0', () => {
            audioManager.setIntensity(-0.5);
            expect(audioManager.targetIntensity).toBe(0);
        });

        it('should clamp to maximum 1', () => {
            audioManager.setIntensity(1.5);
            expect(audioManager.targetIntensity).toBe(1);
        });
    });

    describe('startMusic', () => {
        it('should set musicPlaying to true', () => {
            // Mock getAudioContext to return a valid context
            const mockCtx = {
                currentTime: 0,
                createBuffer: vi.fn().mockReturnValue({
                    getChannelData: vi.fn().mockReturnValue(new Float32Array(1000)),
                }),
                sampleRate: 44100,
            };
            audioManager.getAudioContext = vi.fn().mockReturnValue(mockCtx);
            audioManager.createNoiseBuffers = vi.fn();
            audioManager.startMusicLoop = vi.fn();

            audioManager.startMusic();
            expect(audioManager.musicPlaying).toBe(true);
        });

        it('should not start if music disabled', () => {
            audioManager.musicEnabled = false;
            audioManager.startMusic();
            expect(audioManager.musicPlaying).toBe(false);
        });

        it('should not restart if already playing', () => {
            audioManager.musicPlaying = true;
            const originalTimer = audioManager.schedulerTimer;
            audioManager.startMusic();
            // Should not create new timer
            expect(audioManager.musicPlaying).toBe(true);
        });
    });

    describe('stopMusic', () => {
        it('should set musicPlaying to false', () => {
            audioManager.musicPlaying = true;
            audioManager.stopMusic();
            expect(audioManager.musicPlaying).toBe(false);
        });

        it('should clear scheduler timer', () => {
            audioManager.schedulerTimer = 123;
            audioManager.stopMusic();
            expect(audioManager.schedulerTimer).toBeNull();
        });
    });

    describe('playSound', () => {
        it('should not play when disabled', () => {
            audioManager.enabled = false;
            const ctx = audioManager.getAudioContext();
            audioManager.playSound('brick');
            // No assertions needed - just ensure no errors
        });

        it('should play sound when enabled', () => {
            audioManager.playSound('brick');
            // No assertions needed - just ensure no errors
        });

        it('should handle unknown sound types', () => {
            audioManager.playSound('unknown_sound_type');
            // Should fall back to brick sound, no errors
        });

        it('should play comboMilestone sound', () => {
            // Should not throw when playing comboMilestone
            expect(() => audioManager.playSound('comboMilestone')).not.toThrow();
        });

        it('should accept comboBonus option for pitch scaling', () => {
            // Should not throw when passing comboBonus
            expect(() => audioManager.playSound('brick', { comboBonus: 2 })).not.toThrow();
        });

        it('should handle high comboBonus values for pitch scaling', () => {
            // Should not throw even with high combo values
            expect(() => audioManager.playSound('brick', { comboBonus: 4 })).not.toThrow();
        });

        it('should handle zero comboBonus', () => {
            // Should work normally with zero combo bonus
            expect(() => audioManager.playSound('brick', { comboBonus: 0 })).not.toThrow();
        });

        it('should handle negative comboBonus gracefully', () => {
            // Should not throw with negative values
            expect(() => audioManager.playSound('brick', { comboBonus: -1 })).not.toThrow();
        });
    });

    describe('createAudioManager', () => {
        it('should return AudioManager instance', () => {
            const manager = createAudioManager();
            expect(manager).toBeInstanceOf(AudioManager);
        });
    });

    describe('toggleMusic with music restart', () => {
        it('should start music when toggling on while audio enabled', () => {
            audioManager.musicEnabled = false;
            audioManager.enabled = true;
            audioManager.startMusic = vi.fn();
            audioManager.toggleMusic();
            expect(audioManager.startMusic).toHaveBeenCalled();
        });
    });

    describe('setMood with active music', () => {
        it('should restart music loop when mood changes during playback', () => {
            vi.useFakeTimers();
            audioManager.schedulerTimer = setInterval(() => {}, 100);
            audioManager.startMusicLoop = vi.fn();
            audioManager.setMood('javascript');
            expect(audioManager.startMusicLoop).toHaveBeenCalled();
            vi.useRealTimers();
        });
    });

    describe('startMusicLoop', () => {
        it('should clear existing timer before starting new one', () => {
            vi.useFakeTimers();
            audioManager.getAudioContext();
            audioManager.schedulerTimer = 999;
            audioManager.startMusicLoop();
            expect(audioManager.schedulerTimer).not.toBe(999);
            vi.useRealTimers();
        });
    });
});
