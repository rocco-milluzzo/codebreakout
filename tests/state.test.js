import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { GameState } from '../src/state.js';
import { CONFIG } from '../src/config.js';

describe('GameState', () => {
    let state;

    beforeEach(() => {
        state = new GameState();
    });

    describe('constructor', () => {
        it('should initialize with default values', () => {
            expect(state.screen).toBe('start');
            expect(state.score).toBe(0);
            expect(state.lives).toBe(CONFIG.INITIAL_LIVES);
            expect(state.level).toBe(0);
            expect(state.multiplier).toBe(1.0);
        });

        it('should call reset on construction', () => {
            expect(state.isPaused).toBe(false);
            expect(state.isLaunched).toBe(false);
            expect(state.perfectLevel).toBe(true);
        });
    });

    describe('reset', () => {
        it('should reset all state values to defaults', () => {
            state.score = 1000;
            state.lives = 1;
            state.level = 5;
            state.multiplier = 3.0;
            state.isPaused = true;

            state.reset();

            expect(state.score).toBe(0);
            expect(state.lives).toBe(CONFIG.INITIAL_LIVES);
            expect(state.level).toBe(0);
            expect(state.multiplier).toBe(1.0);
            expect(state.isPaused).toBe(false);
        });

        it('should reset active powerups', () => {
            state.activePowerups = { LASER: { expiry: Date.now() + 5000, stacks: 1 } };
            state.reset();
            expect(state.activePowerups).toEqual({});
        });

        it('should reset game mode state', () => {
            state.gameMode = 'bonus';
            state.easyMode = true;
            state.reset();
            expect(state.gameMode).toBe('classic');
            expect(state.easyMode).toBe(false);
        });

        it('should reset bonus level state', () => {
            state.bonusActive = true;
            state.bonusEndTime = 999999;
            state.reset();
            expect(state.bonusActive).toBe(false);
            expect(state.bonusEndTime).toBe(0);
        });

        it('should reset score submission flag', () => {
            state.scoreSubmitted = true;
            state.reset();
            expect(state.scoreSubmitted).toBe(false);
        });
    });

    describe('initEasyMode', () => {
        it('should set easy mode flag', () => {
            state.initEasyMode();
            expect(state.easyMode).toBe(true);
        });

        it('should set lives to easy mode initial lives', () => {
            state.initEasyMode();
            expect(state.lives).toBe(CONFIG.EASY_MODE.INITIAL_LIVES);
        });
    });

    describe('getMaxLives', () => {
        it('should return normal max lives when not in easy mode', () => {
            expect(state.getMaxLives()).toBe(CONFIG.MAX_LIVES);
        });

        it('should return easy mode max lives when in easy mode', () => {
            state.initEasyMode();
            expect(state.getMaxLives()).toBe(CONFIG.EASY_MODE.MAX_LIVES);
        });
    });

    describe('getPowerupDropMultiplier', () => {
        it('should return 1.0 when not in easy mode', () => {
            expect(state.getPowerupDropMultiplier()).toBe(1.0);
        });

        it('should return easy mode multiplier when in easy mode', () => {
            state.initEasyMode();
            expect(state.getPowerupDropMultiplier()).toBe(CONFIG.EASY_MODE.POWERUP_DROP_MULTIPLIER);
        });
    });

    describe('getPaddleWidthMultiplier', () => {
        it('should return 1.0 when not in easy mode', () => {
            expect(state.getPaddleWidthMultiplier()).toBe(1.0);
        });

        it('should return easy mode multiplier when in easy mode', () => {
            state.initEasyMode();
            expect(state.getPaddleWidthMultiplier()).toBe(CONFIG.EASY_MODE.PADDLE_WIDTH_MULTIPLIER);
        });
    });

    describe('addScore', () => {
        it('should add base points with multiplier 1', () => {
            const points = state.addScore(100);
            expect(points).toBe(100);
            expect(state.score).toBe(100);
        });

        it('should apply multiplier to points', () => {
            state.multiplier = 2.0;
            const points = state.addScore(100);
            expect(points).toBe(200);
            expect(state.score).toBe(200);
        });

        it('should floor the result', () => {
            state.multiplier = 1.5;
            const points = state.addScore(101);
            expect(points).toBe(151); // floor(101 * 1.5)
        });

        it('should accumulate score', () => {
            state.addScore(100);
            state.addScore(50);
            expect(state.score).toBe(150);
        });
    });

    describe('checkExtraLife', () => {
        it('should return false when score is below 10000', () => {
            state.score = 5000;
            expect(state.checkExtraLife()).toBe(false);
        });

        it('should award extra life at 10000 points', () => {
            state.score = 10000;
            const initialLives = state.lives;
            const result = state.checkExtraLife();
            expect(result).toBe(true);
            expect(state.lives).toBe(initialLives + 1);
        });

        it('should not award extra life twice for same milestone', () => {
            state.score = 10500;
            state.checkExtraLife();
            const livesAfterFirst = state.lives;
            state.checkExtraLife();
            expect(state.lives).toBe(livesAfterFirst);
        });

        it('should award extra life at 20000 points', () => {
            state.score = 10000;
            state.checkExtraLife();
            state.lastExtraLifeScore = 10000;
            state.score = 20000;
            const livesAfterFirst = state.lives;
            expect(state.checkExtraLife()).toBe(true);
            expect(state.lives).toBe(livesAfterFirst + 1);
        });

        it('should not exceed max lives', () => {
            state.lives = CONFIG.MAX_LIVES;
            state.score = 10000;
            expect(state.checkExtraLife()).toBe(false);
            expect(state.lives).toBe(CONFIG.MAX_LIVES);
        });
    });

    describe('incrementMultiplier', () => {
        it('should increase multiplier by increment', () => {
            const initial = state.multiplier;
            state.incrementMultiplier();
            expect(state.multiplier).toBeCloseTo(initial + CONFIG.MULTIPLIER_INCREMENT);
        });

        it('should not exceed max multiplier', () => {
            state.multiplier = CONFIG.MAX_MULTIPLIER;
            state.incrementMultiplier();
            expect(state.multiplier).toBe(CONFIG.MAX_MULTIPLIER);
        });

        it('should track max multiplier', () => {
            state.incrementMultiplier();
            state.incrementMultiplier();
            const peak = state.multiplier;
            state.resetMultiplier();
            expect(state.maxMultiplier).toBeCloseTo(peak);
        });
    });

    describe('resetMultiplier', () => {
        it('should reset multiplier to 1.0', () => {
            state.multiplier = 3.0;
            state.resetMultiplier();
            expect(state.multiplier).toBe(1.0);
        });
    });

    describe('loseLife', () => {
        it('should decrement lives', () => {
            const initial = state.lives;
            state.loseLife();
            expect(state.lives).toBe(initial - 1);
        });

        it('should set perfectLevel to false', () => {
            state.perfectLevel = true;
            state.loseLife();
            expect(state.perfectLevel).toBe(false);
        });

        it('should reset multiplier', () => {
            state.multiplier = 3.0;
            state.loseLife();
            expect(state.multiplier).toBe(1.0);
        });

        it('should return false when lives remain', () => {
            state.lives = 3;
            expect(state.loseLife()).toBe(false);
        });

        it('should return true when no lives remain (game over)', () => {
            state.lives = 1;
            expect(state.loseLife()).toBe(true);
        });
    });

    describe('isPowerupActive', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should return false for inactive powerup', () => {
            expect(state.isPowerupActive('LASER')).toBe(false);
        });

        it('should return true for active powerup (object format)', () => {
            vi.setSystemTime(1000);
            state.activePowerups.LASER = { expiry: 5000, stacks: 1 };
            expect(state.isPowerupActive('LASER')).toBe(true);
        });

        it('should return true for active powerup (number format)', () => {
            vi.setSystemTime(1000);
            state.activePowerups.LASER = 5000;
            expect(state.isPowerupActive('LASER')).toBe(true);
        });

        it('should return false for expired powerup', () => {
            vi.setSystemTime(6000);
            state.activePowerups.LASER = { expiry: 5000, stacks: 1 };
            expect(state.isPowerupActive('LASER')).toBe(false);
        });
    });

    describe('getPowerupStacks', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should return 0 for inactive powerup', () => {
            expect(state.getPowerupStacks('LASER')).toBe(0);
        });

        it('should return 1 for legacy format powerup', () => {
            vi.setSystemTime(1000);
            state.activePowerups.LASER = 5000;
            expect(state.getPowerupStacks('LASER')).toBe(1);
        });

        it('should return stacks for object format powerup', () => {
            vi.setSystemTime(1000);
            state.activePowerups.LASER = { expiry: 5000, stacks: 2 };
            expect(state.getPowerupStacks('LASER')).toBe(2);
        });

        it('should return 0 for expired powerup', () => {
            vi.setSystemTime(6000);
            state.activePowerups.LASER = { expiry: 5000, stacks: 2 };
            expect(state.getPowerupStacks('LASER')).toBe(0);
        });
    });

    describe('activatePowerup', () => {
        beforeEach(() => {
            vi.useFakeTimers();
            vi.setSystemTime(1000);
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should activate new powerup with 1 stack', () => {
            const stacks = state.activatePowerup('LASER', 5000);
            expect(stacks).toBe(1);
            expect(state.activePowerups.LASER.stacks).toBe(1);
            expect(state.activePowerups.LASER.expiry).toBe(6000);
        });

        it('should stack existing powerup', () => {
            state.activatePowerup('LASER', 5000);
            const stacks = state.activatePowerup('LASER', 5000);
            expect(stacks).toBe(2);
            expect(state.activePowerups.LASER.stacks).toBe(2);
        });

        it('should not exceed max stacks', () => {
            state.activatePowerup('LASER', 5000);
            state.activatePowerup('LASER', 5000);
            const stacks = state.activatePowerup('LASER', 5000);
            expect(stacks).toBe(CONFIG.MAX_POWERUP_STACKS);
        });

        it('should reset expiry timer on stack', () => {
            state.activatePowerup('LASER', 5000);
            vi.setSystemTime(3000);
            state.activatePowerup('LASER', 5000);
            expect(state.activePowerups.LASER.expiry).toBe(8000);
        });
    });

    describe('deactivatePowerup', () => {
        it('should remove powerup from active', () => {
            state.activePowerups.LASER = { expiry: 99999, stacks: 1 };
            state.deactivatePowerup('LASER');
            expect(state.activePowerups.LASER).toBeUndefined();
        });

        it('should handle deactivating non-existent powerup', () => {
            expect(() => state.deactivatePowerup('NONEXISTENT')).not.toThrow();
        });
    });

    describe('getExpiredPowerups', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should return empty array when no powerups active', () => {
            const expired = state.getExpiredPowerups();
            expect(expired).toEqual([]);
        });

        it('should return empty array when all powerups still active', () => {
            vi.setSystemTime(1000);
            state.activePowerups.LASER = { expiry: 5000, stacks: 1 };
            state.activePowerups.SHIELD = { expiry: 6000, stacks: 1 };
            const expired = state.getExpiredPowerups();
            expect(expired).toEqual([]);
        });

        it('should return and remove expired powerups (object format)', () => {
            vi.setSystemTime(1000);
            state.activePowerups.LASER = { expiry: 500, stacks: 1 };
            state.activePowerups.SHIELD = { expiry: 5000, stacks: 1 };
            const expired = state.getExpiredPowerups();
            expect(expired).toContain('LASER');
            expect(expired).not.toContain('SHIELD');
            expect(state.activePowerups.LASER).toBeUndefined();
            expect(state.activePowerups.SHIELD).toBeDefined();
        });

        it('should handle legacy number format', () => {
            vi.setSystemTime(1000);
            state.activePowerups.LASER = 500;
            const expired = state.getExpiredPowerups();
            expect(expired).toContain('LASER');
        });

        it('should return multiple expired powerups', () => {
            vi.setSystemTime(10000);
            state.activePowerups.LASER = { expiry: 5000, stacks: 1 };
            state.activePowerups.SHIELD = { expiry: 6000, stacks: 1 };
            state.activePowerups.MAGNET = { expiry: 20000, stacks: 1 };
            const expired = state.getExpiredPowerups();
            expect(expired).toContain('LASER');
            expect(expired).toContain('SHIELD');
            expect(expired).not.toContain('MAGNET');
        });
    });
});
