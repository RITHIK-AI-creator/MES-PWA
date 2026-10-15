import React, { useState } from "react";
import * as Styled from "./indesx.styled";
import { ActiveTab, useAppContext } from "../../context/AppContext";
import MaterialList from "../../Pages/MaterialList";
import MaterialPage from "../../Pages/Material";
import HoldPage from "../../Pages/Hold";
import { useNavigate, useLocation } from "react-router-dom";
import { FaSquare, FaBox,FaPause,FaUpload,FaExpand,FaCompress,FaCompressArrowsAlt,FaCodeBranch,FaPlus,FaMinus,FaRecycle,FaUndo} from "react-icons/fa";
import ReleasePage from "../../Pages/Release";
import ExpandPage from "../../Pages/Expand";
import CollapsePage from "../../Pages/Collapse";
import MergePage from "../../Pages/Merge";
import SplitPage from "../../Pages/Split";
import RecordLossPage from "../../Pages/RecordLossBonus/RecordLoss";
import RecordBonusPage from "../../Pages/RecordLossBonus/RecordBonus";
import ReworkPage from "../../Pages/Rework";
import TemporaryOffFlowPage from  "../../Pages/TemporaryOffFlow";
interface SideNavBarProps {
  setShowOverLay: React.Dispatch<React.SetStateAction<boolean>>;
  showOverlay: boolean;
}

export interface NavSubLink {
  title: string;
  path: string;
  key: string;
  component: React.ReactElement;
}

export interface NavLinkItem {
  title: string;
  key: ActiveTab;
  path: string;
  component: React.ReactElement;
  icon: React.ReactNode;
  subLinks?: NavSubLink[];
}

export const NavLink: NavLinkItem[] = [
  {
    title: "Material List",
    key: "Materials",
    path: "/Materials",
    component: <MaterialList />,
    icon: <FaSquare style={{ color: 'var(--mes-primary-600)', fontSize: '1.1em' }} />,
  },
  {
    title: "Material Processing",
    key: "Material",
    path: "/Material",
    component: <MaterialPage />,
    icon: <FaBox style={{ color: 'var(--mes-primary-600)', fontSize: '1.1em' }} />,
  },
   {
    title: "Hold",
    key: "Hold",
    path: "/Hold",
    component: <HoldPage />,
    icon: <FaPause style={{ color: 'var(--mes-primary-600)', fontSize: '1.1em' }} />,
  },
    {
    title: "Release",
    key: "Release",
    path: "/Release",
    component: <ReleasePage />,
    icon: <FaUpload style={{ color: 'var(--mes-primary-600)', fontSize: '1.1em' }} />,
  },
  {
    title: "Expand",
    key: "Expand",
    path: "/Expand",
    component: <ExpandPage />,
    icon: <FaExpand style={{ color: 'var(--mes-primary-600)', fontSize: '1.1em' }} />,
  },
   {
    title: "Collapse",
    key: "Collapse",
    path: "/Collapse",
    component: <CollapsePage />,
    icon: <FaCompress  style={{ color: 'var(--mes-primary-600)', fontSize: '1.1em' }} />,
  },
  {
    title: "Split",
    key: "Split",
    path: "/Split",
    component: <SplitPage />,
    icon: <FaCodeBranch  style={{ color: 'var(--mes-primary-600)', fontSize: '1.1em' }} />,
  },
     {
    title: "Merge",
    key: "Merge",
    path: "/Merge",
    component: <MergePage />,
    icon: <FaCompressArrowsAlt  style={{ color: 'var(--mes-primary-600)', fontSize: '1.1em' }} />,
  },
  {
  title: "Record Loss/Bonus",
  key: "RecordLossBonus",
  path: "/RecordLossBonus",
  component: <></>,
  icon: (
    <>
      <FaPlus style={{ color: 'var(--mes-primary-600)', fontSize: '1.1em' }} />
       <span style={{ margin: '0 2px' }}>/</span>
      <FaMinus style={{ color: 'var(--mes-primary-600)', fontSize: '1.1em' }} />
    </>
  ),
  subLinks: [
    {
      title: "Material Loss",
      path: "/Loss",
      key: "Loss",
      component: <RecordLossPage />,
    },
    {
      title: "Material Bonus",
      path: "/Bonus",
      key: "Bonus",
      component: <RecordBonusPage />,
    },
  ],
},
 {
  title: "Off-Flow",
  key: "OffFlow",
  path: "/OffFlow",
  component: <></>,
  icon: (
    <>
      <FaUndo style={{ color: 'var(--mes-primary-600)', fontSize: '1.1em' }} />
    </>
  ),
  subLinks: [
    {
      title: "Rework",
      path: "/Rework",
      key: "Rework",
      component: <ReworkPage />,
    },
    {
      title: "TemporaryOffFlow",
      path: "/TemporaryOffFlow",
      key: "TemporaryOffFlow",
      component: <TemporaryOffFlowPage />,
    },
  ],
} 
];

export const HOME_PAGE = "/Material";

const SideNavBar = (props: SideNavBarProps) => {
  const { setShowOverLay, showOverlay } = props;
  const navigate = useNavigate();
  const location = useLocation();
  const { setActiveTab } = useAppContext();
const [isCombineExpanded, setIsCombineExpanded] = useState<string | null>(null);
  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setShowOverLay(false);
    }
  };

  const handleSidebarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  return (
    <>
      <Styled.SideBarOverlay $isOpen={showOverlay} onClick={handleOutsideClick}>
        <Styled.SidebarMenu onClick={handleSidebarClick} $isOpen={showOverlay}>
          <Styled.SidebarHeader>
            <div>
              <Styled.SidebarTitle>{"Menu"}</Styled.SidebarTitle>
            </div>
            <Styled.SidebarCloseButton onClick={() => setShowOverLay(false)}>
              X
            </Styled.SidebarCloseButton>
          </Styled.SidebarHeader>
          <Styled.MenuContent>
            <Styled.SidebarMenuItems>
              {NavLink?.map((item) => {
                const hasSubLinks = !!item.subLinks;
                const isParentActive = location.pathname === item.path || !!(item.subLinks && item.subLinks.some(sub => location.pathname === sub.path));
             const isExpanded = isCombineExpanded === item.key;
                return (
                  <React.Fragment key={item.key}>
                    <Styled.SidebarMenuItem
                      onClick={() => {
                        if (hasSubLinks) {
                          // setIsCombineExpanded(!isCombineExpanded);
                           setIsCombineExpanded(
      isCombineExpanded === item.key ? null : item.key
    );
                        } else {
                          setActiveTab(item.key);
                          setShowOverLay(false);
                          navigate(item.path);
                        }
                      }}
                    >
                      <Styled.SidebarMenuLink
                        $isActive={isParentActive}
                      >
                        <Styled.SidebarIcon
                          $isActive={isParentActive}
                        >
                          {item.icon}
                        </Styled.SidebarIcon>
                        {item.title}
                        {/* {t(`nav.${item.title}`)} */}
                        {hasSubLinks && (
                          <Styled.TriangleIcon  $isOpen={isExpanded}>
                            ▼
                          </Styled.TriangleIcon>
                        )}
                      </Styled.SidebarMenuLink>
                    </Styled.SidebarMenuItem>

                    {item.subLinks && (
                      <Styled.SubMenuContainer $isOpen={isExpanded}>
                        {item.subLinks.map((sub) => {
                          const isSubActive = location.pathname === sub.path;
                          return (
                            <Styled.SubMenuItem
                              key={sub.key}
                              $isActive={isSubActive}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveTab(item.key);
                                setShowOverLay(false);
                                navigate(sub.path);
                              }}
                            >
                              {/* {t(`nav.${sub.title}`)}
                               */}
                               {sub.title}
                            </Styled.SubMenuItem>
                          );
                        })}
                      </Styled.SubMenuContainer>
                    )}
                  </React.Fragment>
                );
              })}
            </Styled.SidebarMenuItems>
          </Styled.MenuContent>
        </Styled.SidebarMenu>
      </Styled.SideBarOverlay>
    </>
  );
};

export default SideNavBar;
