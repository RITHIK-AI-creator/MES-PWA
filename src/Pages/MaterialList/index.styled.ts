import styled from 'styled-components';

export const PageContainer = styled.div`
  padding: 0;
  background-color: transparent;
  height: calc(100vh - 48px); /* Adjust for header */
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 24px;
`;

export const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 0;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
`;

export const ListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  font-weight: 600;
  color: #333;
  font-size: 14px;
  text-transform: uppercase;
  position: sticky;
  top: 0;
  z-index: 10;
`;

export const ListItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #ffffff;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;

  &:nth-child(even) {
    background-color: #f8f9fa;
  }

  &:hover {
    background-color: #f0f4f8;
  }

  &:last-child {
    border-bottom: none;
  }
`;

export const ItemName = styled.div`
  font-size: 16px;
  color: #1976d2;
  font-weight: 400;
`;

export const ItemState = styled.div`
  font-size: 14px;
  color: #666;
`;

export const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 0;
`;

export const HeaderText = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #1a2b4c;
  
  span {
    color: #1976d2;
    font-size: 14px;
    margin-left: 8px;
  }
`;

export const ErrorMessage = styled.div`
  color: #d32f2f;
  background-color: #fdecea;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 24px;
`;

export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 18px;
  color: #666;
`;
