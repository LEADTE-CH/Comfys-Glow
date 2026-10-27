# Comfy’s Glow — “Glow with Elegance”
### Premium E-Commerce Website & Brand Platform for Beauty, Artisanal Soaps, and Luxury Fragrances
**Location:** Ado-Ekiti, Ekiti State, Nigeria  
**Contacts:** Configure your store contact details in the database settings.  
**Tagline:** *Glow with Elegance* • *“More Glow • More Value • More You”*

---

## 1. Executive Summary & Brand Direction

**Comfy’s Glow** is an artisanal beauty and fragrance house based in Ado-Ekiti, Ekiti State, Nigeria. Our philosophy centers on natural skin health and cellular radiance without caustic bleaching chemicals:

> *“We nourish and glow without bleaching. Brightening is about bringing out your skin’s natural radiance—caring for your beauty with organic purity.”*

This application delivers a production-grade, full-stack e-commerce experience integrating:
- **Artisanal Soaps Storefront:** The 5 soap varieties architecture, featuring the confirmed **Comfy’s Black Beauty Soap** (₦4,200) alongside editable draft records for varieties #2 through #5.
- **Nourishing Body Care:** Comfy Glow Body Scrub (₦4,200), Comfy Body Butter (₦3,800), and Comfy Body Oil (₦4,000).
- **Curated Value Combo Sets:** Brightening Trio (₦11,500, save ₦500), Brightening & Polish (₦11,800, save ₦200), and Full Brightening Set (₦15,000, save ₦1,200).
- **Independent Luxury Perfume Boutique:** Preserving the architecture of the perfume project (Oriental, Floral, Gourmand, Fresh, Woody, Citrus) with volume variants (30ml, 50ml, 100ml) and longevity/sillage specifications.
- **Customer Wishlist:** Add/remove products with instant heart toggle, separate from the cart, with one-click "Move to Bag".
- **Recently Viewed Products:** Session-based tracking for guests (cleared when closing browser) and persistent database storage for logged-in users.
- **Automated Brand-Styled Transactional Emails:** Automated luxury HTML emails generated upon 'Order Confirmed', 'Order Shipped' (dispatched), and 'Order Delivered' status updates.
- **Location-Based Delivery Fee Engine:** Automatic rates for Ekiti State (Ado-Ekiti, Ikere, Oye, Ijero) and Ondo State (Akure), with manual confirmation for other locations.
- **Website Order Form:** Secure checkout without card collection; payment arranged via bank transfer or cash upon phone/WhatsApp confirmation.
- **Protected Administrator Dashboard:** Real database analytics, product management, order workflow with internal notes, delivery fee editor, review moderation, and email logs.

---

## 2. Product Catalogue & Confirmed Pricing

### Individual Confirmed Products
| Product Name | Category | Net Content | Price (₦) | Key Ingredients & Description |
| :--- | :--- | :--- | :--- | :--- |
| **Comfy’s Black Beauty Soap** | Soaps | 120g jar | **₦4,200** | African black soap base, carrot root extract, pure aloe vera gel. Clears acne, pimples, and exfoliates without bleaching. |
| **Comfy Glow Body Scrub** | Body Care | 250g jar | **₦4,200** | Organic turmeric, roasted coffee, unrefined shea butter, almond oil, Vitamin E. Buffs dead skin and tones dark spots. |
| **Comfy Glow Body Butter** | Body Care | 250g jar | **₦3,800** | Whipped shea butter, sweet almond oil, vitamin E. 24-hour velvety moisture and skin barrier protection. |
| **Comfy Glow Body Oil** | Body Care | 100ml flacon | **₦4,000** | Botanical glow oils with pump dispenser. Imparts an instant golden sheen and deep radiance without staining fabrics. |

### The 5 Soap Varieties Architecture
The business produces **five soap varieties**. In accordance with instructions:
1. **Comfy’s Black Beauty Soap** (₦4,200) is confirmed by name and active on the public storefront.
2. **Soap Varieties #2, #3, #4, and #5** are created as editable draft records in the database with status `is_draft = True`. They remain hidden from public shoppers until the business owner supplies confirmed details and publishes them via the Admin Dashboard.

### Value Combo Sets (*More Glow • More Value • More You*)
| Combo Set | Contents | Regular Sum | Combo Price | Advertised Savings |
| :--- | :--- | :--- | :--- | :--- |
| **Brightening Trio** | Black Beauty Soap + Body Butter + Body Oil | ₦12,000 | **₦11,500** | **Save ₦500** |
| **Brightening & Polish** | Body Scrub + Body Butter + Body Oil | ₦12,000 | **₦11,800** | **Save ₦200** |
| **Full Brightening Set** | Black Beauty Soap + Body Scrub + Body Butter + Body Oil | ₦16,200 | **₦15,000** | **Save ₦1,200** |

---

## 3. Brand Identity & Visual System

- **Champagne Gold (`#C9A15B`):** Premium accents, borders, star ratings, and subtle badges.
- **Deep Burgundy (`#59172F`):** Primary brand headings, buttons, and status emphasis.
- **Royal Plum (`#5B286F`):** Secondary accents and luxury highlights.
- **Soft Lavender (`#E9DDF2`):** Surface contrast and subtle badges.
- **Warm Ivory (`#FFF9F2`):** Universal brand canvas background.
- **Rich Charcoal (`#29232B`):** High-contrast readable body prose.
- **Typography:** Display serif headlines (`Playfair Display`, `Cormorant Garamond`) paired with geometric body text (`Plus Jakarta Sans`) and tabular numerals (`font-mono tabular-nums`).

---

## 4. Delivery Zones & Calculations

Confirmed service areas:
- **Ekiti State:**
  - Ado-Ekiti (Town Centre, Adebayo, Basiri, GRA): **₦1,500** (Same day – 24 hrs)
  - Ikere-Ekiti & environs: **₦2,000** (24–48 hrs)
  - Oye-Ekiti (FUOYE campus & town): **₦2,500** (24–48 hrs)
  - Ijero-Ekiti & environs: **₦2,500** (1–2 days)
  - Other Ekiti State towns: **₦3,000** (1–3 days)
- **Ondo State:**
  - Akure (Central, Alagbaka, FUTA, Ijapo): **₦3,500** (1–2 days)
  - Other Ondo State towns (Ondo Town, Owo): **₦4,500** (2–3 days)
- **Other Nigerian States:** Flagged as requiring manual rate confirmation upon order placement without hardcoded guesswork.

All delivery rates are editable directly by the administrator via the Admin Dashboard.

---

## 5. Technology Stack & Architecture

### Full-Stack Express Server with Vite Middleware
- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Motion, Lucide icons.
- **Backend API:** Node.js Express server running on port `3000` (`server.ts`).
- **Database & Persistence:** Real persistent data layer stored at `./data/db.json` with synchronous atomic file operations, ensuring orders, products, reviews, customer accounts, and settings persist across restarts.
- **Python / Django Architecture:** Complete Django models, serializers, views, admin, and migration scripts provided in `/python_backend/`.

---

## 6. How to Run Locally (Step-by-Step Guide)

### Prerequisites
1. **Node.js**: Version 18, 20, or 22 installed (Download from [nodejs.org](https://nodejs.org/)).
2. **NPM**: Bundled automatically with Node.js.

---

### Method A: Windows (10 / 11)
1. **Download & Extract**:
   - Download `comfys-glow-windows.zip` (or `comfys-glow-project.zip`).
   - Right-click the downloaded `.zip` file in File Explorer and select **Extract All...**.
   - Choose your desired destination folder (e.g., `C:\Projects\comfys-glow`) and click **Extract**.
2. **Open Terminal / PowerShell**:
   - Open **PowerShell** or **Command Prompt** (CMD).
   - Navigate into the extracted project folder:
     ```powershell
     cd C:\Projects\comfys-glow
     ```
3. **Install Dependencies & Start**:
     ```powershell
     npm install
     npm run dev
     ```
4. **Open in Browser**:
   - Visit **`http://localhost:3000`** in Chrome, Edge, or Firefox.

---

### Method B: macOS (MacBook / iMac)
1. **Download & Extract**:
   - Download `comfys-glow-windows.zip` or `comfys-glow-project.zip`.
   - Double-click the file in Finder (or run `unzip comfys-glow-project.zip` in Terminal).
   - Finder will automatically extract the `comfys-glow` folder.
2. **Open Terminal**:
   - Open the **Terminal** app.
   - Navigate into the extracted directory:
     ```bash
     cd ~/Downloads/comfys-glow
     ```
3. **Install Dependencies & Start**:
     ```bash
     npm install
     npm run dev
     ```
4. **Open in Browser**:
   - Visit **`http://localhost:3000`** in Safari or Chrome.

---

### Method C: Linux / Ubuntu / WSL
1. **Extract**:
     ```bash
     unzip comfys-glow-project.zip
     # OR if using the tarball:
     tar -xzf comfys-glow-project.tar.gz
     ```
2. **Enter Directory & Run**:
     ```bash
     cd comfys-glow
     npm install
     copy .env.example .env
     npm run dev
     ```
3. **Open in Browser**:
   - Visit **`http://localhost:3000`**.

---

### Production Build & Launch
To test the production build locally:
```bash
npm run build
npm run start
```

### Deploying to Vercel and Render
Vercel serves the frontend, while the Express API runs as a Render web service. The Render blueprint in `render.yaml` configures the API and a persistent disk for `data/db.json`; persistent storage requires a paid Render service.

1. In Render, create a new Blueprint from this repository and deploy the `comfys-glow-api` service.
2. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in the Render service environment. Use the same values for the administrator sign-in page.
3. Keep the Render service URL as `https://comfys-glow-api.onrender.com`, which is the API destination configured in `vercel.json`. If Render assigns a different URL, update that rewrite destination to match.
4. Redeploy the Vercel project so `/api/*` requests are forwarded to the running Express API.

The API service needs to be deployed and its environment variables configured before login, orders, or other API-backed features will work on the Vercel site.

### Administrator Setup
Copy `.env.example` to `.env`, then set `ADMIN_EMAIL` and a unique `ADMIN_PASSWORD` before starting the server to create the initial administrator account. No default login credentials are included.

---

## 7. Automated Email Notification Verification

1. When an administrator signs into the Admin Dashboard and selects an order.
2. Changing the status to **Confirmed**, **Dispatched**, or **Delivered** automatically generates a brand-styled transactional email.
3. The email is logged in the system and viewable in full rendered HTML under the **Email Notifications Log** tab.
4. Customers can also view their sent order email notifications directly from their personal order receipt view in their account.
