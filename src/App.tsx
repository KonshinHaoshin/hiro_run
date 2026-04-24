import { useEffect, useMemo, useRef, useState } from "react";
import { IRefPhaserGame, PhaserGame } from "./game/PhaserGame";
import {
    isLandscapeViewport,
    isMobileRuntime,
    requestMobileImmersiveMode,
} from "./utils/runtime";
import { initShelterBridge } from "./utils/shelterBridge";

function App() {
    const phaserRef = useRef<IRefPhaserGame | null>(null);
    const [isLandscape, setIsLandscape] = useState(() => isLandscapeViewport());
    const isMobile = useMemo(() => isMobileRuntime(), []);

    useEffect(() => {
        const cleanupBridge = initShelterBridge();

        return () => {
            cleanupBridge();
        };
    }, []);

    useEffect(() => {
        if (!isMobile) {
            return;
        }

        const mediaQuery = window.matchMedia("(orientation: landscape)");
        const syncViewport = () => {
            setIsLandscape(mediaQuery.matches);
        };
        const enterImmersiveMode = () => {
            void requestMobileImmersiveMode();
        };

        syncViewport();
        enterImmersiveMode();

        mediaQuery.addEventListener("change", syncViewport);
        window.addEventListener("pointerdown", enterImmersiveMode, { passive: true });
        window.addEventListener("touchend", enterImmersiveMode, { passive: true });

        return () => {
            mediaQuery.removeEventListener("change", syncViewport);
            window.removeEventListener("pointerdown", enterImmersiveMode);
            window.removeEventListener("touchend", enterImmersiveMode);
        };
    }, [isMobile]);

    return (
        <div
            id="app"
            className={[
                isMobile ? "is-mobile" : "",
                isMobile && !isLandscape ? "is-portrait" : "",
            ].filter(Boolean).join(" ")}
        >
            <PhaserGame ref={phaserRef} />
            {isMobile && !isLandscape && (
                <div className="mobile-rotate-hint">
                    <div className="mobile-rotate-card">
                        <div className="mobile-rotate-title">Rotate Device</div>
                        <div className="mobile-rotate-copy">
                            Fullscreen and landscape were requested for mobile. If you are still in portrait, rotate the device to continue.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
