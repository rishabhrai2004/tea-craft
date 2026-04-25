import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
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
            { id: 4, title: 'Assam Breakfast', origin: 'Assam', price: 28, currency: 'USD', img: '/assam_tea.png' },
            { id: 6, title: 'Saffron Oolong', origin: 'Rajasthan', price: 42, currency: 'USD', img: '/rajasthan_tea.png' },
            { id: 7, title: 'Himalayan White', origin: 'Darjeeling', price: 55, currency: 'USD', img: '/darjeeling_tea.png' },
            { id: 3, title: 'Cardamom Green', origin: 'Kerala', price: 32, currency: 'USD', img: '/kerala_tea.png' },
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
        <a href="#" className="uppercase" style={{textDecoration: 'underline'}}>View All Collections</a>
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
