import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function JourneyMaster() {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const rows = gsap.utils.toArray('.jm-row');
      
      // Animate text content reveal
      rows.forEach((row) => {
        gsap.fromTo(row.querySelector('.jm-content-inner'), 
          { opacity: 0, y: 30 },
          { 
            opacity: 1, y: 0, duration: 1.5, ease: 'expo.out',
            scrollTrigger: {
              trigger: row,
              start: 'top 60%',
            }
          }
        );
      });

      // Master Leaf Timeline (Motion + Color Morph)
      const leafTl = gsap.timeline({
        scrollTrigger: {
          trigger: '.jm-left',
          start: 'top center',
          end: 'bottom center',
          scrub: 2.5
        }
      });

      leafTl
        // Movement down the path
        .fromTo('.jm-falling-leaf', { y: '0vh', rotation: 0, x: '-20px' }, { y: '580vh', rotation: 720, x: '20px', ease: 'none' })
        
        // Color Morphing (Simulating drying/oxidation)
        // Stage 1-2: Fresh to Withered (slightly paler)
        .to('.jm-leaf-overlay', { fill: 'rgba(160, 180, 100, 0.2)', duration: 1 }, 1)
        // Stage 3-4: Rolling/Oxidation (turning brown/copper)
        .to('.jm-leaf-overlay', { fill: 'rgba(120, 80, 30, 0.4)', duration: 1 }, 2.5)
        // Stage 5-6: Drying/Packing (darker, dried texture)
        .to('.jm-leaf-overlay', { fill: 'rgba(60, 40, 20, 0.6)', duration: 1 }, 4)
        // Stage 7: Brewing (dissolve)
        .to('.jm-falling-leaf', { opacity: 0, filter: 'blur(10px)', scale: 0.5, duration: 0.5 }, 5.5);

    }, containerRef);
    return () => ctx.revert();
  }, []);

  const stages = [
    {
      id: '01',
      title: 'Handpicked at peak freshness',
      subtitle: 'Only the finest two leaves and a bud are selected by hand.',
      img: '/photos/source-assam.jpg',
      filter: 'none'
    },
    {
      id: '02',
      title: 'Gently softened to unlock character',
      subtitle: 'Air-withered to reduce moisture and prepare for transformation.',
      img: '/photos/source-darjeeling.jpg',
      filter: 'none'
    },
    {
      id: '03',
      title: 'Rolled to release depth and aroma',
      subtitle: 'Gently bruised to release the essential oils and soul of the leaf.',
      img: '/photos/source-munnar.jpg',
      filter: 'none'
    },
    {
      id: '04',
      title: 'Transformed through time and oxidation',
      subtitle: 'Monitored with precision as the leaf develops its rich copper hue.',
      img: '/photos/story-main.jpg',
      filter: 'none'
    },
    {
      id: '05',
      title: 'Dried to preserve richness',
      subtitle: 'Fired at the perfect temperature to lock in the complex flavor profile.',
      img: '/photos/hero-estate.jpg',
      filter: 'none'
    },
    {
      id: '06',
      title: 'Refined and sealed with precision',
      subtitle: 'Sorted for absolute quality and sealed in premium environment.',
      img: '/photos/newsletter-bg.webp',
      filter: 'none'
    },
    {
      id: '07',
      title: 'Brewed into a perfect cup',
      subtitle: 'The journey ends as the leaf reveals its story in every drop.',
      img: '/photos/experience-bg.webp',
      filter: 'none'
    }
  ];

  return (
    <section className="journey-master" id="journey" ref={containerRef}>
      
      {/* Centered Falling Leaf with Morphing capabilities */}
      <div className="jm-falling-leaf-wrap">
        <div className="jm-falling-leaf">
           <div className="jm-leaf-inner">
             <svg viewBox="0 0 200 400" className="jm-leaf-svg">
                <defs>
                  <clipPath id="jmLeafClipFinal">
                    <path d="M100,10 C150,50 190,150 100,380 C10,150 50,50 100,10 Z" />
                  </clipPath>
                  <filter id="jmShadowFinal">
                    <feDropShadow dx="0" dy="20" stdDeviation="15" floodOpacity="0.4" />
                  </filter>
                </defs>
                <g filter="url(#jmShadowFinal)">
                  <image href="/kerala_tea.png" width="400" height="400" x="-100" y="0" clipPath="url(#jmLeafClipFinal)" preserveAspectRatio="xMidYMid slice" />
                  {/* The jm-leaf-overlay is controlled by GSAP to simulate drying/color change */}
                  <path className="jm-leaf-overlay" d="M100,10 C150,50 190,150 100,380 C10,150 50,50 100,10 Z" fill="rgba(80, 100, 30, 0.1)" />
                  <path d="M100,10 Q110,150 100,380" stroke="rgba(255,255,255,0.2)" strokeWidth="2" fill="none" />
                </g>
              </svg>
           </div>
        </div>
      </div>

      <div className="jm-left">
        {stages.map((stage) => (
          <div 
            className="jm-row" 
            key={stage.id}
            style={{ 
              backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.5)), url(${stage.img})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: '#1a1c19' // Heritage Charcoal fallback
            }}
          >
            <div className="jm-content">
              <div className="jm-content-inner">
                <div className="jm-num">{stage.id}</div>
                <h3>{stage.title}</h3>
                <p>{stage.subtitle}</p>
                <div className="jm-plus-ring">
                  <div className="jm-plus">+</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}
