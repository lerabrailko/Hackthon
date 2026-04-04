import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants/routes';

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div style={{ height: '100vh', backgroundColor: 'var(--bg-dark)' }}></div>;
  }

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  return children;
};

export default ProtectedRoute;