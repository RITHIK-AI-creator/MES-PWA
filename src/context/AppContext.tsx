import { createContext, useContext, useEffect, useState } from "react";
import { NavLink } from "../components/SideNavBar";
import { useLocation } from "react-router-dom";

export type ActiveTab =
  | "Materials"
  | "Material"
  | "Hold"
  | "Release"
  | "Expand"
  | "Collapse"
  | "Split"
  | "RecordLossBonus"
  | "Merge"
  | "OffFlow"
  | "Eprocedure";
type CurrentEquipmentDetailsType = {
  equipment: string;
  bgColor: string;
};
type AppContextType = {
  activeTab: ActiveTab;
  setActiveTab: React.Dispatch<React.SetStateAction<ActiveTab>>;
  currentEquipmentDetails: CurrentEquipmentDetailsType;
  setCurrentEquipmentdetails: React.Dispatch<
    React.SetStateAction<CurrentEquipmentDetailsType>
  >;
};

export const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  const getActiveTabFromPath = (): ActiveTab => {
    const currentNav = NavLink.find((nav) =>
      location.pathname.startsWith(nav.path),
    );

    return currentNav?.key || "Materials";
  };

  const [activeTab, setActiveTab] = useState<ActiveTab>(getActiveTabFromPath());
  const [currentEquipmentDetails, setCurrentEquipmentdetails] =
    useState<CurrentEquipmentDetailsType>({
      equipment: "",
      bgColor: "",
    });
  useEffect(() => {
    setCurrentEquipmentdetails({
      equipment: "",
      bgColor: "",
    });
  }, [activeTab]);
  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        currentEquipmentDetails,
        setCurrentEquipmentdetails,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used inside AppProvider");
  }
  return context;
};
