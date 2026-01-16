import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    createBall,
    enableDoodleMode,
    applyDoodleGravity,
    applyDoodleJump,
    createBallOnPaddle,
    launchBall,
    updateBallPosition,
    checkWallCollision,
    isBallOutOfBounds,
    bounceOffShield,
    updateBallVelocity,
    setBallSpeedMultiplier,
    scaleBallBaseSpeed,
    resetBallSpeed,
    createMultiBalls,
    enableFireball,
    disableFireball,
    syncBallWithPaddle,
} from '../../src/entities/ball.js';
import { CONFIG } from '../../src/config.js';

describe('Ball Entity', () => {
    describe('createBall', () => {
        it('should create a ball at specified position', () => {
            const ball = createBall(100, 200, 5);
            expect(ball.x).toBe(100);
            expect(ball.y).toBe(200);
        });

        it('should set speed correctly', () => {
            const ball = createBall(100, 200, 5);
            expect(ball.speed).toBe(5);
            expect(ball.baseSpeed).toBe(5);
        });

        it('should start with no velocity', () => {
            const ball = createBall(100, 200, 5);
            expect(ball.dx).toBe(0);
            expect(ball.dy).toBe(0);
        });

        it('should use config radius', () => {
            const ball = createBall(100, 200, 5);
            expect(ball.radius).toBe(CONFIG.BALL_RADIUS);
        });

        it('should start as stuck by default', () => {
            const ball = createBall(100, 200, 5);
            expect(ball.stuck).toBe(true);
        });

        it('should allow non-stuck creation', () => {
            const ball = createBall(100, 200, 5, false);
            expect(ball.stuck).toBe(false);
        });

        it('should start visible', () => {
            const ball = createBall(100, 200, 5);
            expect(ball.visible).toBe(true);
        });

        it('should start without fireball mode', () => {
            const ball = createBall(100, 200, 5);
            expect(ball.fireball).toBe(false);
        });

        it('should have unique id', () => {
            const ball1 = createBall(100, 200, 5);
            const ball2 = createBall(100, 200, 5);
            expect(ball1.id).not.toBe(ball2.id);
        });
    });

    describe('enableDoodleMode', () => {
        it('should enable doodle mode', () => {
            const ball = createBall(100, 200, 5);
            enableDoodleMode(ball, 0.5, -10);
            expect(ball.doodleMode).toBe(true);
        });

        it('should set gravity', () => {
            const ball = createBall(100, 200, 5);
            enableDoodleMode(ball, 0.5, -10);
            expect(ball.gravity).toBe(0.5);
        });

        it('should set jump force', () => {
            const ball = createBall(100, 200, 5);
            enableDoodleMode(ball, 0.5, -10);
            expect(ball.jumpForce).toBe(-10);
        });
    });

    describe('applyDoodleGravity', () => {
        it('should increase dy when in doodle mode', () => {
            const ball = createBall(100, 200, 5, false);
            enableDoodleMode(ball, 0.5, -10);
            ball.dy = 0;
            applyDoodleGravity(ball);
            expect(ball.dy).toBe(0.5);
        });

        it('should not exceed max falling speed', () => {
            const ball = createBall(100, 200, 5, false);
            enableDoodleMode(ball, 0.5, -10);
            ball.dy = 20;
            applyDoodleGravity(ball);
            expect(ball.dy).toBe(12);
        });

        it('should not apply gravity when stuck', () => {
            const ball = createBall(100, 200, 5);
            enableDoodleMode(ball, 0.5, -10);
            ball.dy = 0;
            applyDoodleGravity(ball);
            expect(ball.dy).toBe(0);
        });

        it('should not apply gravity when not in doodle mode', () => {
            const ball = createBall(100, 200, 5, false);
            ball.dy = 5;
            applyDoodleGravity(ball);
            expect(ball.dy).toBe(5);
        });
    });

    describe('applyDoodleJump', () => {
        it('should set dy to jump force', () => {
            const ball = createBall(100, 200, 5);
            enableDoodleMode(ball, 0.5, -10);
            applyDoodleJump(ball);
            expect(ball.dy).toBe(-10);
        });

        it('should not affect non-doodle ball', () => {
            const ball = createBall(100, 200, 5);
            ball.dy = 5;
            applyDoodleJump(ball);
            expect(ball.dy).toBe(5);
        });
    });

    describe('createBallOnPaddle', () => {
        it('should position ball on paddle center', () => {
            const paddle = { x: 100, y: 500, width: 100, height: 15 };
            const ball = createBallOnPaddle(paddle, 5);
            expect(ball.x).toBe(150);
        });

        it('should position ball above paddle', () => {
            const paddle = { x: 100, y: 500, width: 100, height: 15 };
            const ball = createBallOnPaddle(paddle, 5);
            expect(ball.y).toBe(500 - CONFIG.BALL_RADIUS - 2);
        });

        it('should create ball as stuck', () => {
            const paddle = { x: 100, y: 500, width: 100, height: 15 };
            const ball = createBallOnPaddle(paddle, 5);
            expect(ball.stuck).toBe(true);
        });
    });

    describe('launchBall', () => {
        beforeEach(() => {
            vi.spyOn(Math, 'random').mockReturnValue(0.5);
        });

        afterEach(() => {
            vi.restoreAllMocks();
        });

        it('should unstick the ball', () => {
            const ball = createBall(100, 200, 5);
            launchBall(ball);
            expect(ball.stuck).toBe(false);
        });

        it('should set velocity', () => {
            const ball = createBall(100, 200, 5);
            launchBall(ball);
            expect(ball.dx).not.toBe(0);
            expect(ball.dy).toBeLessThan(0); // Should go up
        });

        it('should not change already launched ball', () => {
            const ball = createBall(100, 200, 5, false);
            ball.dx = 3;
            ball.dy = -4;
            launchBall(ball);
            expect(ball.dx).toBe(3);
            expect(ball.dy).toBe(-4);
        });
    });

    describe('updateBallPosition', () => {
        it('should update position based on velocity', () => {
            const ball = createBall(100, 200, 5, false);
            ball.dx = 3;
            ball.dy = -4;
            updateBallPosition(ball);
            expect(ball.x).toBe(103);
            expect(ball.y).toBe(196);
        });

        it('should not move stuck ball', () => {
            const ball = createBall(100, 200, 5);
            ball.dx = 3;
            ball.dy = -4;
            updateBallPosition(ball);
            expect(ball.x).toBe(100);
            expect(ball.y).toBe(200);
        });
    });

    describe('checkWallCollision', () => {
        it('should bounce off left wall', () => {
            const ball = createBall(5, 300, 5, false);
            ball.dx = -5;
            const result = checkWallCollision(ball);
            expect(result).toBe('left');
            expect(ball.dx).toBe(5);
        });

        it('should bounce off right wall', () => {
            const ball = createBall(CONFIG.CANVAS_WIDTH - 5, 300, 5, false);
            ball.dx = 5;
            const result = checkWallCollision(ball);
            expect(result).toBe('right');
            expect(ball.dx).toBe(-5);
        });

        it('should bounce off top wall', () => {
            const ball = createBall(400, 5, 5, false);
            ball.dy = -5;
            const result = checkWallCollision(ball);
            expect(result).toBe('top');
            expect(ball.dy).toBe(5);
        });

        it('should return null when no collision', () => {
            const ball = createBall(400, 300, 5, false);
            ball.dx = 3;
            ball.dy = -4;
            const result = checkWallCollision(ball);
            expect(result).toBeNull();
        });

        it('should clamp ball position to left boundary', () => {
            const ball = createBall(-5, 300, 5, false);
            checkWallCollision(ball);
            expect(ball.x).toBe(ball.radius);
        });

        it('should clamp ball position to right boundary', () => {
            const ball = createBall(CONFIG.CANVAS_WIDTH + 5, 300, 5, false);
            checkWallCollision(ball);
            expect(ball.x).toBe(CONFIG.CANVAS_WIDTH - ball.radius);
        });
    });

    describe('isBallOutOfBounds', () => {
        it('should return true when ball is below screen', () => {
            const ball = createBall(400, CONFIG.CANVAS_HEIGHT + 20, 5);
            expect(isBallOutOfBounds(ball)).toBe(true);
        });

        it('should return false when ball is on screen', () => {
            const ball = createBall(400, 300, 5);
            expect(isBallOutOfBounds(ball)).toBe(false);
        });

        it('should return false when ball is at bottom edge', () => {
            const ball = createBall(400, CONFIG.CANVAS_HEIGHT - 10, 5);
            expect(isBallOutOfBounds(ball)).toBe(false);
        });
    });

    describe('bounceOffShield', () => {
        it('should reverse Y direction', () => {
            const ball = createBall(400, CONFIG.CANVAS_HEIGHT - 5, 5, false);
            ball.dy = 5;
            bounceOffShield(ball);
            expect(ball.dy).toBe(-5);
        });

        it('should reposition ball above shield', () => {
            const ball = createBall(400, CONFIG.CANVAS_HEIGHT - 5, 5, false);
            ball.dy = 5;
            bounceOffShield(ball);
            expect(ball.y).toBe(CONFIG.CANVAS_HEIGHT - 20);
        });
    });

    describe('updateBallVelocity', () => {
        it('should normalize velocity to match speed', () => {
            const ball = createBall(400, 300, 5, false);
            ball.dx = 4;
            ball.dy = 3;
            ball.speed = 10;
            updateBallVelocity(ball);
            const newSpeed = Math.sqrt(ball.dx ** 2 + ball.dy ** 2);
            expect(newSpeed).toBeCloseTo(10);
        });

        it('should not affect stuck ball', () => {
            const ball = createBall(400, 300, 5);
            ball.dx = 4;
            ball.dy = 3;
            updateBallVelocity(ball);
            expect(ball.dx).toBe(4);
            expect(ball.dy).toBe(3);
        });

        it('should handle zero velocity', () => {
            const ball = createBall(400, 300, 5, false);
            ball.dx = 0;
            ball.dy = 0;
            updateBallVelocity(ball);
            expect(ball.dx).toBe(0);
            expect(ball.dy).toBe(0);
        });
    });

    describe('setBallSpeedMultiplier', () => {
        it('should multiply speed', () => {
            const ball = createBall(400, 300, 5, false);
            ball.dx = 3;
            ball.dy = -4;
            setBallSpeedMultiplier(ball, 2);
            expect(ball.speed).toBe(10);
        });

        it('should update velocity to match new speed', () => {
            const ball = createBall(400, 300, 5, false);
            ball.dx = 3;
            ball.dy = -4;
            setBallSpeedMultiplier(ball, 2);
            const newSpeed = Math.sqrt(ball.dx ** 2 + ball.dy ** 2);
            expect(newSpeed).toBeCloseTo(10);
        });
    });

    describe('scaleBallBaseSpeed', () => {
        it('should scale base speed', () => {
            const ball = createBall(400, 300, 5, false);
            scaleBallBaseSpeed(ball, 2);
            expect(ball.baseSpeed).toBe(10);
        });

        it('should also update current speed', () => {
            const ball = createBall(400, 300, 5, false);
            ball.dx = 3;
            ball.dy = -4;
            scaleBallBaseSpeed(ball, 2);
            expect(ball.speed).toBe(10);
        });
    });

    describe('resetBallSpeed', () => {
        it('should reset speed to base speed', () => {
            const ball = createBall(400, 300, 5, false);
            ball.speed = 10;
            ball.dx = 6;
            ball.dy = -8;
            resetBallSpeed(ball);
            expect(ball.speed).toBe(5);
        });
    });

    describe('createMultiBalls', () => {
        beforeEach(() => {
            vi.spyOn(Math, 'random').mockReturnValue(0.5);
        });

        afterEach(() => {
            vi.restoreAllMocks();
        });

        it('should create specified number of balls', () => {
            const source = createBall(400, 300, 5, false);
            source.dx = 3;
            source.dy = -4;
            const newBalls = createMultiBalls(source, 2, 5, 1);
            expect(newBalls.length).toBe(2);
        });

        it('should not exceed max balls', () => {
            const source = createBall(400, 300, 5, false);
            source.dx = 3;
            source.dy = -4;
            const newBalls = createMultiBalls(source, 5, 3, 1);
            expect(newBalls.length).toBe(2);
        });

        it('should create balls at source position', () => {
            const source = createBall(400, 300, 5, false);
            source.dx = 3;
            source.dy = -4;
            const newBalls = createMultiBalls(source, 2, 5, 1);
            for (const ball of newBalls) {
                expect(ball.x).toBe(400);
                expect(ball.y).toBe(300);
            }
        });

        it('should create balls that go upward', () => {
            const source = createBall(400, 300, 5, false);
            source.dx = 3;
            source.dy = -4;
            const newBalls = createMultiBalls(source, 2, 5, 1);
            for (const ball of newBalls) {
                expect(ball.dy).toBeLessThan(0);
            }
        });

        it('should inherit fireball state', () => {
            const source = createBall(400, 300, 5, false);
            source.fireball = true;
            source.dx = 3;
            source.dy = -4;
            const newBalls = createMultiBalls(source, 1, 5, 1);
            expect(newBalls[0].fireball).toBe(true);
        });
    });

    describe('enableFireball', () => {
        it('should enable fireball mode', () => {
            const ball = createBall(400, 300, 5);
            enableFireball(ball);
            expect(ball.fireball).toBe(true);
        });
    });

    describe('disableFireball', () => {
        it('should disable fireball mode', () => {
            const ball = createBall(400, 300, 5);
            enableFireball(ball);
            disableFireball(ball);
            expect(ball.fireball).toBe(false);
        });
    });

    describe('syncBallWithPaddle', () => {
        it('should keep stuck ball on paddle', () => {
            const paddle = { x: 100, y: 500, width: 100 };
            const ball = createBall(150, 490, 5);
            ball.stuckOffset = 0;
            syncBallWithPaddle(ball, paddle);
            expect(ball.x).toBe(150);
        });

        it('should respect stuck offset', () => {
            const paddle = { x: 100, y: 500, width: 100 };
            const ball = createBall(150, 490, 5);
            ball.stuckOffset = 10;
            syncBallWithPaddle(ball, paddle);
            expect(ball.x).toBe(160);
        });

        it('should clamp ball to paddle bounds', () => {
            const paddle = { x: 100, y: 500, width: 100 };
            const ball = createBall(150, 490, 5);
            ball.stuckOffset = 200;
            syncBallWithPaddle(ball, paddle);
            expect(ball.x).toBeLessThanOrEqual(paddle.x + paddle.width - ball.radius);
        });

        it('should not affect non-stuck ball', () => {
            const paddle = { x: 100, y: 500, width: 100 };
            const ball = createBall(300, 200, 5, false);
            syncBallWithPaddle(ball, paddle);
            expect(ball.x).toBe(300);
        });
    });
});
