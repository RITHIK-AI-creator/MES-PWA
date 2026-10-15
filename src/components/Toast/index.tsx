import React, { useEffect } from "react";
import * as Styled from "./index.styled";

interface ToastProps {
  variant: "success" | "error";
  message: string;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ variant, message, onClose }) => {
  useEffect(() => {
    if (variant === "success") {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [variant, onClose]);

  return (
    <Styled.ToastWrapper $variant={variant}>
      <Styled.ToastContent>
        <Styled.ToastTitle $variant={variant}>
          {variant === "success" ? "Success" : "Error"}
        </Styled.ToastTitle>
        <Styled.ToastMessage $variant={variant}>{message}</Styled.ToastMessage>
      </Styled.ToastContent>
      <Styled.ToastClose onClick={onClose}>✕</Styled.ToastClose>
    </Styled.ToastWrapper>
  );
};

export default Toast;
