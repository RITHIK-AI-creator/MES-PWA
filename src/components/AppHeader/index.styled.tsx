import styled from "styled-components";


export const TopBlueBar = styled.div`
  background: linear-gradient(90deg, var(--mes-primary) 0%, var(--mes-primary-600) 35%, var(--mes-secondary) 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
  font-family: var(--font-sans);
  position: relative;
  min-height: 36px;
  z-index: 1000;
`;

export const HamburgerButton = styled.button`
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  transition: transform 0.2s ease, background 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    background: rgba(255, 255, 255, 0.25);
  }
`;

export const HamburgerLine=styled.div`
    width: 20px;
    height: 2px;
    background: #FFF;
    border-radius: 2px;
`;

export const AppTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-left: var(--space-3);
  flex: 1;
  min-width: 0;
`;

export const TitleGroup = styled.div`
  display: flex;
  align-items: baseline;
  gap: 14px;
`;

export const ActiveTab = styled.h3`
  font-size: 1.1rem;
  margin: 0;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.1;
  font-style: normal;
`;

export const SubTitle = styled.span`
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.88);
  font-weight: 500;
`;

export const TitleContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
`;

export const EquipmentId = styled.h1<{ $bgColor?: string }>`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--mes-text);
  display: inline-block;
  border-radius: var(--radius-md);
  padding: 6px 16px;
  background-color: ${({ $bgColor }) => $bgColor};
  letter-spacing: 0.5px;
`;

export const LogoutContainer = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 6px;
  position: relative;
  z-index: 10;
`;

export const EmployeeIdText = styled.span`
  font-size: 0.95rem;
  font-weight: 600;
  color: #000000;
`;

export const ProfileButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: transparent;
  display: grid;
  place-items: center;
  color: var(--mes-text);
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
  padding: 0;

  &:hover {
    transform: translateY(-1px);
  }
`;

export const AvatarCircle = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0ea5e9 0%, #1d4ed8 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 1px;
  box-shadow: 0 2px 6px rgba(29, 78, 216, 0.4);
`;

export const ProfileIcon = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--mes-text);
  font-size: 0.85rem;
`;

export const ProfileMenu = styled.div`
  position: absolute;
  right: 0;
  top: 56px;
  min-width: 210px;
  background: var(--mes-card-bg);
  border-radius: 18px;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--mes-border);
  overflow: hidden;
  z-index: 1000;
`;

export const MenuItem = styled.button`
  width: 100%;
  padding: 14px 18px;
  text-align: left;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--mes-text);
  font-size: 0.95rem;
  font-weight: 600;
  transition: background 0.2s ease;
  display: flex;
  align-items: center;
  gap: 10px;

  &:hover {
    background: rgba(255,255,255,0.03);
  }
`;

export const ProfileTitle = styled.div`
  padding: 16px 18px;
  border-bottom: 1px solid var(--mes-border);
  color: var(--mes-text);
  font-weight: 700;
`;

export const ProfileSubtitle = styled.div`
  padding: 0 18px 14px;
  color: var(--mes-muted);
  font-size: 0.92rem;
`;

