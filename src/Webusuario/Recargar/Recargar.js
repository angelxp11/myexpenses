import React, { useState, useRef } from 'react';
import './Recargar.css';
import { auth, db } from '../../firebase';
import { query, where, getDocs, collection, doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Recargar({ onClose, onRechargeComplete }) {
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [rechargeDescription, setRechargeDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const formRef = useRef(null);

  const formatAmount = (amount) => {
    return amount.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleRechargeChange = (e) => {
    const value = e.target.value.replace(/,/g, '');
    setRechargeAmount(formatAmount(value));
  };

  const handleRechargeDescriptionChange = (e) => {
    const inputValue = e.target.value;
    const words = inputValue.split(' ').filter(word => word.length > 0);
    if (words.length <= 100) {
      setRechargeDescription(inputValue);
    }
  };

  const handleRechargeSubmit = async (e) => {
    e.preventDefault();

    if (isProcessing) return; // Si ya está en proceso, no hacer nada

    setIsProcessing(true); // Deshabilitar botones
    const rechargeValue = parseFloat(rechargeAmount.replace(/,/g, ''));

    if (isNaN(rechargeValue) || rechargeValue <= 0) {
      toast.error('El monto de recarga debe ser un número positivo.', {
        autoClose: 3000 // 3000 milisegundos = 3 segundos
      });
      setIsProcessing(false); // Habilitar botones de nuevo
      return;
    }

    const userEmail = auth.currentUser ? auth.currentUser.email : 'No autenticado';

    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, '0')}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getFullYear()}`;
    const formattedDateDisplay = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
    const time = now.toLocaleTimeString();
    const dateOnly = formattedDate;

    if (userEmail !== 'No autenticado') {
      try {
        const usuariosRef = collection(db, 'usuarios');
        const q = query(usuariosRef, where('email', '==', userEmail));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          querySnapshot.forEach(async (docSnapshot) => {
            const docId = docSnapshot.id;
            const docRef = doc(db, 'usuarios', docId);
            const currentSaldo = docSnapshot.data().saldo || 0;

            const newSaldo = currentSaldo + rechargeValue;

            await updateDoc(docRef, {
              saldo: newSaldo
            });

            const movimientosRef = doc(db, 'movimientos', docId);
            const movimientosDoc = await getDoc(movimientosRef);
            const movimientosData = movimientosDoc.exists() ? movimientosDoc.data() : {};
            const dateMovements = movimientosData[dateOnly] || {};
            const nextIndex = Object.keys(dateMovements).length + 1;
            const movimientoKey = `movimiento${nextIndex}`;

            await setDoc(movimientosRef, {
              [dateOnly]: {
                ...dateMovements,
                [movimientoKey]: {
                  valor: rechargeValue,
                  descripcion: rechargeDescription,
                  saldoAnterior: currentSaldo,
                  fechaHora: `${formattedDateDisplay} ${time}`,
                  tipo: 'recarga'
                }
              }
            }, { merge: true });

            if (onRechargeComplete) onRechargeComplete();

            toast.success(`Haz recargado exitosamente con un valor de $${rechargeValue.toFixed(2)}`, {
              autoClose: 3000 // 3000 milisegundos = 3 segundos
            });

            setTimeout(() => {
              setRechargeAmount('');
              setRechargeDescription('');
              handleCancel();
            }, 2000);
          });
        } else {
          toast.error('No se encontró ningún documento con el correo electrónico proporcionado.', {
            autoClose: 3000 // 3000 milisegundos = 3 segundos
          });
        }
      } catch (error) {
        toast.error('Error al buscar el documento en la colección usuarios o al actualizar el saldo.', {
          autoClose: 3000 // 3000 milisegundos = 3 segundos
        });
        console.error('Error:', error);
      }
    }

    setTimeout(() => {
      setIsProcessing(false); // Rehabilitar botones después de 12 segundos
    }, 12000);
  };

  const handleCancel = () => {
    if (formRef.current) {
      formRef.current.classList.add('zoom-out');
      setTimeout(() => {
        onClose();
      }, 150); // Tiempo de la animación de zoom-out
    } else {
      onClose();
    }
  };

  return (
    <div className="overlay">
      <form ref={formRef} className="recharge-form" onSubmit={handleRechargeSubmit}>
        <label htmlFor="recharge-amount">¿Cuánto vas a recargar?</label>
        <input
          id="recharge-amount"
          type="text"
          value={rechargeAmount}
          onChange={handleRechargeChange}
          placeholder="Monto"
          required
        />
        <label htmlFor="recharge-description">Descripción (máx. 100 palabras):</label>
        <textarea
          id="recharge-description"
          value={rechargeDescription}
          onChange={handleRechargeDescriptionChange}
          placeholder="Descripción"
          rows="4"
        />
        <div className="button-group">
          <button
            type="submit"
            disabled={isProcessing}
            className={isProcessing ? 'disabled' : ''}
          >
            Confirmar
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isProcessing}
            className={isProcessing ? 'disabled' : ''}
          >
            Cancelar
          </button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
}

export default Recargar;
