const MOBILE_USER_AGENT =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i;

type NavigatorWithUAData = Navigator & {
    userAgentData?: {
        mobile?: boolean;
    };
};

type FullscreenElement = HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void> | void;
};

export const isMobileRuntime = () => {
    if (typeof window === "undefined" || typeof navigator === "undefined") {
        return false;
    }

    const nav = navigator as NavigatorWithUAData;

    return Boolean(nav.userAgentData?.mobile) ||
        MOBILE_USER_AGENT.test(navigator.userAgent) ||
        (window.matchMedia("(any-pointer: coarse)").matches && window.innerWidth <= 1024);
};

export const isLandscapeViewport = () => {
    if (typeof window === "undefined") {
        return true;
    }

    return window.matchMedia("(orientation: landscape)").matches;
};

export const requestLandscapeOrientation = async () => {
    if (typeof screen === "undefined" || !isMobileRuntime()) {
        return false;
    }

    const orientation = screen.orientation;

    if (!orientation || typeof orientation.lock !== "function") {
        return false;
    }

    try {
        await orientation.lock("landscape");
        return true;
    } catch {
        return false;
    }
};

export const requestMobileFullscreen = async () => {
    if (typeof document === "undefined" || !isMobileRuntime() || document.fullscreenElement) {
        return false;
    }

    const fullscreenTarget = document.getElementById("app") || document.documentElement;
    const requestFullscreen = fullscreenTarget.requestFullscreen ||
        (fullscreenTarget as FullscreenElement).webkitRequestFullscreen;

    if (!requestFullscreen) {
        return false;
    }

    try {
        await requestFullscreen.call(fullscreenTarget, { navigationUI: "hide" });
        return true;
    } catch {
        return false;
    }
};

export const requestMobileImmersiveMode = async () => {
    if (!isMobileRuntime()) {
        return false;
    }

    const [fullscreenResult, orientationResult] = await Promise.all([
        requestMobileFullscreen(),
        requestLandscapeOrientation(),
    ]);

    return fullscreenResult || orientationResult;
};
