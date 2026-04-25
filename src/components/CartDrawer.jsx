import { useEffect, useState } from 'react';
import { useCart } from '../context/cart-store';
import { formatCurrency, handleProductImageError } from '../lib/catalog';
import { calculateCouponDiscount, validateCoupon } from '../../shared/coupons';
import { X, Plus, Minus, Trash2 } from 'lucide-react';

export default function CartDrawer() {
  const {
    isCartOpen,
    closeCart,
    cartItems,
    removeFromCart,
    updateQuantity,
    total,
    checkoutCart,
    checkoutError,
    lastOrder,
    isAuthenticated,
    cartSummary,
    refreshCart,
    isCheckingOut,
    isMutatingCart,
    isSyncingCart,
  } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMessage, setCouponMessage] = useState('');

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeCart();
      }
    };

    if (isCartOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeCart, isCartOpen]);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartCurrency = cartItems[0]?.currency || lastOrder?.currency || 'INR';
  const freeShippingTarget = 2500;
  const backendCouponStatus = isAuthenticated ? cartSummary?.couponStatus || null : null;
  const backendCoupon = isAuthenticated ? cartSummary?.coupon || null : null;
  const appliedCouponValidation = !isAuthenticated && appliedCoupon ? validateCoupon(appliedCoupon.code, total) : null;
  const activeCoupon = isAuthenticated
    ? backendCoupon
    : (appliedCouponValidation?.valid ? appliedCouponValidation.coupon : null);
  const discount = isAuthenticated
    ? Number(cartSummary?.discount || 0)
    : (activeCoupon ? calculateCouponDiscount(activeCoupon, total) : 0);
  const discountedSubtotal = Math.max(0, total - discount);
  const freeShippingRemaining = Math.max(0, freeShippingTarget - discountedSubtotal);
  const freeShippingProgress = Math.min(100, (discountedSubtotal / freeShippingTarget) * 100);
  const getItemKey = (item) => item.cartKey ?? `${item.id}:${item.weight || 'default'}`;
  const isBusy = isCheckingOut || isMutatingCart || isSyncingCart;
  const activeCouponCode = activeCoupon?.code;

  useEffect(() => {
    if (isAuthenticated) {
      setCouponCode(activeCouponCode || '');
    }
  }, [activeCouponCode, isAuthenticated]);

  const handleApplyCoupon = async () => {
    if (isBusy) {
      return;
    }

    if (isAuthenticated) {
      try {
        const payload = await refreshCart(couponCode.trim());
        const status = payload.cart?.couponStatus || null;
        setCouponMessage(status?.message || 'Coupon updated.');

        if (!status?.valid) {
          setAppliedCoupon(null);
        }
      } catch (error) {
        setCouponMessage(error.message || 'Unable to apply coupon right now.');
      }
      return;
    }

    const validation = validateCoupon(couponCode, total);

    if (!validation.valid) {
      setAppliedCoupon(null);
      setCouponMessage(validation.message);
      return;
    }

    setAppliedCoupon(validation.coupon);
    setCouponCode(validation.coupon.code);
    setCouponMessage(validation.message);
  };

  const handleRemoveCoupon = async () => {
    if (isBusy) {
      return;
    }

    if (isAuthenticated) {
      try {
        const payload = await refreshCart('');
        const status = payload.cart?.couponStatus || null;
        setCouponMessage(status?.message || 'Coupon removed.');
      } catch (error) {
        setCouponMessage(error.message || 'Unable to remove coupon right now.');
      }
    }

    setAppliedCoupon(null);
    setCouponCode('');
    if (!isAuthenticated) {
      setCouponMessage('');
    }
  };

  const handleCheckout = async (event) => {
    event.preventDefault();

    try {
      await checkoutCart({
        couponCode: activeCouponCode,
      });
    } catch {
      // Error state is shown from the cart context.
    }
  };

  return (
    <>
      <div className={`cart-overlay ${isCartOpen ? 'open' : ''}`} onClick={closeCart}></div>
      <aside className={`cart-drawer ${isCartOpen ? 'open' : ''}`} role="dialog" aria-modal="true" aria-label="Shopping cart">
        <div className="cart-header">
          <h3>{lastOrder ? 'Order Confirmed' : `Your Ritual (${totalItems})`}</h3>
          <button type="button" onClick={closeCart} className="close-btn" aria-label="Close cart"><X size={24} /></button>
        </div>
        
        <div className="cart-body">
          {lastOrder ? (
            <div className="order-confirmation">
              <p className="order-kicker">Premium checkout complete</p>
              <h4>{lastOrder.orderNumber}</h4>
              <p>Your archive order has been confirmed and is being prepared for dispatch.</p>
              <div className="order-summary-line">
                <span>Total</span>
                <strong>{formatCurrency(lastOrder.total, lastOrder.currency || 'INR')}</strong>
              </div>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="empty-cart">Your cart is empty. Discover our collection.</div>
          ) : (
            cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <img src={item.img} alt={item.title} className="cart-item-img" onError={(event) => handleProductImageError(event, item)} />
                <div className="cart-item-info">
                  <h4>{item.title}</h4>
                  <span className="cart-item-price">{formatCurrency(item.price, item.currency)}</span>
                  <span className="cart-item-weight">{item.weight}</span>
                  
                  <div className="cart-item-actions">
                    <div className="qty-selector">
                      <button type="button" onClick={() => updateQuantity(getItemKey(item), -1)} aria-label={`Decrease ${item.title} ${item.weight} quantity`} disabled={isBusy}><Minus size={14} /></button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(getItemKey(item), 1)} aria-label={`Increase ${item.title} ${item.weight} quantity`} disabled={isBusy}><Plus size={14} /></button>
                    </div>
                    <button type="button" onClick={() => removeFromCart(getItemKey(item))} className="remove-btn" aria-label={`Remove ${item.title} ${item.weight}`} disabled={isBusy}><Trash2 size={16}/></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {checkoutError && <p className="cart-error">{checkoutError}</p>}

        {cartItems.length > 0 && !lastOrder && (
          <form className="cart-footer" onSubmit={handleCheckout}>
            <div className="cart-progress" aria-label="Free shipping progress">
              <div className="cart-progress-copy">
                <span>{freeShippingRemaining === 0 ? 'Complimentary shipping unlocked' : `${formatCurrency(freeShippingRemaining, cartCurrency)} away from complimentary shipping`}</span>
              </div>
              <div className="cart-progress-track">
                <span style={{ width: `${freeShippingProgress}%` }}></span>
              </div>
            </div>
            <div className="cart-coupon">
              <label className="cart-field">
                <span>Coupon</span>
                <div className="cart-coupon-row">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(event) => setCouponCode(event.target.value)}
                    placeholder="CRAFT10"
                    disabled={isBusy || (Boolean(appliedCoupon) && !isAuthenticated) || Boolean(activeCouponCode)}
                  />
                  {(isAuthenticated ? Boolean(activeCouponCode) : Boolean(appliedCoupon)) ? (
                    <button type="button" className="btn-text" onClick={handleRemoveCoupon} disabled={isBusy}>Remove</button>
                  ) : (
                    <button type="button" className="btn-text" onClick={handleApplyCoupon} disabled={isBusy || !couponCode.trim()}>Apply</button>
                  )}
                </div>
              </label>
              <p className={`cart-coupon-note ${activeCouponCode ? 'success' : ''}`}>
                {isAuthenticated
                  ? backendCouponStatus?.message || couponMessage || 'Try CRAFT10, FIRST15, or ESTATE20.'
                  : (appliedCouponValidation && !appliedCouponValidation.valid ? appliedCouponValidation.message : couponMessage || 'Try CRAFT10, FIRST15, or ESTATE20.')}
              </p>
            </div>
            <div className="cart-total">
              <span>Subtotal</span>
              <span>{formatCurrency(total, cartCurrency)}</span>
            </div>
            {discount > 0 && (
              <div className="cart-total cart-discount">
                <span>{activeCouponCode}</span>
                <span>-{formatCurrency(discount, cartCurrency)}</span>
              </div>
            )}
            <p className="cart-taxes">Shipping & taxes calculated at checkout.</p>
            <button type="submit" className="btn-primary full-width" disabled={isBusy}>
              {isCheckingOut ? 'Confirming Order...' : 'Proceed to Checkout'}
            </button>
          </form>
        )}
      </aside>
    </>
  );
}
