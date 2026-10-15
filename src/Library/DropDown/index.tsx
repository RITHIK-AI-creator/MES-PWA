import React, { useEffect, useMemo, useRef, useState } from "react";
import * as Styled from "./index.styled";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

interface DropDownProps {
  label?: string;
  value: string;
  isError?: boolean;
  options: { label: string; value: string; isSubStep?: boolean; parentValue?: string; hasSubSteps?: boolean }[];
  setSelectedOptions: React.Dispatch<React.SetStateAction<string>>;
  setIsError?: React.Dispatch<React.SetStateAction<boolean>>;
  onChange?: (value: string) => void;
  isDisabled?: boolean;
  emptyValue?: string;
  required?: boolean;
  hideClearButton?: boolean;
  openAbove?: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
  autoFocus?: boolean;
}

const DropDown = ({
  label,
  required,
  value,
  options,
  isError,
  setSelectedOptions,
  setIsError,
  onChange,
  isDisabled,
  emptyValue,
  hideClearButton,
  openAbove: openAboveProp,
  inputRef,
  autoFocus,
}: DropDownProps) => {

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [openAboveState, setOpenAboveState] = useState(false);

  const isPanelAbove = openAboveProp ?? openAboveState;
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({});

  const calculatePosition = () => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      const panelHeight = 240;

      if (spaceBelow < panelHeight && spaceAbove > spaceBelow) {
        setOpenAboveState(true);
      } else {
        setOpenAboveState(false);
      }
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    calculatePosition();

    const handleScrollOrResize = () => {
      calculatePosition();
    };

    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen]);

  const toggleExpand = (e: React.MouseEvent, optionValue: string) => {
    e.stopPropagation();
    setExpandedParents(prev => ({
      ...prev,
      [optionValue]: !prev[optionValue]
    }));
  };

  const selectedOption = options?.find((option) => option && option.value === value);

  const filteredOptions = useMemo(() => {
    return options?.filter((option) =>
      option &&
      option.label &&
      option.label.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [options, searchTerm]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    if (!value) {
      setSearchTerm("");
    }
  }, [value]);

  const isMandatory = Boolean(required || (label && label.includes("*")));
  const displayLabel = label ? label.replace(/\s*\*+\s*$/, "") : "";

  useEffect(() => {
    if (isMandatory && options && options.length === 1 && !value) {
      const singleOption = options[0];
      if (singleOption && singleOption.value !== undefined) {
        setSelectedOptions(singleOption.value);
        if (setIsError) setIsError(false);
        onChange?.(singleOption.value);
      }
    }
  }, [isMandatory, options, value]);

  
  const handleSelect = (selectedValue: string) => {
    setSelectedOptions(selectedValue);
    if(setIsError)
    setIsError(false);

    onChange?.(selectedValue);

    setSearchTerm("");
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent<SVGElement>) => {
    e.stopPropagation();

    setSelectedOptions("");
    setSearchTerm("");
    setIsOpen(true);

    onChange?.("");
  };

  return (
    <Styled.InputBox $span={4}>
      {label && (
        <Styled.Label>
          {displayLabel}
          {isMandatory && <span className="required">*</span>}
        </Styled.Label>
      )}

      <Styled.DropdownWrapper
        ref={wrapperRef}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <Styled.DropdownControl
          $hasError={isError}
          $disabled={isDisabled}
          onClick={() => {
            if (isDisabled) return;

            if (!isOpen) {
              setSearchTerm(selectedOption?.label || "");
              setIsOpen(true);
            }
          }}
        >
          <Styled.SelectedInput
            ref={inputRef}
            autoFocus={autoFocus}
            value={isOpen ? searchTerm : (selectedOption?.label || "")}
            placeholder={(emptyValue ?? "Select")}
            onFocus={() => {
              if (!isDisabled && !isOpen) {
                setSearchTerm(selectedOption?.label || "");
                setIsOpen(true);
              }
            }}
            onChange={(e) => {
              const typedValue = e.target.value;
              setSearchTerm(typedValue);
              if (!isOpen) setIsOpen(true);

              // Auto-select if there is an exact match (case-insensitive)
              if (typedValue && options) {
                const exactMatch = options.find(
                  (opt) => opt?.label && opt.label.toLowerCase() === typedValue.toLowerCase()
                );
                if (exactMatch) {
                  handleSelect(exactMatch.value);
                }
              }
            }}
            onClick={(e) => {
              if (isOpen) e.stopPropagation();
            }}
          />

          <>
            {value && !hideClearButton && (
              <IoClose
                onClick={handleClear}
                style={{
                  cursor: "pointer",
                  marginRight: "8px",
                }}
              />
            )}

            <FaChevronDown 
              onClick={(e) => {
                e.stopPropagation();
                if (isDisabled) return;
                setIsOpen((prev) => {
                  if (!prev) {
                    setSearchTerm(selectedOption?.label || "");
                  }
                  return !prev;
                });
              }}
              style={{ cursor: "pointer" }}
            />
          </>
        </Styled.DropdownControl>

        {isOpen && !isDisabled && (
          <Styled.DropdownPanel $openAbove={isPanelAbove}>
            <Styled.OptionsContainer>
              {Number(filteredOptions?.length) > 0 ? (
                filteredOptions?.map((option, index) => {
                  if (option.isSubStep && option.parentValue && !expandedParents[option.parentValue] && !searchTerm) {
                    return null;
                  }

                  return (
                    <Styled.OptionItem
                      $selected={option.value === value}
                      $isSubStep={option.isSubStep}
                      key={`${option.value}-${index}`}
                      onClick={() => handleSelect(option.value)}
                    >
                      {option.hasSubSteps && (
                        <span
                          className="caret-icon"
                          onClick={(e) => toggleExpand(e, option.value)}
                        >
                          {expandedParents[option.value] || searchTerm ? <FaChevronDown /> : <FaChevronRight />}
                        </span>
                      )}
                      <span className="option-label">{option.label}</span>
                    </Styled.OptionItem>
                  );
                })
              ) : (
                <Styled.NoData>No items found</Styled.NoData>
              )}
            </Styled.OptionsContainer>
          </Styled.DropdownPanel>
        )}
      </Styled.DropdownWrapper>
    </Styled.InputBox>
  );
};

export default DropDown;
