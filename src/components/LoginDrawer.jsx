import { useEffect, useState } from 'react';
import { LogOut, ShieldCheck, User, X } from 'lucide-react';

export default function LoginDrawer({ isOpen, onClose, account, onLogin, onLogout }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

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

  const handleSubmit = (event) => {
    event.preventDefault();
    const email = form.email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address.');
      return;
    }

    if (form.password.trim().length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    onLogin({
      name: form.name.trim() || email.split('@')[0],
      email,
      joinedAt: new Date().toISOString(),
    });
    setForm({ name: '', email: '', password: '' });
    setError('');
    onClose();
  };

  const handleLogout = () => {
    onLogout();
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
              <h4>Enter the archive</h4>

              <label className="cart-field">
                <span>Name</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Your name"
                />
              </label>

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
                  placeholder="Minimum 4 characters"
                  required
                />
              </label>

              {error && <p className="cart-error login-error">{error}</p>}
              <button type="submit" className="btn-primary full-width">Login</button>
            </form>
          )}
        </div>
      </aside>
    </>
  );
}
