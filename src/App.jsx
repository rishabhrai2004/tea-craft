import { useEffect, useState } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CartProvider } from './context/CartContext';
import { fetchAuthSession, logoutAccount } from './lib/api';
import Header from './components/Header';
import CartDrawer from './components/CartDrawer';
import SearchDrawer from './components/SearchDrawer';
import LoginDrawer from './components/LoginDrawer';
import Hero from './components/Hero';
import BrandStory from './components/BrandStory';
import Sourcing from './components/Sourcing';

import ProductDiscovery from './components/ProductDiscovery';
import Experience from './components/Experience';
import Gifting from './components/Gifting';
import SocialProof from './components/SocialProof';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';
import './index.css';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    let active = true;

    async function bootstrapSession() {
      try {
        const payload = await fetchAuthSession();
        if (active) {
          setAccount(payload.authenticated ? payload.user : null);
        }
      } catch {
        if (active) {
          setAccount(null);
        }
      }
    }

    bootstrapSession();

    return () => {
      active = false;
    };
  }, []);

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
  };

  const handleLogout = async () => {
    await logoutAccount();
    setAccount(null);
  };

  return (
    <CartProvider account={account} onRequireAuth={() => setIsLoginOpen(true)}>
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
          <Sourcing />

          <ProductDiscovery />
          <Experience />
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
