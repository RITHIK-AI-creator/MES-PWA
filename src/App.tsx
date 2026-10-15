import React, { useState } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import SideNavBar, { NavLink } from "./components/SideNavBar";
import "@fortawesome/fontawesome-free/css/all.min.css";
import AppHeader from "./components/AppHeader";
import MainPageWrapper from "./Library/MainPageWrapper";
import Login from "./Pages/Login";
import FloatingKeypad from "./components/FloatingKeypad";
import InstallPrompt from "./components/PwaStatus/InstallPrompt";
import NetworkStatusBanner from "./components/PwaStatus/NetworkStatusBanner";

function App() {
  const location = useLocation();
  const [showSidebar, setShowSidebar] = useState(false);

  const hideHeaderRoutes:string[] = ["/"]; // add more if needed

  const shouldHideHeader = hideHeaderRoutes.includes(location.pathname);
  return (
    <>
      <NetworkStatusBanner />
      <InstallPrompt />
      <FloatingKeypad />
      {!shouldHideHeader && (
        <>
          <AppHeader onMenuClick={() => setShowSidebar(true)} />
          <SideNavBar showOverlay={showSidebar} setShowOverLay={setShowSidebar} />
        </>
      )}

      <Routes>
        {NavLink.flatMap((routes) => {
          const mainRoute = (
            <Route
              key={routes.path}
              path={routes.path}
              element={
                <ProtectedRoute>
                  <MainPageWrapper pageTitle={routes.title}>
                    {routes.component}
                  </MainPageWrapper>
                </ProtectedRoute>
              }
            />
          );

          const subRoutes = routes.subLinks
            ? routes.subLinks.map((sub) => (
                <Route
                  key={sub.path}
                  path={sub.path}
                  element={
                    <MainPageWrapper pageTitle={sub.title}>
                      {sub.component}
                    </MainPageWrapper>
                  }
                />
              ))
            : [];

          return [mainRoute, ...subRoutes];
        })}

        <Route
          path="/"
          element={
            <ProtectedRoute isLoginPage>
              <Login />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
