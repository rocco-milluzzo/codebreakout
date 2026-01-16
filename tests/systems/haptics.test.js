import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HapticManager, createHapticManager } from '../../src/systems/haptics.js';

describe('Haptic System', () => {
    let hapticManager;
    let mockVibrate;

    beforeEach(() => {
        mockVibrate = vi.fn();
        navigator.vibrate = mockVibrate;
        hapticManager = new HapticManager();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('HapticManager constructor', () => {
        it('should initialize enabled to true', () => {
            expect(hapticManager.enabled).toBe(true);
        });

        it('should initialize intensity to 1.0', () => {
            expect(hapticManager.intensity).toBe(1.0);
        });

        it('should detect vibration support', () => {
            expect(hapticManager.supported).toBe(true);
        });

        it('should detect lack of vibration support', () => {
            delete navigator.vibrate;
            const manager = new HapticManager();
            expect(manager.supported).toBe(false);
        });
    });

    describe('checkSupport', () => {
        it('should return true when vibrate is available', () => {
            expect(hapticManager.checkSupport()).toBe(true);
        });

        it('should return false when vibrate is not available', () => {
            delete navigator.vibrate;
            expect(hapticManager.checkSupport()).toBe(false);
        });
    });

    describe('trigger', () => {
        it('should call navigator.vibrate with brick pattern', () => {
            hapticManager.trigger('brick');
            expect(mockVibrate).toHaveBeenCalledWith([15]);
        });

        it('should call navigator.vibrate with paddle pattern', () => {
            hapticManager.trigger('paddle');
            expect(mockVibrate).toHaveBeenCalledWith([30]);
        });

        it('should call navigator.vibrate with combo pattern', () => {
            hapticManager.trigger('combo');
            expect(mockVibrate).toHaveBeenCalledWith([30, 20, 30, 20, 50]);
        });

        it('should scale pattern by intensity', () => {
            hapticManager.intensity = 0.5;
            hapticManager.trigger('brick');
            expect(mockVibrate).toHaveBeenCalledWith([8]); // 15 * 0.5 = 7.5, rounded to 8
        });

        it('should not vibrate when disabled', () => {
            hapticManager.enabled = false;
            hapticManager.trigger('brick');
            expect(mockVibrate).not.toHaveBeenCalled();
        });

        it('should not vibrate when not supported', () => {
            hapticManager.supported = false;
            hapticManager.trigger('brick');
            expect(mockVibrate).not.toHaveBeenCalled();
        });

        it('should not vibrate for unknown pattern', () => {
            hapticManager.trigger('unknown');
            expect(mockVibrate).not.toHaveBeenCalled();
        });

        it('should handle vibration errors gracefully', () => {
            mockVibrate.mockImplementation(() => { throw new Error('Vibration failed'); });
            expect(() => hapticManager.trigger('brick')).not.toThrow();
        });
    });

    describe('stop', () => {
        it('should call navigator.vibrate with 0', () => {
            hapticManager.stop();
            expect(mockVibrate).toHaveBeenCalledWith(0);
        });

        it('should not call vibrate when not supported', () => {
            hapticManager.supported = false;
            hapticManager.stop();
            expect(mockVibrate).not.toHaveBeenCalled();
        });

        it('should handle stop errors gracefully', () => {
            mockVibrate.mockImplementation(() => { throw new Error('Stop failed'); });
            expect(() => hapticManager.stop()).not.toThrow();
        });
    });

    describe('setIntensity', () => {
        it('should set intensity within range', () => {
            hapticManager.setIntensity(0.5);
            expect(hapticManager.intensity).toBe(0.5);
        });

        it('should clamp intensity to minimum 0', () => {
            hapticManager.setIntensity(-1);
            expect(hapticManager.intensity).toBe(0);
        });

        it('should clamp intensity to maximum 1', () => {
            hapticManager.setIntensity(2);
            expect(hapticManager.intensity).toBe(1);
        });
    });

    describe('enable', () => {
        it('should set enabled to true', () => {
            hapticManager.enabled = false;
            hapticManager.enable();
            expect(hapticManager.enabled).toBe(true);
        });
    });

    describe('disable', () => {
        it('should set enabled to false', () => {
            hapticManager.disable();
            expect(hapticManager.enabled).toBe(false);
        });

        it('should call stop when disabling', () => {
            const stopSpy = vi.spyOn(hapticManager, 'stop');
            hapticManager.disable();
            expect(stopSpy).toHaveBeenCalled();
        });
    });

    describe('toggle', () => {
        it('should toggle enabled from true to false', () => {
            const result = hapticManager.toggle();
            expect(hapticManager.enabled).toBe(false);
            expect(result).toBe(false);
        });

        it('should toggle enabled from false to true', () => {
            hapticManager.enabled = false;
            const result = hapticManager.toggle();
            expect(hapticManager.enabled).toBe(true);
            expect(result).toBe(true);
        });

        it('should call stop when toggling off', () => {
            const stopSpy = vi.spyOn(hapticManager, 'stop');
            hapticManager.toggle();
            expect(stopSpy).toHaveBeenCalled();
        });
    });

    describe('isEnabled', () => {
        it('should return true when enabled and supported', () => {
            expect(hapticManager.isEnabled()).toBe(true);
        });

        it('should return false when disabled', () => {
            hapticManager.enabled = false;
            expect(hapticManager.isEnabled()).toBe(false);
        });

        it('should return false when not supported', () => {
            hapticManager.supported = false;
            expect(hapticManager.isEnabled()).toBe(false);
        });
    });

    describe('isSupported', () => {
        it('should return supported value', () => {
            expect(hapticManager.isSupported()).toBe(true);
            hapticManager.supported = false;
            expect(hapticManager.isSupported()).toBe(false);
        });
    });

    describe('createHapticManager', () => {
        it('should create a HapticManager instance', () => {
            const manager = createHapticManager();
            expect(manager).toBeInstanceOf(HapticManager);
        });
    });

    describe('All pattern types', () => {
        // Patterns defined in haptics.js PATTERNS object
        const patterns = [
            'brick', 'brickStrong', 'wall', 'paddle',
            'powerupGood', 'powerupBad', 'combo',
            'extraLife', 'levelUp', 'explosion', 'gameOver',
            'victory', 'bossHit', 'specialAttack',
        ];

        patterns.forEach(pattern => {
            it(`should trigger ${pattern} pattern without error`, () => {
                expect(() => hapticManager.trigger(pattern)).not.toThrow();
                expect(mockVibrate).toHaveBeenCalled();
                mockVibrate.mockClear();
            });
        });
    });
});
