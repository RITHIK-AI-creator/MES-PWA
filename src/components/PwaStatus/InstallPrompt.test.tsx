import React from "react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import InstallPrompt from "./InstallPrompt";
import Labels from "../../locales/en.json";

const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

const setUserAgent = (ua: string) => {
  Object.defineProperty(window.navigator, "userAgent", { value: ua, configurable: true });
};

describe("InstallPrompt", () => {
  beforeEach(() => {
    sessionStorage.clear();
    mockMatchMedia(false);
    setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120");
  });

  test("renders nothing on Chrome/Edge — the browser's own native install UI handles it", () => {
    render(<InstallPrompt />);
    expect(screen.queryByText(Labels.pwa.installTitle)).not.toBeInTheDocument();
  });

  test("does not intercept beforeinstallprompt — never calls preventDefault, leaves the native prompt alone", () => {
    render(<InstallPrompt />);

    const preventDefault = jest.fn();
    const event = new Event("beforeinstallprompt") as unknown as BeforeInstallPromptEvent;
    Object.assign(event, { preventDefault, prompt: jest.fn(), userChoice: Promise.resolve({ outcome: "accepted", platform: "web" }) });

    act(() => {
      window.dispatchEvent(event);
    });

    expect(preventDefault).not.toHaveBeenCalled();
    expect(screen.queryByText(Labels.pwa.installTitle)).not.toBeInTheDocument();
  });

  test("shows the iOS manual-install hint on iOS Safari, since it has no native install prompt at all", () => {
    setUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15");
    render(<InstallPrompt />);

    expect(screen.getByText(Labels.pwa.installIosHint)).toBeInTheDocument();
  });

  test("dismissing the iOS hint hides it and persists for the session", () => {
    setUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15");
    render(<InstallPrompt />);
    expect(screen.getByText(Labels.pwa.installIosHint)).toBeInTheDocument();

    userEvent.click(screen.getByText(Labels.pwa.installDismiss));

    expect(screen.queryByText(Labels.pwa.installIosHint)).not.toBeInTheDocument();
    expect(sessionStorage.getItem("pwa_install_dismissed")).toBe("true");
  });

  test("never shows when already running standalone", () => {
    setUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15");
    mockMatchMedia(true);
    render(<InstallPrompt />);
    expect(screen.queryByText(Labels.pwa.installIosHint)).not.toBeInTheDocument();
  });
});
