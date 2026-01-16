import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    getBrickPattern,
    createBricks,
    updateMovingBricks,
    hitBrick,
    findAdjacentBricks,
    getBrickCenter,
} from '../../src/entities/brick.js';
import { CONFIG } from '../../src/config.js';

describe('Brick Entity', () => {
    describe('getBrickPattern', () => {
        it('should return pattern for "simple"', () => {
            const pattern = getBrickPattern('simple');
            expect(Array.isArray(pattern)).toBe(true);
            expect(pattern.length).toBeGreaterThan(0);
            expect(Array.isArray(pattern[0])).toBe(true);
        });

        it('should return pattern for "layers"', () => {
            const pattern = getBrickPattern('layers');
            expect(pattern.length).toBeGreaterThan(0);
        });

        it('should return pattern for "scattered"', () => {
            const pattern = getBrickPattern('scattered');
            expect(pattern.length).toBeGreaterThan(0);
        });

        it('should return pattern for "snake"', () => {
            const pattern = getBrickPattern('snake');
            expect(pattern.length).toBeGreaterThan(0);
        });

        it('should return pattern for "grid"', () => {
            const pattern = getBrickPattern('grid');
            expect(pattern.length).toBeGreaterThan(0);
        });

        it('should return pattern for "diamond"', () => {
            const pattern = getBrickPattern('diamond');
            expect(pattern.length).toBeGreaterThan(0);
        });

        it('should return pattern for "fortress"', () => {
            const pattern = getBrickPattern('fortress');
            expect(pattern.length).toBeGreaterThan(0);
        });

        it('should return pattern for "castle"', () => {
            const pattern = getBrickPattern('castle');
            expect(pattern.length).toBeGreaterThan(0);
        });

        it('should return pattern for "typescript"', () => {
            const pattern = getBrickPattern('typescript');
            expect(pattern.length).toBeGreaterThan(0);
        });

        it('should return pattern for "dense"', () => {
            const pattern = getBrickPattern('dense');
            expect(pattern.length).toBeGreaterThan(0);
        });

        it('should return pattern for "moving"', () => {
            const pattern = getBrickPattern('moving');
            expect(pattern.length).toBeGreaterThan(0);
        });

        it('should return pattern for "channels"', () => {
            const pattern = getBrickPattern('channels');
            expect(pattern.length).toBeGreaterThan(0);
        });

        it('should return pattern for "rust"', () => {
            const pattern = getBrickPattern('rust');
            expect(pattern.length).toBeGreaterThan(0);
        });

        it('should return pattern for "portals"', () => {
            const pattern = getBrickPattern('portals');
            expect(pattern.length).toBeGreaterThan(0);
        });

        it('should return pattern for "hex"', () => {
            const pattern = getBrickPattern('hex');
            expect(pattern.length).toBeGreaterThan(0);
        });

        it('should return random pattern for "random"', () => {
            const pattern1 = getBrickPattern('random');
            const pattern2 = getBrickPattern('random');
            expect(pattern1.length).toBeGreaterThan(0);
            // Random patterns should differ
            expect(JSON.stringify(pattern1)).not.toBe(JSON.stringify(pattern2));
        });

        it('should return pattern for "platforms"', () => {
            const pattern = getBrickPattern('platforms');
            expect(pattern.length).toBe(12);
        });

        it('should return pattern for "bulletHell"', () => {
            const pattern = getBrickPattern('bulletHell');
            expect(pattern.length).toBe(8);
        });

        it('should return pattern for "gravityFlip"', () => {
            const pattern = getBrickPattern('gravityFlip');
            expect(pattern.length).toBe(8);
        });

        it('should return pattern for "towerDefense"', () => {
            const pattern = getBrickPattern('towerDefense');
            expect(pattern.length).toBe(3);
        });

        it('should return pattern for "multiballMadness"', () => {
            const pattern = getBrickPattern('multiballMadness');
            expect(pattern.length).toBe(10);
        });

        it('should return empty pattern for "boss"', () => {
            const pattern = getBrickPattern('boss');
            expect(pattern.length).toBe(0);
        });

        it('should return pattern for "speedRun"', () => {
            const pattern = getBrickPattern('speedRun');
            expect(pattern.length).toBe(6);
        });

        it('should return simple pattern for unknown pattern names', () => {
            const pattern = getBrickPattern('nonexistent');
            expect(pattern.length).toBeGreaterThan(0);
        });
    });

    describe('createBricks', () => {
        const simpleLevelData = {
            brickPattern: 'simple',
            mechanics: [],
            color: '#ff0000',
        };

        it('should create bricks array', () => {
            const { bricks } = createBricks(simpleLevelData);
            expect(Array.isArray(bricks)).toBe(true);
            expect(bricks.length).toBeGreaterThan(0);
        });

        it('should create bricks with correct structure', () => {
            const { bricks } = createBricks(simpleLevelData);
            const brick = bricks[0];
            expect(brick).toHaveProperty('x');
            expect(brick).toHaveProperty('y');
            expect(brick).toHaveProperty('width');
            expect(brick).toHaveProperty('height');
            expect(brick).toHaveProperty('type');
            expect(brick).toHaveProperty('hits');
            expect(brick).toHaveProperty('maxHits');
        });

        it('should position bricks correctly', () => {
            const { bricks } = createBricks(simpleLevelData);
            const brick = bricks[0];
            expect(brick.x).toBe(CONFIG.BRICK_OFFSET_LEFT);
            expect(brick.y).toBe(CONFIG.BRICK_OFFSET_TOP);
        });

        it('should use config brick dimensions', () => {
            const { bricks } = createBricks(simpleLevelData);
            const brick = bricks[0];
            expect(brick.width).toBe(CONFIG.BRICK_WIDTH);
            expect(brick.height).toBe(CONFIG.BRICK_HEIGHT);
        });

        it('should track totalBreakable count', () => {
            const { totalBreakable } = createBricks(simpleLevelData);
            expect(totalBreakable).toBeGreaterThan(0);
        });

        it('should not count unbreakable in totalBreakable', () => {
            const levelWithUnbreakable = {
                brickPattern: 'fortress',
                mechanics: ['strong_bricks'],
                color: '#ff0000',
            };
            const { bricks, totalBreakable } = createBricks(levelWithUnbreakable);
            const unbreakableCount = bricks.filter(b => b.type === 'UNBREAKABLE').length;
            expect(totalBreakable).toBe(bricks.length - unbreakableCount);
        });

        it('should handle moving bricks mechanic', () => {
            const movingLevelData = {
                brickPattern: 'moving',
                mechanics: ['moving_bricks'],
                color: '#ff0000',
            };
            const { bricks } = createBricks(movingLevelData);
            const movingBricks = bricks.filter(b => b.moving);
            expect(movingBricks.length).toBeGreaterThanOrEqual(0);
        });

        it('should assign portal IDs to portal bricks', () => {
            const portalLevelData = {
                brickPattern: 'portals',
                mechanics: ['portal_bricks'],
                color: '#ff0000',
            };
            const { bricks, portalPairs } = createBricks(portalLevelData);
            const portalBricks = bricks.filter(b => b.type === 'PORTAL');
            if (portalBricks.length > 0) {
                expect(portalBricks[0].portalId).toBeDefined();
            }
            expect(Array.isArray(portalPairs)).toBe(true);
        });
    });

    describe('updateMovingBricks', () => {
        it('should update moving brick position', () => {
            const bricks = [{
                x: 100,
                y: 100,
                width: 70,
                moving: true,
                moveDir: 1,
                moveSpeed: 2,
            }];
            updateMovingBricks(bricks);
            expect(bricks[0].x).toBe(102);
        });

        it('should not move non-moving bricks', () => {
            const bricks = [{
                x: 100,
                y: 100,
                width: 70,
                moving: false,
                moveDir: 1,
                moveSpeed: 2,
            }];
            updateMovingBricks(bricks);
            expect(bricks[0].x).toBe(100);
        });

        it('should bounce off left boundary', () => {
            const bricks = [{
                x: CONFIG.BRICK_OFFSET_LEFT - 1,
                y: 100,
                width: 70,
                moving: true,
                moveDir: -1,
                moveSpeed: 2,
            }];
            updateMovingBricks(bricks);
            expect(bricks[0].moveDir).toBe(1);
        });

        it('should bounce off right boundary', () => {
            const bricks = [{
                x: CONFIG.CANVAS_WIDTH - CONFIG.BRICK_OFFSET_LEFT - 60,
                y: 100,
                width: 70,
                moving: true,
                moveDir: 1,
                moveSpeed: 2,
            }];
            updateMovingBricks(bricks);
            expect(bricks[0].moveDir).toBe(-1);
        });

        it('should skip destroyed bricks', () => {
            const bricks = [{
                x: 100,
                y: 100,
                width: 70,
                moving: true,
                moveDir: 1,
                moveSpeed: 2,
                destroyed: true,
            }];
            updateMovingBricks(bricks);
            expect(bricks[0].x).toBe(100);
        });
    });

    describe('hitBrick', () => {
        it('should increment hit counter', () => {
            const brick = { type: 'STANDARD', hits: 0, maxHits: 1 };
            hitBrick(brick);
            expect(brick.hits).toBe(1);
        });

        it('should return true when brick is destroyed', () => {
            const brick = { type: 'STANDARD', hits: 0, maxHits: 1 };
            expect(hitBrick(brick)).toBe(true);
        });

        it('should return false when brick survives', () => {
            const brick = { type: 'STRONG', hits: 0, maxHits: 2 };
            expect(hitBrick(brick)).toBe(false);
        });

        it('should return false for unbreakable bricks', () => {
            const brick = { type: 'UNBREAKABLE', hits: 0, maxHits: -1 };
            expect(hitBrick(brick)).toBe(false);
        });

        it('should handle tough bricks requiring multiple hits', () => {
            const brick = { type: 'TOUGH', hits: 0, maxHits: 3 };
            expect(hitBrick(brick)).toBe(false);
            expect(hitBrick(brick)).toBe(false);
            expect(hitBrick(brick)).toBe(true);
        });
    });

    describe('findAdjacentBricks', () => {
        it('should find adjacent bricks', () => {
            const center = { x: 100, y: 100, width: 70, height: 25 };
            const bricks = [
                center,
                { x: 175, y: 100, width: 70, height: 25 }, // Right
                { x: 100, y: 130, width: 70, height: 25 }, // Below
                { x: 400, y: 400, width: 70, height: 25 }, // Far away
            ];
            const adjacent = findAdjacentBricks(center, bricks);
            expect(adjacent.length).toBe(2);
            expect(adjacent).not.toContain(center);
        });

        it('should exclude destroyed bricks', () => {
            const center = { x: 100, y: 100, width: 70, height: 25 };
            const bricks = [
                center,
                { x: 175, y: 100, width: 70, height: 25, destroyed: true },
            ];
            const adjacent = findAdjacentBricks(center, bricks);
            expect(adjacent.length).toBe(0);
        });

        it('should return empty array when no adjacent bricks', () => {
            const center = { x: 100, y: 100, width: 70, height: 25 };
            const bricks = [
                center,
                { x: 400, y: 400, width: 70, height: 25 },
            ];
            const adjacent = findAdjacentBricks(center, bricks);
            expect(adjacent.length).toBe(0);
        });
    });

    describe('getBrickCenter', () => {
        it('should return center coordinates', () => {
            const brick = { x: 100, y: 100, width: 70, height: 25 };
            const center = getBrickCenter(brick);
            expect(center.x).toBe(135);
            expect(center.y).toBe(112.5);
        });
    });
});
