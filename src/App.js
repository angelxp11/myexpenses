import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { auth, db } from './firebase';
import Login from './Login/login';
import Register from './Registro/Registro';
import Home from './Webusuario/home';
import AdminHome from './Webadmin/home';
import ProtectedRoute from './ProtectedRoute.js'; // Importa el componente de rutas protegidas
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
        {/* Si intentas acceder a cualquier otra ruta redirige a /myexpenses si está autenticado, o a /login si no lo está */}
        <Route
          path="*"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} redirectPath="/login">
              <Navigate to="/myexpenses" />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
