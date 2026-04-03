import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [name, setName] = useState('');
  const { login } = useAuth();

  const handleTestLogin = (e) => {
    e.preventDefault();
    login(name, '123').catch(err => console.error(err.message)); 
  };

  return (
    <div className="auth-wrapper">
      <form className="auth-card" onSubmit={handleTestLogin}>
        <h1>Right Direction</h1>
        <input 
          className="settings-input" 
          placeholder="Enter ID (e.g. admin)" 
          value={name} 
          onChange={e => setName(e.target.value)} 
        />
        <button type="submit" className="settings-btn-save">LOGIN</button>
      </form>
    </div>
  );
};

export default LoginPage;