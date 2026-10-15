import styled from "styled-components";

export const IconButton = styled.button<{ $primary?: boolean; $iconOnly?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-height: 40px;
  padding: ${({ $iconOnly }) => ($iconOnly ? "0" : "0 8px")};
  width: ${({ $iconOnly }) => ($iconOnly ? "38px" : "auto")};
  border-radius: 12px;
  border: 1px solid ${({ $primary }) => ($primary ? "var(--mes-primary-600)" : "var(--mes-border)")};
  background: ${({ $primary }) => ($primary ? "var(--mes-primary-600)" : "var(--mes-bg-grey)")};
  color: ${({ $primary }) => ($primary ? "white" : "var(--mes-text)")};
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 10px 18px rgba(15, 23, 42, 0.08);

  svg {
    font-size: 16px;
  }

  &:hover {
    color: ${({ $primary }) => ($primary ? "white" : "black")};
    transform: translateY(-1px);
    background: ${({ $primary }) => ($primary ? "var(--mes-primary-600)" : "#f1f5f9")};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.18);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;