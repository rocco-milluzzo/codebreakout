// CODEBREAKOUT - Storage System
// ============================================================================
// High scores persistence with API backend and localStorage fallback
// ============================================================================

const STORAGE_KEY = 'codebreakout_highscores';
const MAX_SCORES = 10;
const API_BASE = '/api';

// Track if API is available
let apiAvailable = null;

/**
 * Check if API is available
 * @returns {Promise<boolean>}
 */
async function checkApiAvailability() {
    if (apiAvailable !== null) return apiAvailable;

    try {
        const response = await fetch(`${API_BASE}/health`, {
            method: 'GET',
            signal: AbortSignal.timeout(2000),
        });
        apiAvailable = response.ok;
    } catch {
        apiAvailable = false;
    }

    console.log(`API ${apiAvailable ? 'available' : 'unavailable, using localStorage fallback'}`);
    return apiAvailable;
}

/**
 * Load high scores from localStorage (fallback)
 * @returns {object[]} Array of high score entries
 */
function loadHighScoresLocal() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        return [];
    }
}

/**
 * Save high scores to localStorage (fallback)
 * @param {object[]} scores - Array of high score entries
 */
function saveHighScoresLocal(scores) {
    try {
        const sorted = [...scores].sort((a, b) => b.score - a.score).slice(0, MAX_SCORES);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
        return sorted;
    } catch (e) {
        return scores;
    }
}

/**
 * Load high scores - API with localStorage fallback
 * @returns {Promise<object[]>} Array of high score entries
 */
export async function loadHighScores() {
    const isApiAvailable = await checkApiAvailability();

    if (isApiAvailable) {
        try {
            const response = await fetch(`${API_BASE}/scores`);
            if (response.ok) {
                const scores = await response.json();
                // Also save to localStorage as cache
                saveHighScoresLocal(scores);
                return scores;
            }
        } catch (error) {
            console.error('API error, falling back to localStorage:', error);
        }
    }

    return loadHighScoresLocal();
}

/**
 * Save high scores - for backward compatibility
 * @param {object[]} scores - Array of high score entries
 * @returns {object[]}
 */
export function saveHighScores(scores) {
    return saveHighScoresLocal(scores);
}

/**
 * Add a new high score - API with localStorage fallback
 * @param {object[]} existingScores - Current high scores
 * @param {string} name - Player name
 * @param {number} score - Score value
 * @param {string} levelName - Level reached
 * @returns {Promise<object[]>} Updated high scores array
 */
export async function addHighScore(existingScores, name, score, levelName) {
    const newEntry = {
        name: name || 'Anonymous',
        score,
        level: levelName,
        date: new Date().toISOString(),
    };

    const isApiAvailable = await checkApiAvailability();

    if (isApiAvailable) {
        try {
            const response = await fetch(`${API_BASE}/scores`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: newEntry.name,
                    score: newEntry.score,
                    level: newEntry.level,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                // Update localStorage cache
                saveHighScoresLocal(data.leaderboard);
                return data.leaderboard;
            }
        } catch (error) {
            console.error('API error, falling back to localStorage:', error);
        }
    }

    // Fallback to localStorage
    const newScores = [...existingScores, newEntry];
    return saveHighScoresLocal(newScores);
}

/**
 * Get the top score value
 * @param {object[]} scores - High scores array
 * @returns {number}
 */
export function getTopScore(scores) {
    return scores[0]?.score || 0;
}

/**
 * Check if a score qualifies for the leaderboard
 * @param {object[]} scores - High scores array
 * @param {number} score - Score to check
 * @returns {boolean}
 */
export function isHighScore(scores, score) {
    if (scores.length < MAX_SCORES) return true;
    const lowestScore = scores[scores.length - 1]?.score || 0;
    return score > lowestScore;
}

/**
 * Clear local high scores cache
 * Note: Server-side deletion requires database admin access for security
 */
export function clearHighScoresLocal() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
        // Ignore storage errors
    }
}

/**
 * Update high score display in the DOM
 * @param {HTMLElement} element - DOM element to update
 * @param {object[]} scores - High scores array
 */
export function updateHighScoreDisplay(element, scores) {
    const best = getTopScore(scores);
    element.textContent = best.toLocaleString();
}

/**
 * Display leaderboard in a list element
 * @param {HTMLOListElement} listElement - OL element for leaderboard
 * @param {object[]} scores - High scores array
 * @param {number|null} currentScore - Current player's score to highlight
 * @param {number} maxDisplay - Maximum entries to display
 */
export function displayLeaderboard(listElement, scores, currentScore = null, maxDisplay = 5) {
    listElement.textContent = ''; // Clear safely

    const displayCount = Math.min(maxDisplay, scores.length);

    for (let i = 0; i < displayCount; i++) {
        const entry = scores[i];
        const li = document.createElement('li');

        if (currentScore !== null && entry.score === currentScore) {
            li.classList.add('highlight');
        }

        const rankSpan = document.createElement('span');
        rankSpan.className = 'rank';
        rankSpan.textContent = `${i + 1}.`;

        const nameSpan = document.createElement('span');
        nameSpan.className = 'name';
        nameSpan.textContent = entry.name;

        const scoreSpan = document.createElement('span');
        scoreSpan.className = 'score';
        scoreSpan.textContent = entry.score.toLocaleString();

        li.appendChild(rankSpan);
        li.appendChild(nameSpan);
        li.appendChild(scoreSpan);
        listElement.appendChild(li);
    }
}
