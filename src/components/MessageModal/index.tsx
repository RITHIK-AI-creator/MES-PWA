import React from "react";
import * as Styled from "./index.styled";
import Labels from "../../locales/en.json"
interface MessageModalProps {
  $isOpen?: boolean;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  showCancel?: boolean;
  cta_success_lable?:string;
}

const MessageModal = ({
  $isOpen,
  message,
  onClose,
  onConfirm,
  showCancel = true,
  cta_success_lable,
}: MessageModalProps) => {

  return (
<Styled.ModalOverlay $isOpen={$isOpen} onClick={onClose}>
      <Styled.ModalCard onClick={(e) => e.stopPropagation()}>
        <Styled.ModalText>{message}</Styled.ModalText>

        <Styled.ModalActions>
          {onConfirm && (
            <Styled.ModalButton type="button" $variant="yes" onClick={onConfirm}>
              {cta_success_lable || Labels.common.yes}
            </Styled.ModalButton>
          )}

          {showCancel && (
            <Styled.ModalButton type="button" $variant="no" onClick={onClose}>
              {Labels.common.no}
            </Styled.ModalButton>
          )}
        </Styled.ModalActions>
      </Styled.ModalCard>
    </Styled.ModalOverlay>
  );
};

export default MessageModal;