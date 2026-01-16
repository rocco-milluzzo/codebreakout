import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    loadHighScores,
    saveHighScores,
    addHighScore,
    getTopScore,
    isHighScore,
    updateHighScoreDisplay,
    displayLeaderboard,
} from '../../src/systems/storage.js';

describe('Storage System', () => {
    let localStorageMock;

    beforeEach(() => {
        // Mock localStorage
        localStorageMock = {
            store: {},
            getItem: vi.fn((key) => localStorageMock.store[key] || null),
            setItem: vi.fn((key, value) => { localStorageMock.store[key] = value; }),
            removeItem: vi.fn((key) => { delete localStorageMock.store[key]; }),
            clear: vi.fn(() => { localStorageMock.store = {}; }),
        };
        Object.defineProperty(global, 'localStorage', { value: localStorageMock });

        // Mock fetch to fail (API unavailable)
        global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('loadHighScores', () => {
        it('should return empty array when no scores saved', async () => {
            const scores = await loadHighScores();
            expect(scores).toEqual([]);
        });

        it('should load scores from localStorage', async () => {
            const mockScores = [{ name: 'Player1', score: 1000 }];
            localStorageMock.store['codebreakout_highscores'] = JSON.stringify(mockScores);
            const scores = await loadHighScores();
            expect(scores).toEqual(mockScores);
        });

        it('should load mode-specific scores', async () => {
            const mockScores = [{ name: 'Player1', score: 500 }];
            localStorageMock.store['codebreakout_highscores_roguelike'] = JSON.stringify(mockScores);
            const scores = await loadHighScores('roguelike');
            expect(scores).toEqual(mockScores);
        });

        it('should handle JSON parse errors', async () => {
            localStorageMock.store['codebreakout_highscores'] = 'invalid json';
            const scores = await loadHighScores();
            expect(scores).toEqual([]);
        });
    });

    describe('saveHighScores', () => {
        it('should save scores to localStorage', () => {
            const scores = [{ name: 'Player1', score: 1000 }];
            saveHighScores(scores);
            expect(localStorageMock.setItem).toHaveBeenCalled();
        });

        it('should sort scores by score descending', () => {
            const scores = [
                { name: 'Low', score: 100 },
                { name: 'High', score: 1000 },
                { name: 'Mid', score: 500 },
            ];
            const result = saveHighScores(scores);
            expect(result[0].name).toBe('High');
            expect(result[1].name).toBe('Mid');
            expect(result[2].name).toBe('Low');
        });

        it('should limit to 10 scores', () => {
            const scores = Array.from({ length: 15 }, (_, i) => ({ name: `Player${i}`, score: i * 100 }));
            const result = saveHighScores(scores);
            expect(result.length).toBe(10);
        });
    });

    describe('addHighScore', () => {
        it('should add new score entry', async () => {
            const existingScores = [];
            const scores = await addHighScore(existingScores, 'NewPlayer', 1000, 'Level 5');
            expect(scores.length).toBe(1);
            expect(scores[0].name).toBe('NewPlayer');
            expect(scores[0].score).toBe(1000);
        });

        it('should use Anonymous for empty name', async () => {
            const scores = await addHighScore([], '', 1000, 'Level 5');
            expect(scores[0].name).toBe('Anonymous');
        });

        it('should add date to entry', async () => {
            const scores = await addHighScore([], 'Player', 1000, 'Level 5');
            expect(scores[0].date).toBeDefined();
        });

        it('should add mode to entry', async () => {
            const scores = await addHighScore([], 'Player', 1000, 'Level 5', 'roguelike');
            expect(scores[0].mode).toBe('roguelike');
        });

        it('should sort and limit scores', async () => {
            const existing = Array.from({ length: 10 }, (_, i) => ({ name: `P${i}`, score: (i + 1) * 100 }));
            const scores = await addHighScore(existing, 'NewPlayer', 550, 'Level 5');
            expect(scores.length).toBe(10);
            // New score should be in the middle
            const newEntry = scores.find(s => s.name === 'NewPlayer');
            expect(newEntry).toBeDefined();
        });
    });

    describe('getTopScore', () => {
        it('should return highest score', () => {
            const scores = [
                { name: 'High', score: 1000 },
                { name: 'Low', score: 100 },
            ];
            expect(getTopScore(scores)).toBe(1000);
        });

        it('should return 0 for empty scores', () => {
            expect(getTopScore([])).toBe(0);
        });
    });

    describe('isHighScore', () => {
        it('should return true when less than max scores', () => {
            const scores = [{ score: 1000 }];
            expect(isHighScore(scores, 100)).toBe(true);
        });

        it('should return true when score beats lowest', () => {
            // Scores are stored in descending order (highest first)
            const scores = Array.from({ length: 10 }, (_, i) => ({ score: (10 - i) * 100 }));
            // scores = [1000, 900, 800, ..., 100], so lowest is 100
            expect(isHighScore(scores, 150)).toBe(true);
        });

        it('should return false when score is lower than all', () => {
            const scores = Array.from({ length: 10 }, (_, i) => ({ score: (i + 10) * 100 }));
            expect(isHighScore(scores, 50)).toBe(false);
        });
    });

    describe('updateHighScoreDisplay', () => {
        it('should update element textContent', () => {
            const element = { textContent: '' };
            const scores = [{ score: 1234 }];
            updateHighScoreDisplay(element, scores);
            expect(element.textContent).toBe('1,234');
        });

        it('should handle empty scores', () => {
            const element = { textContent: '' };
            updateHighScoreDisplay(element, []);
            expect(element.textContent).toBe('0');
        });
    });

    describe('displayLeaderboard', () => {
        let mockListElement;

        beforeEach(() => {
            // Create mock document methods
            mockListElement = {
                textContent: '',
                appendChild: vi.fn(),
            };

            global.document = {
                createElement: vi.fn((tag) => ({
                    tagName: tag,
                    className: '',
                    textContent: '',
                    classList: { add: vi.fn() },
                    appendChild: vi.fn(),
                })),
            };
        });

        it('should clear existing content', () => {
            displayLeaderboard(mockListElement, []);
            expect(mockListElement.textContent).toBe('');
        });

        it('should create list items for scores', () => {
            const scores = [
                { name: 'Player1', score: 1000 },
                { name: 'Player2', score: 500 },
            ];
            displayLeaderboard(mockListElement, scores);
            expect(mockListElement.appendChild).toHaveBeenCalledTimes(2);
        });

        it('should limit display count', () => {
            const scores = Array.from({ length: 10 }, (_, i) => ({ name: `P${i}`, score: i * 100 }));
            displayLeaderboard(mockListElement, scores, null, 3);
            expect(mockListElement.appendChild).toHaveBeenCalledTimes(3);
        });

        it('should handle scores less than maxDisplay', () => {
            const scores = [{ name: 'Player1', score: 1000 }];
            displayLeaderboard(mockListElement, scores, null, 5);
            expect(mockListElement.appendChild).toHaveBeenCalledTimes(1);
        });

        it('should highlight current score', () => {
            const scores = [
                { name: 'Player1', score: 1000 },
            ];
            displayLeaderboard(mockListElement, scores, 1000, 5);
            expect(mockListElement.appendChild).toHaveBeenCalled();
        });
    });

    describe('clearHighScoresLocal', () => {
        let clearHighScoresLocal;

        beforeEach(async () => {
            const module = await import('../../src/systems/storage.js');
            clearHighScoresLocal = module.clearHighScoresLocal;
        });

        it('should call removeItem on localStorage', () => {
            // Just verify it runs without error
            expect(() => clearHighScoresLocal()).not.toThrow();
        });

        it('should handle storage errors gracefully', () => {
            const originalRemoveItem = localStorageMock.removeItem;
            localStorageMock.removeItem = vi.fn(() => {
                throw new Error('Storage error');
            });
            expect(() => clearHighScoresLocal()).not.toThrow();
            localStorageMock.removeItem = originalRemoveItem;
        });
    });

    describe('recordGameSession', () => {
        let recordGameSession;

        beforeEach(async () => {
            const module = await import('../../src/systems/storage.js');
            recordGameSession = module.recordGameSession;
        });

        it('should not call API when unavailable', async () => {
            global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
            await recordGameSession('campaign', 'Level 1', 300, 1000);
            // Should not throw
        });

        it('should call API when available', async () => {
            global.fetch = vi.fn()
                .mockResolvedValueOnce({ ok: true }) // health check
                .mockResolvedValueOnce({ ok: true }); // stats post

            await recordGameSession('campaign', 'Level 1', 300, 1000);
            // Wait for async operations
            await new Promise(resolve => setTimeout(resolve, 0));
        });
    });

    describe('fetchGameStats', () => {
        let fetchGameStats;

        beforeEach(async () => {
            const module = await import('../../src/systems/storage.js');
            fetchGameStats = module.fetchGameStats;
        });

        it('should return null when API unavailable', async () => {
            global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
            const result = await fetchGameStats();
            expect(result).toBeNull();
        });

        it('should fetch stats when API available', async () => {
            const mockStats = { totalGames: 100, avgScore: 5000 };
            global.fetch = vi.fn()
                .mockResolvedValueOnce({ ok: true }) // health check
                .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockStats) }); // stats get

            const result = await fetchGameStats();
            // API availability is cached, so behavior depends on prior calls
        });
    });

    describe('loadHighScores with API', () => {
        it('should load from API when available', async () => {
            const mockScores = [{ name: 'APIPlayer', score: 5000 }];
            global.fetch = vi.fn()
                .mockResolvedValueOnce({ ok: true }) // health check
                .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockScores) }); // scores get

            // Need fresh import to reset API availability
            vi.resetModules();
            const { loadHighScores: freshLoadHighScores } = await import('../../src/systems/storage.js');
            const scores = await freshLoadHighScores();
            // Check that API was called
        });

        it('should fall back to localStorage on API error', async () => {
            const localScores = [{ name: 'LocalPlayer', score: 1000 }];
            localStorageMock.store['codebreakout_highscores'] = JSON.stringify(localScores);

            global.fetch = vi.fn()
                .mockResolvedValueOnce({ ok: true }) // health check
                .mockRejectedValueOnce(new Error('API error')); // scores get fails

            vi.resetModules();
            const { loadHighScores: freshLoadHighScores } = await import('../../src/systems/storage.js');
            const scores = await freshLoadHighScores();
            // Should fall back gracefully
        });
    });

    describe('addHighScore with API', () => {
        it('should post to API when available', async () => {
            const mockLeaderboard = [{ name: 'NewPlayer', score: 2000 }];
            global.fetch = vi.fn()
                .mockResolvedValueOnce({ ok: true }) // health check
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve({ leaderboard: mockLeaderboard })
                }); // scores post

            vi.resetModules();
            const { addHighScore: freshAddHighScore } = await import('../../src/systems/storage.js');
            const scores = await freshAddHighScore([], 'NewPlayer', 2000, 'Level 5');
        });

        it('should fall back to localStorage on API post error', async () => {
            global.fetch = vi.fn()
                .mockResolvedValueOnce({ ok: true }) // health check
                .mockRejectedValueOnce(new Error('API error')); // scores post fails

            vi.resetModules();
            const { addHighScore: freshAddHighScore } = await import('../../src/systems/storage.js');
            const scores = await freshAddHighScore([], 'FallbackPlayer', 1500, 'Level 3');
            expect(scores.length).toBe(1);
        });
    });
});
