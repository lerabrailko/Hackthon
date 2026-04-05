import React, { useState, useEffect, useRef } from 'react';
import { CustomSelect } from '../components/ui/CustomSelect';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext'; 
import { useNotify } from '../context/NotificationContext';
import { validateEmail, validatePhone, validatePassword, validateRequired } from '../utils/validators';

const DEFAULT_AVATAR = "/favicon.svg";

const SettingsPage = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const { lang, changeLanguage, theme, changeTheme, t } = useLang();
  const { showNotification } = useNotify();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [saveStatus, setSaveStatus] = useState('idle');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || null,
    role: user?.role || 'LOGISTICIAN'
  });

  const [notifs, setNotifs] = useState({
    email: user?.notifications?.email ?? true,
    sms: user?.notifications?.sms ?? false,
    push: user?.notifications?.push ?? false,
  });

  const [sec, setSec] = useState({
    twoFactor: user?.security?.twoFactor ?? false,
  });

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || null,
        role: user.role || 'LOGISTICIAN'
      });
      if (user.notifications) setNotifs(prev => ({ ...prev, email: user.notifications.email ?? true, sms: user.notifications.sms ?? false, push: user.notifications.push ?? false }));
      if (user.security) setSec(prev => ({ ...prev, twoFactor: user.security.twoFactor ?? false }));
    }
  }, [user]);

  const handlePushToggle = async (e) => {
    const isChecked = e.target.checked;
    setNotifs(prev => ({ ...prev, push: isChecked }));

    if (isChecked) {
      if (!('Notification' in window)) {
        showNotification('Browser does not support notifications', 'danger', true);
        setNotifs(prev => ({ ...prev, push: false }));
        return;
      }
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification('DispatchX', { body: t('push_enabled_msg'), icon: '/favicon.svg' });
        showNotification(t('push_enabled_msg'), 'success', true);
      } else {
        setNotifs(prev => ({ ...prev, push: false }));
        showNotification(t('push_blocked_msg'), 'danger', true);
      }
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, avatar: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordUpdate = async () => {
    const errors = {};
    if (!validateRequired(currentPassword)) errors.currentPassword = t('error_required') || 'Field is required';
    if (!validateRequired(newPassword)) errors.newPassword = t('error_required') || 'Field is required';
    else if (!validatePassword(newPassword)) errors.newPassword = t('error_password_length') || 'Password too short';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    
    setFieldErrors({});
    setIsUpdatingPassword(true);

    try {
      await changePassword(currentPassword, newPassword);
      showNotification('Password updated successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      if (error.message === 'INVALID_CURRENT_PASSWORD') {
        setFieldErrors({ currentPassword: 'Invalid current password' });
      } else {
        showNotification(error.message, 'danger');
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    const errors = {};
    if (!validateRequired(formData.name)) errors.name = t('error_required') || 'Field is required';
    if (formData.email && !validateEmail(formData.email)) errors.email = 'Invalid email address';
    if (formData.phone && !validatePhone(formData.phone)) errors.phone = 'Invalid phone number';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    
    setFieldErrors({});
    setSaveStatus('saving');
    
    setTimeout(() => {
      if (updateProfile) {
        updateProfile({ ...formData, notifications: notifs, security: sec });
      }
      setSaveStatus('success');
      showNotification(t('saved_success') || 'Changes saved!', 'success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 800);
  };

  return (
    <div className="settings-container animate-in">
      <h1 className="settings-header">{t('settings_title')}</h1>
      
      <div className="settings-tabs settings-tabs-scrollable">
        {['profile', 'appearance', 'notifications', 'security'].map((tab) => (
          <button 
            key={tab}
            className={`settings-tab-btn ${activeTab === tab ? 'active' : ''}`} 
            onClick={() => setActiveTab(tab)}
          >
            {t(`tab_${tab}`)}
          </button>
        ))}
      </div>

      <div className="settings-card settings-card-wide">
        <form onSubmit={handleSave} className="settings-section" noValidate>
          
          {activeTab === 'profile' && (
            <div className="animate-in">
              <div className="avatar-upload-container">
                <div 
                  className="avatar-preview" 
                  onClick={() => fileInputRef.current.click()}
                  style={{ 
                    overflow: 'hidden', 
                    padding: '10px', 
                    backgroundColor: 'var(--bg-dark)', 
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <img 
                    src={formData.avatar || DEFAULT_AVATAR} 
                    alt="Avatar" 
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
                <div className="avatar-actions">
                  <button type="button" onClick={() => fileInputRef.current.click()} className="settings-btn-save btn-small">
                    {t('upload_photo')}
                  </button>
                  {formData.avatar && (
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, avatar: null }))} className="btn-text-danger">
                      {t('remove_photo')}
                    </button>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden-input" />
                </div>
              </div>

              <div className="settings-grid">
                <div className="settings-form-group">
                  <label className="settings-label">{t('full_name')}</label>
                  <input 
                    type="text" 
                    className={`settings-input ${fieldErrors.name ? 'input-error' : ''}`} 
                    value={formData.name} 
                    onChange={(e) => { setFormData({...formData, name: e.target.value}); setFieldErrors({...fieldErrors, name: null}); }} 
                  />
                  {fieldErrors.name && <span className="field-error-text">{fieldErrors.name}</span>}
                </div>
                
                <div className="settings-form-group">
                  <label className="settings-label">{t('system_role')}</label>
                  <CustomSelect className="settings-select" style={{height: "45px"}} value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} options={[{value:"ADMIN", label:"System Admin"}, {value:"DISPATCHER", label:"Dispatcher"}, {value:"CUSTOMER", label:"Customer"}, {value:"DRIVER", label:"Driver"}]} />
                </div>

                <div className="settings-form-group">
                  <label className="settings-label">{t('email_label')}</label>
                  <input 
                    type="email" 
                    className={`settings-input ${fieldErrors.email ? 'input-error' : ''}`} 
                    value={formData.email} 
                    onChange={(e) => { setFormData({...formData, email: e.target.value}); setFieldErrors({...fieldErrors, email: null}); }} 
                  />
                  {fieldErrors.email && <span className="field-error-text">{fieldErrors.email}</span>}
                </div>
                
                <div className="settings-form-group">
                  <label className="settings-label">{t('phone_label')}</label>
                  <input 
                    type="tel" 
                    className={`settings-input ${fieldErrors.phone ? 'input-error' : ''}`} 
                    value={formData.phone} 
                    onChange={(e) => { setFormData({...formData, phone: e.target.value}); setFieldErrors({...fieldErrors, phone: null}); }} 
                  />
                  {fieldErrors.phone && <span className="field-error-text">{fieldErrors.phone}</span>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="animate-in settings-section-spaced">
              <div className="settings-form-group">
                <label className="settings-label">{t('lang_label')}</label>
                <CustomSelect className="settings-select" style={{height: "45px"}} value={lang} onChange={(e) => changeLanguage(e.target.value)} options={[{value:"en", label:"English"}, {value:"uk", label:"Українська"}]} />
              </div>
              <div className="settings-form-group">
                <label className="settings-label">{t('theme_label')}</label>
                <CustomSelect className="settings-select" style={{height: "45px"}} value={theme} onChange={(e) => changeTheme(e.target.value)} options={[{value:"dark", label:t("theme_dark")}, {value:"light", label:t("theme_light")}]} />
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="animate-in settings-section-spaced">
              <h3 className="settings-section-title">{t('notif_title')}</h3>
              <p className="settings-text-muted mt-minus-8">{t('notif_desc')}</p>
              
              <div className="switch-group">
                <div className="switch-wrapper">
                  <span>{t('notif_email')}</span>
                  <label className="switch">
                    <input type="checkbox" checked={notifs.email} onChange={(e) => setNotifs({...notifs, email: e.target.checked})} />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="switch-wrapper">
                  <span>{t('notif_sms')}</span>
                  <label className="switch">
                    <input type="checkbox" checked={notifs.sms} onChange={(e) => setNotifs({...notifs, sms: e.target.checked})} />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="switch-wrapper">
                  <span>{t('notif_push')}</span>
                  <label className="switch">
                    <input type="checkbox" checked={notifs.push} onChange={handlePushToggle} />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="animate-in settings-section-spaced">
              <h3 className="settings-section-title">{t('sec_title')}</h3>
              <p className="settings-text-muted mt-minus-8">{t('sec_desc')}</p>

              <div className="switch-wrapper">
                <span className="font-bold">{t('sec_2fa')}</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={sec.twoFactor}
                    onChange={(e) => {
                      setSec({ ...sec, twoFactor: e.target.checked });
                      if (e.target.checked) showNotification(t('two_factor_msg'), 'success', true);
                    }}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <hr className="settings-divider" />

              <div className="settings-form-group">
                <label className="settings-label">{t('sec_password')}</label>
                
                <div className="settings-section">
                  <div className="settings-form-group">
                    <input
                      type="password"
                      className={`settings-input ${fieldErrors.currentPassword ? 'input-error' : ''}`}
                      placeholder={t('sec_current_password')}
                      value={currentPassword}
                      onChange={e => { setCurrentPassword(e.target.value); setFieldErrors({...fieldErrors, currentPassword: null}); }}
                    />
                    {fieldErrors.currentPassword && <span className="field-error-text">{fieldErrors.currentPassword}</span>}
                  </div>
                  
                  <div className="password-row-action mt-small">
                    <div className="settings-form-group flex-1">
                      <input
                        type="password"
                        className={`settings-input ${fieldErrors.newPassword ? 'input-error' : ''}`}
                        placeholder={t('sec_new_password')}
                        value={newPassword}
                        onChange={e => { setNewPassword(e.target.value); setFieldErrors({...fieldErrors, newPassword: null}); }}
                      />
                      {fieldErrors.newPassword && <span className="field-error-text">{fieldErrors.newPassword}</span>}
                    </div>
                    <button 
                      type="button" 
                      onClick={handlePasswordUpdate} 
                      disabled={isUpdatingPassword}
                      className={`btn-outline-secondary ${isUpdatingPassword ? 'btn-saving' : ''}`}
                    >
                      {isUpdatingPassword ? t('processing') : t('sec_update')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <hr className="settings-divider divider-lg" />

          <div className="settings-form-group">
            <button 
              type="submit" 
              className={`settings-btn-save ${saveStatus === 'saving' ? 'btn-saving' : ''}`} 
              disabled={saveStatus === 'saving'}
            >
              {saveStatus === 'saving' ? t('processing') : t('save_btn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;