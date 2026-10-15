import styled from "styled-components";

export const TopBar = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
`;

/* CSS Variables */
export const PageWrapper = styled.div`
  height: 100vh;   
  background: var(--mes-bg-grey);
  overflow: hidden;
  position: relative;
  
  &::before {
    content: "";
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 180px;
    background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
    clip-path: polygon(0 0, 100% 0, 100% 65%, 0 100%);
    z-index: 0;
  }

  &::after {
    content: "";
    position: absolute;
    right: -80px;
    bottom: -80px;
    width: 420px;
    height: 420px;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.12), transparent 55%);
    z-index: 0;
  }
`;

/* Overlay */
export const BlurOverlay = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;

  padding: 20px;
`;

/* Container */
export const LoginContainer = styled.div`
  width: 90%;
  max-width: 1200px;
  display: flex;
  justify-content: center;
`;

/* Card */
export const Card = styled.div`
  width: 420px;
  max-width: 100%;  
  background: var(--mes-card-bg);
  border-radius: var(--radius-md);
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.15);
  position: relative;
  z-index: 1;
  border: 1px solid rgba(255, 255, 255, 0.8);
`;

export const CardBody = styled.div`
  padding: 2.5rem;
  text-align: center;
`;

export const Logo = styled.img`
  max-width: 100px;
  display: block;
  margin-left: auto;
  margin-right: auto;
`;
export const Text = styled.img`
  max-width: 200px;
  margin-bottom: 2rem;
  display: block;
  margin-left: auto;
  margin-right: auto;
`;

/* Title */
export const Title = styled.h1`
  margin-bottom: 2rem;
  color: #0f172a;
  font-size: 1.65rem;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
`;

/* Input */
export const InputBox = styled.div`
  position: relative;
  margin-bottom: 15px;
`;

export const Label = styled.label`
  color: var(--mes-muted);
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
  display: flex;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const Input = styled.input`
  width: calc(100% - 32px);
  height: 2.2rem;
  border: 1px solid var(--mes-border);
  border-radius: 10px;
  background: #ffffff;
  padding: 10px 16px;
  color: var(--mes-text);
  font-weight: 500;
  font-size: 15px;
  transition: all 0.25s ease;

  &:focus {
    outline: none;
    border-color: #6c8dff;
    box-shadow: 0 0 0 3px rgba(108, 141, 255, 0.1);
  }

  &::placeholder {
    color: var(--mes-muted);
    font-weight: 400;
  }
`;

/* Eye Icon */
export const EyeIcon = styled.span`
  position: absolute;
  right: 14px;
  top: 40px;
  cursor: pointer;
  color: var(--mes-muted);
  transition: color 0.2s ease;
  
  &:hover {
    color: var(--mes-primary);
  }
`;

/* Button */
export const LoginButton = styled.button`
  margin-top: 25px;
  width: 100%;
  padding: 0.9rem;
  background: var(--mes-primary-600);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: var(--mes-primary);
    transform: translateY(-1px);
  }

  &:disabled {
    cursor: not-allowed;
    background: #e2e8f0;
    color: #94a3b8;
    border: 1px solid #cbd5e1;
    opacity: 1;
  }
`;

/* Error */
export const ErrorMsg = styled.p`
  color: #E3242B;
  font-weight: 600;
  font-size: 0.9rem;
  margin-top: 10px;
`;