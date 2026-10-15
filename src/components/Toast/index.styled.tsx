import styled, { keyframes } from "styled-components";

const slideIn = keyframes`
  from { opacity: 0; transform: translate(-50%, 20px); }
  to   { opacity: 1; transform: translate(-50%, 0); }
`;

export const ToastWrapper = styled.div<{ $variant: "success" | "error" }>`
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 6px;
  border-left: 4px solid
    ${({ $variant }) => ($variant === "success" ? "#1976d2" : "#d32f2f")};
  background: ${({ $variant }) =>
    $variant === "success" ? "#e3f2fd" : "#ffebee"};
  animation: ${slideIn} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  z-index: 9999;
  min-width: 250px;
  max-width: 350px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
`;

export const ToastContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

export const ToastTitle = styled.span<{ $variant: "success" | "error" }>`
  font-size: 0.9rem;
  font-weight: 700;
  color: ${({ $variant }) =>
    $variant === "success" ? "#1565c0" : "#c62828"};
`;

export const ToastMessage = styled.span<{ $variant: "success" | "error" }>`
  font-size: 0.82rem;
  font-weight: 500;
  color: ${({ $variant }) =>
    $variant === "success" ? "#1565c0" : "#c62828"};
  word-break: break-word;
  white-space: pre-wrap;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const ToastClose = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  color: #666;
  padding: 0;
  line-height: 1;
  flex-shrink: 0;

  &:hover {
    color: #333;
  }
`;
