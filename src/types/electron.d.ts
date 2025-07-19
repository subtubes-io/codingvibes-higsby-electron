// Type definitions for Electron API exposed through preload script

declare global {
    interface Window {
        electronAPI: {
            openWindow: (url: string) => Promise<void>;
            getServerStatus: () => Promise<any>;
            restartServer: () => Promise<any>;
            clipboard: {
                writeText: (text: string) => Promise<void>;
                readText: () => string;
            };
            onMainMessage: (callback: (message: string) => void) => void;
        };
    }
}

export { };
