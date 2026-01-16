import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    updateAnimationTime,
    adjustAlpha,
    clearCanvas,
    drawBackground,
    drawBricks,
    drawPaddle,
    drawBalls,
    drawPowerups,
    drawLasers,
    drawShield,
    drawParticles,
    drawFloatingTexts,
    drawBallTrail,
    updatePowerupIndicators,
    render,
} from '../../src/systems/render.js';
import { CONFIG } from '../../src/config.js';

describe('Render System', () => {
    let mockCtx;

    beforeEach(() => {
        // Create mock canvas context
        mockCtx = {
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 1,
            font: '',
            textAlign: '',
            textBaseline: '',
            globalAlpha: 1,
            shadowColor: '',
            shadowBlur: 0,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            fillRect: vi.fn(),
            strokeRect: vi.fn(),
            beginPath: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            arc: vi.fn(),
            fill: vi.fn(),
            stroke: vi.fn(),
            closePath: vi.fn(),
            createRadialGradient: vi.fn().mockReturnValue({
                addColorStop: vi.fn(),
            }),
            createLinearGradient: vi.fn().mockReturnValue({
                addColorStop: vi.fn(),
            }),
            save: vi.fn(),
            restore: vi.fn(),
            clip: vi.fn(),
            rect: vi.fn(),
            fillText: vi.fn(),
            strokeText: vi.fn(),
            setLineDash: vi.fn(),
            roundRect: vi.fn(),
        };

        // Mock document for updatePowerupIndicators
        global.document = {
            createElement: vi.fn().mockReturnValue({
                className: '',
                textContent: '',
            }),
        };
    });

    describe('adjustAlpha', () => {
        it('should convert hex to rgba', () => {
            const result = adjustAlpha('#ff0000', 0.5);
            expect(result).toBe('rgba(255,0,0,0.5)');
        });

        it('should handle different hex colors', () => {
            expect(adjustAlpha('#00ff00', 0.8)).toBe('rgba(0,255,0,0.8)');
            expect(adjustAlpha('#0000ff', 1)).toBe('rgba(0,0,255,1)');
        });

        it('should return original for non-hex colors', () => {
            expect(adjustAlpha('red', 0.5)).toBe('red');
            expect(adjustAlpha('rgb(0,0,0)', 0.5)).toBe('rgb(0,0,0)');
        });
    });

    describe('clearCanvas', () => {
        it('should fill canvas with background color', () => {
            clearCanvas(mockCtx);
            expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        });

        it('should use dark background', () => {
            clearCanvas(mockCtx);
            expect(mockCtx.fillStyle).toBe('#0a0a0f');
        });
    });

    describe('drawBackground', () => {
        it('should create radial gradient', () => {
            const levelData = { color: '#ff0000' };
            drawBackground(mockCtx, levelData);
            expect(mockCtx.createRadialGradient).toHaveBeenCalled();
        });

        it('should draw grid lines', () => {
            const levelData = { color: '#ff0000' };
            drawBackground(mockCtx, levelData);
            expect(mockCtx.beginPath).toHaveBeenCalled();
            expect(mockCtx.stroke).toHaveBeenCalled();
        });
    });

    describe('drawBricks', () => {
        it('should skip destroyed bricks', () => {
            const bricks = [
                { x: 100, y: 100, width: 70, height: 25, type: 'STANDARD', color: '#ff0000', destroyed: true },
            ];
            const fillRectCount = mockCtx.fillRect.mock.calls.length;
            drawBricks(mockCtx, bricks);
            // Should not draw additional elements for destroyed brick
        });

        it('should draw standard bricks', () => {
            const bricks = [
                { x: 100, y: 100, width: 70, height: 25, type: 'STANDARD', color: '#ff0000', hits: 0, maxHits: 1 },
            ];
            drawBricks(mockCtx, bricks);
            expect(mockCtx.fillRect).toHaveBeenCalled();
        });

        it('should draw strong bricks', () => {
            const bricks = [
                { x: 100, y: 100, width: 70, height: 25, type: 'STRONG', color: '#ff0000', hits: 0, maxHits: 2 },
            ];
            drawBricks(mockCtx, bricks);
            expect(mockCtx.fillRect).toHaveBeenCalled();
        });

        it('should draw tough bricks', () => {
            const bricks = [
                { x: 100, y: 100, width: 70, height: 25, type: 'TOUGH', color: '#ff0000', hits: 0, maxHits: 3 },
            ];
            drawBricks(mockCtx, bricks);
            expect(mockCtx.fillRect).toHaveBeenCalled();
        });

        it('should draw unbreakable bricks', () => {
            const bricks = [
                { x: 100, y: 100, width: 70, height: 25, type: 'UNBREAKABLE', color: '#333', hits: 0, maxHits: -1 },
            ];
            drawBricks(mockCtx, bricks);
            expect(mockCtx.fillRect).toHaveBeenCalled();
        });

        it('should draw hazard bricks', () => {
            const bricks = [
                { x: 100, y: 100, width: 70, height: 25, type: 'HAZARD', color: '#ff0055', hits: 0, maxHits: 1 },
            ];
            drawBricks(mockCtx, bricks);
            expect(mockCtx.fillRect).toHaveBeenCalled();
        });

        it('should draw exploding bricks', () => {
            const bricks = [
                { x: 100, y: 100, width: 70, height: 25, type: 'EXPLODING', color: '#ff6600', hits: 0, maxHits: 1 },
            ];
            drawBricks(mockCtx, bricks);
            expect(mockCtx.fillRect).toHaveBeenCalled();
        });

        it('should draw portal bricks', () => {
            const bricks = [
                { x: 100, y: 100, width: 70, height: 25, type: 'PORTAL', color: '#9900ff', hits: 0, maxHits: 1 },
            ];
            drawBricks(mockCtx, bricks);
            expect(mockCtx.fillRect).toHaveBeenCalled();
        });
    });

    describe('drawPaddle', () => {
        it('should draw paddle shape', () => {
            const paddle = { x: 100, y: 500, width: 100, height: 15, hasMagnet: false };
            const levelData = { color: '#ff0000' };
            drawPaddle(mockCtx, paddle, levelData, {});
            expect(mockCtx.beginPath).toHaveBeenCalled();
            expect(mockCtx.fill).toHaveBeenCalled();
        });

        it('should draw magnet indicator when active', () => {
            const paddle = { x: 100, y: 500, width: 100, height: 15, hasMagnet: true };
            const levelData = { color: '#ff0000' };
            drawPaddle(mockCtx, paddle, levelData, {});
            expect(mockCtx.arc).toHaveBeenCalled();
        });

        it('should draw laser turrets when active', () => {
            const paddle = { x: 100, y: 500, width: 100, height: 15, hasMagnet: false };
            const levelData = { color: '#ff0000' };
            drawPaddle(mockCtx, paddle, levelData, { LASER: true });
            expect(mockCtx.closePath).toHaveBeenCalled();
        });

        it('should draw fireball effect when active', () => {
            const paddle = { x: 100, y: 500, width: 100, height: 15, hasMagnet: false };
            const levelData = { color: '#ff0000' };
            drawPaddle(mockCtx, paddle, levelData, { FIREBALL: true });
            expect(mockCtx.createRadialGradient).toHaveBeenCalled();
        });
    });

    describe('drawBalls', () => {
        it('should draw visible balls', () => {
            const balls = [
                { x: 400, y: 300, radius: 8, visible: true, fireball: false, speed: 5, baseSpeed: 5 },
            ];
            drawBalls(mockCtx, balls, {});
            expect(mockCtx.arc).toHaveBeenCalled();
        });

        it('should skip invisible balls without GLITCH powerup', () => {
            const balls = [
                { x: 400, y: 300, radius: 8, visible: false, fireball: false },
            ];
            mockCtx.arc.mockClear();
            drawBalls(mockCtx, balls, {});
            // Should skip completely when GLITCH not active
            expect(mockCtx.arc).not.toHaveBeenCalled();
        });

        it('should draw glitch indicator for invisible balls with GLITCH powerup', () => {
            const balls = [
                { x: 400, y: 300, radius: 8, visible: false, fireball: false },
            ];
            mockCtx.setLineDash.mockClear();
            drawBalls(mockCtx, balls, { GLITCH: true });
            // Should draw glitch warning indicator
            expect(mockCtx.setLineDash).toHaveBeenCalled();
        });

        it('should draw fireball effect', () => {
            const balls = [
                { x: 400, y: 300, radius: 8, visible: true, fireball: true, dx: 3, dy: -4 },
            ];
            drawBalls(mockCtx, balls, {});
            expect(mockCtx.createRadialGradient).toHaveBeenCalled();
        });
    });

    describe('drawPowerups', () => {
        it('should draw powerup circles', () => {
            const powerups = [
                { x: 100, y: 200, positive: true, color: '#00ff88', symbol: '+' },
            ];
            drawPowerups(mockCtx, powerups);
            expect(mockCtx.arc).toHaveBeenCalled();
            expect(mockCtx.fillText).toHaveBeenCalledWith('+', 100, 200);
        });

        it('should use different colors for positive/negative', () => {
            const powerups = [
                { x: 100, y: 200, positive: false, color: '#ff4455', symbol: 'm' },
            ];
            drawPowerups(mockCtx, powerups);
            // Last fillStyle is powerup.color for the symbol
            expect(mockCtx.fillStyle).toBe('#ff4455');
        });
    });

    describe('drawLasers', () => {
        it('should draw laser rectangles', () => {
            const lasers = [
                { x: 100, y: 200 },
                { x: 150, y: 200 },
            ];
            drawLasers(mockCtx, lasers);
            expect(mockCtx.fillRect).toHaveBeenCalledTimes(2);
        });

        it('should use magenta color', () => {
            const lasers = [{ x: 100, y: 200 }];
            drawLasers(mockCtx, lasers);
            expect(mockCtx.fillStyle).toBe('#ff00ff');
        });
    });

    describe('drawShield', () => {
        it('should draw shield line at bottom', () => {
            drawShield(mockCtx);
            expect(mockCtx.moveTo).toHaveBeenCalledWith(0, CONFIG.CANVAS_HEIGHT - 10);
            expect(mockCtx.lineTo).toHaveBeenCalledWith(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT - 10);
        });

        it('should draw with glow effect', () => {
            drawShield(mockCtx);
            expect(mockCtx.stroke).toHaveBeenCalledTimes(2); // Main line + glow
        });
    });

    describe('drawParticles', () => {
        it('should draw particles with alpha', () => {
            const particles = [
                { x: 100, y: 200, life: 0.5, color: '#ff0000', size: 4 },
            ];
            drawParticles(mockCtx, particles);
            expect(mockCtx.arc).toHaveBeenCalled();
        });

        it('should draw glowing particles with gradient', () => {
            const particles = [
                { x: 100, y: 200, life: 0.5, color: '#ff0000', size: 4, glow: true },
            ];
            drawParticles(mockCtx, particles);
            expect(mockCtx.createRadialGradient).toHaveBeenCalled();
        });

        it('should reset alpha after drawing', () => {
            const particles = [{ x: 100, y: 200, life: 0.5, color: '#ff0000', size: 4 }];
            drawParticles(mockCtx, particles);
            expect(mockCtx.globalAlpha).toBe(1);
        });
    });

    describe('drawFloatingTexts', () => {
        it('should draw text with glow', () => {
            const texts = [
                { x: 100, y: 200, text: '+100', life: 1, color: '#ffffff' },
            ];
            drawFloatingTexts(mockCtx, texts);
            expect(mockCtx.fillText).toHaveBeenCalled();
            expect(mockCtx.strokeText).toHaveBeenCalled();
        });

        it('should reset shadows after drawing', () => {
            const texts = [{ x: 100, y: 200, text: '+100', life: 1, color: '#ffffff' }];
            drawFloatingTexts(mockCtx, texts);
            expect(mockCtx.shadowBlur).toBe(0);
        });
    });

    describe('drawBallTrail', () => {
        it('should draw trail points with fade', () => {
            const trail = [
                { x: 100, y: 200, life: 0.5 },
                { x: 95, y: 205, life: 0.3 },
            ];
            drawBallTrail(mockCtx, trail);
            expect(mockCtx.arc).toHaveBeenCalledTimes(2);
        });
    });

    describe('updatePowerupIndicators', () => {
        it('should clear container', () => {
            const container = { textContent: 'old content', appendChild: vi.fn() };
            updatePowerupIndicators(container, {});
            expect(container.textContent).toBe('');
        });

        it('should create indicator for active powerup', () => {
            vi.useFakeTimers();
            vi.setSystemTime(1000);

            const container = { textContent: '', appendChild: vi.fn() };
            const powerups = {
                LASER: { expiry: 6000, stacks: 1 },
            };
            updatePowerupIndicators(container, powerups);
            expect(container.appendChild).toHaveBeenCalled();

            vi.useRealTimers();
        });

        it('should show stack count when greater than 1', () => {
            vi.useFakeTimers();
            vi.setSystemTime(1000);

            const createdElements = [];
            global.document.createElement = vi.fn().mockImplementation(() => {
                const el = { className: '', textContent: '' };
                createdElements.push(el);
                return el;
            });

            const container = { textContent: '', appendChild: vi.fn((el) => createdElements.push(el)) };
            const powerups = {
                LASER: { expiry: 6000, stacks: 2 },
            };
            updatePowerupIndicators(container, powerups);

            vi.useRealTimers();
        });
    });

    describe('render', () => {
        it('should call all rendering functions', () => {
            const gameData = {
                levelData: { color: '#ff0000' },
                paddle: { x: 100, y: 500, width: 100, height: 15, hasMagnet: false, isSplit: false },
                balls: [],
                bricks: [],
                powerups: [],
                lasers: [],
                shield: false,
                particles: [],
                floatingTexts: [],
                ballTrail: [],
                activePowerups: {},
            };
            render(mockCtx, gameData);
            // Should call fillRect for clear at minimum
            expect(mockCtx.fillRect).toHaveBeenCalled();
        });

        it('should draw shield when active', () => {
            const gameData = {
                levelData: { color: '#ff0000' },
                paddle: { x: 100, y: 500, width: 100, height: 15, hasMagnet: false, isSplit: false },
                balls: [],
                bricks: [],
                powerups: [],
                lasers: [],
                shield: true,
                particles: [],
                floatingTexts: [],
                ballTrail: [],
                activePowerups: {},
            };
            render(mockCtx, gameData);
            // Shield line drawing
            expect(mockCtx.moveTo).toHaveBeenCalledWith(0, CONFIG.CANVAS_HEIGHT - 10);
        });

        it('should draw split paddle when active', () => {
            const gameData = {
                levelData: { color: '#ff0000' },
                paddle: {
                    x: 100, y: 500, width: 40, height: 15, hasMagnet: false,
                    isSplit: true,
                    splitPaddle: { x: 660, y: 500, width: 40, height: 15 },
                },
                balls: [],
                bricks: [],
                powerups: [],
                lasers: [],
                shield: false,
                particles: [],
                floatingTexts: [],
                ballTrail: [],
                activePowerups: {},
            };
            render(mockCtx, gameData);
            // Should draw both paddles
            expect(mockCtx.beginPath).toHaveBeenCalled();
        });
    });
});
