import { useEffect, useState } from 'react';
import { useCart } from '../context/cart-store';
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
            { id: 1, title: 'Black Tea', price: 349, currency: 'INR', weight: '100g', img: 'https://brewbuch.com/wp-content/uploads/2023/05/black-tea.jpg' },
            { id: 2, title: 'Green Tea', price: 329, currency: 'INR', weight: '100g', img: 'https://brewbuch.com/wp-content/uploads/2023/05/green-tea.jpg' },
            { id: 4, title: 'White Tea', price: 449, currency: 'INR', weight: '100g', img: 'https://brewbuch.com/wp-content/uploads/2023/05/white-tea-1024x683.jpg' },
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
