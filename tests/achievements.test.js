import { describe, it, expect } from 'vitest';
import { ACHIEVEMENTS, getAchievementById, checkAchievement, getNewlyUnlockedAchievements } from '../src/achievements.js';

describe('Achievements System', () => {
    describe('ACHIEVEMENTS data', () => {
        it('should be an array', () => {
            expect(Array.isArray(ACHIEVEMENTS)).toBe(true);
        });

        it('should have at least 10 achievements', () => {
            expect(ACHIEVEMENTS.length).toBeGreaterThanOrEqual(10);
        });

        it('should have required properties for each achievement', () => {
            for (const ach of ACHIEVEMENTS) {
                expect(ach.id).toBeDefined();
                expect(ach.name).toBeDefined();
                expect(ach.desc).toBeDefined();
                expect(ach.icon).toBeDefined();
                expect(ach.requirement).toBeDefined();
            }
        });

        it('should have unique ids', () => {
            const ids = ACHIEVEMENTS.map(a => a.id);
            const uniqueIds = [...new Set(ids)];
            expect(ids.length).toBe(uniqueIds.length);
        });

        it('should have requirement with type and value for each achievement', () => {
            for (const ach of ACHIEVEMENTS) {
                expect(ach.requirement.type).toBeDefined();
                expect(typeof ach.requirement.type).toBe('string');
            }
        });

        it('should have string ids', () => {
            for (const ach of ACHIEVEMENTS) {
                expect(typeof ach.id).toBe('string');
            }
        });

        it('should have string names', () => {
            for (const ach of ACHIEVEMENTS) {
                expect(typeof ach.name).toBe('string');
            }
        });
    });

    describe('getAchievementById', () => {
        it('should return achievement by id', () => {
            const ach = getAchievementById('first_blood');
            expect(ach).toBeDefined();
            expect(ach.name).toBe('First Blood');
        });

        it('should return undefined for invalid id', () => {
            const ach = getAchievementById('nonexistent');
            expect(ach).toBeUndefined();
        });

        it('should return correct achievement for combo_5', () => {
            const ach = getAchievementById('combo_5');
            expect(ach).toBeDefined();
            expect(ach.name).toBe('Combo Master');
        });

        it('should return correct achievement for perfect', () => {
            const ach = getAchievementById('perfect');
            expect(ach).toBeDefined();
            expect(ach.name).toBe('Flawless');
        });

        it('should return undefined for null id', () => {
            const ach = getAchievementById(null);
            expect(ach).toBeUndefined();
        });

        it('should return undefined for empty string id', () => {
            const ach = getAchievementById('');
            expect(ach).toBeUndefined();
        });
    });

    describe('checkAchievement', () => {
        it('should check levels requirement', () => {
            const ach = { requirement: { type: 'levels', value: 1 } };
            expect(checkAchievement(ach, {}, { levelsCompleted: 0 })).toBe(false);
            expect(checkAchievement(ach, {}, { levelsCompleted: 1 })).toBe(true);
        });

        it('should check combo requirement from game state', () => {
            const ach = { requirement: { type: 'combo', value: 5 } };
            expect(checkAchievement(ach, { maxComboThisGame: 5 }, { maxCombo: 0 })).toBe(true);
        });

        it('should check combo requirement from progress', () => {
            const ach = { requirement: { type: 'combo', value: 5 } };
            expect(checkAchievement(ach, { maxComboThisGame: 0 }, { maxCombo: 5 })).toBe(true);
        });

        it('should check combo requirement fails when neither meets threshold', () => {
            const ach = { requirement: { type: 'combo', value: 10 } };
            expect(checkAchievement(ach, { maxComboThisGame: 5 }, { maxCombo: 3 })).toBe(false);
        });

        it('should check totalScore requirement', () => {
            const ach = { requirement: { type: 'totalScore', value: 10000 } };
            expect(checkAchievement(ach, {}, { totalScore: 5000 })).toBe(false);
            expect(checkAchievement(ach, {}, { totalScore: 10000 })).toBe(true);
        });

        it('should check ballCount requirement', () => {
            const ach = { requirement: { type: 'ballCount', value: 20 } };
            expect(checkAchievement(ach, { maxBallsThisGame: 10 }, {})).toBe(false);
            expect(checkAchievement(ach, { maxBallsThisGame: 25 }, {})).toBe(true);
        });

        it('should check perfect requirement', () => {
            const ach = { requirement: { type: 'perfect', value: 1 } };
            expect(checkAchievement(ach, {}, { perfectLevels: 0 })).toBe(false);
            expect(checkAchievement(ach, {}, { perfectLevels: 1 })).toBe(true);
        });

        it('should check speedLevel requirement', () => {
            const ach = { requirement: { type: 'speedLevel', value: 30 } };
            expect(checkAchievement(ach, { levelTime: 35000 }, {})).toBe(false);
            expect(checkAchievement(ach, { levelTime: 25000 }, {})).toBe(true);
        });

        it('should check bonusType requirement', () => {
            const ach = { requirement: { type: 'bonusType', value: 'roguelike' } };
            expect(checkAchievement(ach, { completedBonusType: 'zen' }, {})).toBe(false);
            expect(checkAchievement(ach, { completedBonusType: 'roguelike' }, {})).toBe(true);
        });

        it('should return false for unknown requirement type', () => {
            const ach = { requirement: { type: 'unknown', value: 1 } };
            expect(checkAchievement(ach, {}, {})).toBe(false);
        });

        it('should handle missing gameState fields gracefully', () => {
            const ach = { requirement: { type: 'ballCount', value: 5 } };
            expect(checkAchievement(ach, {}, {})).toBe(false);
        });

        it('should handle missing progress fields gracefully', () => {
            const ach = { requirement: { type: 'totalScore', value: 100 } };
            expect(checkAchievement(ach, {}, {})).toBe(false);
        });
    });

    describe('getNewlyUnlockedAchievements', () => {
        it('should return empty array when no achievements unlocked', () => {
            const gameState = { maxComboThisGame: 1 };
            const progress = { levelsCompleted: 0, totalScore: 0 };
            const unlocked = [];
            const result = getNewlyUnlockedAchievements(gameState, progress, unlocked);
            expect(result.length).toBe(0);
        });

        it('should return newly unlocked achievements', () => {
            const gameState = { maxComboThisGame: 5 };
            const progress = { levelsCompleted: 1, totalScore: 1000, maxCombo: 5 };
            const unlocked = [];
            const result = getNewlyUnlockedAchievements(gameState, progress, unlocked);
            expect(result.length).toBeGreaterThan(0);
        });

        it('should not return already unlocked achievements', () => {
            const gameState = { maxComboThisGame: 5 };
            const progress = { levelsCompleted: 1, totalScore: 1000, maxCombo: 5 };
            const unlocked = ['first_blood', 'combo_5'];
            const result = getNewlyUnlockedAchievements(gameState, progress, unlocked);
            const hasFirstBlood = result.some(a => a.id === 'first_blood');
            expect(hasFirstBlood).toBe(false);
        });

        it('should return full achievement objects', () => {
            const gameState = { maxComboThisGame: 5 };
            const progress = { levelsCompleted: 1, totalScore: 1000, maxCombo: 5 };
            const unlocked = [];
            const result = getNewlyUnlockedAchievements(gameState, progress, unlocked);
            for (const ach of result) {
                expect(ach.id).toBeDefined();
                expect(ach.name).toBeDefined();
                expect(ach.desc).toBeDefined();
                expect(ach.icon).toBeDefined();
            }
        });

        it('should handle empty unlocked array', () => {
            const gameState = { maxComboThisGame: 10 };
            const progress = { levelsCompleted: 5, totalScore: 50000, maxCombo: 10, perfectLevels: 3 };
            const unlocked = [];
            const result = getNewlyUnlockedAchievements(gameState, progress, unlocked);
            expect(Array.isArray(result)).toBe(true);
        });

        it('should unlock first_blood when completing first level', () => {
            const gameState = {};
            const progress = { levelsCompleted: 1 };
            const unlocked = [];
            const result = getNewlyUnlockedAchievements(gameState, progress, unlocked);
            const hasFirstBlood = result.some(a => a.id === 'first_blood');
            expect(hasFirstBlood).toBe(true);
        });

        it('should unlock combo_5 when reaching 5x combo', () => {
            const gameState = { maxComboThisGame: 5 };
            const progress = { maxCombo: 5 };
            const unlocked = [];
            const result = getNewlyUnlockedAchievements(gameState, progress, unlocked);
            const hasCombo5 = result.some(a => a.id === 'combo_5');
            expect(hasCombo5).toBe(true);
        });

        it('should unlock multiple achievements at once', () => {
            const gameState = { maxComboThisGame: 10 };
            const progress = { levelsCompleted: 1, totalScore: 10000, maxCombo: 10 };
            const unlocked = [];
            const result = getNewlyUnlockedAchievements(gameState, progress, unlocked);
            expect(result.length).toBeGreaterThanOrEqual(2);
        });
    });
});
