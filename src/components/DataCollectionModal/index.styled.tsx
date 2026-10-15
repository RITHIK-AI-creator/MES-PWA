import styled from 'styled-components';
import { TextField } from '@mui/material';

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
  width: 400px;
  max-width: 90%;
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
  line-height: 1;
`;

export const Content = styled.div`
  padding: 16px 20px 8px 20px;
  display: flex;
  flex-direction: column;
  max-height: 60vh;
  overflow-y: auto;
  background-color: white;
`;

export const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 8px;
  min-height: 32px;
  margin-bottom: 8px;
`;

export const Label = styled.label`
  font-size: 0.75rem;
  font-weight: 600;
  color: #333;
  white-space: normal;
  word-break: break-word;
  line-height: 1.3;
`;

export const InputWrapper = styled.div`
  width: 100%;
`;

export const CompactTextField = styled(TextField)`
  & .MuiOutlinedInput-root {
    height: 32px;
    min-height: 32px;
  }
  & .MuiOutlinedInput-input {
    padding: 4px 8px;
    font-size: 0.95rem;
  }
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

