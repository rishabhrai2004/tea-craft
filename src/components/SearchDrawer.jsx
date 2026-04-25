import { useEffect, useState } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { searchProducts } from '../lib/api';
import { formatCurrency } from '../lib/catalog';

export default function SearchDrawer({ isOpen, onClose }) {
  const { addToCart } = useCart();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const timeoutId = window.setTimeout(async () => {
      setLoading(true);
      try {
        const products = await searchProducts(query);
        if (active) {
          setResults(products.slice(0, 6));
        }
      } catch {
        if (active) {
          setResults([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }, 220);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  return (
    <>
      <div className={`cart-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
      <aside className={`cart-drawer ${isOpen ? 'open' : ''} search-drawer`}>
        <div className="cart-header">
          <h3>Search the Archive</h3>
          <button onClick={onClose} className="close-btn"><X size={24} /></button>
        </div>

        <div className="search-body">
          <label className="search-field">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search teas, estates, notes..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>

          <div className="search-meta">
            <span>{loading ? 'Curating results...' : `${results.length || 0} results`}</span>
            <button className="btn-text" onClick={() => setQuery('')}>Reset</button>
          </div>

          <div className="search-results">
            {results.length === 0 && !loading ? (
              <div className="search-empty">
                <p>Featured selections will appear here as you type.</p>
                <button className="btn-primary" onClick={onClose}>Continue Exploring <ArrowRight size={16} /></button>
              </div>
            ) : (
              results.map((product) => (
                <div key={product.id} className="search-result-card">
                  <img src={product.img} alt={product.title} className="search-result-image" />
                  <div className="search-result-content">
                    <div>
                      <span className="search-result-origin">{product.origin}</span>
                      <h4>{product.title}</h4>
                      <p>{product.type}</p>
                    </div>
                    <div className="search-result-footer">
                      <strong>{formatCurrency(product.price, product.currency)}</strong>
                      <button className="btn-solid-small" onClick={() => addToCart(product)}>Add</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
