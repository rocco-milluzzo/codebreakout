// CODEBREAKOUT - Achievements System

export const ACHIEVEMENTS = [
    { id: 'first_blood', name: 'First Blood', desc: 'Complete your first level', icon: '🎯', requirement: { type: 'levels', value: 1 } },
    { id: 'combo_5', name: 'Combo Master', desc: 'Reach 5x multiplier', icon: '🔥', requirement: { type: 'combo', value: 5 } },
    { id: 'combo_10', name: 'Unstoppable', desc: 'Reach 10x multiplier', icon: '💥', requirement: { type: 'combo', value: 10 } },
    { id: 'perfect', name: 'Flawless', desc: 'Complete a level without losing lives', icon: '✨', requirement: { type: 'perfect', value: 1 } },
    { id: 'perfect_3', name: 'Perfectionist', desc: 'Complete 3 perfect levels', icon: '🏆', requirement: { type: 'perfect', value: 3 } },
    { id: 'speed_demon', name: 'Speed Demon', desc: 'Complete a level in under 30 seconds', icon: '⚡', requirement: { type: 'speedLevel', value: 30 } },
    { id: 'survivor', name: 'Survivor', desc: 'Complete Roguelike mode', icon: '🛡️', requirement: { type: 'bonusType', value: 'roguelike' } },
    { id: 'boss_slayer', name: 'Boss Slayer', desc: 'Defeat the Boss', icon: '👾', requirement: { type: 'bonusType', value: 'boss' } },
    { id: 'multiball_king', name: 'Chaos Lord', desc: 'Have 20+ balls at once', icon: '🎱', requirement: { type: 'ballCount', value: 20 } },
    { id: 'zen_master', name: 'Zen Master', desc: 'Complete Zen Mode', icon: '🧘', requirement: { type: 'bonusType', value: 'relax' } },
    { id: 'score_10k', name: 'Rising Star', desc: 'Reach 10,000 total score', icon: '⭐', requirement: { type: 'totalScore', value: 10000 } },
    { id: 'score_100k', name: 'Legend', desc: 'Reach 100,000 total score', icon: '🌟', requirement: { type: 'totalScore', value: 100000 } },
];

export function getAchievementById(id) {
    return ACHIEVEMENTS.find(a => a.id === id);
}

export function checkAchievement(achievement, gameState, progress) {
    const req = achievement.requirement;
    switch (req.type) {
        case 'levels': return progress.levelsCompleted >= req.value;
        case 'combo': return gameState.maxComboThisGame >= req.value || progress.maxCombo >= req.value;
        case 'perfect': return progress.perfectLevels >= req.value;
        case 'speedLevel': return gameState.levelTime && gameState.levelTime <= req.value * 1000;
        case 'bonusType': return gameState.completedBonusType === req.value;
        case 'ballCount': return gameState.maxBallsThisGame >= req.value;
        case 'totalScore': return progress.totalScore >= req.value;
        default: return false;
    }
}

export function getNewlyUnlockedAchievements(gameState, progress, unlockedAchievements) {
    const newlyUnlocked = [];
    for (const achievement of ACHIEVEMENTS) {
        if (!unlockedAchievements.includes(achievement.id)) {
            if (checkAchievement(achievement, gameState, progress)) {
                newlyUnlocked.push(achievement);
            }
        }
    }
    return newlyUnlocked;
}
