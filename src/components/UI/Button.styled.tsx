import styled from "styled-components";

export const Button = styled.button<{
  $variant?: "primary" | "ghost" | "danger";
}>
`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  font-size: var(--fs-base);
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  cursor: pointer;
  font-weight: 600;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;

  background: ${({ $variant }) =>
    $variant === "primary" ? "var(--mes-primary)" : "transparent"};
  color: ${({ $variant }) => ($variant === "primary" ? "white" : "var(--mes-text)")};
  border-color: ${({ $variant }) => ($variant === "ghost" ? "var(--mes-border)" : "transparent")};

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--card-shadow);
  }
`;

export default Button;
