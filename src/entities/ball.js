// CODEBREAKOUT - Ball Entity
// ============================================================================
// Ball creation, movement, and behavior logic
// ============================================================================

import { CONFIG } from '../config.js';

// Ball ID counter for unique identification
let ballIdCounter = 0;

/**
 * Create a new ball
 * @param {number} x - Initial X position
 * @param {number} y - Initial Y position
 * @param {number} speed - Ball speed
 * @param {boolean} stuck - Whether ball starts stuck to paddle
 * @returns {object} Ball object
 */
export function createBall(x, y, speed, stuck = true) {
    return {
        id: ++ballIdCounter,
        x,
        y,
        dx: 0,
        dy: 0,
        speed,
        baseSpeed: speed,
        radius: CONFIG.BALL_RADIUS,
        visible: true,
        stuck,
        stuckOffset: 0,  // Offset from paddle center when caught by magnet
        fireball: false,  // When true, ball penetrates 1-hit bricks
        doodleMode: false,  // When true, ball has gravity and platform jumping
        gravity: 0,  // Gravity value for doodle mode
        jumpForce: 0,  // Jump force for doodle mode
    };
}

/**
 * Enable doodle jump mode on ball
 * @param {object} ball - Ball object
 * @param {number} gravity - Gravity acceleration
 * @param {number} jumpForce - Jump force (negative for upward)
 */
export function enableDoodleMode(ball, gravity, jumpForce) {
    ball.doodleMode = true;
    ball.gravity = gravity;
    ball.jumpForce = jumpForce;
}

/**
 * Apply doodle mode physics (gravity)
 * @param {object} ball - Ball object
 */
export function applyDoodleGravity(ball) {
    if (ball.doodleMode && !ball.stuck) {
        ball.dy += ball.gravity;
        // Cap falling speed
        ball.dy = Math.min(ball.dy, 12);
    }
}

/**
 * Apply doodle jump
 * @param {object} ball - Ball object
 */
export function applyDoodleJump(ball) {
    if (ball.doodleMode) {
        ball.dy = ball.jumpForce;
    }
}

/**
 * Create initial ball on paddle
 * @param {object} paddle - Paddle object
 * @param {number} ballSpeed - Ball speed from level config
 * @returns {object} Ball object
 */
export function createBallOnPaddle(paddle, ballSpeed) {
    return createBall(
        paddle.x + paddle.width / 2,
        paddle.y - CONFIG.BALL_RADIUS - 2,
        ballSpeed,
        true
    );
}

/**
 * Launch ball from paddle
 * @param {object} ball - Ball object
 * @param {object} paddle - Paddle object (optional, for position-based angle)
 */
export function launchBall(ball, paddle = null) {
    if (!ball.stuck) return;

    ball.stuck = false;

    let angle;
    if (paddle) {
        // Calculate angle based on ball position relative to paddle (same as bounce)
        const hitPos = (ball.x - paddle.x) / paddle.width;
        angle = (hitPos - 0.5) * (Math.PI / 2); // -45 to +45 degrees from vertical
        ball.dx = Math.sin(angle) * ball.speed;
        ball.dy = -Math.abs(Math.cos(angle) * ball.speed);
    } else {
        // Fallback: random angle (for backward compatibility)
        angle = (Math.random() * Math.PI / 2) + Math.PI / 4;
        ball.dx = Math.cos(angle) * ball.speed * (Math.random() > 0.5 ? 1 : -1);
        ball.dy = -Math.abs(Math.sin(angle) * ball.speed);
    }
}

/**
 * Update ball position
 * @param {object} ball - Ball object
 */
export function updateBallPosition(ball) {
    if (ball.stuck) return;

    ball.x += ball.dx;
    ball.y += ball.dy;
}

/**
 * Handle wall collisions
 * @param {object} ball - Ball object
 * @returns {string|null} 'left', 'right', 'top', or null if no collision
 */
export function checkWallCollision(ball) {
    // Left/right walls
    if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= CONFIG.CANVAS_WIDTH) {
        ball.dx *= -1;
        ball.x = Math.max(ball.radius, Math.min(CONFIG.CANVAS_WIDTH - ball.radius, ball.x));
        return ball.x <= CONFIG.CANVAS_WIDTH / 2 ? 'left' : 'right';
    }

    // Top wall
    if (ball.y - ball.radius <= 0) {
        ball.dy *= -1;
        ball.y = ball.radius;
        return 'top';
    }

    return null;
}

/**
 * Check if ball is out of bounds (below screen)
 * @param {object} ball - Ball object
 * @returns {boolean}
 */
export function isBallOutOfBounds(ball) {
    return ball.y - ball.radius > CONFIG.CANVAS_HEIGHT;
}

/**
 * Bounce ball off shield
 * @param {object} ball - Ball object
 */
export function bounceOffShield(ball) {
    ball.dy *= -1;
    ball.y = CONFIG.CANVAS_HEIGHT - 20;
}

/**
 * Update ball velocity to match current speed
 * @param {object} ball - Ball object
 */
export function updateBallVelocity(ball) {
    if (ball.stuck) return;

    const currentSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
    if (currentSpeed > 0) {
        const ratio = ball.speed / currentSpeed;
        ball.dx *= ratio;
        ball.dy *= ratio;
    }
}

/**
 * Set ball speed modifier
 * @param {object} ball - Ball object
 * @param {number} multiplier - Speed multiplier
 */
export function setBallSpeedMultiplier(ball, multiplier) {
    ball.speed = ball.baseSpeed * multiplier;
    updateBallVelocity(ball);
}

/**
 * Scale ball base speed (for mobile - doesn't trigger visual effects)
 * @param {object} ball - Ball object
 * @param {number} multiplier - Speed multiplier
 */
export function scaleBallBaseSpeed(ball, multiplier) {
    ball.baseSpeed *= multiplier;
    ball.speed = ball.baseSpeed;
    updateBallVelocity(ball);
}

/**
 * Reset ball speed to base
 * @param {object} ball - Ball object
 */
export function resetBallSpeed(ball) {
    ball.speed = ball.baseSpeed;
    updateBallVelocity(ball);
}

/**
 * Create additional balls for multiball powerup
 * @param {object} sourceBall - Source ball to clone from
 * @param {number} count - Number of new balls to create
 * @param {number} maxBalls - Maximum total balls allowed
 * @param {number} currentCount - Current number of balls
 * @returns {object[]} Array of new ball objects
 */
export function createMultiBalls(sourceBall, count, maxBalls, currentCount) {
    const newBalls = [];

    for (let i = 0; i < count && currentCount + newBalls.length < maxBalls; i++) {
        const angle = (Math.random() - 0.5) * Math.PI / 2;
        newBalls.push({
            x: sourceBall.x,
            y: sourceBall.y,
            dx: Math.sin(angle) * sourceBall.speed,
            dy: -Math.abs(Math.cos(angle) * sourceBall.speed),
            speed: sourceBall.speed,
            baseSpeed: sourceBall.baseSpeed,
            radius: CONFIG.BALL_RADIUS,
            visible: true,
            stuck: false,
            fireball: sourceBall.fireball, // Inherit fireball state
        });
    }

    return newBalls;
}

/**
 * Enable fireball mode on ball
 * @param {object} ball - Ball object
 */
export function enableFireball(ball) {
    ball.fireball = true;
}

/**
 * Disable fireball mode on ball
 * @param {object} ball - Ball object
 */
export function disableFireball(ball) {
    ball.fireball = false;
}

/**
 * Sync stuck ball position with paddle
 * @param {object} ball - Ball object
 * @param {object} paddle - Paddle object
 */
export function syncBallWithPaddle(ball, paddle) {
    if (ball.stuck) {
        // Use offset from paddle center (set when caught by magnet)
        const targetX = paddle.x + paddle.width / 2 + ball.stuckOffset;
        // Clamp to paddle bounds
        ball.x = Math.max(paddle.x + ball.radius, Math.min(paddle.x + paddle.width - ball.radius, targetX));
    }
}
