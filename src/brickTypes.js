// CODEBREAKOUT - Brick Type Definitions
// ============================================================================
// Different brick types with their hit points, scores, and special properties
// ============================================================================

export const BRICK_TYPES = {
    STANDARD: { hits: 1, points: 10, color: null },
    STRONG: { hits: 2, points: 25, color: null },
    TOUGH: { hits: 3, points: 50, color: null },
    UNBREAKABLE: { hits: -1, points: 0, color: '#333' },
    EXPLODING: { hits: 1, points: 30, color: '#ff6600', explodes: true },
    PORTAL: { hits: 1, points: 20, color: '#9900ff', portal: true },
    HAZARD: { hits: 1, points: 15, color: '#ff0055', hazard: true },
};

/**
 * Get brick type based on pattern value and level data
 * @param {number} value - Pattern value from brick layout
 * @param {object} levelData - Current level configuration
 * @returns {string} Brick type key
 */
export function getBrickTypeFromPattern(value, levelData) {
    switch (value) {
        case 1: return 'STANDARD';
        case 2: return levelData.mechanics.includes('strong_bricks') ? 'STRONG' : 'STANDARD';
        case 3: return 'TOUGH';
        case -1: return 'UNBREAKABLE';
        case 4: return levelData.mechanics.includes('hazard_bricks') ? 'HAZARD' : 'STANDARD';
        case 5: return 'PORTAL';
        case 6: return 'EXPLODING';
        default: return 'STANDARD';
    }
}
