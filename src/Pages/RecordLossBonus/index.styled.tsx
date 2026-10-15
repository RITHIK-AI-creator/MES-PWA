import styled from "styled-components";

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
  gap: 12px;
  width: 100%;

  @media (max-width: 768px) {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 8px;
  }
`;
export const FinalQuantity = styled.div`
  margin-top: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--mes-text-primary);
`;

export const SearchBox = styled.div`
  width: 220px;
  flex-shrink: 0;
  border: 1px solid #d0d5dd;
  border-radius: 12px;
  background: #fff;

  @media (max-width: 768px) {
    width: 100%;
    grid-column: 1;
    grid-row: 1;
  }
`;

export const DropdownBox = styled.div`
  width: 220px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 100%;
    grid-column: 1 / -1;
    grid-row: 2;
  }
`;

export const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    grid-column: 2;
    grid-row: 1;
    display: flex;
    gap: 6px;
  }
`;

export const ErrorMessage = styled.div`
  margin-top: 8px;
  color: #d32f2f;
  font-size: 14px;
`;

export const RecordLossBonusDetailsBox = styled.div`
  width: 100%;
  margin-top: 25px; /* changed from 20px */
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background: #fff;
  overflow: hidden;
`;

export const RecordLossBonusDetailsHeader = styled.div`
  padding: 14px 16px;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 1px solid #e0e0e0;
`;

export const RecordLossBonusDetailsContent = styled.div`
  padding: 16px;
`;

export const DetailRow = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eeeeee;

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
`;

export const DetailLabel = styled.div`
  width: 140px;
  font-weight: 600;
  color: #555;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const DetailValue = styled.div`
  flex: 1;
  color: #222;
`;

export const EmptyMessage = styled.div`
  padding: 20px;
  color: #777;
  text-align: center;

  @media (max-width: 768px) {
    padding: 16px 12px;
    font-size: 14px;
  }
`;


