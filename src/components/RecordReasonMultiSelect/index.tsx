
import React, { useEffect, useRef, useState } from "react";

import * as Styled from "./index.styled";

export interface RecordReasonOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface RecordReasonMultiSelectProps {
  value: string[];
  options: RecordReasonOption[];
  onChange: (values: string[]) => void;
  quantities: Record<string, string>;
  onQuantityChange: (
    reasonId: string,
    quantity: string
  ) => void;
  unit: string;
  error?: boolean;
  required?: boolean;
  placeholder?: string;
}

const RecordReasonMultiSelect: React.FC<
  RecordReasonMultiSelectProps
> = ({
  value,
  options,
  onChange,
  quantities,
  onQuantityChange,
  unit,
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
    option: RecordReasonOption
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

  const handleQuantityChange = (
    reasonId: string,
    quantity: string
  ) => {
    // Allow only numbers and decimal values
    if (!/^\d*\.?\d*$/.test(quantity)) {
      return;
    }

    onQuantityChange(
      reasonId,
      quantity
    );
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

                  {isSelected && (
                    <>
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="Qty"
                        value={
                          quantities[option.value] || ""
                        }
                        onClick={(event) =>
                          event.stopPropagation()
                        }
                        onChange={(event) =>
                          handleQuantityChange(
                            option.value,
                            event.target.value
                          )
                        }
                        style={{
                          width: "70px",
                          height: "28px",
                          marginLeft: "auto",
                          padding: "4px 8px",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          outline: "none",
                          textAlign: "center"
                        }}
                      />

                      {unit && (
                        <span
                          style={{
                            marginLeft: "6px",
                            minWidth: "25px"
                          }}
                        >
                          {unit}
                        </span>
                      )}
                    </>
                  )}
                </Styled.Option>
              );
            })
          )}
        </Styled.OptionsContainer>
      )}
    </Styled.DropdownContainer>
  );
};

export default RecordReasonMultiSelect;
