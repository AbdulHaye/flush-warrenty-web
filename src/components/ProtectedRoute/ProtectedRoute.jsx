import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('contactId');

  if (!isAuthenticated) {
    return <Navigate to="/my-account" replace />;
  }

  return children;
};

export default ProtectedRoute;