// CODEBREAKOUT - Game Configuration
// ============================================================================
// All game constants and configuration values
// ============================================================================

export const CONFIG = {
    // Canvas
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,

    // Paddle
    PADDLE_WIDTH: 100,
    PADDLE_HEIGHT: 15,
    PADDLE_SPEED: 8,
    PADDLE_Y_OFFSET: 40,

    // Ball
    BALL_RADIUS: 8,
    BALL_INITIAL_SPEED: 5,
    BALL_MAX_SPEED: 12,
    BALL_SPEED_INCREMENT: 0.1,
    MIN_BOUNCE_ANGLE: Math.PI / 6, // 30 degrees from horizontal
    MOBILE_SPEED_MULTIPLIER: 2, // Ball moves faster on mobile for better feel

    // Bricks
    BRICK_ROWS: 6,
    BRICK_COLS: 10,
    BRICK_WIDTH: 70,
    BRICK_HEIGHT: 25,
    BRICK_PADDING: 5,
    BRICK_OFFSET_TOP: 80,
    BRICK_OFFSET_LEFT: 35,

    // Gameplay
    INITIAL_LIVES: 3,
    MAX_LIVES: 5,
    MAX_MULTIPLIER: 5.0,
    MULTIPLIER_INCREMENT: 0.05,
    MAX_BALLS: 5,

    // Powerups - Base drop chance (modified by level)
    POWERUP_DROP_CHANCE: 0.12,  // Reduced from 0.15
    POWERUP_SPEED: 2,
    POWERUP_SIZE: 25,

    // Timing
    POWERUP_DURATION: {
        WIDE_PADDLE: 12000,     // Reduced from 15000
        SLOWMO: 8000,           // Reduced from 10000
        SHIELD: 8000,           // Reduced from 10000
        MINI_PADDLE: 10000,     // Increased from 8000 (negative lasts longer)
        FAST_BALL: 10000,       // Increased from 8000
        GLITCH: 4000,           // Increased from 3000
        LASER: 8000,            // Reduced from 10000
        FIREBALL: 6000,         // New - short but powerful
        MAGNET: 10000,          // Duration for magnet indicator
        INVERT_CONTROLS: 8000,  // Inverted controls
        SPLIT_PADDLE: 12000,    // Split paddle lasts longer
    },

    // Powerup stacking
    MAX_POWERUP_STACKS: 2,  // Max times a powerup can stack
};
