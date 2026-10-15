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
  min-height: 0;
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

export const HoldDetailsBox = styled.div`
  width: 100%;
  margin-top: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background: #fff;
  overflow: hidden;
`;

export const HoldDetailsHeader = styled.div`
  padding: 14px 16px;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 1px solid #e0e0e0;
`;

export const HoldDetailsContent = styled.div`
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
  font-weight: 700;
  color: #555;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const DetailValue = styled.div`
  flex: 1;
  color: #222;
  font-weight: 700;
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

/* =========================================================
   EXPAND DETAILS
   ========================================================= */

export const ExpandDetailsBox = styled.div`
  width: 100%;
  margin-top: 20px;

  border: 1px solid #e4e7ec;
  border-radius: 12px;

  background: #ffffff;

  overflow: hidden;

  /*
   * Internal scroll for the complete
   * Expand Materials section.
   */
  max-height: 420px;

  display: flex;
  flex-direction: column;

  min-height: 0;
  flex-shrink: 0;

  box-sizing: border-box;

  @media (max-width: 768px) {
    max-height: 420px;
  }
`;

export const ExpandDetailsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;
  box-sizing: border-box;

  min-height: 54px;

  padding: 14px 16px;

  border-bottom: 1px solid #e4e7ec;

  background: #eef4ff;

  font-size: 17px;
  font-weight: 700;

  color: #1d2939;

  cursor: pointer;
  user-select: none;

  transition: background 0.15s ease;

  /*
   * Keep header visible while
   * body scrolls.
   */
  flex-shrink: 0;

  &:hover {
    background: #e5edff;
  }

  @media (max-width: 768px) {
    min-height: 52px;
    padding: 14px 15px;
    font-size: 16px;
  }
`;

export const ExpandDetailsBody = styled.div`
  display: grid;

  grid-template-columns:
    minmax(0, 1.15fr)
    minmax(280px, 0.85fr);

  gap: 20px;

  padding: 20px;

  background: #f9fafb;

  /*
   * Internal scroll.
   */
  overflow-y: auto;
  overflow-x: hidden;

  min-height: 0;

  box-sizing: border-box;

  flex: 1;

  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;

  &::-webkit-scrollbar {
    width: 7px;
  }

  &::-webkit-scrollbar-track {
    background: #f8fafc;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;

    width: 100%;

    box-sizing: border-box;

    gap: 14px;

    padding: 12px;

    overflow-y: auto;
    overflow-x: hidden;

    min-height: 0;
  }
`;

/* =========================================================
   EXPAND TITLE / TOGGLE
   ========================================================= */

export const ExpandDetailsTitleWrapper = styled.div`
  display: flex;
  align-items: center;

  padding: 0 4px;

  gap: 8px;

  box-sizing: border-box;

  color: #000000;

  font-weight: 700;
  font-size: 0.98rem;

  svg {
    font-size: 18px;
    color: #64748b;
  }
`;

export const ExpandDetailsToggle = styled.button`
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

/* =========================================================
   SUB MATERIAL PANEL
   ========================================================= */

export const SubMaterialPanel = styled.div`
  width: 100%;
  min-width: 0;

  border: 1px solid #e4e7ec;
  border-radius: 12px;

  background: #ffffff;

  overflow: hidden;

  /*
   * Important for the parent
   * scroll container.
   */
  flex-shrink: 0;
`;

export const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 13px 15px;

  border-bottom: 1px solid #e4e7ec;

  background: #f8f9fb;

  font-size: 14px;
  font-weight: 700;

  color: #344054;
`;

export const PanelActions = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const IconButton = styled.button`
  width: 32px;
  height: 32px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 1px solid #d0d5dd;
  border-radius: 8px;

  background: #ffffff;

  color: #344054;

  cursor: pointer;

  transition:
    background 0.15s ease,
    border-color 0.15s ease;

  &:hover {
    background: #f2f4f7;
    border-color: #98a2b3;
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

/* =========================================================
   TABLE
   ========================================================= */

export const TableContainer = styled.div`
  width: 100%;

  max-height: 300px;

  overflow-y: auto;
  overflow-x: hidden;

  box-sizing: border-box;

  /*
   * Keep this table's own scroll.
   */
  flex-shrink: 0;

  scrollbar-width: thin;
  scrollbar-color: #b8bec7 transparent;

  &::-webkit-scrollbar {
    width: 7px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f3f5;
  }

  &::-webkit-scrollbar-thumb {
    background: #b8bec7;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #98a2b3;
  }

  @media (max-width: 768px) {
    max-height: 280px;

    overflow-y: auto;
    overflow-x: hidden;
  }
`;

export const TableHeader = styled.div`
  display: grid;

  grid-template-columns:
    minmax(0, 1fr)
    100px;

  width: 100%;

  box-sizing: border-box;

  padding: 11px 14px;

  background: #f9fafb;

  border-bottom: 1px solid #e4e7ec;

  font-size: 12px;
  font-weight: 700;

  color: #667085;

  position: sticky;
  top: 0;
  z-index: 5;

  @media (max-width: 480px) {
    grid-template-columns:
      minmax(0, 1fr)
      85px;

    padding: 10px 12px;
  }
`;

export const TableRow = styled.div<{ selected?: boolean }>`
  display: grid;

  grid-template-columns:
    minmax(0, 1fr)
    100px;

  width: 100%;

  box-sizing: border-box;

  padding: 12px 14px;

  border-bottom: 1px solid #f2f4f7;

  background: ${({ selected }) =>
    selected ? "#f2f4f7" : "#ffffff"};

  cursor: pointer;

  transition: background 0.15s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #f9fafb;
  }

  @media (max-width: 480px) {
    grid-template-columns:
      minmax(0, 1fr)
      85px;

    padding: 11px 12px;
  }
`;

export const TableCell = styled.div`
  min-width: 0;

  display: flex;
  align-items: center;

  font-size: 14px;
  font-weight: 700;

  color: #344054;

  overflow: hidden;

  text-overflow: ellipsis;

  white-space: nowrap;
`;

export const QuantityCell = styled(TableCell)`
  justify-content: flex-start;
  font-weight: 700;
`;

export const QuantityBadge = styled.span`
  display: inline-flex;

  align-items: center;

  padding: 4px 9px;

  border-radius: 6px;

  background: #f2f4f7;

  color: #344054;

  font-size: 12px;
  font-weight: 700;
`;

export const EmptyTableMessage = styled.div`
  padding: 30px 15px;

  text-align: center;

  font-size: 13px;

  color: #98a2b3;
`;

/* =========================================================
   EDIT PANEL
   ========================================================= */

export const EditPanel = styled.div`
  width: 100%;
  min-width: 0;

  border: 1px solid #e4e7ec;

  border-radius: 12px;

  background: #ffffff;

  padding: 18px;

  box-sizing: border-box;

  flex-shrink: 0;

  @media (max-width: 768px) {
    padding: 15px;
  }
`;

export const EditPanelTitle = styled.div`
  margin-bottom: 18px;

  font-size: 15px;

  font-weight: 700;

  color: #344054;
`;

export const FieldGroup = styled.div`
  display: flex;

  flex-direction: column;

  gap: 7px;

  margin-bottom: 16px;
`;

export const FieldLabel = styled.label`
  font-size: 13px;

  font-weight: 700;

  color: #475467;
`;

export const ReadOnlyName = styled.div`
  min-height: 40px;

  box-sizing: border-box;

  display: flex;

  align-items: center;

  padding: 9px 12px;

  border: 1px solid #d0d5dd;

  border-radius: 8px;

  background: #f9fafb;

  color: #344054;

  font-size: 14px;

  font-weight: 700;

  overflow: hidden;

  text-overflow: ellipsis;

  white-space: nowrap;
`;

export const QuantityInputWrapper = styled.div`
  display: flex;

  align-items: center;

  width: 100%;

  border: 1px solid #d0d5dd;

  border-radius: 8px;

  background: #ffffff;

  overflow: hidden;

  &:focus-within {
    border-color: #98a2b3;
  }
`;

export const QuantityInput = styled.input`
  width: 100%;

  min-width: 0;

  height: 40px;

  padding: 0 12px;

  border: none;

  outline: none;

  background: transparent;

  color: #344054;

  font-size: 14px;

  font-weight: 700;

  box-sizing: border-box;
`;

export const QuantityUnit = styled.span`
  flex-shrink: 0;

  padding: 0 12px;

  font-size: 13px;

  font-weight: 700;

  color: #667085;
`;

export const RemainingQuantity = styled.div`
  display: flex;

  align-items: center;

  gap: 6px;

  margin-top: 4px;

  font-size: 14px;

  font-weight: 700;
`;

export const RemainingQuantityLabel = styled.span`
  font-weight: 700;

  color: #475467;
`;

export const RemainingQuantityValue = styled.span`
  font-weight: 700;

  color: #344054;
`;

/* =========================================================
   EXPANDED SUB-MATERIALS
   ========================================================= */

export const ExpandedSubMaterialsBox = styled.div`
  width: 100%;

  border: 1px solid #e4e7ec;

  border-radius: 12px;

  background: #ffffff;

  overflow: hidden;

  flex-shrink: 0;
`;

export const ExpandedSubMaterialsHeader = styled.div`
  display: flex;

  align-items: center;

  justify-content: space-between;

  min-height: 54px;

  padding: 14px 16px;

  box-sizing: border-box;

  border-bottom: 1px solid #e4e7ec;

  background: #eef4ff;

  cursor: pointer;

  user-select: none;

  transition: background 0.15s ease;

  &:hover {
    background: #e5edff;
  }

  @media (max-width: 768px) {
    min-height: 52px;

    padding: 14px 15px;
  }
`;

export const ExpandedSubMaterialsTitle = styled.div`
  font-size: 16px;

  font-weight: 700;

  color: #1d2939;

  @media (max-width: 768px) {
    font-size: 15px;
  }
`;

/* =========================================================
   SHOW / HIDE BUTTON
   ========================================================= */

export const ExpandedSubMaterialsToggle = styled.button`
  width: 30px;

  height: 30px;

  display: flex;

  align-items: center;

  justify-content: center;

  flex-shrink: 0;

  padding: 0;

  border: none;

  border-radius: 6px;

  background: transparent;

  color: #64748b;

  cursor: pointer;

  transition:
    background 0.15s ease,
    color 0.15s ease;

  &:hover {
    background: #e5edff;

    color: #2563eb;
  }

  &:focus {
    outline: none;
  }

  svg {
    font-size: 15px;
  }

  @media (max-width: 768px) {
    width: 28px;

    height: 28px;

    svg {
      font-size: 14px;
    }
  }
`;

/* =========================================================
   EXPANDED SUB-MATERIALS TABLE
   ========================================================= */

export const ExpandedSubMaterialsTable = styled.div`
  width: 100%;

  max-height: 300px;

  /*
   * Existing internal scroll.
   * Keep this independent from the
   * Expand Materials scroll.
   */
  overflow-y: auto;
  overflow-x: hidden;

  box-sizing: border-box;

  scrollbar-width: thin;
  scrollbar-color: #b8bec7 transparent;

  &::-webkit-scrollbar {
    width: 7px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f3f5;
  }

  &::-webkit-scrollbar-thumb {
    background: #b8bec7;

    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #98a2b3;
  }
`;

/* =========================================================
   EXPANDED SUB-MATERIALS HEADER
   MATERIAL | PRIMARY QTY
   ========================================================= */

export const ExpandedSubMaterialsTableHeader = styled.div`
  display: grid;

  grid-template-columns:
    minmax(0, 1fr)
    140px;

  width: 100%;

  box-sizing: border-box;

  padding: 11px 14px;

  background: #f9fafb;

  border-bottom: 1px solid #e4e7ec;

  font-size: 12px;
  font-weight: 700;

  color: #667085;

  position: sticky;
  top: 0;
  z-index: 5;

  @media (max-width: 768px) {
    grid-template-columns:
      minmax(0, 1fr)
      95px;

    width: 100%;

    padding: 10px 12px;
  }

  @media (max-width: 480px) {
    grid-template-columns:
      minmax(0, 1fr)
      85px;

    padding: 10px;
  }
`;
/* =========================================================
   EXPANDED SUB-MATERIALS ROW
   MATERIAL | PRIMARY QTY
   ========================================================= */

export const ExpandedSubMaterialsRow = styled.div`
  display: grid;

  grid-template-columns:
    minmax(0, 1fr)
    140px;

  width: 100%;

  box-sizing: border-box;

  padding: 12px 14px;

  border-bottom: 1px solid #f2f4f7;

  background: #ffffff;

  transition: background 0.15s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #f9fafb;
  }

  @media (max-width: 768px) {
    grid-template-columns:
      minmax(0, 1fr)
      95px;

    width: 100%;

    padding: 11px 12px;
  }

  @media (max-width: 480px) {
    grid-template-columns:
      minmax(0, 1fr)
      85px;

    padding: 11px 10px;
  }
`;

/* =========================================================
   EXPANDED SUB-MATERIAL CELL
   ========================================================= */

export const ExpandedSubMaterialsCell = styled.div<{
  $quantity?: boolean;
}>`
  min-width: 0;

  max-width: 100%;

  display: flex;

  align-items: center;

  font-size: 14px;

  color: #344054;

  font-weight: 700;

  overflow-wrap: anywhere;

  word-break: break-word;

  ${({ $quantity }) =>
    $quantity &&
    `
      justify-content: flex-start;
      white-space: nowrap;
      font-weight: 700;
    `}

  @media (max-width: 768px) {
    font-size: 13px;
  }

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;