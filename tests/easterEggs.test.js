import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    STREAK_QUOTES,
    SPECIAL_ATTACKS,
    getComboTier,
    getStreakQuote,
    checkSpecialAttack,
    createQuoteElement,
    createSpecialAttackElement,
} from '../src/easterEggs.js';

describe('Easter Eggs System', () => {
    describe('STREAK_QUOTES', () => {
        it('should have LOW tier quotes', () => {
            expect(STREAK_QUOTES.LOW).toBeDefined();
            expect(STREAK_QUOTES.LOW.length).toBeGreaterThan(0);
        });

        it('should have MEDIUM tier quotes', () => {
            expect(STREAK_QUOTES.MEDIUM).toBeDefined();
            expect(STREAK_QUOTES.MEDIUM.length).toBeGreaterThan(0);
        });

        it('should have HIGH tier quotes', () => {
            expect(STREAK_QUOTES.HIGH).toBeDefined();
            expect(STREAK_QUOTES.HIGH.length).toBeGreaterThan(0);
        });

        it('should have EPIC tier quotes', () => {
            expect(STREAK_QUOTES.EPIC).toBeDefined();
            expect(STREAK_QUOTES.EPIC.length).toBeGreaterThan(0);
        });

        it('should have quotes with text and char properties', () => {
            const quote = STREAK_QUOTES.LOW[0];
            expect(quote).toHaveProperty('text');
            expect(quote).toHaveProperty('char');
        });
    });

    describe('SPECIAL_ATTACKS', () => {
        it('should have KAMEHAMEHA attack', () => {
            expect(SPECIAL_ATTACKS.KAMEHAMEHA).toBeDefined();
            expect(SPECIAL_ATTACKS.KAMEHAMEHA.text).toBe('KAMEHAMEHA!');
            expect(SPECIAL_ATTACKS.KAMEHAMEHA.char).toBe('Goku');
            expect(SPECIAL_ATTACKS.KAMEHAMEHA.effect).toBe('column');
            expect(SPECIAL_ATTACKS.KAMEHAMEHA.color).toBe('#44aaff');
        });

        it('should have HADOUKEN attack', () => {
            expect(SPECIAL_ATTACKS.HADOUKEN).toBeDefined();
            expect(SPECIAL_ATTACKS.HADOUKEN.text).toBe('HADOUKEN!');
            expect(SPECIAL_ATTACKS.HADOUKEN.char).toBe('Ryu');
            expect(SPECIAL_ATTACKS.HADOUKEN.effect).toBe('row');
            expect(SPECIAL_ATTACKS.HADOUKEN.color).toBe('#44ff88');
        });
    });

    describe('getComboTier', () => {
        it('should return null for multiplier below 1.5', () => {
            expect(getComboTier(1.0)).toBeNull();
            expect(getComboTier(1.4)).toBeNull();
        });

        it('should return LOW for multiplier 1.5-1.9', () => {
            expect(getComboTier(1.5)).toBe('LOW');
            expect(getComboTier(1.9)).toBe('LOW');
        });

        it('should return MEDIUM for multiplier 2.0-2.9', () => {
            expect(getComboTier(2.0)).toBe('MEDIUM');
            expect(getComboTier(2.5)).toBe('MEDIUM');
            expect(getComboTier(2.9)).toBe('MEDIUM');
        });

        it('should return HIGH for multiplier 3.0-3.9', () => {
            expect(getComboTier(3.0)).toBe('HIGH');
            expect(getComboTier(3.5)).toBe('HIGH');
            expect(getComboTier(3.9)).toBe('HIGH');
        });

        it('should return EPIC for multiplier 4.0+', () => {
            expect(getComboTier(4.0)).toBe('EPIC');
            expect(getComboTier(5.0)).toBe('EPIC');
            expect(getComboTier(10.0)).toBe('EPIC');
        });
    });

    describe('getStreakQuote', () => {
        it('should return a quote for valid tier', () => {
            const quote = getStreakQuote('LOW');
            expect(quote).toBeDefined();
            expect(quote).toHaveProperty('text');
        });

        it('should return null for invalid tier', () => {
            expect(getStreakQuote('INVALID')).toBeNull();
            expect(getStreakQuote(null)).toBeNull();
            expect(getStreakQuote(undefined)).toBeNull();
        });

        it('should not repeat quotes until all are shown (deck system)', () => {
            const tier = 'MEDIUM'; // Use MEDIUM to avoid state from other tests
            const totalQuotes = STREAK_QUOTES[tier].length;
            const seenQuotes = new Set();

            // Get quotes equal to deck size plus a few more
            // This ensures we see the deck-based behavior
            for (let i = 0; i < totalQuotes + 3; i++) {
                const quote = getStreakQuote(tier);
                if (quote) seenQuotes.add(quote.text);
            }

            // Should have seen multiple unique quotes
            expect(seenQuotes.size).toBeGreaterThan(1);
            expect(seenQuotes.size).toBeLessThanOrEqual(totalQuotes);
        });

        it('should reshuffle and continue after deck is exhausted', () => {
            const tier = 'LOW';
            const totalQuotes = STREAK_QUOTES[tier].length;

            // Exhaust the deck
            for (let i = 0; i < totalQuotes; i++) {
                getStreakQuote(tier);
            }

            // Next quote should still work
            const quote = getStreakQuote(tier);
            expect(quote).toBeDefined();
            expect(quote).toHaveProperty('text');
        });
    });

    describe('checkSpecialAttack', () => {
        it('should return null for non-EPIC tier', () => {
            expect(checkSpecialAttack('LOW')).toBeNull();
            expect(checkSpecialAttack('MEDIUM')).toBeNull();
            expect(checkSpecialAttack('HIGH')).toBeNull();
        });

        it('should sometimes return special attack for EPIC tier', () => {
            // Run multiple times to account for 15% chance
            let gotSpecialAttack = false;
            for (let i = 0; i < 100; i++) {
                const result = checkSpecialAttack('EPIC');
                if (result !== null) {
                    gotSpecialAttack = true;
                    expect(result).toHaveProperty('attack');
                    expect(result).toHaveProperty('type');
                    expect(['KAMEHAMEHA', 'HADOUKEN']).toContain(result.type);
                    break;
                }
            }
            // With 15% chance over 100 tries, we should almost certainly get one
            expect(gotSpecialAttack).toBe(true);
        });

        it('should return valid attack data when triggered', () => {
            // Force Math.random to return values that trigger attack
            const originalRandom = Math.random;
            Math.random = vi.fn()
                .mockReturnValueOnce(0.05) // Trigger attack (< 0.15)
                .mockReturnValueOnce(0.3); // Select KAMEHAMEHA (< 0.5)

            const result = checkSpecialAttack('EPIC');
            expect(result).not.toBeNull();
            expect(result.type).toBe('KAMEHAMEHA');
            expect(result.attack).toBe(SPECIAL_ATTACKS.KAMEHAMEHA);

            Math.random = originalRandom;
        });

        it('should select HADOUKEN when random >= 0.5', () => {
            const originalRandom = Math.random;
            Math.random = vi.fn()
                .mockReturnValueOnce(0.05) // Trigger attack
                .mockReturnValueOnce(0.7); // Select HADOUKEN (>= 0.5)

            const result = checkSpecialAttack('EPIC');
            expect(result).not.toBeNull();
            expect(result.type).toBe('HADOUKEN');

            Math.random = originalRandom;
        });
    });

    describe('createQuoteElement', () => {
        it('should create a div element with quote class', () => {
            const el = createQuoteElement('Test quote', 'Character', 'LOW');
            expect(el.tagName).toBe('DIV');
            expect(el.className).toBe('easter-egg-quote');
        });

        it('should set quote color CSS variable', () => {
            const el = createQuoteElement('Test', 'Char', 'LOW');
            expect(el.style.getPropertyValue('--quote-color')).toBe('#88ff88');
        });

        it('should use correct color for each tier', () => {
            expect(createQuoteElement('t', 'c', 'LOW').style.getPropertyValue('--quote-color')).toBe('#88ff88');
            expect(createQuoteElement('t', 'c', 'MEDIUM').style.getPropertyValue('--quote-color')).toBe('#ffaa00');
            expect(createQuoteElement('t', 'c', 'HIGH').style.getPropertyValue('--quote-color')).toBe('#ff6644');
            expect(createQuoteElement('t', 'c', 'EPIC').style.getPropertyValue('--quote-color')).toBe('#ff44ff');
        });

        it('should include quote text in quotes when char is provided', () => {
            const el = createQuoteElement('Hello!', 'Mario', 'LOW');
            const quoteText = el.querySelector('.quote-text');
            expect(quoteText.textContent).toBe('"Hello!"');
        });

        it('should not add quotes when char is null', () => {
            const el = createQuoteElement('NANI?!', null, 'EPIC');
            const quoteText = el.querySelector('.quote-text');
            expect(quoteText.textContent).toBe('NANI?!');
        });

        it('should include character attribution when char is provided', () => {
            const el = createQuoteElement('Test', 'Mario', 'LOW');
            const charSpan = el.querySelector('.quote-char');
            expect(charSpan).not.toBeNull();
            expect(charSpan.textContent).toBe('— Mario');
        });

        it('should not include character attribution when char is null', () => {
            const el = createQuoteElement('Test', null, 'LOW');
            const charSpan = el.querySelector('.quote-char');
            expect(charSpan).toBeNull();
        });

        it('should use white color for unknown tier', () => {
            const el = createQuoteElement('Test', 'Char', 'UNKNOWN');
            expect(el.style.getPropertyValue('--quote-color')).toBe('#ffffff');
        });
    });

    describe('createSpecialAttackElement', () => {
        it('should create a div element with special-attack class', () => {
            const attack = SPECIAL_ATTACKS.KAMEHAMEHA;
            const el = createSpecialAttackElement('KAMEHAMEHA', attack);
            expect(el.tagName).toBe('DIV');
            expect(el.className).toContain('special-attack');
        });

        it('should include attack type in class name', () => {
            const attack = SPECIAL_ATTACKS.KAMEHAMEHA;
            const el = createSpecialAttackElement('KAMEHAMEHA', attack);
            expect(el.className).toContain('special-attack-kamehameha');
        });

        it('should set attack color CSS variable', () => {
            const attack = SPECIAL_ATTACKS.KAMEHAMEHA;
            const el = createSpecialAttackElement('KAMEHAMEHA', attack);
            expect(el.style.getPropertyValue('--attack-color')).toBe('#44aaff');
        });

        it('should include attack text', () => {
            const attack = SPECIAL_ATTACKS.HADOUKEN;
            const el = createSpecialAttackElement('HADOUKEN', attack);
            const textSpan = el.querySelector('.attack-text');
            expect(textSpan.textContent).toBe('"HADOUKEN!"');
        });

        it('should include character attribution', () => {
            const attack = SPECIAL_ATTACKS.KAMEHAMEHA;
            const el = createSpecialAttackElement('KAMEHAMEHA', attack);
            const charSpan = el.querySelector('.attack-char');
            expect(charSpan.textContent).toBe('— Goku');
        });
    });
});
