import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function Process() {
  const processRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.process-card');
      cards.forEach((card) => {
        gsap.fromTo(card, 
          { y: 80, opacity: 0 },
          { 
            y: 0, opacity: 1, duration: 1, ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
            }
          }
        );
      });
      
      gsap.fromTo('.process-line-fill', 
        { height: '0%' },
        {
          height: '100%',
          ease: 'none',
          scrollTrigger: {
            trigger: '.process-timeline',
            start: 'top 50%',
            end: 'bottom 50%',
            scrub: true
          }
        }
      );
    }, processRef);
    return () => ctx.revert();
  }, []);

  return (
    <section className="process-section" id="process" ref={processRef}>
      <div className="process-header">
        <span className="p-kicker">The Craft</span>
        <h2 className="section-title">How It's Made</h2>
        <p className="process-intro">The transformation from raw leaf to the final amber liquor is an ancient science. Every second of processing alters the final flavor profile.</p>
      </div>

      <div className="process-timeline">
        <div className="process-line-bg"></div>
        <div className="process-line-fill"></div>
        
        <div className="process-card">
          <div className="pc-image-wrap">
            <img src="/assam_tea.png" alt="Withering" style={{ filter: 'saturate(1.2) brightness(1.1)' }} />
          </div>
          <div className="pc-content">
            <div className="pc-num">01</div>
            <h3>Withering</h3>
            <p>Freshly plucked leaves are spread across bamboo troughs. Cool mountain air flows over them for 12-18 hours, reducing moisture by up to 60%. The leaf becomes flaccid, preparing it for shaping.</p>
          </div>
        </div>

        <div className="process-card right">
          <div className="pc-content">
            <div className="pc-num">02</div>
            <h3>Rolling</h3>
            <p>The withered leaves are gently bruised and twisted. This ruptures the cell walls, exposing the internal enzymes and essential oils to oxygen. This is where the tea's character is born.</p>
          </div>
          <div className="pc-image-wrap">
            <img src="/kerala_tea.png" alt="Rolling" style={{ filter: 'contrast(1.3) saturate(1.1) brightness(0.9)' }} />
          </div>
        </div>

        <div className="process-card">
          <div className="pc-image-wrap">
            <img src="/hero_tea_bg.png" alt="Oxidation" style={{ filter: 'sepia(0.7) hue-rotate(-20deg) brightness(0.9) contrast(1.2)' }} />
          </div>
          <div className="pc-content">
            <div className="pc-num">03</div>
            <h3>Oxidation</h3>
            <p>The bruised leaves are laid out in climate-controlled rooms. As they absorb oxygen, they transform from vivid green to a rich copper brown. The master monitors this phase by smell alone, stopping it at the exact perfect moment.</p>
          </div>
        </div>

        <div className="process-card right">
          <div className="pc-content">
            <div className="pc-num">04</div>
            <h3>Firing</h3>
            <p>The oxidized leaves are subjected to high heat in specialized ovens. This halts oxidation, locks in the complex flavor profile, and dries the leaf completely, ensuring it can be stored and aged.</p>
          </div>
          <div className="pc-image-wrap">
            <img src="/macro_tea.png" alt="Firing" style={{ filter: 'sepia(0.6) hue-rotate(-30deg) brightness(0.5) contrast(1.4)' }} />
          </div>
        </div>
      </div>
    </section>
  );
}
