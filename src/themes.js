// CODEBREAKOUT - Theme Definitions
// ============================================================================
// Each theme provides visual theming (names, colors, taglines) while
// keeping game mechanics identical across all themes.
// ============================================================================

export const THEMES = {
    code: {
        id: 'code',
        prefix: 'CODE',
        tagline: 'Level up from HTML to Assembly',
        accent: '#00ff88',
        accentDim: '#00aa55',
        // Visual style for rendering
        style: {
            brickStyle: 'angular',      // Sharp corners, tech look
            brickBorderRadius: 3,
            brickBorderWidth: 2,
            brickGlow: true,
            brickPattern: 'grid',       // Subtle grid pattern on bricks
            paddleStyle: 'tech',
            ballGlow: true,
            particleStyle: 'pixels',    // Pixelated particles
        },
        levels: [
            { name: 'HTML', color: '#e44d26', description: 'The foundation of the web' },
            { name: 'CSS', color: '#264de4', description: 'Styled layers' },
            { name: 'JavaScript', color: '#f7df1e', description: 'Dynamic and unpredictable' },
            { name: 'Python', color: '#3776ab', description: 'Elegant simplicity' },
            { name: 'PHP', color: '#777bb4', description: 'Web hustle' },
            { name: 'ROGUELIKE', color: '#9b59b6', description: 'Survive 2:30!' },
            { name: 'Ruby', color: '#cc342d', description: 'Combo master' },
            { name: 'Java', color: '#007396', description: 'Heavy and robust' },
            { name: 'C#', color: '#68217a', description: 'Multi-threaded chaos' },
            { name: 'TypeScript', color: '#3178c6', description: 'Type-safe precision' },
            { name: 'C', color: '#555555', description: 'Raw power' },
            { name: 'ZEN MODE', color: '#27ae60', description: 'Relax and rack up points!' },
            { name: 'C++', color: '#00599c', description: 'Complex machinery' },
            { name: 'Go', color: '#00add8', description: 'Concurrent goroutines' },
            { name: 'Rust', color: '#dea584', description: 'Borrow checker' },
            { name: 'Haskell', color: '#5e5086', description: 'Monadic portals' },
            { name: 'BOUNCE', color: '#e74c3c', description: 'Keep jumping higher!' },
            { name: 'Assembly', color: '#00ff00', description: 'Maximum performance' },
            { name: 'BULLET HELL', color: '#ff0066', description: 'Dodge the bullets!' },
            { name: 'INVASION', color: '#ff6600', description: 'Stop the descent!' },
            { name: 'MULTIBALL MADNESS', color: '#00ffff', description: 'Reach 50 balls!' },
            { name: 'BOSS BATTLE', color: '#ff0000', description: 'Defeat the boss!' },
            { name: 'SPEED RUN', color: '#ffff00', description: 'Clear waves! 60 seconds!' },
        ],
        meta: {
            title: 'CODEBREAKOUT',
            description: 'A programming-themed brick breaker game. Level up from HTML to Assembly!',
        },
    },
    cake: {
        id: 'cake',
        prefix: 'CAKE',
        tagline: 'Bake from Cupcake to Wedding Cake',
        accent: '#ff69b4',
        accentDim: '#ff1493',
        // Visual style for rendering
        style: {
            brickStyle: 'rounded',      // Soft, rounded corners like pastries
            brickBorderRadius: 10,
            brickBorderWidth: 3,
            brickGlow: false,
            brickPattern: 'frosting',   // Frosting/drip effect on top
            paddleStyle: 'candy',
            ballGlow: false,
            particleStyle: 'sprinkles', // Colorful sprinkle particles
        },
        levels: [
            { name: 'Cupcake', color: '#ffb6c1', description: 'Sweet beginnings' },
            { name: 'Cookie', color: '#d2691e', description: 'Crunchy delight' },
            { name: 'Muffin', color: '#deb887', description: 'Fluffy and warm' },
            { name: 'Brownie', color: '#8b4513', description: 'Rich chocolate' },
            { name: 'Donut', color: '#ff69b4', description: 'Glazed perfection' },
            { name: 'SUGAR RUSH', color: '#9b59b6', description: 'Survive 2:30!' },
            { name: 'Macaron', color: '#e6e6fa', description: 'French elegance' },
            { name: 'Cheesecake', color: '#fffacd', description: 'Creamy layers' },
            { name: 'Eclair', color: '#f5deb3', description: 'Chocolate topped' },
            { name: 'Croissant', color: '#daa520', description: 'Buttery layers' },
            { name: 'Tiramisu', color: '#8b7355', description: 'Coffee infused' },
            { name: 'ZEN BAKE', color: '#27ae60', description: 'Relax and rack up points!' },
            { name: 'Souffle', color: '#ffefd5', description: 'Delicate rise' },
            { name: 'Creme Brulee', color: '#ffd700', description: 'Caramelized top' },
            { name: 'Profiterole', color: '#f4a460', description: 'Cream filled' },
            { name: 'Baklava', color: '#cd853f', description: 'Honeyed layers' },
            { name: 'BOUNCE', color: '#e74c3c', description: 'Keep jumping higher!' },
            { name: 'Wedding Cake', color: '#fffafa', description: 'Ultimate mastery' },
            { name: 'CANDY STORM', color: '#ff0066', description: 'Dodge the candies!' },
            { name: 'FROSTING FLOOD', color: '#ff6600', description: 'Stop the frosting!' },
            { name: 'SPRINKLE MADNESS', color: '#00ffff', description: 'Reach 50 sprinkles!' },
            { name: 'CHEF BATTLE', color: '#ff0000', description: 'Defeat the chef!' },
            { name: 'BAKE OFF', color: '#ffff00', description: 'Bake fast! 60 seconds!' },
        ],
        meta: {
            title: 'CAKEBREAKOUT',
            description: 'A dessert-themed brick breaker game. Bake from Cupcake to Wedding Cake!',
        },
    },
    astro: {
        id: 'astro',
        prefix: 'ASTRO',
        tagline: 'Journey from Moon to Big Bang',
        accent: '#9370db',
        accentDim: '#7b68ee',
        // Visual style for rendering
        style: {
            brickStyle: 'space',        // Oval/planetary shapes
            brickBorderRadius: 8,
            brickBorderWidth: 2,
            brickGlow: true,
            brickPattern: 'stars',      // Subtle star sparkles
            paddleStyle: 'spaceship',
            ballGlow: true,
            particleStyle: 'stardust',  // Glowing stardust particles
        },
        levels: [
            { name: 'Moon', color: '#c0c0c0', description: 'First step into space' },
            { name: 'Mars', color: '#cd5c5c', description: 'The red planet' },
            { name: 'Venus', color: '#ffa500', description: 'Scorching atmosphere' },
            { name: 'Jupiter', color: '#daa520', description: 'Giant storms' },
            { name: 'Saturn', color: '#f4a460', description: 'Ringed beauty' },
            { name: 'ASTEROID BELT', color: '#9b59b6', description: 'Survive 2:30!' },
            { name: 'Uranus', color: '#40e0d0', description: 'Ice giant' },
            { name: 'Neptune', color: '#4169e1', description: 'Deep blue' },
            { name: 'Pluto', color: '#d8bfd8', description: 'Dwarf planet' },
            { name: 'Comet', color: '#87ceeb', description: 'Icy wanderer' },
            { name: 'Sun', color: '#ffff00', description: 'Stellar power' },
            { name: 'ZEN ORBIT', color: '#27ae60', description: 'Relax and rack up points!' },
            { name: 'Alpha Centauri', color: '#fffacd', description: 'Nearest star' },
            { name: 'Betelgeuse', color: '#ff6347', description: 'Red supergiant' },
            { name: 'Sirius', color: '#e0ffff', description: 'Brightest star' },
            { name: 'Pulsar', color: '#9932cc', description: 'Spinning neutron star' },
            { name: 'BOUNCE', color: '#e74c3c', description: 'Keep jumping higher!' },
            { name: 'Black Hole', color: '#1a1a2e', description: 'Event horizon' },
            { name: 'METEOR STORM', color: '#ff0066', description: 'Dodge the meteors!' },
            { name: 'ALIEN INVASION', color: '#ff6600', description: 'Stop the aliens!' },
            { name: 'STARFIELD', color: '#00ffff', description: 'Reach 50 stars!' },
            { name: 'COSMIC BOSS', color: '#ff0000', description: 'Defeat the entity!' },
            { name: 'WARP SPEED', color: '#ffff00', description: 'Light speed! 60 seconds!' },
        ],
        meta: {
            title: 'ASTROBREAKOUT',
            description: 'A space-themed brick breaker game. Journey from Moon to Big Bang!',
        },
    },
};

// Export theme IDs for cycling
export const THEME_IDS = Object.keys(THEMES);

/**
 * Get the next theme ID in the cycle
 * @param {string} currentThemeId - Current theme ID
 * @returns {string} Next theme ID
 */
export function getNextThemeId(currentThemeId) {
    const currentIndex = THEME_IDS.indexOf(currentThemeId);
    const nextIndex = (currentIndex + 1) % THEME_IDS.length;
    return THEME_IDS[nextIndex];
}

/**
 * Get theme by ID
 * @param {string} themeId - Theme ID
 * @returns {object} Theme object
 */
export function getTheme(themeId) {
    return THEMES[themeId] || THEMES.code;
}
