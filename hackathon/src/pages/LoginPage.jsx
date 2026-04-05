import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { ROUTES } from '../constants/routes';
import { validateRequired, validatePassword } from '../utils/validators';

const LoginPage = () => {
  const { t } = useLang();
  const { user, login, register } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to={ROUTES.DASHBOARD || '/'} replace />;
  }

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CUSTOMER');

  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const newErrors = {};

    if (!validateRequired(username)) {
      newErrors.username = "This field is required";
    }

    if (!validateRequired(password)) {
      newErrors.password = "This field is required";
    } else if (isRegisterMode && !validatePassword(password)) {
      setError("Password must be at least 6 characters long.");
      newErrors.password = "Password too short";
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      if (isRegisterMode) {
        await register(username, password, role);
      } else {
        await login(username, password);
      }
      navigate(ROUTES.DASHBOARD || '/');
    } catch (err) {
      setError(err.message || 'Access Denied. Invalid credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card-container animate-in">

        <div className="auth-header">
          <h1 className="auth-title">
            {isRegisterMode ? (t('register_btn') || 'Register') : 'DispatchX'}
          </h1>
          <p className="auth-subtitle">Authentication System</p>
        </div>

        <form onSubmit={handleSubmit} className="settings-section" noValidate>
          {error && (
            <div className="auth-error-msg">
              {error}
            </div>
          )}

          <div className="settings-form-group">
            <label className="settings-label">
              {isRegisterMode ? (t('create_id') || 'NEW LOGIN ID') : (t('login_id') || 'LOGIN ID')}
            </label>
            <input
              className={`settings-input ${fieldErrors.username ? 'input-error' : ''}`}
              value={username}
              onChange={e => { setUsername(e.target.value); setFieldErrors(prev => ({ ...prev, username: null })); setError(''); }}
              placeholder={isRegisterMode ? "Create an ID" : (t('enter_id') || "Enter ID")}
            />
            {fieldErrors.username && <span className="field-error-text">{fieldErrors.username}</span>}
          </div>

          <div className="settings-form-group">
            <label className="settings-label">{t('password') || 'PASSWORD'}</label>
            <input
              className={`settings-input ${fieldErrors.password ? 'input-error' : ''}`}
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setFieldErrors(prev => ({ ...prev, password: null })); setError(''); }}
              placeholder={isRegisterMode ? "Create a Password" : "Enter Password"}
            />
            {fieldErrors.password && <span className="field-error-text">{fieldErrors.password}</span>}
          </div>

          {isRegisterMode && (
            <div className="settings-form-group">
              <label className="settings-label">{t('your_role') || 'YOUR ROLE'}</label>
              <select
                className="settings-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="CUSTOMER">{t('role_client') || 'Client'}</option>
                <option value="DISPATCHER">{t('role_dispatcher') || 'Dispatcher'}</option>
              </select>
            </div>
          )}

          <div className="settings-submit-wrapper mt-large">
            <button
              className={`settings-btn-save auth-submit-btn ${isSubmitting ? 'processing' : ''}`}
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (t('processing') || 'PROCESSING...') : (isRegisterMode ? (t('register_btn') || 'REGISTER') : (t('login_btn') || 'LOGIN'))}
            </button>
          </div>
        </form>

        <div className="auth-toggle-wrapper">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setError('');
              setFieldErrors({});
              setUsername('');
              setPassword('');
            }}
            className="auth-toggle-btn"
          >
            {isRegisterMode ? (t('link_login') || 'Already have an account? Login') : (t('link_register') || "Don't have an account? Register")}
          </button>
        </div>

        {!isRegisterMode && (
          <div className="auth-hints text-center mt-small">
            Try credentials: admin/123, disp/123, client/123, driver/123
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;