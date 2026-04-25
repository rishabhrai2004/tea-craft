import { useState } from 'react';
import { submitNewsletterSignup } from '../lib/api';

export default function Newsletter() {
  const newsletterBgSrc = '/photos/newsletter-bg.webp';
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim()) {
      setStatus({ type: 'error', message: 'Enter your email to join the archive.' });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await submitNewsletterSignup(email.trim());
      setStatus({ type: 'success', message: response.message || 'Welcome to the inner circle.' });
      setEmail('');
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Unable to complete signup.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="newsletter-section" id="newsletter">
      <div className="nl-bg-wrapper">
        <img
          src={newsletterBgSrc}
          alt="Texture"
          className="nl-bg"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/hero_tea_bg.png';
          }}
        />
        <div className="nl-overlay"></div>
      </div>
      
      <div className="nl-content">
        <h2 className="nl-title">Join the Inner Circle</h2>
        <p className="nl-desc">Subscribe to receive first access to limited harvest releases, exclusive private events, and editorial insights on the art of tea.</p>
        
        <form className="nl-form" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="newsletter-email">Email address</label>
          <input
            id="newsletter-email"
            type="email"
            placeholder="Enter your email address"
            className="nl-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
          />
          <button type="submit" className="nl-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Joining...' : 'Subscribe'}
          </button>
        </form>
        {status.message && (
          <p className={`nl-status ${status.type}`} aria-live="polite">{status.message}</p>
        )}
      </div>
    </section>
  );
}
