// CODEBREAKOUT - Game State
// ============================================================================
// Central game state management
// ============================================================================

import { CONFIG } from './config.js';

export class GameState {
    constructor() {
        this.reset();
    }

    reset() {
        this.screen = 'start';
        this.score = 0;
        this.lives = CONFIG.INITIAL_LIVES;
        this.level = 0;
        this.multiplier = 1.0;
        this.maxMultiplier = 1.0;
        this.isPaused = false;
        this.isLaunched = false;
        this.perfectLevel = true;
        this.levelStartTime = 0;
        this.gameStartTime = 0;
        this.bricksDestroyed = 0;
        this.totalBricks = 0;
        this.soundEnabled = true;
        this.activePowerups = {};
        this.scoreSubmitted = false;

        // Bonus level state
        this.bonusEndTime = 0;
        this.bonusActive = false;
        this.lastExtraLifeScore = 0;  // Track score for 10k extra life
        this.destroyedBricks = [];     // Track destroyed bricks for regeneration

        // Game mode state
        this.gameMode = 'classic';     // 'classic' | 'campaign' | 'bonus' | 'easy'
        this.levelSequence = [];       // Array of level indices to play
        this.sequenceIndex = 0;        // Current position in sequence
        this.easyMode = false;         // Easy mode flag
    }

    /**
     * Initialize easy mode settings
     */
    initEasyMode() {
        this.easyMode = true;
        this.lives = CONFIG.EASY_MODE.INITIAL_LIVES;
    }

    /**
     * Get max lives based on mode
     * @returns {number} Maximum lives
     */
    getMaxLives() {
        return this.easyMode ? CONFIG.EASY_MODE.MAX_LIVES : CONFIG.MAX_LIVES;
    }

    /**
     * Get powerup drop chance multiplier
     * @returns {number} Multiplier for powerup drop chance
     */
    getPowerupDropMultiplier() {
        return this.easyMode ? CONFIG.EASY_MODE.POWERUP_DROP_MULTIPLIER : 1.0;
    }

    /**
     * Get paddle width multiplier for easy mode
     * @returns {number} Multiplier for paddle width
     */
    getPaddleWidthMultiplier() {
        return this.easyMode ? CONFIG.EASY_MODE.PADDLE_WIDTH_MULTIPLIER : 1.0;
    }

    /**
     * Add to score with current multiplier
     * @param {number} points - Base points to add
     * @returns {number} Actual points added after multiplier
     */
    addScore(points) {
        const actualPoints = Math.floor(points * this.multiplier);
        this.score += actualPoints;
        return actualPoints;
    }

    /**
     * Check if player earned an extra life (every 10k points)
     * @returns {boolean} True if extra life awarded
     */
    checkExtraLife() {
        const threshold = 10000;
        const currentMilestone = Math.floor(this.score / threshold);
        const lastMilestone = Math.floor(this.lastExtraLifeScore / threshold);

        if (currentMilestone > lastMilestone && this.lives < this.getMaxLives()) {
            this.lives++;
            this.lastExtraLifeScore = this.score;
            return true;
        }
        return false;
    }

    /**
     * Increase multiplier and track max
     */
    incrementMultiplier() {
        this.multiplier = Math.min(CONFIG.MAX_MULTIPLIER, this.multiplier + CONFIG.MULTIPLIER_INCREMENT);
        this.maxMultiplier = Math.max(this.maxMultiplier, this.multiplier);
    }

    /**
     * Reset multiplier to 1
     */
    resetMultiplier() {
        this.multiplier = 1.0;
    }

    /**
     * Lose a life
     * @returns {boolean} True if game over (no lives left)
     */
    loseLife() {
        this.lives--;
        this.perfectLevel = false;
        this.resetMultiplier();
        return this.lives <= 0;
    }

    /**
     * Check if powerup is currently active
     * @param {string} type - Powerup type key
     * @returns {boolean}
     */
    isPowerupActive(type) {
        const powerup = this.activePowerups[type];
        if (!powerup) return false;
        // Support both old format (number) and new format (object)
        const expiry = typeof powerup === 'object' ? powerup.expiry : powerup;
        return Date.now() < expiry;
    }

    /**
     * Get current stack count for a powerup
     * @param {string} type - Powerup type key
     * @returns {number} Stack count (0 if not active)
     */
    getPowerupStacks(type) {
        const powerup = this.activePowerups[type];
        if (!powerup || !this.isPowerupActive(type)) return 0;
        return typeof powerup === 'object' ? powerup.stacks : 1;
    }

    /**
     * Activate a powerup with duration and stacking
     * @param {string} type - Powerup type key
     * @param {number} duration - Duration in milliseconds
     * @returns {number} New stack count
     */
    activatePowerup(type, duration) {
        const maxStacks = CONFIG.MAX_POWERUP_STACKS || 2;
        const existing = this.activePowerups[type];
        const now = Date.now();

        if (existing && this.isPowerupActive(type)) {
            // Stack the powerup
            const currentStacks = typeof existing === 'object' ? existing.stacks : 1;
            const newStacks = Math.min(currentStacks + 1, maxStacks);
            this.activePowerups[type] = {
                expiry: now + duration,
                stacks: newStacks,
            };
            return newStacks;
        } else {
            // New powerup activation
            this.activePowerups[type] = {
                expiry: now + duration,
                stacks: 1,
            };
            return 1;
        }
    }

    /**
     * Deactivate a powerup
     * @param {string} type - Powerup type key
     */
    deactivatePowerup(type) {
        delete this.activePowerups[type];
    }

    /**
     * Get all expired powerups and remove them
     * @returns {string[]} Array of expired powerup type keys
     */
    getExpiredPowerups() {
        const now = Date.now();
        const expired = [];

        for (const [type, powerup] of Object.entries(this.activePowerups)) {
            const expiry = typeof powerup === 'object' ? powerup.expiry : powerup;
            if (now >= expiry) {
                expired.push(type);
                delete this.activePowerups[type];
            }
        }

        return expired;
    }
}
