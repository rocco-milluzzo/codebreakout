// CODEBREAKOUT - Easter Eggs System
// ============================================================================
// Character quotes and special attacks triggered by combo streaks
// ============================================================================

// Epic character quotes - triggered by combo streaks
export const STREAK_QUOTES = {
    // Low combo (x1.5-2.0)
    LOW: [
        { text: 'Believe it!', char: 'Naruto' },
        { text: 'Let\'s-a go!', char: 'Mario' },
        { text: 'COWABUNGA!', char: 'Ninja Turtles' },
        { text: 'Groovy!', char: 'Ash Williams' },
        { text: 'Yeah, science!', char: 'Jesse Pinkman' },
        { text: 'Yippee-ki-yay!', char: 'John McClane' },
        { text: 'Allons-y!', char: 'The Doctor' },
    ],
    // Medium combo (x2.0-3.0)
    MEDIUM: [
        { text: 'Burn, my cosmos!', char: 'Seiya' },
        { text: 'I\'ll be back!', char: 'Terminator' },
        { text: 'By the power of Grayskull!', char: 'He-Man' },
        { text: 'To infinity and beyond!', char: 'Buzz Lightyear' },
        { text: 'Avengers, assemble!', char: 'Captain America' },
        { text: 'Get over here!', char: 'Scorpion' },
        { text: 'FINISH HIM!', char: 'Mortal Kombat' },
        { text: 'Wololo!', char: 'Age of Empires' },
        { text: 'Leeeroy Jenkins!', char: 'Leeroy' },
        { text: 'Do a barrel roll!', char: 'Peppy Hare' },
    ],
    // High combo (x3.0-4.0)
    HIGH: [
        { text: 'ATATATATATA!', char: 'Kenshiro' },
        { text: 'Hasta la vista, baby!', char: 'Terminator' },
        { text: 'Say hello to my little friend!', char: 'Scarface' },
        { text: 'THIS IS SPARTA!', char: 'Leonidas' },
        { text: 'PLUS ULTRA!', char: 'All Might' },
        { text: 'Omae wa mou shindeiru...', char: 'Kenshiro' },
        { text: 'FATALITY!', char: 'Mortal Kombat' },
        { text: 'Hadouken!', char: 'Ryu' },
        { text: 'SHORYUKEN!', char: 'Ken' },
        { text: 'It\'s dangerous to go alone!', char: 'Old Man' },
        { text: 'SOTOMAYOR!', char: 'Aldo Giovanni e Giacomo' },
        { text: 'WASTED', char: 'GTA' },
        { text: 'Praise the sun!', char: 'Solaire' },
    ],
    // Epic combo (x4.0+)
    EPIC: [
        { text: 'IT\'S OVER 9000!', char: 'Vegeta' },
        { text: 'This isn\'t even my final form!', char: 'Frieza' },
        { text: 'NANI?!', char: null },
        { text: 'I am inevitable!', char: 'Thanos' },
        { text: 'UNLIMITED POWER!', char: 'Palpatine' },
        { text: 'YOU SHALL NOT PASS!', char: 'Gandalf' },
        { text: 'DRACARYS!', char: 'Daenerys' },
        { text: 'I am Iron Man.', char: 'Tony Stark' },
        { text: 'WITNESS ME!', char: 'Nux' },
        { text: 'I AM GROOT!', char: 'Groot' },
        { text: 'VICTORY SCREECH!', char: 'SpongeBob' },
        { text: 'SHOW ME YOUR MOVES!', char: 'Captain Falcon' },
        { text: 'FALCON PUNCH!', char: 'Captain Falcon' },
        { text: 'GG EZ', char: null },
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

// Deck-based quote system - ensures all quotes shown before repeats
const quoteDecks = {
    LOW: [],
    MEDIUM: [],
    HIGH: [],
    EPIC: [],
};

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

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
 * Get quote for combo tier using deck system (no repeats until all shown)
 */
export function getStreakQuote(tier) {
    const quotes = STREAK_QUOTES[tier];
    if (!quotes) return null;

    // Refill and shuffle deck if empty
    if (quoteDecks[tier].length === 0) {
        quoteDecks[tier] = shuffleArray(quotes);
    }

    // Draw from deck
    return quoteDecks[tier].pop();
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
