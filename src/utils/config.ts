const STARS_STORAGE_KEY = 'stars';
const TRIPLE_JUMP_STORAGE_KEY = 'upgrade_triple_jump';
const EMMA_CHARM_STORAGE_KEY = 'upgrade_emma_charm';
const FAMILIAR_ROUTE_STORAGE_KEY = 'upgrade_familiar_route';
const BASE_JUMPS = 2;
const FAMILIAR_ROUTE_SCORE_BONUS = 50;

export const getStoredStars = () => Number(localStorage.getItem(STARS_STORAGE_KEY) || '0');

export const setStoredStars = (stars: number) => {
    localStorage.setItem(STARS_STORAGE_KEY, String(Math.max(0, stars)));
};

export const hasTripleJumpUpgrade = () => localStorage.getItem(TRIPLE_JUMP_STORAGE_KEY) === 'true';

export const unlockTripleJumpUpgrade = () => {
    localStorage.setItem(TRIPLE_JUMP_STORAGE_KEY, 'true');
};

export const hasEmmaCharmUpgrade = () => localStorage.getItem(EMMA_CHARM_STORAGE_KEY) === 'true';

export const unlockEmmaCharmUpgrade = () => {
    localStorage.setItem(EMMA_CHARM_STORAGE_KEY, 'true');
};

export const hasFamiliarRouteUpgrade = () => localStorage.getItem(FAMILIAR_ROUTE_STORAGE_KEY) === 'true';

export const unlockFamiliarRouteUpgrade = () => {
    localStorage.setItem(FAMILIAR_ROUTE_STORAGE_KEY, 'true');
};

export const getPlayerJumpCount = () => (hasTripleJumpUpgrade() ? 3 : BASE_JUMPS);

export const getStartingScoreBonus = () => (hasFamiliarRouteUpgrade() ? FAMILIAR_ROUTE_SCORE_BONUS : 0);

if (typeof window !== 'undefined' && import.meta.env.DEV) {
    const win = window as Window & { __hiroDebug?: Record<string, unknown> };
    win.__hiroDebug = {
        ...win.__hiroDebug,
        setStars: (n: number) => setStoredStars(n),
        getStars: () => getStoredStars(),
        unlockAll: () => {
            unlockTripleJumpUpgrade();
            unlockEmmaCharmUpgrade();
            unlockFamiliarRouteUpgrade();
            setStoredStars(9999);
        },
        resetAll: () => {
            localStorage.removeItem(STARS_STORAGE_KEY);
            localStorage.removeItem(TRIPLE_JUMP_STORAGE_KEY);
            localStorage.removeItem(EMMA_CHARM_STORAGE_KEY);
            localStorage.removeItem(FAMILIAR_ROUTE_STORAGE_KEY);
            localStorage.removeItem('bestScore');
            localStorage.removeItem('sound');
        },
    };
}

export default {
    groundSpaceRange: [100, 200],
    groundSizeRange: [50, 801],
    playerGravity: 900,
    jumpForce: 450,
    jumps: BASE_JUMPS,
    gameWidth: 1280,
    gameHeight: 720,
    gameSpeed: 450,
    bestScore: Number(localStorage.getItem('bestScore') || '0'),
    sound: (localStorage.getItem('sound') ?? 'true') === 'true'
};
