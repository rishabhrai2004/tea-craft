import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function BrandStory() {
  const storyRef = useRef(null);
  const storyMainSrc = '/photos/story-main.jpg';
  const storySecondarySrc = '/photos/story-secondary.jpg';

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.bs-image-main', {
        yPercent: 15,
        ease: 'none',
        scrollTrigger: {
          trigger: storyRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        }
      });
    }, storyRef);
    return () => ctx.revert();
  }, []);

  return (
    <section className="brand-story" id="story" ref={storyRef}>
      <div className="bs-grid">
        <div className="bs-image-col">
          <div className="bs-image-wrapper">
            <img 
              src={storyMainSrc}
              alt="Mountain Tea Estate" 
              className="bs-image-main"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/darjeeling_tea.png';
              }}
            />
          </div>
          <img 
            src={storySecondarySrc}
            alt="Leaves" 
            className="bs-image-secondary"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/macro_tea.png';
            }}
          />
        </div>
        <div className="bs-content-col">
          <h2 className="section-title">The Heritage of the Leaf</h2>
          <p className="bs-lead">We believe that true luxury lies in origin.</p>
          <p className="bs-text">
            For generations, the mist-covered mountains of Darjeeling and the fertile plains of Assam have produced the world's most coveted teas. 
            Craft Tea acts as the archivist of these traditions. We partner directly with historic estates to bring unblended, single-origin teas directly to your cup.
            <br/><br/>
            No artificial flavoring. No compromises. Just the pure, cinematic expression of Indian terroir.
          </p>
          <div className="bs-facts">
            <div className="bs-fact">
              <span>01</span>
              <p>Hand-selected harvest lots</p>
            </div>
            <div className="bs-fact">
              <span>02</span>
              <p>Direct estate partnerships</p>
            </div>
            <div className="bs-fact">
              <span>03</span>
              <p>Seasonal small-batch releases</p>
            </div>
          </div>
          <a className="btn-text mt-4" href="#locations">Discover Our Estates</a>
        </div>
      </div>
    </section>
  );
}
