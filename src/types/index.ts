/**
 * Comfy's Glow — Glow with Elegance
 * Core Type Definitions
 */

export type ProductCategory = 'soaps' | 'perfumes' | 'body-care' | 'combos';

export interface ProductVariant {
  size: string;
  price: number;
  inStock: boolean;
  sku?: string;
}

export interface ComboComponent {
  productId: string;
  name: string;
  quantity: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  subcategory?: string;
  price: number; // In Naira (stored as standard integer Naira)
  originalPrice?: number;
  description: string;
  shortDescription?: string;
  image: string;
  secondaryImages?: string[];
  ingredients?: string;
  benefits?: string[];
  usageInstructions?: string;
  sizeVariants?: ProductVariant[];
  selectedVariant?: string;
  stock: number;
  isDraft: boolean; // For unconfirmed soap varieties & unpublished drafts
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  fragranceFamily?: 'Oriental' | 'Woody' | 'Floral' | 'Fresh' | 'Gourmand' | 'Citrus';
  fragranceNotes?: {
    top: string[];
    heart: string[];
    base: string[];
  };
  sillage?: string;
  longevity?: string;
  comboComponents?: ComboComponent[];
  advertisedSavings?: number;
  badge?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CartItem {
  id: string; // unique item id (productId + variant)
  product: Product;
  quantity: number;
  selectedVariant?: string;
  unitPrice: number;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
  address?: string;
  city?: string;
  state?: string;
  wishlist?: string[]; // array of product IDs
  recentlyViewed?: string[]; // array of product IDs
  createdAt: string;
}

export interface EmailNotification {
  id: string;
  orderId: string;
  orderReference: string;
  recipientEmail: string;
  recipientName: string;
  status: OrderStatus;
  subject: string;
  htmlBody: string;
  sentAt: string;
  deliveryStatus: 'sent' | 'logged';
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'dispatched'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus =
  | 'payment_pending'
  | 'payment_confirmed_manually'
  | 'cash_on_delivery'
  | 'bank_transfer_arranged';

export interface OrderItem {
  productId: string;
  name: string;
  category: ProductCategory;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  selectedVariant?: string;
  image?: string;
}

export interface OrderStatusHistory {
  status: OrderStatus;
  timestamp: string;
  note?: string;
  updatedBy?: string;
}

export interface Order {
  id: string;
  reference: string;
  customer: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    altPhone?: string;
  };
  delivery: {
    address: string;
    town: string;
    state: string;
    instructions?: string;
    zoneId?: string;
    zoneName?: string;
    fee: number;
    manualConfirmationRequired?: boolean;
  };
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  contactPreference: 'call' | 'whatsapp' | 'sms';
  internalNotes?: string;
  isWholesale?: boolean;
  wholesaleDetails?: string;
  createdAt: string;
  updatedAt: string;
  statusHistory: OrderStatusHistory[];
}

export interface DeliveryZone {
  id: string;
  state: string;
  areaName: string;
  fee: number;
  isServiceable: boolean;
  estimatedDeliveryDays: string;
  notes?: string;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  customerId: string;
  customerName: string;
  rating: number; // 1 to 5
  comment: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: string;
}

export interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export interface BusinessSettings {
  name: string;
  tagline: string;
  phones: string[];
  email: string;
  address: string;
  locationCity: string;
  locationState: string;
  whatsappNumber: string;
  socialLinks: {
    instagram: string;
    facebook: string;
    tiktok: string;
    twitter?: string;
  };
  deliveryNotice: string;
  wholesaleNotice: string;
  faqs: FAQ[];
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}
