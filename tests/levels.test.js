import { describe, it, expect } from 'vitest';
import { LEVELS, CODE_LEVEL_INDICES, BONUS_LEVEL_INDICES } from '../src/levels.js';

describe('LEVELS', () => {
    describe('Level structure', () => {
        it('should have multiple levels defined', () => {
            expect(LEVELS.length).toBeGreaterThan(0);
        });

        it('should have each level with required properties', () => {
            for (const level of LEVELS) {
                expect(level).toHaveProperty('id');
                expect(level).toHaveProperty('name');
                expect(level).toHaveProperty('color');
                expect(level).toHaveProperty('description');
                expect(level).toHaveProperty('paddleWidth');
                expect(level).toHaveProperty('ballSpeed');
                expect(level).toHaveProperty('brickPattern');
                expect(level).toHaveProperty('powerupChance');
                expect(level).toHaveProperty('powerupRarity');
                expect(level).toHaveProperty('mechanics');
            }
        });

        it('should have unique level ids', () => {
            const ids = LEVELS.map(l => l.id);
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(ids.length);
        });
    });

    describe('Level progression', () => {
        it('should have valid paddle widths (positive numbers)', () => {
            for (const level of LEVELS) {
                expect(level.paddleWidth).toBeGreaterThan(0);
            }
        });

        it('should have valid ball speeds (positive numbers)', () => {
            for (const level of LEVELS) {
                expect(level.ballSpeed).toBeGreaterThan(0);
            }
        });

        it('should have valid powerup chances (between 0 and 1)', () => {
            for (const level of LEVELS) {
                expect(level.powerupChance).toBeGreaterThanOrEqual(0);
                expect(level.powerupChance).toBeLessThanOrEqual(1);
            }
        });

        it('should have valid powerup rarities (between 0 and 1)', () => {
            for (const level of LEVELS) {
                expect(level.powerupRarity).toBeGreaterThanOrEqual(0);
                expect(level.powerupRarity).toBeLessThanOrEqual(1);
            }
        });
    });

    describe('Code levels', () => {
        it('should have code levels with proper names', () => {
            const codeLevelNames = ['HTML', 'CSS', 'JavaScript', 'Python', 'PHP',
                'Ruby', 'Java', 'C#', 'TypeScript', 'C', 'C++', 'Go', 'Rust', 'Haskell', 'Assembly'];

            for (const name of codeLevelNames) {
                const level = LEVELS.find(l => l.name === name);
                expect(level).toBeDefined();
            }
        });

        it('should have mechanics as arrays', () => {
            for (const level of LEVELS) {
                expect(Array.isArray(level.mechanics)).toBe(true);
            }
        });
    });

    describe('Bonus levels', () => {
        it('should have bonus levels with bonus property', () => {
            const bonusLevels = LEVELS.filter(l => l.bonus);
            expect(bonusLevels.length).toBeGreaterThan(0);
        });

        it('should have bonus levels with required bonus properties', () => {
            const bonusLevels = LEVELS.filter(l => l.bonus);
            for (const level of bonusLevels) {
                expect(level.bonus).toHaveProperty('type');
                expect(level.bonus).toHaveProperty('duration');
            }
        });

        it('should have bonus levels with bonus_stage mechanic', () => {
            const bonusLevels = LEVELS.filter(l => l.bonus);
            for (const level of bonusLevels) {
                expect(level.mechanics).toContain('bonus_stage');
            }
        });

        it('should include various bonus types', () => {
            const bonusTypes = LEVELS.filter(l => l.bonus).map(l => l.bonus.type);
            expect(bonusTypes).toContain('roguelike');
            expect(bonusTypes).toContain('relax');
            expect(bonusTypes).toContain('doodle');
            expect(bonusTypes).toContain('bulletHell');
            expect(bonusTypes).toContain('boss');
        });
    });

    describe('Specific level configurations', () => {
        it('should have HTML as the first tutorial level', () => {
            const htmlLevel = LEVELS.find(l => l.name === 'HTML');
            expect(htmlLevel.paddleWidth).toBe(130);
            expect(htmlLevel.ballSpeed).toBe(3.5);
            expect(htmlLevel.powerupChance).toBe(0.25);
            expect(htmlLevel.brickPattern).toBe('simple');
        });

        it('should have Assembly as a challenging level', () => {
            const asmLevel = LEVELS.find(l => l.name === 'Assembly');
            expect(asmLevel.paddleWidth).toBe(55);
            expect(asmLevel.ballSpeed).toBe(10);
            expect(asmLevel.powerupChance).toBe(0.04);
        });

        it('should have ROGUELIKE bonus with brick regeneration', () => {
            const roguelike = LEVELS.find(l => l.name === 'ROGUELIKE');
            expect(roguelike.bonus.brickRegenDelay).toBeDefined();
            expect(roguelike.bonus.noDeathPenalty).toBe(true);
        });

        it('should have BOSS BATTLE with boss properties', () => {
            const boss = LEVELS.find(l => l.name === 'BOSS BATTLE');
            expect(boss.bonus.bossHealth).toBeDefined();
            expect(boss.bonus.bossMoveSpeed).toBeDefined();
            expect(boss.bonus.bossAttackInterval).toBeDefined();
        });
    });

    describe('Level color validation', () => {
        it('should have valid hex colors for all levels', () => {
            const hexColorRegex = /^#[0-9a-fA-F]{6}$/;
            for (const level of LEVELS) {
                expect(level.color).toMatch(hexColorRegex);
            }
        });
    });
});

describe('CODE_LEVEL_INDICES', () => {
    it('should be an array of indices', () => {
        expect(Array.isArray(CODE_LEVEL_INDICES)).toBe(true);
    });

    it('should contain only indices of non-bonus levels', () => {
        for (const index of CODE_LEVEL_INDICES) {
            expect(LEVELS[index].bonus).toBeUndefined();
        }
    });

    it('should not contain bonus level indices', () => {
        for (const index of CODE_LEVEL_INDICES) {
            expect(LEVELS[index].mechanics).not.toContain('bonus_stage');
        }
    });
});

describe('BONUS_LEVEL_INDICES', () => {
    it('should be an array of indices', () => {
        expect(Array.isArray(BONUS_LEVEL_INDICES)).toBe(true);
    });

    it('should contain only indices of bonus levels', () => {
        for (const index of BONUS_LEVEL_INDICES) {
            expect(LEVELS[index].bonus).toBeDefined();
        }
    });

    it('should match count of bonus levels in LEVELS', () => {
        const bonusCount = LEVELS.filter(l => l.bonus).length;
        expect(BONUS_LEVEL_INDICES.length).toBe(bonusCount);
    });
});
