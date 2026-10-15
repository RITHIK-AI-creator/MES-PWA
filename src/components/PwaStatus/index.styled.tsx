import styled from "styled-components";

export const InstallBar = styled.div<{ $isOpen?: boolean }>`
  display: ${({ $isOpen }) => ($isOpen ? "flex" : "none")};
  position: fixed;
  left: 50%;
  bottom: 16px;
  transform: translateX(-50%);
  z-index: 9998;

  align-items: center;
  gap: 12px;
  max-width: calc(100% - 32px);

  background: var(--mes-card-bg);
  border: 1px solid var(--mes-border);
  border-radius: var(--radius-md);
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.15);
  padding: 10px 14px;
`;

export const InstallText = styled.div`
  display: flex;
  flex-direction: column;
`;

export const InstallTitle = styled.span`
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--mes-text);
`;

export const InstallBody = styled.span`
  font-size: 0.78rem;
  color: var(--mes-muted);
`;

export const InstallActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

export const InstallButton = styled.button`
  background: var(--mes-primary);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  padding: 7px 14px;
  font-weight: 700;
  font-size: 0.82rem;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: var(--mes-primary-600);
  }
`;

export const InstallDismiss = styled.button`
  background: transparent;
  border: none;
  color: var(--mes-muted);
  font-size: 0.78rem;
  cursor: pointer;
  padding: 7px 8px;
`;

export const NetworkBanner = styled.div<{ $variant: "offline" | "online" }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 9997;

  text-align: center;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 6px 12px;
  box-sizing: border-box;

  background: ${({ $variant }) => ($variant === "offline" ? "#b45309" : "var(--mes-success)")};
  color: white;
`;
