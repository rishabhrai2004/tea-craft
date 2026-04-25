import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Search, Menu } from 'lucide-react';

export default function Header({ onSearchClick }) {
  const { toggleCart, cartItems } = useCart();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="header-wrapper">
      <div className="announcement-bar">
        <p>Complimentary shipping on the Archive Collection. <span>Shop Now</span></p>
      </div>
      <header className={`header-main ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-left">
          <button className="icon-btn"><Menu size={20} /></button>
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
    </div>
  );
}
