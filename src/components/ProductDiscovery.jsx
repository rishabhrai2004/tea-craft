import { useEffect, useState } from 'react';
import { useCart } from '../context/cart-store';
import { formatCurrency, getDefaultWeightOption, getSelectedWeightOption, getWeightOptions, handleProductImageError, withSelectedWeight } from '../lib/catalog';

const fallbackProducts = [
  { id: 1, title: 'Black Tea', origin: 'China and India', weight: '100g', type: 'Fully Oxidized Tea', price: 349, currency: 'INR', weightOptions: [{ label: '100g', grams: 100, price: 349 }, { label: '500g', grams: 500, price: 1599 }, { label: '1000g', grams: 1000, price: 2999 }, { label: '1500g', grams: 1500, price: 4299 }], img: '/assam_tea.png', tag: 'Best Seller', featured: true },
  { id: 2, title: 'Green Tea', origin: 'China and Japan', weight: '100g', type: 'Minimally Oxidized Tea', price: 329, currency: 'INR', weightOptions: [{ label: '100g', grams: 100, price: 329 }, { label: '500g', grams: 500, price: 1499 }, { label: '1000g', grams: 1000, price: 2799 }, { label: '1500g', grams: 1500, price: 3999 }], img: '/kerala_tea.png', tag: 'Fresh', featured: true },
  { id: 3, title: 'Herbal Tea', origin: 'Botanical Blend', weight: '100g', type: 'Tisane', price: 299, currency: 'INR', weightOptions: [{ label: '100g', grams: 100, price: 299 }, { label: '500g', grams: 500, price: 1399 }, { label: '1000g', grams: 1000, price: 2599 }, { label: '1500g', grams: 1500, price: 3799 }], img: '/macro_tea.png', tag: 'Caffeine Free', featured: true },
  { id: 4, title: 'White Tea', origin: 'Fujian', weight: '100g', type: 'Lightly Withered Tea', price: 449, currency: 'INR', weightOptions: [{ label: '100g', grams: 100, price: 449 }, { label: '500g', grams: 500, price: 2099 }, { label: '1000g', grams: 1000, price: 3999 }, { label: '1500g', grams: 1500, price: 5799 }], img: '/darjeeling_tea.png', tag: 'Delicate', featured: true },
];

export default function ProductDiscovery() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState(fallbackProducts);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(true);
  const [selectedWeights, setSelectedWeights] = useState({});

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        const response = await fetch('/api/products');
        const payload = await response.json();
        if (!active) return;
        setProducts(payload.products?.length ? payload.products : fallbackProducts);
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

  const teaProducts = products.filter((product) => !product.isGift);
  const visibleProducts = showAll ? teaProducts : teaProducts.filter((product) => product.featured !== false).slice(0, 8);

  return (
    <section className="product-discovery" id="shop">
      <div className="section-header-split">
        <div>
          <h2 className="section-title">The Tea Library</h2>
          <p className="section-desc">Fifteen real tea styles with leaf photography inspired by BrewBuch's tea guide.</p>
        </div>
        <button type="button" className="btn-text" onClick={() => setShowAll((current) => !current)}>
          {showAll ? 'Show Featured' : 'View All Teas'}
        </button>
      </div>
      
      <div className="discovery-grid">
        {(loading ? fallbackProducts : visibleProducts).map(product => {
          const weightOptions = getWeightOptions(product);
          const selectedWeight = selectedWeights[product.id] ?? getDefaultWeightOption(product).label;
          const selectedOption = getSelectedWeightOption(product, selectedWeight);

          return (
          <div className="product-card-rich" key={product.id}>
            <div className="pcr-image-wrapper">
              {product.tag && <span className="pcr-tag">{product.tag}</span>}
              <img src={product.img} alt={product.imgAlt || product.title} className="pcr-image" onError={(event) => handleProductImageError(event, product)} />
            </div>
            <div className="pcr-info">
              <div className="pcr-meta-row">
                <span className="pcr-origin">{product.origin}</span>
                <span className="pcr-weight">{selectedOption.label}</span>
              </div>
              <h3 className="pcr-title">{product.title}</h3>
              <p className="pcr-type">{product.type}</p>
              {product.notes?.length > 0 && (
                <div className="pcr-notes" aria-label={`${product.title} tasting notes`}>
                  {product.notes.slice(0, 3).map((note) => (
                    <span key={note}>{note}</span>
                  ))}
                </div>
              )}
              <label className="pcr-weight-select">
                <span>Pack size</span>
                <select
                  value={selectedOption.label}
                  onChange={(event) => setSelectedWeights((current) => ({ ...current, [product.id]: event.target.value }))}
                >
                  {weightOptions.map((option) => (
                    <option key={option.label} value={option.label}>{option.label}</option>
                  ))}
                </select>
              </label>
              
              <div className="pcr-action-row">
                <span className="pcr-price">{formatCurrency(selectedOption.price, product.currency)}</span>
                <button type="button" className="btn-solid-small" onClick={() => addToCart(withSelectedWeight(product, selectedOption.label))} aria-label={`Add ${product.title} ${selectedOption.label} to cart`}>
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
          );
        })}
      </div>
    </section>
  );
}
