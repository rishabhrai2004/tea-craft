import { Star } from 'lucide-react';

const reviews = [
  { id: 1, author: 'Eleanor R.', location: 'New York', text: 'The Royal Saffron Reserve is unlike anything I have ever tasted. You can physically smell the desert rose the moment you open the box. Truly a luxury experience.' },
  { id: 2, author: 'James W.', location: 'London', text: 'I am an avid tea collector, and the First Flush Pearl stands shoulder to shoulder with the finest estates in the world. The packaging is just as breathtaking.' },
  { id: 3, author: 'Priya M.', location: 'Mumbai', text: 'Craft Tea perfectly captures the authentic essence of Indian chai, elevated to an art form. The Spiced Emerald is my daily morning ritual now.' },
];

export default function SocialProof() {
  return (
    <section className="social-proof-section">
      <div className="sp-header">
        <h2 className="section-title">Voices of the Archive</h2>
        <div className="sp-rating">
          <div className="stars">
            {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="#C29A5B" color="#C29A5B" />)}
          </div>
          <span>Based on 1,200+ Reviews</span>
        </div>
      </div>
      
      <div className="reviews-grid">
        {reviews.map(review => (
          <div className="review-card" key={review.id}>
            <div className="stars">
              {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#C29A5B" color="#C29A5B" />)}
            </div>
            <p className="review-text">"{review.text}"</p>
            <div className="review-author">
              <strong>{review.author}</strong>
              <span>{review.location}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
