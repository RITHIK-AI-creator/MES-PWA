import styled from "styled-components";

export const CheckListContainer = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 12px 12px;
  border: 1px solid rgba(203, 213, 225, 0.4);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.03);
  margin-top: 16px;
  margin-bottom: 16px;
  box-sizing: border-box;
  width: 100%;
`;

export const Header = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  box-sizing: border-box;
  cursor: pointer;
`;

export const CardTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 0 4px;
  gap: 8px;
  box-sizing: border-box;
  color: #000000;
  font-weight: 600;
  font-size: 0.98rem;

  svg {
    font-size: 18px;
    color: #64748b;
  }
`;

export const Title = styled.div`
  color: #000000;
  font-weight: 600;
  font-size: 0.98rem;
`;

export const ToggleButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  color: #64748b;
  transition: color 0.2s;
  outline: none;
  flex-shrink: 0;

  &:hover {
    color: var(--mes-primary-600, #2563eb);
  }

  svg {
    font-size: 18px !important;
  }
`;

export const ProgressBarContainer = styled.div`
  height: 4px;
  background-color: #e2e8f0;
  width: 100%;
  border-radius: 2px;
  margin-bottom: 8px;
  overflow: hidden;
`;

export const ProgressBar = styled.div`
  height: 100%;
  background-color: #10b981; 
  transition: width 0.3s ease;
`;

export const ItemList = styled.div<{ isExpanded: boolean }>`
  display: \${(props) => (props.isExpanded ? "flex" : "none")};
  flex-direction: column;
  border-radius: 12px;
  border: 0.5px solid #E5E4E2;
  overflow: hidden;
  align-items: flex-start;
  justify-content: flex-start;
  width: 100%;
  box-sizing: border-box;
`;

export const ItemRow = styled.div<{ isActive: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  width: 100%;
  border-bottom: 0.5px solid #E5E4E2;
  background-color: #ffffff;
  cursor: pointer;
  box-sizing: border-box;
  transition: background-color 0.2s;

  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: #f8fafc;
  }
`;

export const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
`;

export const ItemContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

export const ItemName = styled.div`
  font-size: 0.98rem;
  color: #1e293b;
  font-weight: 600;
`;

export const ItemInstruction = styled.div`
  font-size: 0.9rem;
  color: #64748b;
  margin-top: 4px;
  line-height: 1.4;
`;
