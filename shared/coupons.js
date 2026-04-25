export const COUPONS = [
  {
    code: 'CRAFT10',
    label: 'Craft 10',
    type: 'percent',
    value: 10,
    minSubtotal: 0,
    applyOn: 'total',
  },
  {
    code: 'FIRST15',
    label: 'First Steep 15',
    type: 'percent',
    value: 15,
    minSubtotal: 899,
    applyOn: 'subtotal',
    oneTimePerCustomer: true,
  },
  {
    code: 'ESTATE20',
    label: 'Estate 20',
    type: 'percent',
    value: 20,
    minSubtotal: 4999,
    applyOn: 'subtotal',
  },
];

export function normalizeCouponCode(code = '') {
  return String(code).trim().toUpperCase();
}

export function getCoupon(code) {
  const normalizedCode = normalizeCouponCode(code);
  return COUPONS.find((coupon) => coupon.code === normalizedCode) || null;
}

export function calculateCouponDiscount(coupon, amount) {
  const normalizedAmount = Math.max(0, Number(amount) || 0);

  if (!coupon || normalizedAmount <= 0) {
    return 0;
  }

  if (coupon.type === 'percent') {
    return Math.round((normalizedAmount * coupon.value) / 100);
  }

  return Math.round(Math.min(normalizedAmount, Number(coupon.value) || 0));
}

export function validateCoupon(code, subtotal, context = {}) {
  const normalizedCode = normalizeCouponCode(code);

  if (!normalizedCode) {
    return {
      valid: false,
      message: 'Enter a coupon code.',
    };
  }

  const coupon = getCoupon(normalizedCode);

  if (!coupon) {
    return {
      valid: false,
      message: 'That coupon is not available.',
    };
  }

  const normalizedSubtotal = Math.max(0, Number(subtotal) || 0);

  if (coupon.oneTimePerCustomer && context.first15AlreadyUsed) {
    return {
      valid: false,
      coupon,
      message: `${coupon.code} can be used only once per account.`,
    };
  }

  if (normalizedSubtotal < coupon.minSubtotal) {
    return {
      valid: false,
      coupon,
      message: `${coupon.code} unlocks at INR ${coupon.minSubtotal.toLocaleString('en-IN')}.`,
    };
  }

  return {
    valid: true,
    coupon,
    discount: calculateCouponDiscount(coupon, normalizedSubtotal),
    message: `${coupon.code} applied.`,
  };
}
