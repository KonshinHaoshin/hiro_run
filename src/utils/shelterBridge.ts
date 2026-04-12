const GAME_ID = 'hiro-run';
const LAST_SUBMITTED_SCORE_KEY = 'hiro-run-last-submitted-score';

declare global {
    interface Window {
        __hiroRunBridgeInitialized?: boolean;
    }
}

export const initShelterBridge = () => {
    if (typeof window === 'undefined' || window.__hiroRunBridgeInitialized) {
        return () => undefined;
    }

    window.__hiroRunBridgeInitialized = true;

    const handleMessage = (event: MessageEvent) => {
        if (!event.data || event.data.type !== 'AUTH_TOKEN' || !event.data.token) {
            return;
        }

        localStorage.setItem('token', String(event.data.token));
    };

    const originalSetItem = window.localStorage.setItem.bind(window.localStorage);

    window.addEventListener('message', handleMessage);

    window.localStorage.setItem = (key: string, value: string) => {
        originalSetItem(key, value);

        if (key !== 'bestScore') {
            return;
        }

        const numericScore = Number(value || '0');
        const lastSubmittedScore = Number(sessionStorage.getItem(LAST_SUBMITTED_SCORE_KEY) || '0');

        if (!Number.isFinite(numericScore) || numericScore <= 0 || numericScore <= lastSubmittedScore) {
            return;
        }

        sessionStorage.setItem(LAST_SUBMITTED_SCORE_KEY, String(numericScore));
        window.parent.postMessage(
            {
                type: 'SUBMIT_SCORE',
                gameId: GAME_ID,
                score: numericScore,
                duration: numericScore,
                gameData: {
                    best_score: numericScore,
                    source: 'hiro-run-cloudflare-best',
                },
            },
            '*'
        );
    };

    return () => {
        window.removeEventListener('message', handleMessage);
        window.localStorage.setItem = originalSetItem;
        window.__hiroRunBridgeInitialized = false;
    };
};
