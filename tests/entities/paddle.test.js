import { describe, it, expect } from 'vitest';
import {
    createPaddle,
    updatePaddle,
    setPaddleWidthMultiplier,
    resetPaddleWidth,
    enableMagnet,
    useMagnetCatch,
    enableInvertedControls,
    disableInvertedControls,
    enableSplitPaddle,
    disableSplitPaddle,
} from '../../src/entities/paddle.js';
import { CONFIG } from '../../src/config.js';

describe('Paddle Entity', () => {
    describe('createPaddle', () => {
        it('should create a paddle with given width', () => {
            const paddle = createPaddle(100);
            expect(paddle.width).toBe(100);
            expect(paddle.baseWidth).toBe(100);
        });

        it('should center paddle horizontally', () => {
            const paddle = createPaddle(100);
            expect(paddle.x).toBe(CONFIG.CANVAS_WIDTH / 2 - 50);
        });

        it('should position paddle at correct Y', () => {
            const paddle = createPaddle(100);
            expect(paddle.y).toBe(CONFIG.CANVAS_HEIGHT - CONFIG.PADDLE_Y_OFFSET);
        });

        it('should set correct height from config', () => {
            const paddle = createPaddle(100);
            expect(paddle.height).toBe(CONFIG.PADDLE_HEIGHT);
        });

        it('should initialize magnet as disabled', () => {
            const paddle = createPaddle(100);
            expect(paddle.hasMagnet).toBe(false);
            expect(paddle.magnetCatches).toBe(0);
        });

        it('should initialize with no inverted controls', () => {
            const paddle = createPaddle(100);
            expect(paddle.invertedControls).toBe(false);
        });

        it('should initialize as not split', () => {
            const paddle = createPaddle(100);
            expect(paddle.isSplit).toBe(false);
            expect(paddle.splitPaddle).toBeNull();
        });
    });

    describe('updatePaddle', () => {
        it('should move left with ArrowLeft key', () => {
            const paddle = createPaddle(100);
            const initialX = paddle.x;
            updatePaddle(paddle, { ArrowLeft: true }, null, null);
            expect(paddle.x).toBeLessThan(initialX);
        });

        it('should move left with KeyA', () => {
            const paddle = createPaddle(100);
            const initialX = paddle.x;
            updatePaddle(paddle, { KeyA: true }, null, null);
            expect(paddle.x).toBeLessThan(initialX);
        });

        it('should move right with ArrowRight key', () => {
            const paddle = createPaddle(100);
            const initialX = paddle.x;
            updatePaddle(paddle, { ArrowRight: true }, null, null);
            expect(paddle.x).toBeGreaterThan(initialX);
        });

        it('should move right with KeyD', () => {
            const paddle = createPaddle(100);
            const initialX = paddle.x;
            updatePaddle(paddle, { KeyD: true }, null, null);
            expect(paddle.x).toBeGreaterThan(initialX);
        });

        it('should follow mouse position', () => {
            const paddle = createPaddle(100);
            updatePaddle(paddle, {}, 300, null);
            expect(paddle.x).toBe(300 - paddle.width / 2);
        });

        it('should prioritize touch over mouse', () => {
            const paddle = createPaddle(100);
            updatePaddle(paddle, {}, 100, 400);
            expect(paddle.x).toBe(400 - paddle.width / 2);
        });

        it('should clamp to left boundary', () => {
            const paddle = createPaddle(100);
            updatePaddle(paddle, {}, 10, null);
            expect(paddle.x).toBe(0);
        });

        it('should clamp to right boundary', () => {
            const paddle = createPaddle(100);
            updatePaddle(paddle, {}, CONFIG.CANVAS_WIDTH, null);
            expect(paddle.x).toBe(CONFIG.CANVAS_WIDTH - paddle.width);
        });

        it('should invert keyboard movement when controls are inverted', () => {
            const paddle = createPaddle(100);
            paddle.invertedControls = true;
            const initialX = paddle.x;
            updatePaddle(paddle, { ArrowLeft: true }, null, null);
            expect(paddle.x).toBeGreaterThan(initialX);
        });

        it('should invert mouse position when controls are inverted', () => {
            const paddle = createPaddle(100);
            paddle.invertedControls = true;
            updatePaddle(paddle, {}, 200, null);
            const expectedX = CONFIG.CANVAS_WIDTH - 200 - paddle.width / 2;
            expect(paddle.x).toBe(Math.max(0, Math.min(CONFIG.CANVAS_WIDTH - paddle.width, expectedX)));
        });

        it('should update split paddle position', () => {
            const paddle = createPaddle(100);
            enableSplitPaddle(paddle);
            updatePaddle(paddle, {}, 200, null);
            expect(paddle.splitPaddle).toBeDefined();
            // Split paddle mirrors main paddle
            expect(paddle.splitPaddle.x).toBeDefined();
        });
    });

    describe('setPaddleWidthMultiplier', () => {
        it('should multiply paddle width', () => {
            const paddle = createPaddle(100);
            setPaddleWidthMultiplier(paddle, 1.5);
            expect(paddle.width).toBe(150);
        });

        it('should shrink paddle with multiplier less than 1', () => {
            const paddle = createPaddle(100);
            setPaddleWidthMultiplier(paddle, 0.7);
            expect(paddle.width).toBe(70);
        });

        it('should preserve baseWidth', () => {
            const paddle = createPaddle(100);
            setPaddleWidthMultiplier(paddle, 1.5);
            expect(paddle.baseWidth).toBe(100);
        });
    });

    describe('resetPaddleWidth', () => {
        it('should reset width to baseWidth', () => {
            const paddle = createPaddle(100);
            setPaddleWidthMultiplier(paddle, 2);
            resetPaddleWidth(paddle);
            expect(paddle.width).toBe(100);
        });
    });

    describe('enableMagnet', () => {
        it('should enable magnet with default catches', () => {
            const paddle = createPaddle(100);
            enableMagnet(paddle);
            expect(paddle.hasMagnet).toBe(true);
            expect(paddle.magnetCatches).toBe(3);
        });

        it('should enable magnet with custom catches', () => {
            const paddle = createPaddle(100);
            enableMagnet(paddle, 5);
            expect(paddle.hasMagnet).toBe(true);
            expect(paddle.magnetCatches).toBe(5);
        });
    });

    describe('useMagnetCatch', () => {
        it('should decrement magnet catches', () => {
            const paddle = createPaddle(100);
            enableMagnet(paddle, 3);
            useMagnetCatch(paddle);
            expect(paddle.magnetCatches).toBe(2);
        });

        it('should return false when catches remain', () => {
            const paddle = createPaddle(100);
            enableMagnet(paddle, 3);
            expect(useMagnetCatch(paddle)).toBe(false);
        });

        it('should return true and disable magnet when depleted', () => {
            const paddle = createPaddle(100);
            enableMagnet(paddle, 1);
            expect(useMagnetCatch(paddle)).toBe(true);
            expect(paddle.hasMagnet).toBe(false);
        });

        it('should handle calling without magnet enabled', () => {
            const paddle = createPaddle(100);
            expect(useMagnetCatch(paddle)).toBe(false);
        });
    });

    describe('enableInvertedControls', () => {
        it('should enable inverted controls', () => {
            const paddle = createPaddle(100);
            enableInvertedControls(paddle);
            expect(paddle.invertedControls).toBe(true);
        });
    });

    describe('disableInvertedControls', () => {
        it('should disable inverted controls', () => {
            const paddle = createPaddle(100);
            enableInvertedControls(paddle);
            disableInvertedControls(paddle);
            expect(paddle.invertedControls).toBe(false);
        });
    });

    describe('enableSplitPaddle', () => {
        it('should set isSplit to true', () => {
            const paddle = createPaddle(100);
            enableSplitPaddle(paddle);
            expect(paddle.isSplit).toBe(true);
        });

        it('should create split paddle entity', () => {
            const paddle = createPaddle(100);
            enableSplitPaddle(paddle);
            expect(paddle.splitPaddle).not.toBeNull();
            expect(paddle.splitPaddle.width).toBeDefined();
            expect(paddle.splitPaddle.y).toBe(paddle.y);
        });

        it('should reduce main paddle width to 40%', () => {
            const paddle = createPaddle(100);
            enableSplitPaddle(paddle);
            expect(paddle.width).toBe(40);
        });

        it('should create split paddle with same height', () => {
            const paddle = createPaddle(100);
            enableSplitPaddle(paddle);
            expect(paddle.splitPaddle.height).toBe(paddle.height);
        });
    });

    describe('disableSplitPaddle', () => {
        it('should set isSplit to false', () => {
            const paddle = createPaddle(100);
            enableSplitPaddle(paddle);
            disableSplitPaddle(paddle);
            expect(paddle.isSplit).toBe(false);
        });

        it('should remove split paddle', () => {
            const paddle = createPaddle(100);
            enableSplitPaddle(paddle);
            disableSplitPaddle(paddle);
            expect(paddle.splitPaddle).toBeNull();
        });

        it('should restore paddle width to base', () => {
            const paddle = createPaddle(100);
            enableSplitPaddle(paddle);
            disableSplitPaddle(paddle);
            expect(paddle.width).toBe(100);
        });

        it('should center paddle after merge', () => {
            const paddle = createPaddle(100);
            enableSplitPaddle(paddle);
            disableSplitPaddle(paddle);
            expect(paddle.x).toBe(CONFIG.CANVAS_WIDTH / 2 - paddle.width / 2);
        });
    });
});
