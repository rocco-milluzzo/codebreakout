// CODEBREAKOUT - Theme Manager
// ============================================================================
// Manages theme application and persistence
// ============================================================================

import { THEMES, THEME_IDS, getNextThemeId, getTheme } from '../themes.js';
import { LEVELS } from '../levels.js';
import { setThemeStyle } from './render.js';
import { t, getCurrentLanguage } from '../i18n.js';

let currentThemeId = 'code';

/**
 * Initialize theme system - loads saved theme and applies it
 * @param {string} savedThemeId - Theme ID from storage
 */
export function initializeTheme(savedThemeId) {
    currentThemeId = THEMES[savedThemeId] ? savedThemeId : 'code';
    applyTheme(currentThemeId);
}

/**
 * Convert hex color to RGB components string for CSS rgba()
 * @param {string} hex - Hex color like "#00ff88"
 * @returns {string} RGB string like "0, 255, 136"
 */
function hexToRgbString(hex) {
    // Parse hex color to RGB components
    const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.test(hex);
    if (!match) return '0, 255, 136'; // fallback to default green
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
}

/**
 * Apply a theme to the game
 * @param {string} themeId - Theme ID to apply
 */
export function applyTheme(themeId) {
    const theme = getTheme(themeId);
    currentThemeId = themeId;

    // Apply CSS variables to root
    const root = document.documentElement;
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--accent-dim', theme.accentDim);
    root.style.setProperty('--accent-rgb', hexToRgbString(theme.accent));

    // Apply theme class to body for background styling
    document.body.classList.remove('theme-code', 'theme-cake', 'theme-astro');
    document.body.classList.add(`theme-${themeId}`);

    // Apply theme visual style to render system
    if (theme.style) {
        setThemeStyle(theme.style);
    }

    // Update title prefix only (structure is preserved for click handling)
    const titlePrefix = document.getElementById('title-prefix');
    if (titlePrefix) {
        titlePrefix.textContent = theme.prefix;
    }

    // Update tagline
    const taglineElement = document.querySelector('.tagline');
    if (taglineElement) {
        taglineElement.textContent = theme.tagline;
    }

    // Update page title
    document.title = theme.meta.title;

    // Update meta tags
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metaDescription.content = theme.meta.description;
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
        ogTitle.content = `${theme.meta.title} - ${theme.prefix} Brick Breaker`;
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
        ogDescription.content = theme.meta.description;
    }

    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) {
        twitterTitle.content = `${theme.meta.title} - ${theme.prefix} Brick Breaker`;
    }

    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) {
        twitterDescription.content = theme.meta.description;
    }

    // Update theme color
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
        themeColor.content = theme.accent;
    }
}

/**
 * Cycle to the next theme
 * @returns {string} New theme ID
 */
export function cycleTheme() {
    const nextId = getNextThemeId(currentThemeId);
    applyTheme(nextId);
    return nextId;
}

/**
 * Get current theme ID
 * @returns {string} Current theme ID
 */
export function getCurrentThemeId() {
    return currentThemeId;
}

/**
 * Get current theme object
 * @returns {object} Current theme
 */
export function getCurrentTheme() {
    return getTheme(currentThemeId);
}

/**
 * Get themed level data for a given level index
 * This merges the theme's visual data with the game's mechanical data
 * @param {number} levelIndex - Index in the LEVELS array
 * @returns {object} Level data with themed name, color, description
 */
export function getThemedLevel(levelIndex) {
    const theme = getCurrentTheme();
    const baseLevel = LEVELS[levelIndex];
    const themedData = theme.levels[levelIndex];

    // If theme doesn't have data for this level, fall back to base
    if (!themedData) {
        return baseLevel;
    }

    // Get translated description if available
    const translatedDescriptions = t(`levels.${currentThemeId}`);
    const description = Array.isArray(translatedDescriptions) && translatedDescriptions[levelIndex]
        ? translatedDescriptions[levelIndex]
        : themedData.description;

    // Return merged data: base mechanics + themed visuals
    return {
        ...baseLevel,
        name: themedData.name,
        color: themedData.color,
        description: description,
    };
}

/**
 * Get the share text for social sharing
 * @param {number} score - Player's score
 * @param {string} levelName - Level name reached
 * @returns {string} Share text
 */
export function getShareText(score, levelName) {
    const theme = getCurrentTheme();
    return `I scored ${score.toLocaleString()} in ${theme.meta.title}, reaching ${levelName}! Can you beat my score?`;
}

/**
 * Get all available theme IDs
 * @returns {string[]} Array of theme IDs
 */
export function getAvailableThemes() {
    return THEME_IDS;
}
