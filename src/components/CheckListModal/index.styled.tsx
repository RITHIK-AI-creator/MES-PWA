import styled from "styled-components";

export const CheckListContainer = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 12px 12px;
  border: 1px solid rgba(203, 213, 225, 0.4);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.03);
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


export const Overlay = styled.div<{ $isOpen: boolean }>`
  display: ${({ $isOpen }) => ($isOpen ? "flex" : "none")};
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

export const ModalContainer = styled.div`
  background: white;
  border-radius: 8px;
  width: 450px;
  max-width: 95%;
  max-height: 90vh;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
`;

export const ModalHeader = styled.div`
  background: linear-gradient(90deg, var(--mes-primary) 0%, var(--mes-primary-600) 35%, var(--mes-secondary) 100%);
  color: white;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 1.1rem;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
`;

export const Content = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  background-color: #f1f5f9;
`;

export const Footer = styled.div`
  padding: 15px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  background: #fafafa;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
`;

