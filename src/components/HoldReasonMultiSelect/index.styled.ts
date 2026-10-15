import styled from "styled-components";

export const DropdownContainer = styled.div`
  position: relative;
  width: 100%;
`;

export const SelectBox = styled.div<{
  $isOpen: boolean;
  $hasError: boolean;
}>`
  width: 100%;
  min-height: 40px;
  box-sizing: border-box;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 8px 12px;

  background: #ffffff;

  border: 1px solid
    ${({ $hasError }) =>
      $hasError ? "#d32f2f" : "#d0d5dd"};

  border-radius: 4px;

  cursor: pointer;

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    border-color: ${({ $hasError }) =>
      $hasError ? "#d32f2f" : "#98a2b3"};
  }

  ${({ $isOpen, $hasError }) =>
    $isOpen &&
    `
      border-color: ${
        $hasError ? "#d32f2f" : "#1976d2"
      };

      box-shadow: 0 0 0 1px ${
        $hasError ? "#d32f2f" : "#1976d2"
      };
    `}
`;

export const SelectedContent = styled.div`
  flex: 1;
  min-width: 0;

  display: flex;
  align-items: center;
`;

export const SelectedText = styled.div`
  width: 100%;

  font-size: 14px;
  color: #344054;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const Placeholder = styled.div`
  font-size: 14px;
  color: #667085;
`;

export const Arrow = styled.span<{
  $isOpen: boolean;
}>`
  margin-left: 8px;

  font-size: 10px;

  color: #667085;

  transition: transform 0.2s ease;

  transform: ${({ $isOpen }) =>
    $isOpen
      ? "rotate(180deg)"
      : "rotate(0deg)"};
`;

export const OptionsContainer = styled.div`
  position: absolute;

  top: calc(100% + 4px);
  left: 0;
  right: 0;

  z-index: 1000;

  max-height: 260px;
  overflow-y: auto;

  background: #ffffff;

  border: 1px solid #d0d5dd;
  border-radius: 4px;

  box-shadow:
    0 4px 12px rgba(16, 24, 40, 0.12);

  padding: 4px 0;

  box-sizing: border-box;
`;

export const Option = styled.div<{
  $disabled: boolean;
  $selected: boolean;
}>`
  display: flex;
  align-items: center;

  min-height: 40px;

  padding: 8px 12px;

  box-sizing: border-box;

  cursor: ${({ $disabled }) =>
    $disabled ? "not-allowed" : "pointer"};

  background: ${({ $selected, $disabled }) => {
    if ($disabled) {
      return "#f2f4f7";
    }

    if ($selected) {
      return "#f5f9ff";
    }

    return "#ffffff";
  }};

  opacity: ${({ $disabled }) =>
    $disabled ? 0.65 : 1};

  &:hover {
    background: ${({ $disabled, $selected }) => {
      if ($disabled) {
        return "#f2f4f7";
      }

      if ($selected) {
        return "#eef5ff";
      }

      return "#f9fafb";
    }};
  }
`;

export const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;

  margin-right: 10px;

  flex-shrink: 0;
`;

export const Checkbox = styled.input`
  width: 16px;
  height: 16px;

  margin: 0;

  cursor: pointer;

  accent-color: #1976d2;

  &:disabled {
    cursor: not-allowed;
  }
`;

export const OptionLabel = styled.span`
  flex: 1;
  min-width: 0;

  font-size: 14px;
  line-height: 20px;

  color: #344054;

  word-break: break-word;
`;

export const NoOptions = styled.div`
  padding: 12px;

  text-align: center;

  font-size: 14px;

  color: #667085;
`;

// @media (max-width: 768px) {
//   ${SelectedText} {
//     white-space: normal;
//     line-height: 20px;
//   }

//   ${OptionsContainer} {
//     max-height: 240px;
//   }

//   ${Option} {
//     min-height: 44px;
//     padding: 10px 12px;
//   }
// }