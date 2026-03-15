const path    = require("path");
const express = require("express");
const cors    = require("cors");

// ✅ Load .env from the exact folder where server.js lives
require("dotenv").config({ path: path.join(__dirname, ".env") });

// Debug log — remove this line once you confirm it shows YES ✅
console.log("🔑 API Key loaded:", process.env.ANTHROPIC_API_KEY ? "YES ✅" : "NO ❌  — check your .env file");

const pool          = require("./db");
const userRoutes    = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");

const app = express();

// ── MIDDLEWARE ──────────────────────────────────────────────
// ✅ Allow requests from Vercel frontend and localhost
app.use(cors({
    origin: [
        'http://localhost:5000',
        'http://localhost:3000',
        'http://127.0.0.1:5500',
        'https://grovance-website.onrender.com',
        /\.vercel\.app$/,      // allow any Vercel preview URL
        /\.onrender\.com$/     // allow any Render URL
    ],
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── API ROUTES — always before static files ─────────────────
app.use("/api/users",    userRoutes);
app.use("/api/products", productRoutes);

// ── TEST ROUTES ─────────────────────────────────────────────
app.get("/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── SERVE FRONTEND ──────────────────────────────────────────
app.use(express.static(path.join(__dirname, "public")));
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ── START ───────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Grovance running at http://localhost:${PORT}`);
});
