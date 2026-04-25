import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Search, Menu } from 'lucide-react';

export default function Header({ onSearchClick }) {
  const { toggleCart, cartItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="header-wrapper">
      <div className="announcement-bar">
        <p>Complimentary shipping on the Archive Collection. <span>Shop Now</span></p>
      </div>
      <header className={`header-main ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-left">
          <button className="icon-btn menu-toggle" onClick={toggleMenu}><Menu size={20} /></button>
          <nav className="header-nav">
            <a href="#shop">Shop All</a>
            <a href="#story">Our Story</a>
            <a href="#gifting">Gifting</a>
          </nav>
        </div>
      
        <div className="header-center">
          <div className="logo-main">CRAFT TEA</div>
        </div>
      
        <div className="header-right">
          <button className="icon-btn" onClick={onSearchClick}><Search size={20} /></button>
          <button className="icon-btn cart-toggle" onClick={toggleCart}>
            <ShoppingBag size={20} />
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay & Drawer */}
      <div className={`mobile-menu-overlay ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu} />
      <div className={`mobile-menu-drawer ${isMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <div className="logo-main">CRAFT TEA</div>
          <button className="icon-btn" onClick={toggleMenu}><Menu size={20} /></button>
        </div>
        <nav className="mobile-menu-nav">
          <a href="#shop" onClick={toggleMenu}>Shop All</a>
          <a href="#story" onClick={toggleMenu}>Our Story</a>
          <a href="#gifting" onClick={toggleMenu}>Gifting</a>
          <a href="#experience" onClick={toggleMenu}>Tea Experience</a>
          <a href="#locations" onClick={toggleMenu}>Locations</a>
        </nav>
        <div className="mobile-menu-footer">
          <p>Join our newsletter for exclusive estate releases.</p>
        </div>
      </div>
    </div>
  );
}
