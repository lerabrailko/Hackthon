import React, { useState } from 'react';
import { CustomSelect } from '../../ui/CustomSelect';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useLang } from '../../../context/LanguageContext';
import { ROUTES } from '../../../constants/routes';
import { validateRequired, validatePassword } from '../../../utils/validators';

const LoginForm = () => {
  const { t } = useLang();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CUSTOMER');
  
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const newErrors = {};

    if (!validateRequired(username)) {
      newErrors.username = t('error_required') || 'Please enter your ID.';
    }
    
    if (!validateRequired(password)) {
      newErrors.password = t('error_required') || 'Please enter your password.';
    } else if (isRegisterMode && !validatePassword(password)) {
      setError(t('error_password_length') || 'Password must be at least 6 characters long.');
      newErrors.password = t('error_short_pass') || 'Password too short';
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    setFieldErrors({});
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
    <div className="auth-card-container animate-in">
      <div className="auth-header">
        <div className="auth-logo-wrapper">
          <div className="auth-logo"></div>
        </div>
        <h1 className="auth-title">
          {isRegisterMode ? (t('register_btn') || 'Register') : (t('login_title') || 'DispatchX Login')}
        </h1>
        <p className="auth-subtitle">Authentication System</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="settings-section">
        {error && (
          <div className="auth-error-msg">
            {error}
          </div>
        )}

        <div className="settings-form-group">
          <label className="settings-label">
            {isRegisterMode ? (t('new_login_id') || 'NEW LOGIN ID') : (t('login_id') || 'LOGIN ID')}
          </label>
          <input
            type="text"
            className={`settings-input ${fieldErrors.username ? 'input-error' : ''}`}
            value={username}
            onChange={(e) => { setUsername(e.target.value); setFieldErrors(prev => ({ ...prev, username: '' })); setError(''); }}
            placeholder={isRegisterMode ? (t('create_id') || 'Create an ID') : (t('enter_id') || 'Enter ID')}
          />
          {fieldErrors.username && <span className="field-error-text">{fieldErrors.username}</span>}
        </div>

        <div className="settings-form-group">
          <label className="settings-label">{t('password') || 'PASSWORD'}</label>
          <input
            type="password"
            className={`settings-input ${fieldErrors.password ? 'input-error' : ''}`}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setFieldErrors(prev => ({ ...prev, password: '' })); setError(''); }}
            placeholder={isRegisterMode ? (t('create_password') || 'Create a Password') : (t('enter_password') || 'Enter Password')}
          />
          {fieldErrors.password && <span className="field-error-text">{fieldErrors.password}</span>}
        </div>

        {isRegisterMode && (
          <div className="settings-form-group">
            <label className="settings-label">{t('your_role') || 'YOUR ROLE'}</label>
            <CustomSelect className="settings-select" style={{height: "45px"}} value={role} onChange={(e) => setRole(e.target.value)} options={[{value:"CUSTOMER", label:"Customer / Requester"}, {value:"DRIVER", label:"Driver / Courier"}, {value:"DISPATCHER", label:"Dispatcher Hub"}, {value:"ADMIN", label:"System Administrator"}]} />
          </div>
        )}

        <div className="settings-submit-wrapper mt-large">
          <button
            type="submit" 
            disabled={isSubmitting}
            className={`settings-btn-save auth-submit-btn ${isSubmitting ? 'processing' : ''}`}
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
          {t('login_hints') || 'Try: admin/123, disp/123, client/123, driver/123'}
        </div>
      )}
    </div>
  );
};

export default LoginForm;