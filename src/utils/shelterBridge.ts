const GAME_ID = 'hiro-run';
const STARS_STORAGE_KEY = 'stars';
const TRUSTED_PARENT_ORIGINS = String(import.meta.env.VITE_SHELTER_PARENT_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

declare global {
    interface Window {
        __hiroRunBridgeInitialized?: boolean;
    }
}

const getStoredStarsTotal = () => {
    const totalStars = Number(window.localStorage.getItem(STARS_STORAGE_KEY) || '0');
    return Number.isFinite(totalStars) ? Math.max(0, totalStars) : 0;
};

const buildTrustedOriginChecker = (trustedOrigins: string[]) => (origin: string) => {
    if (origin === window.location.origin) {
        return true;
    }

    return trustedOrigins.length === 0 || trustedOrigins.includes(origin);
};

let resolvedParentOrigin = TRUSTED_PARENT_ORIGINS[0] || '';

const getParentTargetOrigin = () => resolvedParentOrigin || window.location.origin;

const postToParent = (payload: Record<string, unknown>) => {
    window.parent.postMessage(payload, getParentTargetOrigin());
};

export const submitRunResult = (score: number, duration = score) => {
    if (typeof window === 'undefined') {
        return;
    }

    const numericScore = Number(score || 0);
    const numericDuration = Number(duration || 0);
    if (!Number.isFinite(numericScore) || numericScore <= 0) {
        return;
    }

    const totalStars = getStoredStarsTotal();
    postToParent({
        type: 'SUBMIT_SCORE',
        gameId: GAME_ID,
        score: numericScore,
        duration: Number.isFinite(numericDuration) && numericDuration > 0 ? numericDuration : numericScore,
        totalStars,
        total_stars: totalStars,
        gameData: {
            best_score: numericScore,
            total_stars: totalStars,
            source: 'hiro-run-game-over',
        },
    });
};

export const initShelterBridge = () => {
    if (typeof window === 'undefined' || window.__hiroRunBridgeInitialized) {
        return () => undefined;
    }

    window.__hiroRunBridgeInitialized = true;
    const isTrustedMessageOrigin = buildTrustedOriginChecker(TRUSTED_PARENT_ORIGINS);

    const syncStarsTotal = () => {
        const totalStars = getStoredStarsTotal();
        postToParent({
            type: 'SYNC_STARS_TOTAL',
            gameId: GAME_ID,
            totalStars,
            total_stars: totalStars,
            gameData: {
                total_stars: totalStars,
                source: 'hiro-run-local-storage',
            },
        });
    };

    const handleMessage = (event: MessageEvent) => {
        if (!isTrustedMessageOrigin(event.origin) || !event.data) {
            return;
        }

        if (event.origin !== window.location.origin) {
            resolvedParentOrigin = event.origin;
        }

        if (event.data.type === 'AUTH_TOKEN' && event.data.token) {
            localStorage.setItem('token', String(event.data.token));
            return;
        }

        if (event.data.type === 'REQUEST_STARS_TOTAL') {
            syncStarsTotal();
        }
    };

    const originalSetItem = window.localStorage.setItem.bind(window.localStorage);

    window.addEventListener('message', handleMessage);
    window.setTimeout(syncStarsTotal, 0);

    window.localStorage.setItem = (key: string, value: string) => {
        originalSetItem(key, value);

        if (key === STARS_STORAGE_KEY) {
            syncStarsTotal();
        }
    };

    return () => {
        window.removeEventListener('message', handleMessage);
        window.localStorage.setItem = originalSetItem;
        window.__hiroRunBridgeInitialized = false;
    };
};
