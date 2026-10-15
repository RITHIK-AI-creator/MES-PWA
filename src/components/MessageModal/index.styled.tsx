import styled from "styled-components";

/* Overlay */
export const ModalOverlay = styled.div<{ $isOpen?: boolean }>`
  display: ${({ $isOpen }) => ($isOpen ? "flex" : "none")};
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  z-index: 9999;

  justify-content: center;
  align-items: center;

  backdrop-filter: blur(2px);
`;

/* Card */
export const ModalCard = styled.div`
  background: var(--mes-card-bg);
  padding: 24px 20px;
  border-radius: var(--radius-md);
  width: 280px;
  max-width: calc(100% - 40px);
  text-align: center;

  border: 1px solid var(--mes-border);
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.15);
`;

/* Text */
export const ModalText = styled.p`
  margin: 0 0 20px 0;
  color: var(--mes-text);
  font-weight: 600;
  font-size: 0.95rem;
`;

/* Actions */
export const ModalActions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
`;

/* Button */
export const ModalButton = styled.button<{ $variant?: "yes" | "no" }>`
  min-width: 90px;
  padding: 8px 18px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: 700;
  font-size: 0.9rem;
  transition: background 0.15s ease, color 0.15s ease, transform 0.12s ease;

  background: ${({ $variant }) =>
    $variant === "yes" ? "var(--mes-primary)" : "rgba(0, 0, 0, 0.05)"};
  color: ${({ $variant }) => ($variant === "yes" ? "white" : "var(--mes-text)")};
  border: ${({ $variant }) => ($variant === "no" ? "1px solid rgba(0, 0, 0, 0.15)" : "none")};
  box-shadow: ${({ $variant }) =>
    $variant === "no" ? "0 0 0 1px rgba(0, 0, 0, 0.05) inset" : "none"};

  &:hover {
    transform: translateY(-1px);
    background: ${({ $variant }) =>
      $variant === "yes" ? "var(--mes-primary-600)" : "rgba(0, 0, 0, 0.1)"};
  }
`;
