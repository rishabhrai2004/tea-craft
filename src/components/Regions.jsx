import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const regions = [
  {
    id: 'rajasthan',
    title: 'Rajasthan',
    desc: 'Warm desert tones, royal textures, heritage storytelling, spiced tea narrative.',
    img: '/rajasthan_tea.png',
  },
  {
    id: 'assam',
    title: 'Assam',
    desc: 'Lush green plantations, mist, bold strong tea identity.',
    img: '/assam_tea.png',
  },
  {
    id: 'darjeeling',
    title: 'Darjeeling',
    desc: 'Mountain elegance, fog, delicate premium tea storytelling.',
    img: '/darjeeling_tea.png',
  },
  {
    id: 'kerala',
    title: 'Kerala',
    desc: 'Lush tropical green with coconut palms, cardamom pods and tea leaves together.',
    img: '/kerala_tea.png',
  }
];

export default function Regions() {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const slides = gsap.utils.toArray('.region-slide');
      
      slides.forEach((slide) => {
        ScrollTrigger.create({
          trigger: slide,
          start: 'top top',
          pin: true,
          pinSpacing: false,
        });

        gsap.fromTo(slide.querySelector('.region-bg'), 
          { scale: 1 }, 
          { 
            scale: 1.1, 
            ease: 'none',
            scrollTrigger: {
              trigger: slide,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            }
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="regions-container" ref={containerRef}>
      {regions.map((region, idx) => (
        <section key={region.id} className="region-slide" style={{ zIndex: idx + 1 }}>
          <img src={region.img} alt={region.title} className="region-bg" />
          <div className="region-overlay" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)' }}></div>
          <div className="region-content">
            <h2 className="region-title">{region.title}</h2>
            <p className="region-desc">{region.desc}</p>
            <button className="btn">Discover {region.title}</button>
          </div>
        </section>
      ))}
    </div>
  );
}
