export default function Experience() {
  const experienceBgSrc = '/photos/experience-bg.webp';

  return (
    <section className="experience-section">
      <div className="exp-bg-wrapper">
        <img
          src={experienceBgSrc}
          alt="Tea Experience"
          className="exp-bg"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/hero_tea_bg.png';
          }}
        />
        <div className="exp-overlay"></div>
      </div>
      
      <div className="exp-content">
        <span className="exp-kicker">The Ritual</span>
        <h2 className="exp-title">Brewing Perfection</h2>
        <div className="exp-steps">
          <div className="exp-step">
            <span className="step-num">01</span>
            <h4>Water Temperature</h4>
            <p>Heat fresh spring water to 90°C to preserve the delicate essential oils.</p>
          </div>
          <div className="exp-step">
            <span className="step-num">02</span>
            <h4>The Infusion</h4>
            <p>Allow the loose leaves to unfurl naturally in a spacious glass teapot.</p>
          </div>
          <div className="exp-step">
            <span className="step-num">03</span>
            <h4>The Steep</h4>
            <p>Wait precisely 3 minutes. The resulting liquor should be golden amber.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
