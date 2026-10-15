import styled from 'styled-components';

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

export const Header = styled.div`
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

export const TableCard = styled.div`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  margin-bottom: 20px;
  overflow: hidden;
`;

export const TableHeader = styled.div`
  background-color: #f8fafc;
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  color: #334155;
  font-size: 14px;
`;

export const InputGrid = styled.div`
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
`;

export const InputGroup = styled.div`
  label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #334155;
    margin-bottom: 4px;
  }
  input {
    width: 100%;
    padding: 8px;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    box-sizing: border-box;
    font-size: 14px;
    &:disabled {
      background-color: #f1f5f9;
    }
  }
`;

