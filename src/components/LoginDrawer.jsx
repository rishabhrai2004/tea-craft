import { useEffect, useState } from 'react';
import { LogOut, ShieldCheck, User, X } from 'lucide-react';
import { loginAccount, registerAccount } from '../lib/api';
import { useCart } from '../context/cart-store';

export default function LoginDrawer({ isOpen, onClose, account, onLogin, onLogout }) {
  const { cartItems } = useCart();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const email = form.email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address.');
      return;
    }

    if (form.password.trim().length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (mode === 'register' && !form.name.trim()) {
      setError('Enter your name to create an account.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const authPayload = {
        name: form.name.trim(),
        email,
        password: form.password,
        mergeCart: cartItems.map((item) => ({
          id: item.id,
          weight: item.weight,
          quantity: item.quantity,
        })),
      };

      const response = mode === 'register'
        ? await registerAccount(authPayload)
        : await loginAccount(authPayload);

      onLogin(response.user);
      setForm({ name: '', email: '', password: '' });
      onClose();
    } catch (apiError) {
      setError(apiError.message || 'Unable to continue. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await onLogout();
    onClose();
  };

  return (
    <>
      <div className={`cart-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
      <aside className={`cart-drawer login-drawer ${isOpen ? 'open' : ''}`} role="dialog" aria-modal="true" aria-label="Account login">
        <div className="cart-header">
          <h3>{account ? 'Your Account' : 'Member Login'}</h3>
          <button type="button" onClick={onClose} className="close-btn" aria-label="Close login"><X size={24} /></button>
        </div>

        <div className="login-body">
          {account ? (
            <div className="account-panel">
              <div className="account-avatar"><User size={28} /></div>
              <p className="order-kicker">Craft Tea member</p>
              <h4>{account.name}</h4>
              <p>{account.email}</p>
              <div className="account-benefits">
                <span><ShieldCheck size={16} /> Saved checkout profile</span>
                <span><ShieldCheck size={16} /> Early estate releases</span>
                <span><ShieldCheck size={16} /> Member coupon access</span>
              </div>
              <button type="button" className="btn-secondary full-width" onClick={handleLogout}>
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          ) : (
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="account-avatar"><User size={28} /></div>
              <p className="order-kicker">Private estate account</p>
              <h4>{mode === 'register' ? 'Create your account' : 'Enter the archive'}</h4>

              {mode === 'register' && (
                <label className="cart-field">
                  <span>Name</span>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Your name"
                    required
                  />
                </label>
              )}

              <label className="cart-field">
                <span>Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="you@example.com"
                  required
                />
              </label>

              <label className="cart-field">
                <span>Password</span>
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                  placeholder="Minimum 6 characters"
                  required
                />
              </label>

              {error && <p className="cart-error login-error">{error}</p>}
              <button type="submit" className="btn-primary full-width" disabled={submitting}>
                {submitting
                  ? 'Please wait...'
                  : mode === 'register'
                    ? 'Create Account'
                    : 'Login'}
              </button>
              <button
                type="button"
                className="btn-text"
                onClick={() => {
                  setMode((current) => (current === 'login' ? 'register' : 'login'));
                  setError('');
                }}
                disabled={submitting}
              >
                {mode === 'login' ? 'New here? Create account' : 'Already a member? Sign in'}
              </button>
            </form>
          )}
        </div>
      </aside>
    </>
  );
}
