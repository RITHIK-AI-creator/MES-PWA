import styled from "styled-components";

interface SidebarProps {
  $isOpen?: boolean;
}

interface MenuLinkProps {
  $isActive: boolean;
}

export const SideBarOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  z-index: 2000;
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  pointer-events: ${({ $isOpen }) => ($isOpen ? "auto" : "none")};
  transition: opacity 0.28s ease;
`;

export const SidebarMenu = styled.div<SidebarProps & { $isOpen?: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  transform: ${({ $isOpen }) => ($isOpen ? "translateX(0)" : "translateX(-110%)")};
  transition: transform 0.32s cubic-bezier(.2,.9,.2,1);
  width: 300px;
  max-width: 100%;
  height: 100%;
  background: linear-gradient(180deg, var(--mes-card-bg) 0%, #f7fbff 100%);
  padding: 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.12);
`;

export const SidebarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
`;

export const SidebarTitle = styled.div`
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--mes-text);
`;

export const SidebarSubTitle = styled.div`
  font-size: 0.92rem;
  color: #64748b;
  margin-top: 4px;
`;

export const SidebarCloseButton = styled.button`
  background: transparent;
  border: none;
  font-size: 18px;
  color: var(--mes-muted);
  cursor: pointer;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  transition: background 0.15s ease;

  &:hover {
    background: rgba(15,23,42,0.03);
  }
`;

export const SidebarMenuItems = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const SidebarMenuItem = styled.li`
  margin: 0;
`;

export const SidebarMenuLink = styled.a<MenuLinkProps>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  position: relative;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  
  color: ${({ $isActive }) => ($isActive ? "var(--mes-primary)" : "var(--mes-text)")};
  background: ${({ $isActive }) => ($isActive ? "rgba(37, 99, 235, 0.08)" : "transparent")};
  transform: ${({ $isActive }) => ($isActive ? "translateX(4px)" : "translateX(0)")};
  box-shadow: ${({ $isActive }) => ($isActive ? "0 4px 12px rgba(37, 99, 235, 0.06)" : "none")};
  padding-left: ${({ $isActive }) => ($isActive ? "22px" : "14px")};

  &::before {
    content: "";
    position: absolute;
    left: 8px;
    top: 50%;
    transform: translateY(-50%) scaleY(${({ $isActive }) => ($isActive ? 1 : 0)});
    width: 4px;
    height: 50%;
    background: var(--mes-primary);
    border-radius: 4px;
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:hover {
    background: ${({ $isActive }) => ($isActive ? "rgba(37, 99, 235, 0.12)" : "rgba(15, 23, 42, 0.03)")};
    transform: translateX(6px);
    color: var(--mes-primary);
  }

  &:active {
    transform: scale(0.97) translateX(${({ $isActive }) => ($isActive ? "4px" : "0")});
  }
`;

export const SidebarIcon = styled.span<MenuLinkProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: ${({ $isActive }) => ($isActive ? "rgba(59,130,246,0.08)" : "rgba(15, 23, 42, 0.03)")};
  color: ${({ $isActive }) => ($isActive ? "var(--mes-primary-600)" : "var(--mes-muted)")};
  font-size: 1rem;
`;

export const LogoutBtnWrapper = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 16px;
`;

export const MenuContent = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100% - 88px);
  justify-content: space-between;
  overflow-y: auto;
  overflow-x: hidden;
`;

export const SubMenuContainer = styled.div<{ $isOpen: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-left: 78px;
  max-height: ${({ $isOpen }) => ($isOpen ? "120px" : "0")};
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  overflow: hidden;
  transition: max-height 0.25s ease-out, opacity 0.2s ease-out;
  margin-top: ${({ $isOpen }) => ($isOpen ? "4px" : "0")};
  margin-bottom: ${({ $isOpen }) => ($isOpen ? "8px" : "0")};
`;

export const SubMenuItem = styled.div<{ $isActive: boolean }>`
  font-size: 0.9rem;
  font-weight: 500;
  padding: 6px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: color 0.2s ease;
  color: ${({ $isActive }) => ($isActive ? "var(--mes-primary)" : "var(--mes-muted)")};
  background: transparent;
  text-decoration: ${({ $isActive }) => ($isActive ? "underline" : "none")};

  &:hover {
    color: var(--mes-primary);
    text-decoration: underline;
  }
`;

export const TriangleIcon = styled.span<{ $isOpen: boolean }>`
  margin-left: auto;
  font-size: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--mes-muted);
  transform: ${({ $isOpen }) => ($isOpen ? "rotate(0deg)" : "rotate(-90deg)")};
  transition: transform 0.2s ease;
`;

export const ExpandIcon = styled.span`
  margin-left: auto;
  font-size: 12px;
  display: flex;
  align-items: center;
  color: #64748b;
  transition: transform 0.2s;
`;