import { useEffect, useState } from 'react';
import { useCart } from '../context/cart-store';
import { ShoppingBag, Search, Menu, User, X } from 'lucide-react';

export default function Header({ onSearchClick, onLoginClick, account }) {
  const { toggleCart, cartItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.classList.toggle('nav-open', isMenuOpen);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('nav-open');
    };
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen((current) => !current);
  const closeMenu = () => setIsMenuOpen(false);

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="header-wrapper">
      <div className="announcement-bar">
        <p>Complimentary shipping on the Archive Collection. <span>Shop Now</span></p>
      </div>
      <header className={`header-main ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-left">
          <button type="button" className="icon-btn menu-toggle" onClick={toggleMenu} aria-label="Open menu" aria-expanded={isMenuOpen}>
            <Menu size={20} />
          </button>
          <nav className="header-nav" aria-label="Primary navigation">
            <a href="#shop">Shop All</a>
            <a href="#story">Our Story</a>
            <a href="#gifting">Gifting</a>
          </nav>
        </div>
      
        <div className="header-center">
          <a className="logo-main" href="#top">CRAFT TEA</a>
        </div>
      
        <div className="header-right">
          <button type="button" className="icon-btn account-toggle" onClick={onLoginClick} aria-label={account ? `Open account for ${account.name}` : 'Login to account'}>
            <User size={20} />
            <span className="account-label">{account ? account.name.split(' ')[0] : 'Login'}</span>
          </button>
          <button type="button" className="icon-btn" onClick={onSearchClick} aria-label="Search teas">
            <Search size={20} />
          </button>
          <button type="button" className="icon-btn cart-toggle" onClick={toggleCart} aria-label={`Open cart with ${totalItems} items`}>
            <ShoppingBag size={20} />
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay & Drawer */}
      <div className={`mobile-menu-overlay ${isMenuOpen ? 'open' : ''}`} onClick={closeMenu} />
      <div className={`mobile-menu-drawer ${isMenuOpen ? 'open' : ''}`} role="dialog" aria-modal="true" aria-label="Mobile navigation">
        <div className="mobile-menu-header">
          <div className="logo-main">CRAFT TEA</div>
          <button type="button" className="icon-btn" onClick={closeMenu} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>
        <nav className="mobile-menu-nav">
          <a href="#shop" onClick={closeMenu}>Shop All</a>
          <a href="#story" onClick={closeMenu}>Our Story</a>
          <a href="#gifting" onClick={closeMenu}>Gifting</a>
          <a href="#experience" onClick={closeMenu}>Tea Experience</a>
          <a href="#locations" onClick={closeMenu}>Locations</a>
          <button type="button" className="mobile-account-link" onClick={() => { closeMenu(); onLoginClick(); }}>
            {account ? 'Account' : 'Login'}
          </button>
        </nav>
        <div className="mobile-menu-footer">
          <p>Join our newsletter for exclusive estate releases.</p>
        </div>
      </div>
    </div>
  );
}
