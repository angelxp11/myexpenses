import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ isAuthenticated, redirectPath = '/myexpenses/login', children }) {
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} />;
  }

  return children;
}

export default ProtectedRoute;
