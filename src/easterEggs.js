// CODEBREAKOUT - Easter Eggs System
// ============================================================================
// Character quotes and special attacks triggered by combo streaks
// ============================================================================

// Epic character quotes - triggered by combo streaks
export const STREAK_QUOTES = {
    // Low combo (x1.5-2.0)
    LOW: [
        { text: 'Believe it!', char: 'Naruto' },
        { text: 'Let\'s go!', char: 'Goku' },
        { text: 'Here we go!', char: 'Mario' },
        { text: 'Don\'t panic!', char: 'Hitchhiker\'s Guide' },
        { text: 'Bazinga!', char: 'Sheldon' },
        { text: 'So say we all!', char: 'Battlestar Galactica' },
        { text: 'Yeah, science!', char: 'Jesse Pinkman' },
    ],
    // Medium combo (x2.0-3.0)
    MEDIUM: [
        { text: 'Burn, my cosmos!', char: 'Seiya' },
        { text: 'I have a bad feeling about this...', char: 'Han Solo' },
        { text: 'Winter is coming.', char: 'Ned Stark' },
        { text: 'I\'ll be back!', char: 'Terminator' },
        { text: 'I\'m not crazy, my mother had me tested.', char: 'Sheldon' },
        { text: 'By the power of Grayskull!', char: 'He-Man' },
        { text: 'The answer is 42.', char: 'Deep Thought' },
        { text: 'Save the cheerleader, save the world!', char: 'Heroes' },
        { text: 'All of this has happened before...', char: 'Battlestar Galactica' },
        { text: 'With great power comes great responsibility.', char: 'Uncle Ben' },
    ],
    // High combo (x3.0-4.0)
    HIGH: [
        { text: 'ATATATATATA!', char: 'Kenshiro' },
        { text: 'May the Force be with you!', char: 'Obi-Wan' },
        { text: 'I\'ll make him an offer he can\'t refuse.', char: 'Don Corleone' },
        { text: 'Hasta la vista, baby!', char: 'Terminator' },
        { text: 'Say hello to my little friend!', char: 'Scarface' },
        { text: 'This is SPARTA!', char: 'Leonidas' },
        { text: 'PLUS ULTRA!', char: 'All Might' },
        { text: 'Omae wa mou shindeiru...', char: 'Kenshiro' },
        { text: 'Valar morghulis.', char: 'Game of Thrones' },
        { text: 'I am the one who knocks!', char: 'Walter White' },
        { text: 'So long, and thanks for all the fish!', char: 'Dolphins' },
        { text: 'That\'s my spot!', char: 'Sheldon' },
        { text: 'SOTOMAYOR!', char: 'Aldo Giovanni e Giacomo' },
    ],
    // Epic combo (x4.0+)
    EPIC: [
        { text: 'IT\'S OVER 9000!', char: 'Vegeta' },
        { text: 'This isn\'t even my final form!', char: 'Frieza' },
        { text: 'NANI?!', char: null },
        { text: 'I am inevitable!', char: 'Thanos' },
        { text: 'Unlimited power!', char: 'Palpatine' },
        { text: 'You shall not pass!', char: 'Gandalf' },
        { text: 'I am the danger!', char: 'Walter White' },
        { text: 'Say my name.', char: 'Heisenberg' },
        { text: 'DRACARYS!', char: 'Daenerys' },
        { text: 'I am Iron Man.', char: 'Tony Stark' },
        { text: 'I love you 3000.', char: 'Tony Stark' },
        { text: 'I\'m Spider-Man!', char: 'Peter Parker' },
        { text: 'What do we say to death? Not today!', char: 'Syrio Forel' },
        { text: 'All this has happened before, and will happen again.', char: 'Six' },
    ],
};

// Special attacks - triggered rarely on EPIC tier
export const SPECIAL_ATTACKS = {
    KAMEHAMEHA: {
        text: 'KAMEHAMEHA!',
        char: 'Goku',
        effect: 'column',
        color: '#44aaff',
    },
    HADOUKEN: {
        text: 'HADOUKEN!',
        char: 'Ryu',
        effect: 'row',
        color: '#44ff88',
    },
};

// Quote colors based on combo tier
const TIER_COLORS = {
    LOW: '#88ff88',
    MEDIUM: '#ffaa00',
    HIGH: '#ff6644',
    EPIC: '#ff44ff',
};

/**
 * Get combo tier based on multiplier (adjusted for x5.0 max)
 */
export function getComboTier(multiplier) {
    if (multiplier >= 4.0) return 'EPIC';
    if (multiplier >= 3.0) return 'HIGH';
    if (multiplier >= 2.0) return 'MEDIUM';
    if (multiplier >= 1.5) return 'LOW';
    return null;
}

/**
 * Get random quote for combo tier
 */
export function getStreakQuote(tier) {
    const quotes = STREAK_QUOTES[tier];
    if (!quotes) return null;
    return quotes[Math.floor(Math.random() * quotes.length)];
}

/**
 * Check if special attack should trigger (very rare, only on EPIC)
 */
export function checkSpecialAttack(tier) {
    if (tier !== 'EPIC') return null;

    // 15% chance of special attack on EPIC tier
    if (Math.random() > 0.15) return null;

    const attackType = Math.random() < 0.5 ? 'KAMEHAMEHA' : 'HADOUKEN';
    return {
        attack: SPECIAL_ATTACKS[attackType],
        type: attackType,
    };
}

/**
 * Create floating quote element with character attribution
 */
export function createQuoteElement(text, char, tier) {
    const el = document.createElement('div');
    el.className = 'easter-egg-quote';

    const color = TIER_COLORS[tier] || '#ffffff';
    el.style.setProperty('--quote-color', color);

    const quoteText = document.createElement('span');
    quoteText.className = 'quote-text';
    quoteText.textContent = char ? `"${text}"` : text;
    el.appendChild(quoteText);

    if (char) {
        const charSpan = document.createElement('span');
        charSpan.className = 'quote-char';
        charSpan.textContent = `— ${char}`;
        el.appendChild(charSpan);
    }

    return el;
}

/**
 * Create special attack effect element
 */
export function createSpecialAttackElement(type, attack) {
    const el = document.createElement('div');
    el.className = `special-attack special-attack-${type.toLowerCase()}`;
    el.style.setProperty('--attack-color', attack.color);

    const textSpan = document.createElement('span');
    textSpan.className = 'attack-text';
    textSpan.textContent = `"${attack.text}"`;
    el.appendChild(textSpan);

    const charSpan = document.createElement('span');
    charSpan.className = 'attack-char';
    charSpan.textContent = `— ${attack.char}`;
    el.appendChild(charSpan);

    return el;
}
