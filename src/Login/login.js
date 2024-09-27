import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Configuración de Firebase
const auth = getAuth();
const db = getFirestore();

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const adminDoc = await getDoc(doc(db, 'admin', user.email));
      if (adminDoc.exists()) {
        navigate('/admin/home');
      } else {
        navigate('/user/home');
      }
    } catch (err) {
      setError('Error en el inicio de sesión. Por favor, verifica tus credenciales.');
      console.error(err);
    }

    setLoading(false);
  };

  const handleForgotPassword = () => {
    toast.info('Email enviado');
  };

  const handleRegisterClick = () => {
    setAnimationClass('zoom-out');
    setTimeout(() => {
      navigate('/myexpenses/register');
    }, 100);  // Duration of the zoom-out animation
  };

  return (
    <div className="login-container">
      <h1 className={`login-title ${animationClass}`}>Iniciar sesión</h1>
      <form className={`login-form ${animationClass}`} onSubmit={handleSubmit}>
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
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="login-button" disabled={loading}>
          {loading ? 'Cargando...' : 'Iniciar sesión'}
        </button>
        <p className="forgot-password" onClick={handleForgotPassword}>
          Olvidé mi contraseña
        </p>
      </form>
      <p className="toggle-link">
        No tienes una cuenta, <a href="#" onClick={handleRegisterClick} className={`register-link ${animationClass}`}>
          Regístrate
        </a>
      </p>
      <ToastContainer />
    </div>
  );
}

export default Login;
