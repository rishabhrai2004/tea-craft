import { useEffect, useState } from 'react';
import { createOrder } from '../lib/api';
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

export function CartProvider({ children }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState(() => readStoredCart());
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [lastOrder, setLastOrder] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const toggleCart = () => setIsCartOpen(!isCartOpen);
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const clearCart = () => setCartItems([]);

  const addToCart = (product) => {
    setLastOrder(null);
    setCheckoutError('');
    setCartItems(prev => {
      const normalized = toCartItem(product);
      const existing = prev.find(item => getCartItemKey(item) === normalized.cartKey);
      if (existing) {
        return prev.map(item => getCartItemKey(item) === normalized.cartKey ? { ...item, ...normalized, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...normalized, quantity: 1 }];
    });
    openCart();
  };

  const removeFromCart = (cartKey) => {
    setCartItems(prev => prev.filter(item => getCartItemKey(item) !== cartKey));
  };

  const updateQuantity = (cartKey, delta) => {
    setCartItems(prev => prev.map(item => {
      if (getCartItemKey(item) === cartKey) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const checkoutCart = async (customer = {}) => {
    if (!cartItems.length || isCheckingOut) {
      return null;
    }

    setIsCheckingOut(true);
    setCheckoutError('');

    try {
      const order = await createOrder(
        cartItems.map((item) => ({ id: item.id, quantity: item.quantity, weight: item.weight })),
        customer,
      );
      setLastOrder(order.order);
      clearCart();
      return order.order;
    } catch (error) {
      setCheckoutError(error.message || 'Unable to complete checkout.');
      throw error;
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <CartContext.Provider value={{ isCartOpen, toggleCart, openCart, closeCart, cartItems, addToCart, removeFromCart, updateQuantity, clearCart, total, checkoutCart, isCheckingOut, checkoutError, lastOrder }}>
      {children}
    </CartContext.Provider>
  );
}
