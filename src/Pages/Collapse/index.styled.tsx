
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

  flex-shrink: 0;

  @media (max-width: 768px) {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
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
  }
`;

export const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-shrink: 0;
`;

export const ErrorMessage = styled.div`
  margin-top: 8px;

  color: #d32f2f;

  font-size: 14px;
`;

export const CollapseContent = styled.div`
  width: 100%;
  min-width: 0;

  margin-top: 20px;

  border: 1px solid #e4e7ec;
  border-radius: 12px;

  background: #ffffff;

  box-sizing: border-box;

  /*
   * Important:
   * Do not allow the table content
   * to force the whole card to grow.
   */
  min-height: 0;

  display: flex;
  flex-direction: column;

  overflow: hidden;

  flex-shrink: 0;

  @media (max-width: 768px) {
    margin-top: 14px;
  }
`;

export const CollapseDetailsHeader = styled.div`
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 12px 16px;

  box-sizing: border-box;

  background: #f8f9fb;

  border-bottom: 1px solid #e4e7ec;

  /*
   * Header should never shrink.
   */
  flex-shrink: 0;

  @media (max-width: 768px) {
    padding: 10px 12px;
  }
`;

export const CollapseDetailsTitleWrapper = styled.div`
  display: flex;
  align-items: center;

  padding: 0 4px;

  gap: 8px;

  box-sizing: border-box;

  color: #000000;

  font-weight: 700;

  font-size: 0.98rem;

  min-width: 0;

  svg {
    font-size: 18px;
    color: #64748b;
    flex-shrink: 0;
  }

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    font-weight: 700;
  }

  @media (max-width: 768px) {
    font-size: 13px;

    gap: 7px;

    svg {
      font-size: 16px;
    }
  }
`;

export const CollapseDetailsToggle = styled.button`
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

  @media (max-width: 768px) {
    padding: 3px;

    svg {
      font-size: 17px !important;
    }
  }
`;

export const CollapseSubTitle = styled.div`
  padding: 15px 16px;

  font-size: 15px;
  font-weight: 700;

  color: #344054;

  border-bottom: 1px solid #e4e7ec;

  background: #f8f9fb;

  @media (max-width: 768px) {
    padding: 12px;
    font-size: 13px;
  }
`;

/*
 * ============================================================
 * SUB-MATERIAL TABLE SCROLL CONTAINER
 * ============================================================
 *
 * THIS is the important part.
 *
 * The table gets its own fixed-height area.
 * Only this area will scroll.
 */
export const CollapseTableWrapper = styled.div`
  width: 100%;

  /*
   * Force a real scrollable area.
   */
  height: 320px;

  max-height: 320px;

  min-height: 0;

  overflow-y: scroll;

  overflow-x: hidden;

  box-sizing: border-box;

  flex-shrink: 0;

  -webkit-overflow-scrolling: touch;

  /*
   * Firefox scrollbar
   */
  scrollbar-width: thin;

  scrollbar-color: #cbd5e1 transparent;

  /*
   * Chrome / Edge / Safari scrollbar
   */
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
    /*
     * Smaller scroll area on mobile.
     */
    height: 260px;

    max-height: 260px;

    overflow-y: scroll;

    overflow-x: hidden;
  }
`;

/*
 * ============================================================
 * TABLE
 * ============================================================
 */
export const CollapseTable = styled.div`
  width: 100%;

  min-width: 0;

  /*
   * Do NOT put overflow here.
   * CollapseTableWrapper owns the scroll.
   */
`;

/*
 * ============================================================
 * TABLE HEADER
 * ============================================================
 */
export const CollapseTableHeader = styled.div`
  display: grid;

  grid-template-columns:
    45px
    minmax(0, 1fr)
    110px;

  align-items: center;

  width: 100%;

  padding: 12px 10px;

  background: #f8f9fb;

  border-bottom: 1px solid #e4e7ec;

  font-size: 12px;

  font-weight: 700;

  color: #667085;

  box-sizing: border-box;

  /*
   * Keep header visible while
   * rows are being scrolled.
   */
  position: sticky;

  top: 0;

  z-index: 10;

  @media (max-width: 768px) {
    grid-template-columns:
      28px
      minmax(0, 1fr)
      85px;

    width: 100%;

    padding: 9px 4px;

    font-size: 10px;

    position: sticky;

    top: 0;

    z-index: 10;
  }
`;

/*
 * ============================================================
 * TABLE ROW
 * ============================================================
 */
export const CollapseTableRow = styled.div<{
  selected?: boolean;
}>`
  display: grid;

  grid-template-columns:
    45px
    minmax(0, 1fr)
    110px;

  align-items: center;

  width: 100%;

  min-height: 50px;

  padding: 8px 10px;

  box-sizing: border-box;

  background: ${({ selected }) =>
    selected
      ? "#f2f4f7"
      : "#ffffff"};

  border-bottom: 1px solid #f2f4f7;

  cursor: pointer;

  transition: background 0.15s ease;

  &:hover {
    background: #f9fafb;
  }

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    grid-template-columns:
      28px
      minmax(0, 1fr)
      85px;

    width: 100%;

    min-height: 44px;

    padding: 6px 4px;
  }
`;

export const CollapseCheckboxCell = styled.div`
  display: flex;

  align-items: center;

  justify-content: center;

  min-width: 0;

  input {
    width: 16px;

    height: 16px;

    margin: 0;

    cursor: pointer;
  }

  @media (max-width: 768px) {
    input {
      width: 14px;

      height: 14px;
    }
  }
`;

export const CollapseHeaderCell = styled.div`
  min-width: 0;

  padding: 0 6px;

  overflow: hidden;

  text-overflow: ellipsis;

  white-space: nowrap;

  box-sizing: border-box;

  font-size: 12px;

  font-weight: 700;

  color: #344054;

  &:nth-child(2) {
    min-width: 0;
  }

  &:nth-child(3) {
    white-space: nowrap;
  }

  @media (max-width: 768px) {
    padding: 0 3px;

    font-size: 10px;

    font-weight: 700;
  }
`;

export const CollapseCell = styled.div`
  min-width: 0;

  padding: 0 6px;

  font-size: 13px;

  color: #344054;

  font-weight: 700;

  overflow-wrap: anywhere;

  word-break: break-word;

  white-space: normal;

  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 0 3px;

    font-size: 10px;

    font-weight: 700;

    overflow-wrap: anywhere;

    word-break: break-word;

    white-space: normal;
  }
`;

export const CollapseEmptyRow = styled.div`
  padding: 35px 20px;

  text-align: center;

  color: #98a2b3;

  font-size: 14px;
`;

