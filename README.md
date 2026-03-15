📌 Table of Contents

About
Features
Tech Stack
Project Structure
Getting Started
Environment Variables
Database Setup
API Reference
Team


About
Grovance is a closed, campus-verified marketplace built exclusively for university students. Unlike unregulated WhatsApp groups or public marketplaces, Grovance allows only students with verified college email addresses to buy and sell items — eliminating scams and building a trusted peer-to-peer community.
Target Users:

Freshmen who need affordable essentials (books, electronics, hostel items)
Graduating students looking to sell or declutter before leaving campus
Any student wanting to save money by buying second-hand from trusted peers


Features
FeatureDescription🎓 Campus VerificationOnly students with valid college emails can register🏫 University FilterMarketplace shows only listings from your college🏷️ Smart LabelsHOT (10+ views), NEW (posted within 24h), DEAL (40%+ below average)🤖 AI Price NegotiationBuyer negotiates with AI acting on behalf of the seller💬 Make an OfferSend custom offer to seller via WhatsApp🛒 Buy NowInstant WhatsApp contact with pre-filled message🔍 Wanted BoardBuyers post what they need — sellers reach out📋 My ListingsManage and delete your own listings🗑️ Delete ListingRemove items instantly with confirmation dialog👁️ View CounterTracks how many times each listing is viewed📷 Image UploadUpload product photos stored on server🔎 Search & FilterSearch by keyword, filter by category, sort by price/views

Tech Stack
Frontend

HTML5, CSS3, Vanilla JavaScript
Tailwind CSS (CDN)
Inter font (Google Fonts)

Backend

Node.js + Express.js
Multer (image uploads)
dotenv (environment variables)

Database

PostgreSQL
node-postgres (pg)

AI

Anthropic Claude API (claude-haiku — price negotiation chatbot)


Project Structure
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

Getting Started
Prerequisites

Node.js v16 or higher
PostgreSQL 13 or higher
A free Anthropic API key (console.anthropic.com)

Installation
1. Clone the repository
bashgit clone https://github.com/YOUR_USERNAME/grovance.git
cd grovance/backend
2. Install dependencies
bashnpm install
3. Set up environment variables
bashcp .env.example .env
Then open .env and fill in your values (see Environment Variables).
4. Set up the database
bash# Create the database in PostgreSQL first
psql -U postgres -c "CREATE DATABASE grovance;"

# Run the setup script
psql -U postgres -d grovance -f setup.sql

# Run migrations
psql -U postgres -d grovance -f migration_v2.sql
psql -U postgres -d grovance -f migration_v3.sql
5. Start the server
bash# Development (auto-restart on changes)
npm run dev

# Production
npm start
6. Open the app
Go to http://localhost:5000 in your browser.
You should see in the terminal:
🔑 API Key loaded: YES ✅
✅ Database connected successfully
✅ Grovance running at http://localhost:5000

Environment Variables
Create a .env file inside the backend/ folder with these values:
env# PostgreSQL credentials
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

⚠️ Never commit your .env file to GitHub. It is listed in .gitignore by default.


Database Setup
Tables
users
ColumnTypeDescriptionidSERIAL PRIMARY KEYAuto-increment IDnameTEXTFull nameemailTEXT UNIQUECollege emailphoneTEXTPhone numbercollegeTEXTUniversity name
products
ColumnTypeDescriptionidSERIAL PRIMARY KEYAuto-increment IDtitleTEXTItem namepriceNUMERICSelling pricemin_priceNUMERICMinimum negotiable price (private)categoryTEXTBooks / Electronics / Hostel Essentials / OtherdescriptionTEXTItem descriptioncollegeTEXTSeller's universitysellernameTEXTSeller's namesellerphoneTEXTSeller's phone (for WhatsApp)imageTEXTUploaded image filenameviewsINTEGERNumber of times viewedcreated_atTIMESTAMPWhen the listing was posted
wanted
ColumnTypeDescriptionidSERIAL PRIMARY KEYAuto-increment IDtitleTEXTWhat the buyer is looking fordescriptionTEXTAdditional detailsbudgetNUMERICMaximum budgetcategoryTEXTCategory preferencecollegeTEXTBuyer's universitybuyernameTEXTBuyer's namebuyerphoneTEXTBuyer's phonecreated_atTIMESTAMPWhen the request was posted

API Reference
Users
MethodEndpointDescriptionBodyPOST/api/users/registerRegister new user{ name, email, phone, college }POST/api/users/loginLogin existing user{ email, phone }
Products
MethodEndpointDescriptionBody / QueryGET/api/productsGet all products?college=VIT+Chennai (optional filter)GET/api/products/:idGet single product + increment views—POST/api/productsCreate new listingFormData: { title, price, min_price, category, description, college, sellername, sellerphone, image }DELETE/api/products/:idDelete listing (seller only){ sellerphone }
Wanted
MethodEndpointDescriptionBody / QueryGET/api/products/wanted/allGet wanted posts?college=VIT+Chennai (optional)POST/api/products/wantedCreate wanted post{ title, description, budget, category, college, buyername, buyerphone }DELETE/api/products/wanted/:idDelete wanted post{ buyerphone }
AI Negotiation
MethodEndpointDescriptionBodyPOST/api/products/negotiateSend message to AI negotiator{ messages, itemTitle, listedPrice, minPrice, sellerName }

How the AI Negotiation Works

Seller sets a minimum acceptable price when listing an item (private — never shown to buyers)
Buyer clicks "Negotiate with AI" on any product detail page
AI acts as the seller's representative — friendly but firm
AI will never go below the min_price set by the seller
When both sides agree, AI outputs DEAL_AGREED:₹[price]
A green banner appears with a "Send to Seller on WhatsApp" button
Seller receives the agreed price via WhatsApp and approves or declines


How Smart Labels Work
Labels are computed automatically on every marketplace load — no manual tagging needed.
LabelConditionColor🆕 NEWPosted within the last 24 hoursGreen🔥 HOT10 or more viewsRed💰 DEALPrice is 40%+ below category averageBlue

Team
RoleNameResponsibilityCEOP Lokesh SahityaVision, strategy, partnerships, overall executionCFOS SuneetFinances, revenue models, sustainable operationsCTON TrivikramPlatform development, security, tech experience

License
This project is proprietary and built for Grovance. All rights reserved © 2025 Grovance.

Built with ❤️ for campus students — Growth Made Simple
