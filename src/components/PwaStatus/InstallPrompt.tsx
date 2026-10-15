import React, { useEffect, useState } from "react";
import * as Styled from "./index.styled";
import Labels from "../../locales/en.json";

const DISMISS_KEY = "pwa_install_dismissed";

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;

const isIos = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent);

// Chrome/Edge/Android already show their own native install affordance
// (address-bar icon, app banner) once the page meets installability
// criteria — we deliberately do NOT listen for/preventDefault()
// beforeinstallprompt, so that default browser UI is what the user sees.
// The only case with no native prompt at all is iOS Safari, which needs a
// manual "Add to Home Screen" hint instead.
const InstallPrompt = () => {
  const [showIosHint, setShowIosHint] = useState(false);
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem(DISMISS_KEY) === "true");

  useEffect(() => {
    if (isStandalone() || dismissed) return;
    if (isIos()) setShowIosHint(true);
  }, [dismissed]);

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "true");
    setDismissed(true);
  };

  const isOpen = !dismissed && showIosHint;
  if (!isOpen) return null;

  return (
    <Styled.InstallBar $isOpen={isOpen}>
      <Styled.InstallText>
        <Styled.InstallTitle>{Labels.pwa.installTitle}</Styled.InstallTitle>
        <Styled.InstallBody>{Labels.pwa.installIosHint}</Styled.InstallBody>
      </Styled.InstallText>
      <Styled.InstallActions>
        <Styled.InstallDismiss onClick={dismiss}>{Labels.pwa.installDismiss}</Styled.InstallDismiss>
      </Styled.InstallActions>
    </Styled.InstallBar>
  );
};

export default InstallPrompt;
