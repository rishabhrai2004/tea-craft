export default function Sourcing() {
  const assamEstateSrc = '/photos/source-assam.jpg';
  const darjeelingEstateSrc = '/photos/source-darjeeling.jpg';
  const munnarEstateSrc = '/photos/source-munnar.jpg';

  return (
    <section className="sourcing-section">
      <div className="sourcing-header">
        <h2 className="section-title">The Source of Silence</h2>
        <p className="sourcing-desc">We traverse the rugged terrains of India to partner exclusively with estates that practice biodynamic and sustainable farming. No middlemen. Just the pure leaf.</p>
      </div>
      
      <div className="sourcing-grid">
        <div className="source-card">
          <div className="sc-img-wrap">
            <img
              src={assamEstateSrc}
              alt="Assam Estate"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/assam_tea.png';
              }}
            />
          </div>
          <div className="sc-content">
            <span className="sc-elev">Elevation: 100M</span>
            <h3>Brahmaputra Valley</h3>
            <p>Known for its rich, malty, and bold flavors. The low altitude and dense rainfall create a tea of uncompromising strength.</p>
          </div>
        </div>
        
        <div className="source-card">
          <div className="sc-img-wrap">
            <img
              src={darjeelingEstateSrc}
              alt="Darjeeling Estate"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/darjeeling_tea.png';
              }}
            />
          </div>
          <div className="sc-content">
            <span className="sc-elev">Elevation: 2000M</span>
            <h3>Himalayan Foothills</h3>
            <p>The Champagne of Teas. High altitude, cool mist, and intense sun yield a delicate, muscatel flavor profile.</p>
          </div>
        </div>
        
        <div className="source-card">
          <div className="sc-img-wrap">
            <img
              src={munnarEstateSrc}
              alt="Kerala Estate"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/kerala_tea.png';
              }}
            />
          </div>
          <div className="sc-content">
            <span className="sc-elev">Elevation: 1600M</span>
            <h3>Munnar Blue Mountains</h3>
            <p>Surrounded by wild spice forests. The teas here absorb the subtle terroir notes of wild cardamom and pepper.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
