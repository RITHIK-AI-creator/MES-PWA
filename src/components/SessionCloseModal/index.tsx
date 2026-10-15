import React from "react";
import * as Styled from "./index.styled";
import Labels from "../../locales/en.json";
interface SeesionCloseModalProps {
  $isOpen?: boolean;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  showCancel?: boolean;
  cta_success_lable?: string;
}

const SeesionCloseModal = ({
  $isOpen,
  onClose,
  message,
}: SeesionCloseModalProps) => {
  return (
    <Styled.ModalOverlay $isOpen={$isOpen} onClick={onClose}>
      <Styled.ModalCard onClick={(e) => e.stopPropagation()}>
        <Styled.ModalText>{message}</Styled.ModalText>

        <Styled.ModalActions>
          <Styled.ModalButton type="button" $variant="yes" onClick={onClose}>
            Okay
          </Styled.ModalButton>
        </Styled.ModalActions>
      </Styled.ModalCard>
    </Styled.ModalOverlay>
  );
};

export default SeesionCloseModal;
