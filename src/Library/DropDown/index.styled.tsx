import styled from "styled-components";
interface InputBoxProps {
  $span?: number;
}

export const InputBox = styled.div<InputBoxProps>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  grid-column: span ${({ $span = 3 }) => $span};
  min-width: 0;
  box-sizing: border-box;
`;

export const InputField = styled.div<{ $hasError?: boolean }>`
  width: 100%;
  min-height: 42px;
  border-radius: 12px;
  border: 1px solid
    ${({ $hasError }) => ($hasError ? "#ef4444" : "var(--mes-muted)")};
  background: #fff;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 12px;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.04);
  transition:
    border-color 0.2s ease,
    transform 0.2s ease;
  box-sizing: border-box;
  position: relative;

  &:hover {
    border-color: #93c5fd;
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    min-height: 42px;
    padding: 0 12px;
  }

  svg {
    font-size: 18px;
    color: var(--mes-primary);
    flex-shrink: 0;
  }

  input,
  select {
    border: none;
    outline: none;
    width: 100%;
    font-size: 0.96rem;
    font-weight: 500;
    color: var(--mes-text);
    background: transparent;
    box-sizing: border-box;
  }

  select {
    appearance: auto;
    -webkit-appearance: auto;
    -moz-appearance: auto;
    cursor: pointer;
    padding-right: 8px;

    @media (min-width: 768px) {
      padding-right: 28px;
    }
  }
`;

export const DropDownContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  width: 50%;
  overflow: hidden;
  text-overflow: ellipsis;

  color: var(--mes-text);

  .required {
    color: #ef4444;
    margin-right: 4px;
  }
`;

export const DropdownWrapper = styled.div`
  position: relative;
  width: 100%;
`;

export const DropdownControl = styled.div<{
  $hasError?: boolean;
  $disabled?: boolean;
}>`
  min-height: 42px;

  border-radius: 12px;
  border: 1px solid
    ${({ $hasError }) => ($hasError ? "#ef4444" : "var(--mes-muted)")};

  background: white;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0 16px;

  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};

  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};

  transition: all 0.2s ease;

  &:hover {
    border-color: #93c5fd;
  }

  svg {
    font-size: 14px;
    flex-shrink: 0;
  }
`;

export const SelectedValue = styled.div`
  flex: 1;

  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  font-size: 14px;
  font-weight: 500;
`;

export const SelectedInput = styled.input`
  flex: 1;
  border: none !important;
  outline: none !important;
  background: transparent !important;
  padding: 0 !important;

  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  font-size: 14px;
  font-weight: 500;
  color: inherit;
  font-family: inherit;

  cursor: inherit;

  &::placeholder {
    color: #a0aec0;
  }
`;

export const DropdownPanel = styled.div<{ $openAbove?: boolean }>`
  position: absolute;

 

  left: 0;
  right: 0;

  background: white;

  border-radius: 12px;

  border: 1px solid rgba(0, 0, 0, 0.08);

  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);

  z-index: 9999;
`;

export const SearchInput = styled.input`
  border: none;
  width: calc(100% - 32px);
  border-radius: 12px 12px 0px 0px;
  border-bottom: 1px solid #e5e7eb;
  outline: none;
  padding: 12px 16px;
  font-size: 14px;
`;

export const OptionsContainer = styled.div`
  max-height: 240px;
  overflow-y: auto;
  border-radius: 12px;
`;

export const OptionItem = styled.div<{
  $selected?: boolean;
  $isSubStep?: boolean;
}>`
  padding: 12px 16px;
  padding-left: ${({ $isSubStep }) => ($isSubStep ? "32px" : "16px")};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;

  background: ${({ $selected }) => ($selected ? "#dbeafe" : "white")};
  color: ${({ $selected, $isSubStep }) => ($selected ? "inherit" : $isSubStep ? "#4b5563" : "inherit")};
  font-size: ${({ $isSubStep }) => ($isSubStep ? "13px" : "14px")};
  font-weight: ${({ $isSubStep }) => ($isSubStep ? "500" : "600")};

  .option-label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .caret-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 4px;
    color: #9ca3af;
    transition: background 0.2s, color 0.2s;

    &:hover {
      background: #e5e7eb;
      color: #4b5563;
    }
  }

  ${({ $isSubStep }) =>
    $isSubStep &&
    `
    &::before {
      content: "└ ";
      color: #9ca3af;
      margin-right: 6px;
    }
  `}

  &:hover {
    background: #eff6ff;
  }
`;

export const NoData = styled.div`
  padding: 16px;
  text-align: center;
  color: #6b7280;
`;
