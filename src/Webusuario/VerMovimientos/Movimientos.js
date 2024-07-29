import React, { useEffect, useState, useRef } from 'react';
import './Movimientos.css';
import { auth, db } from '../../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Movimientos({ onClose }) {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const formRef = useRef(null);

  useEffect(() => {
    const fetchMovimientos = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();

            // Obtén el documento de movimientos para el usuario
            const movimientosRef = collection(db, 'movimientos');
            const q = query(movimientosRef, where('__name__', '==', user.uid));
            const querySnapshot = await getDocs(q);

            const movimientosData = [];

            querySnapshot.forEach((docSnapshot) => {
              const data = docSnapshot.data();
              Object.keys(data).forEach(date => {
                const dateMovements = data[date];
                Object.keys(dateMovements).forEach(movimientoKey => {
                  const movimiento = {
                    ...dateMovements[movimientoKey],
                    date: date,
                    key: movimientoKey,
                    fechaHoraJS: parseFechaHora(dateMovements[movimientoKey].fechaHora)
                  };
                  movimientosData.push(movimiento);
                });
              });
            });

            // Ordena los movimientos por fecha y hora (más reciente arriba)
            movimientosData.sort((a, b) => b.fechaHoraJS - a.fechaHoraJS);

            setMovimientos(movimientosData);
            setLoading(false);
          } else {
            toast.error('No se encontró información del usuario.');
            setLoading(false);
          }
        } catch (error) {
          console.error('Error al obtener los movimientos:', error);
          toast.error('Error al obtener los movimientos.');
          setLoading(false);
        }
      } else {
        toast.error('No hay usuario autenticado.');
        setLoading(false);
      }
    };

    fetchMovimientos();
  }, []);

  const parseFechaHora = (fechaHora) => {
    const [date, time, ampm] = fechaHora.split(' ');
    const [day, month, year] = date.split('/');
    const [hour, minute, second] = time.split(':');

    // Convertir a formato 24 horas
    let hour24 = parseInt(hour, 10);
    if (ampm === 'p. m.' && hour24 !== 12) hour24 += 12;
    if (ampm === 'a. m.' && hour24 === 12) hour24 = 0;

    // Formatear la fecha
    const formattedDate = `${year}-${month}-${day}T${hour24.toString().padStart(2, '0')}:${minute}:${second}`;

    return new Date(formattedDate);
  };

  const formatAmount = (amount) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleExpand = (key) => {
    setExpanded(expanded === key ? null : key);
  };

  // Agrupar movimientos por fecha
  const groupedMovimientos = movimientos.reduce((acc, mov) => {
    const dateKey = mov.fechaHoraJS.toLocaleDateString();
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(mov);
    return acc;
  }, {});

  const handleClose = () => {
    if (formRef.current) {
      formRef.current.classList.add('zoom-out');
      setTimeout(() => {
        onClose();
      }, 150); // Tiempo de la animación de zoom-out
    } else {
      onClose();
    }
  };

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="overlay">
      <div ref={formRef} className="movimientos-form">
        <button className="close-button" onClick={handleClose}>Cerrar</button>
        <h2>Movimientos</h2>
        <div className="movimientos-container">
          <ul className="movimientos-list">
            {Object.keys(groupedMovimientos).length > 0 ? (
              Object.keys(groupedMovimientos).map((date, index) => (
                <li key={index} className="movimiento-group">
                  <p className="fecha"><strong>Fecha:</strong> {date}</p>
                  {groupedMovimientos[date].map((movimiento, subIndex) => (
                    <div key={subIndex} className="movimiento-item" data-tipo={movimiento.tipo}>
                      <div className="movimiento-summary">
                        <p><strong>Valor:</strong> <span className={`valor ${movimiento.tipo}`}>${formatAmount(movimiento.valor)}</span></p>
                        <button 
                          className={`expand-button ${expanded === movimiento.key ? 'expanded' : ''}`} 
                          onClick={() => handleExpand(movimiento.key)}>
                          {expanded === movimiento.key ? '▲' : '▼'}
                        </button>
                      </div>
                      <div className={`movimiento-details ${expanded === movimiento.key ? 'visible' : ''}`}>
                        <p><strong>Descripción:</strong> {movimiento.descripcion}</p>
                        <p><strong>Fecha:</strong> {movimiento.fechaHora.split(' ')[0]}</p>
                        <p><strong>Hora:</strong> {movimiento.fechaHora.split(' ')[1]}</p>
                        <p><strong>Saldo Anterior:</strong> ${formatAmount(movimiento.saldoAnterior)}</p>
                        <p><strong>Tipo:</strong> {movimiento.tipo}</p>
                        <p><strong>Valor:</strong> <span className={`valor ${movimiento.tipo}`}>${formatAmount(movimiento.valor)}</span></p>
                      </div>
                    </div>
                  ))}
                </li>
              ))
            ) : (
              <p>No hay movimientos para mostrar.</p>
            )}
          </ul>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Movimientos;
