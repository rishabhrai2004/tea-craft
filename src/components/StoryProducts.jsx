import { useEffect, useState } from 'react';
import { useCart } from '../context/cart-store';
import { formatCurrency } from '../lib/catalog';

const stories = [
  {
    id: 15,
    region: 'Rajasthan',
    title: 'Chai Tea',
    desc: 'A spiced black tea with ginger, cinnamon, cardamom, and clove warmth.',
    price: 349,
    currency: 'INR',
    weight: '100g',
    img: '/rajasthan_tea.png'
  },
  {
    id: 4,
    region: 'Darjeeling',
    title: 'White Tea',
    desc: 'A delicate tea made from pale buds with a soft floral cup.',
    price: 449,
    currency: 'INR',
    weight: '100g',
    img: '/darjeeling_tea.png'
  },
  {
    id: 2,
    region: 'Kerala',
    title: 'Green Tea',
    desc: 'A clean green tea with a mild body and bright grassy aroma.',
    price: 329,
    currency: 'INR',
    weight: '100g',
    img: '/kerala_tea.png'
  }
];

export default function StoryProducts() {
  const { addToCart } = useCart();
  const [items, setItems] = useState(stories);

  useEffect(() => {
    let active = true;

    fetch('/api/products')
      .then((response) => response.json())
      .then((payload) => {
        if (active && payload.products?.length) {
          setItems(payload.products.slice(0, 3).map((product) => ({
            id: product.id,
            region: product.origin,
            title: product.title,
            desc: product.description,
            price: product.price,
            currency: product.currency,
            img: product.img,
          })));
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="story-section" id="story">
      <div className="container">
        {items.map((story, index) => (
          <div className={`story-row ${index % 2 !== 0 ? 'reverse' : ''}`} key={story.id}>
            <div className="story-image-col">
              <img src={story.img} alt={story.title} className="story-image" />
            </div>
            
            <div className="story-text-col">
              <span className="story-region">{story.region}</span>
              <h2 className="story-title">{story.title}</h2>
              <p className="story-desc">{story.desc}</p>
              
              <div className="story-action">
                <span className="story-price">{formatCurrency(story.price, story.currency)}</span>
                <button className="secondary-cta" onClick={() => addToCart(story)}>Add to Cart</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
