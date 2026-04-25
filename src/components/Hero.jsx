import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  const heroRef = useRef(null);
  const heroTextureSrc = '/photos/hero-estate.jpg';
  const heroFrontSrc = '/photos/hero-leaf.jpg';

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.hero-text-anim', 
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, stagger: 0.1, ease: 'power3.out' }
      );
      gsap.fromTo('.hero-image-front', 
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.5, ease: 'power3.out', delay: 0.4 }
      );
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <section className="hero-section" id="top" ref={heroRef}>
      <div className="hero-bg-layer">
        <img 
          src={heroTextureSrc}
          alt="Green Tea Field" 
          className="hero-texture"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/hero_tea_bg.png';
          }}
        />
      </div>
      
      <div className="hero-grid">
        <div className="hero-content">

          <span className="hero-kicker hero-text-anim">Single-origin Indian estate teas</span>
          <h1 className="hero-heading hero-text-anim">Crafting Legacy,<br/>Protecting Earth</h1>
          <p className="hero-desc hero-text-anim">
            Experience the artisanal soul of Indian tea. From our ancestral estates to your cup, we preserve the purity of nature and the wisdom of generations.
          </p>
          <div className="hero-cta-group hero-text-anim">
            <a className="btn-primary" href="#shop">Shop Collection <ArrowRight size={18} /></a>
            <a className="btn-secondary" href="#story">Explore the Story</a>
          </div>

          <div className="hero-metrics hero-text-anim">
            <div className="hero-metric">
              <span className="hm-value">03</span>
              <span className="hm-label">Estate Origins</span>
            </div>
            <div className="hero-metric">
              <span className="hm-value">24h</span>
              <span className="hm-label">Fresh dispatch</span>
            </div>
            <div className="hero-metric">
              <span className="hm-value">100%</span>
              <span className="hm-label">Single origin</span>
            </div>
          </div>
        </div>
        
        <div className="hero-visual">
          <img 
            src={heroFrontSrc}
            alt="Fresh Tea Leaves" 
            className="hero-image-front"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/assam_tea.png';
            }}
          />
          <div className="hero-floating-card hero-text-anim">
            <span className="fc-title">Assam Estate Heritage</span>
            <span className="fc-desc">Hand-picked at peak freshness</span>
          </div>
        </div>
      </div>
      
      <div className="scroll-indicator hero-text-anim">
        <div className="mouse-icon"></div>
        <span>Scroll to Explore</span>
      </div>
    </section>
  );
}
