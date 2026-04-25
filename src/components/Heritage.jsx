import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function Heritage() {
  const sectionRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.heritage-text', {
        backgroundSize: '100% 100%',
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top center',
          end: 'bottom center',
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="heritage-section" ref={sectionRef}>
      <div className="heritage-content">
        <p className="heritage-text" ref={textRef}>
          For centuries, the lush landscapes of India have nurtured the world's most exquisite tea leaves. 
          Craft Tea brings you a curated journey through time and tradition. 
          Every leaf tells a story of the soil, the sun, and the hands that tenderly picked it.
        </p>
      </div>
    </section>
  );
}
