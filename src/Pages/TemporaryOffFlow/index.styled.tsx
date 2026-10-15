import styled from "styled-components";

export const PageContainer = styled.div`
  padding: 0;
  background-color: transparent;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  overflow-x: hidden;
  height: calc(100vh - 48px);
  min-width: 0;
  box-sizing: border-box;
`;

export const TopControls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-width: 0;

  @media (max-width: 768px) {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 8px;
  }

  @media (max-width: 480px) {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 6px;
  }
`;

export const SearchBox = styled.div`
  width: 220px;
  flex-shrink: 0;
  min-width: 0;
  border: 1px solid #d0d5dd;
  border-radius: 12px;
  background: #fff;
  box-sizing: border-box;

  @media (max-width: 768px) {
    width: 100%;
    grid-column: 1;
    grid-row: 1;
  }
`;

export const DropdownBox = styled.div`
  width: 220px;
  flex-shrink: 0;
  min-width: 0;

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

  @media (max-width: 480px) {
    gap: 4px;
  }
`;

export const ErrorMessage = styled.div`
  margin-top: 8px;
  color: #d32f2f;
  font-size: 14px;
`;

export const TempoffflowDetailsBox = styled.div`
  width: 100%;
  margin-top: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background: #fff;
  overflow: hidden;
  min-width: 0;
  box-sizing: border-box;
`;

export const TempoffflowDetailsHeader = styled.div`
  padding: 14px 16px;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 1px solid #e0e0e0;
`;

export const TempoffflowDetailsContent = styled.div`
  padding: 16px;
  min-width: 0;
  box-sizing: border-box;
`;

export const DetailRow = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eeeeee;
  min-width: 0;

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
  min-width: 140px;
  font-weight: 600;
  color: #555;

  @media (max-width: 768px) {
    width: 100%;
    min-width: 0;
  }
`;

export const DetailValue = styled.div`
  flex: 1;
  min-width: 0;
  color: #222;
  overflow-wrap: anywhere;
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

/* ========================================================= */
/* TEMPOFFFLOW MODAL */
/* ========================================================= */

export const TempoffflowModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

export const TempoffflowModal = styled.div`
  background: white;
  width: 90%;
  max-width: 500px;
  height: 80vh;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const TempoffflowModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(
    90deg,
    var(--mes-primary) 0%,
    var(--mes-primary-600) 35%,
    var(--mes-secondary) 100%
  );
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
`;

export const TempoffflowModalTitle = styled.h2`
  margin: 0;
  font-size: 1.15rem;
  color: white;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const TempoffflowBackIcon = styled.span`
  font-size: 1.25rem;
  line-height: 1;
  flex-shrink: 0;
  color: white;
`;

export const HelpIcon = styled.div`
  background: none;
  border: none;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  padding: 4px;
  flex-shrink: 0;

  &:hover {
    color: white;
  }
`;

export const TempoffflowForm = styled.div`
  flex: 1;
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 30px 20px;
  min-width: 0;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 24px 16px;
  }

  @media (max-width: 480px) {
    padding: 20px 12px;
  }
`;

export const TempoffflowFieldRow = styled.div`
  display: flex;
  align-items: flex-start;
  width: 100%;
  min-width: 0;
  margin-bottom: 18px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
    margin-bottom: 20px;
  }
`;

export const TempoffflowFieldLabel = styled.div`
  width: 180px;
  min-width: 180px;
  text-align: right;
  padding: 10px 14px 0 0;
  font-size: 16px;
  color: #444;
  box-sizing: border-box;

  @media (max-width: 768px) {
    width: 100%;
    min-width: 0;
    text-align: left;
    padding: 0;
    font-size: 15px;
  }
`;

export const RequiredMark = styled.span`
  color: #d32f2f;
  font-weight: 600;
  margin-right: 6px;
`;

export const TempoffflowFieldControl = styled.div`
  flex: 1;
  width: calc(100% - 180px);
  min-width: 0;
  box-sizing: border-box;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const ReturnFlowPathRow = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
`;

export const ReturnFlowPathInput = styled.div`
  flex: 1;
  min-width: 0;
  height: 42px;
  border: 1px solid #bdbdbd;
  background: #fafafa;
  display: flex;
  align-items: center;
  position: relative;
  box-sizing: border-box;
  border-radius: 4px;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const ReturnFlowStepInput = styled.div`
  flex: 1;
  min-width: 0;
  height: 42px;
  border: 1px solid #bdbdbd;
  background: #fff;
  display: flex;
  align-items: center;
  position: relative;
  box-sizing: border-box;
  border-radius: 4px;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const SearchIconButton = styled.button`
  width: 52px;
  min-width: 52px;
  height: 100%;
  border: none;
  border-left: 1px solid #bdbdbd;
  background: transparent;
  color: #2563eb;
  font-size: 25px;
  cursor: pointer;
  flex-shrink: 0;

  &:hover {
    background: #eef4ff;
  }

  @media (max-width: 480px) {
    width: 46px;
    min-width: 46px;
    font-size: 21px;
  }
`;

export const ClearIcon = styled.span`
  position: absolute;
  right: 12px;
  color: #777;
  font-size: 22px;
  cursor: pointer;
  z-index: 1;

  @media (max-width: 480px) {
    right: 10px;
    font-size: 20px;
  }
`;

export const FlowPathRow = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 0;
  margin-top: 8px;
  margin-bottom: 10px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    flex-direction: row;
    align-items: flex-start;
    gap: 4px;

    ${TempoffflowFieldLabel} {
      width: auto;
      min-width: auto;
      flex: 0 0 auto;
      text-align: left;
      padding: 0;
      font-size: 15px;
    }
  }
`;

export const FlowPathValue = styled.div`
  flex: 1;
  min-width: 0;
  color: #2563eb;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-sizing: border-box;
  line-height: 1.4;

  white-space: normal;
  overflow-wrap: break-word;
  word-break: normal;

  @media (max-width: 768px) {
    flex: 1 1 auto;
    width: auto;
    min-width: 0;
    font-size: 13px;
  }

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

export const FlowPathIcon = styled.span`
  font-size: 20px;
  color: #2563eb;
  flex-shrink: 0;
`;

export const CommentsSection = styled.div`
  border-top: 1px solid #d0d0d0;
  border-bottom: 1px solid #d0d0d0;
  flex-shrink: 0;
  min-width: 0;
`;

export const CommentsHeader = styled.div`
  height: 48px;
  padding: 0 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 19px;
  color: #333;

  @media (max-width: 768px) {
    padding: 0 16px;
    height: 44px;
    font-size: 16px;
  }

  @media (max-width: 480px) {
    padding: 0 12px;
  }
`;

export const CommentsContent = styled.div`
  min-height: 0;
`;

export const TempoffflowModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  background: #fff;
  flex-shrink: 0;
  box-sizing: border-box;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;

    button {
      width: 100%;
    }
  }
`;

/* ========================================================= */
/* FLOW PATH MODAL */
/* ========================================================= */

export const FlowPathModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2100;
`;

export const FlowPathModal = styled.div`
  background: white;
  width: 90%;
  max-width: 500px;
  height: 80vh;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  box-sizing: border-box;
`;

export const FlowPathModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(
    90deg,
    var(--mes-primary) 0%,
    var(--mes-primary-600) 35%,
    var(--mes-secondary) 100%
  );
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
`;

export const FlowPathTitle = styled.h2`
  margin: 0;
  font-size: 1.15rem;
  color: white;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

export const FlowPathHeaderIcon = styled.span`
  font-size: 1.25rem;
  color: white;
  flex-shrink: 0;
`;

export const FlowPathSearchRow = styled.div`
  display: flex;
  align-items: center;
  padding: 20px;
  min-width: 0;
  box-sizing: border-box;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    padding: 16px;
  }

  @media (max-width: 480px) {
    padding: 12px;
  }
`;

export const FlowPathSearchLabel = styled.div`
  width: 180px;
  min-width: 180px;
  text-align: right;
  padding-right: 14px;
  font-size: 16px;
  color: #444;
  box-sizing: border-box;

  @media (max-width: 768px) {
    width: 100%;
    min-width: 0;
    text-align: left;
    padding: 0;
    font-size: 15px;
  }
`;

export const FlowPathSearchInput = styled.div`
  height: 42px;
  flex: 1;
  min-width: 0;
  border: 1px solid #bdbdbd;
  background: #fff;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  border-radius: 4px;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const FlowPathInformation = styled.div`
  padding: 0 20px 18px;
  min-width: 0;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 0 16px 14px;
  }

  @media (max-width: 480px) {
    padding: 0 12px 12px;
  }
`;

export const FlowPathInformationRow = styled.div`
  display: flex;
  margin-bottom: 12px;
  font-size: 16px;
  min-width: 0;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 3px;
    margin-bottom: 10px;
    font-size: 15px;
  }
`;

export const FlowPathInformationLabel = styled.div`
  width: 180px;
  min-width: 180px;
  text-align: right;
  padding-right: 14px;
  color: #444;
  box-sizing: border-box;

  @media (max-width: 768px) {
    width: 100%;
    min-width: 0;
    text-align: left;
    padding: 0;
  }
`;

export const FlowPathInformationValue = styled.div`
  color: #222;
  min-width: 0;
  overflow-wrap: anywhere;
`;

export const FlowTreeContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  margin: 0 20px;
  padding: 10px 10px 20px;
  border-top: 1px solid transparent;
  min-width: 0;
  box-sizing: border-box;

  @media (max-width: 768px) {
    margin: 0 16px;
    padding: 8px 8px 20px;
  }

  @media (max-width: 480px) {
    margin: 0 12px;
    padding: 8px 4px 16px;
  }
`;

export const FlowTreeItem = styled.div<{
  $active?: boolean;
}>`
  margin-left: 20px;
  min-width: 0;

  @media (max-width: 768px) {
    margin-left: 10px;
  }
`;

export const FlowTreeLine = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  height: 42px;
  min-width: 0;

  @media (max-width: 768px) {
    gap: 8px;
    height: 40px;
  }
`;

export const FlowTreeCircle = styled.div`
  width: 34px;
  height: 34px;
  min-width: 34px;
  border-radius: 50%;
  background: #2563eb;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 30px;
    height: 30px;
    min-width: 30px;
    font-size: 18px;
  }
`;

export const FlowTreeName = styled.div`
  font-size: 17px;
  color: #222;
  min-width: 0;
  overflow-wrap: anywhere;

  @media (max-width: 768px) {
    font-size: 15px;
  }
`;

export const FlowTreeStep = styled.div<{
  $selected?: boolean;
}>`
  position: relative;
  display: flex;
  align-items: center;
  min-height: 52px;
  margin-left: 42px;
  padding-left: 28px;
  min-width: 0;
  box-sizing: border-box;

  background: ${({ $selected }) =>
    $selected ? "#eef4ff" : "transparent"};

  &:before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: #c7c7c7;
  }

  &:last-child:before {
    bottom: 26px;
  }

  @media (max-width: 768px) {
    min-height: 48px;
    margin-left: 32px;
    padding-left: 24px;
  }

  @media (max-width: 480px) {
    min-height: 44px;
    margin-left: 26px;
    padding-left: 20px;
  }
`;

export const FlowTreeDot = styled.div`
  position: absolute;
  left: -7px;
  width: 15px;
  height: 15px;
  min-width: 15px;
  border-radius: 50%;
  background: #2563eb;

  @media (max-width: 768px) {
    left: -6px;
    width: 13px;
    height: 13px;
    min-width: 13px;
  }
`;

export const FlowTreeStepText = styled.div`
  font-size: 16px;
  color: #222;
  min-width: 0;
  overflow-wrap: anywhere;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

export const TempoffflowText = styled.span`
  color: #777;
  font-size: 14px;

  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

export const FlowPathModalFooter = styled.div`
  height: 64px;
  min-height: 64px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
  background: #fff;
  border-top: 1px solid #e5e7eb;
  box-sizing: border-box;

  @media (max-width: 768px) {
    height: auto;
    min-height: 60px;
    padding: 10px 16px;
  }

  @media (max-width: 480px) {
    padding: 10px 12px;
  }
`;