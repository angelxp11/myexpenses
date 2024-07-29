import React, { useState, useEffect } from 'react';
import './Registro.css';
import { auth, db, createUserWithEmailAndPassword, fetchSignInMethodsForEmail, doc, setDoc } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Registro() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Start animation when the component is loaded
    setAnimationClass('zoom-in');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validaciones
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }

    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length > 0) {
        setError('El correo electrónico ya está en uso. Por favor, usa otro.');
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Add user to Firestore with saldo initialized to 0
      await setDoc(doc(db, 'usuarios', user.uid), {
        nombre: name,
        telefono: phone,
        email: email,
        saldo: 0  // Initialize saldo with 0
      });

      // Add initial empty document to 'movimientos' collection
await setDoc(doc(db, 'movimientos', user.uid), {
});

      toast.success('Te has registrado correctamente');
      // Apply zoom-out animation before navigating
      setAnimationClass('zoom-out');
      setTimeout(() => {
        navigate('/user/home');
      }, 1000); // Duration of the zoom-out animation
    } catch (err) {
      setError('Ocurrió un error al registrarse. Por favor, intenta de nuevo.');
      console.error(err);
    }

    setLoading(false);
  };

  const handleLoginClick = () => {
    // Apply zoom-out animation before navigating
    setAnimationClass('zoom-out');
    setTimeout(() => {
      navigate('/login');
    }, 100); // Duration of the zoom-out animation
  };

  return (
    <div className="registro-container">
      <h1 className={`registro-title ${animationClass}`}>Regístrate</h1>
      <form className={`registro-form ${animationClass}`} onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Nombre:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Teléfono:</label>
          <input
            type="text"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Correo electrónico:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Contraseña:</label>
          <div className="password-group">
            <input
              type={passwordVisible ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setPasswordVisible(!passwordVisible)}
            >
              {passwordVisible ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="confirm-password">Confirmar contraseña:</label>
          <div className="password-group">
            <input
              type={confirmPasswordVisible ? 'text' : 'password'}
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
            >
              {confirmPasswordVisible ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="registro-button" disabled={loading}>
          {loading ? 'Cargando...' : 'Registrarse'}
        </button>
      </form>
      <p className="toggle-link">
        ¿Ya tienes cuenta? <a href="#" onClick={handleLoginClick} className={`login-link ${animationClass}`}>Iniciar sesión</a>
      </p>
      <ToastContainer />
    </div>
  );
}

export default Registro;
