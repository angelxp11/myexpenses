import React from 'react';
import './home.css';

function Home() {
  return (
    <div className="admin-home-container">
      <h1 className="admin-welcome-message">¡Bienvenido al panel de administración!</h1>
      <p className="admin-welcome-description">
        Aquí puedes gestionar la configuración de la aplicación y supervisar las actividades.
      </p>
    </div>
  );
}

export default Home;
