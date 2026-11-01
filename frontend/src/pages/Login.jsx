import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import logoImg from '../assets/logo.png';

export default function Login() {
  const navigate = useNavigate();
  const { login, register, loading, isAuthenticated } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    remember: true,
  });

  const [errors, setErrors] = useState({});

  // If already authenticated, redirect to home
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleAutoFillDemo = () => {
    setFormData({
      name: 'Aarav Sharma',
      email: 'student@codenova.edu',
      password: 'student123',
      remember: true,
    });
    setErrors({});
    toast.success('Demo credentials loaded! Click Sign In to enter.', {
      icon: '⚡',
    });
  };

  const validate = () => {
    const errs = {};
    if (mode === 'register' && !formData.name.trim()) {
      errs.name = 'Full name is required';
    }
    if (!formData.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Enter a valid email address';
    }
    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (mode === 'login') {
      const res = await login(formData.email, formData.password);
      if (res.success) {
        navigate('/');
      }
    } else {
      const res = await register(formData.name, formData.email, formData.password);
      if (res.success) {
        navigate('/');
      }
    }
  };

  return (
    <div className="login-fullscreen-wrapper">
      {/* Background ambient atmospheric lighting */}
      <div className="login-grid-bg" aria-hidden="true" />
      <div className="login-orb login-orb-1" aria-hidden="true" />
      <div className="login-orb login-orb-2" aria-hidden="true" />
      <div className="login-orb login-orb-3" aria-hidden="true" />

      <div className="login-layout-split">
        {/* ── LEFT COLUMN: Brand Hero Showcase ── */}
        <div className="login-hero-showcase">
          {/* Main Logo Emblem Card */}
          <div className="login-logo-emblem-badge">
            <img
              src={logoImg}
              alt="Expense Tracker Official Logo"
              className="login-emblem-img"
            />
          </div>

          <div className="login-hero-badge">
            <Sparkles size={14} className="text-emerald" />
            <span>Next-Gen Student Finance Portal</span>
          </div>

          <h1 className="login-hero-title">
            Take complete control of your{' '}
            <span className="gradient-text-emerald">campus money.</span>
          </h1>

          <p className="login-hero-desc">
            The intelligent personal ledger designed for college life. Track mess food, hostel rent, textbooks, and scholarships with mathematical precision.
          </p>

          {/* Feature Highlights Grid */}
          <div className="login-features-list">
            <div className="login-feature-card">
              <div className="feature-card-icon feature-card-icon--mint">
                <CheckCircle2 size={18} />
              </div>
              <div className="feature-card-text">
                <strong>Accurate Server Computations</strong>
                <p>Calculated entirely on the persistent backend engine — zero floating-point rounding errors.</p>
              </div>
            </div>

            <div className="login-feature-card">
              <div className="feature-card-icon feature-card-icon--cyan">
                <TrendingUp size={18} />
              </div>
              <div className="feature-card-text">
                <strong>Interactive Timeframes (1W, 1M, 3M, 1Y)</strong>
                <p>Instantly see your exact spending habits weekly, monthly, quarterly, or annually.</p>
              </div>
            </div>

            <div className="login-feature-card">
              <div className="feature-card-icon feature-card-icon--purple">
                <CreditCard size={18} />
              </div>
              <div className="feature-card-text">
                <strong>Smart Campus Cards & Limits</strong>
                <p>Manage virtual student debit cards, freeze security, and enforce daily spending limits.</p>
              </div>
            </div>
          </div>

          {/* Social Proof Trust Bar */}
          <div className="login-trust-bar">
            <div className="trust-avatar-group">
              <span className="trust-avatar" style={{ background: '#00e599', color: '#071018' }}>AS</span>
              <span className="trust-avatar" style={{ background: '#38bdf8', color: '#071018' }}>RK</span>
              <span className="trust-avatar" style={{ background: '#a855f7', color: '#fff' }}>PM</span>
              <span className="trust-avatar" style={{ background: '#f59e0b', color: '#071018' }}>TD</span>
            </div>
            <div className="trust-text">
              <strong>2,400+ Students</strong> managing personal budgets across campus
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Authentication Form Card ── */}
        <div className="login-form-panel">
          <div className="login-card-v2">
            {/* Top Logo banner for card header */}
            <div className="login-card-brand-top">
              <div className="login-logo-mini-badge">
                <img src={logoImg} alt="Expense Tracker Logo" className="login-mini-logo-img" />
              </div>
              <h2 className="login-card-title">
                {mode === 'login' ? 'Student Sign In' : 'Create Account'}
              </h2>
              <p className="login-card-subtitle">
                {mode === 'login'
                  ? 'Sign in to access your personal student finance dashboard'
                  : 'Start tracking your college income and expenses today'}
              </p>
            </div>

            {/* Quick Demo Autofill Pill */}
            {mode === 'login' && (
              <button
                type="button"
                className="quick-demo-pill-btn"
                onClick={handleAutoFillDemo}
                title="Click to auto-fill demo student credentials"
              >
                <Zap size={14} className="text-amber-400" />
                <span>1-Click Demo Fill: <strong>student@codenova.edu</strong></span>
              </button>
            )}

            {/* Mode Switcher Tabs */}
            <div className="auth-tabs" role="tablist">
              <button
                type="button"
                className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
                onClick={() => {
                  setMode('login');
                  setErrors({});
                }}
                role="tab"
                aria-selected={mode === 'login'}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
                onClick={() => {
                  setMode('register');
                  setErrors({});
                }}
                role="tab"
                aria-selected={mode === 'register'}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              {/* Name field (register only) */}
              {mode === 'register' && (
                <div className="form-group">
                  <label className="form-label" htmlFor="register-name">
                    Full Name <span>*</span>
                  </label>
                  <div className="input-with-icon">
                    <User size={18} className="input-icon" />
                    <input
                      id="register-name"
                      name="name"
                      type="text"
                      className={`form-input has-icon ${errors.name ? 'has-error' : ''}`}
                      placeholder="e.g. Priya Sharma"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                  {errors.name && <span className="field-error">{errors.name}</span>}
                </div>
              )}

              {/* Email field */}
              <div className="form-group">
                <label className="form-label" htmlFor="auth-email">
                  College Email / Student ID <span>*</span>
                </label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input
                    id="auth-email"
                    name="email"
                    type="email"
                    className={`form-input has-icon ${errors.email ? 'has-error' : ''}`}
                    placeholder="student@codenova.edu"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>

              {/* Password field */}
              <div className="form-group">
                <label className="form-label" htmlFor="auth-password">
                  Password <span>*</span>
                </label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="auth-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className={`form-input has-icon ${errors.password ? 'has-error' : ''}`}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <span className="field-error">{errors.password}</span>}
              </div>

              {/* Remember Me */}
              {mode === 'login' && (
                <div className="login-options">
                  <label className="remember-checkbox">
                    <input
                      type="checkbox"
                      name="remember"
                      checked={formData.remember}
                      onChange={handleChange}
                    />
                    <span>Remember this device</span>
                  </label>
                  <span className="demo-hint-text">Demo pass: <code>student123</code></span>
                </div>
              )}

              {/* Submit Button */}
              <button
                id="auth-submit-btn"
                type="submit"
                className="btn btn-primary w-full btn-lg login-submit-v2"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner" />
                ) : mode === 'login' ? (
                  <>
                    <span>Sign In to Student Portal</span>
                    <ArrowRight size={18} />
                  </>
                ) : (
                  <>
                    <span>Create Student Account</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Security Guarantee Pill */}
            <div className="login-security-guarantee">
              <ShieldCheck size={16} className="text-emerald" />
              <span>256-Bit Bank Encryption • Safe & Secure</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
