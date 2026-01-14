// CODEBREAKOUT - Level Definitions
// ============================================================================
// Each level represents a programming language with unique characteristics
// Difficulty scales progressively with smaller paddle, faster ball, fewer powerups
// ============================================================================

export const LEVELS = [
    {
        id: 1,
        name: 'HTML',
        color: '#e44d26',
        description: 'The foundation of the web',
        paddleWidth: 130,        // Very wide - tutorial level
        ballSpeed: 3.5,          // Slow
        brickPattern: 'simple',
        powerupChance: 0.25,     // Good powerup rate
        powerupRarity: 1.0,      // All powerups equal chance
        mechanics: [],
    },
    {
        id: 2,
        name: 'CSS',
        color: '#264de4',
        description: 'Styled layers',
        paddleWidth: 120,
        ballSpeed: 4,
        brickPattern: 'layers',
        powerupChance: 0.22,
        powerupRarity: 1.0,
        mechanics: ['strong_bricks'],
    },
    {
        id: 3,
        name: 'JavaScript',
        color: '#f7df1e',
        description: 'Dynamic and unpredictable',
        paddleWidth: 115,
        ballSpeed: 4.5,
        brickPattern: 'scattered',
        powerupChance: 0.20,
        powerupRarity: 0.9,      // Powerful powerups slightly rarer
        mechanics: ['random_powerups'],
    },
    {
        id: 4,
        name: 'Python',
        color: '#3776ab',
        description: 'Elegant simplicity',
        paddleWidth: 110,
        ballSpeed: 4.8,
        brickPattern: 'snake',
        powerupChance: 0.18,
        powerupRarity: 0.85,
        mechanics: ['curve_ball'],
    },
    {
        id: 5,
        name: 'PHP',
        color: '#777bb4',
        description: 'Web hustle',
        paddleWidth: 105,
        ballSpeed: 5.2,
        brickPattern: 'grid',
        powerupChance: 0.16,
        powerupRarity: 0.8,
        mechanics: ['speed_bonus'],
    },
    // ========== BONUS STAGE 1: ROGUELIKE ==========
    {
        id: 6,
        name: 'ROGUELIKE',
        color: '#9b59b6',
        description: 'Survive 5 minutes!',
        paddleWidth: 100,
        ballSpeed: 5,
        brickPattern: 'random',
        powerupChance: 0.30,
        powerupRarity: 1.0,
        mechanics: ['bonus_stage'],
        bonus: {
            type: 'roguelike',
            duration: 300000,        // 5 minutes
            brickRegenDelay: 10000,  // Bricks respawn after 10 seconds
            noDeathPenalty: true,
        },
    },
    {
        id: 7,
        name: 'Ruby',
        color: '#cc342d',
        description: 'Combo master',
        paddleWidth: 100,
        ballSpeed: 5.5,
        brickPattern: 'diamond',
        powerupChance: 0.14,
        powerupRarity: 0.75,
        mechanics: ['combo_boost'],
    },
    {
        id: 8,
        name: 'Java',
        color: '#007396',
        description: 'Heavy and robust',
        paddleWidth: 95,
        ballSpeed: 5.8,
        brickPattern: 'fortress',
        powerupChance: 0.12,
        powerupRarity: 0.7,
        mechanics: ['strong_bricks', 'hazard_bricks'],
    },
    {
        id: 9,
        name: 'C#',
        color: '#68217a',
        description: 'Multi-threaded chaos',
        paddleWidth: 90,
        ballSpeed: 6.2,
        brickPattern: 'castle',
        powerupChance: 0.11,
        powerupRarity: 0.65,
        mechanics: ['multi_ball_spawns'],
    },
    {
        id: 10,
        name: 'TypeScript',
        color: '#3178c6',
        description: 'Type-safe precision',
        paddleWidth: 85,
        ballSpeed: 6.5,
        brickPattern: 'typescript',
        powerupChance: 0.10,
        powerupRarity: 0.6,
        mechanics: ['penalty_miss_powerup'],
    },
    {
        id: 11,
        name: 'C',
        color: '#555555',
        description: 'Raw power',
        paddleWidth: 80,
        ballSpeed: 7,
        brickPattern: 'dense',
        powerupChance: 0.09,
        powerupRarity: 0.55,
        mechanics: ['strong_bricks'],
    },
    // ========== BONUS STAGE 2: RELAX ==========
    {
        id: 12,
        name: 'ZEN MODE',
        color: '#27ae60',
        description: 'Relax and rack up points!',
        paddleWidth: 120,
        ballSpeed: 4,
        brickPattern: 'random',
        powerupChance: 0.40,
        powerupRarity: 1.0,
        mechanics: ['bonus_stage'],
        bonus: {
            type: 'relax',
            duration: 180000,        // 3 minutes
            brickRegenDelay: 2000,   // Bricks respawn every 2 seconds
            permanentShield: true,
            initialBalls: 10,
            noDeathPenalty: true,
        },
    },
    {
        id: 13,
        name: 'C++',
        color: '#00599c',
        description: 'Complex machinery',
        paddleWidth: 75,
        ballSpeed: 7.5,
        brickPattern: 'moving',
        powerupChance: 0.08,
        powerupRarity: 0.5,
        mechanics: ['moving_bricks', 'strong_bricks'],
    },
    {
        id: 14,
        name: 'Go',
        color: '#00add8',
        description: 'Concurrent goroutines',
        paddleWidth: 70,
        ballSpeed: 8,
        brickPattern: 'channels',
        powerupChance: 0.07,
        powerupRarity: 0.45,
        mechanics: ['split_ball'],
    },
    {
        id: 15,
        name: 'Rust',
        color: '#dea584',
        description: 'Borrow checker',
        paddleWidth: 65,
        ballSpeed: 8.5,
        brickPattern: 'rust',
        powerupChance: 0.06,
        powerupRarity: 0.4,
        mechanics: ['limited_boost', 'strong_bricks'],
    },
    {
        id: 16,
        name: 'Haskell',
        color: '#5e5086',
        description: 'Monadic portals',
        paddleWidth: 60,
        ballSpeed: 9,
        brickPattern: 'portals',
        powerupChance: 0.05,
        powerupRarity: 0.35,
        mechanics: ['portal_bricks', 'strong_bricks'],
    },
    // ========== BONUS STAGE 3: DOODLE JUMP ==========
    {
        id: 17,
        name: 'BOUNCE',
        color: '#e74c3c',
        description: 'Keep jumping higher!',
        paddleWidth: 120,
        ballSpeed: 5,  // Base speed for calculations
        brickPattern: 'platforms',
        powerupChance: 0,            // No powerups in doodle mode
        powerupRarity: 0,
        mechanics: ['bonus_stage'],
        bonus: {
            type: 'doodle',
            duration: 180000,        // 3 minutes
            gravity: 0.25,           // Stronger gravity for faster gameplay
            jumpForce: -12,          // Stronger jump to reach platforms
            brickRegenDelay: 1000,   // Regenerate bricks after 1 second
            noDeathPenalty: true,
        },
    },
    {
        id: 18,
        name: 'Assembly',
        color: '#00ff00',
        description: 'Maximum performance',
        paddleWidth: 55,          // Very narrow - ultimate challenge
        ballSpeed: 10,            // Very fast
        brickPattern: 'hex',
        powerupChance: 0.04,      // Very rare powerups
        powerupRarity: 0.3,       // Powerful powerups extremely rare
        mechanics: ['minimal_ui', 'strong_bricks', 'moving_bricks'],
    },
];
