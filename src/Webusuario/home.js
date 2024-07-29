import React, { useEffect, useState } from 'react';
import './home.css';
import { auth, db } from '../firebase'; // Ajusta la ruta según tu configuración
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Recargar from '../Webusuario/Recargar/Recargar'; // Ajusta la ruta según tu configuración
import Pagar from '../Webusuario/Pagar/Pagar'; // Ajusta la ruta según tu configuración
import Movimientos from './VerMovimientos/Movimientos'; // Ajusta la ruta según tu configuración

function Home() {
  const [userName, setUserName] = useState('');
  const [balance, setBalance] = useState('0'); // Estado para el saldo como string
  const [showRechargeForm, setShowRechargeForm] = useState(false); // Estado para mostrar el formulario de recarga
  const [showPaymentForm, setShowPaymentForm] = useState(false); // Estado para mostrar el formulario de pago
  const [showMovimientos, setShowMovimientos] = useState(false); // Estado para mostrar el componente de movimientos
  const [movimientos, setMovimientos] = useState([]); // Estado para los movimientos

  useEffect(() => {
    const fetchUserNameAndBalance = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const fullName = userData.nombre || '';
            const firstName = fullName.split(' ')[0]; // Obtiene el primer nombre
            setUserName(firstName);

            // Obtener saldo del usuario y formatearlo
            const userBalance = userData.saldo || 0;
            setBalance(userBalance.toLocaleString()); // Formatea el saldo
          }
        } catch (error) {
          console.error('Error al obtener el nombre del usuario y saldo:', error);
        }
      }
    };

    fetchUserNameAndBalance();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // Redirige al login después de cerrar sesión
      window.location.href = '/login';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleRechargeClick = () => {
    setShowRechargeForm(!showRechargeForm); // Muestra u oculta el formulario de recarga
    setShowPaymentForm(false); // Oculta el formulario de pago si estaba visible
    setShowMovimientos(false); // Oculta el componente de movimientos si estaba visible
  };

  const handlePaymentClick = () => {
    setShowPaymentForm(!showPaymentForm); // Muestra u oculta el formulario de pago
    setShowRechargeForm(false); // Oculta el formulario de recarga si estaba visible
    setShowMovimientos(false); // Oculta el componente de movimientos si estaba visible
  };

  const handleMovimientosClick = () => {
    setShowMovimientos(!showMovimientos); // Muestra u oculta el componente de movimientos
    setShowRechargeForm(false); // Oculta el formulario de recarga si estaba visible
    setShowPaymentForm(false); // Oculta el formulario de pago si estaba visible

    if (!showMovimientos) {
      // Si estamos mostrando los movimientos, los cargamos
      const fetchMovimientos = async () => {
        const user = auth.currentUser;
        if (user) {
          try {
            const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              // Obtener movimientos del usuario
              const movimientosData = userData.movimientos || [];
              setMovimientos(movimientosData);
            }
          } catch (error) {
            console.error('Error al obtener los movimientos del usuario:', error);
          }
        }
      };

      fetchMovimientos();
    }
  };

  const handleCloseRechargeForm = () => {
    setShowRechargeForm(false); // Oculta el formulario de recarga
  };

  const handleClosePaymentForm = () => {
    setShowPaymentForm(false); // Oculta el formulario de pago
  };

  const handleRechargeComplete = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const userBalance = userData.saldo || 0;
          setBalance(userBalance.toLocaleString()); // Actualiza y formatea el saldo
        }
      } catch (error) {
        console.error('Error al obtener el saldo actualizado del usuario:', error);
      }
    }
  };

  return (
    <div className="home-container">
      <h1 className="welcome-message">¡Hola de nuevo {userName} !🥹</h1>
      <p className="balance-text">Saldo: ${balance}</p>
      
      <div className="buttons-container">
        <button className="action-button" onClick={handleRechargeClick}>
          Recargar
        </button>
        <button className="action-button" onClick={handlePaymentClick}>
          Pagar
        </button>
        <button className="action-button" onClick={handleMovimientosClick}>
          Ver movimientos
        </button>
      </div>

      {showRechargeForm && <Recargar onClose={handleCloseRechargeForm} onRechargeComplete={handleRechargeComplete} />}
      {showPaymentForm && <Pagar onClose={handleClosePaymentForm} onPaymentComplete={handleRechargeComplete} />}
      {showMovimientos && <Movimientos movimientos={movimientos} onClose={() => setShowMovimientos(false)} />}

      <button className="signout-button" onClick={handleSignOut}>
        Cerrar sesión
      </button>
    </div>
  );
}

export default Home;
