import styled, { css, keyframes } from 'styled-components';

export const PageContainer = styled.div`
  padding: 0;
  background-color: transparent;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  height: calc(100vh - 48px);
`;

export const TopControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
`;

export const SearchBox = styled.div`
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 12px;
  padding-left: 12px;
  border: 1px solid #ced4da;
  height: 42px;
  flex-grow: 1;
`;

export const ErrorMessage = styled.div`
  color: #d32f2f;
  background-color: #fdecea;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
`;
export const StepperContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  padding: 0;
  margin: -8px 0; /* subtle minimal 8px spacing above and below */

  /* Dotted connector — exactly centered on the 28px circles */
  &::before {
    content: '';
    position: absolute;
    top: 14px; /* exactly half of 28px circle height */
    left: calc(12.5% + 14px);
    right: calc(12.5% + 14px);
    height: 0;
    border-top: 2px dotted #cbd5e1;
    z-index: 0;
  }
`;

export const StepItem = styled.div<{ $active?: boolean, $completed?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  flex: 1;
  z-index: 1;

  span {
    font-size: 10px;
    font-weight: 600;
    text-align: center;
    color: ${props => props.$active ? 'var(--mes-primary-600)' : props.$completed ? '#475569' : '#94a3b8'};
  }
`;

export const pulse = keyframes`
  0%{
    transform:scale(1);
  }
  50%{
    transform:scale(1.08);
  }
  100%{
    transform:scale(1);
  }
`;

export const StepIconWrapper = styled.div<{ $active?: boolean, $completed?: boolean }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $active, $completed }) => ( $active ? "var(--mes-primary-600)" : $completed ? "#475569" : "#f1f5f9")};
  color: ${({ $active, $completed }) => ($active || $completed ? "white" : "#94a3b8")};
  border: ${props => props.$active || props.$completed ? 'none' : '1.5px solid #cbd5e1'};
  box-shadow: ${({ $active, $completed }) => ($active && !$completed ? '0 2px 8px rgba(29, 78, 216, 0.35)' : 'none')};
  transition: all 0.3s ease;
  flex-shrink: 0;

  animation: ${({ $active, $completed }) =>
    $active && !$completed
      ? css`
          ${pulse} 2s infinite
        `
      : "none"};

  i {
    font-size: 12px;
  }
`;

export const ResourcePickerWrapper = styled.div`
  background: white;
  border: 1px solid #ced4da;
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

