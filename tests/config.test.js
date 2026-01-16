import { describe, it, expect } from 'vitest';
import { CONFIG } from '../src/config.js';

describe('CONFIG', () => {
    describe('Canvas settings', () => {
        it('should have valid canvas dimensions', () => {
            expect(CONFIG.CANVAS_WIDTH).toBe(800);
            expect(CONFIG.CANVAS_HEIGHT).toBe(600);
        });
    });

    describe('Paddle settings', () => {
        it('should have valid paddle dimensions', () => {
            expect(CONFIG.PADDLE_WIDTH).toBe(100);
            expect(CONFIG.PADDLE_HEIGHT).toBe(15);
        });

        it('should have valid paddle speed', () => {
            expect(CONFIG.PADDLE_SPEED).toBe(8);
            expect(CONFIG.PADDLE_SPEED).toBeGreaterThan(0);
        });

        it('should have valid paddle Y offset', () => {
            expect(CONFIG.PADDLE_Y_OFFSET).toBe(40);
            expect(CONFIG.PADDLE_Y_OFFSET).toBeGreaterThan(0);
        });
    });

    describe('Ball settings', () => {
        it('should have valid ball radius', () => {
            expect(CONFIG.BALL_RADIUS).toBe(8);
            expect(CONFIG.BALL_RADIUS).toBeGreaterThan(0);
        });

        it('should have valid ball speed settings', () => {
            expect(CONFIG.BALL_INITIAL_SPEED).toBe(5);
            expect(CONFIG.BALL_MAX_SPEED).toBe(12);
            expect(CONFIG.BALL_SPEED_INCREMENT).toBe(0.1);
            expect(CONFIG.BALL_MAX_SPEED).toBeGreaterThan(CONFIG.BALL_INITIAL_SPEED);
        });

        it('should have valid minimum bounce angle', () => {
            expect(CONFIG.MIN_BOUNCE_ANGLE).toBe(Math.PI / 6);
            expect(CONFIG.MIN_BOUNCE_ANGLE).toBeGreaterThan(0);
            expect(CONFIG.MIN_BOUNCE_ANGLE).toBeLessThan(Math.PI / 2);
        });

        it('should have mobile speed multiplier', () => {
            expect(CONFIG.MOBILE_SPEED_MULTIPLIER).toBe(2);
        });
    });

    describe('Brick settings', () => {
        it('should have valid brick grid layout', () => {
            expect(CONFIG.BRICK_ROWS).toBe(6);
            expect(CONFIG.BRICK_COLS).toBe(10);
        });

        it('should have valid brick dimensions', () => {
            expect(CONFIG.BRICK_WIDTH).toBe(70);
            expect(CONFIG.BRICK_HEIGHT).toBe(25);
            expect(CONFIG.BRICK_PADDING).toBe(5);
        });

        it('should have valid brick offsets', () => {
            expect(CONFIG.BRICK_OFFSET_TOP).toBe(80);
            expect(CONFIG.BRICK_OFFSET_LEFT).toBe(35);
        });
    });

    describe('Gameplay settings', () => {
        it('should have valid lives settings', () => {
            expect(CONFIG.INITIAL_LIVES).toBe(3);
            expect(CONFIG.MAX_LIVES).toBe(5);
            expect(CONFIG.MAX_LIVES).toBeGreaterThanOrEqual(CONFIG.INITIAL_LIVES);
        });

        it('should have valid multiplier settings', () => {
            expect(CONFIG.MAX_MULTIPLIER).toBe(5.0);
            expect(CONFIG.MULTIPLIER_INCREMENT).toBe(0.05);
        });

        it('should have max balls limit', () => {
            expect(CONFIG.MAX_BALLS).toBe(5);
            expect(CONFIG.MAX_BALLS).toBeGreaterThan(0);
        });
    });

    describe('Powerup settings', () => {
        it('should have valid powerup drop settings', () => {
            expect(CONFIG.POWERUP_DROP_CHANCE).toBe(0.12);
            expect(CONFIG.POWERUP_DROP_CHANCE).toBeGreaterThan(0);
            expect(CONFIG.POWERUP_DROP_CHANCE).toBeLessThan(1);
        });

        it('should have valid powerup movement settings', () => {
            expect(CONFIG.POWERUP_SPEED).toBe(2);
            expect(CONFIG.POWERUP_SIZE).toBe(25);
        });

        it('should have valid powerup durations', () => {
            expect(CONFIG.POWERUP_DURATION.WIDE_PADDLE).toBe(12000);
            expect(CONFIG.POWERUP_DURATION.SLOWMO).toBe(8000);
            expect(CONFIG.POWERUP_DURATION.SHIELD).toBe(8000);
            expect(CONFIG.POWERUP_DURATION.MINI_PADDLE).toBe(10000);
            expect(CONFIG.POWERUP_DURATION.FAST_BALL).toBe(10000);
            expect(CONFIG.POWERUP_DURATION.GLITCH).toBe(4000);
            expect(CONFIG.POWERUP_DURATION.LASER).toBe(8000);
            expect(CONFIG.POWERUP_DURATION.FIREBALL).toBe(6000);
            expect(CONFIG.POWERUP_DURATION.MAGNET).toBe(10000);
            expect(CONFIG.POWERUP_DURATION.INVERT_CONTROLS).toBe(8000);
            expect(CONFIG.POWERUP_DURATION.SPLIT_PADDLE).toBe(12000);
        });

        it('should have max powerup stacks', () => {
            expect(CONFIG.MAX_POWERUP_STACKS).toBe(2);
        });
    });

    describe('Easy Mode settings', () => {
        it('should have valid easy mode lives', () => {
            expect(CONFIG.EASY_MODE.INITIAL_LIVES).toBe(10);
            expect(CONFIG.EASY_MODE.MAX_LIVES).toBe(15);
        });

        it('should have paddle width multiplier', () => {
            expect(CONFIG.EASY_MODE.PADDLE_WIDTH_MULTIPLIER).toBe(1.5);
        });

        it('should have powerup drop multiplier', () => {
            expect(CONFIG.EASY_MODE.POWERUP_DROP_MULTIPLIER).toBe(2.0);
        });
    });

    describe('Configuration consistency', () => {
        it('should have brick grid roughly fit within canvas', () => {
            const totalBrickWidth = CONFIG.BRICK_COLS * (CONFIG.BRICK_WIDTH + CONFIG.BRICK_PADDING);
            // Bricks extend to edge of canvas, accounting for offset
            expect(totalBrickWidth).toBeLessThanOrEqual(CONFIG.CANVAS_WIDTH);
        });

        it('should have paddle fit within canvas', () => {
            expect(CONFIG.PADDLE_WIDTH).toBeLessThan(CONFIG.CANVAS_WIDTH);
        });

        it('should have ball radius appropriate for gameplay', () => {
            // Ball should be small enough to navigate between bricks
            expect(CONFIG.BALL_RADIUS * 2).toBeLessThan(CONFIG.BRICK_WIDTH);
        });
    });
});
