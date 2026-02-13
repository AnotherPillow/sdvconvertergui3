export {};

declare global {

    interface Window {
        SendToast: (
            message?: string,
            time?: number,
            fade?: number,
            bg?: string,
            col?: string,
        ) => void
    }
}