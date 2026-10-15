export {};

declare module "@fortawesome/fontawesome-free/css/all.min.css";

declare global {
  interface Window {
    UIVirtualPage: Record<string, string[]>;
  }

  // Not yet part of lib.dom.d.ts — needed for the PWA install prompt.
  interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
    prompt(): Promise<void>;
  }

  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }

  interface Navigator {
    standalone?: boolean;
  }
}