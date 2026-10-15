import React, { createContext, useContext, useEffect, useState } from "react";
import { POST, GET } from "../Helpers/apiClient";
import SeesionCloseModal from "../components/SessionCloseModal";
import { AUTH_LOGOUT } from "../api";

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  userId: string;
  setUserId: React.Dispatch<React.SetStateAction<string>>;
  sessionId: string;
  setSessionId: React.Dispatch<React.SetStateAction<string>>;
  operatorId: string;
  setOperatorId: React.Dispatch<React.SetStateAction<string>>;
  
}

const AuthContext = createContext<AuthContextType | null>(null);

let unauthorizedHandler: (() => void) | null = null;

export const setUnauthorizedHandler = (handler: () => void) => {
  unauthorizedHandler = handler;
};

export const handleUnauthorized = () => {
  unauthorizedHandler?.();
};
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const isUserLoggedIn = () => {
    // 1. If we just returned from the OAuth flow, mark as logged in
    if (localStorage.getItem("oauth_pending") === "true") {
      localStorage.removeItem("oauth_pending");
      localStorage.setItem("isLoggedIn", "true");
      const expiryTime = Date.now() + 9 * 60 * 60 * 1000; // 9 hours
      localStorage.setItem("expiryTime", expiryTime.toString());
      return true;
    }

    // 2. Otherwise, check our persisted login state
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const expiryTime = localStorage.getItem("expiryTime");
    if (!isLoggedIn || !expiryTime) return false;
    
    return Date.now() <= Number(expiryTime);
  };

  const [showUnauthorized, setShowUnauthorized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(isUserLoggedIn());
  const [userId, setUserId] = useState(localStorage.getItem("userId") || "");
  const [sessionId, setSessionId] = useState(localStorage.getItem("sessionId") || "");
  const [operatorId, setOperatorId] = useState(localStorage.getItem("operatorId") || "");

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setShowUnauthorized(true);
    });

    return () => {
      setUnauthorizedHandler(() => {});
    };
  }, []);
  // Effect to save userId and sessionId in localStorage whenever they change
  useEffect(() => {
    if (userId) localStorage.setItem("userId", userId);
  }, [userId]);

  useEffect(() => {
    if (sessionId) localStorage.setItem("sessionId", sessionId);
  }, [sessionId]);

  const login = () => {
    setIsAuthenticated(true);
  };

  const logout = async () => {
    (window as any).isLoggingOut = true;
    try {
      // Hit the backend logout endpoint with our Bearer token so it actually invalidates the session
      await GET(AUTH_LOGOUT);
    } catch (e) {
      console.warn("Backend logout request failed or redirected, proceeding with local cleanup.");
    }

    // Explicitly delete the local access_token cookie
    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("expiryTime");
    localStorage.removeItem("userId");
    localStorage.removeItem("sessionId");
    localStorage.removeItem("operatorId");
    setIsAuthenticated(false);
    
    // Redirect back to login screen
    window.location.href = "/";
  };

  useEffect(() => {
    const expiryTime = localStorage.getItem("expiryTime");

    if (expiryTime && Date.now() > Number(expiryTime)) {
      // confirmLogout();

      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("expiryTime");
      localStorage.removeItem("userId");
      localStorage.removeItem("sessionId");

      setIsAuthenticated(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        userId,
        sessionId,
        setSessionId,
        setUserId,
        operatorId,
        setOperatorId
      }}
    >
      {children}
      <SeesionCloseModal
        $isOpen={showUnauthorized}
        message="Session has expired. Please login again."
        onClose={() => {
          setShowUnauthorized(false);
          logout();
        }}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
