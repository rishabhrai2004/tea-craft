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
            <a href="#">Black Tea</a>
            <a href="#">Green Tea</a>
            <a href="#">Oolong</a>
            <a href="#">Gifting</a>
          </div>
          <div className="footer-col">
            <h4>Learn</h4>
            <a href="#">Our Story</a>
            <a href="#">The Estates</a>
            <a href="#">Brewing Guide</a>
            <a href="#">Journal</a>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <a href="#">FAQ</a>
            <a href="#">Shipping</a>
            <a href="#">Returns</a>
            <a href="#">Contact Us</a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2026 Craft Tea. All rights reserved.</p>
        <div className="footer-legal">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
