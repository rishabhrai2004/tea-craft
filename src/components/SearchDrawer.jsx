import { useEffect, useRef, useState } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { useCart } from '../context/cart-store';
import { searchProducts } from '../lib/api';
import { formatCurrency, getDefaultWeightOption, handleProductImageError, withSelectedWeight } from '../lib/catalog';

export default function SearchDrawer({ isOpen, onClose }) {
  const { addToCart } = useCart();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    let active = true;
    const timeoutId = window.setTimeout(async () => {
      if (!isOpen) {
        return;
      }

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
  }, [isOpen, query]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    inputRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleAdd = (product) => {
    const defaultWeight = getDefaultWeightOption(product);
    addToCart(withSelectedWeight(product, defaultWeight.label));
    onClose();
  };

  return (
    <>
      <div className={`cart-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
      <aside className={`cart-drawer ${isOpen ? 'open' : ''} search-drawer`} role="dialog" aria-modal="true" aria-label="Search tea archive">
        <div className="cart-header">
          <h3>Search the Archive</h3>
          <button type="button" onClick={onClose} className="close-btn" aria-label="Close search"><X size={24} /></button>
        </div>

        <div className="search-body">
          <label className="search-field">
            <Search size={18} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search teas, estates, notes..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>

          <div className="search-meta">
            <span>{loading ? 'Curating results...' : `${results.length || 0} results`}</span>
            <button type="button" className="btn-text" onClick={() => setQuery('')}>Reset</button>
          </div>

          <div className="search-results">
            {results.length === 0 && !loading ? (
              <div className="search-empty">
                <p>Featured selections will appear here as you type.</p>
                <button type="button" className="btn-primary" onClick={onClose}>Continue Exploring <ArrowRight size={16} /></button>
              </div>
            ) : (
              results.map((product) => {
                const defaultWeight = getDefaultWeightOption(product);

                return (
                  <div key={product.id} className="search-result-card">
                    <img src={product.img} alt={product.imgAlt || product.title} className="search-result-image" onError={(event) => handleProductImageError(event, product)} />
                    <div className="search-result-content">
                      <div>
                        <span className="search-result-origin">{product.origin}</span>
                        <h4>{product.title}</h4>
                        <p>{product.type} - {defaultWeight.label}</p>
                      </div>
                      <div className="search-result-footer">
                        <strong>{formatCurrency(defaultWeight.price, product.currency)}</strong>
                        <button type="button" className="btn-solid-small" onClick={() => handleAdd(product)}>Add</button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
