import { useCart } from '../context/CartContext';
import { X, Plus, Minus, Trash2 } from 'lucide-react';

export default function CartDrawer() {
  const { isCartOpen, closeCart, cartItems, removeFromCart, updateQuantity, total, checkoutCart, isCheckingOut, checkoutError, lastOrder } = useCart();

  const handleCheckout = async () => {
    try {
      await checkoutCart({ name: 'Guest Collector' });
    } catch {
      // Error state is shown from the cart context.
    }
  };

  return (
    <>
      <div className={`cart-overlay ${isCartOpen ? 'open' : ''}`} onClick={closeCart}></div>
      <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h3>{lastOrder ? 'Order Confirmed' : `Your Ritual (${cartItems.length})`}</h3>
          <button onClick={closeCart} className="close-btn"><X size={24} /></button>
        </div>
        
        <div className="cart-body">
          {lastOrder ? (
            <div className="order-confirmation">
              <p className="order-kicker">Premium checkout complete</p>
              <h4>{lastOrder.orderNumber}</h4>
              <p>Your archive order has been confirmed and is being prepared for dispatch.</p>
              <div className="order-summary-line">
                <span>Total</span>
                <strong>${lastOrder.total.toFixed(2)}</strong>
              </div>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="empty-cart">Your cart is empty. Discover our collection.</div>
          ) : (
            cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <img src={item.img} alt={item.title} className="cart-item-img" />
                <div className="cart-item-info">
                  <h4>{item.title}</h4>
                  <span className="cart-item-price">${item.price.toFixed(2)}</span>
                  
                  <div className="cart-item-actions">
                    <div className="qty-selector">
                      <button onClick={() => updateQuantity(item.id, -1)}><Minus size={14} /></button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)}><Plus size={14} /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="remove-btn"><Trash2 size={16}/></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {checkoutError && <p className="cart-error">{checkoutError}</p>}

        {cartItems.length > 0 && !lastOrder && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <p className="cart-taxes">Shipping & taxes calculated at checkout.</p>
            <button className="btn-primary full-width" onClick={handleCheckout} disabled={isCheckingOut}>
              {isCheckingOut ? 'Confirming Order...' : 'Proceed to Checkout'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
