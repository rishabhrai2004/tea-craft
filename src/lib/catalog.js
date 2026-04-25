export function formatCurrency(value, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

export function toCartItem(product) {
  return {
    id: product.id,
    title: product.title ?? product.name,
    name: product.name ?? product.title,
    price: Number(product.price ?? 0),
    img: product.img,
    origin: product.origin ?? product.region ?? '',
    type: product.type ?? product.category ?? '',
    weight: product.weight ?? '',
    tag: product.tag ?? null,
  };
}

export function getProductLabel(product) {
  return product.title ?? product.name ?? 'Tea';
}
