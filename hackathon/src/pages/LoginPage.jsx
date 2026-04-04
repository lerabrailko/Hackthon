import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants/routes';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(username, password);
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      console.error(err);
      setError(err.message); 
    }
  };

  return (
    <div className="auth-wrapper">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h1 className="auth-title">Right Direction</h1>
        
        {error && <div className="error-msg">{error}</div>}

        <div className="form-group">
          <label>LOGIN ID</label>
          <input 
            className="input" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            placeholder="e.g. admin"
          />
        </div>

        <div className="form-group">
          <label>PASSWORD</label>
          <input 
            type="password"
            className="input" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
          />
        </div>

        <button type="submit" className="btn-primary w-100">LOGIN</button>
      </form>
    </div>
  );
};

export default LoginPage;