import { useCart } from '../context/cart-store';
import { formatCurrency } from '../lib/catalog';

export default function Gifting() {
  const { addToCart } = useCart();
  
  const bundle = {
    id: 99,
    title: 'The Archive Collection Box',
    origin: 'Three Estate Edit',
    type: 'Gift Collection',
    weight: '3 x 80g',
    price: 4999,
    currency: 'INR',
    img: '/macro_tea.png',
    tag: 'Limited Edition',
  };

  return (
    <section className="gifting-section" id="gifting">
      <div className="gifting-container">
        <div className="gifting-content">
          <span className="gifting-kicker">Curated Gifting</span>
          <h2 className="gifting-title">The Archive Collection</h2>
          <p className="gifting-desc">
            A masterfully curated wooden box containing three of our rarest reserve teas, 
            a handcrafted brass infuser, and a detailed tasting journal. 
            The ultimate gift for the connoisseur.
          </p>
          <div className="gifting-price">{formatCurrency(bundle.price, bundle.currency)}</div>
          <button type="button" className="btn-primary mt-4" onClick={() => addToCart(bundle)}>Gift The Collection</button>
        </div>
        <div className="gifting-visual">
          <img src="/macro_tea.png" alt="The Archive Collection gift box with loose leaf tea" className="gifting-img" />
          <div className="gifting-tag">Limited Edition</div>
        </div>
      </div>
    </section>
  );
}
