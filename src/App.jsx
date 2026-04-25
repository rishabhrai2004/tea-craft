import { useEffect, useState } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import CartDrawer from './components/CartDrawer';
import SearchDrawer from './components/SearchDrawer';
import LoginDrawer from './components/LoginDrawer';
import Hero from './components/Hero';
import BrandStory from './components/BrandStory';
import JourneyMaster from './components/JourneyMaster';
import ProductDiscovery from './components/ProductDiscovery';
import Gifting from './components/Gifting';
import SocialProof from './components/SocialProof';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';
import './index.css';

gsap.registerPlugin(ScrollTrigger);

const ACCOUNT_STORAGE_KEY = 'teaCraft.account.v1';

function readStoredAccount() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(ACCOUNT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function App() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [account, setAccount] = useState(() => readStoredAccount());

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      smooth: true,
    });

    let rafId;

    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    lenis.on('scroll', ScrollTrigger.update);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  const handleLogin = (nextAccount) => {
    setAccount(nextAccount);
    window.localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(nextAccount));
  };

  const handleLogout = () => {
    setAccount(null);
    window.localStorage.removeItem(ACCOUNT_STORAGE_KEY);
  };

  return (
    <CartProvider>
      <div className="app-main">
        <Header
          onSearchClick={() => setIsSearchOpen(true)}
          onLoginClick={() => setIsLoginOpen(true)}
          account={account}
        />
        <SearchDrawer isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        <LoginDrawer
          isOpen={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
          account={account}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
        <CartDrawer />
        
        <main>
          <Hero />
          <BrandStory />
          <JourneyMaster />
          <ProductDiscovery />
          <Gifting />
          <SocialProof />
          <Newsletter />
        </main>
        
        <Footer />
      </div>
    </CartProvider>
  );
}

export default App;
