import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ isAuthenticated, redirectPath = '/myexpenses', children }) {
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} />;
  }

  return children;
}

export default ProtectedRoute;
