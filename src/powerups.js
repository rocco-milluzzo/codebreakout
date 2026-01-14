// CODEBREAKOUT - Powerup Definitions
// ============================================================================
// All powerup types with their properties, visual indicators, and rarity
// ============================================================================

export const POWERUP_TYPES = {
    // Positive powerups (sorted by power/rarity)
    MULTIBALL: { name: 'MULTIBALL', color: '#00ff88', symbol: '+', positive: true, rarity: 0.7 },
    WIDE_PADDLE: { name: 'WIDE', color: '#00aaff', symbol: 'W', positive: true, rarity: 0.8 },
    SLOWMO: { name: 'SLOW', color: '#ffaa00', symbol: 'S', positive: true, rarity: 0.6 },
    LASER: { name: 'LASER', color: '#ff00ff', symbol: 'L', positive: true, rarity: 0.4 },
    SHIELD: { name: 'SHIELD', color: '#00ffff', symbol: '-', positive: true, rarity: 0.3 },
    MAGNET: { name: 'MAGNET', color: '#ff8800', symbol: 'M', positive: true, rarity: 0.5 },
    FIREBALL: { name: 'FIRE', color: '#ff4400', symbol: '🔥', positive: true, rarity: 0.5 }, // Powerful but fair

    // Negative powerups
    MINI_PADDLE: { name: 'MINI', color: '#ff4455', symbol: 'm', positive: false, rarity: 1.0 },
    FAST_BALL: { name: 'FAST', color: '#ff0000', symbol: 'F', positive: false, rarity: 1.0 },
    GLITCH: { name: 'GLITCH', color: '#880088', symbol: '?', positive: false, rarity: 0.8 },
    INVERT_CONTROLS: { name: 'INVERT', color: '#ff00aa', symbol: '↔', positive: false, rarity: 0.6 },
    SPLIT_PADDLE: { name: 'SPLIT', color: '#aa0066', symbol: '||', positive: false, rarity: 0.5 },
};

/**
 * Get all positive powerup type keys
 * @returns {string[]}
 */
export function getPositivePowerupTypes() {
    return Object.keys(POWERUP_TYPES).filter(t => POWERUP_TYPES[t].positive);
}

/**
 * Get all negative powerup type keys
 * @returns {string[]}
 */
export function getNegativePowerupTypes() {
    return Object.keys(POWERUP_TYPES).filter(t => !POWERUP_TYPES[t].positive);
}

/**
 * Get a random positive powerup type key based on rarity
 * @param {number} rarityModifier - Level-based modifier (0-1), lower = rarer powerups less likely
 * @returns {string}
 */
export function getRandomPositivePowerup(rarityModifier = 1.0) {
    const types = getPositivePowerupTypes();

    // Build weighted list based on rarity
    const weightedTypes = [];
    for (const type of types) {
        const baseRarity = POWERUP_TYPES[type].rarity;
        // Apply rarity modifier - lower modifier means powerful powerups are rarer
        const effectiveRarity = baseRarity * rarityModifier;

        // Only include if passes random check
        if (Math.random() < effectiveRarity) {
            weightedTypes.push(type);
        }
    }

    // If no powerups passed the check, return a common one
    if (weightedTypes.length === 0) {
        const commonTypes = types.filter(t => POWERUP_TYPES[t].rarity >= 0.6);
        return commonTypes[Math.floor(Math.random() * commonTypes.length)] || types[0];
    }

    return weightedTypes[Math.floor(Math.random() * weightedTypes.length)];
}

/**
 * Get a random negative powerup type key
 * @returns {string}
 */
export function getRandomNegativePowerup() {
    const types = getNegativePowerupTypes();
    const weightedTypes = [];

    for (const type of types) {
        if (Math.random() < POWERUP_TYPES[type].rarity) {
            weightedTypes.push(type);
        }
    }

    if (weightedTypes.length === 0) {
        return types[Math.floor(Math.random() * types.length)];
    }

    return weightedTypes[Math.floor(Math.random() * weightedTypes.length)];
}
