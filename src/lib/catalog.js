export const DEFAULT_CURRENCY = 'INR';

export function formatCurrency(value, currency = DEFAULT_CURRENCY) {
  const resolvedCurrency = currency || DEFAULT_CURRENCY;

  return new Intl.NumberFormat(resolvedCurrency === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency: resolvedCurrency,
    maximumFractionDigits: resolvedCurrency === 'INR' ? 0 : 2,
  }).format(Number(value) || 0);
}

export function getWeightOptions(product = {}) {
  if (Array.isArray(product.weightOptions) && product.weightOptions.length > 0) {
    return product.weightOptions.map((option) => ({
      label: option.label,
      grams: Number(option.grams) || Number.parseInt(option.label, 10) || 0,
      price: Number(option.price) || 0,
    }));
  }

  return [
    {
      label: product.weight || '100g',
      grams: Number.parseInt(product.weight || '100', 10) || 100,
      price: Number(product.price ?? 0),
    },
  ];
}

export function getDefaultWeightOption(product = {}) {
  return getWeightOptions(product)[0];
}

export function getSelectedWeightOption(product = {}, weightLabel) {
  const options = getWeightOptions(product);
  return options.find((option) => option.label === weightLabel) || options[0];
}

export function withSelectedWeight(product, weightLabel) {
  const selectedOption = getSelectedWeightOption(product, weightLabel);

  return {
    ...product,
    price: selectedOption.price,
    weight: selectedOption.label,
    weightGrams: selectedOption.grams,
    cartKey: `${product.id}:${selectedOption.label}`,
  };
}

export function toCartItem(product) {
  const selectedOption = getSelectedWeightOption(product, product.weight);
  const weight = selectedOption.label || product.weight || '';

  return {
    id: product.id,
    cartKey: product.cartKey ?? `${product.id}:${weight || 'default'}`,
    title: product.title ?? product.name,
    name: product.name ?? product.title,
    price: Number(product.price ?? selectedOption.price ?? 0),
    currency: product.currency ?? DEFAULT_CURRENCY,
    img: product.img,
    origin: product.origin ?? product.region ?? '',
    type: product.type ?? product.category ?? '',
    weight,
    weightGrams: selectedOption.grams,
    tag: product.tag ?? null,
  };
}

export function getProductLabel(product) {
  return product.title ?? product.name ?? 'Tea';
}

export function getProductImageFallback(product = {}) {
  const haystack = `${product.title || ''} ${product.type || ''} ${product.origin || ''}`.toLowerCase();

  if (haystack.includes('white') || haystack.includes('oolong') || haystack.includes('yellow')) {
    return '/darjeeling_tea.png';
  }

  if (haystack.includes('green') || haystack.includes('matcha') || haystack.includes('guayusa')) {
    return '/kerala_tea.png';
  }

  if (haystack.includes('herbal') || haystack.includes('butterfly') || haystack.includes('purple') || haystack.includes('mate')) {
    return '/macro_tea.png';
  }

  return '/assam_tea.png';
}

export function handleProductImageError(event, product) {
  event.currentTarget.onerror = null;
  event.currentTarget.src = getProductImageFallback(product);
}
