import React from "react";
import { act, render, screen } from "@testing-library/react";
import NetworkStatusBanner from "./NetworkStatusBanner";
import Labels from "../../locales/en.json";

const setOnline = (value: boolean) => {
  Object.defineProperty(window.navigator, "onLine", { value, configurable: true, writable: true });
};

describe("NetworkStatusBanner", () => {
  afterEach(() => {
    jest.useRealTimers();
    setOnline(true);
  });

  test("renders nothing while online", () => {
    setOnline(true);
    render(<NetworkStatusBanner />);
    expect(screen.queryByText(Labels.pwa.offlineBanner)).not.toBeInTheDocument();
  });

  test("shows the offline banner when the browser goes offline", () => {
    setOnline(true);
    render(<NetworkStatusBanner />);

    act(() => {
      window.dispatchEvent(new Event("offline"));
    });

    expect(screen.getByText(Labels.pwa.offlineBanner)).toBeInTheDocument();
  });

  test("shows a transient 'back online' banner that clears itself, then nothing", () => {
    jest.useFakeTimers();
    setOnline(true);
    render(<NetworkStatusBanner />);

    act(() => {
      window.dispatchEvent(new Event("offline"));
    });
    expect(screen.getByText(Labels.pwa.offlineBanner)).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new Event("online"));
    });
    expect(screen.getByText(Labels.pwa.backOnlineBanner)).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(screen.queryByText(Labels.pwa.backOnlineBanner)).not.toBeInTheDocument();
  });
});
