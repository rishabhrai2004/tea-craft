import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function MagneticCTA({ children, onClick, className = '' }) {
  const magneticRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const el = magneticRef.current;
    const text = textRef.current;
    
    const moveMagnetic = (e) => {
      const { clientX, clientY } = e;
      const { height, width, left, top } = el.getBoundingClientRect();
      const x = clientX - (left + width / 2);
      const y = clientY - (top + height / 2);
      
      gsap.to(el, { x: x * 0.4, y: y * 0.4, duration: 1, ease: 'power3.out' });
      gsap.to(text, { x: x * 0.2, y: y * 0.2, duration: 1, ease: 'power3.out' });
    };

    const resetMagnetic = () => {
      gsap.to(el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, 0.3)' });
      gsap.to(text, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, 0.3)' });
    };

    el.addEventListener('mousemove', moveMagnetic);
    el.addEventListener('mouseleave', resetMagnetic);

    return () => {
      el.removeEventListener('mousemove', moveMagnetic);
      el.removeEventListener('mouseleave', resetMagnetic);
    };
  }, []);

  return (
    <button className={`elite-cta ${className}`} ref={magneticRef} onClick={onClick}>
      <div className="cta-fill"></div>
      <span className="cta-text" ref={textRef}>{children}</span>
    </button>
  );
}
