import styled from "styled-components";

export const Container = styled.div`
  background: transparent;
  padding: 8px;
  min-height: calc(100vh - 64px);
  position: relative;
  overflow-x: hidden;
  box-sizing: border-box;

  &::before {
    content: "";
    position: absolute;
    right: -80px;
    top: -80px;
    width: 420px;
    height: 420px;
    border-radius: 50%;
    background: rgba(59, 130, 246, 0.12);
    z-index: -1;
  }

  @media (max-width: 768px) {
    padding: 8px;
  }
`;

export const PageHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--mes-muted);
`;

export const PageTitle = styled.h2`
  margin: 0 0 20px;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--mes-text);
`;

export const PageDescription = styled.p`
  margin: 0;
  font-size: 0.95rem;
  color: #64748b;
  line-height: 1.5;
  max-width: 700px;
`;