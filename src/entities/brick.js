// CODEBREAKOUT - Brick Entity
// ============================================================================
// Brick patterns, creation, and logic with varied designs per level
// ============================================================================

import { CONFIG } from '../config.js';
import { BRICK_TYPES, getBrickTypeFromPattern } from '../brickTypes.js';

/**
 * Get brick pattern array based on pattern name
 * Pattern values: 0=empty, 1=standard, 2=strong, 3=tough, -1=unbreakable, 4=hazard, 5=portal, 6=exploding
 * @param {string} patternName - Name of the pattern
 * @returns {number[][]} 2D array of brick values
 */
export function getBrickPattern(patternName) {
    const patterns = {
        // Level 1: HTML - Simple welcoming intro
        simple: () => [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 1, 1, 0, 0, 1, 1, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        ],

        // Level 2: CSS - Styled cascading layers
        layers: () => [
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [0, 2, 2, 2, 2, 2, 2, 2, 2, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
            [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
        ],

        // Level 3: JavaScript - Scattered, unpredictable with hazards
        scattered: () => [
            [1, 0, 2, 1, 0, 1, 2, 0, 1, 1],
            [2, 1, 0, 1, 4, 1, 0, 1, 2, 0],
            [0, 1, 1, 2, 1, 1, 2, 1, 0, 1],
            [1, 0, 2, 0, 1, 1, 0, 2, 1, 0],
            [0, 1, 1, 1, 4, 4, 1, 1, 1, 0],
            [1, 2, 0, 1, 1, 1, 1, 0, 2, 1],
        ],

        // Level 4: Python - Elegant snake pattern
        snake: () => [
            [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
            [0, 1, 2, 1, 1, 1, 1, 2, 1, 0],
            [1, 2, 0, 0, 1, 1, 0, 0, 2, 1],
            [1, 1, 0, 0, 2, 2, 0, 0, 1, 1],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
        ],

        // Level 5: PHP - Web grid with exploding surprises
        grid: () => [
            [1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
            [2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
            [1, 2, 6, 2, 1, 2, 1, 6, 2, 1],
            [2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
            [1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
        ],

        // Level 6: Ruby - Diamond combo pattern
        diamond: () => [
            [0, 0, 0, 0, 2, 2, 0, 0, 0, 0],
            [0, 0, 0, 2, 1, 1, 2, 0, 0, 0],
            [0, 0, 2, 1, 6, 6, 1, 2, 0, 0],
            [0, 2, 1, 1, 1, 1, 1, 1, 2, 0],
            [2, 1, 1, 1, 1, 1, 1, 1, 1, 2],
            [0, 2, 2, 2, 2, 2, 2, 2, 2, 0],
        ],

        // Level 7: Java - Robust fortress with hazards
        fortress: () => [
            [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
            [3, 1, 1, 4, 1, 1, 4, 1, 1, 3],
            [3, 1, -1, -1, -1, -1, -1, -1, 1, 3],
            [3, 1, 1, 6, 1, 1, 6, 1, 1, 3],
            [3, 4, 1, 1, 2, 2, 1, 1, 4, 3],
            [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
        ],

        // Level 8: C# - Castle structure
        castle: () => [
            [3, 0, 3, 0, 0, 0, 0, 3, 0, 3],
            [3, 0, 3, 2, 2, 2, 2, 3, 0, 3],
            [2, 2, 2, 1, 1, 1, 1, 2, 2, 2],
            [1, 1, 1, 1, 6, 6, 1, 1, 1, 1],
            [1, 4, 1, 1, 1, 1, 1, 1, 4, 1],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
        ],

        // Level 9: TypeScript - TS letter pattern
        typescript: () => [
            [2, 2, 2, 0, 0, 0, 0, 2, 2, 2],
            [0, 2, 0, 2, 2, 2, 2, 0, 2, 0],
            [0, 2, 0, 0, 2, 2, 0, 0, 2, 0],
            [0, 2, 0, 0, 2, 2, 0, 0, 2, 0],
            [0, 2, 0, 0, 2, 2, 0, 0, 2, 0],
            [2, 2, 2, 0, 2, 2, 0, 2, 2, 2],
        ],

        // Level 10: C - Dense raw power
        dense: () => [
            [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
            [3, 2, 2, 2, 2, 2, 2, 2, 2, 3],
            [2, 2, 6, 2, 2, 2, 2, 6, 2, 2],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [1, 1, 1, 4, 1, 1, 4, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        ],

        // Level 11: C++ - Complex moving machinery
        moving: () => [
            [2, 0, 2, 0, 3, 3, 0, 2, 0, 2],
            [1, 2, 1, 2, 1, 1, 2, 1, 2, 1],
            [-1, 1, -1, 1, 6, 6, 1, -1, 1, -1],
            [1, 2, 1, 2, 1, 1, 2, 1, 2, 1],
            [2, 4, 2, 4, 2, 2, 4, 2, 4, 2],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        ],

        // Level 12: Go - Concurrent channels
        channels: () => [
            [2, 2, 2, 0, 2, 2, 0, 2, 2, 2],
            [1, 1, 1, 0, 1, 1, 0, 1, 1, 1],
            [1, 6, 1, 0, 1, 1, 0, 1, 6, 1],
            [1, 1, 1, 0, 1, 1, 0, 1, 1, 1],
            [2, 4, 2, 0, 2, 2, 0, 2, 4, 2],
            [3, 3, 3, 0, 3, 3, 0, 3, 3, 3],
        ],

        // Level 13: Rust - Cogwheel pattern with tough bricks
        rust: () => [
            [3, 0, 3, 0, 3, 3, 0, 3, 0, 3],
            [0, 2, 0, 2, 0, 0, 2, 0, 2, 0],
            [3, 0, 6, 0, 3, 3, 0, 6, 0, 3],
            [0, 2, 0, 2, 4, 4, 2, 0, 2, 0],
            [3, 0, 3, 0, 3, 3, 0, 3, 0, 3],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
        ],

        // Level 14: Haskell - Monadic portals
        portals: () => [
            [2, 5, 2, 2, 2, 2, 2, 2, 5, 2],
            [2, 1, 1, 1, -1, -1, 1, 1, 1, 2],
            [1, 1, 4, 1, 1, 1, 1, 4, 1, 1],
            [1, 1, 1, 1, -1, -1, 1, 1, 1, 1],
            [5, 1, 1, 6, 1, 1, 6, 1, 1, 5],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
        ],

        // Level 15: Assembly - Maximum density hex pattern
        hex: () => [
            [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
            [3, 2, 3, 2, 6, 6, 2, 3, 2, 3],
            [2, 3, 2, 3, 2, 2, 3, 2, 3, 2],
            [3, 4, 3, 4, 3, 3, 4, 3, 4, 3],
            [2, 3, 2, 3, 2, 2, 3, 2, 3, 2],
            [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
        ],
    };

    return (patterns[patternName] || patterns.simple)();
}

/**
 * Create all bricks for a level
 * @param {object} levelData - Level configuration
 * @returns {{bricks: object[], portalPairs: object[][], totalBreakable: number}}
 */
export function createBricks(levelData) {
    const bricks = [];
    const portalPairs = [];
    const pattern = getBrickPattern(levelData.brickPattern);

    for (let row = 0; row < pattern.length; row++) {
        for (let col = 0; col < pattern[row].length; col++) {
            const brickType = pattern[row][col];
            if (brickType === 0) continue;

            const type = getBrickTypeFromPattern(brickType, levelData);
            const brick = {
                x: CONFIG.BRICK_OFFSET_LEFT + col * (CONFIG.BRICK_WIDTH + CONFIG.BRICK_PADDING),
                y: CONFIG.BRICK_OFFSET_TOP + row * (CONFIG.BRICK_HEIGHT + CONFIG.BRICK_PADDING),
                width: CONFIG.BRICK_WIDTH,
                height: CONFIG.BRICK_HEIGHT,
                type,
                hits: 0,
                maxHits: BRICK_TYPES[type].hits,
                color: BRICK_TYPES[type].color || levelData.color,
                moving: levelData.mechanics.includes('moving_bricks') && Math.random() > 0.7,
                moveDir: Math.random() > 0.5 ? 1 : -1,
                moveSpeed: 1 + Math.random() * 0.5,
                portalId: null,
            };

            // Handle portal bricks
            if (type === 'PORTAL') {
                brick.portalId = portalPairs.length;
                if (portalPairs.length > 0 && portalPairs[portalPairs.length - 1].length === 1) {
                    portalPairs[portalPairs.length - 1].push(brick);
                } else {
                    portalPairs.push([brick]);
                }
            }

            bricks.push(brick);
        }
    }

    const totalBreakable = bricks.filter(b => b.type !== 'UNBREAKABLE').length;

    return { bricks, portalPairs, totalBreakable };
}

/**
 * Update moving bricks
 * @param {object[]} bricks - Array of brick objects
 */
export function updateMovingBricks(bricks) {
    for (const brick of bricks) {
        if (brick.moving) {
            brick.x += brick.moveDir * brick.moveSpeed;

            // Bounce off walls
            if (brick.x <= CONFIG.BRICK_OFFSET_LEFT ||
                brick.x + brick.width >= CONFIG.CANVAS_WIDTH - CONFIG.BRICK_OFFSET_LEFT) {
                brick.moveDir *= -1;
            }
        }
    }
}

/**
 * Hit a brick and check if destroyed
 * @param {object} brick - Brick object
 * @returns {boolean} True if brick is destroyed
 */
export function hitBrick(brick) {
    if (brick.type === 'UNBREAKABLE') return false;

    brick.hits++;
    return brick.hits >= brick.maxHits;
}

/**
 * Find adjacent bricks for explosion
 * @param {object} brick - Exploding brick
 * @param {object[]} allBricks - All bricks array
 * @returns {object[]} Adjacent bricks
 */
export function findAdjacentBricks(brick, allBricks) {
    return allBricks.filter(b => {
        const dx = Math.abs((b.x + b.width / 2) - (brick.x + brick.width / 2));
        const dy = Math.abs((b.y + b.height / 2) - (brick.y + brick.height / 2));
        return dx < CONFIG.BRICK_WIDTH * 1.5 && dy < CONFIG.BRICK_HEIGHT * 1.5 && b !== brick;
    });
}

/**
 * Get brick center position
 * @param {object} brick - Brick object
 * @returns {{x: number, y: number}}
 */
export function getBrickCenter(brick) {
    return {
        x: brick.x + brick.width / 2,
        y: brick.y + brick.height / 2,
    };
}
