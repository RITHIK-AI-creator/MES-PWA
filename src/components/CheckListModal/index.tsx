import React, { useState, useEffect } from "react";
import * as Styled from "./index.styled";
import { IconButton } from "@mui/material";
import { FaTimes, FaRegPlayCircle } from "react-icons/fa";
import { FiChevronUp, FiChevronDown, FiFileText, FiCheckCircle, FiCircle } from "react-icons/fi";
import Loader from "../../Library/Loader";
import CustomButton from "../../Library/Button";


interface CheckListItem {
  Id: string;
  Name: string;
  Instruction: string;
  IsOptional: boolean;
}

interface CheckListModalProps {
  isOpen: boolean;
  onClose: () => void;
  checklistData: any; // { Name: string, Items: CheckListItem[] }
  onSave?: (checkedIds: string[]) => void;
  initialCheckedIds?: string[];
  actionLabel?: string;
  isSubmitting?: boolean;
}

const CheckListModal: React.FC<CheckListModalProps> = ({ 
  isOpen, 
  onClose, 
  checklistData, 
  onSave, 
  initialCheckedIds = [],
  actionLabel,
  isSubmitting = false
}) => {
  const [currentChecked, setCurrentChecked] = useState<string[]>(initialCheckedIds);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      setCurrentChecked(initialCheckedIds);
      setIsExpanded(true);
    }
  }, [isOpen, initialCheckedIds]);

  const toggleCheck = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (currentChecked.includes(id)) {
      setCurrentChecked(currentChecked.filter(checkedId => checkedId !== id));
    } else {
      setCurrentChecked([...currentChecked, id]);
    }
  };

  const toggleExpand = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsExpanded(!isExpanded);
  };

  const handleSaveClick = () => {
    if (onSave) {
      onSave(currentChecked);
    }
  };

  if (!isOpen) return null;

  const renderChecklist = () => {
    if (!checklistData) {
      return null;
    }

    if (!checklistData.Items || checklistData.Items.length === 0) {
      return (
        <Styled.CheckListContainer>
          <Styled.Header style={{background: "none", color: "black", padding: "12px", borderBottom: "1px solid #e2e8f0"}}>
            <Styled.CardTitleWrapper>
              <FiFileText />
              <Styled.Title>{checklistData.Name || "Checklist"}</Styled.Title>
            </Styled.CardTitleWrapper>
          </Styled.Header>
          <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
            No checklist items available to display.
          </div>
        </Styled.CheckListContainer>
      );
    }

    const items = [...checklistData.Items].sort((a: any, b: any) => (a.Order ?? 0) - (b.Order ?? 0));
    const totalItems = items.length;
    const completedItems = currentChecked.length;
    const progress = totalItems === 0 ? 0 : (completedItems / totalItems) * 100;

    return (
      <Styled.CheckListContainer>
        <Styled.Header onClick={toggleExpand} style={{background: "none", color: "black", padding: "12px", borderBottom: "1px solid #e2e8f0"}}>
          <Styled.CardTitleWrapper>
            <FiFileText />
            <Styled.Title>{checklistData.Name}</Styled.Title>
          </Styled.CardTitleWrapper>
          <Styled.ToggleButton type="button" onClick={toggleExpand}>
            {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
          </Styled.ToggleButton>
        </Styled.Header>
        
        <Styled.ProgressBarContainer>
          <Styled.ProgressBar style={{ width: progress + "%" }} />
        </Styled.ProgressBarContainer>

        <Styled.ItemList isExpanded={isExpanded}>
          {items.map((item: any) => {
            const isChecked = currentChecked.includes(item.Id);
            
            return (
              <Styled.ItemRow 
                key={item.Id} 
                isActive={isChecked} 
                onClick={(e: any) => toggleCheck(item.Id, e)}
              >
                <Styled.CheckboxContainer>
                  {isChecked ? (
                    <FiCheckCircle size={22} color="#10b981" /> 
                  ) : (
                    <FiCircle size={22} color="#cbd5e1" /> 
                  )}
                </Styled.CheckboxContainer>
                <Styled.ItemContent>
                  <Styled.ItemName>{item.Name}</Styled.ItemName>
                  {item.Instruction && (
                    <Styled.ItemInstruction>{item.Instruction}</Styled.ItemInstruction>
                  )}
                </Styled.ItemContent>
              </Styled.ItemRow>
            );
          })}
        </Styled.ItemList>
      </Styled.CheckListContainer>
    );
  };

  return (
    <Styled.Overlay $isOpen={isOpen}>
      <Styled.ModalContainer onClick={(e: any) => e.stopPropagation()}>
        {isSubmitting && <Loader />}
        <Styled.ModalHeader>
          <div>Checklist</div>
          <IconButton size="small" style={{ color: 'white', padding: 4 }} onClick={onClose} disabled={isSubmitting}>
            <FaTimes />
          </IconButton>
        </Styled.ModalHeader>
        <Styled.Content>
          {renderChecklist()}
        </Styled.Content>
        <Styled.Footer>
          <CustomButton type="reset" onClick={onClose} disabled={isSubmitting} />
          <CustomButton 
            type="normal" 
            onClick={handleSaveClick} 
            label={actionLabel || "Save"} 
            Icon={FaRegPlayCircle} 
            disabled={isSubmitting}
          />
        </Styled.Footer>
      </Styled.ModalContainer>
    </Styled.Overlay>
  );
};

export default CheckListModal;
