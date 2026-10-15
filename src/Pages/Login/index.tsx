import React, { useEffect, useState } from "react";
import * as Styled from "./index.styled";
import { FaEye, FaEyeSlash } from "react-icons/fa";

// ─── OAuth2 / Auth Portal Constants ────────────────────────────────────────────
const getConfig = (key: string, fallback: string) => {
  return (typeof window !== "undefined" && (window as any).APP_CONFIG?.[key]) || fallback;
};

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername]         = useState("");
  const [password, setPassword]         = useState("");
  const [error, setError]               = useState("");
  const [isLoading, setIsLoading]       = useState(false);

  // Pre-fill fields if the browser autofilled them
  useEffect(() => {
    const timer = setTimeout(() => {
      const u = document.getElementById("login-userid") as HTMLInputElement | null;
      const p = document.getElementById("login-password") as HTMLInputElement | null;
      if (u?.value) setUsername(u.value);
      if (p?.value) setPassword(p.value);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleLogin();
  };

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      // Execute the automated background flow
      const { authService } = await import('../../services/authService');
      const authResult = await authService.login(username, password);

      // Set flags and redirect to app
      localStorage.setItem("isLoggedIn", "true");
      
      const configuredHours = parseInt(getConfig("SESSION_EXPIRY_HOURS", process.env.REACT_APP_SESSION_EXPIRY_HOURS || "9"), 10);
      const expiryTime = Date.now() + configuredHours * 60 * 60 * 1000;
      
      localStorage.setItem("expiryTime", expiryTime.toString());
      localStorage.setItem("userId", username);
      
      if (authResult.fullName) {
        localStorage.setItem("fullName", authResult.fullName);
      } else {
        localStorage.removeItem("fullName");
      }

      // Force a full page reload to the dashboard so the context picks up the new cookies
      window.location.href = "/";
    } catch (err: any) {
      console.error("Login failed:", err);
      setError("Invalid username or password");
      setIsLoading(false);
    }
  };

  return (
    <Styled.PageWrapper>
      <Styled.BlurOverlay>
        <Styled.LoginContainer>
          <Styled.Card>
            <Styled.CardBody>

              {/* App Logo */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                <img src={process.env.PUBLIC_URL + '/images/Athenatec-Logo.png'} alt="App Logo" style={{ maxWidth: '100%', height: 'auto', maxHeight: '60px' }} />
              </div>

              {/* Username */}
              <Styled.InputBox>
                <Styled.Label>Username</Styled.Label>
                <Styled.Input
                  type="text"
                  id="login-userid"
                  value={username}
                  // placeholder="Username"
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  onKeyDown={handleKeyDown}
                />
              </Styled.InputBox>

              {/* Password */}
              <Styled.InputBox>
                <Styled.Label>Password</Styled.Label>
                <Styled.Input
                  type={showPassword ? "text" : "password"}
                  id="login-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  onKeyDown={handleKeyDown}
                />
                <Styled.EyeIcon onClick={() => setShowPassword((p) => !p)}>
                  {!showPassword ? <FaEyeSlash /> : <FaEye />}
                </Styled.EyeIcon>
              </Styled.InputBox>

              {/* Error */}
              {error && <Styled.ErrorMsg>{error}</Styled.ErrorMsg>}

              {/* Login Button */}
              <Styled.LoginButton
                onClick={handleLogin}
                disabled={!username || !password || isLoading}
              >
                {isLoading ? "Authenticating..." : "Login"}
              </Styled.LoginButton>

              {/* Powered by */}
              <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: '#666' }}>
                Powered by Athenatec
              </div>

            </Styled.CardBody>
          </Styled.Card>
        </Styled.LoginContainer>
      </Styled.BlurOverlay>
    </Styled.PageWrapper>
  );
};

export default Login;
