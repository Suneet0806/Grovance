# Grovance — Campus Marketplace

> **"Growth Made Simple"**  
> A campus-verified marketplace for university students to buy, sell, and exchange essentials safely.


---

## 📌 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [API Reference](#api-reference)
- [Team](#team)

---

## About

Grovance is a closed, campus-verified marketplace built exclusively for university students. Unlike unregulated WhatsApp groups or public marketplaces, Grovance allows only students with verified college email addresses to buy and sell items — eliminating scams and building a trusted peer-to-peer community.

**Target Users:**
- Freshmen who need affordable essentials (books, electronics, hostel items)
- Graduating students looking to sell or declutter before leaving campus
- Any student wanting to save money by buying second-hand from trusted peers

---

## Features

| Feature | Description |
|---|---|
| 🎓 Campus Verification | Only students with valid college emails can register |
| 🏫 University Filter | Marketplace shows only listings from your college |
| 🏷️ Smart Labels | HOT (10+ views), NEW (posted within 24h), DEAL (40%+ below average) |
| 🤖 AI Price Negotiation | Buyer negotiates with AI acting on behalf of the seller |
| 💬 Make an Offer | Send custom offer to seller via WhatsApp |
| 🛒 Buy Now | Instant WhatsApp contact with pre-filled message |
| 🔍 Wanted Board | Buyers post what they need — sellers reach out |
| 📋 My Listings | Manage and delete your own listings |
| 🗑️ Delete Listing | Remove items instantly with confirmation dialog |
| 👁️ View Counter | Tracks how many times each listing is viewed |
| 📷 Image Upload | Upload product photos stored on server |
| 🔎 Search & Filter | Search by keyword, filter by category, sort by price/views |

---

## Tech Stack

**Frontend**
- HTML5, CSS3, Vanilla JavaScript
- Tailwind CSS (CDN)
- Inter font (Google Fonts)

**Backend**
- Node.js + Express.js
- Multer (image uploads)
- dotenv (environment variables)

**Database**
- PostgreSQL
- node-postgres (pg)

**AI**
- Anthropic Claude API (claude-haiku — price negotiation chatbot)

---

## Project Structure

```
grovance/
├── backend/
│   ├── server.js              # Express server entry point
│   ├── db.js                  # PostgreSQL connection pool
│   ├── .env                   # Environment variables (never commit this)
│   ├── .env.example           # Template for .env
│   ├── package.json           # Dependencies
│   ├── setup.sql              # Initial DB table creation
│   ├── migration_v2.sql       # Adds views, created_at, wanted table
│   ├── migration_v3.sql       # Adds min_price column
│   ├── uploads/               # Uploaded product images (auto-created)
│   └── routes/
│       ├── productRoutes.js   # Product CRUD + AI negotiation + Wanted
│       └── userRoutes.js      # Register + Login
└── frontend/
    ├── index.html             # Single page app
    ├── script.js              # All frontend logic
    └── style.css              # Brand styling
```

---

## Getting Started

### Prerequisites

- Node.js v16 or higher
- PostgreSQL 13 or higher
- A free Anthropic API key (console.anthropic.com)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/grovance.git
cd grovance/backend
```

**2. Install dependencies**
```bash
npm install
```

**3. Set up environment variables**
```bash
cp .env.example .env
```
Then open `.env` and fill in your values (see [Environment Variables](#environment-variables)).

**4. Set up the database**
```bash
# Create the database in PostgreSQL first
psql -U postgres -c "CREATE DATABASE grovance;"

# Run the setup script
psql -U postgres -d grovance -f setup.sql

# Run migrations
psql -U postgres -d grovance -f migration_v2.sql
psql -U postgres -d grovance -f migration_v3.sql
```

**5. Start the server**
```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start
```

**6. Open the app**

Go to `http://localhost:5000` in your browser.

You should see in the terminal:
```
🔑 API Key loaded: YES ✅
✅ Database connected successfully
✅ Grovance running at http://localhost:5000
```

---

## Environment Variables

Create a `.env` file inside the `backend/` folder with these values:

```env
# PostgreSQL credentials
DB_USER=postgres
DB_PASS=your_password
DB_NAME=grovance
DB_HOST=localhost
DB_PORT=5432

# Server
PORT=5000

# Security
JWT_SECRET=your_jwt_secret_here

# Anthropic AI — get free key at console.anthropic.com
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

> ⚠️ Never commit your `.env` file to GitHub. It is listed in `.gitignore` by default.

---

## Database Setup

### Tables

**users**
| Column | Type | Description |
|---|---|---|
| id | SERIAL PRIMARY KEY | Auto-increment ID |
| name | TEXT | Full name |
| email | TEXT UNIQUE | College email |
| phone | TEXT | Phone number |
| college | TEXT | University name |

**products**
| Column | Type | Description |
|---|---|---|
| id | SERIAL PRIMARY KEY | Auto-increment ID |
| title | TEXT | Item name |
| price | NUMERIC | Selling price |
| min_price | NUMERIC | Minimum negotiable price (private) |
| category | TEXT | Books / Electronics / Hostel Essentials / Other |
| description | TEXT | Item description |
| college | TEXT | Seller's university |
| sellername | TEXT | Seller's name |
| sellerphone | TEXT | Seller's phone (for WhatsApp) |
| image | TEXT | Uploaded image filename |
| views | INTEGER | Number of times viewed |
| created_at | TIMESTAMP | When the listing was posted |

**wanted**
| Column | Type | Description |
|---|---|---|
| id | SERIAL PRIMARY KEY | Auto-increment ID |
| title | TEXT | What the buyer is looking for |
| description | TEXT | Additional details |
| budget | NUMERIC | Maximum budget |
| category | TEXT | Category preference |
| college | TEXT | Buyer's university |
| buyername | TEXT | Buyer's name |
| buyerphone | TEXT | Buyer's phone |
| created_at | TIMESTAMP | When the request was posted |

---

## API Reference

### Users

| Method | Endpoint | Description | Body |
|---|---|---|---|
| POST | `/api/users/register` | Register new user | `{ name, email, phone, college }` |
| POST | `/api/users/login` | Login existing user | `{ email, phone }` |

### Products

| Method | Endpoint | Description | Body / Query |
|---|---|---|---|
| GET | `/api/products` | Get all products | `?college=VIT+Chennai` (optional filter) |
| GET | `/api/products/:id` | Get single product + increment views | — |
| POST | `/api/products` | Create new listing | `FormData: { title, price, min_price, category, description, college, sellername, sellerphone, image }` |
| DELETE | `/api/products/:id` | Delete listing (seller only) | `{ sellerphone }` |

### Wanted

| Method | Endpoint | Description | Body / Query |
|---|---|---|---|
| GET | `/api/products/wanted/all` | Get wanted posts | `?college=VIT+Chennai` (optional) |
| POST | `/api/products/wanted` | Create wanted post | `{ title, description, budget, category, college, buyername, buyerphone }` |
| DELETE | `/api/products/wanted/:id` | Delete wanted post | `{ buyerphone }` |

### AI Negotiation

| Method | Endpoint | Description | Body |
|---|---|---|---|
| POST | `/api/products/negotiate` | Send message to AI negotiator | `{ messages, itemTitle, listedPrice, minPrice, sellerName }` |

---

## How the AI Negotiation Works

1. Seller sets a **minimum acceptable price** when listing an item (private — never shown to buyers)
2. Buyer clicks **"Negotiate with AI"** on any product detail page
3. AI acts as the seller's representative — friendly but firm
4. AI will never go below the `min_price` set by the seller
5. When both sides agree, AI outputs `DEAL_AGREED:₹[price]`
6. A green banner appears with a **"Send to Seller on WhatsApp"** button
7. Seller receives the agreed price via WhatsApp and approves or declines

---

## How Smart Labels Work

Labels are computed automatically on every marketplace load — no manual tagging needed.

| Label | Condition | Color |
|---|---|---|
| 🆕 NEW | Posted within the last 24 hours | Green |
| 🔥 HOT | 10 or more views | Red |
| 💰 DEAL | Price is 40%+ below category average | Blue |

---

## Team

| Role | Name | Responsibility |
|---|---|---|
| CEO | P Lokesh Sahitya | Vision, strategy, partnerships, overall execution |
| CFO | S Suneet | Finances, revenue models, sustainable operations |
| CTO | N Trivikram | Platform development, security, tech experience |

---

## License

This project is proprietary and built for Grovance. All rights reserved © 2025 Grovance.

---

*Built with ❤️ for campus students — Growth Made Simple*
