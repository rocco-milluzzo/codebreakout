import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { InputManager, createInputManager } from '../../src/systems/input.js';

describe('Input System', () => {
    describe('InputManager constructor', () => {
        it('should initialize with empty keys', () => {
            const manager = new InputManager();
            expect(manager.keys).toEqual({});
        });

        it('should initialize with default mouse position', () => {
            const manager = new InputManager();
            expect(manager.mouseX).toBe(0);
        });

        it('should initialize with null touch', () => {
            const manager = new InputManager();
            expect(manager.touchX).toBeNull();
        });

        it('should initialize with scale 1', () => {
            const manager = new InputManager();
            expect(manager.scale).toBe(1);
        });

        it('should initialize empty keyCallbacks', () => {
            const manager = new InputManager();
            expect(manager.keyCallbacks).toEqual([]);
        });
    });

    describe('onKey', () => {
        it('should register callback', () => {
            const manager = new InputManager();
            const callback = vi.fn();
            manager.onKey(callback);
            expect(manager.keyCallbacks).toContain(callback);
        });

        it('should allow multiple callbacks', () => {
            const manager = new InputManager();
            const cb1 = vi.fn();
            const cb2 = vi.fn();
            manager.onKey(cb1);
            manager.onKey(cb2);
            expect(manager.keyCallbacks.length).toBe(2);
        });
    });

    describe('init', () => {
        let manager;
        let mockCanvas;

        beforeEach(() => {
            manager = new InputManager();
            mockCanvas = {
                addEventListener: vi.fn(),
                getBoundingClientRect: vi.fn().mockReturnValue({ left: 0, top: 0 }),
            };
        });

        afterEach(() => {
            // Clean up global listeners
            window.removeEventListener('keydown', manager.handleKeyDown);
            window.removeEventListener('keyup', manager.handleKeyUp);
        });

        it('should set canvas reference', () => {
            manager.init(mockCanvas, 1);
            expect(manager.canvas).toBe(mockCanvas);
        });

        it('should set scale', () => {
            manager.init(mockCanvas, 2);
            expect(manager.scale).toBe(2);
        });

        it('should register canvas event listeners', () => {
            manager.init(mockCanvas, 1);
            expect(mockCanvas.addEventListener).toHaveBeenCalledWith('mousemove', manager.handleMouseMove);
            expect(mockCanvas.addEventListener).toHaveBeenCalledWith('touchstart', manager.handleTouchStart, { passive: false });
            expect(mockCanvas.addEventListener).toHaveBeenCalledWith('touchmove', manager.handleTouchMove, { passive: false });
            expect(mockCanvas.addEventListener).toHaveBeenCalledWith('touchend', manager.handleTouchEnd);
        });
    });

    describe('updateScale', () => {
        it('should update scale value', () => {
            const manager = new InputManager();
            manager.updateScale(2);
            expect(manager.scale).toBe(2);
        });
    });

    describe('handleKeyDown', () => {
        let manager;

        beforeEach(() => {
            manager = new InputManager();
        });

        it('should set key state to true', () => {
            const event = { code: 'ArrowLeft', preventDefault: vi.fn() };
            manager.handleKeyDown(event);
            expect(manager.keys['ArrowLeft']).toBe(true);
        });

        it('should prevent default for Space', () => {
            const event = { code: 'Space', preventDefault: vi.fn() };
            manager.handleKeyDown(event);
            expect(event.preventDefault).toHaveBeenCalled();
        });

        it('should prevent default for ArrowLeft', () => {
            const event = { code: 'ArrowLeft', preventDefault: vi.fn() };
            manager.handleKeyDown(event);
            expect(event.preventDefault).toHaveBeenCalled();
        });

        it('should prevent default for ArrowRight', () => {
            const event = { code: 'ArrowRight', preventDefault: vi.fn() };
            manager.handleKeyDown(event);
            expect(event.preventDefault).toHaveBeenCalled();
        });

        it('should not prevent default for other keys', () => {
            const event = { code: 'KeyA', preventDefault: vi.fn() };
            manager.handleKeyDown(event);
            expect(event.preventDefault).not.toHaveBeenCalled();
        });

        it('should call registered callbacks', () => {
            const callback = vi.fn();
            manager.onKey(callback);
            const event = { code: 'KeyA', preventDefault: vi.fn() };
            manager.handleKeyDown(event);
            expect(callback).toHaveBeenCalledWith('KeyA');
        });
    });

    describe('handleKeyUp', () => {
        it('should set key state to false', () => {
            const manager = new InputManager();
            manager.keys['ArrowLeft'] = true;
            manager.handleKeyUp({ code: 'ArrowLeft' });
            expect(manager.keys['ArrowLeft']).toBe(false);
        });
    });

    describe('handleMouseMove', () => {
        it('should update mouseX based on canvas position', () => {
            const manager = new InputManager();
            manager.canvas = {
                getBoundingClientRect: () => ({ left: 50 }),
            };
            manager.scale = 1;
            manager.handleMouseMove({ clientX: 150 });
            expect(manager.mouseX).toBe(100);
        });

        it('should account for scale', () => {
            const manager = new InputManager();
            manager.canvas = {
                getBoundingClientRect: () => ({ left: 0 }),
            };
            manager.scale = 2;
            manager.handleMouseMove({ clientX: 200 });
            expect(manager.mouseX).toBe(100);
        });
    });

    describe('handleTouchStart', () => {
        it('should update touchX', () => {
            const manager = new InputManager();
            manager.canvas = {
                getBoundingClientRect: () => ({ left: 0 }),
            };
            manager.scale = 1;
            const event = {
                preventDefault: vi.fn(),
                touches: [{ clientX: 150 }],
            };
            manager.handleTouchStart(event);
            expect(manager.touchX).toBe(150);
        });

        it('should prevent default', () => {
            const manager = new InputManager();
            manager.canvas = {
                getBoundingClientRect: () => ({ left: 0 }),
            };
            const event = {
                preventDefault: vi.fn(),
                touches: [{ clientX: 150 }],
            };
            manager.handleTouchStart(event);
            expect(event.preventDefault).toHaveBeenCalled();
        });
    });

    describe('handleTouchMove', () => {
        it('should update touchX', () => {
            const manager = new InputManager();
            manager.canvas = {
                getBoundingClientRect: () => ({ left: 0 }),
            };
            manager.scale = 1;
            const event = {
                preventDefault: vi.fn(),
                touches: [{ clientX: 200 }],
            };
            manager.handleTouchMove(event);
            expect(manager.touchX).toBe(200);
        });
    });

    describe('handleTouchEnd', () => {
        it('should set touchX to null', () => {
            const manager = new InputManager();
            manager.touchX = 150;
            manager.handleTouchEnd();
            expect(manager.touchX).toBeNull();
        });
    });

    describe('isKeyPressed', () => {
        it('should return true for pressed key', () => {
            const manager = new InputManager();
            manager.keys['ArrowLeft'] = true;
            expect(manager.isKeyPressed('ArrowLeft')).toBe(true);
        });

        it('should return false for released key', () => {
            const manager = new InputManager();
            manager.keys['ArrowLeft'] = false;
            expect(manager.isKeyPressed('ArrowLeft')).toBe(false);
        });

        it('should return false for unknown key', () => {
            const manager = new InputManager();
            expect(manager.isKeyPressed('Unknown')).toBe(false);
        });
    });

    describe('isSpacePressed', () => {
        it('should return true when space is pressed', () => {
            const manager = new InputManager();
            manager.keys['Space'] = true;
            expect(manager.isSpacePressed()).toBe(true);
        });

        it('should return false when space is not pressed', () => {
            const manager = new InputManager();
            expect(manager.isSpacePressed()).toBe(false);
        });
    });

    describe('isEscapePressed', () => {
        it('should return true when escape is pressed', () => {
            const manager = new InputManager();
            manager.keys['Escape'] = true;
            expect(manager.isEscapePressed()).toBe(true);
        });

        it('should return false when escape is not pressed', () => {
            const manager = new InputManager();
            expect(manager.isEscapePressed()).toBe(false);
        });
    });

    describe('clearKey', () => {
        it('should set key state to false', () => {
            const manager = new InputManager();
            manager.keys['Space'] = true;
            manager.clearKey('Space');
            expect(manager.keys['Space']).toBe(false);
        });
    });

    describe('getPointerX', () => {
        it('should return touchX when active', () => {
            const manager = new InputManager();
            manager.touchX = 200;
            manager.mouseX = 100;
            expect(manager.getPointerX()).toBe(200);
        });

        it('should return mouseX when no touch', () => {
            const manager = new InputManager();
            manager.touchX = null;
            manager.mouseX = 100;
            expect(manager.getPointerX()).toBe(100);
        });
    });

    describe('isTouchActive', () => {
        it('should return true when touch is active', () => {
            const manager = new InputManager();
            manager.touchX = 200;
            expect(manager.isTouchActive()).toBe(true);
        });

        it('should return false when no touch', () => {
            const manager = new InputManager();
            manager.touchX = null;
            expect(manager.isTouchActive()).toBe(false);
        });
    });

    describe('destroy', () => {
        it('should remove canvas event listeners', () => {
            const manager = new InputManager();
            const mockCanvas = {
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                getBoundingClientRect: vi.fn().mockReturnValue({ left: 0, top: 0 }),
            };
            manager.init(mockCanvas, 1);
            manager.destroy();
            expect(mockCanvas.removeEventListener).toHaveBeenCalledWith('mousemove', manager.handleMouseMove);
            expect(mockCanvas.removeEventListener).toHaveBeenCalledWith('touchstart', manager.handleTouchStart);
            expect(mockCanvas.removeEventListener).toHaveBeenCalledWith('touchmove', manager.handleTouchMove);
            expect(mockCanvas.removeEventListener).toHaveBeenCalledWith('touchend', manager.handleTouchEnd);
        });
    });

    describe('createInputManager', () => {
        it('should return InputManager instance', () => {
            const manager = createInputManager();
            expect(manager).toBeInstanceOf(InputManager);
        });
    });
});
