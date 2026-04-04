import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { ROUTES } from './constants/routes';

import { AuthProvider } from './context/AuthContext';
import { GlobalProvider } from './context/GlobalStore';
import { NotificationProvider } from './context/NotificationContext';
import { LanguageProvider } from './context/LanguageContext';

import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MapPage from './pages/MapPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <AuthProvider>
      <GlobalProvider>
        <NotificationProvider>
          <LanguageProvider>
            
            <BrowserRouter>
              <Routes>
                {}
                <Route path={ROUTES.LOGIN} element={<LoginPage />} />

                {}
                <Route
                  path={ROUTES.DASHBOARD}
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <DashboardPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path={ROUTES.MAP}
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <MapPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path={ROUTES.SETTINGS}
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <SettingsPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />

                {}
                <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
              </Routes>
            </BrowserRouter>

          </LanguageProvider>
        </NotificationProvider>
      </GlobalProvider>
    </AuthProvider>
  );
}

export default App;