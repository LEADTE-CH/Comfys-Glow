import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
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

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export interface DatabaseSchema {
  users: (User & { passwordHash: string })[];
  products: Product[];
  orders: Order[];
  deliveryZones: DeliveryZone[];
  reviews: Review[];
  settings: BusinessSettings;
  contactMessages: ContactMessage[];
  emailNotifications: EmailNotification[];
}

// Password hashing utility using standard Node.js crypto
export function hashPassword(password: string): string {
  const salt = 'comfys_glow_salt_2026';
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

const initialSettings: BusinessSettings = {
  name: "Comfy's Glow",
  tagline: 'Glow with Elegance',
  phones: ['000-000-0000'],
  email: 'contact@example.invalid',
  address: 'Store address not configured',
  locationCity: 'Ado-Ekiti',
  locationState: 'Ekiti State',
  whatsappNumber: '',
  socialLinks: {
    instagram: 'https://instagram.com/Comfy_glow24',
    facebook: 'https://web.facebook.com/profile.php?id=100088602207052',
    tiktok: 'https://tiktok.com/@comfysglow',
    twitter: 'https://twitter.com/comfysglow',
  },
  deliveryNotice:
    'Prompt door-to-door delivery available throughout Ekiti State (Ado-Ekiti, Ikere, Oye, Ijero) and Akure, Ondo State. Delivery fees are calculated dynamically based on location.',
  wholesaleNotice:
    'We supply bulk and wholesale orders for all 5 varieties of our signature soaps. Customized production batches are available on request.',
  faqs: [
    {
      id: 'faq-1',
      category: 'Ordering & Accounts',
      question: 'Do I need an account to place an order?',
      answer:
        'Yes. While you are welcome to browse all soaps, perfumes, and body care items freely, you must register and sign in before submitting an order. This ensures you can track your order status and view your full purchase history.',
    },
    {
      id: 'faq-2',
      category: 'Payment Arrangements',
      question: 'How do I pay for my order?',
      answer:
        'We do not process credit cards or online debit transactions directly on this website. Once you submit your order, you receive a unique order reference. Our team confirms your order and coordinates secure bank transfer or cash arrangement before dispatch.',
    },
    {
      id: 'faq-3',
      category: 'Delivery & Service Areas',
      question: 'Which areas do you deliver to?',
      answer:
        'We currently deliver to all towns across Ekiti State (including Ado-Ekiti, Ikere, Ijero, Oye, and surrounding areas) as well as Akure, Ondo State. For other Nigerian states, manual rate confirmation is provided upon inquiry.',
    },
    {
      id: 'faq-4',
      category: 'Soaps & Ingredients',
      question: 'What makes Comfy Black Beauty Soap special?',
      answer:
        "Comfy Black Beauty Soap is hand-crafted with authentic African black soap infused with nourishing carrot extract and aloe vera. It gently exfoliates, brightens natural skin tone without bleaching, and clears acne, pimples, and hyperpigmentation.",
    },
    {
      id: 'faq-5',
      category: 'Bulk & Wholesale',
      question: 'Can I purchase soaps in bulk or wholesale quantities?',
      answer:
        'Yes! We produce five distinct soap varieties and welcome retail partners, event souvenir requests, and wholesale distributors. Simply select your desired quantity or submit a bulk request through our order form.',
    },
    {
      id: 'faq-6',
      category: 'Combos & Savings',
      question: 'What are the benefits of buying a Combo Set?',
      answer:
        'Our combo sets are bundled to give you "More Glow • More Value • More You". For instance, the Full Brightening Set saves you ₦1,200 compared to purchasing the four individual items separately.',
    },
  ],
};

const initialDeliveryZones: DeliveryZone[] = [
  {
    id: 'zone-ekiti-ado',
    state: 'Ekiti State',
    areaName: 'Ado-Ekiti (Town Centre, Adebayo, Fajuyi, Basiri, GRA)',
    fee: 1500,
    isServiceable: true,
    estimatedDeliveryDays: 'Same-day to 24 hours',
    notes: 'Express local dispatch in Ado-Ekiti',
  },
  {
    id: 'zone-ekiti-ikere',
    state: 'Ekiti State',
    areaName: 'Ikere-Ekiti & environs',
    fee: 2000,
    isServiceable: true,
    estimatedDeliveryDays: '24–48 hours',
    notes: 'Regular shuttle route',
  },
  {
    id: 'zone-ekiti-oye',
    state: 'Ekiti State',
    areaName: 'Oye-Ekiti (Federal University FUOYE & Town)',
    fee: 2500,
    isServiceable: true,
    estimatedDeliveryDays: '24–48 hours',
    notes: 'Campus and town delivery points',
  },
  {
    id: 'zone-ekiti-ijero',
    state: 'Ekiti State',
    areaName: 'Ijero-Ekiti & environs',
    fee: 2500,
    isServiceable: true,
    estimatedDeliveryDays: '1–2 days',
  },
  {
    id: 'zone-ekiti-other',
    state: 'Ekiti State',
    areaName: 'Other Ekiti State Towns (Efon, Ise, Emure, Gbonyin)',
    fee: 3000,
    isServiceable: true,
    estimatedDeliveryDays: '1–3 days',
  },
  {
    id: 'zone-ondo-akure',
    state: 'Ondo State',
    areaName: 'Akure (Central, Alagbaka, FUTA, Ijapo, Oba-Ile)',
    fee: 3500,
    isServiceable: true,
    estimatedDeliveryDays: '1–2 days',
    notes: 'Direct transit from Ado-Ekiti',
  },
  {
    id: 'zone-ondo-other',
    state: 'Ondo State',
    areaName: 'Other Ondo State Towns (Ondo Town, Owo, Ikare)',
    fee: 4500,
    isServiceable: true,
    estimatedDeliveryDays: '2–3 days',
  },
];

const initialProducts: Product[] = [
  // 1. CONFIRMED INDIVIDUAL PRODUCTS
  {
    id: 'prod-black-soap',
    name: "Comfy's Black Beauty Soap",
    slug: 'comfys-black-beauty-soap',
    category: 'soaps',
    subcategory: 'Artisanal Soaps',
    price: 4200,
    originalPrice: 4500,
    description:
      "Crafted with pure African black soap, revitalizing carrot extract, and soothing aloe vera. Comfy's Black Beauty Soap deeply cleanses pores, eliminates acne and pimples, gently brightens skin tone without harsh bleaching, and nourishes the skin's natural protective barrier.",
    shortDescription: 'Carrot extract & Aloe vera • Brightens skin tone • Exfoliates & nourishes',
    image: '/src/assets/images/comfy_black_soap_1791541563344.jpg',
    ingredients: 'African Black Soap base, Carrot Root Extract, Pure Aloe Vera Gel, Virgin Coconut Oil, Shea Butter, Plantain Skin Ash.',
    benefits: [
      'Clears active acne, blackheads, and persistent pimples',
      'Naturally brightens and evens complexion without bleaching agents',
      'Calms irritation and smooths skin texture',
      'Rich in vitamins A, C, and E for deep cellular hydration',
    ],
    usageInstructions: 'Lather between moist palms or sponge. Massage gently over face and body for 60 seconds, then rinse thoroughly with clean water. Use morning and evening.',
    stock: 85,
    isDraft: false,
    isFeatured: true,
    rating: 4.9,
    reviewCount: 38,
    badge: 'Bestseller',
    createdAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'prod-body-scrub',
    name: 'Comfy Glow Body Scrub',
    slug: 'comfy-glow-body-scrub',
    category: 'body-care',
    subcategory: 'Body Exfoliants',
    price: 4200,
    description:
      'Formulated with organic turmeric, roasted coffee grounds, ultra-nourishing shea butter, sweet almond oil, and Vitamin E. This rich 250g scrub buffs away dead skin cells, targets dark knuckles and inner thighs, and restores your natural velvety radiance.',
    shortDescription: 'Turmeric, Coffee, Shea Butter & Vitamin E • 250g e',
    image: '/src/assets/images/comfy_body_scrub_1791541595462.jpg',
    ingredients: 'Raw Cane Sugar Crystals, Finely Ground Coffee, Organic Turmeric Powder, Unrefined Shea Butter, Sweet Almond Oil, Vitamin E Oil.',
    benefits: [
      'Gently sloughs off dull, rough dead skin surface',
      'Coffee activates microcirculation and tones skin appearance',
      'Turmeric diminishes dark spots and uneven tone',
      'Leaves skin silky, supple, and glowing with a warm subtle aroma',
    ],
    usageInstructions: 'Scoop a generous amount onto damp skin. Buff gently in circular motions, paying attention to elbows, knees, and dry areas. Rinse clean with warm water 2–3 times weekly.',
    stock: 60,
    isDraft: false,
    isFeatured: true,
    rating: 4.8,
    reviewCount: 29,
    badge: 'Popular',
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'prod-body-butter',
    name: 'Comfy Glow Body Butter',
    slug: 'comfy-glow-body-butter',
    category: 'body-care',
    subcategory: 'Body Moisturisers',
    price: 3800,
    description:
      'A deeply moisturizing 250g whipped butter made with pure unrefined shea butter, sweet almond oil, and botanical emollients. It melts effortlessly into the skin, locking in 24-hour hydration without leaving a greasy residue.',
    shortDescription: 'Deeply Nourishing Whipped Shea Butter & Almond Oil • 250g e',
    image: '/src/assets/images/comfy_body_butter_1791541573522.jpg',
    ingredients: 'Grade A African Shea Butter, Sweet Almond Oil, Vegetable Glycerin, Jojoba Seed Oil, Vitamin E Tocopherol, Natural Botanical Fragrance.',
    benefits: [
      'Provides intense, long-lasting moisture barrier protection',
      'Softens cracked heels, dry elbows, and stretch-prone skin',
      'Imparts a healthy, illuminated natural glow',
      'Gentle for all skin types, including sensitive skin',
    ],
    usageInstructions: 'Warm a small amount between hands and massage over freshly bathed, slightly damp skin until absorbed.',
    stock: 75,
    isDraft: false,
    isFeatured: true,
    rating: 5.0,
    reviewCount: 42,
    badge: 'Essential',
    createdAt: '2026-01-18T10:00:00Z',
  },
  {
    id: 'prod-body-oil',
    name: 'Comfy Glow Body Oil',
    slug: 'comfy-glow-body-oil',
    category: 'body-care',
    subcategory: 'Glow Oils',
    price: 4000,
    description:
      'A fast-absorbing, lightweight golden radiance body oil in a sleek 100ml bottle with pump dispenser. Enriched with botanical oils that impart an instant shimmer and youthful sheen without staining clothes.',
    shortDescription: 'Nourishing Golden Radiance & Botanical Hydration • 100ml',
    image: '/src/assets/images/comfy_body_oil_1791541584222.jpg',
    ingredients: 'Golden Jojoba Oil, Argan Kernel Oil, Rosehip Seed Oil, Grapeseed Oil, Sunflower Seed Oil, Squalane, Vitamin E.',
    benefits: [
      'Gives skin an instant luminous, lit-from-within glow',
      'Locks in moisture after body butter application',
      'Silky non-comedogenic texture that absorbs quickly',
      'Enhances natural skin tone and radiance under sunlight',
    ],
    usageInstructions: 'Dispense 2–3 pumps into palms and stroke across arms, collarbones, legs, and body after moisturising.',
    stock: 65,
    isDraft: false,
    isFeatured: true,
    rating: 4.9,
    reviewCount: 31,
    badge: 'Radiance',
    createdAt: '2026-01-20T10:00:00Z',
  },

  // 2. THE 4 UNCONFIRMED SOAP VARIETIES (EDITABLE DRAFTS ONLY - NOT PUBLISHED ON STOREFRONT)
  {
    id: 'prod-soap-variety-2',
    name: 'Soap Variety #2 (Draft Pending Confirmation)',
    slug: 'soap-variety-2',
    category: 'soaps',
    subcategory: 'Artisanal Soaps',
    price: 4200,
    description: 'Draft record for soap variety #2 produced by Comfy’s Glow. Details, ingredients, and name pending official business owner confirmation in admin dashboard.',
    image: '/src/assets/images/comfy_black_soap_1791541563344.jpg',
    stock: 0,
    isDraft: true, // MUST REMAIN DRAFT until published by admin
    isFeatured: false,
    rating: 0,
    reviewCount: 0,
    createdAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 'prod-soap-variety-3',
    name: 'Soap Variety #3 (Draft Pending Confirmation)',
    slug: 'soap-variety-3',
    category: 'soaps',
    subcategory: 'Artisanal Soaps',
    price: 4200,
    description: 'Draft record for soap variety #3 produced by Comfy’s Glow. Details, ingredients, and name pending official business owner confirmation in admin dashboard.',
    image: '/src/assets/images/comfy_black_soap_1791541563344.jpg',
    stock: 0,
    isDraft: true,
    isFeatured: false,
    rating: 0,
    reviewCount: 0,
    createdAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 'prod-soap-variety-4',
    name: 'Soap Variety #4 (Draft Pending Confirmation)',
    slug: 'soap-variety-4',
    category: 'soaps',
    subcategory: 'Artisanal Soaps',
    price: 4200,
    description: 'Draft record for soap variety #4 produced by Comfy’s Glow. Details, ingredients, and name pending official business owner confirmation in admin dashboard.',
    image: '/src/assets/images/comfy_black_soap_1791541563344.jpg',
    stock: 0,
    isDraft: true,
    isFeatured: false,
    rating: 0,
    reviewCount: 0,
    createdAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 'prod-soap-variety-5',
    name: 'Soap Variety #5 (Draft Pending Confirmation)',
    slug: 'soap-variety-5',
    category: 'soaps',
    subcategory: 'Artisanal Soaps',
    price: 4200,
    description: 'Draft record for soap variety #5 produced by Comfy’s Glow. Details, ingredients, and name pending official business owner confirmation in admin dashboard.',
    image: '/src/assets/images/comfy_black_soap_1791541563344.jpg',
    stock: 0,
    isDraft: true,
    isFeatured: false,
    rating: 0,
    reviewCount: 0,
    createdAt: '2026-02-01T10:00:00Z',
  },

  // 3. COMBO SETS (More Glow • More Value • More You)
  {
    id: 'combo-brightening-trio',
    name: 'Brightening Trio Combo',
    slug: 'brightening-trio-combo',
    category: 'combos',
    subcategory: 'Value Combos',
    price: 11500,
    originalPrice: 12000,
    advertisedSavings: 500,
    description:
      "A complete daily cleansing, hydrating, and glowing ritual. Includes Comfy's Black Beauty Soap (₦4,200), Comfy Glow Body Butter (₦3,800), and Comfy Glow Body Oil (₦4,000). Total value ₦12,000 for only ₦11,500.",
    shortDescription: "Comfy's Black Soap + Body Butter + Body Oil",
    image: '/src/assets/images/comfy_hero_collection_1791541604861.jpg',
    benefits: [
      'Step 1: Cleanse & clarify with Black Beauty Soap',
      'Step 2: Deeply nourish and soothe with Body Butter',
      'Step 3: Seal in all-day radiance with Body Oil',
      'Save ₦500 off individual purchase price',
    ],
    comboComponents: [
      { productId: 'prod-black-soap', name: "Comfy's Black Beauty Soap", quantity: 1 },
      { productId: 'prod-body-butter', name: 'Comfy Glow Body Butter', quantity: 1 },
      { productId: 'prod-body-oil', name: 'Comfy Glow Body Oil', quantity: 1 },
    ],
    stock: 45,
    isDraft: false,
    isFeatured: true,
    rating: 4.9,
    reviewCount: 24,
    badge: 'Save ₦500',
    createdAt: '2026-01-25T10:00:00Z',
  },
  {
    id: 'combo-brightening-polish',
    name: 'Brightening & Polish Combo',
    slug: 'brightening-polish-combo',
    category: 'combos',
    subcategory: 'Value Combos',
    price: 11800,
    originalPrice: 12000,
    advertisedSavings: 200,
    description:
      'The ultimate body polishing and moisturizing duo with oil infusion. Includes Comfy Glow Body Scrub (₦4,200), Comfy Glow Body Butter (₦3,800), and Comfy Glow Body Oil (₦4,000). Regular price ₦12,000 for only ₦11,800.',
    shortDescription: 'Comfy Body Scrub + Body Butter + Body Oil',
    image: '/src/assets/images/comfy_hero_collection_1791541604861.jpg',
    benefits: [
      'Exfoliates dead cells with Turmeric & Coffee scrub',
      'Deeply conditions with whipped Shea Butter',
      'Imparts a glass-skin finish with botanical Body Oil',
      'Save ₦200 off individual purchase price',
    ],
    comboComponents: [
      { productId: 'prod-body-scrub', name: 'Comfy Glow Body Scrub', quantity: 1 },
      { productId: 'prod-body-butter', name: 'Comfy Glow Body Butter', quantity: 1 },
      { productId: 'prod-body-oil', name: 'Comfy Glow Body Oil', quantity: 1 },
    ],
    stock: 40,
    isDraft: false,
    isFeatured: true,
    rating: 4.8,
    reviewCount: 19,
    badge: 'Save ₦200',
    createdAt: '2026-01-25T10:00:00Z',
  },
  {
    id: 'combo-full-brightening-set',
    name: 'Full Brightening Set',
    slug: 'full-brightening-set',
    category: 'combos',
    subcategory: 'Value Combos',
    price: 15000,
    originalPrice: 16200,
    advertisedSavings: 1200,
    description:
      "Our flagship complete 4-piece skincare regimen! Contains Comfy's Black Beauty Soap (₦4,200), Comfy Glow Body Scrub (₦4,200), Comfy Glow Body Butter (₦3,800), and Comfy Glow Body Oil (₦4,000). Total individual retail value is ₦16,200. You pay only ₦15,000 (instant ₦1,200 savings!).",
    shortDescription: 'All 4 Products: Black Soap + Body Scrub + Body Butter + Body Oil',
    image: '/src/assets/images/comfy_hero_collection_1791541604861.jpg',
    benefits: [
      'Complete end-to-end luxury beauty regimen',
      'Maximum glow without any bleaching agents',
      'Long-lasting full size jars & bottles',
      'Our highest value bundle with ₦1,200 direct savings',
    ],
    comboComponents: [
      { productId: 'prod-black-soap', name: "Comfy's Black Beauty Soap", quantity: 1 },
      { productId: 'prod-body-scrub', name: 'Comfy Glow Body Scrub', quantity: 1 },
      { productId: 'prod-body-butter', name: 'Comfy Glow Body Butter', quantity: 1 },
      { productId: 'prod-body-oil', name: 'Comfy Glow Body Oil', quantity: 1 },
    ],
    stock: 50,
    isDraft: false,
    isFeatured: true,
    rating: 5.0,
    reviewCount: 35,
    badge: 'Save ₦1,200',
    createdAt: '2026-01-25T10:00:00Z',
  },

  // 4. PERFUMES CATALOGUE (INDEPENDENT PERFUME STORE ARCHITECTURE)
  {
    id: 'perfume-royal-oud-velvet',
    name: 'Royal Oud Velvet Eau de Parfum',
    slug: 'royal-oud-velvet',
    category: 'perfumes',
    subcategory: 'Eau de Parfum',
    price: 12000,
    originalPrice: 14000,
    description:
      'A majestic blend of warm Cambodian oud, smoky incense, velvet amber, and spiced cardamom. Crafted for those who appreciate unforgettable sillage and regal distinction.',
    shortDescription: 'Warm Oud, Smoked Amber & Cardamom Spice',
    image: '/src/assets/images/comfy_hero_collection_1791541604861.jpg',
    fragranceFamily: 'Oriental',
    fragranceNotes: {
      top: ['Cardamom', 'Pink Peppercorn', 'Bergamot'],
      heart: ['Smoked Incense', 'Rose Absolute', 'Cedarwood'],
      base: ['Cambodian Oud', 'Amber Resin', 'Vanilla Bourbon'],
    },
    sillage: 'Heavy & Persistent (6+ ft projection)',
    longevity: '14+ hours on skin, 24+ on fabrics',
    sizeVariants: [
      { size: '30ml Travel Spray', price: 7500, inStock: true },
      { size: '50ml Standard Flacon', price: 12000, inStock: true },
      { size: '100ml Luxury Flacon', price: 19500, inStock: true },
    ],
    selectedVariant: '50ml Standard Flacon',
    stock: 35,
    isDraft: false,
    isFeatured: true,
    rating: 4.9,
    reviewCount: 22,
    badge: 'Signature',
    createdAt: '2026-02-05T10:00:00Z',
  },
  {
    id: 'perfume-rose-damascena',
    name: 'Rose Damascena Elixir',
    slug: 'rose-damascena-elixir',
    category: 'perfumes',
    subcategory: 'Eau de Parfum',
    price: 11000,
    description:
      'An intoxicating bouquet of fresh Damask roses touched by golden pear, white peony, and velvety musk. Romantic, graceful, and impeccably feminine.',
    shortDescription: 'Damask Rose, White Peony & Velvet Musk',
    image: '/src/assets/images/comfy_hero_collection_1791541604861.jpg',
    fragranceFamily: 'Floral',
    fragranceNotes: {
      top: ['Dewy Pear', 'Lychee', 'Mandarin'],
      heart: ['Damask Rose', 'White Peony', 'Turkish Rosewater'],
      base: ['Cashmere Wood', 'White Musk', 'Praline'],
    },
    sillage: 'Moderate & Elegant',
    longevity: '10–12 hours',
    sizeVariants: [
      { size: '30ml Travel Spray', price: 6800, inStock: true },
      { size: '50ml Standard Flacon', price: 11000, inStock: true },
      { size: '100ml Luxury Flacon', price: 18000, inStock: true },
    ],
    selectedVariant: '50ml Standard Flacon',
    stock: 28,
    isDraft: false,
    isFeatured: true,
    rating: 4.8,
    reviewCount: 17,
    createdAt: '2026-02-06T10:00:00Z',
  },
  {
    id: 'perfume-vanilla-amber-nectar',
    name: 'Vanilla Amber Nectar',
    slug: 'vanilla-amber-nectar',
    category: 'perfumes',
    subcategory: 'Extrait de Parfum',
    price: 11500,
    description:
      'Gourmand bliss featuring rich Madagascar vanilla pods drenched in golden honeycomb, toasted tonka, and balsamic amber. Sweet, sophisticated, and deeply comforting.',
    shortDescription: 'Madagascar Vanilla, Toasted Tonka & Wild Honey',
    image: '/src/assets/images/comfy_hero_collection_1791541604861.jpg',
    fragranceFamily: 'Gourmand',
    fragranceNotes: {
      top: ['Almond Blossom', 'Sweet Orange'],
      heart: ['Wild Honeycomb', 'Toasted Tonka Bean', 'Orchid'],
      base: ['Madagascar Vanilla', 'Benzoin Resin', 'Sandalwood'],
    },
    sillage: 'Moderate to Strong',
    longevity: '12+ hours',
    sizeVariants: [
      { size: '30ml Travel Spray', price: 7000, inStock: true },
      { size: '50ml Standard Flacon', price: 11500, inStock: true },
      { size: '100ml Luxury Flacon', price: 18500, inStock: true },
    ],
    selectedVariant: '50ml Standard Flacon',
    stock: 30,
    isDraft: false,
    isFeatured: true,
    rating: 5.0,
    reviewCount: 26,
    badge: 'Customer Love',
    createdAt: '2026-02-07T10:00:00Z',
  },
  {
    id: 'perfume-midnight-bergamot',
    name: 'Midnight Bergamot & Sea Breeze',
    slug: 'midnight-bergamot-sea-breeze',
    category: 'perfumes',
    subcategory: 'Eau de Toilette',
    price: 10500,
    description:
      'Crisp Calabrian bergamot infused with sparkling sea minerals, crisp sage, and vetiver. An invigorating unisex fragrance that radiates fresh clean confidence.',
    shortDescription: 'Crisp Bergamot, Saline Driftwood & French Clary Sage',
    image: '/src/assets/images/comfy_hero_collection_1791541604861.jpg',
    fragranceFamily: 'Fresh',
    fragranceNotes: {
      top: ['Calabrian Bergamot', 'Grapefruit', 'Sea Salt'],
      heart: ['Clary Sage', 'Aquatic Lotus', 'Neroli'],
      base: ['Driftwood', 'Haitian Vetiver', 'Clean Ambergris'],
    },
    sillage: 'Crisp & Airy',
    longevity: '8–10 hours',
    sizeVariants: [
      { size: '30ml Travel Spray', price: 6500, inStock: true },
      { size: '50ml Standard Flacon', price: 10500, inStock: true },
      { size: '100ml Luxury Flacon', price: 17000, inStock: true },
    ],
    selectedVariant: '50ml Standard Flacon',
    stock: 32,
    isDraft: false,
    isFeatured: false,
    rating: 4.7,
    reviewCount: 14,
    createdAt: '2026-02-08T10:00:00Z',
  },
  {
    id: 'perfume-golden-musk-royale',
    name: 'Golden Musk Royale',
    slug: 'golden-musk-royale',
    category: 'perfumes',
    subcategory: 'Eau de Parfum',
    price: 11800,
    description:
      'Velvety white musk grounded by Australian sandalwood, powdery iris, and warm cedar. A timeless skin-scent that evolves into an intoxicating personal aura.',
    shortDescription: 'White Musk, Creamy Sandalwood & Powdered Iris',
    image: '/src/assets/images/comfy_hero_collection_1791541604861.jpg',
    fragranceFamily: 'Woody',
    fragranceNotes: {
      top: ['Freesia', 'Ambrette Seed'],
      heart: ['Florentine Iris', 'Cotton Blossom', 'Heliotrope'],
      base: ['White Royal Musk', 'Australian Sandalwood', 'Cedar'],
    },
    sillage: 'Intimate to Moderate',
    longevity: '12+ hours',
    sizeVariants: [
      { size: '30ml Travel Spray', price: 7200, inStock: true },
      { size: '50ml Standard Flacon', price: 11800, inStock: true },
      { size: '100ml Luxury Flacon', price: 19000, inStock: true },
    ],
    selectedVariant: '50ml Standard Flacon',
    stock: 25,
    isDraft: false,
    isFeatured: false,
    rating: 4.9,
    reviewCount: 18,
    createdAt: '2026-02-09T10:00:00Z',
  },
  {
    id: 'perfume-citrus-blossom-soleil',
    name: 'Citrus Blossom Soleil',
    slug: 'citrus-blossom-soleil',
    category: 'perfumes',
    subcategory: 'Eau de Parfum',
    price: 10500,
    description:
      'Sun-drenched Mediterranean orange blossom, zesty yellow mandarin, and neroli over a light golden amber backdrop. Joyful, sparkling, and uplifted.',
    shortDescription: 'Zesty Mandarin, Sunlit Orange Blossom & Neroli',
    image: '/src/assets/images/comfy_hero_collection_1791541604861.jpg',
    fragranceFamily: 'Citrus',
    fragranceNotes: {
      top: ['Italian Mandarin', 'Lemon Zest', 'Petitgrain'],
      heart: ['Orange Blossom', 'Neroli', 'Jasmine Sambac'],
      base: ['Blonde Cedar', 'Clean White Musk', 'Solar Amber'],
    },
    sillage: 'Radiant & Sparkling',
    longevity: '8–10 hours',
    sizeVariants: [
      { size: '30ml Travel Spray', price: 6500, inStock: true },
      { size: '50ml Standard Flacon', price: 10500, inStock: true },
      { size: '100ml Luxury Flacon', price: 17000, inStock: true },
    ],
    selectedVariant: '50ml Standard Flacon',
    stock: 22,
    isDraft: false,
    isFeatured: false,
    rating: 4.8,
    reviewCount: 15,
    createdAt: '2026-02-10T10:00:00Z',
  },
];

const initialReviews: Review[] = [
  {
    id: 'rev-1',
    productId: 'prod-black-soap',
    productName: "Comfy's Black Beauty Soap",
    customerId: 'demo-customer-1',
    customerName: 'Verified Customer',
    rating: 5,
    comment:
      "I was skeptical about black soap because many brands bleach or cause irritation. Comfy's Black Beauty Soap is truly different! My stubborn pimples cleared up within two weeks and my skin feels calm and glowing.",
    isVerifiedPurchase: true,
    isApproved: true,
    createdAt: '2026-02-12T14:20:00Z',
  },
  {
    id: 'rev-2',
    productId: 'prod-body-butter',
    productName: 'Comfy Glow Body Butter',
    customerId: 'demo-customer-2',
    customerName: 'Verified Customer',
    rating: 5,
    comment:
      'The texture of this body butter is so velvety. It keeps my dry skin moisturized all day even in dry weather. Fast delivery to Akure as well!',
    isVerifiedPurchase: true,
    isApproved: true,
    createdAt: '2026-02-18T09:15:00Z',
  },
  {
    id: 'rev-3',
    productId: 'combo-full-brightening-set',
    productName: 'Full Brightening Set',
    customerId: 'demo-customer-3',
    customerName: 'Verified Customer',
    rating: 5,
    comment:
      'Getting the full set saved me ₦1,200 and having all four products working together is magic. The coffee scrub followed by the butter and oil gives instant glass skin without bleaching!',
    isVerifiedPurchase: true,
    isApproved: true,
    createdAt: '2026-02-22T16:40:00Z',
  },
  {
    id: 'rev-4',
    productId: 'perfume-royal-oud-velvet',
    productName: 'Royal Oud Velvet Eau de Parfum',
    customerId: 'demo-customer-4',
    customerName: 'Verified Customer',
    rating: 5,
    comment:
      'Incredible projection and long-lasting scent. People stop me to ask what fragrance I am wearing. Highly recommended!',
    isVerifiedPurchase: true,
    isApproved: true,
    createdAt: '2026-02-25T11:05:00Z',
  },
];

const initialUsers: (User & { passwordHash: string })[] = [];
const configuredAdminEmail = process.env.ADMIN_EMAIL?.trim();
const configuredAdminPassword = process.env.ADMIN_PASSWORD;
if (configuredAdminEmail && configuredAdminPassword) {
  initialUsers.push({
    id: 'user-admin-configured',
    fullName: 'Store Administrator',
    email: configuredAdminEmail,
    phone: '',
    role: 'admin',
    address: '',
    city: '',
    state: '',
    passwordHash: hashPassword(configuredAdminPassword),
    createdAt: new Date().toISOString(),
  });
}

const initialOrders: Order[] = [
  {
    id: 'order-sample-1',
    reference: 'CG-2026-10482',
    customer: {
      id: 'user-customer-demo',
      fullName: 'Demo Customer',
      email: 'customer@example.invalid',
      phone: '000-000-0000',
    },
    delivery: {
      address: 'Demo address',
      town: 'Oye-Ekiti',
      state: 'Ekiti State',
      zoneId: 'zone-ekiti-oye',
      zoneName: 'Oye-Ekiti (Federal University FUOYE & Town)',
      fee: 2500,
      instructions: 'Demo delivery note',
    },
    items: [
      {
        productId: 'combo-full-brightening-set',
        name: 'Full Brightening Set',
        category: 'combos',
        quantity: 1,
        unitPrice: 15000,
        lineTotal: 15000,
        image: '/src/assets/images/comfy_hero_collection_1791541604861.jpg',
      },
      {
        productId: 'perfume-royal-oud-velvet',
        name: 'Royal Oud Velvet Eau de Parfum',
        category: 'perfumes',
        quantity: 1,
        selectedVariant: '50ml Standard Flacon',
        unitPrice: 12000,
        lineTotal: 12000,
        image: '/src/assets/images/comfy_hero_collection_1791541604861.jpg',
      },
    ],
    subtotal: 27000,
    deliveryFee: 2500,
    total: 29500,
    status: 'confirmed',
    paymentStatus: 'bank_transfer_arranged',
    contactPreference: 'whatsapp',
    internalNotes: 'Customer verified phone and confirmed delivery window for Thursday.',
    createdAt: '2026-03-01T10:15:00Z',
    updatedAt: '2026-03-01T11:00:00Z',
    statusHistory: [
      { status: 'pending', timestamp: '2026-03-01T10:15:00Z', note: 'Order submitted via website form' },
      { status: 'confirmed', timestamp: '2026-03-01T11:00:00Z', note: 'Confirmed with customer by Admin via WhatsApp' },
    ],
  },
];

class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure all top-level keys exist
        const users = parsed.users || initialUsers;
        const configuredAdmin = initialUsers.find((user) => user.role === 'admin');
        if (configuredAdmin && !users.some((user: User) => user.role === 'admin')) {
          users.push(configuredAdmin);
        }
        return {
          users,
          products: parsed.products || initialProducts,
          orders: parsed.orders || initialOrders,
          deliveryZones: parsed.deliveryZones || initialDeliveryZones,
          reviews: parsed.reviews || initialReviews,
          settings: parsed.settings || initialSettings,
          contactMessages: parsed.contactMessages || [],
          emailNotifications: parsed.emailNotifications || [],
        };
      }
    } catch (err) {
      console.error('Failed to load database from disk, using fallback initial data:', err);
    }

    const defaultDb: DatabaseSchema = {
      users: initialUsers,
      products: initialProducts,
      orders: initialOrders,
      deliveryZones: initialDeliveryZones,
      reviews: initialReviews,
      settings: initialSettings,
      contactMessages: [],
      emailNotifications: [],
    };

    this.saveDatabase(defaultDb);
    return defaultDb;
  }

  private saveDatabase(dataToSave?: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const data = dataToSave || this.data;
      const tmpFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('Error saving database to disk:', err);
    }
  }

  // --- Users & Auth ---
  public getUsers() {
    return this.data.users;
  }

  public findUserByEmail(email: string) {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string) {
    return this.data.users.find((u) => u.id === id);
  }

  public createUser(userData: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    address?: string;
    city?: string;
    state?: string;
  }): User {
    const existing = this.findUserByEmail(userData.email);
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const newUser: User & { passwordHash: string } = {
      id: `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      fullName: userData.fullName.trim(),
      email: userData.email.toLowerCase().trim(),
      phone: userData.phone.trim(),
      role: 'customer',
      address: userData.address || '',
      city: userData.city || '',
      state: userData.state || '',
      passwordHash: hashPassword(userData.password),
      createdAt: new Date().toISOString(),
    };

    this.data.users.push(newUser);
    this.saveDatabase();

    const { passwordHash: _, ...safeUser } = newUser;
    return safeUser;
  }

  public updateUserProfile(
    userId: string,
    updates: Partial<{ fullName: string; phone: string; address: string; city: string; state: string }>
  ): User | null {
    const user = this.data.users.find((u) => u.id === userId);
    if (!user) return null;

    if (updates.fullName) user.fullName = updates.fullName.trim();
    if (updates.phone) user.phone = updates.phone.trim();
    if (updates.address !== undefined) user.address = updates.address.trim();
    if (updates.city !== undefined) user.city = updates.city.trim();
    if (updates.state !== undefined) user.state = updates.state.trim();

    this.saveDatabase();
    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  // --- Products ---
  public getProducts(includeDrafts = false): Product[] {
    if (includeDrafts) {
      return this.data.products;
    }
    return this.data.products.filter((p) => !p.isDraft);
  }

  public getProductById(id: string): Product | undefined {
    return this.data.products.find((p) => p.id === id);
  }

  public getProductBySlug(slug: string): Product | undefined {
    return this.data.products.find((p) => p.slug === slug);
  }

  public createProduct(product: Omit<Product, 'id' | 'createdAt'>): Product {
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.products.push(newProduct);
    this.saveDatabase();
    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const index = this.data.products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    this.data.products[index] = {
      ...this.data.products[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveDatabase();
    return this.data.products[index];
  }

  public deleteProduct(id: string): boolean {
    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter((p) => p.id !== id);
    if (this.data.products.length !== initialLen) {
      this.saveDatabase();
      return true;
    }
    return false;
  }

  // --- Orders ---
  public getOrders(): Order[] {
    return this.data.orders.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getOrdersByUserId(userId: string): Order[] {
    return this.data.orders
      .filter((o) => o.customer.id === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getOrderByReference(ref: string): Order | undefined {
    return this.data.orders.find((o) => o.reference.toLowerCase() === ref.toLowerCase());
  }

  public getOrderById(id: string): Order | undefined {
    return this.data.orders.find((o) => o.id === id);
  }

  public createOrder(orderPayload: {
    customer: { id: string; fullName: string; email: string; phone: string; altPhone?: string };
    delivery: { address: string; town: string; state: string; instructions?: string; zoneId?: string };
    items: { productId: string; quantity: number; selectedVariant?: string }[];
    contactPreference: 'call' | 'whatsapp' | 'sms';
    isWholesale?: boolean;
    wholesaleDetails?: string;
  }): Order {
    // 1. Verify items & lock in unit price snapshot
    const snapshotItems: Order['items'] = [];
    let subtotal = 0;

    for (const item of orderPayload.items) {
      const product = this.getProductById(item.productId);
      if (!product) {
        throw new Error(`Product with ID "${item.productId}" was not found.`);
      }
      if (item.quantity <= 0) {
        throw new Error(`Invalid quantity for product "${product.name}".`);
      }

      let unitPrice = product.price;
      if (item.selectedVariant && product.sizeVariants) {
        const variant = product.sizeVariants.find((v) => v.size === item.selectedVariant);
        if (variant) {
          unitPrice = variant.price;
        }
      }

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

    // 2. Calculate Delivery Fee based on configured zones
    let deliveryFee = 0;
    let manualConfirmationRequired = false;
    let zoneName = 'Default Zone';

    if (orderPayload.delivery.zoneId) {
      const zone = this.data.deliveryZones.find((z) => z.id === orderPayload.delivery.zoneId);
      if (zone) {
        deliveryFee = zone.fee;
        zoneName = zone.areaName;
      }
    } else {
      // Find matching state / city zone
      const matchedZone = this.data.deliveryZones.find(
        (z) =>
          z.state.toLowerCase() === orderPayload.delivery.state.toLowerCase() &&
          (z.areaName.toLowerCase().includes(orderPayload.delivery.town.toLowerCase()) ||
            orderPayload.delivery.town.toLowerCase().includes('ado'))
      );
      if (matchedZone) {
        deliveryFee = matchedZone.fee;
        zoneName = matchedZone.areaName;
      } else {
        // Fallback state zone
        const stateZone = this.data.deliveryZones.find(
          (z) => z.state.toLowerCase() === orderPayload.delivery.state.toLowerCase()
        );
        if (stateZone) {
          deliveryFee = stateZone.fee;
          zoneName = stateZone.areaName;
        } else {
          manualConfirmationRequired = true;
          deliveryFee = 0;
          zoneName = 'Outside Core Zones (Pending Confirmation)';
        }
      }
    }

    const total = subtotal + deliveryFee;
    const now = new Date();
    const year = now.getFullYear();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const reference = `CG-${year}-${randomSuffix}`;

    const newOrder: Order = {
      id: `order-${Date.now()}`,
      reference,
      customer: {
        id: orderPayload.customer.id,
        fullName: orderPayload.customer.fullName.trim(),
        email: orderPayload.customer.email.trim(),
        phone: orderPayload.customer.phone.trim(),
        altPhone: orderPayload.customer.altPhone?.trim(),
      },
      delivery: {
        address: orderPayload.delivery.address.trim(),
        town: orderPayload.delivery.town.trim(),
        state: orderPayload.delivery.state.trim(),
        instructions: orderPayload.delivery.instructions?.trim(),
        zoneId: orderPayload.delivery.zoneId,
        zoneName,
        fee: deliveryFee,
        manualConfirmationRequired,
      },
      items: snapshotItems,
      subtotal,
      deliveryFee,
      total,
      status: 'pending',
      paymentStatus: 'payment_pending',
      contactPreference: orderPayload.contactPreference || 'whatsapp',
      isWholesale: orderPayload.isWholesale || false,
      wholesaleDetails: orderPayload.wholesaleDetails,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      statusHistory: [
        {
          status: 'pending',
          timestamp: now.toISOString(),
          note: 'Order submitted via website order form',
        },
      ],
    };

    this.data.orders.push(newOrder);

    // Reduce stock counts gracefully if applicable
    for (const item of snapshotItems) {
      const prod = this.getProductById(item.productId);
      if (prod && prod.stock >= item.quantity) {
        prod.stock -= item.quantity;
      }
    }

    this.saveDatabase();
    return newOrder;
  }

  public updateOrderStatus(
    orderId: string,
    status: Order['status'],
    note?: string,
    paymentStatus?: Order['paymentStatus']
  ): Order | null {
    const order = this.data.orders.find((o) => o.id === orderId);
    if (!order) return null;

    const previousStatus = order.status;
    order.status = status;
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }
    order.updatedAt = new Date().toISOString();
    order.statusHistory.push({
      status,
      timestamp: new Date().toISOString(),
      note: note || `Order status updated to ${status}`,
    });

    // Automated email notifications on critical order status changes
    if (
      previousStatus !== status &&
      (status === 'confirmed' || status === 'dispatched' || status === 'delivered')
    ) {
      this.sendOrderEmailNotification(order, status);
    }

    this.saveDatabase();
    return order;
  }

  public sendOrderEmailNotification(
    order: Order,
    status: 'confirmed' | 'dispatched' | 'delivered'
  ): EmailNotification {
    const { subject, html } = generateOrderEmailHtml(order, status);

    const notification: EmailNotification = {
      id: `email-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
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

    if (!this.data.emailNotifications) {
      this.data.emailNotifications = [];
    }
    this.data.emailNotifications.unshift(notification);
    this.saveDatabase();
    return notification;
  }

  public getEmailNotifications(orderId?: string): EmailNotification[] {
    if (!this.data.emailNotifications) return [];
    if (orderId) {
      return this.data.emailNotifications.filter((e) => e.orderId === orderId);
    }
    return this.data.emailNotifications;
  }

  // --- Wishlist ---
  public toggleWishlist(userId: string, productId: string): { wishlist: string[]; added: boolean } {
    const user = this.data.users.find((u) => u.id === userId);
    if (!user) throw new Error('User not found');

    if (!user.wishlist) user.wishlist = [];
    const index = user.wishlist.indexOf(productId);
    let added = false;

    if (index > -1) {
      user.wishlist.splice(index, 1);
      added = false;
    } else {
      user.wishlist.push(productId);
      added = true;
    }

    this.saveDatabase();
    return { wishlist: user.wishlist, added };
  }

  public getWishlistProducts(userId: string): Product[] {
    const user = this.data.users.find((u) => u.id === userId);
    if (!user || !user.wishlist) return [];
    return this.data.products.filter((p) => user.wishlist?.includes(p.id));
  }

  // --- Recently Viewed ---
  public addRecentlyViewed(userId: string | null, productId: string): string[] {
    if (!userId) return []; // guest uses client-side sessionStorage
    const user = this.data.users.find((u) => u.id === userId);
    if (!user) return [];

    if (!user.recentlyViewed) user.recentlyViewed = [];
    if (user.recentlyViewed[0] === productId) return user.recentlyViewed;

    // Remove if already present to push to top
    user.recentlyViewed = user.recentlyViewed.filter((id) => id !== productId);
    user.recentlyViewed.unshift(productId);
    // Cap at 12 recent items
    user.recentlyViewed = user.recentlyViewed.slice(0, 12);

    this.saveDatabase();
    return user.recentlyViewed;
  }

  public getRecentlyViewedProducts(userId: string | null, guestIds?: string[]): Product[] {
    let ids: string[] = [];
    if (userId) {
      const user = this.data.users.find((u) => u.id === userId);
      ids = user?.recentlyViewed || [];
    } else if (guestIds && Array.isArray(guestIds)) {
      ids = guestIds;
    }

    if (!ids.length) return [];
    // Maintain ordering
    return ids
      .map((id) => this.data.products.find((p) => p.id === id && !p.isDraft))
      .filter((p): p is Product => Boolean(p));
  }

  public updateOrderInternalNotes(orderId: string, notes: string): Order | null {
    const order = this.data.orders.find((o) => o.id === orderId);
    if (!order) return null;
    order.internalNotes = notes;
    order.updatedAt = new Date().toISOString();
    this.saveDatabase();
    return order;
  }

  // --- Delivery Zones ---
  public getDeliveryZones(): DeliveryZone[] {
    return this.data.deliveryZones;
  }

  public updateDeliveryZone(id: string, updates: Partial<DeliveryZone>): DeliveryZone | null {
    const index = this.data.deliveryZones.findIndex((z) => z.id === id);
    if (index === -1) return null;
    this.data.deliveryZones[index] = {
      ...this.data.deliveryZones[index],
      ...updates,
    };
    this.saveDatabase();
    return this.data.deliveryZones[index];
  }

  public createDeliveryZone(zone: Omit<DeliveryZone, 'id'>): DeliveryZone {
    const newZone: DeliveryZone = {
      ...zone,
      id: `zone-${Date.now()}`,
    };
    this.data.deliveryZones.push(newZone);
    this.saveDatabase();
    return newZone;
  }

  public deleteDeliveryZone(id: string): boolean {
    const initialLen = this.data.deliveryZones.length;
    this.data.deliveryZones = this.data.deliveryZones.filter((z) => z.id !== id);
    if (this.data.deliveryZones.length !== initialLen) {
      this.saveDatabase();
      return true;
    }
    return false;
  }

  // --- Reviews ---
  public getReviews(productId?: string, onlyApproved = true): Review[] {
    return this.data.reviews.filter((r) => {
      const productMatches = !productId || r.productId === productId;
      const approvalMatches = !onlyApproved || r.isApproved;
      return productMatches && approvalMatches;
    });
  }

  public createReview(reviewData: {
    productId: string;
    productName: string;
    customerId: string;
    customerName: string;
    rating: number;
    comment: string;
    isVerifiedPurchase?: boolean;
  }): Review {
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      productId: reviewData.productId,
      productName: reviewData.productName,
      customerId: reviewData.customerId,
      customerName: reviewData.customerName,
      rating: Math.max(1, Math.min(5, reviewData.rating)),
      comment: reviewData.comment.trim(),
      isVerifiedPurchase: reviewData.isVerifiedPurchase ?? true,
      isApproved: true, // Auto-approve with moderation capability in admin
      createdAt: new Date().toISOString(),
    };

    this.data.reviews.push(newReview);

    // Update product rating and review count
    const product = this.getProductById(reviewData.productId);
    if (product) {
      const productReviews = this.getReviews(reviewData.productId, true);
      const avg =
        productReviews.reduce((acc, r) => acc + r.rating, 0) / (productReviews.length || 1);
      product.rating = Number(avg.toFixed(1));
      product.reviewCount = productReviews.length;
    }

    this.saveDatabase();
    return newReview;
  }

  public moderateReview(reviewId: string, isApproved: boolean): Review | null {
    const review = this.data.reviews.find((r) => r.id === reviewId);
    if (!review) return null;
    review.isApproved = isApproved;
    this.saveDatabase();
    return review;
  }

  public deleteReview(reviewId: string): boolean {
    const initialLen = this.data.reviews.length;
    this.data.reviews = this.data.reviews.filter((r) => r.id !== reviewId);
    if (this.data.reviews.length !== initialLen) {
      this.saveDatabase();
      return true;
    }
    return false;
  }

  // --- Settings ---
  public getSettings(): BusinessSettings {
    return this.data.settings;
  }

  public updateSettings(updates: Partial<BusinessSettings>): BusinessSettings {
    this.data.settings = {
      ...this.data.settings,
      ...updates,
      socialLinks: {
        ...this.data.settings.socialLinks,
        ...(updates.socialLinks || {}),
      },
    };
    this.saveDatabase();
    return this.data.settings;
  }

  // --- Contact Messages ---
  public getContactMessages(): ContactMessage[] {
    return this.data.contactMessages.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public createContactMessage(msg: Omit<ContactMessage, 'id' | 'createdAt' | 'isRead'>): ContactMessage {
    const newMsg: ContactMessage = {
      ...msg,
      id: `msg-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    this.data.contactMessages.push(newMsg);
    this.saveDatabase();
    return newMsg;
  }

  public markContactMessageRead(id: string): boolean {
    const msg = this.data.contactMessages.find((m) => m.id === id);
    if (msg) {
      msg.isRead = true;
      this.saveDatabase();
      return true;
    }
    return false;
  }

  // --- Admin Stats ---
  public getAdminStats() {
    const orders = this.data.orders;
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === 'pending').length;
    const confirmedOrders = orders.filter((o) => o.status === 'confirmed').length;
    const processingOrders = orders.filter((o) => o.status === 'processing').length;
    const dispatchedOrders = orders.filter((o) => o.status === 'dispatched').length;
    const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;
    const cancelledOrders = orders.filter((o) => o.status === 'cancelled').length;

    const totalRevenue = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((acc, o) => acc + o.total, 0);

    const publishedProducts = this.data.products.filter((p) => !p.isDraft).length;
    const draftSoapsCount = this.data.products.filter((p) => p.category === 'soaps' && p.isDraft).length;
    const lowStockProducts = this.data.products.filter((p) => p.stock > 0 && p.stock <= 20).length;
    const pendingReviews = this.data.reviews.filter((r) => !r.isApproved).length;
    const unreadMessages = this.data.contactMessages.filter((m) => !m.isRead).length;

    return {
      totalOrders,
      pendingOrders,
      confirmedOrders,
      processingOrders,
      dispatchedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
      publishedProducts,
      draftSoapsCount,
      lowStockProducts,
      pendingReviews,
      unreadMessages,
      totalCustomers: this.data.users.filter((u) => u.role === 'customer').length,
    };
  }
}

export const db = new DatabaseManager();
