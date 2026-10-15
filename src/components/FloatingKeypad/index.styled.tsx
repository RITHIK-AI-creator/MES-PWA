import styled, { createGlobalStyle, css, keyframes } from "styled-components";

/* ── Animations ─────────────────────────────────────────── */
const slideUp = keyframes`
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
`;

const popupIn = keyframes`
  0%   { transform: translateX(-50%) scaleY(0.5); opacity: 0; }
  60%  { transform: translateX(-50%) scaleY(1.05); opacity: 1; }
  100% { transform: translateX(-50%) scaleY(1); opacity: 1; }
`;

const ripple = keyframes`
  0%   { transform: scale(0.8); opacity: 0.7; }
  100% { transform: scale(1.6); opacity: 0; }
`;

/* ── Global key-popup style ─────────────────────────────── */
export const GlobalKeyStyle = createGlobalStyle`
  .key-popup {
    animation: ${popupIn} 0.12s ease-out forwards;
  }
`;

/* ── Floating Button ───────────────────────────────────── */


export const BtnIcon = styled.div<{ $isOpen: boolean }>`
  color: #fff;
  font-size: 1.3rem;
  transition: transform 0.3s ease;
  transform: ${({ $isOpen }) => ($isOpen ? "rotate(-15deg) scale(1.1)" : "none")};
  position: relative;
`;



/* ── Keyboard Overlay ──────────────────────────────────── */
export const KbOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9990;
`;

/* ── Keyboard Panel ────────────────────────────────────── */
export const KbPanel = styled.div<{ $dark: boolean }>`
  position: fixed;
  bottom: 0; left: 0; right: 0;
  z-index: 9995;
  padding: 0 0 env(safe-area-inset-bottom, 8px);
  background: ${({ $dark }) => ($dark ? "#1c1c1e" : "#d1d5db")};
  box-shadow: 0 -2px 16px rgba(0,0,0,0.2);
  animation: ${slideUp} 0.22s cubic-bezier(0.25, 0.8, 0.25, 1);
  user-select: none;
  -webkit-user-select: none;
`;

/* ── Input / Suggestion Bar ─────────────────────────────── */
export const InputBar = styled.div<{ $dark: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  background: ${({ $dark }) => ($dark ? "#2c2c2e" : "#e5e7eb")};
  border-bottom: 1px solid ${({ $dark }) => ($dark ? "#3a3a3c" : "#b5b5b5")};
`;

export const InputText = styled.div<{ $dark: boolean }>`
  flex: 1;
  font-size: 1.05rem;
  font-weight: 400;
  color: ${({ $dark }) => ($dark ? "#f2f2f7" : "#111827")};
  min-height: 26px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: "Google Sans", "Roboto", sans-serif;
  letter-spacing: 0.2px;
  cursor: text;

  span.placeholder {
    opacity: 0.4;
    font-style: italic;
  }
`;

export const InputActions = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
`;

export const ActionBtn = styled.button<{ $variant?: "clear" | "done" | "theme" }>`
  border: none;
  cursor: pointer;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 5px 10px;
  height: 32px;
  transition: all 0.15s;

  ${({ $variant }) =>
    $variant === "done"
      ? css`
          background: #1a73e8;
          color: #fff;
          box-shadow: 0 2px 6px rgba(26,115,232,0.4);
          &:hover { background: #1558b0; }
        `
      : $variant === "clear"
      ? css`
          background: transparent;
          color: #6b7280;
          &:hover { color: #ef4444; }
        `
      : css`
          background: transparent;
          color: #9ca3af;
          &:hover { color: #374151; }
        `}
`;

/* ── Suggestion Chips ────────────────────────────────────── */
export const SuggestionRow = styled.div<{ $dark: boolean }>`
  display: flex;
  gap: 1px;
  background: ${({ $dark }) => ($dark ? "#1c1c1e" : "#d1d5db")};
  padding: 4px 8px;
  overflow-x: auto;
  &::-webkit-scrollbar { display: none; }
`;

/* ── Key Rows ──────────────────────────────────────────── */
export const KeyRows = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 6px 5px 5px;
`;

export const KeyRow = styled.div<{ $justify?: string }>`
  display: flex;
  justify-content: ${({ $justify }) => $justify || "center"};
  gap: 5px;
  align-items: stretch;
`;

/* ── Individual Key ─────────────────────────────────────── */
export const Key = styled.button<{
  $dark: boolean;
  $flex?: number;
  $isAction?: boolean;
  $isShift?: boolean;
  $isShiftActive?: boolean;
  $isCapsLock?: boolean;
  $isBackspace?: boolean;
  $isEnter?: boolean;
  $isSpace?: boolean;
  $minW?: string;
}>`
  position: relative;
  flex: ${({ $flex }) => $flex ?? 1};
  ${({ $minW }) => $minW && `min-width: ${$minW};`}
  height: 44px;
  border: none;
  cursor: pointer;
  border-radius: 7px;
  font-size: ${({ $isAction, $isSpace }) => ($isAction && !$isSpace ? "12px" : "17px")};
  font-weight: ${({ $isAction, $isSpace }) => ($isAction && !$isSpace ? "600" : "400")};
  font-family: "Google Sans", "Roboto", sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 0 4px;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  outline: none;
  transition: filter 0.08s;

  /* Colors */
  background: ${({ $dark, $isAction, $isShift, $isCapsLock, $isShiftActive, $isSpace }) =>
    $isCapsLock
      ? "#1a73e8"
      : $isShiftActive
      ? ($dark ? "#5e5e60" : "#b0b0b8")
      : $isAction && !$isSpace
      ? ($dark ? "#3a3a3c" : "#adb5bd")
      : $dark
      ? "#2c2c2e"
      : "#ffffff"};

  color: ${({ $dark, $isCapsLock, $isShiftActive }) =>
    $isCapsLock || $isShiftActive ? "#fff" : $dark ? "#f2f2f7" : "#111827"};

  box-shadow: ${({ $dark }) =>
    $dark
      ? "0 1px 0 #000"
      : "0 1px 0 #8a8a8a, 0 1px 3px rgba(0,0,0,0.15)"};

  &:active {
    filter: brightness(0.86);
    transform: scale(0.95);
  }

  i { font-size: 15px; }
`;

/* ── Key Popup Preview ──────────────────────────────────── */
export const KeyPopup = styled.div<{ $dark: boolean }>`
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: ${({ $dark }) => ($dark ? "#3a3a3c" : "#fff")};
  color: ${({ $dark }) => ($dark ? "#f2f2f7" : "#111827")};
  min-width: 40px;
  min-height: 48px;
  border-radius: 10px 10px 10px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 400;
  font-family: "Google Sans", "Roboto", sans-serif;
  box-shadow: 0 4px 16px rgba(0,0,0,0.25);
  z-index: 100;
  pointer-events: none;
  white-space: nowrap;
  padding: 0 8px;
  animation: ${popupIn} 0.1s ease-out;

  &::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 0;
    width: 10px;
    height: 10px;
    background: ${({ $dark }) => ($dark ? "#3a3a3c" : "#fff")};
    clip-path: polygon(0 0, 100% 0, 0 100%);
  }
`;

/* ── Theme Toggle ─────────────────────────────────────────── */
export const ThemeToggle = styled.button<{ $dark: boolean }>`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: ${({ $dark }) => ($dark ? "#9ca3af" : "#6b7280")};
  padding: 4px 6px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  &:hover { background: rgba(0,0,0,0.08); }
`;

export const FloatingBtn = styled.div<{ $x: number; $y: number; $isDragging: boolean }>`
  position: fixed;
  left: ${({ $x }) => $x}px;
  top: ${({ $y }) => $y}px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(15, 76, 156, 0.9);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(15, 76, 156, 0.5), 0 0 0 3px rgba(255,255,255,0.15);
  cursor: ${({ $isDragging }) => ($isDragging ? "grabbing" : "grab")};
  z-index: 9999;
  touch-action: none;
  opacity: ${({ $isDragging }) => ($isDragging ? 1 : 0.3)};
  /* Smooth snap + fade transition; disabled while actively dragging */
  transition: ${({ $isDragging }) =>
    $isDragging
      ? "none"
      : "left 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease, box-shadow 0.2s ease"};

  &:hover {
    opacity: 1;
    box-shadow: 0 6px 28px rgba(15, 76, 156, 0.7), 0 0 0 4px rgba(255,255,255,0.25);
  }
`;

export const BtnInner = styled.div<{ $isOpen: boolean }>`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;

  i {
    font-size: 1.2rem;
    color: #fff;
    z-index: 1;
    transition: transform 0.3s ease;
    transform: ${({ $isOpen }) => ($isOpen ? "scale(1.2) rotate(15deg)" : "scale(1) rotate(0deg)")};
  }
`;

export const RippleRing = styled.span<{ $isOpen: boolean }>`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.4);
  animation: ${({ $isOpen }) => ($isOpen ? "pulse-ring 1.5s ease infinite" : "none")};

  @keyframes pulse-ring {
    0% { transform: scale(0.9); opacity: 1; }
    100% { transform: scale(1.5); opacity: 0; }
  }
`;