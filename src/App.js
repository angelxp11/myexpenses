import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { auth, db } from './firebase';
import Login from './Login/login';
import Register from './Registro/Registro';
import Home from './Webusuario/home';
import AdminHome from './Webadmin/home';
import 'react-toastify/dist/ReactToastify.css'; // Estilos predeterminados de react-toastify
import './toast.css'; // Importa tus estilos personalizados para los toasts

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
          path="/login"
          element={!isAuthenticated ? <Login /> : <Navigate to={isAdmin ? '/admin/home' : '/myexpenses'} />}
        />
        <Route
          path="/register"
          element={!isAuthenticated ? <Register /> : <Navigate to={isAdmin ? '/admin/home' : '/myexpenses'} />}
        />
        <Route
          path="/user/home"
          element={isAuthenticated && !isAdmin ? <Navigate to="/myexpenses" /> : <Navigate to="/login" />}
        />
        <Route
          path="/myexpenses"
          element={isAuthenticated && !isAdmin ? <Home /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin/home"
          element={isAuthenticated && isAdmin ? <AdminHome /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
