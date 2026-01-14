// CODEBREAKOUT - Powerup Entity
// ============================================================================
// Powerup spawning and update logic
// ============================================================================

import { CONFIG } from '../config.js';
import { POWERUP_TYPES, getRandomPositivePowerup, getRandomNegativePowerup } from '../powerups.js';

/**
 * Create a powerup entity
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {string} type - Powerup type key
 * @returns {object} Powerup entity
 */
export function createPowerup(x, y, type) {
    return {
        x,
        y,
        type,
        ...POWERUP_TYPES[type],
    };
}

/**
 * Spawn a random positive powerup
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} rarityModifier - Level-based modifier (0-1), lower = rarer powerups less likely
 * @returns {object} Powerup entity
 */
export function spawnPositivePowerup(x, y, rarityModifier = 1.0) {
    const type = getRandomPositivePowerup(rarityModifier);
    return createPowerup(x, y, type);
}

/**
 * Spawn a random negative powerup
 * @param {number} x - X position
 * @param {number} y - Y position
 * @returns {object} Powerup entity
 */
export function spawnNegativePowerup(x, y) {
    const type = getRandomNegativePowerup();
    return createPowerup(x, y, type);
}

/**
 * Update powerup position (falling)
 * @param {object} powerup - Powerup entity
 */
export function updatePowerupPosition(powerup) {
    powerup.y += CONFIG.POWERUP_SPEED;
}

/**
 * Check if powerup collides with paddle
 * @param {object} powerup - Powerup entity
 * @param {object} paddle - Paddle object
 * @returns {boolean}
 */
export function checkPowerupPaddleCollision(powerup, paddle) {
    return (
        powerup.y + CONFIG.POWERUP_SIZE >= paddle.y &&
        powerup.y <= paddle.y + paddle.height &&
        powerup.x >= paddle.x &&
        powerup.x <= paddle.x + paddle.width
    );
}

/**
 * Check if powerup is off screen
 * @param {object} powerup - Powerup entity
 * @returns {boolean}
 */
export function isPowerupOffScreen(powerup) {
    return powerup.y > CONFIG.CANVAS_HEIGHT;
}

/**
 * Update all powerups and return collection results
 * @param {object[]} powerups - Array of powerup entities
 * @param {object} paddle - Paddle object
 * @returns {{collected: object[], missed: object[], remaining: object[]}}
 */
export function updatePowerups(powerups, paddle) {
    const collected = [];
    const missed = [];
    const remaining = [];

    for (const powerup of powerups) {
        updatePowerupPosition(powerup);

        if (checkPowerupPaddleCollision(powerup, paddle)) {
            collected.push(powerup);
        } else if (isPowerupOffScreen(powerup)) {
            missed.push(powerup);
        } else {
            remaining.push(powerup);
        }
    }

    return { collected, missed, remaining };
}

/**
 * Create a laser entity
 * @param {number} x - X position
 * @param {number} y - Y position
 * @returns {object} Laser entity
 */
export function createLaser(x, y) {
    return { x, y };
}

/**
 * Update laser position
 * @param {object} laser - Laser entity
 */
export function updateLaserPosition(laser) {
    laser.y -= 10;
}

/**
 * Check if laser is off screen
 * @param {object} laser - Laser entity
 * @returns {boolean}
 */
export function isLaserOffScreen(laser) {
    return laser.y < 0;
}

/**
 * Check if laser hits a brick
 * @param {object} laser - Laser entity
 * @param {object} brick - Brick object
 * @returns {boolean}
 */
export function checkLaserBrickCollision(laser, brick) {
    return (
        laser.x >= brick.x &&
        laser.x <= brick.x + brick.width &&
        laser.y >= brick.y &&
        laser.y <= brick.y + brick.height
    );
}

// Laser cooldown tracking
let lastLaserTime = 0;
const LASER_COOLDOWN = 150; // milliseconds between shots

/**
 * Fire lasers from paddle
 * @param {object} paddle - Paddle object
 * @param {object[]} lasers - Existing lasers array
 * @param {number} maxLasers - Maximum lasers allowed
 * @param {boolean} forcefire - If true, ignore cooldown (for click events)
 * @returns {object[]|null} New lasers to add, or null if rate limited
 */
export function fireLasers(paddle, lasers, maxLasers = 10, forceFire = false) {
    if (lasers.length > maxLasers) return null;

    const now = Date.now();
    if (!forceFire && now - lastLaserTime < LASER_COOLDOWN) return null;

    lastLaserTime = now;

    return [
        createLaser(paddle.x + 10, paddle.y),
        createLaser(paddle.x + paddle.width - 10, paddle.y),
    ];
}
