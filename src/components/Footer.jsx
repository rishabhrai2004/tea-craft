export default function Footer() {
  return (
    <footer className="footer-premium">
      <div className="footer-top">
        <div className="footer-brand">
          <h2 className="footer-logo">CRAFT TEA</h2>
          <p>Redefining the ritual of Indian tea.</p>
        </div>
        
        <div className="footer-links-grid">
          <div className="footer-col">
            <h4>Shop</h4>
            <a href="#shop">Black Tea</a>
            <a href="#shop">Green Tea</a>
            <a href="#shop">Oolong</a>
            <a href="#gifting">Gifting</a>
          </div>
          <div className="footer-col">
            <h4>Learn</h4>
            <a href="#story">Our Story</a>
            <a href="#locations">The Estates</a>
            <a href="#experience">Brewing Guide</a>
            <a href="#newsletter">Journal</a>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <a href="#newsletter">FAQ</a>
            <a href="#shop">Shipping</a>
            <a href="mailto:care@crafttea.com">Returns</a>
            <a href="mailto:care@crafttea.com">Contact Us</a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2026 Craft Tea. All rights reserved.</p>
        <div className="footer-legal">
          <a href="mailto:care@crafttea.com">Privacy Policy</a>
          <a href="mailto:care@crafttea.com">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
