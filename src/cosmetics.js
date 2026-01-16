// CODEBREAKOUT - Cosmetics System

export const COSMETICS = {
    paddles: [
        { id: 'default', name: 'Classic', unlocked: true, requirement: null },
        { id: 'neon', name: 'Neon', unlocked: false, requirement: { type: 'score', value: 5000 }, color: '#ff00ff', glow: true },
        { id: 'retro', name: 'Retro', unlocked: false, requirement: { type: 'levels', value: 5 }, color: '#ffaa00', pixelated: true },
        { id: 'cyber', name: 'Cyber', unlocked: false, requirement: { type: 'combo', value: 8 }, color: '#00ffff', glow: true },
        { id: 'golden', name: 'Golden', unlocked: false, requirement: { type: 'perfect', value: 3 }, color: '#ffd700', shine: true },
        { id: 'rainbow', name: 'Rainbow', unlocked: false, requirement: { type: 'score', value: 50000 }, rainbow: true },
    ],
    trails: [
        { id: 'default', name: 'None', unlocked: true, requirement: null },
        { id: 'fire', name: 'Fire', unlocked: false, requirement: { type: 'combo', value: 5 }, color: '#ff4400' },
        { id: 'ice', name: 'Ice', unlocked: false, requirement: { type: 'levels', value: 3 }, color: '#00ccff' },
        { id: 'electric', name: 'Electric', unlocked: false, requirement: { type: 'score', value: 10000 }, color: '#ffff00' },
        { id: 'pixel', name: 'Pixel', unlocked: false, requirement: { type: 'perfect', value: 1 }, color: '#88ff88' },
        { id: 'comet', name: 'Comet', unlocked: false, requirement: { type: 'bonus', value: 3 }, color: '#ff8800' },
    ],
    backgrounds: [
        { id: 'default', name: 'Matrix', unlocked: true, requirement: null, preview: '#001100' },
        { id: 'space', name: 'Space', unlocked: false, requirement: { type: 'levels', value: 8 }, preview: '#000033' },
        { id: 'grid', name: 'Grid', unlocked: false, requirement: { type: 'score', value: 25000 }, preview: '#111133' },
        { id: 'binary', name: 'Binary', unlocked: false, requirement: { type: 'combo', value: 10 }, preview: '#002200' },
        { id: 'sunset', name: 'Sunset', unlocked: false, requirement: { type: 'perfect', value: 5 }, preview: '#331111' },
        { id: 'void', name: 'Void', unlocked: false, requirement: { type: 'bonus', value: 5 }, preview: '#000000' },
    ],
};

export function getCosmeticById(type, id) {
    const typeKey = type + 's';
    if (!COSMETICS[typeKey]) {
        return null;
    }
    return COSMETICS[typeKey].find(c => c.id === id);
}

export function checkUnlockRequirement(requirement, progress) {
    if (!requirement) {
        return true;
    }
    switch (requirement.type) {
        case 'score':
            return (progress.totalScore || 0) >= requirement.value;
        case 'levels':
            return (progress.levelsCompleted || 0) >= requirement.value;
        case 'perfect':
            return (progress.perfectLevels || 0) >= requirement.value;
        case 'combo':
            return (progress.maxCombo || 0) >= requirement.value;
        case 'bonus':
            return (progress.bonusCompleted || 0) >= requirement.value;
        default:
            return false;
    }
}

export function getUnlockableCosmetics(progress) {
    const unlockable = [];
    const unlockedSet = new Set(progress.unlockedCosmetics || []);

    for (const [typeKey, cosmetics] of Object.entries(COSMETICS)) {
        for (const cosmetic of cosmetics) {
            if (!unlockedSet.has(cosmetic.id) && !cosmetic.unlocked) {
                if (checkUnlockRequirement(cosmetic.requirement, progress)) {
                    unlockable.push({ ...cosmetic, type: typeKey.slice(0, -1) });
                }
            }
        }
    }

    return unlockable;
}
