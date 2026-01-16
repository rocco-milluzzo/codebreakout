import { describe, it, expect } from 'vitest';
import {
    ballIntersectsBrick,
    checkPaddleCollision,
    checkBrickCollision,
    applyBrickBounce,
    checkBrickCollisions,
    distance,
    pointInRect,
} from '../../src/systems/collision.js';
import { CONFIG } from '../../src/config.js';

describe('Collision System', () => {
    describe('ballIntersectsBrick', () => {
        it('should return true when ball is inside brick', () => {
            const ball = { x: 135, y: 112.5, radius: 8 };
            const brick = { x: 100, y: 100, width: 70, height: 25 };
            expect(ballIntersectsBrick(ball, brick)).toBe(true);
        });

        it('should return true when ball touches brick edge', () => {
            const ball = { x: 98, y: 112.5, radius: 8 };
            const brick = { x: 100, y: 100, width: 70, height: 25 };
            expect(ballIntersectsBrick(ball, brick)).toBe(true);
        });

        it('should return false when ball is far from brick', () => {
            const ball = { x: 50, y: 50, radius: 8 };
            const brick = { x: 100, y: 100, width: 70, height: 25 };
            expect(ballIntersectsBrick(ball, brick)).toBe(false);
        });

        it('should return true when ball touches brick corner', () => {
            const ball = { x: 95, y: 95, radius: 8 };
            const brick = { x: 100, y: 100, width: 70, height: 25 };
            expect(ballIntersectsBrick(ball, brick)).toBe(true);
        });
    });

    describe('checkPaddleCollision', () => {
        const paddle = { x: 100, y: 500, width: 100, height: 15 };

        it('should return true when ball hits paddle top', () => {
            const ball = { x: 150, y: 495, radius: 8, dy: 5 };
            expect(checkPaddleCollision(ball, paddle)).toBe(true);
        });

        it('should return false when ball is going up', () => {
            const ball = { x: 150, y: 495, radius: 8, dy: -5 };
            expect(checkPaddleCollision(ball, paddle)).toBe(false);
        });

        it('should return false when ball is above paddle', () => {
            const ball = { x: 150, y: 400, radius: 8, dy: 5 };
            expect(checkPaddleCollision(ball, paddle)).toBe(false);
        });

        it('should return false when ball is to the left', () => {
            const ball = { x: 50, y: 500, radius: 8, dy: 5 };
            expect(checkPaddleCollision(ball, paddle)).toBe(false);
        });

        it('should return false when ball is to the right', () => {
            const ball = { x: 250, y: 500, radius: 8, dy: 5 };
            expect(checkPaddleCollision(ball, paddle)).toBe(false);
        });

        it('should update ball velocity on collision', () => {
            const ball = { x: 150, y: 495, radius: 8, dx: 3, dy: 5 };
            checkPaddleCollision(ball, paddle);
            expect(ball.dy).toBeLessThan(0); // Should bounce up
        });

        it('should vary bounce angle based on hit position', () => {
            const ballLeft = { x: 110, y: 495, radius: 8, dx: 3, dy: 5 };
            const ballRight = { x: 190, y: 495, radius: 8, dx: 3, dy: 5 };
            checkPaddleCollision(ballLeft, paddle);
            checkPaddleCollision(ballRight, paddle);
            expect(ballLeft.dx).not.toBe(ballRight.dx);
        });

        it('should prevent too horizontal angles', () => {
            const ball = { x: 100, y: 495, radius: 8, dx: 3, dy: 5 };
            checkPaddleCollision(ball, paddle);
            const angle = Math.abs(Math.atan2(ball.dy, ball.dx));
            expect(angle).toBeGreaterThanOrEqual(CONFIG.MIN_BOUNCE_ANGLE);
        });

        it('should reposition ball above paddle', () => {
            const ball = { x: 150, y: 505, radius: 8, dx: 3, dy: 5 };
            checkPaddleCollision(ball, paddle);
            expect(ball.y).toBe(paddle.y - ball.radius);
        });
    });

    describe('checkBrickCollision', () => {
        it('should return hit: false when no collision', () => {
            const ball = { x: 50, y: 50, radius: 8 };
            const brick = { x: 100, y: 100, width: 70, height: 25 };
            const result = checkBrickCollision(ball, brick);
            expect(result.hit).toBe(false);
            expect(result.side).toBeNull();
        });

        it('should return hit: true with horizontal side', () => {
            const ball = { x: 95, y: 112.5, radius: 8 };
            const brick = { x: 100, y: 100, width: 70, height: 25 };
            const result = checkBrickCollision(ball, brick);
            expect(result.hit).toBe(true);
            expect(result.side).toBe('horizontal');
        });

        it('should return hit: true with vertical side', () => {
            const ball = { x: 135, y: 95, radius: 8 };
            const brick = { x: 100, y: 100, width: 70, height: 25 };
            const result = checkBrickCollision(ball, brick);
            expect(result.hit).toBe(true);
            expect(result.side).toBe('vertical');
        });
    });

    describe('applyBrickBounce', () => {
        it('should reverse dx for horizontal collision', () => {
            const ball = { dx: 3, dy: -4 };
            applyBrickBounce(ball, 'horizontal');
            expect(ball.dx).toBe(-3);
            expect(ball.dy).toBe(-4);
        });

        it('should reverse dy for vertical collision', () => {
            const ball = { dx: 3, dy: -4 };
            applyBrickBounce(ball, 'vertical');
            expect(ball.dx).toBe(3);
            expect(ball.dy).toBe(4);
        });
    });

    describe('checkBrickCollisions', () => {
        it('should return null when no collision', () => {
            const ball = { x: 50, y: 50, radius: 8, dx: 3, dy: -4 };
            const bricks = [
                { x: 100, y: 100, width: 70, height: 25, hits: 0, maxHits: 1, type: 'STANDARD' },
            ];
            const result = checkBrickCollisions(ball, bricks);
            expect(result).toBeNull();
        });

        it('should return hit brick info', () => {
            const ball = { x: 135, y: 112.5, radius: 8, dx: 3, dy: -4, fireball: false };
            const bricks = [
                { x: 100, y: 100, width: 70, height: 25, hits: 0, maxHits: 1, type: 'STANDARD' },
            ];
            const result = checkBrickCollisions(ball, bricks);
            expect(result).not.toBeNull();
            expect(result.brick).toBe(bricks[0]);
            expect(result.index).toBe(0);
        });

        it('should bounce ball on collision', () => {
            const ball = { x: 135, y: 95, radius: 8, dx: 3, dy: 4, fireball: false };
            const bricks = [
                { x: 100, y: 100, width: 70, height: 25, hits: 0, maxHits: 1, type: 'STANDARD' },
            ];
            checkBrickCollisions(ball, bricks);
            expect(ball.dy).toBe(-4);
        });

        it('should skip destroyed bricks', () => {
            const ball = { x: 135, y: 112.5, radius: 8, dx: 3, dy: -4, fireball: false };
            const bricks = [
                { x: 100, y: 100, width: 70, height: 25, hits: 0, maxHits: 1, type: 'STANDARD', destroyed: true },
            ];
            const result = checkBrickCollisions(ball, bricks);
            expect(result).toBeNull();
        });

        it('should penetrate with fireball on last hit', () => {
            const ball = { x: 135, y: 112.5, radius: 8, dx: 3, dy: -4, fireball: true };
            const bricks = [
                { x: 100, y: 100, width: 70, height: 25, hits: 0, maxHits: 1, type: 'STANDARD' },
            ];
            const originalDy = ball.dy;
            const result = checkBrickCollisions(ball, bricks);
            expect(result.penetrated).toBe(true);
            expect(ball.dy).toBe(originalDy); // Did not bounce
        });

        it('should not penetrate unbreakable brick', () => {
            const ball = { x: 135, y: 112.5, radius: 8, dx: 3, dy: -4, fireball: true };
            const bricks = [
                { x: 100, y: 100, width: 70, height: 25, hits: 0, maxHits: -1, type: 'UNBREAKABLE' },
            ];
            const originalDy = ball.dy;
            const result = checkBrickCollisions(ball, bricks);
            expect(result.penetrated).toBe(false);
            expect(ball.dy).not.toBe(originalDy); // Did bounce
        });
    });

    describe('distance', () => {
        it('should calculate distance between two points', () => {
            expect(distance(0, 0, 3, 4)).toBe(5);
        });

        it('should return 0 for same point', () => {
            expect(distance(5, 5, 5, 5)).toBe(0);
        });

        it('should handle negative coordinates', () => {
            expect(distance(-3, -4, 0, 0)).toBe(5);
        });
    });

    describe('pointInRect', () => {
        it('should return true when point is inside rect', () => {
            expect(pointInRect(150, 150, 100, 100, 100, 100)).toBe(true);
        });

        it('should return true when point is on edge', () => {
            expect(pointInRect(100, 150, 100, 100, 100, 100)).toBe(true);
            expect(pointInRect(200, 150, 100, 100, 100, 100)).toBe(true);
        });

        it('should return false when point is outside', () => {
            expect(pointInRect(50, 150, 100, 100, 100, 100)).toBe(false);
            expect(pointInRect(250, 150, 100, 100, 100, 100)).toBe(false);
        });
    });
});
