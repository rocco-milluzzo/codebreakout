import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    createPowerup,
    spawnPositivePowerup,
    spawnNegativePowerup,
    updatePowerupPosition,
    checkPowerupPaddleCollision,
    isPowerupOffScreen,
    updatePowerups,
    createLaser,
    updateLaserPosition,
    isLaserOffScreen,
    checkLaserBrickCollision,
    fireLasers,
} from '../../src/entities/powerup.js';
import { CONFIG } from '../../src/config.js';
import { POWERUP_TYPES } from '../../src/powerups.js';

describe('Powerup Entity', () => {
    describe('createPowerup', () => {
        it('should create powerup at specified position', () => {
            const powerup = createPowerup(100, 200, 'LASER');
            expect(powerup.x).toBe(100);
            expect(powerup.y).toBe(200);
        });

        it('should set powerup type', () => {
            const powerup = createPowerup(100, 200, 'LASER');
            expect(powerup.type).toBe('LASER');
        });

        it('should spread powerup type properties', () => {
            const powerup = createPowerup(100, 200, 'LASER');
            expect(powerup.name).toBe(POWERUP_TYPES.LASER.name);
            expect(powerup.color).toBe(POWERUP_TYPES.LASER.color);
            expect(powerup.symbol).toBe(POWERUP_TYPES.LASER.symbol);
            expect(powerup.positive).toBe(POWERUP_TYPES.LASER.positive);
        });
    });

    describe('spawnPositivePowerup', () => {
        it('should create a positive powerup', () => {
            const powerup = spawnPositivePowerup(100, 200);
            expect(powerup.positive).toBe(true);
        });

        it('should position at specified coordinates', () => {
            const powerup = spawnPositivePowerup(150, 250);
            expect(powerup.x).toBe(150);
            expect(powerup.y).toBe(250);
        });

        it('should apply rarity modifier', () => {
            const powerup = spawnPositivePowerup(100, 200, 0.5);
            expect(powerup.positive).toBe(true);
        });
    });

    describe('spawnNegativePowerup', () => {
        it('should create a negative powerup', () => {
            const powerup = spawnNegativePowerup(100, 200);
            expect(powerup.positive).toBe(false);
        });

        it('should position at specified coordinates', () => {
            const powerup = spawnNegativePowerup(150, 250);
            expect(powerup.x).toBe(150);
            expect(powerup.y).toBe(250);
        });
    });

    describe('updatePowerupPosition', () => {
        it('should move powerup down', () => {
            const powerup = { x: 100, y: 200 };
            updatePowerupPosition(powerup);
            expect(powerup.y).toBe(200 + CONFIG.POWERUP_SPEED);
        });
    });

    describe('checkPowerupPaddleCollision', () => {
        const paddle = { x: 100, y: 500, width: 100, height: 15 };

        it('should return true when powerup overlaps paddle', () => {
            const powerup = { x: 150, y: 500 };
            expect(checkPowerupPaddleCollision(powerup, paddle)).toBe(true);
        });

        it('should return false when powerup is above paddle', () => {
            const powerup = { x: 150, y: 400 };
            expect(checkPowerupPaddleCollision(powerup, paddle)).toBe(false);
        });

        it('should return false when powerup is to the left', () => {
            const powerup = { x: 50, y: 500 };
            expect(checkPowerupPaddleCollision(powerup, paddle)).toBe(false);
        });

        it('should return false when powerup is to the right', () => {
            const powerup = { x: 250, y: 500 };
            expect(checkPowerupPaddleCollision(powerup, paddle)).toBe(false);
        });

        it('should return false when powerup is below paddle', () => {
            const powerup = { x: 150, y: 550 };
            expect(checkPowerupPaddleCollision(powerup, paddle)).toBe(false);
        });
    });

    describe('isPowerupOffScreen', () => {
        it('should return true when below screen', () => {
            const powerup = { y: CONFIG.CANVAS_HEIGHT + 10 };
            expect(isPowerupOffScreen(powerup)).toBe(true);
        });

        it('should return false when on screen', () => {
            const powerup = { y: 300 };
            expect(isPowerupOffScreen(powerup)).toBe(false);
        });

        it('should return false when at bottom edge', () => {
            const powerup = { y: CONFIG.CANVAS_HEIGHT - 10 };
            expect(isPowerupOffScreen(powerup)).toBe(false);
        });
    });

    describe('updatePowerups', () => {
        const paddle = { x: 100, y: 500, width: 100, height: 15 };

        it('should categorize collected powerups', () => {
            const powerups = [
                { x: 150, y: 500 }, // Will collide
            ];
            const result = updatePowerups(powerups, paddle);
            expect(result.collected.length).toBe(1);
        });

        it('should categorize missed powerups', () => {
            const powerups = [
                { x: 150, y: CONFIG.CANVAS_HEIGHT + 10 }, // Off screen
            ];
            const result = updatePowerups(powerups, paddle);
            expect(result.missed.length).toBe(1);
        });

        it('should keep remaining powerups', () => {
            const powerups = [
                { x: 150, y: 300 }, // Still falling
            ];
            const result = updatePowerups(powerups, paddle);
            expect(result.remaining.length).toBe(1);
        });

        it('should update powerup positions', () => {
            const powerups = [{ x: 150, y: 300 }];
            updatePowerups(powerups, paddle);
            expect(powerups[0].y).toBe(300 + CONFIG.POWERUP_SPEED);
        });

        it('should handle mixed powerup states', () => {
            const powerups = [
                { x: 150, y: 500 },                       // Collected
                { x: 150, y: CONFIG.CANVAS_HEIGHT + 10 }, // Missed
                { x: 150, y: 300 },                       // Remaining
            ];
            const result = updatePowerups(powerups, paddle);
            expect(result.collected.length).toBe(1);
            expect(result.missed.length).toBe(1);
            expect(result.remaining.length).toBe(1);
        });
    });
});

describe('Laser Entity', () => {
    describe('createLaser', () => {
        it('should create laser at position', () => {
            const laser = createLaser(100, 200);
            expect(laser.x).toBe(100);
            expect(laser.y).toBe(200);
        });
    });

    describe('updateLaserPosition', () => {
        it('should move laser upward', () => {
            const laser = { x: 100, y: 200 };
            updateLaserPosition(laser);
            expect(laser.y).toBe(190);
        });
    });

    describe('isLaserOffScreen', () => {
        it('should return true when above screen', () => {
            const laser = { y: -10 };
            expect(isLaserOffScreen(laser)).toBe(true);
        });

        it('should return false when on screen', () => {
            const laser = { y: 100 };
            expect(isLaserOffScreen(laser)).toBe(false);
        });
    });

    describe('checkLaserBrickCollision', () => {
        const brick = { x: 100, y: 100, width: 70, height: 25 };

        it('should return true when laser hits brick', () => {
            const laser = { x: 120, y: 110 };
            expect(checkLaserBrickCollision(laser, brick)).toBe(true);
        });

        it('should return false when laser misses brick', () => {
            const laser = { x: 50, y: 110 };
            expect(checkLaserBrickCollision(laser, brick)).toBe(false);
        });

        it('should return false when laser is above brick', () => {
            const laser = { x: 120, y: 50 };
            expect(checkLaserBrickCollision(laser, brick)).toBe(false);
        });

        it('should return false when laser is below brick', () => {
            const laser = { x: 120, y: 150 };
            expect(checkLaserBrickCollision(laser, brick)).toBe(false);
        });
    });

    describe('fireLasers', () => {
        beforeEach(() => {
            vi.useFakeTimers();
            vi.setSystemTime(0);
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should create two lasers', () => {
            const paddle = { x: 100, y: 500, width: 100 };
            const lasers = fireLasers(paddle, [], 10, true);
            expect(lasers.length).toBe(2);
        });

        it('should position lasers on paddle edges', () => {
            const paddle = { x: 100, y: 500, width: 100 };
            const lasers = fireLasers(paddle, [], 10, true);
            expect(lasers[0].x).toBe(110); // paddle.x + 10
            expect(lasers[1].x).toBe(190); // paddle.x + paddle.width - 10
        });

        it('should position lasers at paddle Y', () => {
            const paddle = { x: 100, y: 500, width: 100 };
            const lasers = fireLasers(paddle, [], 10, true);
            expect(lasers[0].y).toBe(500);
            expect(lasers[1].y).toBe(500);
        });

        it('should return null when exceeding max lasers', () => {
            const paddle = { x: 100, y: 500, width: 100 };
            const existingLasers = new Array(15).fill({});
            const lasers = fireLasers(paddle, existingLasers, 10);
            expect(lasers).toBeNull();
        });

        it('should respect cooldown', () => {
            const paddle = { x: 100, y: 500, width: 100 };
            fireLasers(paddle, [], 10, true);
            vi.setSystemTime(50);
            const lasers = fireLasers(paddle, [], 10, false);
            expect(lasers).toBeNull();
        });

        it('should fire after cooldown', () => {
            const paddle = { x: 100, y: 500, width: 100 };
            fireLasers(paddle, [], 10, true);
            vi.setSystemTime(200);
            const lasers = fireLasers(paddle, [], 10, false);
            expect(lasers).not.toBeNull();
        });

        it('should ignore cooldown when forceFire is true', () => {
            const paddle = { x: 100, y: 500, width: 100 };
            fireLasers(paddle, [], 10, true);
            vi.setSystemTime(50);
            const lasers = fireLasers(paddle, [], 10, true);
            expect(lasers).not.toBeNull();
        });
    });
});
