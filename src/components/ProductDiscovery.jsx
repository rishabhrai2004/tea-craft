import { useEffect, useState } from 'react';
import { useCart } from '../context/cart-store';
import { formatCurrency, getDefaultWeightOption, getSelectedWeightOption, getWeightOptions, handleProductImageError, withSelectedWeight } from '../lib/catalog';

const fallbackProducts = [
  { id: 1, title: 'Black Tea', origin: 'China and India', weight: '100g', type: 'Fully Oxidized Tea', price: 349, currency: 'INR', weightOptions: [{ label: '100g', grams: 100, price: 349 }, { label: '500g', grams: 500, price: 1699 }, { label: '1000g', grams: 1000, price: 3099 }, { label: '1500g', grams: 1500, price: 4399 }], img: 'https://brewbuch.com/wp-content/uploads/2023/05/black-tea.jpg', tag: 'Best Seller', featured: true, notes: ['Malty', 'Bold', 'Dark amber'] },
  { id: 2, title: 'Green Tea', origin: 'China and Japan', weight: '100g', type: 'Minimally Oxidized Tea', price: 329, currency: 'INR', weightOptions: [{ label: '100g', grams: 100, price: 329 }, { label: '500g', grams: 500, price: 1599 }, { label: '1000g', grams: 1000, price: 2899 }, { label: '1500g', grams: 1500, price: 4099 }], img: 'https://brewbuch.com/wp-content/uploads/2023/05/green-tea.jpg', tag: 'Fresh', featured: true, notes: ['Grassy', 'Fresh', 'Light body'] },
  { id: 3, title: 'Herbal Tea', origin: 'Botanical Blend', weight: '100g', type: 'Tisane', price: 299, currency: 'INR', weightOptions: [{ label: '100g', grams: 100, price: 299 }, { label: '500g', grams: 500, price: 1399 }, { label: '1000g', grams: 1000, price: 2599 }, { label: '1500g', grams: 1500, price: 3799 }], img: 'https://brewbuch.com/wp-content/uploads/2023/05/herbal-tea-1024x683.jpg', tag: 'Caffeine Free', featured: true, notes: ['Floral', 'Spiced', 'Soothing'] },
  { id: 4, title: 'White Tea', origin: 'Fujian', weight: '100g', type: 'Lightly Withered Tea', price: 449, currency: 'INR', weightOptions: [{ label: '100g', grams: 100, price: 449 }, { label: '500g', grams: 500, price: 2099 }, { label: '1000g', grams: 1000, price: 3899 }, { label: '1500g', grams: 1500, price: 5599 }], img: 'https://brewbuch.com/wp-content/uploads/2023/05/white-tea-1024x683.jpg', tag: 'Delicate', featured: true, notes: ['Floral', 'Silvery buds', 'Soft finish'] },
  { id: 5, title: 'Butterfly Pea Flower Tea', origin: 'Southeast Asia', type: 'Flower Tea', weight: '100g', price: 399, currency: 'INR', weightOptions: [{ label: '100g', grams: 100, price: 399 }, { label: '500g', grams: 500, price: 1899 }, { label: '1000g', grams: 1000, price: 3499 }, { label: '1500g', grams: 1500, price: 4999 }], img: 'https://brewbuch.com/wp-content/uploads/2023/05/butterfly-pea-tea-1024x683.jpg', tag: 'Color Change', featured: true, notes: ['Blue cup', 'Earthy', 'Iced tea'] },
  { id: 6, title: 'Guayusa Tea', origin: 'Amazon Rainforest', type: 'Holly Leaf Tea', weight: '100g', price: 379, currency: 'INR', weightOptions: [{ label: '100g', grams: 100, price: 379 }, { label: '500g', grams: 500, price: 1799 }, { label: '1000g', grams: 1000, price: 3299 }, { label: '1500g', grams: 1500, price: 4699 }], img: 'https://brewbuch.com/wp-content/uploads/2023/05/Guayusa-tea-1024x683.jpg', tag: 'Energizing', featured: true, notes: ['Earthy', 'Smooth', 'Bright lift'] },
  { id: 7, title: 'Lapsang Souchong', origin: 'Wuyi Mountains', type: 'Smoked Black Tea', weight: '100g', price: 499, currency: 'INR', weightOptions: [{ label: '100g', grams: 100, price: 499 }, { label: '500g', grams: 500, price: 2299 }, { label: '1000g', grams: 1000, price: 4299 }, { label: '1500g', grams: 1500, price: 6199 }], img: 'https://brewbuch.com/wp-content/uploads/2023/05/Lapsang-Souchong-tea-1024x683.jpg', tag: 'Smoky', featured: true, notes: ['Pine smoke', 'Bold', 'Savory'] },
  { id: 8, title: 'Matcha', origin: 'Japan', type: 'Powdered Green Tea', weight: '100g', price: 899, currency: 'INR', weightOptions: [{ label: '100g', grams: 100, price: 899 }, { label: '500g', grams: 500, price: 4199 }, { label: '1000g', grams: 1000, price: 7799 }, { label: '1500g', grams: 1500, price: 11199 }], img: 'https://brewbuch.com/wp-content/uploads/2023/05/matcha-tea-1024x683.jpg', tag: 'Ceremonial', featured: true, notes: ['Umami', 'Vivid green', 'Frothy'] },
  { id: 9, title: 'Mate Tea', origin: 'South America', type: 'Yerba Mate', weight: '100g', price: 349, currency: 'INR', weightOptions: [{ label: '100g', grams: 100, price: 349 }, { label: '500g', grams: 500, price: 1699 }, { label: '1000g', grams: 1000, price: 3099 }, { label: '1500g', grams: 1500, price: 4399 }], img: 'https://brewbuch.com/wp-content/uploads/2023/05/mate-tea-1024x683.jpg', tag: null, featured: false, notes: ['Earthy', 'Bitter', 'Focused'] },
  { id: 10, title: 'Oolong Tea', origin: 'China and Taiwan', type: 'Partially Oxidized Tea', weight: '100g', price: 649, currency: 'INR', weightOptions: [{ label: '100g', grams: 100, price: 649 }, { label: '500g', grams: 500, price: 2999 }, { label: '1000g', grams: 1000, price: 5599 }, { label: '1500g', grams: 1500, price: 8099 }], img: 'https://brewbuch.com/wp-content/uploads/2023/05/oolong-tea-1024x683.jpg', tag: 'Complex', featured: false, notes: ['Floral', 'Stone fruit', 'Layered'] },
  { id: 11, title: 'Pu-erh Tea', origin: 'Yunnan', type: 'Fermented Tea', weight: '100g', price: 899, currency: 'INR', weightOptions: [{ label: '100g', grams: 100, price: 899 }, { label: '500g', grams: 500, price: 4199 }, { label: '1000g', grams: 1000, price: 7799 }, { label: '1500g', grams: 1500, price: 11199 }], img: 'https://brewbuch.com/wp-content/uploads/2023/05/Pu-erh-Tea-1024x683.jpg', tag: 'Aged', featured: false, notes: ['Earthy', 'Aged', 'Smooth'] },
  { id: 12, title: 'Purple Tea', origin: 'Kenya', type: 'Anthocyanin-Rich Tea', weight: '100g', price: 599, currency: 'INR', weightOptions: [{ label: '100g', grams: 100, price: 599 }, { label: '500g', grams: 500, price: 2799 }, { label: '1000g', grams: 1000, price: 5199 }, { label: '1500g', grams: 1500, price: 7499 }], img: 'https://brewbuch.com/wp-content/uploads/2023/05/types-of-tea.jpg', tag: 'Rare', featured: false, notes: ['Floral', 'Soft sweetness', 'Low caffeine'] },
  { id: 13, title: 'Yellow Tea', origin: 'China', type: 'Lightly Fermented Tea', weight: '100g', price: 699, currency: 'INR', weightOptions: [{ label: '100g', grams: 100, price: 699 }, { label: '500g', grams: 500, price: 3299 }, { label: '1000g', grams: 1000, price: 6099 }, { label: '1500g', grams: 1500, price: 8699 }], img: 'https://brewbuch.com/wp-content/uploads/2023/05/types-of-tea.jpg', tag: 'Rare', featured: false, notes: ['Mellow', 'Golden', 'Rounded'] },
  { id: 14, title: 'Breakfast Tea', origin: 'Assam, Ceylon, and Africa', type: 'Black Tea Blend', weight: '100g', price: 319, currency: 'INR', weightOptions: [{ label: '100g', grams: 100, price: 319 }, { label: '500g', grams: 500, price: 1499 }, { label: '1000g', grams: 1000, price: 2799 }, { label: '1500g', grams: 1500, price: 3999 }], img: 'https://brewbuch.com/wp-content/uploads/2023/05/Breakfast-Tea-1024x683.jpg', tag: 'Morning', featured: false, notes: ['Brisk', 'Full-bodied', 'Cream ready'] },
  { id: 15, title: 'Chai Tea', origin: 'India', type: 'Spiced Black Tea', weight: '100g', price: 349, currency: 'INR', weightOptions: [{ label: '100g', grams: 100, price: 349 }, { label: '500g', grams: 500, price: 1699 }, { label: '1000g', grams: 1000, price: 3099 }, { label: '1500g', grams: 1500, price: 4399 }], img: 'https://brewbuch.com/wp-content/uploads/2023/05/Chai-tea-1024x683.jpg', tag: 'Spiced', featured: false, notes: ['Ginger', 'Cardamom', 'Cinnamon'] },
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
          <h2 className="section-title">Curated Selection</h2>
          <p className="section-desc">Fifteen real tea styles curated for the modern palate.</p>
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
