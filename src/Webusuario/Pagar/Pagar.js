import React, { useState, useRef, useEffect } from 'react';
import './Pagar.css';
import { auth, db } from '../../firebase';
import { query, where, getDocs, collection, doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Pagar({ onClose, onPaymentComplete }) {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDescription, setPaymentDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef(null);

  const formatAmount = (amount) => {
    return amount.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handlePaymentChange = (e) => {
    const value = e.target.value.replace(/,/g, '');
    setPaymentAmount(formatAmount(value));
  };

  const handlePaymentDescriptionChange = (e) => {
    const inputValue = e.target.value;
    const words = inputValue.split(' ').filter(word => word.length > 0);
    if (words.length <= 100) {
      setPaymentDescription(inputValue);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return; // Prevent multiple submissions

    setIsSubmitting(true);
    const paymentValue = parseFloat(paymentAmount.replace(/,/g, ''));

    if (isNaN(paymentValue) || paymentValue <= 0) {
      toast.error('El monto de pago debe ser un número positivo.', {
        autoClose: 3000
      });
      setIsSubmitting(false);
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

            if (paymentValue > currentSaldo) {
              toast.error(`No tienes suficiente dinero, tu saldo es $${currentSaldo.toFixed(2)}`, {
                autoClose: 3000
              });
              setIsSubmitting(false);
              return;
            }

            const newSaldo = currentSaldo - paymentValue;

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
                  valor: paymentValue,
                  descripcion: paymentDescription,
                  saldoAnterior: currentSaldo,
                  fechaHora: `${formattedDateDisplay} ${time}`,
                  tipo: 'pago'
                }
              }
            }, { merge: true });

            if (onPaymentComplete) onPaymentComplete();

            toast.success(`Haz pagado exitosamente con un valor de $${paymentValue.toFixed(2)}`, {
              autoClose: 3000
            });

            setTimeout(() => {
              setPaymentAmount('');
              setPaymentDescription('');
              handleCancel();
            }, 2000);
          });
        } else {
          toast.error('No se encontró ningún documento con el correo electrónico proporcionado.', {
            autoClose: 3000
          });
        }
      } catch (error) {
        toast.error('Error al buscar el documento en la colección usuarios o al actualizar el saldo.', {
          autoClose: 3000
        });
        console.error('Error:', error);
      }
    }

    // Re-enable the button after 10 seconds
    setTimeout(() => {
      setIsSubmitting(false);
    }, 10000);
  };

  const handleCancel = () => {
    if (formRef.current) {
      formRef.current.classList.add('zoom-out');
      setTimeout(() => {
        onClose();
      }, 150);
    } else {
      onClose();
    }
  };

  return (
    <div className="overlay">
      <form ref={formRef} className="payment-form" onSubmit={handlePaymentSubmit}>
        <label htmlFor="payment-amount">¿Cuánto vas a pagar?</label>
        <input
          id="payment-amount"
          type="text"
          value={paymentAmount}
          onChange={handlePaymentChange}
          placeholder="Monto"
          required
        />
        <label htmlFor="payment-description">Descripción (máx. 100 palabras):</label>
        <textarea
          id="payment-description"
          value={paymentDescription}
          onChange={handlePaymentDescriptionChange}
          placeholder="Descripción"
          rows="4"
        />
        <div className="button-group">
          <button
            type="submit"
            disabled={isSubmitting}
            className={isSubmitting ? 'disabled' : ''}
          >
            Confirmar
          </button>
          <button type="button" onClick={handleCancel}>Cancelar</button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
}

export default Pagar;
