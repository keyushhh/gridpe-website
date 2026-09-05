# Grid.Pe — Real Notes, To Your Door

[![Website](https://img.shields.io/badge/website-grid.pe-00e599?style=flat-square)](https://grid.pe)
[![License](https://img.shields.io/badge/license-Proprietary-black?style=flat-square)](#legal)
[![Status](https://img.shields.io/badge/pilot-Bengaluru-yellow?style=flat-square)](#coverage)

**Grid.Pe** is a cash-logistics and currency-exchange platform built for India. Skip the ATM hunt — order what you need in the app, track a KYC-verified delivery partner live on the map, and confirm the handover with a secure 6-digit OTP.

---

## ⚡ Features

- **Doorstep Cash Delivery**: Request currency in exact denominations directly to your location.
- **Transparent Fee Structure**: Upfront pricing breakdown before confirmation — delivery fee, platform fee, and GST on fees only (GST never touches the cash).
- **Zero Account Balance Required**: Single-order payments with no locked wallets or deposits.
- **Trust & Verification**:
  - KYC-verified delivery partners.
  - Biometric & MPIN app lock.
  - 6-digit OTP verification to complete handover.
  - 100% refund guarantee on failed deliveries or pre-dispatch cancellations.
- **Foreign Currency Exchange**: Exchange major global currencies (USD, EUR, etc.) with transparent line-by-line markups and zero hidden airport fees.
- **Interactive Coverage Map**: SVG & GeoJSON-powered interactive map showcasing active pilot zones (Bengaluru) and upcoming expansion cities (Guwahati, Shillong).
- **Direct Supabase Waitlist**: Serverless waitlist subscription backed by Supabase PostgREST.

---

## 🛠️ Tech Stack

- **Markup & Structure**: Semantic HTML5 (with OpenGraph & JSON-LD Structured Data for SEO)
- **Styling**: Modern Vanilla CSS3
  - Custom fluid typography & layout system
  - 3D kinetic animations & micro-interactions
  - Dark mode aesthetic with high-contrast accents
- **Logic & Interactions**: Modern Vanilla JavaScript (ES6+)
  - Custom scroll-reveal and kinetic typography
  - Interactive rider route animation & OTP demonstration
  - Dynamic D3 / GeoJSON India coverage map
  - Interactive custom cursor animations
- **Backend / Database**: [Supabase](https://supabase.com) (Waitlist PostgREST API)

---

## 📁 Project Structure

```text
gridpe-website/
├── 404.html              # Custom 404 error page
├── index.html            # Primary landing page
├── privacy.html          # Privacy policy
├── terms.html            # Terms of service
├── styles.css            # Core design system & responsive styling
├── main.js               # Client-side interactions, animations & map
├── robots.txt            # Search engine crawler instructions
├── sitemap.xml           # XML Sitemap
├── assets/               # Production-optimized assets
│   ├── favicon/          # Multi-platform icons and web manifest
│   ├── notes/            # Denomination graphics (₹10, ₹20, ₹50, ₹100, ₹200, ₹500)
│   ├── screens/          # App UI mockups & feature screenshots
│   └── india.geo.json    # India geographic boundaries for coverage map
└── _source/              # Raw design assets and exports
```

---

## 🚀 Getting Started

### Local Development

No build step or Node packages required! You can run the website using any static HTTP server:

#### Option 1: Python HTTP Server
```bash
# Python 3
python3 -m http.server 8000
```
Open [http://localhost:8000](http://localhost:8000) in your browser.

#### Option 2: VS Code Live Server
1. Install the **Live Server** extension in VS Code.
2. Right-click `index.html` and select **"Open with Live Server"**.

#### Option 3: Node / npx
```bash
npx serve .
```

---

## 🌐 Deployment

### Hostinger Deployment (Git Auto-Deploy)

1. Go to **Hostinger hPanel** > **Websites** > **Manage**.
2. Navigate to **Advanced** > **Git**.
3. Set **Repository**: `https://github.com/keyushhh/gridpe-website.git`
4. Set **Branch**: `main`
5. Set **Install Directory**: `/public_html`
6. Click **Create** and enable **Auto-Deployment**.

### Vercel / Cloudflare Pages / Netlify

This project is zero-configuration static HTML:
- **Build Command**: *(leave empty)*
- **Output Directory**: `.` *(root)*

---

## 📄 Legal & Disclaimer

Grid.Pe is a cash-logistics and currency-exchange platform, **not a bank**. We do not hold customer balances, take deposits, or pay interest. Regulated foreign currency exchange and payment processing are handled in partnership with licensed entities.

© 2026 Grid.Pe. All rights reserved.
