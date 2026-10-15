import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
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

  test("renders nothing until beforeinstallprompt fires", () => {
    render(<InstallPrompt />);
    expect(screen.queryByText(Labels.pwa.installTitle)).not.toBeInTheDocument();
  });

  test("shows the install banner and calls prompt() on install", async () => {
    render(<InstallPrompt />);

    const promptFn = jest.fn().mockResolvedValue(undefined);
    const event = new Event("beforeinstallprompt") as unknown as BeforeInstallPromptEvent;
    Object.assign(event, {
      preventDefault: jest.fn(),
      prompt: promptFn,
      userChoice: Promise.resolve({ outcome: "accepted", platform: "web" }),
    });

    act(() => {
      window.dispatchEvent(event);
    });

    expect(await screen.findByText(Labels.pwa.installTitle)).toBeInTheDocument();

    userEvent.click(screen.getByText(Labels.pwa.installAction));
    await waitFor(() => expect(promptFn).toHaveBeenCalled());
  });

  test("dismissing hides the banner and persists for the session", async () => {
    render(<InstallPrompt />);

    const event = new Event("beforeinstallprompt") as unknown as BeforeInstallPromptEvent;
    Object.assign(event, {
      preventDefault: jest.fn(),
      prompt: jest.fn(),
      userChoice: Promise.resolve({ outcome: "dismissed", platform: "web" }),
    });
    act(() => {
      window.dispatchEvent(event);
    });
    await screen.findByText(Labels.pwa.installTitle);

    userEvent.click(screen.getByText(Labels.pwa.installDismiss));

    expect(screen.queryByText(Labels.pwa.installTitle)).not.toBeInTheDocument();
    expect(sessionStorage.getItem("pwa_install_dismissed")).toBe("true");
  });

  test("shows the iOS manual-install hint on iOS Safari, with no install button", () => {
    setUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15");
    render(<InstallPrompt />);

    expect(screen.getByText(Labels.pwa.installIosHint)).toBeInTheDocument();
    expect(screen.queryByText(Labels.pwa.installAction)).not.toBeInTheDocument();
  });

  test("never shows when already running standalone", () => {
    mockMatchMedia(true);
    render(<InstallPrompt />);
    expect(screen.queryByText(Labels.pwa.installTitle)).not.toBeInTheDocument();
  });
});
