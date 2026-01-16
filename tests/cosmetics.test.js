import { describe, it, expect } from 'vitest';
import { COSMETICS, getCosmeticById, checkUnlockRequirement, getUnlockableCosmetics } from '../src/cosmetics.js';

describe('Cosmetics System', () => {
    describe('COSMETICS data', () => {
        it('should have paddles array', () => {
            expect(Array.isArray(COSMETICS.paddles)).toBe(true);
            expect(COSMETICS.paddles.length).toBeGreaterThan(0);
        });

        it('should have trails array', () => {
            expect(Array.isArray(COSMETICS.trails)).toBe(true);
            expect(COSMETICS.trails.length).toBeGreaterThan(0);
        });

        it('should have backgrounds array', () => {
            expect(Array.isArray(COSMETICS.backgrounds)).toBe(true);
            expect(COSMETICS.backgrounds.length).toBeGreaterThan(0);
        });

        it('should have default paddle unlocked', () => {
            const defaultPaddle = COSMETICS.paddles.find(p => p.id === 'default');
            expect(defaultPaddle).toBeDefined();
            expect(defaultPaddle.unlocked).toBe(true);
        });

        it('should have default trail unlocked', () => {
            const defaultTrail = COSMETICS.trails.find(t => t.id === 'default');
            expect(defaultTrail).toBeDefined();
            expect(defaultTrail.unlocked).toBe(true);
        });

        it('should have default background unlocked', () => {
            const defaultBg = COSMETICS.backgrounds.find(b => b.id === 'default');
            expect(defaultBg).toBeDefined();
            expect(defaultBg.unlocked).toBe(true);
        });

        it('should have required properties for each cosmetic', () => {
            for (const [typeKey, cosmetics] of Object.entries(COSMETICS)) {
                for (const cosmetic of cosmetics) {
                    expect(cosmetic.id).toBeDefined();
                    expect(cosmetic.name).toBeDefined();
                    expect(typeof cosmetic.unlocked).toBe('boolean');
                }
            }
        });

        it('should have unique ids within each category', () => {
            for (const [typeKey, cosmetics] of Object.entries(COSMETICS)) {
                const ids = cosmetics.map(c => c.id);
                const uniqueIds = [...new Set(ids)];
                expect(ids.length).toBe(uniqueIds.length);
            }
        });
    });

    describe('getCosmeticById', () => {
        it('should return paddle by id', () => {
            const paddle = getCosmeticById('paddle', 'neon');
            expect(paddle).toBeDefined();
            expect(paddle.name).toBe('Neon');
        });

        it('should return trail by id', () => {
            const trail = getCosmeticById('trail', 'fire');
            expect(trail).toBeDefined();
            expect(trail.name).toBe('Fire');
        });

        it('should return background by id', () => {
            const bg = getCosmeticById('background', 'space');
            expect(bg).toBeDefined();
            expect(bg.name).toBe('Space');
        });

        it('should return null for invalid type', () => {
            const result = getCosmeticById('invalid', 'default');
            expect(result).toBeNull();
        });

        it('should return undefined for invalid id', () => {
            const result = getCosmeticById('paddle', 'nonexistent');
            expect(result).toBeUndefined();
        });

        it('should return default paddle', () => {
            const paddle = getCosmeticById('paddle', 'default');
            expect(paddle).toBeDefined();
            expect(paddle.unlocked).toBe(true);
        });
    });

    describe('checkUnlockRequirement', () => {
        it('should return true for null requirement', () => {
            expect(checkUnlockRequirement(null, {})).toBe(true);
        });

        it('should check score requirement', () => {
            const req = { type: 'score', value: 10000 };
            expect(checkUnlockRequirement(req, { totalScore: 5000 })).toBe(false);
            expect(checkUnlockRequirement(req, { totalScore: 15000 })).toBe(true);
        });

        it('should check levels requirement', () => {
            const req = { type: 'levels', value: 5 };
            expect(checkUnlockRequirement(req, { levelsCompleted: 3 })).toBe(false);
            expect(checkUnlockRequirement(req, { levelsCompleted: 5 })).toBe(true);
        });

        it('should check perfect requirement', () => {
            const req = { type: 'perfect', value: 3 };
            expect(checkUnlockRequirement(req, { perfectLevels: 2 })).toBe(false);
            expect(checkUnlockRequirement(req, { perfectLevels: 3 })).toBe(true);
        });

        it('should check combo requirement', () => {
            const req = { type: 'combo', value: 10 };
            expect(checkUnlockRequirement(req, { maxCombo: 5 })).toBe(false);
            expect(checkUnlockRequirement(req, { maxCombo: 10 })).toBe(true);
        });

        it('should check bonus requirement', () => {
            const req = { type: 'bonus', value: 3 };
            expect(checkUnlockRequirement(req, { bonusCompleted: 1 })).toBe(false);
            expect(checkUnlockRequirement(req, { bonusCompleted: 5 })).toBe(true);
        });

        it('should return false for unknown requirement type', () => {
            const req = { type: 'unknown', value: 1 };
            expect(checkUnlockRequirement(req, {})).toBe(false);
        });

        it('should handle missing progress fields gracefully', () => {
            const req = { type: 'score', value: 100 };
            expect(checkUnlockRequirement(req, {})).toBe(false);
        });

        it('should return true when exactly at threshold', () => {
            const req = { type: 'score', value: 10000 };
            expect(checkUnlockRequirement(req, { totalScore: 10000 })).toBe(true);
        });
    });

    describe('getUnlockableCosmetics', () => {
        it('should return empty array when no requirements met', () => {
            const progress = { totalScore: 0, levelsCompleted: 0, unlockedCosmetics: ['default'] };
            const unlockable = getUnlockableCosmetics(progress);
            expect(unlockable.length).toBe(0);
        });

        it('should return cosmetics when requirements are met', () => {
            const progress = { 
                totalScore: 100000, 
                levelsCompleted: 20,
                perfectLevels: 10,
                maxCombo: 20,
                bonusCompleted: 10,
                unlockedCosmetics: ['default'] 
            };
            const unlockable = getUnlockableCosmetics(progress);
            expect(unlockable.length).toBeGreaterThan(0);
        });

        it('should not include already unlocked cosmetics', () => {
            const progress = { 
                totalScore: 100000, 
                unlockedCosmetics: ['default', 'neon'] 
            };
            const unlockable = getUnlockableCosmetics(progress);
            const hasNeon = unlockable.some(c => c.id === 'neon');
            expect(hasNeon).toBe(false);
        });

        it('should not include default cosmetics (already unlocked)', () => {
            const progress = { 
                totalScore: 100000, 
                levelsCompleted: 20,
                unlockedCosmetics: [] 
            };
            const unlockable = getUnlockableCosmetics(progress);
            const hasDefault = unlockable.some(c => c.id === 'default');
            expect(hasDefault).toBe(false);
        });

        it('should include type information in returned cosmetics', () => {
            const progress = { 
                totalScore: 100000, 
                levelsCompleted: 20,
                perfectLevels: 10,
                maxCombo: 20,
                bonusCompleted: 10,
                unlockedCosmetics: ['default'] 
            };
            const unlockable = getUnlockableCosmetics(progress);
            for (const cosmetic of unlockable) {
                expect(['paddle', 'trail', 'background']).toContain(cosmetic.type);
            }
        });

        it('should handle empty unlockedCosmetics array', () => {
            const progress = { 
                totalScore: 10000, 
                unlockedCosmetics: [] 
            };
            const unlockable = getUnlockableCosmetics(progress);
            expect(Array.isArray(unlockable)).toBe(true);
        });

        it('should handle undefined unlockedCosmetics', () => {
            const progress = { 
                totalScore: 10000 
            };
            const unlockable = getUnlockableCosmetics(progress);
            expect(Array.isArray(unlockable)).toBe(true);
        });
    });
});
