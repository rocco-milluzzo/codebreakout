// CODEBREAKOUT - Paddle Entity
// ============================================================================
// Paddle creation and update logic
// ============================================================================

import { CONFIG } from '../config.js';

/**
 * Create a new paddle
 * @param {number} paddleWidth - Initial paddle width from level config
 * @returns {object} Paddle object
 */
export function createPaddle(paddleWidth) {
    return {
        x: CONFIG.CANVAS_WIDTH / 2 - paddleWidth / 2,
        y: CONFIG.CANVAS_HEIGHT - CONFIG.PADDLE_Y_OFFSET,
        width: paddleWidth,
        height: CONFIG.PADDLE_HEIGHT,
        baseWidth: paddleWidth,
        magnetCatches: 0,
        hasMagnet: false,
        invertedControls: false,
        isSplit: false,
        splitPaddle: null,  // Second paddle when split
    };
}

/**
 * Update paddle position based on input
 * @param {object} paddle - Paddle object
 * @param {object} keys - Keyboard state
 * @param {number|null} mouseX - Mouse X position
 * @param {number|null} touchX - Touch X position
 */
export function updatePaddle(paddle, keys, mouseX, touchX) {
    const invert = paddle.invertedControls ? -1 : 1;
    const speed = CONFIG.PADDLE_SPEED * invert;

    // Check if keyboard movement keys are pressed
    const keyboardActive = keys['ArrowLeft'] || keys['KeyA'] || keys['ArrowRight'] || keys['KeyD'];

    // Keyboard control takes priority when keys are pressed
    if (keyboardActive) {
        if (keys['ArrowLeft'] || keys['KeyA']) {
            paddle.x -= speed;
        }
        if (keys['ArrowRight'] || keys['KeyD']) {
            paddle.x += speed;
        }
    } else if (touchX !== null) {
        // Touch control (priority over mouse when no keyboard)
        if (paddle.invertedControls) {
            // Invert touch position around screen center
            const invertedX = CONFIG.CANVAS_WIDTH - touchX;
            paddle.x = invertedX - paddle.width / 2;
        } else {
            paddle.x = touchX - paddle.width / 2;
        }
    } else if (mouseX) {
        // Mouse control (only when no keyboard or touch)
        if (paddle.invertedControls) {
            const invertedX = CONFIG.CANVAS_WIDTH - mouseX;
            paddle.x = invertedX - paddle.width / 2;
        } else {
            paddle.x = mouseX - paddle.width / 2;
        }
    }

    // Bounds checking for main paddle
    paddle.x = Math.max(0, Math.min(CONFIG.CANVAS_WIDTH - paddle.width, paddle.x));

    // Update split paddle (mirrors main paddle position)
    if (paddle.isSplit && paddle.splitPaddle) {
        paddle.splitPaddle.x = CONFIG.CANVAS_WIDTH - paddle.x - paddle.splitPaddle.width;
        paddle.splitPaddle.x = Math.max(0, Math.min(CONFIG.CANVAS_WIDTH - paddle.splitPaddle.width, paddle.splitPaddle.x));
    }
}

/**
 * Set paddle width modifier
 * @param {object} paddle - Paddle object
 * @param {number} multiplier - Width multiplier (e.g., 1.4 for wide, 0.7 for mini)
 */
export function setPaddleWidthMultiplier(paddle, multiplier) {
    paddle.width = paddle.baseWidth * multiplier;
}

/**
 * Reset paddle width to base
 * @param {object} paddle - Paddle object
 */
export function resetPaddleWidth(paddle) {
    paddle.width = paddle.baseWidth;
}

/**
 * Enable magnet on paddle
 * @param {object} paddle - Paddle object
 * @param {number} catches - Number of catches allowed
 */
export function enableMagnet(paddle, catches = 3) {
    paddle.hasMagnet = true;
    paddle.magnetCatches = catches;
}

/**
 * Use one magnet catch
 * @param {object} paddle - Paddle object
 * @returns {boolean} True if magnet is now depleted
 */
export function useMagnetCatch(paddle) {
    if (paddle.hasMagnet && paddle.magnetCatches > 0) {
        paddle.magnetCatches--;
        if (paddle.magnetCatches <= 0) {
            paddle.hasMagnet = false;
            return true;
        }
    }
    return false;
}

/**
 * Enable inverted controls
 * @param {object} paddle - Paddle object
 */
export function enableInvertedControls(paddle) {
    paddle.invertedControls = true;
}

/**
 * Disable inverted controls
 * @param {object} paddle - Paddle object
 */
export function disableInvertedControls(paddle) {
    paddle.invertedControls = false;
}

/**
 * Split paddle into two smaller paddles
 * @param {object} paddle - Paddle object
 */
export function enableSplitPaddle(paddle) {
    paddle.isSplit = true;
    // Each paddle is 40% of original width
    const splitWidth = paddle.baseWidth * 0.4;
    paddle.width = splitWidth;
    paddle.splitPaddle = {
        x: CONFIG.CANVAS_WIDTH - paddle.x - splitWidth,
        y: paddle.y,
        width: splitWidth,
        height: paddle.height,
    };
}

/**
 * Merge split paddle back to one
 * @param {object} paddle - Paddle object
 */
export function disableSplitPaddle(paddle) {
    paddle.isSplit = false;
    paddle.splitPaddle = null;
    paddle.width = paddle.baseWidth;
    // Center the paddle
    paddle.x = CONFIG.CANVAS_WIDTH / 2 - paddle.width / 2;
}
