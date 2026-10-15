import React, { useEffect, useState } from "react";
import * as Styled from "./index.styled";
import Labels from "../../locales/en.json";

const DISMISS_KEY = "pwa_install_dismissed";

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;

const isIos = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent);

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem(DISMISS_KEY) === "true");

  useEffect(() => {
    if (isStandalone() || dismissed) return;

    const handleBeforeInstallPrompt = (event: BeforeInstallPromptEvent) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setDismissed(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // iOS Safari never fires beforeinstallprompt — show a manual hint instead.
    if (isIos()) setShowIosHint(true);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [dismissed]);

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "true");
    setDismissed(true);
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  const isOpen = !dismissed && (Boolean(deferredPrompt) || showIosHint);
  if (!isOpen) return null;

  return (
    <Styled.InstallBar $isOpen={isOpen}>
      <Styled.InstallText>
        <Styled.InstallTitle>{Labels.pwa.installTitle}</Styled.InstallTitle>
        <Styled.InstallBody>
          {deferredPrompt ? Labels.pwa.installBody : Labels.pwa.installIosHint}
        </Styled.InstallBody>
      </Styled.InstallText>
      <Styled.InstallActions>
        {deferredPrompt && (
          <Styled.InstallButton onClick={handleInstall}>{Labels.pwa.installAction}</Styled.InstallButton>
        )}
        <Styled.InstallDismiss onClick={dismiss}>{Labels.pwa.installDismiss}</Styled.InstallDismiss>
      </Styled.InstallActions>
    </Styled.InstallBar>
  );
};

export default InstallPrompt;
