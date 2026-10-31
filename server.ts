/**
 * Comfy's Glow — Glow with Elegance
 * Production-Grade Full-Stack Express Server with Vite Integration
 */

import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { db } from './server/db.ts';
import { getSupabaseAdmin, getSupabasePublic } from './server/supabase.ts';
import type { OrderStatus, PaymentStatus, ProductCategory } from './src/types/index.ts';
import { normalizeNigerianPhoneNumber } from './src/utils/phone.ts';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const asyncRoute = (
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) => (req: Request, res: Response, next: NextFunction) => {
  handler(req, res, next).catch(next);
};

async function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    next();
    return;
  }

  try {
    const token = authHeader.slice('Bearer '.length);
    const { data, error } = await getSupabaseAdmin().auth.getUser(token);
    if (!error && data.user) {
      const user = await db.findUserByAuthId(data.user.id);
      if (user) (req as any).user = user;
    }
    next();
  } catch (error) {
    next(error);
  }
}
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  }
  next();
}

app.use(asyncRoute(authMiddleware));

// Serve static images directly from public and dist directories
app.use('/static-images', express.static(path.resolve(process.cwd(), 'dist', 'static-images')));
app.use('/static-images', express.static(path.resolve(process.cwd(), 'public', 'static-images')));
app.use('/src/assets/images', express.static(path.resolve(process.cwd(), 'src', 'assets', 'images')));

app.get('/api/health', asyncRoute(async (_req: Request, res: Response) => {
  const { error } = await getSupabaseAdmin().from('profiles').select('auth_user_id').limit(1);
  if (error) {
    console.error('Supabase health check failed:', error);
    return res.status(503).json({ status: 'unavailable', error: 'Supabase database is not ready.' });
  }
  res.json({ status: 'ok' });
}));

/* ==========================================================================
   PUBLIC API ENDPOINTS
   ========================================================================== */

// --- Products ---
app.get('/api/products', asyncRoute(async (req: Request, res: Response) => {
  try {
    const { category, subcategory, family, featured, search, minPrice, maxPrice, sort } = req.query;
    let products = await db.getProducts(false); // Only published items for public

    if (category && typeof category === 'string') {
      products = products.filter((p) => p.category === category);
    }
    if (subcategory && typeof subcategory === 'string') {
      products = products.filter((p) => p.subcategory?.toLowerCase() === subcategory.toLowerCase());
    }
    if (family && typeof family === 'string') {
      products = products.filter((p) => p.fragranceFamily?.toLowerCase() === family.toLowerCase());
    }
    if (featured === 'true') {
      products = products.filter((p) => p.isFeatured);
    }
    if (minPrice) {
      products = products.filter((p) => p.price >= Number(minPrice));
    }
    if (maxPrice) {
      products = products.filter((p) => p.price <= Number(maxPrice));
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.ingredients?.toLowerCase().includes(q) ||
          p.fragranceFamily?.toLowerCase().includes(q)
      );
    }

    if (sort) {
      switch (sort) {
        case 'price-asc':
          products.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          products.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          products.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
      }
    }

    res.json({ products, total: products.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch products' });
  }
}));

app.get('/api/products/:idOrSlug', asyncRoute(async (req: Request, res: Response) => {
  const { idOrSlug } = req.params;
  const product = (await db.getProductById(idOrSlug)) || (await db.getProductBySlug(idOrSlug));
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  // Check if draft and unauthenticated/non-admin
  const user = (req as any).user;
  if (product.isDraft && (!user || user.role !== 'admin')) {
    return res.status(404).json({ error: 'Product is currently an unpublished draft.' });
  }
  res.json({ product });
}));

// --- Combos ---
app.get('/api/combos', asyncRoute(async (_req: Request, res: Response) => {
  const combos = (await db.getProducts(false)).filter((p) => p.category === 'combos');
  res.json({ combos });
}));

// --- Delivery Zones & Calculation ---
app.get('/api/delivery-zones', asyncRoute(async (_req: Request, res: Response) => {
  const zones = await db.getDeliveryZones();
  res.json({ zones });
}));

app.post('/api/delivery-zones/calculate', asyncRoute(async (req: Request, res: Response) => {
  const { state, town, zoneId } = req.body;
  const zones = await db.getDeliveryZones();

  if (zoneId) {
    const zone = zones.find((z) => z.id === zoneId);
    if (zone) {
      return res.json({ fee: zone.fee, zone, manualConfirmationRequired: false });
    }
  }

  if (state) {
    const matchedTown = zones.find(
      (z) =>
        z.state.toLowerCase() === String(state).toLowerCase() &&
        town &&
        z.areaName.toLowerCase().includes(String(town).toLowerCase())
    );
    if (matchedTown) {
      return res.json({ fee: matchedTown.fee, zone: matchedTown, manualConfirmationRequired: false });
    }

    const matchedState = zones.find((z) => z.state.toLowerCase() === String(state).toLowerCase());
    if (matchedState) {
      return res.json({ fee: matchedState.fee, zone: matchedState, manualConfirmationRequired: false });
    }
  }

  // Not in standard Ekiti or Ondo zones
  return res.json({
    fee: 0,
    zone: null,
    manualConfirmationRequired: true,
    message: 'Location outside core zones. Rate will be confirmed manually with you by admin upon submission.',
  });
}));

// --- Reviews ---
app.get('/api/reviews', asyncRoute(async (req: Request, res: Response) => {
  const { productId } = req.query;
  const reviews = await db.getReviews(typeof productId === 'string' ? productId : undefined, true);
  res.json({ reviews });
}));

app.post('/api/reviews', requireAuth, asyncRoute(async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { productId, rating, comment } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({ error: 'Product ID, rating (1-5), and review text are required.' });
    }

    const product = await db.getProductById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    // Verify customer has ordered this item
    const userOrders = await db.getOrdersByUserId(user.id);
    const hasPurchased = userOrders.some((order) =>
      order.items.some((item) => item.productId === productId)
    );

    const review = await db.createReview({
      productId,
      productName: product.name,
      customerId: user.id,
      customerName: user.fullName,
      rating: Number(rating),
      comment: String(comment),
      isVerifiedPurchase: hasPurchased,
    });

    res.status(201).json({ review, message: 'Thank you! Your review has been submitted.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to submit review' });
  }
}));

// --- Settings ---
app.get('/api/settings', asyncRoute(async (_req: Request, res: Response) => {
  const settings = await db.getSettings();
  res.json({ settings });
}));

// --- Contact Messages ---
app.post('/api/contact', asyncRoute(async (req: Request, res: Response) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !phone || !message) {
      return res.status(400).json({ error: 'Name, phone number, and message are required.' });
    }
    const msg = await db.createContactMessage({
      name,
      email: email || '',
      phone,
      subject: subject || 'General Inquiry',
      message,
    });
    res.status(201).json({ message: 'Thank you! Your message has been received. We will respond promptly.', contactMessage: msg });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to send message' });
  }
}));

// --- Download Project ZIP & Archives ---
const ARCHIVE_FILES: Record<string, { filename: string; mime: string }> = {
  'project': { filename: 'comfys-glow-project.zip', mime: 'application/zip' },
  'windows': { filename: 'comfys-glow-windows.zip', mime: 'application/zip' },
  'mac-linux': { filename: 'comfys-glow-mac-linux.zip', mime: 'application/zip' },
  'uncompressed': { filename: 'comfys-glow-uncompressed.zip', mime: 'application/zip' },
  'flat': { filename: 'comfys-glow-flat.zip', mime: 'application/zip' },
  'tar': { filename: 'comfys-glow-project.tar.gz', mime: 'application/gzip' },
};

app.get([
  '/api/download-zip',
  '/comfys-glow-project.zip',
  '/comfys-glow-windows.zip',
  '/comfys-glow-mac-linux.zip',
  '/comfys-glow-uncompressed.zip',
  '/comfys-glow-flat.zip',
  '/comfys-glow-project.tar.gz'
], (req: Request, res: Response) => {
  let reqName = path.basename(req.path);
  if (reqName === 'download-zip' || !reqName.includes('.')) {
    reqName = 'comfys-glow-project.zip';
  }
  const filePath = path.resolve(process.cwd(), reqName);
  if (fs.existsSync(filePath)) {
    const isTar = reqName.endsWith('.tar.gz');
    res.setHeader('Content-Type', isTar ? 'application/gzip' : 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${reqName}"`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.sendFile(filePath);
  }
  return res.status(404).json({ error: `Archive ${reqName} not found` });
});

app.get('/api/download/:format', (req: Request, res: Response) => {
  const format = req.params.format;
  const item = ARCHIVE_FILES[format] || ARCHIVE_FILES['windows'];
  const filePath = path.resolve(process.cwd(), item.filename);
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', item.mime);
    res.setHeader('Content-Disposition', `attachment; filename="${item.filename}"`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.sendFile(filePath);
  }
  return res.status(404).json({ error: `Archive for format ${format} not found` });
});

// --- Recently Viewed ---
app.post('/api/recently-viewed', asyncRoute(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { productId } = req.body;
  if (!productId) {
    return res.status(400).json({ error: 'Product ID required' });
  }
  if (user) {
    const ids = await db.addRecentlyViewed(user.id, productId);
    return res.json({ recentlyViewedIds: ids });
  }
  // Guests track in sessionStorage, simply acknowledge
  res.json({ success: true, guest: true });
}));

app.get('/api/recently-viewed', asyncRoute(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { guestIds } = req.query;

  let parsedGuestIds: string[] = [];
  if (guestIds && typeof guestIds === 'string') {
    try {
      parsedGuestIds = JSON.parse(guestIds);
    } catch {
      parsedGuestIds = guestIds.split(',');
    }
  }

  const products = await db.getRecentlyViewedProducts(user ? user.id : null, parsedGuestIds);
  res.json({ products });
}));

/* ==========================================================================
   CUSTOMER AUTHENTICATION & PROFILE
   ========================================================================== */

app.post('/api/auth/register', asyncRoute(async (req: Request, res: Response) => {
  try {
    const { fullName, email, phone, password, address, city, state } = req.body;
    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({ error: 'Full name, email, phone number, and password are required.' });
    }
    const normalizedPhone = normalizeNigerianPhoneNumber(phone);
    if (!normalizedPhone) {
      return res.status(400).json({ error: 'Enter a valid Nigerian mobile number with 10 digits after +234.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const { data: authData, error: authError } = await getSupabaseAdmin().auth.admin.createUser({
      email: String(email).toLowerCase().trim(),
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
    if (authError || !authData.user) {
      return res.status(400).json({ error: authError?.message || 'Account registration failed.' });
    }

    let user;
    try {
      user = await db.createUser({
        authUserId: authData.user.id,
        fullName,
        email,
        phone: normalizedPhone,
        address,
        city,
        state,
      });
    } catch (error) {
      const { error: cleanupError } = await getSupabaseAdmin().auth.admin.deleteUser(authData.user.id);
      if (cleanupError) console.error('Could not roll back Supabase Auth user after profile creation failed:', cleanupError);
      throw error;
    }

    res.status(201).json({ user, message: 'Account successfully registered!' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Registration failed.' });
  }
}));

app.post('/api/auth/login', asyncRoute(async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const { data, error } = await getSupabasePublic().auth.signInWithPassword({
      email: String(email),
      password: String(password),
    });
    if (error || !data.user || !data.session) {
      return res.status(401).json({ error: 'Invalid email address or password.' });
    }

    const user = await db.findUserByAuthId(data.user.id);
    if (!user) return res.status(403).json({ error: 'This account has not been migrated into the store.' });
    res.json({ user, token: data.session.access_token, message: `Welcome back, ${user.fullName}!` });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed.' });
  }
}));

app.get('/api/auth/me', asyncRoute(async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ user: null });
  }
  res.json({ user });
}));

app.put('/api/auth/profile', requireAuth, asyncRoute(async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;
    const { fullName, phone, address, city, state } = req.body;

    const updated = await db.updateUserProfile(currentUser.id, {
      fullName,
      phone,
      address,
      city,
      state,
    });

    res.json({ user: updated, message: 'Profile updated successfully!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update profile' });
  }
}));

app.post('/api/auth/logout', (_req: Request, res: Response) => {
  res.json({ message: 'Logged out successfully' });
});

// --- Customer Wishlist ---
app.get('/api/wishlist', requireAuth, asyncRoute(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const products = await db.getWishlistProducts(user.id);
  res.json({ products, productIds: user.wishlist || [] });
}));

app.post('/api/wishlist/toggle', requireAuth, asyncRoute(async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ error: 'Product ID required' });
    }
    const result = await db.toggleWishlist(user.id, productId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}));

/* ==========================================================================
   ORDERS & CHECKOUT
   ========================================================================== */

app.post('/api/orders', requireAuth, asyncRoute(async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const {
      deliveryAddress,
      deliveryTown,
      deliveryState,
      deliveryInstructions,
      zoneId,
      phone,
      altPhone,
      fullName,
      contactPreference,
      items,
      isWholesale,
      wholesaleDetails,
    } = req.body;

    if (!deliveryAddress || !deliveryTown || !deliveryState) {
      return res.status(400).json({ error: 'Delivery address, town/city, and state are required.' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Your cart is empty. Please select products to order.' });
    }

    const order = await db.createOrder({
      customer: {
        id: user.id,
        fullName: fullName || user.fullName,
        email: user.email,
        phone: phone || user.phone,
        altPhone,
      },
      delivery: {
        address: deliveryAddress,
        town: deliveryTown,
        state: deliveryState,
        instructions: deliveryInstructions,
        zoneId,
      },
      items,
      contactPreference: contactPreference || 'whatsapp',
      isWholesale,
      wholesaleDetails,
    });

    res.status(201).json({
      order,
      reference: order.reference,
      message: 'Order placed successfully! We have generated your unique reference code.',
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Order creation failed.' });
  }
}));

app.get('/api/orders', requireAuth, asyncRoute(async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user.role === 'admin') {
    // Admin can see all or own
    const orders = await db.getOrders();
    return res.json({ orders });
  }
  const orders = await db.getOrdersByUserId(user.id);
  res.json({ orders });
}));

app.get('/api/orders/:refOrId', asyncRoute(async (req: Request, res: Response) => {
  const { refOrId } = req.params;
  const user = (req as any).user;

  const order = (await db.getOrderByReference(refOrId)) || (await db.getOrderById(refOrId));
  if (!order) {
    return res.status(404).json({ error: 'Order not found with provided reference.' });
  }

  // Security isolation check: only order owner or admin can view order details
  if (user && (user.id === order.customer.id || user.role === 'admin')) {
    const emails = await db.getEmailNotifications(order.id);
    return res.json({ order, emails });
  }

  // If unauthenticated but matched reference query: return safe non-sensitive summary
  return res.json({
    order: {
      reference: order.reference,
      status: order.status,
      paymentStatus: order.paymentStatus,
      total: order.total,
      deliveryTown: order.delivery.town,
      deliveryState: order.delivery.state,
      createdAt: order.createdAt,
      itemCount: order.items.length,
    },
  });
}));

/* ==========================================================================
   ADMIN DASHBOARD ENDPOINTS (PROTECTED BY REQUIREADMIN)
   ========================================================================== */

app.get('/api/admin/overview', requireAdmin, asyncRoute(async (_req: Request, res: Response) => {
  const [stats, orders, products] = await Promise.all([
    db.getAdminStats(),
    db.getOrders(),
    db.getProducts(true),
  ]);
  const recentOrders = orders.slice(0, 8);
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 20);
  res.json({ stats, recentOrders, lowStock });
}));

// Admin Products (includes draft soaps & unpublished items)
app.get('/api/admin/products', requireAdmin, asyncRoute(async (_req: Request, res: Response) => {
  const products = await db.getProducts(true);
  res.json({ products });
}));

app.post('/api/admin/products', requireAdmin, asyncRoute(async (req: Request, res: Response) => {
  try {
    const productData = req.body;
    if (!productData.name || !productData.price || !productData.category) {
      return res.status(400).json({ error: 'Name, price, and category are required.' });
    }
    const slug =
      productData.slug ||
      productData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    const product = await db.createProduct({
      ...productData,
      slug,
      rating: productData.rating || 5.0,
      reviewCount: productData.reviewCount || 0,
      stock: Number(productData.stock) || 0,
      price: Number(productData.price),
      isDraft: Boolean(productData.isDraft),
    });

    res.status(201).json({ product, message: 'Product successfully created!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create product.' });
  }
}));

app.put('/api/admin/products/:id', requireAdmin, asyncRoute(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const product = await db.updateProduct(id, updates);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    res.json({ product, message: 'Product updated successfully!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update product.' });
  }
}));

app.delete('/api/admin/products/:id', requireAdmin, asyncRoute(async (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = await db.deleteProduct(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Product not found or already removed.' });
  }
  res.json({ success: true, message: 'Product deleted.' });
}));

// Admin Orders
app.get('/api/admin/orders', requireAdmin, asyncRoute(async (req: Request, res: Response) => {
  const { status, search } = req.query;
  let orders = await db.getOrders();

  if (status && typeof status === 'string' && status !== 'all') {
    orders = orders.filter((o) => o.status === status);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    orders = orders.filter(
      (o) =>
        o.reference.toLowerCase().includes(q) ||
        o.customer.fullName.toLowerCase().includes(q) ||
        o.customer.phone.includes(q) ||
        o.customer.email.toLowerCase().includes(q) ||
        o.delivery.town.toLowerCase().includes(q)
    );
  }

  res.json({ orders, total: orders.length });
}));

app.put('/api/admin/orders/:id/status', requireAdmin, asyncRoute(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, note, paymentStatus } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required.' });
    }

    const order = await db.updateOrderStatus(
      id,
      status as OrderStatus,
      note,
      paymentStatus as PaymentStatus | undefined
    );

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Retrieve triggered email notifications
    const emails = await db.getEmailNotifications(order.id);

    res.json({
      order,
      emails,
      message: `Order status successfully changed to "${status}". Automated customer email notification generated.`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update order status.' });
  }
}));

app.put('/api/admin/orders/:id/notes', requireAdmin, asyncRoute(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { internalNotes } = req.body;
  const order = await db.updateOrderInternalNotes(id, String(internalNotes || ''));
  if (!order) return res.status(404).json({ error: 'Order not found.' });
  res.json({ order, message: 'Internal notes saved.' });
}));

app.post('/api/admin/orders/:id/resend-email', requireAdmin, asyncRoute(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await db.getOrderById(id);
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    const emailStatus = status || order.status;
    if (emailStatus !== 'confirmed' && emailStatus !== 'dispatched' && emailStatus !== 'delivered') {
      return res.status(400).json({ error: 'Email template only available for confirmed, dispatched, or delivered status.' });
    }

    const sentEmail = await db.sendOrderEmailNotification(order, emailStatus);
    res.json({ email: sentEmail, message: `Brand email [${emailStatus}] successfully generated & logged to ${order.customer.email}.` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}));

// Admin Email Notification Logs
app.get('/api/admin/emails', requireAdmin, asyncRoute(async (req: Request, res: Response) => {
  const { orderId } = req.query;
  const emails = await db.getEmailNotifications(typeof orderId === 'string' ? orderId : undefined);
  res.json({ emails });
}));

// Admin Delivery Zones
app.get('/api/admin/delivery-zones', requireAdmin, asyncRoute(async (_req: Request, res: Response) => {
  const zones = await db.getDeliveryZones();
  res.json({ zones });
}));

app.post('/api/admin/delivery-zones', requireAdmin, asyncRoute(async (req: Request, res: Response) => {
  try {
    const { state, areaName, fee, isServiceable, estimatedDeliveryDays, notes } = req.body;
    if (!state || !areaName || fee === undefined) {
      return res.status(400).json({ error: 'State, area name, and fee are required.' });
    }
    const zone = await db.createDeliveryZone({
      state,
      areaName,
      fee: Number(fee),
      isServiceable: isServiceable !== false,
      estimatedDeliveryDays: estimatedDeliveryDays || '24–48 hours',
      notes,
    });
    res.status(201).json({ zone, message: 'Delivery zone created.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}));

app.put('/api/admin/delivery-zones/:id', requireAdmin, asyncRoute(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  const updated = await db.updateDeliveryZone(id, updates);
  if (!updated) return res.status(404).json({ error: 'Zone not found' });
  res.json({ zone: updated, message: 'Delivery rate updated.' });
}));

app.delete('/api/admin/delivery-zones/:id', requireAdmin, asyncRoute(async (req: Request, res: Response) => {
  const { id } = req.params;
  const ok = await db.deleteDeliveryZone(id);
  res.json({ success: ok });
}));

// Admin Review Moderation
app.get('/api/admin/reviews', requireAdmin, asyncRoute(async (_req: Request, res: Response) => {
  const reviews = await db.getReviews(undefined, false); // All reviews
  res.json({ reviews });
}));

app.put('/api/admin/reviews/:id/moderate', requireAdmin, asyncRoute(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isApproved } = req.body;
  const review = await db.moderateReview(id, Boolean(isApproved));
  if (!review) return res.status(404).json({ error: 'Review not found' });
  res.json({ review, message: isApproved ? 'Review approved for public display.' : 'Review hidden from public view.' });
}));

app.delete('/api/admin/reviews/:id', requireAdmin, asyncRoute(async (req: Request, res: Response) => {
  const { id } = req.params;
  const ok = await db.deleteReview(id);
  res.json({ success: ok });
}));

// Admin Customer Directory
app.get('/api/admin/customers', requireAdmin, asyncRoute(async (_req: Request, res: Response) => {
  const [profiles, orders] = await Promise.all([db.getUsers(), db.getOrders()]);
  const users = profiles.map((user) => {
    const userOrders = orders.filter((order) => order.customer.id === user.id);
    const totalSpent = userOrders.filter((order) => order.status !== 'cancelled').reduce((sum, order) => sum + order.total, 0);
    return { ...user, orderCount: userOrders.length, totalSpent };
  });
  res.json({ customers: users });
}));

app.put('/api/admin/settings', requireAdmin, asyncRoute(async (req: Request, res: Response) => {
  const settings = await db.updateSettings(req.body);
  res.json({ settings, message: 'Settings updated.' });
}));

app.get('/api/admin/messages', requireAdmin, asyncRoute(async (_req: Request, res: Response) => {
  const messages = await db.getContactMessages();
  res.json({ messages });
}));

app.put('/api/admin/messages/:id/read', requireAdmin, asyncRoute(async (req: Request, res: Response) => {
  const ok = await db.markContactMessageRead(req.params.id);
  res.json({ success: ok });
}));

/* ==========================================================================
   VITE DEV MIDDLEWARE & PRODUCTION STATIC SERVING
   ========================================================================== */

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) return next(err);
    console.error('Unhandled API error:', err);
    res.status(500).json({ error: 'The server could not complete the request.' });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ Comfy's Glow Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
