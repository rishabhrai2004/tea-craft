import { useEffect, useState } from 'react';
import {
  clearServerCart,
  createOrder,
  deleteCartItem,
  fetchCart,
  patchCartItem,
  upsertCartItem,
} from '../lib/api';
import { toCartItem } from '../lib/catalog';
import { CartContext } from './cart-store';
const CART_STORAGE_KEY = 'teaCraft.cart.v1';

function getCartItemKey(item) {
  return item.cartKey ?? `${item.id}:${item.weight || 'default'}`;
}

function readStoredCart() {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item) => item.currency === 'INR') : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children, account, onRequireAuth }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState(() => readStoredCart());
  const [cartSummary, setCartSummary] = useState(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isMutatingCart, setIsMutatingCart] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [lastOrder, setLastOrder] = useState(null);
  const [isSyncingCart, setIsSyncingCart] = useState(false);

  const isAuthenticated = Boolean(account?.id);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!isAuthenticated) {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated]);

  const refreshCart = async (couponCode = '') => {
    if (!isAuthenticated) {
      return { cart: null };
    }

    const payload = await fetchCart(couponCode);
    setCartItems(payload.cart?.items || []);
    setCartSummary(payload.cart || null);
    return payload;
  };

  useEffect(() => {
    let active = true;

    async function syncAuthenticatedCart() {
      if (!isAuthenticated) {
        if (active) {
          setIsSyncingCart(false);
          setCartSummary(null);
        }
        return;
      }

      setIsSyncingCart(true);
      setCheckoutError('');

      try {
        const guestCart = readStoredCart();

        if (guestCart.length > 0) {
          for (const guestItem of guestCart) {
            await upsertCartItem({
              id: guestItem.id,
              weight: guestItem.weight,
              quantity: guestItem.quantity,
            });
          }

          if (typeof window !== 'undefined') {
            window.localStorage.removeItem(CART_STORAGE_KEY);
          }
        }

        const payload = await fetchCart();
        if (active) {
          setCartItems(payload.cart?.items || []);
          setCartSummary(payload.cart || null);
        }
      } catch (error) {
        if (active) {
          setCheckoutError(error.message || 'Unable to sync cart right now.');
        }
      } finally {
        if (active) {
          setIsSyncingCart(false);
        }
      }
    }

    syncAuthenticatedCart();

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  const toggleCart = () => setIsCartOpen(!isCartOpen);
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const clearCart = () => setCartItems([]);

  const addToCart = async (product) => {
    setLastOrder(null);
    setCheckoutError('');
    const normalized = toCartItem(product);

    if (isAuthenticated) {
      setIsMutatingCart(true);
      try {
        const payload = await upsertCartItem({
          id: normalized.id,
          weight: normalized.weight,
          quantity: 1,
        });
        setCartItems(payload.cart?.items || []);
        setCartSummary(payload.cart || null);
      } catch (error) {
        setCheckoutError(error.message || 'Unable to add item to cart.');
      } finally {
        setIsMutatingCart(false);
      }
    } else {
      setCartItems((prev) => {
        const existing = prev.find((item) => getCartItemKey(item) === normalized.cartKey);
        if (existing) {
          return prev.map((item) => (
            getCartItemKey(item) === normalized.cartKey
              ? { ...item, ...normalized, quantity: item.quantity + 1 }
              : item
          ));
        }
        return [...prev, { ...normalized, quantity: 1 }];
      });
    }

    openCart();
  };

  const removeFromCart = async (cartKey) => {
    setCheckoutError('');
    if (isAuthenticated) {
      setIsMutatingCart(true);
      try {
        const payload = await deleteCartItem(cartKey);
        setCartItems(payload.cart?.items || []);
        setCartSummary(payload.cart || null);
      } catch (error) {
        setCheckoutError(error.message || 'Unable to remove item from cart.');
      } finally {
        setIsMutatingCart(false);
      }
      return;
    }

    setCartItems((prev) => prev.filter((item) => getCartItemKey(item) !== cartKey));
  };

  const updateQuantity = async (cartKey, delta) => {
    setCheckoutError('');
    if (isAuthenticated) {
      setIsMutatingCart(true);
      try {
        const payload = await patchCartItem(cartKey, { delta });
        setCartItems(payload.cart?.items || []);
        setCartSummary(payload.cart || null);
      } catch (error) {
        setCheckoutError(error.message || 'Unable to update quantity.');
      } finally {
        setIsMutatingCart(false);
      }
      return;
    }

    setCartItems((prev) => prev.map((item) => {
      if (getCartItemKey(item) === cartKey) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const total = isAuthenticated && cartSummary
    ? Number(cartSummary.subtotal || 0)
    : cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const checkoutCart = async (customer = {}) => {
    if (!cartItems.length || isCheckingOut) {
      return null;
    }

    if (!isAuthenticated) {
      setCheckoutError('Please sign in to complete checkout.');
      if (typeof onRequireAuth === 'function') {
        onRequireAuth();
      }
      throw new Error('Authentication required');
    }

    setIsCheckingOut(true);
    setCheckoutError('');

    try {
      const order = await createOrder([], customer);
      setLastOrder(order.order);
      const clearPayload = await clearServerCart();
      setCartItems(clearPayload.cart?.items || []);
      setCartSummary(clearPayload.cart || null);
      return order.order;
    } catch (error) {
      setCheckoutError(error.message || 'Unable to complete checkout.');
      throw error;
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <CartContext.Provider value={{
      isCartOpen,
      toggleCart,
      openCart,
      closeCart,
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      total,
      cartSummary,
      refreshCart,
      checkoutCart,
      isCheckingOut,
      isMutatingCart,
      isSyncingCart,
      checkoutError,
      lastOrder,
      isAuthenticated,
    }}>
      {children}
    </CartContext.Provider>
  );
}
