import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import logoImg from '../assets/logo.png';
import {
  LayoutDashboard,
  BarChart2,
  CreditCard,
  ArrowUpDown,
  PlusCircle,
  X,
  LogOut,
  Bell,
  Search,
} from 'lucide-react';

export function Sidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth();
  const { transactions } = useApp();

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`sidebar-overlay${mobileOpen ? ' visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`sidebar${mobileOpen ? ' open' : ''}`} aria-label="Main navigation">
        {/* Brand Logo */}
        <div className="sidebar__logo">
          <div className="vault-logo-icon-emblem" aria-hidden="true">
            <img src={logoImg} alt="Logo" style={{ height: 26, width: 'auto', objectFit: 'contain' }} />
          </div>
          <div className="sidebar__logo-text">
            <span className="vault-logo-title">ExpenseTracker</span>
            <span className="vault-logo-sub">STUDENT PORTAL</span>
          </div>
          {mobileOpen && (
            <button
              className="btn btn-icon btn-secondary"
              onClick={onClose}
              aria-label="Close navigation"
              style={{ marginLeft: 'auto' }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <nav className="sidebar__nav" aria-label="Sections">
          {/* OVERVIEW SECTION */}
          <div className="sidebar-section-heading">OVERVIEW</div>

          <NavLink
            to="/"
            end
            className={({ isActive }) => `vault-nav-item${isActive ? ' active' : ''}`}
            onClick={onClose}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/analytics"
            className={({ isActive }) => `vault-nav-item${isActive ? ' active' : ''}`}
            onClick={onClose}
          >
            <BarChart2 size={18} />
            <span>Analytics</span>
          </NavLink>

          <NavLink
            to="/cards"
            className={({ isActive }) => `vault-nav-item${isActive ? ' active' : ''}`}
            onClick={onClose}
          >
            <CreditCard size={18} />
            <span>Cards</span>
          </NavLink>

          {/* FINANCE SECTION */}
          <div className="sidebar-section-heading" style={{ marginTop: 20 }}>
            FINANCE
          </div>

          <NavLink
            to="/history"
            className={({ isActive }) => `vault-nav-item${isActive ? ' active' : ''}`}
            onClick={onClose}
          >
            <ArrowUpDown size={18} />
            <span>Transactions</span>
            {transactions?.length > 0 && (
              <span className="vault-badge-count">{transactions.length}</span>
            )}
          </NavLink>

          <NavLink
            to="/add"
            className={({ isActive }) => `vault-nav-item${isActive ? ' active' : ''}`}
            onClick={onClose}
          >
            <PlusCircle size={18} />
            <span>Add Transaction</span>
          </NavLink>
        </nav>

        {/* Bottom User Pill */}
        <div className="sidebar__user-box">
          <div className="vault-user-avatar">
            {user ? user.name.slice(0, 2).toUpperCase() : 'AJ'}
          </div>
          <div className="sidebar__user-details">
            <span className="sidebar__user-name" title={user?.name || 'Alex'}>
              {user?.name || 'Alex Kumar'}
            </span>
            <span className="sidebar__user-sub">
              {user?.rollNumber || 'Student Pro'}
            </span>
          </div>
          <button
            id="sidebar-logout-btn"
            className="btn btn-icon btn-logout"
            onClick={logout}
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
}

// ─── Mobile Header ────────────────────────────────────────────────────────────
export function MobileHeader({ onMenuOpen }) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const pageTitle = {
    '/':          'Dashboard',
    '/analytics': 'Analytics',
    '/cards':     'My Cards & Wallets',
    '/add':       'Add Transaction',
    '/history':   'Transactions',
  }[location.pathname] || 'Vault';

  return (
    <header className="mobile-header">
      <button
        id="mobile-menu-btn"
        className="hamburger-btn"
        onClick={onMenuOpen}
        aria-label="Open navigation"
        aria-expanded="false"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6"  x2="21" y2="6"  />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      <div className="flex items-center gap-xs">
        <div className="vault-logo-icon-emblem" style={{ padding: '2px 4px', borderRadius: 6 }}>
          <img src={logoImg} alt="Logo" style={{ height: 18, width: 'auto', objectFit: 'contain' }} />
        </div>
        <span className="mobile-header__title">{pageTitle}</span>
      </div>
      {user ? (
        <button
          className="btn btn-icon btn-secondary"
          onClick={logout}
          title="Sign Out"
          style={{ width: 32, height: 32, padding: 6 }}
        >
          <LogOut size={15} />
        </button>
      ) : (
        <div style={{ width: 32 }} />
      )}
    </header>
  );
}
