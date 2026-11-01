import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { Sidebar, MobileHeader } from './components/Navigation';
import Dashboard          from './pages/Dashboard';
import AddTransaction      from './pages/AddTransaction';
import TransactionHistory  from './pages/TransactionHistory';
import Cards               from './pages/Cards';
import Analytics           from './pages/Analytics';
import Login               from './pages/Login';
import './index.css';

// ─── Protected Route Wrapper ──────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// ─── Main Application Shell ───────────────────────────────────────────────────
function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  // For the login page, render full screen without the dashboard sidebar
  if (isLoginPage) {
    return (
      <div className="login-fullscreen-wrapper">
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--color-surface-2)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
              borderRadius: '10px',
              fontSize: '14px',
              padding: '12px 16px',
            },
            success: { iconTheme: { primary: '#059669', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
          }}
        />
      </div>
    );
  }

  return (
    <div className="app-layout">
      <MobileHeader onMenuOpen={() => setMobileOpen(true)} />
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cards"
            element={
              <ProtectedRoute>
                <Cards />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add"
            element={
              <ProtectedRoute>
                <AddTransaction />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <TransactionHistory />
              </ProtectedRoute>
            }
          />
          {/* Catch-all */}
          <Route
            path="*"
            element={
              <main className="page flex-center" style={{ minHeight: '60vh' }}>
                <div className="empty-state">
                  <div className="empty-state__icon">404</div>
                  <h2 className="empty-state__title">Page Not Found</h2>
                  <p className="empty-state__text">This page doesn't exist.</p>
                  <a href="/" className="btn btn-primary">Go Home</a>
                </div>
              </main>
            }
          />
        </Routes>
      </div>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--color-surface-2)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
            borderRadius: '10px',
            fontSize: '14px',
            padding: '12px 16px',
          },
          success: { iconTheme: { primary: '#059669', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <AppShell />
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
