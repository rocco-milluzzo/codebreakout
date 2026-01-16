import { describe, it, expect } from 'vitest';
import { BRICK_TYPES, getBrickTypeFromPattern } from '../src/brickTypes.js';

describe('BRICK_TYPES', () => {
    describe('Structure', () => {
        it('should have multiple brick types defined', () => {
            const types = Object.keys(BRICK_TYPES);
            expect(types.length).toBeGreaterThan(0);
        });

        it('should have required properties for each type', () => {
            for (const brickType of Object.values(BRICK_TYPES)) {
                expect(brickType).toHaveProperty('hits');
                expect(brickType).toHaveProperty('points');
                expect(brickType).toHaveProperty('color');
            }
        });
    });

    describe('STANDARD brick', () => {
        it('should have 1 hit point', () => {
            expect(BRICK_TYPES.STANDARD.hits).toBe(1);
        });

        it('should have 10 points', () => {
            expect(BRICK_TYPES.STANDARD.points).toBe(10);
        });

        it('should have null color (uses level color)', () => {
            expect(BRICK_TYPES.STANDARD.color).toBeNull();
        });
    });

    describe('STRONG brick', () => {
        it('should have 2 hit points', () => {
            expect(BRICK_TYPES.STRONG.hits).toBe(2);
        });

        it('should have 25 points', () => {
            expect(BRICK_TYPES.STRONG.points).toBe(25);
        });

        it('should have null color (uses level color)', () => {
            expect(BRICK_TYPES.STRONG.color).toBeNull();
        });
    });

    describe('TOUGH brick', () => {
        it('should have 3 hit points', () => {
            expect(BRICK_TYPES.TOUGH.hits).toBe(3);
        });

        it('should have 50 points', () => {
            expect(BRICK_TYPES.TOUGH.points).toBe(50);
        });

        it('should have null color (uses level color)', () => {
            expect(BRICK_TYPES.TOUGH.color).toBeNull();
        });
    });

    describe('UNBREAKABLE brick', () => {
        it('should have -1 hit points (indestructible)', () => {
            expect(BRICK_TYPES.UNBREAKABLE.hits).toBe(-1);
        });

        it('should have 0 points', () => {
            expect(BRICK_TYPES.UNBREAKABLE.points).toBe(0);
        });

        it('should have dark gray color', () => {
            expect(BRICK_TYPES.UNBREAKABLE.color).toBe('#333');
        });
    });

    describe('EXPLODING brick', () => {
        it('should have 1 hit point', () => {
            expect(BRICK_TYPES.EXPLODING.hits).toBe(1);
        });

        it('should have 30 points', () => {
            expect(BRICK_TYPES.EXPLODING.points).toBe(30);
        });

        it('should have orange color', () => {
            expect(BRICK_TYPES.EXPLODING.color).toBe('#ff6600');
        });

        it('should have explodes property', () => {
            expect(BRICK_TYPES.EXPLODING.explodes).toBe(true);
        });
    });

    describe('PORTAL brick', () => {
        it('should have 1 hit point', () => {
            expect(BRICK_TYPES.PORTAL.hits).toBe(1);
        });

        it('should have 20 points', () => {
            expect(BRICK_TYPES.PORTAL.points).toBe(20);
        });

        it('should have purple color', () => {
            expect(BRICK_TYPES.PORTAL.color).toBe('#9900ff');
        });

        it('should have portal property', () => {
            expect(BRICK_TYPES.PORTAL.portal).toBe(true);
        });
    });

    describe('HAZARD brick', () => {
        it('should have 1 hit point', () => {
            expect(BRICK_TYPES.HAZARD.hits).toBe(1);
        });

        it('should have 15 points', () => {
            expect(BRICK_TYPES.HAZARD.points).toBe(15);
        });

        it('should have pink/red color', () => {
            expect(BRICK_TYPES.HAZARD.color).toBe('#ff0055');
        });

        it('should have hazard property', () => {
            expect(BRICK_TYPES.HAZARD.hazard).toBe(true);
        });
    });

    describe('Point values hierarchy', () => {
        it('should have higher points for harder bricks', () => {
            expect(BRICK_TYPES.TOUGH.points).toBeGreaterThan(BRICK_TYPES.STRONG.points);
            expect(BRICK_TYPES.STRONG.points).toBeGreaterThan(BRICK_TYPES.STANDARD.points);
        });

        it('should have EXPLODING worth more than STANDARD', () => {
            expect(BRICK_TYPES.EXPLODING.points).toBeGreaterThan(BRICK_TYPES.STANDARD.points);
        });
    });
});

describe('getBrickTypeFromPattern', () => {
    describe('Basic pattern values', () => {
        const levelData = { mechanics: [] };

        it('should return STANDARD for value 1', () => {
            expect(getBrickTypeFromPattern(1, levelData)).toBe('STANDARD');
        });

        it('should return STANDARD for value 2 without strong_bricks mechanic', () => {
            expect(getBrickTypeFromPattern(2, levelData)).toBe('STANDARD');
        });

        it('should return TOUGH for value 3', () => {
            expect(getBrickTypeFromPattern(3, levelData)).toBe('TOUGH');
        });

        it('should return UNBREAKABLE for value -1', () => {
            expect(getBrickTypeFromPattern(-1, levelData)).toBe('UNBREAKABLE');
        });

        it('should return STANDARD for value 4 without hazard_bricks mechanic', () => {
            expect(getBrickTypeFromPattern(4, levelData)).toBe('STANDARD');
        });

        it('should return PORTAL for value 5', () => {
            expect(getBrickTypeFromPattern(5, levelData)).toBe('PORTAL');
        });

        it('should return EXPLODING for value 6', () => {
            expect(getBrickTypeFromPattern(6, levelData)).toBe('EXPLODING');
        });

        it('should return STANDARD for unknown values', () => {
            expect(getBrickTypeFromPattern(99, levelData)).toBe('STANDARD');
            expect(getBrickTypeFromPattern(0, levelData)).toBe('STANDARD');
        });
    });

    describe('With strong_bricks mechanic', () => {
        const levelData = { mechanics: ['strong_bricks'] };

        it('should return STRONG for value 2 with strong_bricks', () => {
            expect(getBrickTypeFromPattern(2, levelData)).toBe('STRONG');
        });

        it('should still return STANDARD for value 1', () => {
            expect(getBrickTypeFromPattern(1, levelData)).toBe('STANDARD');
        });
    });

    describe('With hazard_bricks mechanic', () => {
        const levelData = { mechanics: ['hazard_bricks'] };

        it('should return HAZARD for value 4 with hazard_bricks', () => {
            expect(getBrickTypeFromPattern(4, levelData)).toBe('HAZARD');
        });

        it('should still return STANDARD for value 2 without strong_bricks', () => {
            expect(getBrickTypeFromPattern(2, levelData)).toBe('STANDARD');
        });
    });

    describe('With multiple mechanics', () => {
        const levelData = { mechanics: ['strong_bricks', 'hazard_bricks'] };

        it('should return STRONG for value 2', () => {
            expect(getBrickTypeFromPattern(2, levelData)).toBe('STRONG');
        });

        it('should return HAZARD for value 4', () => {
            expect(getBrickTypeFromPattern(4, levelData)).toBe('HAZARD');
        });

        it('should return TOUGH for value 3', () => {
            expect(getBrickTypeFromPattern(3, levelData)).toBe('TOUGH');
        });
    });
});
