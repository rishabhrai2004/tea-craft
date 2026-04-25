import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Journey() {
  const containerRef = useRef(null);
  const pinRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Create a master timeline locked to scroll
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=400%', // 4 screens of scrolling duration
          scrub: 1, // smooth scrub
          pin: pinRef.current,
        }
      });

      // 1. Background Image Crossfades
      tl.to('.scene-1', { opacity: 0, duration: 1 }, 1)
        .to('.scene-2', { opacity: 1, duration: 1 }, 1)
        
        .to('.scene-2', { opacity: 0, duration: 1 }, 3)
        .to('.scene-3', { opacity: 1, duration: 1 }, 3)
        
        .to('.scene-3', { opacity: 0, duration: 1 }, 5)
        .to('.scene-4', { opacity: 1, duration: 1 }, 5);

      // 2. Cinematic Text Reveal & Hide
      tl.to('.text-1', { opacity: 0, y: -30, duration: 0.5 }, 0.5)
        .fromTo('.text-2', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5 }, 1.5)
        .to('.text-2', { opacity: 0, y: -30, duration: 0.5 }, 2.5)
        .fromTo('.text-3', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5 }, 3.5)
        .to('.text-3', { opacity: 0, y: -30, duration: 0.5 }, 4.5)
        .fromTo('.text-4', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5 }, 5.5);

      // 3. The Anchor Leaf Path Animation
      // Falls naturally through the 100vh pinned viewport
      tl.fromTo('.journey-leaf-wrap', 
        { y: '5vh', x: '0vw', rotation: 0 },
        { y: '25vh', x: '8vw', rotation: 45, duration: 1.5, ease: 'sine.inOut' }, 0
      )
      .to('.journey-leaf-wrap', { y: '50vh', x: '-8vw', rotation: -20, duration: 2, ease: 'sine.inOut' }, 1.5)
      .to('.journey-leaf-wrap', { y: '70vh', x: '5vw', rotation: 10, duration: 2, ease: 'sine.inOut' }, 3.5)
      // Final dissolve into the cup
      .to('.journey-leaf-wrap', { y: '85vh', x: '0vw', rotation: 0, scale: 0, opacity: 0, filter: 'blur(10px)', duration: 1.5, ease: 'power2.in' }, 5.5);

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="journey-wrapper" ref={containerRef} id="journey">
      <div className="journey-pin" ref={pinRef}>
        
        {/* Cinematic Layers */}
        <div className="journey-bg scene-1" style={{ backgroundImage: 'url(/assam_tea.png)' }}>
          <div className="journey-overlay"></div>
        </div>
        <div className="journey-bg scene-2" style={{ backgroundImage: 'url(/darjeeling_tea.png)', opacity: 0 }}>
          <div className="journey-overlay"></div>
        </div>
        <div className="journey-bg scene-3" style={{ backgroundImage: 'url(/macro_tea.png)', opacity: 0 }}>
          <div className="journey-overlay"></div>
        </div>
        <div className="journey-bg scene-4" style={{ backgroundImage: 'url(/hero_tea_bg.png)', opacity: 0 }}>
          <div className="journey-overlay"></div>
        </div>

        {/* The Storytelling Leaf */}
        <div className="journey-leaf-wrap">
          <svg viewBox="0 0 100 200" className="journey-leaf-svg">
            <path d="M50,0 C80,30 90,100 50,180 C10,100 20,30 50,0 Z" fill="#8C9A5B" />
            <path d="M50,0 Q50,90 50,180" stroke="rgba(0,0,0,0.2)" strokeWidth="1" fill="none" />
          </svg>
        </div>

        {/* Narrative */}
        <div className="journey-content">
          <div className="journey-text text-1">
            <span className="j-kicker">1. Origin</span>
            <h2>Plucked at first light</h2>
            <p>From the mist-covered foothills of the Himalayas, surrounded by silence.</p>
          </div>
          
          <div className="journey-text text-2" style={{ opacity: 0 }}>
            <span className="j-kicker">2. Harvesting</span>
            <h2>Shaped by time and care</h2>
            <p>Human hands delicately selecting only the finest unopened buds.</p>
          </div>
          
          <div className="journey-text text-3" style={{ opacity: 0 }}>
            <span className="j-kicker">3. Processing</span>
            <h2>Transformed through craft</h2>
            <p>Withered, gently rolled, and oxidized to release profound, hidden aromas.</p>
          </div>
          
          <div className="journey-text text-4" style={{ opacity: 0 }}>
            <span className="j-kicker">4. The Cup</span>
            <h2>Poured into moments</h2>
            <p>A cinematic journey of flavor and heritage. Crafted with care, in every cup.</p>
          </div>
        </div>
        
      </div>
    </section>
  );
}
