// CODEBREAKOUT - Collision System
// ============================================================================
// Collision detection functions
// ============================================================================

import { CONFIG } from '../config.js';

/**
 * Check if ball intersects with brick
 * @param {object} ball - Ball object
 * @param {object} brick - Brick object
 * @returns {boolean}
 */
export function ballIntersectsBrick(ball, brick) {
    const closestX = Math.max(brick.x, Math.min(ball.x, brick.x + brick.width));
    const closestY = Math.max(brick.y, Math.min(ball.y, brick.y + brick.height));

    const distX = ball.x - closestX;
    const distY = ball.y - closestY;

    return (distX * distX + distY * distY) < (ball.radius * ball.radius);
}

/**
 * Check ball-paddle collision and handle bounce
 * @param {object} ball - Ball object
 * @param {object} paddle - Paddle object
 * @returns {boolean} True if collision occurred
 */
export function checkPaddleCollision(ball, paddle) {
    if (ball.dy < 0) return false; // Ball going up

    const paddleTop = paddle.y;
    const paddleBottom = paddle.y + paddle.height;
    const paddleLeft = paddle.x;
    const paddleRight = paddle.x + paddle.width;

    if (ball.y + ball.radius >= paddleTop &&
        ball.y - ball.radius <= paddleBottom &&
        ball.x >= paddleLeft &&
        ball.x <= paddleRight) {

        // Calculate bounce angle based on hit position
        let hitPos = (ball.x - paddle.x) / paddle.width;

        // Glitched balls have random bounce angle
        if (ball.visible === false) {
            hitPos = Math.random(); // Random hit position for chaotic bounce
        }

        const angle = (hitPos - 0.5) * (Math.PI / 2); // -45 to +45 degrees

        // Calculate new velocity
        const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        ball.dx = Math.sin(angle) * speed;
        ball.dy = -Math.abs(Math.cos(angle) * speed);

        // Prevent too horizontal angles
        if (Math.abs(ball.dy) < speed * Math.sin(CONFIG.MIN_BOUNCE_ANGLE)) {
            ball.dy = -speed * Math.sin(CONFIG.MIN_BOUNCE_ANGLE) * Math.sign(ball.dy || -1);
            ball.dx = Math.sqrt(speed * speed - ball.dy * ball.dy) * Math.sign(ball.dx || 1);
        }

        ball.y = paddleTop - ball.radius;
        return true;
    }

    return false;
}

/**
 * Check ball-brick collision and determine collision side
 * @param {object} ball - Ball object
 * @param {object} brick - Brick object
 * @returns {{hit: boolean, side: string|null}} Collision result with side ('horizontal' or 'vertical')
 */
export function checkBrickCollision(ball, brick) {
    if (!ballIntersectsBrick(ball, brick)) {
        return { hit: false, side: null };
    }

    // Determine collision side
    const overlapLeft = (ball.x + ball.radius) - brick.x;
    const overlapRight = (brick.x + brick.width) - (ball.x - ball.radius);
    const overlapTop = (ball.y + ball.radius) - brick.y;
    const overlapBottom = (brick.y + brick.height) - (ball.y - ball.radius);

    const minOverlapX = Math.min(overlapLeft, overlapRight);
    const minOverlapY = Math.min(overlapTop, overlapBottom);

    const side = minOverlapX < minOverlapY ? 'horizontal' : 'vertical';

    return { hit: true, side };
}

/**
 * Apply collision bounce to ball
 * @param {object} ball - Ball object
 * @param {string} side - Collision side ('horizontal' or 'vertical')
 */
export function applyBrickBounce(ball, side) {
    // Glitched balls have random bounce direction
    if (ball.visible === false) {
        const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        // Random angle between -60 and +60 degrees from vertical (going up)
        const randomAngle = (Math.random() - 0.5) * (Math.PI * 2 / 3);
        ball.dx = Math.sin(randomAngle) * speed;
        ball.dy = -Math.abs(Math.cos(randomAngle) * speed);
        return;
    }

    if (side === 'horizontal') {
        ball.dx *= -1;
    } else {
        ball.dy *= -1;
    }
}

/**
 * Check ball-brick collisions for all bricks
 * @param {object} ball - Ball object
 * @param {object[]} bricks - Array of brick objects
 * @returns {{brick: object, index: number, penetrated: boolean}|null} Hit brick info or null
 */
export function checkBrickCollisions(ball, bricks) {
    for (let i = bricks.length - 1; i >= 0; i--) {
        const brick = bricks[i];
        // Skip destroyed bricks (for bonus level regeneration)
        if (brick.destroyed) continue;
        const collision = checkBrickCollision(ball, brick);

        if (collision.hit) {
            // Fireball penetrates through bricks on their last hit (will be destroyed)
            const isLastHit = (brick.hits >= brick.maxHits - 1) && brick.type !== 'UNBREAKABLE';
            const shouldPenetrate = ball.fireball && isLastHit;

            if (!shouldPenetrate) {
                applyBrickBounce(ball, collision.side);
            }

            return { brick, index: i, penetrated: shouldPenetrate };
        }
    }

    return null;
}

/**
 * Calculate distance between two points
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @returns {number}
 */
export function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check if point is inside rectangle
 * @param {number} px - Point X
 * @param {number} py - Point Y
 * @param {number} rx - Rectangle X
 * @param {number} ry - Rectangle Y
 * @param {number} rw - Rectangle width
 * @param {number} rh - Rectangle height
 * @returns {boolean}
 */
export function pointInRect(px, py, rx, ry, rw, rh) {
    return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
}
