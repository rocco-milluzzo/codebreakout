// CODEBREAKOUT - Haptic Feedback System
// ============================================================================
// Mobile vibration patterns for tactile feedback
// Supports: Capacitor native haptics (iOS/Android) + Web Vibration API fallback
// ============================================================================

/**
 * Haptic patterns mapped to Capacitor ImpactStyle
 * Light = short/subtle, Medium = standard, Heavy = strong
 */
const HAPTIC_STYLES = {
    // Light taps
    brick: 'light',
    brickStrong: 'medium',
    wall: 'light',

    // Medium feedback
    paddle: 'medium',
    powerupGood: 'medium',
    powerupBad: 'heavy',

    // Strong feedback
    combo: 'heavy',
    extraLife: 'heavy',
    levelUp: 'heavy',

    // Impact
    explosion: 'heavy',
    gameOver: 'heavy',
    victory: 'heavy',

    // Boss/special
    bossHit: 'heavy',
    specialAttack: 'medium',
};

/**
 * Web Vibration API patterns (in milliseconds) - fallback for Android web
 */
const WEB_PATTERNS = {
    brick: [15],
    brickStrong: [25],
    wall: [10],
    paddle: [30],
    powerupGood: [20, 30, 50],
    powerupBad: [80],
    combo: [30, 20, 30, 20, 50],
    extraLife: [50, 30, 50, 30, 100],
    levelUp: [50, 50, 50, 50, 100],
    explosion: [100],
    gameOver: [100, 50, 100, 50, 200],
    victory: [50, 30, 50, 30, 50, 30, 100],
    bossHit: [80, 30, 80],
    specialAttack: [30, 20, 30, 20, 30, 20, 100],
};

/**
 * Haptic Feedback Manager
 * Uses Capacitor Haptics plugin on iOS/Android, falls back to Web Vibration API
 */
export class HapticManager {
    constructor() {
        this.enabled = true;
        this.intensity = 1.0;
        this.capacitorHaptics = null;
        this.useCapacitor = false;
        this.webSupported = 'vibrate' in navigator;
        this.supported = false;

        this.initCapacitor();
    }

    /**
     * Initialize Capacitor Haptics if available
     */
    async initCapacitor() {
        try {
            // Check if running in Capacitor
            if (window.Capacitor && window.Capacitor.isNativePlatform()) {
                const { Haptics } = await import('@capacitor/haptics');
                this.capacitorHaptics = Haptics;
                this.useCapacitor = true;
                this.supported = true;
            } else {
                this.supported = this.webSupported;
            }
        } catch (e) {
            // Capacitor not available, use web fallback
            this.supported = this.webSupported;
        }
    }

    /**
     * Check if vibration API is supported (legacy method for compatibility)
     */
    checkSupport() {
        return this.supported || this.webSupported;
    }

    /**
     * Trigger haptic feedback
     * @param {string} type - Pattern type
     */
    async trigger(type) {
        if (!this.enabled) return;

        // Try Capacitor native haptics first
        if (this.useCapacitor && this.capacitorHaptics) {
            try {
                const style = HAPTIC_STYLES[type] || 'medium';
                const impactStyle = style === 'light' ? 'Light' : style === 'heavy' ? 'Heavy' : 'Medium';
                await this.capacitorHaptics.impact({ style: impactStyle });
                return;
            } catch (e) {
                // Fall through to web API
            }
        }

        // Web Vibration API fallback (Android browsers)
        if (this.webSupported) {
            const pattern = WEB_PATTERNS[type];
            if (!pattern) return;

            try {
                const scaledPattern = pattern.map(duration =>
                    Math.round(duration * this.intensity)
                );
                navigator.vibrate(scaledPattern);
            } catch (e) {
                // Vibration failed silently
            }
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
