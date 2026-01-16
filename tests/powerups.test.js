import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    POWERUP_TYPES,
    getPositivePowerupTypes,
    getNegativePowerupTypes,
    getRandomPositivePowerup,
    getRandomNegativePowerup,
} from '../src/powerups.js';

describe('POWERUP_TYPES', () => {
    describe('Structure', () => {
        it('should have multiple powerup types defined', () => {
            const types = Object.keys(POWERUP_TYPES);
            expect(types.length).toBeGreaterThan(0);
        });

        it('should have required properties for each type', () => {
            for (const [key, powerup] of Object.entries(POWERUP_TYPES)) {
                expect(powerup).toHaveProperty('name');
                expect(powerup).toHaveProperty('color');
                expect(powerup).toHaveProperty('symbol');
                expect(powerup).toHaveProperty('positive');
                expect(powerup).toHaveProperty('rarity');
            }
        });

        it('should have valid rarity values (0 to 1)', () => {
            for (const powerup of Object.values(POWERUP_TYPES)) {
                expect(powerup.rarity).toBeGreaterThanOrEqual(0);
                expect(powerup.rarity).toBeLessThanOrEqual(1);
            }
        });

        it('should have valid hex colors', () => {
            const hexColorRegex = /^#[0-9a-fA-F]{6}$/;
            for (const powerup of Object.values(POWERUP_TYPES)) {
                expect(powerup.color).toMatch(hexColorRegex);
            }
        });
    });

    describe('Positive powerups', () => {
        it('should include MULTIBALL', () => {
            expect(POWERUP_TYPES.MULTIBALL).toBeDefined();
            expect(POWERUP_TYPES.MULTIBALL.positive).toBe(true);
            expect(POWERUP_TYPES.MULTIBALL.symbol).toBe('+');
        });

        it('should include WIDE_PADDLE', () => {
            expect(POWERUP_TYPES.WIDE_PADDLE).toBeDefined();
            expect(POWERUP_TYPES.WIDE_PADDLE.positive).toBe(true);
            expect(POWERUP_TYPES.WIDE_PADDLE.symbol).toBe('W');
        });

        it('should include SLOWMO', () => {
            expect(POWERUP_TYPES.SLOWMO).toBeDefined();
            expect(POWERUP_TYPES.SLOWMO.positive).toBe(true);
            expect(POWERUP_TYPES.SLOWMO.symbol).toBe('S');
        });

        it('should include LASER', () => {
            expect(POWERUP_TYPES.LASER).toBeDefined();
            expect(POWERUP_TYPES.LASER.positive).toBe(true);
            expect(POWERUP_TYPES.LASER.symbol).toBe('L');
        });

        it('should include SHIELD', () => {
            expect(POWERUP_TYPES.SHIELD).toBeDefined();
            expect(POWERUP_TYPES.SHIELD.positive).toBe(true);
            expect(POWERUP_TYPES.SHIELD.symbol).toBe('-');
        });

        it('should include MAGNET', () => {
            expect(POWERUP_TYPES.MAGNET).toBeDefined();
            expect(POWERUP_TYPES.MAGNET.positive).toBe(true);
            expect(POWERUP_TYPES.MAGNET.symbol).toBe('M');
        });

        it('should include FIREBALL', () => {
            expect(POWERUP_TYPES.FIREBALL).toBeDefined();
            expect(POWERUP_TYPES.FIREBALL.positive).toBe(true);
        });
    });

    describe('Negative powerups', () => {
        it('should include MINI_PADDLE', () => {
            expect(POWERUP_TYPES.MINI_PADDLE).toBeDefined();
            expect(POWERUP_TYPES.MINI_PADDLE.positive).toBe(false);
            expect(POWERUP_TYPES.MINI_PADDLE.symbol).toBe('m');
        });

        it('should include FAST_BALL', () => {
            expect(POWERUP_TYPES.FAST_BALL).toBeDefined();
            expect(POWERUP_TYPES.FAST_BALL.positive).toBe(false);
            expect(POWERUP_TYPES.FAST_BALL.symbol).toBe('F');
        });

        it('should include GLITCH', () => {
            expect(POWERUP_TYPES.GLITCH).toBeDefined();
            expect(POWERUP_TYPES.GLITCH.positive).toBe(false);
            expect(POWERUP_TYPES.GLITCH.symbol).toBe('?');
        });

        it('should include INVERT_CONTROLS', () => {
            expect(POWERUP_TYPES.INVERT_CONTROLS).toBeDefined();
            expect(POWERUP_TYPES.INVERT_CONTROLS.positive).toBe(false);
        });

        it('should include SPLIT_PADDLE', () => {
            expect(POWERUP_TYPES.SPLIT_PADDLE).toBeDefined();
            expect(POWERUP_TYPES.SPLIT_PADDLE.positive).toBe(false);
        });
    });
});

describe('getPositivePowerupTypes', () => {
    it('should return an array', () => {
        const types = getPositivePowerupTypes();
        expect(Array.isArray(types)).toBe(true);
    });

    it('should return only positive powerup keys', () => {
        const types = getPositivePowerupTypes();
        for (const type of types) {
            expect(POWERUP_TYPES[type].positive).toBe(true);
        }
    });

    it('should include all positive powerups', () => {
        const types = getPositivePowerupTypes();
        expect(types).toContain('MULTIBALL');
        expect(types).toContain('WIDE_PADDLE');
        expect(types).toContain('SLOWMO');
        expect(types).toContain('LASER');
        expect(types).toContain('SHIELD');
        expect(types).toContain('MAGNET');
        expect(types).toContain('FIREBALL');
    });

    it('should not include negative powerups', () => {
        const types = getPositivePowerupTypes();
        expect(types).not.toContain('MINI_PADDLE');
        expect(types).not.toContain('FAST_BALL');
        expect(types).not.toContain('GLITCH');
    });
});

describe('getNegativePowerupTypes', () => {
    it('should return an array', () => {
        const types = getNegativePowerupTypes();
        expect(Array.isArray(types)).toBe(true);
    });

    it('should return only negative powerup keys', () => {
        const types = getNegativePowerupTypes();
        for (const type of types) {
            expect(POWERUP_TYPES[type].positive).toBe(false);
        }
    });

    it('should include all negative powerups', () => {
        const types = getNegativePowerupTypes();
        expect(types).toContain('MINI_PADDLE');
        expect(types).toContain('FAST_BALL');
        expect(types).toContain('GLITCH');
        expect(types).toContain('INVERT_CONTROLS');
        expect(types).toContain('SPLIT_PADDLE');
    });

    it('should not include positive powerups', () => {
        const types = getNegativePowerupTypes();
        expect(types).not.toContain('MULTIBALL');
        expect(types).not.toContain('WIDE_PADDLE');
    });
});

describe('getRandomPositivePowerup', () => {
    beforeEach(() => {
        vi.spyOn(Math, 'random');
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should return a string', () => {
        const type = getRandomPositivePowerup();
        expect(typeof type).toBe('string');
    });

    it('should return a valid positive powerup type', () => {
        const type = getRandomPositivePowerup();
        expect(POWERUP_TYPES[type]).toBeDefined();
        expect(POWERUP_TYPES[type].positive).toBe(true);
    });

    it('should use rarity modifier to filter powerups', () => {
        // With rarityModifier = 0, only common powerups should pass
        vi.mocked(Math.random).mockReturnValue(0.5);
        const type = getRandomPositivePowerup(0.1);
        expect(type).toBeDefined();
    });

    it('should return a common powerup when no powerups pass rarity check', () => {
        // Mock random to return values that won't pass rarity checks
        vi.mocked(Math.random).mockReturnValue(0.99);
        const type = getRandomPositivePowerup(0.01);
        expect(type).toBeDefined();
        expect(POWERUP_TYPES[type].positive).toBe(true);
    });

    it('should work with default rarity modifier', () => {
        const type = getRandomPositivePowerup();
        expect(type).toBeDefined();
    });

    it('should work with full rarity modifier (1.0)', () => {
        const type = getRandomPositivePowerup(1.0);
        expect(type).toBeDefined();
    });
});

describe('getRandomNegativePowerup', () => {
    beforeEach(() => {
        vi.spyOn(Math, 'random');
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should return a string', () => {
        const type = getRandomNegativePowerup();
        expect(typeof type).toBe('string');
    });

    it('should return a valid negative powerup type', () => {
        const type = getRandomNegativePowerup();
        expect(POWERUP_TYPES[type]).toBeDefined();
        expect(POWERUP_TYPES[type].positive).toBe(false);
    });

    it('should return a negative powerup even with high random values', () => {
        vi.mocked(Math.random).mockReturnValue(0.99);
        const type = getRandomNegativePowerup();
        expect(type).toBeDefined();
        expect(POWERUP_TYPES[type].positive).toBe(false);
    });

    it('should use rarity-based selection', () => {
        vi.mocked(Math.random).mockReturnValue(0.1);
        const type = getRandomNegativePowerup();
        expect(type).toBeDefined();
    });
});
