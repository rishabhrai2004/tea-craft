import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../lib/catalog';

const fallbackProducts = [
  { id: 1, title: 'Royal Saffron Reserve', origin: 'Rajasthan', weight: '100g', type: 'Black Tea', price: 45, currency: 'USD', img: '/rajasthan_tea.png', tag: 'Best Seller' },
  { id: 2, title: 'First Flush Pearl', origin: 'Darjeeling', weight: '50g', type: 'White Tea', price: 65, currency: 'USD', img: '/darjeeling_tea.png', tag: 'Limited' },
  { id: 3, title: 'Munnar Spiced Emerald', origin: 'Kerala', weight: '150g', type: 'Green Tea', price: 38, currency: 'USD', img: '/kerala_tea.png', tag: null },
  { id: 4, title: 'Assam Bold Morning', origin: 'Assam', weight: '200g', type: 'Black Tea', price: 28, currency: 'USD', img: '/assam_tea.png', tag: null },
];

export default function ProductDiscovery() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState(fallbackProducts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        const response = await fetch('/api/products?featured=true');
        const payload = await response.json();
        if (!active) return;
        setProducts((payload.products || []).slice(0, 4));
      } catch {
        if (active) {
          setProducts(fallbackProducts);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="product-discovery" id="shop">
      <div className="section-header-split">
        <div>
          <h2 className="section-title">Curated Selection</h2>
          <p className="section-desc">Handpicked from India's most prestigious estates.</p>
        </div>
        <button className="btn-text">View All Teas</button>
      </div>
      
      <div className="discovery-grid">
        {(loading ? fallbackProducts : products).map(product => (
          <div className="product-card-rich" key={product.id}>
            <div className="pcr-image-wrapper">
              {product.tag && <span className="pcr-tag">{product.tag}</span>}
              <img src={product.img} alt={product.title} className="pcr-image" />
            </div>
            <div className="pcr-info">
              <div className="pcr-meta-row">
                <span className="pcr-origin">{product.origin}</span>
                <span className="pcr-weight">{product.weight}</span>
              </div>
              <h3 className="pcr-title">{product.title}</h3>
              <p className="pcr-type">{product.type}</p>
              
              <div className="pcr-action-row">
                <span className="pcr-price">{formatCurrency(product.price, product.currency)}</span>
                <button className="btn-solid-small" onClick={() => addToCart(product)}>
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
