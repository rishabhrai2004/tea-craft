import { createServer as createViteServer } from 'vite';
import http from 'http';
import { readFile, writeFile, mkdir, access } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { validateCoupon } from '../shared/coupons.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const dataDir = path.join(__dirname, 'data');
const port = Number(process.env.PORT || 5173);
const isProduction = process.env.NODE_ENV === 'production' || process.argv.includes('--prod');

const productsFile = path.join(dataDir, 'products.json');
const newsletterFile = path.join(dataDir, 'newsletter-signups.json');
const ordersFile = path.join(dataDir, 'orders.json');

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

function getProductWeightOption(product, requestedWeight) {
  const options = Array.isArray(product.weightOptions) ? product.weightOptions : [];

  if (options.length === 0) {
    return {
      label: product.weight || '',
      grams: Number.parseInt(product.weight || '0', 10) || 0,
      price: Number(product.price) || 0,
    };
  }

  return options.find((option) => option.label === requestedWeight) || options[0];
}

async function handleApi(req, res, parsedUrl) {
  const { pathname, searchParams } = parsedUrl;

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

  if (req.method === 'POST' && pathname === '/api/orders') {
    const body = await readRequestBody(req);
    const incomingItems = Array.isArray(body.items) ? body.items : [];
    const products = await getProducts();

    if (!incomingItems.length) {
      return sendJson(res, 400, { message: 'Cart is empty.' });
    }

    const orderItems = incomingItems.map((item) => {
      const product = products.find((entry) => String(entry.id) === String(item.id));
      if (!product) {
        return null;
      }

      const quantity = Math.max(1, Number(item.quantity || 1));
      const selectedWeight = getProductWeightOption(product, String(item.weight || ''));
      const price = Number(selectedWeight.price);

      return {
        id: product.id,
        title: product.title,
        price,
        currency: product.currency || 'INR',
        weight: selectedWeight.label,
        weightGrams: selectedWeight.grams,
        quantity,
        subtotal: price * quantity,
        img: product.img,
      };
    }).filter(Boolean);

    if (!orderItems.length) {
      return sendJson(res, 400, { message: 'No valid products were found in your cart.' });
    }

    const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    const couponCode = String(body.couponCode || '').trim();
    const couponValidation = couponCode ? validateCoupon(couponCode, subtotal) : null;

    if (couponCode && !couponValidation.valid) {
      return sendJson(res, 400, { message: couponValidation.message });
    }

    const discount = couponValidation?.discount || 0;
    const discountedSubtotal = Math.max(0, subtotal - discount);
    const shipping = discountedSubtotal >= 2500 ? 0 : 99;
    const tax = Math.round(discountedSubtotal * 0.05);
    const total = Math.round(discountedSubtotal + shipping + tax);
    const order = {
      id: `order_${Date.now()}`,
      orderNumber: `CT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      status: 'confirmed',
      customer: {
        email: String(body.email || '').trim().toLowerCase(),
        name: String(body.name || 'Guest Collector').trim(),
      },
      items: orderItems,
      currency: 'INR',
      subtotal: Number(subtotal.toFixed(2)),
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

    const orders = await readJson(ordersFile, []);
    orders.unshift(order);
    await writeJson(ordersFile, orders);

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
