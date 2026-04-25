import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function ParallaxDivider() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.pd-image', {
        y: '20%',
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section className="parallax-divider" ref={sectionRef}>
      <img src="/assam_tea.png" alt="Assam Estate" className="pd-image" />
      <div className="pd-text">
        <h2 className="text-large">Heritage in Every Leaf</h2>
        <p className="uppercase" style={{ marginTop: '1rem', letterSpacing: '0.2em' }}>Direct from Estate to Cup</p>
      </div>
    </section>
  );
}
