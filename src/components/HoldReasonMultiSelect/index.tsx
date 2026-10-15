import React, { useEffect, useRef, useState } from "react";
import * as Styled from "./index.styled";

export interface HoldReasonOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface HoldReasonMultiSelectProps {
  value: string[];
  options: HoldReasonOption[];
  onChange: (values: string[]) => void;
  error?: boolean;
  required?: boolean;
  placeholder?: string;
}

const HoldReasonMultiSelect: React.FC<
  HoldReasonMultiSelectProps
> = ({
  value,
  options,
  onChange,
  error = false,
  required = false,
  placeholder = "Select Hold Reason"
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target as Node
        )
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const handleOptionClick = (
    option: HoldReasonOption
  ) => {
    if (option.disabled) {
      return;
    }

    const alreadySelected = value.includes(
      option.value
    );

    if (alreadySelected) {
      onChange(
        value.filter(
          (item) => item !== option.value
        )
      );
    } else {
      onChange([
        ...value,
        option.value
      ]);
    }
  };

  const selectedLabels = options
    .filter((option) =>
      value.includes(option.value)
    )
    .map((option) => option.label);

  return (
    <Styled.DropdownContainer ref={dropdownRef}>
      <Styled.SelectBox
        $isOpen={isOpen}
        $hasError={error}
        onClick={() =>
          setIsOpen((previous) => !previous)
        }
      >
        <Styled.SelectedContent>
          {selectedLabels.length > 0 ? (
            <Styled.SelectedText>
              {selectedLabels.join(", ")}
            </Styled.SelectedText>
          ) : (
            <Styled.Placeholder>
              {placeholder}
              {required && " *"}
            </Styled.Placeholder>
          )}
        </Styled.SelectedContent>

        <Styled.Arrow $isOpen={isOpen}>
          ▼
        </Styled.Arrow>
      </Styled.SelectBox>

      {isOpen && (
        <Styled.OptionsContainer>
          {options.length === 0 ? (
            <Styled.NoOptions>
              No hold reasons available
            </Styled.NoOptions>
          ) : (
            options.map((option) => {
              const isSelected =
                value.includes(option.value);

              return (
                <Styled.Option
                  key={option.value}
                  $disabled={!!option.disabled}
                  $selected={isSelected}
                  onClick={() =>
                    handleOptionClick(option)
                  }
                >
                  <Styled.CheckboxWrapper>
                    <Styled.Checkbox
                      type="checkbox"
                      checked={isSelected}
                      disabled={option.disabled}
                      onChange={() => {}}
                    />
                  </Styled.CheckboxWrapper>

                  <Styled.OptionLabel>
                    {option.label}
                  </Styled.OptionLabel>
                </Styled.Option>
              );
            })
          )}
        </Styled.OptionsContainer>
      )}
    </Styled.DropdownContainer>
  );
};

export default HoldReasonMultiSelect;