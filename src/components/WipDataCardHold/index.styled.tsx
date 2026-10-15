import styled from "styled-components";

export const MainCard = styled.div<{ $isHold?: boolean }>`
  background: ${({ $isHold }) => ($isHold ? "#fee2e2" : "#ffffff")};
  border-radius: 16px;
  padding: 12px 12px;
  border: ${({ $isHold }) => ($isHold ? "1px solid #ef4444" : "1px solid rgba(203, 213, 225, 0.4)")};
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.03);
  box-sizing: border-box;
  width: 100%;
`;

export const HeaderRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  box-sizing: border-box;
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

export const ExpandButton = styled.button`
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

export const Grid = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  border: 0.5px solid #E5E4E2;
  overflow: hidden;
  align-items: flex-start;
  justify-content: flex-start;
  width: 100%;
  box-sizing: border-box;
`;

export const InfoWarpper = styled.div`
  display: flex;
  gap: 0;
  width: 100%;
  border-bottom: 0.5px solid #E5E4E2;
  box-sizing: border-box;

  &:last-child {
    border-bottom: none;
  }
`;

export const InfoLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.92rem;
  font-weight: 550;
  color: #64748b;
  font-family: inherit;
  white-space: nowrap;
  flex-shrink: 0;
  flex: 0 0 135px;
  background: rgba(59, 130, 246, 0.12);
  padding: 5px 8px;
  box-sizing: border-box;
`;

export const Badge = styled.div<{ $colorType?: string }>`
  font-size: 0.98rem;
  font-weight: 700;
  color: ${({ $colorType }) => {
    switch ($colorType) {
      case "red":
        return "#ef4444";
      default:
        return "#1e293b";
    }
  }};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  align-items: center;
  display: flex;
  width: 100%;
  padding: 5px 12px;
  background: #ffffff;
  box-sizing: border-box;
`;
