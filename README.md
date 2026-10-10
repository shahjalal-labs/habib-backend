# 🌍 Habib — Cross-Border Multi-Country E-Commerce, International Logistics & Fulfillment API

![Architecture Banner](./assets/banner.svg)

<p align="center">
  <a href="https://www.postman.com/shahjalal-backend-9458759/shahjalal-api-portfolio/collection/48491387-39eca040-8125-45f8-bb17-c9b2f1c3b769" target="_blank">
    <img src="https://run.pstmn.io/button.svg" alt="View in Postman" />
  </a>
  <a href="https://www.postman.com/shahjalal-backend-9458759/shahjalal-api-portfolio/collection/48491387-39eca040-8125-45f8-bb17-c9b2f1c3b769" target="_blank">
    <img src="https://img.shields.io/badge/Postman-Instant_Live_API_Docs-FF6C37?style=for-the-badge&logo=postman&logoColor=white" alt="Live API Documentation" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/BullMQ-FF4500?style=for-the-badge&logo=redis&logoColor=white" alt="BullMQ" />
  <img src="https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white" alt="Stripe" />
  <img src="https://img.shields.io/badge/Cross_Border-0284C7?style=for-the-badge&logo=globe&logoColor=white" alt="Cross_Border" />
  
</p>

---

## 📌 Executive Overview

**Habib Backend** is an international e-commerce and cross-border trade engine. Built on **Node.js, TypeScript, Express, Prisma ORM, BullMQ, and Redis**, the platform enables global merchant sales across multiple countries: **country-specific product catalogs and localized shipping rules**, multi-tier coupon promotion engine, webhook-verified Stripe checkout, asynchronous background worker queues for email dispatches, Puppeteer automated PDF invoice generation, and customer verified review moderation.

---

## 🚀 Key Architectural & Domain Capabilities

- **Multi-Country Regional Cataloging**: Localized country landing sections (`CountrySectionInfo`, `CountryCardInfo`) and territory delivery rules.
- **Automated BullMQ Worker Architecture**: High-reliability Redis background workers handling asynchronous emails and fulfillment notifications.
- **Headless Puppeteer Invoice Generation**: Programmatic generation of compliant international commercial invoices and shipping manifests.
- **Stripe Payment Reconciliation**: Idempotent webhook listeners preventing duplicate order fulfillment or charge captures.
- **Promotional Coupon Engine**: Flexible discount rules supporting percent/fixed deductions, country limits, and per-user redemption caps.

---

## 📬 API Documentation & Interactive Postman Collection

The complete REST API specification is published in our public Postman showcase workspace:

* 🌐 **Instant Live API Documentation**: [Explore habib-backend in Postman (Instant Web View)](https://www.postman.com/shahjalal-backend-9458759/shahjalal-api-portfolio/collection/48491387-39eca040-8125-45f8-bb17-c9b2f1c3b769)
* 📁 **Local Postman File**: [`docs/postman_collection.json`](./docs/postman_collection.json) (ready for Postman Desktop or Newman CLI).

### Core Endpoint Modules

| Module | Base Route | Key Capabilities |
|---|---|---|
| **Authentication** | `/api/v1/auth` | Customer registration, passwordless OTP, JWT token refresh |
| **Country Locations** | `/api/v1/countrylocations` | Regional territory configuration, country cards, localized content |
| **Catalog & Brands** | `/api/v1/product` | Product catalog, multi-brand taxonomy, sku pricing, stock telemetry |
| **Orders & Payments** | `/api/v1/orderpayment` | Checkout session creation, Stripe webhook reconciliation, fulfillment status |
| **Coupon Engine** | `/api/v1/cuopon` | Discount code validation, usage quotas, promotional date windows |
| **Reviews & Ratings** | `/api/v1/review` | Customer ratings, verified buyer review submissions, star aggregations |

---

## 📂 Project Architecture

```plaintext
habib-backend/
├── assets/
│   └── banner.svg               # Architectural visual banner
├── docs/
│   └── postman_collection.json  # Full Postman API collection v2.1
├── src/
│   ├── app/
│   │   ├── middlewares/         # Global error handlers, auth & validation guards
│   │   ├── modules/             # Domain feature modules
│   │   └── routes/              # Centralized route registration
│   ├── config/                  # Environment & external service configurations
│   └── server.ts                # Application bootstrapper
├── prisma/
│   └── schema.prisma            # Prisma database schema definition
├── .env.example                 # Sanitized environment template
├── package.json
└── tsconfig.json
```

---

## 🛠️ Quickstart & Local Setup

### Prerequisites
* **Node.js**: `v20.x` or higher
* **Database**: MongoDB or PostgreSQL (as specified in `schema.prisma`)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/shahjalal-labs/habib-backend.git
cd habib-backend
npm install
```

### 2. Configure Environment Variables
```bash
cp .env.example .env
```

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Run Development Server
```bash
npm run dev
```

---

## 👨‍💻 Engineering & Authorship

Developed and engineered by **Md. Shahjalal**.

* **GitHub**: [@shahjalal-labs](https://github.com/shahjalal-labs)
* **Email**: [muhommodshahjalal@gmail.com](mailto:muhommodshahjalal@gmail.com)

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
