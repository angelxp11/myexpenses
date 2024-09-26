import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { auth, db } from './firebase';
import Login from './Login/login';
import Register from './Registro/Registro';
import Home from './Webusuario/home';
import AdminHome from './Webadmin/home';
import ProtectedRoute from './ProtectedRoute.js';
import 'react-toastify/dist/ReactToastify.css';
import './toast.css';

function App() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const adminDoc = await getDoc(doc(db, 'admin', user.email));
          setIsAdmin(adminDoc.exists());
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error verificando el rol de admin:', error);
        }
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/myexpenses/login"
          element={!isAuthenticated ? <Login /> : <Navigate to={isAdmin ? '/admin/home' : '/myexpenses'} />}
        />
        <Route
          path="/register"
          element={!isAuthenticated ? <Register /> : <Navigate to={isAdmin ? '/admin/home' : '/myexpenses'} />}
        />
        <Route
          path="/myexpenses"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated && !isAdmin}>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/home"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated && isAdmin} redirectPath="/login">
              <AdminHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={
            <Navigate to={isAuthenticated ? "/myexpenses" : "/login"} />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
