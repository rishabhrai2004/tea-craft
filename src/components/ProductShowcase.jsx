import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../lib/catalog';

export default function ProductShowcase() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let active = true;

    fetch('/api/products?featured=true')
      .then((response) => response.json())
      .then((payload) => {
        if (active) {
          setProducts((payload.products || []).slice(0, 3));
        }
      })
      .catch(() => {
        if (active) {
          setProducts([
            { id: 1, title: 'Royal Saffron Blend', price: 45, currency: 'USD', img: '/rajasthan_tea.png' },
            { id: 4, title: 'Assam Bold Morning', price: 28, currency: 'USD', img: '/assam_tea.png' },
            { id: 2, title: 'Darjeeling First Flush', price: 55, currency: 'USD', img: '/darjeeling_tea.png' },
          ]);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="products-section">
      <div className="section-header">
        <h2 className="section-title">Curated Collection</h2>
        <p>Discover our finest selections of Indian teas.</p>
      </div>
      <div className="product-grid">
        {products.map((product) => (
          <div className="product-card" key={product.id}>
            <img src={product.img} alt={product.title} className="product-image" />
            <div className="product-info">
              <h3 className="product-name">{product.title}</h3>
              <p className="product-price">{formatCurrency(product.price, product.currency)}</p>
              <button className="product-btn" onClick={() => addToCart(product)}>Add to Cart</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
