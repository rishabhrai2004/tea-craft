import { useEffect, useState } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import CartDrawer from './components/CartDrawer';
import SearchDrawer from './components/SearchDrawer';
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

  return (
    <CartProvider>
      <div className="app-main">
        <Header onSearchClick={() => setIsSearchOpen(true)} />
        <SearchDrawer isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
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
