import React, { useEffect, useState } from 'react';
import './home.css';
import { auth, db } from '../firebase'; // Ajusta la ruta según tu configuración
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';

function Home() {
  const [userName, setUserName] = useState('');
  const [balance, setBalance] = useState(0); // Estado para el saldo
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserName = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const fullName = userData.nombre || '';
            const firstName = fullName.split(' ')[0]; // Obtiene el primer nombre
            setUserName(firstName);

            // Obtener saldo del usuario (ajusta según tu estructura de datos)
            const userBalance = userData.saldo || 0;
            setBalance(userBalance);
          }
        } catch (error) {
          console.error('Error al obtener el nombre del usuario:', error);
        }
      }
    };

    fetchUserName();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login'); // Redirige al login después de cerrar sesión
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="home-container">
      <h1 className="welcome-message">¡Hola de nuevo {userName} !🥹</h1>
      <p className="balance-text">Saldo: ${balance}</p>
      
      <div className="buttons-container">
        <button className="action-button">Recargar</button>
        <button className="action-button">Pagar</button>
        <button className="action-button">Ver movimientos</button>
      </div>

      <button className="signout-button" onClick={handleSignOut}>
        Cerrar sesión
      </button>
    </div>
  );
}

export default Home;
