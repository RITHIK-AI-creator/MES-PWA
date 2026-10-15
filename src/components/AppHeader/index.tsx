import React, { useState, useRef, useEffect } from "react";
import * as Styled from "./index.styled";
import { FiLogOut, FiUser, FiGlobe } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import MessageModal from "../MessageModal";
import { POST } from "../../Helpers/apiClient";
import { useLocation } from "react-router-dom";
import { NavLink } from "../SideNavBar";
import Labels from "../../locales/en.json";
import { extractErrorMessage } from "../../Helpers/common";

const AppHeader = ({ onMenuClick }: { onMenuClick?: () => void }) => {
  const { logout, userId, sessionId } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    for (const nav of NavLink) {
      if (nav.subLinks) {
        const activeSub = nav.subLinks.find(
          (sub) => sub.path === location.pathname,
        );
        if (activeSub) return activeSub.title;
      }
      if (
        location.pathname === nav.path ||
        location.pathname.startsWith(nav.path + "/")
      ) {
        return nav.title;
      }
    }
    return "";
  };
  const pageTitle = getPageTitle();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  const toggleProfileMenu = () => {
    setShowProfileMenu((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function confirmLogout() {
    setShowLogoutModal(false);
    setShowProfileMenu(false);
    
    // Clear local authentication state and trigger identity redirect
    logout();
  }

  const handleLogoutRequest = () => {
    setShowProfileMenu(false);
    setShowLogoutModal(true);
  };

  return (
    <>
      <Styled.TopBlueBar>
        <Styled.HamburgerButton onClick={onMenuClick}>
          <Styled.HamburgerLine />
          <Styled.HamburgerLine />
          <Styled.HamburgerLine />
        </Styled.HamburgerButton>

        {pageTitle && (
          <Styled.AppTitle>
            <Styled.TitleGroup>
              <Styled.ActiveTab>{pageTitle}</Styled.ActiveTab>
            </Styled.TitleGroup>
          </Styled.AppTitle>
        )}

        {/* <DictionaryFileUploader /> */}

        <Styled.LogoutContainer ref={profileRef}>
          <Styled.ProfileButton onClick={toggleProfileMenu}>
            <Styled.AvatarCircle>
              {userId ? (() => {
                const fullName = localStorage.getItem("fullName");
                const nameToUse = fullName || userId;
                
                // Strip domain prefix if it exists (e.g. ATHENATEC\)
                const cleanName = nameToUse.split('\\').pop() || nameToUse;
                const parts = cleanName.trim().split(/[\s.]+/);
                
                if (parts.length >= 2) {
                  return (parts[0][0] + parts[1][0]).toUpperCase();
                }
                return cleanName.substring(0, 2).toUpperCase();
              })() : 'U'}
            </Styled.AvatarCircle>
          </Styled.ProfileButton>

          {showProfileMenu && (
            <Styled.ProfileMenu>
              <Styled.ProfileTitle>
                {Labels.header.signedInAs}
              </Styled.ProfileTitle>

              <Styled.ProfileSubtitle>
                {userId || Labels.header.guest}
              </Styled.ProfileSubtitle>

              {/* <Styled.MenuItem
                onClick={toggleLanguage}
              >
                <FiGlobe />
                {language === 'en' ? '日本語' : 'English'}
              </Styled.MenuItem> */}

              <Styled.MenuItem onClick={handleLogoutRequest}>
                <FiLogOut />
                {Labels.header.logout}
              </Styled.MenuItem>
            </Styled.ProfileMenu>
          )}
        </Styled.LogoutContainer>
      </Styled.TopBlueBar>

      <MessageModal
        $isOpen={showLogoutModal}
        message={Labels.header.confirmLogout}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
      />
    </>
  );
};

export default AppHeader;
