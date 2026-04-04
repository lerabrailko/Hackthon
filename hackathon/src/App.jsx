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
import AnalyticsPage from './pages/AnalyticsPage';
import InventoryPage from './pages/InventoryPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <GlobalProvider>
          <NotificationProvider>
            <BrowserRouter>
              <Routes>
                <Route path={ROUTES.LOGIN} element={<LoginPage />} />
                
                <Route path={ROUTES.DASHBOARD} element={
                  <ProtectedRoute>
                    <MainLayout><DashboardPage /></MainLayout>
                  </ProtectedRoute>
                } />
                
                <Route path={ROUTES.MAP} element={
                  <ProtectedRoute>
                    <MainLayout><MapPage /></MainLayout>
                  </ProtectedRoute>
                } />

                <Route path={ROUTES.ANALYTICS} element={
                  <ProtectedRoute>
                    <MainLayout><AnalyticsPage /></MainLayout>
                  </ProtectedRoute>
                } />

                <Route path={ROUTES.INVENTORY} element={
                  <ProtectedRoute>
                    <MainLayout><InventoryPage /></MainLayout>
                  </ProtectedRoute>
                } />
                
                <Route path={ROUTES.SETTINGS} element={
                  <ProtectedRoute>
                    <MainLayout><SettingsPage /></MainLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
              </Routes>
            </BrowserRouter>
          </NotificationProvider>
        </GlobalProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;