import { useEffect, useState } from 'react';
import { useCart } from '../context/cart-store';
import { formatCurrency } from '../lib/catalog';

export default function ShopGrid() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let active = true;

    fetch('/api/products')
      .then((response) => response.json())
      .then((payload) => {
        if (active) {
          setProducts((payload.products || []).slice(0, 4));
        }
      })
      .catch(() => {
        if (active) {
          setProducts([
            { id: 1, title: 'Black Tea', origin: 'China and India', price: 349, currency: 'INR', weight: '100g', img: '/assam_tea.png' },
            { id: 2, title: 'Green Tea', origin: 'China and Japan', price: 329, currency: 'INR', weight: '100g', img: '/kerala_tea.png' },
            { id: 8, title: 'Matcha', origin: 'Japan', price: 899, currency: 'INR', weight: '100g', img: '/kerala_tea.png' },
            { id: 15, title: 'Chai Tea', origin: 'India', price: 349, currency: 'INR', weight: '100g', img: '/assam_tea.png' },
          ]);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="shop-section" id="shop">
      <div className="shop-header">
        <h2 className="text-large">Curated Selection</h2>
        <a href="#shop" className="uppercase" style={{textDecoration: 'underline'}}>View All Collections</a>
      </div>
      <div className="shop-grid">
        {products.map(product => (
          <div className="product-card" key={product.id}>
            <div className="pc-image-wrapper">
              <img src={product.img} alt={product.title} className="pc-image" />
            </div>
            <div className="pc-info">
              <div>
                <h3 className="pc-title">{product.title}</h3>
                <span className="uppercase pc-origin">{product.origin}</span>
              </div>
              <div>
                <span className="pc-title">{formatCurrency(product.price, product.currency)}</span>
                <button className="btn-text" onClick={() => addToCart(product)}>Add</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
