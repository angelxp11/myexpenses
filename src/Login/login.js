import React, { useState } from 'react';
import './login.css';
import { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, fetchSignInMethodsForEmail, doc, setDoc, getDoc } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Login() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (isRegistering) {
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

        await setDoc(doc(db, 'usuarios', user.uid), {
          nombre: name,
          telefono: phone,
          email: email,
        });
        toast.success('Te has registrado correctamente');
        navigate('/user/home');
      } catch (err) {
        setError('Error al registrarse. Por favor, intenta de nuevo.');
        console.error(err);
      }
    } else {
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
    }

    setLoading(false);
  };

  const handleForgotPassword = () => {
    toast.info('Email enviado');
  };

  const handleToggleMode = () => {
    setName('');
    setPhone('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setIsRegistering(!isRegistering);
  };

  return (
    <div className="login-container">
      <h1 className="login-title">{isRegistering ? 'Regístrate' : 'Iniciar sesión'}</h1>
      <form className="login-form" onSubmit={handleSubmit}>
        {isRegistering && (
          <>
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
          </>
        )}
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
        {isRegistering && (
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
        )}
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="login-button" disabled={loading}>
          {loading ? 'Cargando...' : isRegistering ? 'Registrarse' : 'Iniciar sesión'}
        </button>
        {!isRegistering && (
          <p className="forgot-password" onClick={handleForgotPassword}>
            Olvidé mi contraseña
          </p>
        )}
      </form>
      <p className="toggle-link" onClick={handleToggleMode}>
        {isRegistering ? 'Ya tengo cuenta, iniciar sesión' : 'No tienes una cuenta, regístrate'}
      </p>
      <ToastContainer />
    </div>
  );
}

export default Login;
