import React from "react";
import * as Styled from "./index.styled";
import { FaRegPlayCircle, FaUndo } from "react-icons/fa";
import { IconType } from "react-icons";

interface ButtonProps {
  type: "submit" | "reset" | "normal";
  onClick: () => void;
  label?: string;
  Icon?: IconType;
  disabled?: boolean;
}
const Button = (props: ButtonProps) => {
  const { type, onClick, label, Icon, disabled } = props;
  return (
    <>
      {type === "reset" ? (
        <Styled.IconButton $iconOnly onClick={onClick} disabled={disabled}>
          <FaUndo />
        </Styled.IconButton>
      ) : type === "submit" ? (
        <Styled.IconButton $primary onClick={onClick} disabled={disabled}>
          <FaRegPlayCircle />
          {"Submit"}
        </Styled.IconButton>
      ) : (
        <Styled.IconButton $primary onClick={onClick} disabled={disabled}>
          {Icon && <Icon />}
          {label && label}
        </Styled.IconButton>
      )}
    </>
  );
};

export default Button;
