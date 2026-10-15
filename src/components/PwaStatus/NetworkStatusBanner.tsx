import React, { useEffect, useState } from "react";
import * as Styled from "./index.styled";
import Labels from "../../locales/en.json";

const RECONNECTED_DISPLAY_MS = 3000;

const NetworkStatusBanner = () => {
  const [isOnline, setIsOnline] = useState(window.navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    let reconnectedTimer: ReturnType<typeof setTimeout>;

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      reconnectedTimer = setTimeout(() => setShowReconnected(false), RECONNECTED_DISPLAY_MS);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      clearTimeout(reconnectedTimer);
    };
  }, []);

  if (!isOnline) {
    return <Styled.NetworkBanner $variant="offline">{Labels.pwa.offlineBanner}</Styled.NetworkBanner>;
  }
  if (showReconnected) {
    return <Styled.NetworkBanner $variant="online">{Labels.pwa.backOnlineBanner}</Styled.NetworkBanner>;
  }
  return null;
};

export default NetworkStatusBanner;
