// CODEBREAKOUT - Haptic Feedback System
// ============================================================================
// Mobile vibration patterns for tactile feedback
// ============================================================================

/**
 * Haptic patterns (in milliseconds)
 */
const PATTERNS = {
    // Light taps
    brick: [15],
    brickStrong: [25],
    wall: [10],

    // Medium feedback
    paddle: [30],
    powerupGood: [20, 30, 50],
    powerupBad: [80],

    // Strong feedback
    combo: [30, 20, 30, 20, 50],
    extraLife: [50, 30, 50, 30, 100],
    levelUp: [50, 50, 50, 50, 100],

    // Impact
    explosion: [100],
    gameOver: [100, 50, 100, 50, 200],
    victory: [50, 30, 50, 30, 50, 30, 100],

    // Boss/special
    bossHit: [80, 30, 80],
    specialAttack: [30, 20, 30, 20, 30, 20, 100],
};

/**
 * Haptic Feedback Manager
 */
export class HapticManager {
    constructor() {
        this.enabled = true;
        this.intensity = 1.0; // 0-1, multiplier for pattern durations
        this.supported = this.checkSupport();
    }

    /**
     * Check if vibration API is supported
     */
    checkSupport() {
        return 'vibrate' in navigator;
    }

    /**
     * Trigger haptic feedback
     * @param {string} type - Pattern type from PATTERNS
     */
    trigger(type) {
        if (!this.enabled || !this.supported) return;

        const pattern = PATTERNS[type];
        if (!pattern) return;

        try {
            // Apply intensity to pattern
            const scaledPattern = pattern.map(duration =>
                Math.round(duration * this.intensity)
            );

            navigator.vibrate(scaledPattern);
        } catch (e) {
            // Vibration failed silently
        }
    }

    /**
     * Stop any ongoing vibration
     */
    stop() {
        if (!this.supported) return;
        try {
            navigator.vibrate(0);
        } catch (e) {
            // Ignore errors
        }
    }

    /**
     * Set haptic intensity
     * @param {number} intensity - 0 to 1
     */
    setIntensity(intensity) {
        this.intensity = Math.max(0, Math.min(1, intensity));
    }

    /**
     * Enable haptics
     */
    enable() {
        this.enabled = true;
    }

    /**
     * Disable haptics
     */
    disable() {
        this.enabled = false;
        this.stop();
    }

    /**
     * Toggle haptics
     * @returns {boolean} New enabled state
     */
    toggle() {
        this.enabled = !this.enabled;
        if (!this.enabled) this.stop();
        return this.enabled;
    }

    /**
     * Check if haptics are enabled and supported
     */
    isEnabled() {
        return this.enabled && this.supported;
    }

    /**
     * Check if device supports haptics
     */
    isSupported() {
        return this.supported;
    }
}

/**
 * Create haptic manager instance
 * @returns {HapticManager}
 */
export function createHapticManager() {
    return new HapticManager();
}
