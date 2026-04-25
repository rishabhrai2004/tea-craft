async function requestJson(path, options = {}) {
  const response = await fetch(path, {
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
