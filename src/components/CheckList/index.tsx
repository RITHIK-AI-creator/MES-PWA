import React, { useState } from "react";
import * as Styled from "./index.styled";
import { FiChevronUp, FiChevronDown, FiFileText, FiCheckCircle, FiCircle } from "react-icons/fi";

interface CheckListItem {
  Id: string;
  Name: string;
  Instruction: string;
  IsOptional: boolean;
}

interface CheckListProps {
  checklist: {
    Name: string;
    Items: CheckListItem[];
  };
  checkedIds?: string[];
  onChecklistChange?: (checkedIds: string[]) => void;
}

const CheckList: React.FC<CheckListProps> = ({ checklist, checkedIds = [], onChecklistChange }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  
  if (!checklist || !checklist.Items || checklist.Items.length === 0) {
    return null;
  }

  const items = checklist.Items;
  const totalItems = items.length;
  const completedItems = checkedIds.length;
  const progress = totalItems === 0 ? 0 : (completedItems / totalItems) * 100;

  const toggleCheck = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (onChecklistChange) {
      if (checkedIds.includes(id)) {
        onChecklistChange(checkedIds.filter(checkedId => checkedId !== id));
      } else {
        onChecklistChange([...checkedIds, id]);
      }
    }
  };

  const toggleExpand = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <Styled.CheckListContainer>
      <Styled.Header onClick={toggleExpand}>
        <Styled.CardTitleWrapper>
          <FiFileText />
          <Styled.Title>{checklist.Name}</Styled.Title>
        </Styled.CardTitleWrapper>
        <Styled.ToggleButton type="button" onClick={toggleExpand}>
          {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
        </Styled.ToggleButton>
      </Styled.Header>
      
      <Styled.ProgressBarContainer>
        <Styled.ProgressBar style={{ width: progress + "%" }} />
      </Styled.ProgressBarContainer>

      <Styled.ItemList isExpanded={isExpanded}>
        {items.map((item) => {
          const isChecked = checkedIds.includes(item.Id);
          
          return (
            <Styled.ItemRow 
              key={item.Id} 
              isActive={isChecked} 
              onClick={(e) => toggleCheck(item.Id, e)}
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

export default CheckList;
