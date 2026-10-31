import { randomInt, randomUUID } from 'node:crypto';
import type {
  Product,
  User,
  Order,
  DeliveryZone,
  Review,
  BusinessSettings,
  ContactMessage,
  EmailNotification,
} from '../src/types/index.ts';
import { generateOrderEmailHtml } from './emailTemplates.ts';
import { getSupabaseAdmin } from './supabase.ts';

type RecordKind =
  | 'products'
  | 'orders'
  | 'delivery_zones'
  | 'reviews'
  | 'settings'
  | 'contact_messages'
  | 'email_notifications';

type ProfileRow = {
  auth_user_id: string;
  legacy_id: string;
  email: string;
  role: User['role'];
  data: User;
};

function throwOnError(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

class SupabaseDatabase {
  private get client() {
    return getSupabaseAdmin();
  }

  private async getRecords<T>(kind: RecordKind): Promise<T[]> {
    const { data, error } = await this.client
      .from('app_records')
      .select('data')
      .eq('kind', kind);
    throwOnError(error);
    return (data || []).map((row) => row.data as T);
  }

  private async getRecord<T>(kind: RecordKind, id: string): Promise<T | null> {
    const { data, error } = await this.client
      .from('app_records')
      .select('data')
      .eq('kind', kind)
      .eq('id', id)
      .maybeSingle();
    throwOnError(error);
    return data ? (data.data as T) : null;
  }

  private async saveRecord<T extends { id: string }>(kind: RecordKind, value: T): Promise<T> {
    const lookup =
      kind === 'orders' && 'reference' in value
        ? String(value.reference)
        : kind === 'products' && 'slug' in value
          ? String(value.slug)
          : null;
    const { error } = await this.client
      .from('app_records')
      .upsert({ kind, id: value.id, lookup, data: value }, { onConflict: 'kind,id' });
    throwOnError(error);
    return value;
  }

  private async deleteRecord(kind: RecordKind, id: string): Promise<boolean> {
    const { error, count } = await this.client
      .from('app_records')
      .delete({ count: 'exact' })
      .eq('kind', kind)
      .eq('id', id);
    throwOnError(error);
    return (count || 0) > 0;
  }

  private async getProfileByLegacyId(id: string): Promise<ProfileRow | null> {
    const { data, error } = await this.client
      .from('profiles')
      .select('auth_user_id, legacy_id, email, role, data')
      .eq('legacy_id', id)
      .maybeSingle();
    throwOnError(error);
    return data as ProfileRow | null;
  }

  public async getUsers(): Promise<User[]> {
    const { data, error } = await this.client.from('profiles').select('data, role');
    throwOnError(error);
    return (data || []).map((row) => ({ ...(row.data as User), role: row.role as User['role'] }));
  }

  public async findUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await this.client
      .from('profiles')
      .select('data')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();
    throwOnError(error);
    return data ? (data.data as User) : null;
  }

  public async findUserById(id: string): Promise<User | null> {
    const profile = await this.getProfileByLegacyId(id);
    return profile ? { ...profile.data, role: profile.role } : null;
  }

  public async findUserByAuthId(authUserId: string): Promise<User | null> {
    const { data, error } = await this.client
      .from('profiles')
      .select('data, role')
      .eq('auth_user_id', authUserId)
      .maybeSingle();
    throwOnError(error);
    return data ? { ...(data.data as User), role: data.role as User['role'] } : null;
  }

  public async createUser(userData: {
    authUserId: string;
    fullName: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    state?: string;
  }): Promise<User> {
    const user: User = {
      id: userData.authUserId,
      fullName: userData.fullName.trim(),
      email: userData.email.toLowerCase().trim(),
      phone: userData.phone.trim(),
      role: 'customer',
      address: userData.address || '',
      city: userData.city || '',
      state: userData.state || '',
      wishlist: [],
      recentlyViewed: [],
      createdAt: new Date().toISOString(),
    };
    const { error } = await this.client.from('profiles').insert({
      auth_user_id: userData.authUserId,
      legacy_id: user.id,
      email: user.email,
      role: user.role,
      data: user,
    });
    throwOnError(error);
    return user;
  }

  public async updateUserProfile(
    userId: string,
    updates: Partial<Pick<User, 'fullName' | 'phone' | 'address' | 'city' | 'state'>>
  ): Promise<User | null> {
    const profile = await this.getProfileByLegacyId(userId);
    if (!profile) return null;
    const user = { ...profile.data };
    if (updates.fullName) user.fullName = updates.fullName.trim();
    if (updates.phone) user.phone = updates.phone.trim();
    if (updates.address !== undefined) user.address = updates.address.trim();
    if (updates.city !== undefined) user.city = updates.city.trim();
    if (updates.state !== undefined) user.state = updates.state.trim();
    const { error } = await this.client
      .from('profiles')
      .update({ data: user })
      .eq('auth_user_id', profile.auth_user_id);
    throwOnError(error);
    return user;
  }

  public async getProducts(includeDrafts = false): Promise<Product[]> {
    const products = await this.getRecords<Product>('products');
    return includeDrafts ? products : products.filter((product) => !product.isDraft);
  }

  public async getProductById(id: string): Promise<Product | null> {
    return this.getRecord<Product>('products', id);
  }

  public async getProductBySlug(slug: string): Promise<Product | null> {
    const { data, error } = await this.client
      .from('app_records')
      .select('data')
      .eq('kind', 'products')
      .eq('lookup', slug)
      .maybeSingle();
    throwOnError(error);
    return data ? (data.data as Product) : null;
  }

  public async createProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    const newProduct: Product = {
      ...product,
      id: `prod-${randomUUID()}`,
      createdAt: new Date().toISOString(),
    };
    return this.saveRecord('products', newProduct);
  }

  public async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const product = await this.getProductById(id);
    if (!product) return null;
    return this.saveRecord('products', {
      ...product,
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }

  public deleteProduct(id: string): Promise<boolean> {
    return this.deleteRecord('products', id);
  }

  public async getOrders(): Promise<Order[]> {
    return (await this.getRecords<Order>('orders')).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public async getOrdersByUserId(userId: string): Promise<Order[]> {
    return (await this.getOrders()).filter((order) => order.customer.id === userId);
  }

  public async getOrderByReference(reference: string): Promise<Order | null> {
    const { data, error } = await this.client
      .from('app_records')
      .select('data')
      .eq('kind', 'orders')
      .eq('lookup', reference)
      .maybeSingle();
    throwOnError(error);
    return data ? (data.data as Order) : null;
  }

  public getOrderById(id: string): Promise<Order | null> {
    return this.getRecord<Order>('orders', id);
  }

  public async createOrder(orderPayload: {
    customer: { id: string; fullName: string; email: string; phone: string; altPhone?: string };
    delivery: { address: string; town: string; state: string; instructions?: string; zoneId?: string };
    items: { productId: string; quantity: number; selectedVariant?: string }[];
    contactPreference: 'call' | 'whatsapp' | 'sms';
    isWholesale?: boolean;
    wholesaleDetails?: string;
  }): Promise<Order> {
    const products = await this.getProducts(true);
    const zones = await this.getDeliveryZones();
    const snapshotItems: Order['items'] = [];
    let subtotal = 0;

    for (const item of orderPayload.items) {
      const product = products.find((candidate) => candidate.id === item.productId);
      if (!product) throw new Error(`Product with ID "${item.productId}" was not found.`);
      if (item.quantity <= 0) throw new Error(`Invalid quantity for product "${product.name}".`);

      const variant = item.selectedVariant
        ? product.sizeVariants?.find((candidate) => candidate.size === item.selectedVariant)
        : undefined;
      const unitPrice = variant?.price ?? product.price;
      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;
      snapshotItems.push({
        productId: product.id,
        name: product.name,
        category: product.category,
        quantity: item.quantity,
        unitPrice,
        lineTotal,
        selectedVariant: item.selectedVariant,
        image: product.image,
      });
    }

    let deliveryFee = 0;
    let manualConfirmationRequired = false;
    let zoneName = 'Default Zone';
    const selectedZone = orderPayload.delivery.zoneId
      ? zones.find((zone) => zone.id === orderPayload.delivery.zoneId)
      : undefined;
    const matchedTown = zones.find(
      (zone) =>
        zone.state.toLowerCase() === orderPayload.delivery.state.toLowerCase() &&
        (zone.areaName.toLowerCase().includes(orderPayload.delivery.town.toLowerCase()) ||
          orderPayload.delivery.town.toLowerCase().includes('ado'))
    );
    const matchedState = zones.find(
      (zone) => zone.state.toLowerCase() === orderPayload.delivery.state.toLowerCase()
    );
    const zone = selectedZone || matchedTown || matchedState;

    if (zone) {
      deliveryFee = zone.fee;
      zoneName = zone.areaName;
    } else {
      manualConfirmationRequired = true;
      zoneName = 'Outside Core Zones (Pending Confirmation)';
    }

    const now = new Date().toISOString();
    const order: Order = {
      id: `order-${randomUUID()}`,
      reference: `CG-${new Date().getFullYear()}-${randomInt(10000, 100000)}`,
      customer: {
        ...orderPayload.customer,
        fullName: orderPayload.customer.fullName.trim(),
        email: orderPayload.customer.email.trim(),
        phone: orderPayload.customer.phone.trim(),
        altPhone: orderPayload.customer.altPhone?.trim(),
      },
      delivery: {
        ...orderPayload.delivery,
        address: orderPayload.delivery.address.trim(),
        town: orderPayload.delivery.town.trim(),
        state: orderPayload.delivery.state.trim(),
        zoneName,
        fee: deliveryFee,
        manualConfirmationRequired,
      },
      items: snapshotItems,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      status: 'pending',
      paymentStatus: 'payment_pending',
      contactPreference: orderPayload.contactPreference || 'whatsapp',
      isWholesale: orderPayload.isWholesale || false,
      wholesaleDetails: orderPayload.wholesaleDetails,
      createdAt: now,
      updatedAt: now,
      statusHistory: [{ status: 'pending', timestamp: now, note: 'Order submitted via website order form' }],
    };

    await this.saveRecord('orders', order);
    for (const item of snapshotItems) {
      const product = products.find((candidate) => candidate.id === item.productId);
      if (product && product.stock >= item.quantity) {
        await this.saveRecord('products', { ...product, stock: product.stock - item.quantity });
      }
    }
    return order;
  }

  public async updateOrderStatus(
    orderId: string,
    status: Order['status'],
    note?: string,
    paymentStatus?: Order['paymentStatus']
  ): Promise<Order | null> {
    const order = await this.getOrderById(orderId);
    if (!order) return null;
    const previousStatus = order.status;
    const updated: Order = {
      ...order,
      status,
      paymentStatus: paymentStatus || order.paymentStatus,
      updatedAt: new Date().toISOString(),
      statusHistory: [
        ...order.statusHistory,
        { status, timestamp: new Date().toISOString(), note: note || `Order status updated to ${status}` },
      ],
    };
    await this.saveRecord('orders', updated);

    if (
      previousStatus !== status &&
      (status === 'confirmed' || status === 'dispatched' || status === 'delivered')
    ) {
      await this.sendOrderEmailNotification(updated, status);
    }
    return updated;
  }

  public async sendOrderEmailNotification(
    order: Order,
    status: 'confirmed' | 'dispatched' | 'delivered'
  ): Promise<EmailNotification> {
    const { subject, html } = generateOrderEmailHtml(order, status);
    const notification: EmailNotification = {
      id: `email-${randomUUID()}`,
      orderId: order.id,
      orderReference: order.reference,
      recipientEmail: order.customer.email,
      recipientName: order.customer.fullName,
      status,
      subject,
      htmlBody: html,
      sentAt: new Date().toISOString(),
      deliveryStatus: 'sent',
    };
    await this.saveRecord('email_notifications', notification);
    return notification;
  }

  public async getEmailNotifications(orderId?: string): Promise<EmailNotification[]> {
    const notifications = await this.getRecords<EmailNotification>('email_notifications');
    return orderId ? notifications.filter((notification) => notification.orderId === orderId) : notifications;
  }

  public async toggleWishlist(
    userId: string,
    productId: string
  ): Promise<{ wishlist: string[]; added: boolean }> {
    const profile = await this.getProfileByLegacyId(userId);
    if (!profile) throw new Error('User not found');
    const user = profile.data;
    const wishlist = user.wishlist || [];
    const added = !wishlist.includes(productId);
    const updatedWishlist = added ? [...wishlist, productId] : wishlist.filter((id) => id !== productId);
    const updatedUser = { ...user, wishlist: updatedWishlist };
    const { error } = await this.client
      .from('profiles')
      .update({ data: updatedUser })
      .eq('auth_user_id', profile.auth_user_id);
    throwOnError(error);
    return { wishlist: updatedWishlist, added };
  }

  public async getWishlistProducts(userId: string): Promise<Product[]> {
    const user = await this.findUserById(userId);
    if (!user?.wishlist?.length) return [];
    const products = await this.getProducts(true);
    return products.filter((product) => user.wishlist?.includes(product.id));
  }

  public async addRecentlyViewed(userId: string | null, productId: string): Promise<string[]> {
    if (!userId) return [];
    const profile = await this.getProfileByLegacyId(userId);
    if (!profile) return [];
    const ids = profile.data.recentlyViewed || [];
    if (ids[0] === productId) return ids;
    const recentlyViewed = [productId, ...ids.filter((id) => id !== productId)].slice(0, 12);
    const updatedUser = { ...profile.data, recentlyViewed };
    const { error } = await this.client
      .from('profiles')
      .update({ data: updatedUser })
      .eq('auth_user_id', profile.auth_user_id);
    throwOnError(error);
    return recentlyViewed;
  }

  public async getRecentlyViewedProducts(userId: string | null, guestIds: string[] = []): Promise<Product[]> {
    const user = userId ? await this.findUserById(userId) : null;
    const ids = user ? user.recentlyViewed || [] : guestIds;
    const products = await this.getProducts(true);
    return ids
      .map((id) => products.find((product) => product.id === id && !product.isDraft))
      .filter((product): product is Product => Boolean(product));
  }

  public async updateOrderInternalNotes(orderId: string, notes: string): Promise<Order | null> {
    const order = await this.getOrderById(orderId);
    if (!order) return null;
    return this.saveRecord('orders', { ...order, internalNotes: notes, updatedAt: new Date().toISOString() });
  }

  public getDeliveryZones(): Promise<DeliveryZone[]> {
    return this.getRecords('delivery_zones');
  }

  public async updateDeliveryZone(id: string, updates: Partial<DeliveryZone>): Promise<DeliveryZone | null> {
    const zone = await this.getRecord<DeliveryZone>('delivery_zones', id);
    return zone ? this.saveRecord('delivery_zones', { ...zone, ...updates }) : null;
  }

  public async createDeliveryZone(zone: Omit<DeliveryZone, 'id'>): Promise<DeliveryZone> {
    return this.saveRecord('delivery_zones', { ...zone, id: `zone-${randomUUID()}` });
  }

  public deleteDeliveryZone(id: string): Promise<boolean> {
    return this.deleteRecord('delivery_zones', id);
  }

  public async getReviews(productId?: string, onlyApproved = true): Promise<Review[]> {
    const reviews = await this.getRecords<Review>('reviews');
    return reviews.filter(
      (review) => (!productId || review.productId === productId) && (!onlyApproved || review.isApproved)
    );
  }

  public async createReview(reviewData: {
    productId: string;
    productName: string;
    customerId: string;
    customerName: string;
    rating: number;
    comment: string;
    isVerifiedPurchase?: boolean;
  }): Promise<Review> {
    const review: Review = {
      ...reviewData,
      id: `rev-${randomUUID()}`,
      rating: Math.max(1, Math.min(5, reviewData.rating)),
      comment: reviewData.comment.trim(),
      isVerifiedPurchase: reviewData.isVerifiedPurchase ?? true,
      isApproved: true,
      createdAt: new Date().toISOString(),
    };
    await this.saveRecord('reviews', review);
    const product = await this.getProductById(review.productId);
    if (product) {
      const approved = await this.getReviews(review.productId, true);
      const average = approved.reduce((sum, item) => sum + item.rating, 0) / approved.length;
      await this.saveRecord('products', {
        ...product,
        rating: Number(average.toFixed(1)),
        reviewCount: approved.length,
      });
    }
    return review;
  }

  public async moderateReview(reviewId: string, isApproved: boolean): Promise<Review | null> {
    const review = await this.getRecord<Review>('reviews', reviewId);
    return review ? this.saveRecord('reviews', { ...review, isApproved }) : null;
  }

  public deleteReview(reviewId: string): Promise<boolean> {
    return this.deleteRecord('reviews', reviewId);
  }

  public async getSettings(): Promise<BusinessSettings> {
    const settings = await this.getRecord<BusinessSettings>('settings', 'global');
    if (!settings) throw new Error('Business settings are missing from Supabase. Run the data migration script.');
    return settings;
  }

  public async updateSettings(updates: Partial<BusinessSettings>): Promise<BusinessSettings> {
    const current = await this.getSettings();
    return this.saveRecord('settings', {
      ...current,
      ...updates,
      id: 'global',
      socialLinks: { ...current.socialLinks, ...(updates.socialLinks || {}) },
    } as BusinessSettings & { id: string });
  }

  public async getContactMessages(): Promise<ContactMessage[]> {
    return (await this.getRecords<ContactMessage>('contact_messages')).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public async createContactMessage(
    message: Omit<ContactMessage, 'id' | 'createdAt' | 'isRead'>
  ): Promise<ContactMessage> {
    return this.saveRecord('contact_messages', {
      ...message,
      id: `msg-${randomUUID()}`,
      createdAt: new Date().toISOString(),
      isRead: false,
    });
  }

  public async markContactMessageRead(id: string): Promise<boolean> {
    const message = await this.getRecord<ContactMessage>('contact_messages', id);
    if (!message) return false;
    await this.saveRecord('contact_messages', { ...message, isRead: true });
    return true;
  }

  public async getAdminStats() {
    const [orders, products, reviews, messages, users] = await Promise.all([
      this.getOrders(),
      this.getProducts(true),
      this.getReviews(undefined, false),
      this.getContactMessages(),
      this.getUsers(),
    ]);
    const countStatus = (status: Order['status']) => orders.filter((order) => order.status === status).length;
    return {
      totalOrders: orders.length,
      pendingOrders: countStatus('pending'),
      confirmedOrders: countStatus('confirmed'),
      processingOrders: countStatus('processing'),
      dispatchedOrders: countStatus('dispatched'),
      deliveredOrders: countStatus('delivered'),
      cancelledOrders: countStatus('cancelled'),
      totalRevenue: orders
        .filter((order) => order.status !== 'cancelled')
        .reduce((sum, order) => sum + order.total, 0),
      publishedProducts: products.filter((product) => !product.isDraft).length,
      draftSoapsCount: products.filter((product) => product.category === 'soaps' && product.isDraft).length,
      lowStockProducts: products.filter((product) => product.stock > 0 && product.stock <= 20).length,
      pendingReviews: reviews.filter((review) => !review.isApproved).length,
      unreadMessages: messages.filter((message) => !message.isRead).length,
      totalCustomers: users.filter((user) => user.role === 'customer').length,
    };
  }
}

export const db = new SupabaseDatabase();
