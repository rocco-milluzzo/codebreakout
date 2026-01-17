// CODEBREAKOUT - Input System
// ============================================================================
// Keyboard, mouse, and touch input handling
// ============================================================================

/**
 * Input manager class
 */
export class InputManager {
    constructor() {
        this.keys = {};
        this.mouseX = 0;
        this.touchX = null;
        this.scale = 1;
        this.canvas = null;
        this.keyCallbacks = []; // Callbacks for key events

        // Bind methods to preserve context
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.handleTouchCancel = this.handleTouchCancel.bind(this);
    }

    /**
     * Register a callback for key events
     * @param {Function} callback - Function to call with key code
     */
    onKey(callback) {
        this.keyCallbacks.push(callback);
    }

    /**
     * Initialize input listeners
     * @param {HTMLCanvasElement} canvas - Game canvas
     * @param {number} scale - Canvas scale factor
     */
    init(canvas, scale) {
        this.canvas = canvas;
        this.scale = scale;

        // Keyboard
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);

        // Mouse
        this.canvas.addEventListener('mousemove', this.handleMouseMove);

        // Touch
        this.canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false });
        this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        this.canvas.addEventListener('touchend', this.handleTouchEnd);
        this.canvas.addEventListener('touchcancel', this.handleTouchCancel);
    }

    /**
     * Update scale factor (call on resize)
     * @param {number} scale - New scale factor
     */
    updateScale(scale) {
        this.scale = scale;
    }

    /**
     * Handle key down event
     * @param {KeyboardEvent} e
     */
    handleKeyDown(e) {
        this.keys[e.code] = true;

        // Prevent default for game controls
        if (e.code === 'Space' || e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
            e.preventDefault();
        }

        // Notify callbacks for easter eggs etc
        for (const callback of this.keyCallbacks) {
            callback(e.code);
        }
    }

    /**
     * Handle key up event
     * @param {KeyboardEvent} e
     */
    handleKeyUp(e) {
        this.keys[e.code] = false;
    }

    /**
     * Handle mouse move event
     * @param {MouseEvent} e
     */
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = (e.clientX - rect.left) / this.scale;
    }

    /**
     * Handle touch start event
     * @param {TouchEvent} e
     */
    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        this.touchX = (touch.clientX - rect.left) / this.scale;
    }

    /**
     * Handle touch move event
     * @param {TouchEvent} e
     */
    handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        this.touchX = (touch.clientX - rect.left) / this.scale;
    }

    /**
     * Handle touch end event
     */
    handleTouchEnd() {
        this.touchX = null;
    }

    /**
     * Handle touch cancel event (system cancelled the touch)
     */
    handleTouchCancel() {
        this.touchX = null;
    }

    /**
     * Check if a key is pressed
     * @param {string} code - Key code
     * @returns {boolean}
     */
    isKeyPressed(code) {
        return this.keys[code] === true;
    }

    /**
     * Check if space is pressed
     * @returns {boolean}
     */
    isSpacePressed() {
        return this.isKeyPressed('Space');
    }

    /**
     * Check if escape is pressed
     * @returns {boolean}
     */
    isEscapePressed() {
        return this.isKeyPressed('Escape');
    }

    /**
     * Clear a key state (useful after consuming single-press events)
     * @param {string} code - Key code
     */
    clearKey(code) {
        this.keys[code] = false;
    }

    /**
     * Get current input position (touch takes priority over mouse)
     * @returns {number|null}
     */
    getPointerX() {
        return this.touchX !== null ? this.touchX : this.mouseX;
    }

    /**
     * Check if touch is active
     * @returns {boolean}
     */
    isTouchActive() {
        return this.touchX !== null;
    }

    /**
     * Reset touch state (useful when changing screens)
     */
    resetTouch() {
        this.touchX = null;
    }

    /**
     * Cleanup event listeners
     */
    destroy() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);

        if (this.canvas) {
            this.canvas.removeEventListener('mousemove', this.handleMouseMove);
            this.canvas.removeEventListener('touchstart', this.handleTouchStart);
            this.canvas.removeEventListener('touchmove', this.handleTouchMove);
            this.canvas.removeEventListener('touchend', this.handleTouchEnd);
            this.canvas.removeEventListener('touchcancel', this.handleTouchCancel);
        }
    }
}

/**
 * Create a new input manager instance
 * @returns {InputManager}
 */
export function createInputManager() {
    return new InputManager();
}
