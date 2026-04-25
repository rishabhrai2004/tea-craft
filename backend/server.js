import { createServer as createViteServer } from 'vite';
import http from 'http';
import { readFile, writeFile, mkdir, access } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { calculateCouponDiscount, validateCoupon } from '../shared/coupons.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const dataDir = path.join(__dirname, 'data');
const port = Number(process.env.PORT || 5173);
const isProduction = process.env.NODE_ENV === 'production' || process.argv.includes('--prod');
const sessionSecret = process.env.SESSION_SECRET || 'tea-craft-dev-session-secret';
const sessionCookieName = 'teaCraftSession';
const sessionTtlMs = 1000 * 60 * 60 * 24 * 14;

const productsFile = path.join(dataDir, 'products.json');
const newsletterFile = path.join(dataDir, 'newsletter-signups.json');
const ordersFile = path.join(dataDir, 'orders.json');
const usersFile = path.join(dataDir, 'users.json');
const cartsFile = path.join(dataDir, 'carts.json');

const jsonHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
};

async function readJson(filePath, fallback) {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(value, null, 2));
}

async function ensureStore(filePath, fallback) {
  try {
    await access(filePath);
  } catch {
    await writeJson(filePath, fallback);
  }
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, jsonHeaders);
  res.end(JSON.stringify(payload));
}

function sendText(res, statusCode, text, contentType = 'text/plain; charset=utf-8') {
  res.writeHead(statusCode, {
    'Content-Type': contentType,
    'Cache-Control': 'no-store',
  });
  res.end(text);
}

async function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error('Request body too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('Invalid JSON payload'));
      }
    });
    req.on('error', reject);
  });
}

async function getProducts() {
  return readJson(productsFile, []);
}

async function getUsers() {
  return readJson(usersFile, []);
}

async function saveUsers(users) {
  await writeJson(usersFile, users);
}

async function getCartRecords() {
  return readJson(cartsFile, []);
}

async function saveCartRecords(records) {
  await writeJson(cartsFile, records);
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const derived = crypto.scryptSync(String(password), salt, 64);
  return {
    salt,
    hash: derived.toString('hex'),
  };
}

function verifyPassword(password, salt, hash) {
  try {
    const expected = Buffer.from(String(hash || ''), 'hex');
    const supplied = crypto.scryptSync(String(password), String(salt), 64);

    if (expected.length !== supplied.length) {
      return false;
    }

    return crypto.timingSafeEqual(expected, supplied);
  } catch {
    return false;
  }
}

function parseCookieHeader(cookieHeader = '') {
  return String(cookieHeader)
    .split(';')
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .reduce((acc, chunk) => {
      const separator = chunk.indexOf('=');
      if (separator <= 0) {
        return acc;
      }
      const key = chunk.slice(0, separator).trim();
      const value = chunk.slice(separator + 1).trim();
      acc[key] = decodeURIComponent(value);
      return acc;
    }, {});
}

function createSessionToken(userId) {
  const expiresAt = Date.now() + sessionTtlMs;
  const payload = `${userId}.${expiresAt}`;
  const signature = crypto.createHmac('sha256', sessionSecret).update(payload).digest('hex');
  return `${payload}.${signature}`;
}

function readSessionToken(req) {
  const cookies = parseCookieHeader(req.headers.cookie || '');
  return cookies[sessionCookieName] || null;
}

function verifySessionToken(token) {
  if (!token) {
    return null;
  }

  const [userId, expiresAtRaw, signature] = String(token).split('.');
  if (!userId || !expiresAtRaw || !signature) {
    return null;
  }

  const payload = `${userId}.${expiresAtRaw}`;
  const expectedSignature = crypto.createHmac('sha256', sessionSecret).update(payload).digest('hex');

  if (expectedSignature.length !== signature.length) {
    return null;
  }

  const expectedBuffer = Buffer.from(expectedSignature, 'hex');
  const suppliedBuffer = Buffer.from(signature, 'hex');

  if (expectedBuffer.length !== suppliedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, suppliedBuffer)) {
    return null;
  }

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) {
    return null;
  }

  return {
    userId,
    expiresAt,
  };
}

function setSessionCookie(res, token) {
  const secure = isProduction ? '; Secure' : '';
  const maxAge = Math.floor(sessionTtlMs / 1000);
  res.setHeader('Set-Cookie', `${sessionCookieName}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`);
}

function clearSessionCookie(res) {
  const secure = isProduction ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${sessionCookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`);
}

function sanitizeUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  };
}

function getProductById(products, id) {
  return products.find((entry) => String(entry.id) === String(id));
}

function getPackDiscountRate(multiplier) {
  if (multiplier >= 10) {
    return 0.1;
  }

  if (multiplier >= 5) {
    return 0.06;
  }

  if (multiplier >= 2) {
    return 0.02;
  }

  return 0;
}

function normalizeWeightOptions(product) {
  const rawOptions = Array.isArray(product.weightOptions) && product.weightOptions.length > 0
    ? product.weightOptions
    : [{
        label: product.weight || '100g',
        grams: Number.parseInt(product.weight || '100', 10) || 100,
        price: Number(product.price) || 0,
      }];

  const normalized = rawOptions
    .map((option) => ({
      label: option.label,
      grams: Number(option.grams) || Number.parseInt(option.label || '0', 10) || 0,
      price: Math.max(1, Number(option.price) || 0),
    }))
    .filter((option) => option.grams > 0)
    .sort((a, b) => a.grams - b.grams);

  if (!normalized.length) {
    return [{ label: '100g', grams: 100, price: 0 }];
  }

  const baseOption = normalized[0];
  const baseUnitPrice = baseOption.price / Math.max(1, baseOption.grams);

  return normalized.map((option, index) => {
    if (index === 0) {
      return option;
    }

    const multiplier = option.grams / Math.max(1, baseOption.grams);
    const discountRate = getPackDiscountRate(multiplier);
    const linearPrice = baseUnitPrice * option.grams;
    const encouragedPrice = Math.round(linearPrice * (1 - discountRate));
    const effectivePrice = Math.min(option.price, Math.max(1, encouragedPrice));

    return {
      ...option,
      price: effectivePrice,
    };
  });
}

function toCartLineItem(product, weight, quantity) {
  const selectedWeight = getProductWeightOption(product, String(weight || ''));
  const price = Number(selectedWeight.price);
  const normalizedQuantity = Math.max(1, Number(quantity || 1));
  const cartKey = `${product.id}:${selectedWeight.label || 'default'}`;

  return {
    id: product.id,
    cartKey,
    title: product.title,
    price,
    currency: product.currency || 'INR',
    weight: selectedWeight.label,
    weightGrams: selectedWeight.grams,
    quantity: normalizedQuantity,
    subtotal: price * normalizedQuantity,
    img: product.img,
    origin: product.origin || '',
    type: product.type || '',
  };
}

function mergeCartItems(baseItems, incomingItems) {
  const merged = [...baseItems];

  for (const nextItem of incomingItems) {
    const existingIndex = merged.findIndex((item) => item.cartKey === nextItem.cartKey);

    if (existingIndex >= 0) {
      merged[existingIndex] = {
        ...merged[existingIndex],
        ...nextItem,
        quantity: Math.max(1, Number(merged[existingIndex].quantity || 0) + Number(nextItem.quantity || 0)),
      };
      merged[existingIndex].subtotal = merged[existingIndex].price * merged[existingIndex].quantity;
    } else {
      merged.push({
        ...nextItem,
        quantity: Math.max(1, Number(nextItem.quantity || 1)),
        subtotal: Number(nextItem.price || 0) * Math.max(1, Number(nextItem.quantity || 1)),
      });
    }
  }

  return merged;
}

function normalizeCartItem(item) {
  const quantity = Math.max(1, Number(item.quantity || 1));
  const price = Number(item.price || 0);

  return {
    ...item,
    quantity,
    price,
    subtotal: price * quantity,
  };
}

async function readUserFromRequest(req) {
  const session = verifySessionToken(readSessionToken(req));
  if (!session) {
    return null;
  }

  const users = await getUsers();
  const user = users.find((entry) => entry.id === session.userId);
  return user || null;
}

async function readUserCart(userId) {
  const cartRecords = await getCartRecords();
  const existing = cartRecords.find((entry) => entry.userId === userId);
  return {
    records: cartRecords,
    record: existing || null,
    items: Array.isArray(existing?.items) ? existing.items.map(normalizeCartItem) : [],
  };
}

function summarizeCart(items, couponCode = '') {
  const normalizedItems = items.map(normalizeCartItem);
  const subtotal = normalizedItems.reduce((sum, item) => sum + item.subtotal, 0);
  const couponValidation = couponCode ? validateCoupon(couponCode, subtotal) : null;
  const shipping = subtotal >= 2500 ? 0 : normalizedItems.length ? 99 : 0;
  const tax = Math.round(subtotal * 0.05);
  const grossTotal = Math.round(subtotal + shipping + tax);
  const discountBase = couponValidation?.coupon?.applyOn === 'total' ? grossTotal : subtotal;
  const discount = couponValidation?.valid
    ? calculateCouponDiscount(couponValidation.coupon, discountBase)
    : 0;
  const total = Math.max(0, Math.round(grossTotal - discount));
  const currency = normalizedItems[0]?.currency || 'INR';
  const itemCount = normalizedItems.reduce((count, item) => count + item.quantity, 0);

  return {
    items: normalizedItems,
    currency,
    itemCount,
    subtotal: Number(subtotal.toFixed(2)),
    discount,
    coupon: couponValidation?.valid
      ? {
          code: couponValidation.coupon.code,
          label: couponValidation.coupon.label,
          value: couponValidation.coupon.value,
        }
      : null,
    couponStatus: couponCode
      ? {
          valid: Boolean(couponValidation?.valid),
          message: couponValidation?.message || 'Enter a coupon code.',
        }
      : null,
    shipping,
    tax,
    grossTotal,
    total,
  };
}

async function writeUserCart(userId, items) {
  const cartRecords = await getCartRecords();
  const existingIndex = cartRecords.findIndex((entry) => entry.userId === userId);
  const normalizedItems = items.map(normalizeCartItem);
  const nextRecord = {
    userId,
    items: normalizedItems,
    updatedAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    cartRecords[existingIndex] = nextRecord;
  } else {
    cartRecords.push(nextRecord);
  }

  await saveCartRecords(cartRecords);
  return normalizedItems;
}

async function mergeIncomingCartItems(userId, incomingItems = []) {
  if (!Array.isArray(incomingItems) || incomingItems.length === 0) {
    const current = await readUserCart(userId);
    return current.items;
  }

  const products = await getProducts();
  const normalizedIncoming = incomingItems
    .map((item) => {
      const product = getProductById(products, item.id);
      if (!product) {
        return null;
      }

      return toCartLineItem(product, item.weight, item.quantity);
    })
    .filter(Boolean);

  if (!normalizedIncoming.length) {
    const current = await readUserCart(userId);
    return current.items;
  }

  const { items: currentItems } = await readUserCart(userId);
  const mergedItems = mergeCartItems(currentItems, normalizedIncoming);
  return writeUserCart(userId, mergedItems);
}

function getProductWeightOption(product, requestedWeight) {
  const options = normalizeWeightOptions(product);

  if (options.length === 0) {
    return {
      label: product.weight || '',
      grams: Number.parseInt(product.weight || '0', 10) || 0,
      price: Number(product.price) || 0,
    };
  }

  return options.find((option) => option.label === requestedWeight) || options[0];
}

function getUserCouponContext(user, orders) {
  const userId = user?.id;
  const userEmail = normalizeEmail(user?.email);

  const first15AlreadyUsed = orders.some((order) => {
    if (order?.coupon?.code !== 'FIRST15') {
      return false;
    }

    return order?.customer?.userId === userId
      || normalizeEmail(order?.customer?.email) === userEmail;
  });

  return {
    first15AlreadyUsed,
  };
}

async function handleApi(req, res, parsedUrl) {
  const { pathname, searchParams } = parsedUrl;
  const currentUser = await readUserFromRequest(req);

  if (req.method === 'GET' && pathname === '/api/health') {
    const products = await getProducts();
    return sendJson(res, 200, {
      ok: true,
      status: 'premium-ready',
      products: products.length,
      timestamp: new Date().toISOString(),
    });
  }

  if (req.method === 'GET' && pathname === '/api/products') {
    const products = await getProducts();
    const query = String(searchParams.get('q') || '').trim().toLowerCase();
    const featuredOnly = searchParams.get('featured') === 'true';

    let filtered = products;
    if (featuredOnly) {
      filtered = filtered.filter((product) => product.featured);
    }

    if (query) {
      filtered = filtered.filter((product) => {
        const haystack = [product.title, product.origin, product.type, product.description, ...(product.notes || [])]
          .join(' ')
          .toLowerCase();
        return haystack.includes(query);
      });
    }

    return sendJson(res, 200, {
      products: filtered,
      total: filtered.length,
      featured: products.filter((product) => product.featured).length,
    });
  }

  if (req.method === 'GET' && pathname.startsWith('/api/products/')) {
    const lookup = pathname.split('/').pop();
    const products = await getProducts();
    const product = products.find((item) => String(item.id) === lookup || item.slug === lookup);

    if (!product) {
      return sendJson(res, 404, { message: 'Product not found' });
    }

    return sendJson(res, 200, { product });
  }

  if (req.method === 'GET' && pathname === '/api/search') {
    const query = String(searchParams.get('q') || '').trim().toLowerCase();
    const products = await getProducts();
    const results = query
      ? products.filter((product) => {
          const haystack = [product.title, product.origin, product.type, product.description, ...(product.notes || [])]
            .join(' ')
            .toLowerCase();
          return haystack.includes(query);
        })
      : products.filter((product) => product.featured);

    return sendJson(res, 200, {
      query,
      results,
    });
  }

  if (req.method === 'POST' && pathname === '/api/newsletter-signups') {
    const body = await readRequestBody(req);
    const email = String(body.email || '').trim().toLowerCase();
    const consent = Boolean(body.consent ?? true);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return sendJson(res, 400, { message: 'Please enter a valid email address.' });
    }

    const signups = await readJson(newsletterFile, []);
    const existing = signups.find((entry) => entry.email === email);

    if (existing) {
      return sendJson(res, 200, {
        message: 'You are already on the inner circle list.',
        signup: existing,
      });
    }

    const signup = {
      id: `nl_${Date.now()}`,
      email,
      consent,
      source: String(body.source || 'newsletter-section'),
      createdAt: new Date().toISOString(),
    };

    signups.unshift(signup);
    await writeJson(newsletterFile, signups);

    return sendJson(res, 201, {
      message: 'Welcome to the inner circle.',
      signup,
    });
  }

  if (req.method === 'POST' && pathname === '/api/auth/register') {
    const body = await readRequestBody(req);
    const email = normalizeEmail(body.email);
    const password = String(body.password || '');
    const name = String(body.name || '').trim();

    if (!isValidEmail(email)) {
      return sendJson(res, 400, { message: 'Enter a valid email address.' });
    }

    if (password.length < 6) {
      return sendJson(res, 400, { message: 'Password must be at least 6 characters.' });
    }

    const users = await getUsers();
    if (users.some((user) => user.email === email)) {
      return sendJson(res, 409, { message: 'An account already exists with this email.' });
    }

    const hash = hashPassword(password);
    const user = {
      id: `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      email,
      name: name || email.split('@')[0],
      passwordHash: hash.hash,
      passwordSalt: hash.salt,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    users.unshift(user);
    await saveUsers(users);

    const token = createSessionToken(user.id);
    setSessionCookie(res, token);

    const items = await mergeIncomingCartItems(user.id, body.mergeCart);
    const cart = summarizeCart(items);

    return sendJson(res, 201, {
      message: 'Account created successfully.',
      user: sanitizeUser(user),
      cart,
    });
  }

  if (req.method === 'POST' && pathname === '/api/auth/login') {
    const body = await readRequestBody(req);
    const email = normalizeEmail(body.email);
    const password = String(body.password || '');

    if (!isValidEmail(email) || !password) {
      return sendJson(res, 400, { message: 'Enter a valid email and password.' });
    }

    const users = await getUsers();
    const user = users.find((entry) => entry.email === email);

    if (!user || !verifyPassword(password, user.passwordSalt, user.passwordHash)) {
      return sendJson(res, 401, { message: 'Incorrect email or password.' });
    }

    user.lastLoginAt = new Date().toISOString();
    await saveUsers(users);

    const token = createSessionToken(user.id);
    setSessionCookie(res, token);

    const items = await mergeIncomingCartItems(user.id, body.mergeCart);
    const cart = summarizeCart(items);

    return sendJson(res, 200, {
      message: 'Welcome back.',
      user: sanitizeUser(user),
      cart,
    });
  }

  if (req.method === 'POST' && pathname === '/api/auth/logout') {
    clearSessionCookie(res);
    return sendJson(res, 200, { message: 'Signed out.' });
  }

  if (req.method === 'GET' && pathname === '/api/auth/session') {
    if (!currentUser) {
      return sendJson(res, 200, { authenticated: false, user: null, cart: summarizeCart([]) });
    }

    const { items } = await readUserCart(currentUser.id);
    return sendJson(res, 200, {
      authenticated: true,
      user: sanitizeUser(currentUser),
      cart: summarizeCart(items),
    });
  }

  if (req.method === 'GET' && pathname === '/api/cart') {
    if (!currentUser) {
      return sendJson(res, 401, { message: 'Please sign in to access your cart.' });
    }

    const couponCode = String(searchParams.get('couponCode') || '').trim();
    const { items } = await readUserCart(currentUser.id);
    const existingOrders = await readJson(ordersFile, []);
    const couponContext = getUserCouponContext(currentUser, existingOrders);
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const couponValidation = couponCode ? validateCoupon(couponCode, subtotal, couponContext) : null;
    const summary = summarizeCart(items, '');
    const discountBase = couponValidation?.coupon?.applyOn === 'total' ? summary.grossTotal : summary.subtotal;
    const discount = couponValidation?.valid ? calculateCouponDiscount(couponValidation.coupon, discountBase) : 0;
    const total = Math.max(0, Math.round(summary.grossTotal - discount));

    return sendJson(res, 200, {
      cart: {
        ...summary,
        discount,
        total,
        coupon: couponValidation?.valid
          ? {
              code: couponValidation.coupon.code,
              label: couponValidation.coupon.label,
              value: couponValidation.coupon.value,
            }
          : null,
        couponStatus: couponCode
          ? {
              valid: Boolean(couponValidation?.valid),
              message: couponValidation?.message || 'Enter a coupon code.',
            }
          : null,
      },
    });
  }

  if (req.method === 'PUT' && pathname === '/api/cart/items') {
    if (!currentUser) {
      return sendJson(res, 401, { message: 'Please sign in to update your cart.' });
    }

    const body = await readRequestBody(req);
    const productId = body.id ?? body.productId;
    const quantity = Math.max(1, Number(body.quantity || 1));
    const weight = String(body.weight || '');
    const products = await getProducts();
    const product = getProductById(products, productId);

    if (!product) {
      return sendJson(res, 404, { message: 'Product not found.' });
    }

    const nextItem = toCartLineItem(product, weight, quantity);
    const { items: currentItems } = await readUserCart(currentUser.id);
    const mergedItems = mergeCartItems(currentItems, [nextItem]);
    const savedItems = await writeUserCart(currentUser.id, mergedItems);

    return sendJson(res, 200, {
      message: 'Cart updated.',
      cart: summarizeCart(savedItems),
    });
  }

  if (req.method === 'PATCH' && pathname.startsWith('/api/cart/items/')) {
    if (!currentUser) {
      return sendJson(res, 401, { message: 'Please sign in to update your cart.' });
    }

    const cartKey = decodeURIComponent(pathname.split('/').pop() || '');
    const body = await readRequestBody(req);
    const nextQuantity = Number(body.quantity);
    const delta = Number(body.delta || 0);

    const { items: currentItems } = await readUserCart(currentUser.id);
    const nextItems = currentItems
      .map((item) => {
        if (item.cartKey !== cartKey) {
          return item;
        }

        const quantity = Number.isFinite(nextQuantity)
          ? nextQuantity
          : Math.max(1, Number(item.quantity || 1) + delta);

        return normalizeCartItem({ ...item, quantity: Math.max(1, quantity) });
      });

    const savedItems = await writeUserCart(currentUser.id, nextItems);
    return sendJson(res, 200, {
      message: 'Quantity updated.',
      cart: summarizeCart(savedItems),
    });
  }

  if (req.method === 'DELETE' && pathname.startsWith('/api/cart/items/')) {
    if (!currentUser) {
      return sendJson(res, 401, { message: 'Please sign in to update your cart.' });
    }

    const cartKey = decodeURIComponent(pathname.split('/').pop() || '');
    const { items: currentItems } = await readUserCart(currentUser.id);
    const nextItems = currentItems.filter((item) => item.cartKey !== cartKey);
    const savedItems = await writeUserCart(currentUser.id, nextItems);

    return sendJson(res, 200, {
      message: 'Item removed.',
      cart: summarizeCart(savedItems),
    });
  }

  if (req.method === 'DELETE' && pathname === '/api/cart') {
    if (!currentUser) {
      return sendJson(res, 401, { message: 'Please sign in to clear your cart.' });
    }

    const savedItems = await writeUserCart(currentUser.id, []);
    return sendJson(res, 200, {
      message: 'Cart cleared.',
      cart: summarizeCart(savedItems),
    });
  }

  if (req.method === 'POST' && pathname === '/api/orders') {
    if (!currentUser) {
      return sendJson(res, 401, { message: 'Please sign in before checkout.' });
    }

    const body = await readRequestBody(req);
    const { items: orderItemsFromCart } = await readUserCart(currentUser.id);

    if (!orderItemsFromCart.length) {
      return sendJson(res, 400, { message: 'Cart is empty.' });
    }

    const orderItems = orderItemsFromCart.map(normalizeCartItem);

    if (!orderItems.length) {
      return sendJson(res, 400, { message: 'No valid products were found in your cart.' });
    }

    const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    const couponCode = String(body.couponCode || '').trim();
    const existingOrders = await readJson(ordersFile, []);
    const couponContext = getUserCouponContext(currentUser, existingOrders);
    const couponValidation = couponCode ? validateCoupon(couponCode, subtotal, couponContext) : null;

    if (couponCode && !couponValidation.valid) {
      return sendJson(res, 400, { message: couponValidation.message });
    }

    const shipping = subtotal >= 2500 ? 0 : 99;
    const tax = Math.round(subtotal * 0.05);
    const grossTotal = Math.round(subtotal + shipping + tax);
    const discountBase = couponValidation?.coupon?.applyOn === 'total' ? grossTotal : subtotal;
    const discount = couponValidation?.valid
      ? calculateCouponDiscount(couponValidation.coupon, discountBase)
      : 0;
    const total = Math.max(0, Math.round(grossTotal - discount));
    const order = {
      id: `order_${Date.now()}`,
      orderNumber: `CT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      status: 'confirmed',
      customer: {
        email: currentUser.email,
        name: currentUser.name || 'Collector',
        userId: currentUser.id,
      },
      items: orderItems,
      currency: 'INR',
      subtotal: Number(subtotal.toFixed(2)),
      grossTotal,
      discount,
      coupon: couponValidation?.coupon
        ? {
            code: couponValidation.coupon.code,
            label: couponValidation.coupon.label,
            value: couponValidation.coupon.value,
          }
        : null,
      shipping,
      tax,
      total,
      createdAt: new Date().toISOString(),
    };

    existingOrders.unshift(order);
    await writeJson(ordersFile, existingOrders);
    await writeUserCart(currentUser.id, []);

    return sendJson(res, 201, {
      message: 'Your order is confirmed.',
      order,
    });
  }

  return false;
}

async function serveStatic(req, res, parsedUrl) {
  const pathname = parsedUrl.pathname === '/' ? '/index.html' : parsedUrl.pathname;
  const requestedPath = path.normalize(path.join(distDir, pathname));

  if (!requestedPath.startsWith(distDir)) {
    return sendText(res, 403, 'Forbidden');
  }

  try {
    const fileBuffer = await readFile(requestedPath);
    const ext = path.extname(requestedPath).toLowerCase();
    const contentTypes = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.svg': 'image/svg+xml',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp',
      '.json': 'application/json; charset=utf-8',
    };

    res.writeHead(200, {
      'Content-Type': contentTypes[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
    });
    res.end(fileBuffer);
    return true;
  } catch {
    try {
      const html = await readFile(path.join(distDir, 'index.html'), 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
      res.end(html);
      return true;
    } catch {
      sendText(res, 404, 'Not found');
      return true;
    }
  }
}

async function serveViteApp(req, res, parsedUrl, vite) {
  try {
    const template = await readFile(path.join(projectRoot, 'index.html'), 'utf8');
    const html = await vite.transformIndexHtml(parsedUrl.pathname, template);
    sendText(res, 200, html, 'text/html; charset=utf-8');
  } catch (error) {
    vite.ssrFixStacktrace(error);
    throw error;
  }
}

async function start() {
  await mkdir(dataDir, { recursive: true });
  await ensureStore(productsFile, []);
  await ensureStore(newsletterFile, []);
  await ensureStore(ordersFile, []);
  await ensureStore(usersFile, []);
  await ensureStore(cartsFile, []);

  const vite = isProduction
    ? null
    : await createViteServer({
        appType: 'custom',
        server: { middlewareMode: true },
        root: projectRoot,
      });

  const server = http.createServer(async (req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);

    try {
      const handled = await handleApi(req, res, parsedUrl);
      if (handled !== false) {
        return;
      }

      if (!isProduction && vite) {
        vite.middlewares(req, res, async () => {
          await serveViteApp(req, res, parsedUrl, vite);
        });
        return;
      }

      await serveStatic(req, res, parsedUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal Server Error';
      sendJson(res, 500, { message });
    }
  });

  server.listen(port, () => {
    console.log(`Tea Craft server running at http://localhost:${port}`);
  });
}

start();
