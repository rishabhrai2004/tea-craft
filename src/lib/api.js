async function requestJson(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(payload.message || 'Request failed');
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export async function fetchProducts(query = '') {
  const url = query ? `/api/products?q=${encodeURIComponent(query)}` : '/api/products';
  const payload = await requestJson(url);
  return payload.products || [];
}

export async function searchProducts(query = '') {
  const payload = await requestJson(`/api/search?q=${encodeURIComponent(query)}`);
  return payload.results || [];
}

export async function submitNewsletterSignup(email) {
  return requestJson('/api/newsletter-signups', {
    method: 'POST',
    body: JSON.stringify({
      email,
      consent: true,
      source: 'newsletter-section',
    }),
  });
}

export async function createOrder(items, customer = {}) {
  return requestJson('/api/orders', {
    method: 'POST',
    body: JSON.stringify({ items, ...customer }),
  });
}

export async function registerAccount(payload) {
  return requestJson('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function loginAccount(payload) {
  return requestJson('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function logoutAccount() {
  return requestJson('/api/auth/logout', {
    method: 'POST',
  });
}

export async function fetchAuthSession() {
  return requestJson('/api/auth/session');
}

export async function fetchCart(couponCode = '') {
  const suffix = couponCode ? `?couponCode=${encodeURIComponent(couponCode)}` : '';
  return requestJson(`/api/cart${suffix}`);
}

export async function upsertCartItem(item) {
  return requestJson('/api/cart/items', {
    method: 'PUT',
    body: JSON.stringify(item),
  });
}

export async function patchCartItem(cartKey, patch) {
  return requestJson(`/api/cart/items/${encodeURIComponent(cartKey)}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

export async function deleteCartItem(cartKey) {
  return requestJson(`/api/cart/items/${encodeURIComponent(cartKey)}`, {
    method: 'DELETE',
  });
}

export async function clearServerCart() {
  return requestJson('/api/cart', {
    method: 'DELETE',
  });
}
