import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { auth, db } from './firebase'; // Asegúrate de que esta ruta es correcta
import Login from './Login/login';
import Register from './Registro/Registro'; // Asegúrate de que esta ruta es correcta
import Home from './Webusuario/home';
import AdminHome from './Webadmin/home'; // Asegúrate de que esta ruta es correcta
import 'react-toastify/dist/ReactToastify.css'; // Estilos predeterminados de react-toastify
import './toast.css'; // Importa tus estilos personalizados para los toasts

function App() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Verifica si el usuario es admin
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
          element={!isAuthenticated ? <Login /> : <Navigate to={isAdmin ? '/admin/home' : '/user/home'} />}
        />
        <Route
          path="/register"
          element={!isAuthenticated ? <Register /> : <Navigate to={isAdmin ? '/admin/home' : '/user/home'} />}
        />
        <Route
          path="/user/home"
          element={isAuthenticated && !isAdmin ? <Home /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin/home"
          element={isAuthenticated && isAdmin ? <AdminHome /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to="/login" />} />
        {/* Define otras rutas aquí */}
      </Routes>
    </Router>
  );
}

export default App;
