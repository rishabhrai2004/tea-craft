import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../lib/catalog';

const stories = [
  {
    id: 'rajasthan',
    region: 'Rajasthan',
    title: 'Saffron Reserve',
    desc: 'Crafted in the spirit of Rajput royalty. A bold black tea married with hand-plucked saffron and desert rose. Uncompromising richness.',
    price: '$45.00',
    img: '/rajasthan_tea.png'
  },
  {
    id: 'darjeeling',
    region: 'Darjeeling',
    title: 'First Flush Pearl',
    desc: 'Harvested in the misty high altitudes of the Himalayas. Hand-rolled, minimally oxidized, pure mountain elegance.',
    price: '$65.00',
    img: '/darjeeling_tea.png'
  },
  {
    id: 'kerala',
    region: 'Kerala',
    title: 'Spiced Emerald',
    desc: 'Deep within the tropical jungles. Rich green tea subtly infused with wild cardamom and lemongrass. A vibrant sensory explosion.',
    price: '$38.00',
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
