import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HOME_PAGE } from './SideNavBar';

interface ProtectedRouteProps {
  children: React.ReactNode;
  isLoginPage?: boolean;
}

const ProtectedRoute = ({ children, isLoginPage }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated && !isLoginPage) {
    return <Navigate to="/" replace />;
  }

  if (isAuthenticated && isLoginPage) {
    return <Navigate to={HOME_PAGE} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

