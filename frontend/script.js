// ── CONFIG ──────────────────────────────────────────────
const ALLOWED_DOMAINS = ['vit.edu.in','vitapstudent.ac.in','iitm.ac.in','srmist.edu.in','mit.edu'];
const API = 'http://localhost:5000';

let currentUser   = JSON.parse(localStorage.getItem('grovanceUser')) || null;
let liveProducts  = [];
let filteredItems = [];
let activeCategory = 'All';

// Mock fallback data
const mockProducts = [
    { id:1, title:'Sony WH-1000XM4 Headphones', price:12000, category:'Electronics', college:'VIT Chennai', sellername:'Aarav P.', sellerphone:'9876543210', description:'Barely used ANC headphones.', image:'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600', isverified:true, label:'HOT', views:15 },
    { id:2, title:'Engineering Physics Textbook', price:450, category:'Books', college:'VIT Chennai', sellername:'Joseph K.', sellerphone:'9123456789', description:'No torn pages.', image:'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600', isverified:true, label:'NEW', views:3 },
    { id:3, title:'Casio FX-991EX ClassWiz', price:850, category:'Electronics', college:'IIT Madras', sellername:'Priya S.', sellerphone:'9988776655', description:'Working perfectly.', image:'https://images.unsplash.com/photo-1580211323048-d30922e96495?w=600', isverified:true, label:'DEAL', views:7 },
    { id:4, title:'Haier 53L Mini Refrigerator', price:4500, category:'Hostel Essentials', college:'SRM University', sellername:'Rohan D.', sellerphone:'9876512345', description:'Perfect dorm fridge.', image:'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600', isverified:true, label:'DEAL', views:12 },
    { id:5, title:'Arduino Uno Starter Kit', price:1500, category:'Electronics', college:'SRM University', sellername:'Vikram R.', sellerphone:'9112233445', description:'Full kit with sensors.', image:'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=600', isverified:true, label:'NEW', views:2 },
    { id:6, title:'Pigeon 1.5L Electric Kettle', price:350, category:'Hostel Essentials', college:'VIT Chennai', sellername:'Neha M.', sellerphone:'9887766554', description:'Works perfectly.', image:'https://images.unsplash.com/photo-1585515320310-259814833e62?w=600', isverified:true, label:'', views:5 },
];

// ── NAVIGATION ───────────────────────────────────────────
function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    if (viewId === 'view-marketplace') renderMarketplace();
    if (viewId === 'view-wanted')      renderWanted();
    if (viewId === 'view-my-listings') renderMyListings();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToCategory(cat) {
    showView('view-marketplace');
    setTimeout(() => {
        const pill = [...document.querySelectorAll('.category-pill')].find(p => p.textContent.includes(cat));
        if (pill) filterByCategory(cat, pill);
    }, 100);
}

function doHeroSearch() {
    const q = document.getElementById('hero-search').value.trim();
    showView('view-marketplace');
    setTimeout(() => {
        document.getElementById('market-search').value = q;
        filterProducts(q);
    }, 100);
}

function handleNavSearch(val) {
    if (document.getElementById('view-marketplace').classList.contains('active')) filterProducts(val);
}

// ── AUTH ─────────────────────────────────────────────────
async function handleRegister(e) {
    e.preventDefault();
    const name    = document.getElementById('reg-name').value.trim();
    const email   = document.getElementById('reg-email').value.trim().toLowerCase();
    const college = document.getElementById('reg-college').value;
    const phone   = document.getElementById('reg-phone').value.trim();

    const domain = email.split('@')[1];
    if (!domain || !ALLOWED_DOMAINS.includes(domain)) {
        alert('Please use a valid college email.\nAllowed: ' + ALLOWED_DOMAINS.join(', '));
        return;
    }
    try {
        const res = await fetch(`${API}/api/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, college, phone })
        });
        if (!res.ok) { alert('Registration failed: ' + await res.text()); return; }
        const data = await res.json();
        currentUser = data;
        localStorage.setItem('grovanceUser', JSON.stringify(data));
        updateAuthUI();
        alert(`Welcome to Grovance, ${data.name}! 🎉\nYou'll now see listings from ${data.college}.`);
        showView('view-marketplace');
    } catch { alert('Could not connect to server.'); }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const phone = document.getElementById('login-phone').value.trim();
    try {
        const res = await fetch(`${API}/api/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, phone })
        });
        if (!res.ok) { alert('Login failed: ' + await res.text()); return; }
        const data = await res.json();
        currentUser = data;
        localStorage.setItem('grovanceUser', JSON.stringify(data));
        updateAuthUI();
        alert(`Welcome back, ${data.name}! 👋\nShowing listings from ${data.college}.`);
        showView('view-marketplace');
    } catch { alert('Could not connect to server.'); }
}

function updateAuthUI() {
    const div = document.getElementById('auth-links');
    if (currentUser) {
        div.innerHTML = `
            <div style="display:flex;align-items:center;gap:12px;">
                <span style="font-size:12px;background:rgba(255,255,255,0.2);color:#fff;padding:4px 12px;border-radius:20px;font-weight:600;border:1px solid rgba(255,255,255,0.3);">
                    📍 ${currentUser.college}
                </span>
                <button onclick="showView('view-my-listings')" style="font-size:13px;color:#FFD54F;background:none;border:none;cursor:pointer;font-weight:600;">My Listings</button>
                <button onclick="logout()" style="font-size:13px;color:rgba(255,255,255,0.6);background:none;border:none;cursor:pointer;font-weight:600;">Logout</button>
            </div>`;
        // Show My Listings in nav
        const navBtn = document.getElementById('my-listings-nav');
        if (navBtn) navBtn.style.display = 'block';
    } else {
        div.innerHTML = `
            <button onclick="showView('view-login')" style="font-size:13px;color:#fff;background:none;border:none;cursor:pointer;font-weight:600;margin-right:12px;">Login</button>
            <button onclick="showView('view-register')" class="btn-gradient" style="padding:8px 18px;font-size:13px;font-weight:700;border-radius:6px;">Join Free</button>`;
        // Hide My Listings in nav
        const navBtn = document.getElementById('my-listings-nav');
        if (navBtn) navBtn.style.display = 'none';
    }
}

function logout() {
    localStorage.removeItem('grovanceUser');
    currentUser = null;
    updateAuthUI();
    showView('view-home');
}

// ── MARKETPLACE ──────────────────────────────────────────
async function renderMarketplace() {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:48px;color:#8A98B4;">Loading listings...</div>`;

    // ✅ Pass college to backend so it filters by university
    const college = currentUser ? encodeURIComponent(currentUser.college) : '';
    const url     = college ? `${API}/api/products?college=${college}` : `${API}/api/products`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error();
        liveProducts = await res.json();
    } catch {
        console.warn('Backend unreachable — using mock data');
        // Filter mock data by college too
        liveProducts = currentUser
            ? mockProducts.filter(p => p.college === currentUser.college)
            : mockProducts;
    }

    filteredItems = [...liveProducts];
    activeCategory = 'All';

    // Update title to show which campus
    const title = currentUser
        ? `${currentUser.college} Marketplace`
        : 'Campus Marketplace';
    document.getElementById('market-title').textContent = title;
    document.getElementById('market-count').textContent = `${liveProducts.length} listings available`;

    // Reset category pills
    document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
    const allPill = document.querySelector('.category-pill');
    if (allPill) allPill.classList.add('active');

    renderGrid(filteredItems);
}

function renderGrid(items) {
    const grid = document.getElementById('product-grid');
    if (!items.length) {
        grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px;">
            <div style="font-size:40px;margin-bottom:12px;">🔍</div>
            <div style="font-size:16px;font-weight:600;color:#0D1B3E;">No listings found</div>
            <div style="font-size:13px;color:#8A98B4;margin-top:6px;">
                ${currentUser ? `No items listed at ${currentUser.college} yet. Be the first!` : 'Try a different search or category.'}
            </div>
            <button onclick="showView('view-post')" style="margin-top:16px;background:#0D1B3E;color:#fff;border:none;padding:10px 24px;border-radius:6px;font-weight:600;cursor:pointer;">List an Item →</button>
        </div>`;
        return;
    }
    grid.innerHTML = items.map(p => buildCard(p)).join('');
}

// ── LABEL BADGE COLORS ───────────────────────────────────
function labelStyle(label) {
    if (label === 'HOT')  return 'background:#FF3D00;color:#fff;';
    if (label === 'NEW')  return 'background:#2E7D32;color:#fff;';
    if (label === 'DEAL') return 'background:#1565C0;color:#fff;';
    return 'background:#FF6D00;color:#fff;';
}

function buildCard(p) {
    const name     = p.sellername || 'Unknown';
    const verified = p.isverified || false;
    const imgSrc   = p.image
        ? (p.image.startsWith('http') ? p.image : `${API}/uploads/${p.image}`)
        : 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600';

    // View count badge
    const viewBadge = p.views >= 10
        ? `<span style="position:absolute;top:8px;right:8px;background:rgba(0,0,0,0.6);color:#fff;font-size:10px;font-weight:600;padding:3px 7px;border-radius:10px;">🔥 ${p.views} views</span>`
        : p.views > 0
        ? `<span style="position:absolute;top:8px;right:8px;background:rgba(0,0,0,0.4);color:#fff;font-size:10px;padding:3px 7px;border-radius:10px;">👁 ${p.views}</span>`
        : '';

    return `
    <div onclick="renderDetail(${p.id})"
        style="background:#fff;border:1px solid #DDE3EE;border-radius:8px;overflow:hidden;cursor:pointer;transition:box-shadow 0.2s,transform 0.2s;display:flex;flex-direction:column;"
        onmouseover="this.style.boxShadow='0 8px 24px rgba(13,27,62,0.14)';this.style.transform='translateY(-3px)'"
        onmouseout="this.style.boxShadow='none';this.style.transform='translateY(0)'">

        <div style="position:relative;height:180px;background:#F5F5F5;overflow:hidden;">
            <img src="${imgSrc}" alt="${p.title}"
                style="width:100%;height:100%;object-fit:cover;transition:transform 0.4s;"
                onerror="this.src='https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600'"
                onmouseover="this.style.transform='scale(1.05)'"
                onmouseout="this.style.transform='scale(1)'">
            ${p.label ? `<span style="position:absolute;top:8px;left:8px;font-size:10px;font-weight:700;padding:3px 8px;border-radius:3px;${labelStyle(p.label)}">${p.label}</span>` : ''}
            ${viewBadge}
            <span style="position:absolute;bottom:8px;left:8px;background:rgba(13,27,62,0.85);color:#fff;font-size:10px;font-weight:600;padding:3px 8px;border-radius:3px;">${p.category}</span>
        </div>

        <div style="padding:12px;flex:1;display:flex;flex-direction:column;gap:4px;">
            <div style="font-size:13px;font-weight:500;color:#0D1B3E;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${p.title}</div>
            <div style="font-size:19px;font-weight:900;color:#0D1B3E;margin-top:4px;">₹${Number(p.price).toLocaleString('en-IN')}</div>
            <div style="font-size:11px;color:#2E7D32;font-weight:600;">✓ Free Campus Pickup</div>
            <div style="display:flex;align-items:center;gap:5px;margin-top:6px;padding-top:8px;border-top:1px solid #EEF2F7;">
                <div style="width:22px;height:22px;border-radius:50%;background:#0D1B3E;display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:700;flex-shrink:0;">${name.charAt(0).toUpperCase()}</div>
                <span style="font-size:11px;color:#5A6A8A;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${name}</span>
                ${verified ? '<span style="font-size:10px;color:#2E7D32;font-weight:600;flex-shrink:0;">✔</span>' : ''}
            </div>
        </div>

        <div style="padding:0 12px 12px;">
            <button onclick="event.stopPropagation();quickBuyNow(${p.id})"
                style="width:100%;background:#FF6D00;color:#fff;border:none;padding:8px;border-radius:4px;font-size:12px;font-weight:700;cursor:pointer;"
                onmouseover="this.style.background='#E65100'" onmouseout="this.style.background='#FF6D00'">
                Buy Now
            </button>
        </div>
    </div>`;
}

// ── FILTER & SORT ────────────────────────────────────────
function filterByCategory(cat, el) {
    document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
    el.classList.add('active');
    activeCategory = cat;
    applyFilters();
}

function filterProducts(query) { applyFilters(query); }
function sortProducts(by)      { applyFilters(document.getElementById('market-search').value, by); }

function applyFilters(query, sort) {
    query = query ?? document.getElementById('market-search').value;
    sort  = sort  ?? document.getElementById('sort-select').value;
    const q = query.trim().toLowerCase();

    let items = liveProducts.filter(p => {
        const inCat   = activeCategory === 'All' || p.category === activeCategory;
        const inQuery = !q || p.title.toLowerCase().includes(q)
                           || (p.description || '').toLowerCase().includes(q)
                           || p.category.toLowerCase().includes(q);
        return inCat && inQuery;
    });

    if (sort === 'price-low')  items.sort((a,b) => a.price - b.price);
    if (sort === 'price-high') items.sort((a,b) => b.price - a.price);
    if (sort === 'hot')        items.sort((a,b) => (b.views || 0) - (a.views || 0));

    document.getElementById('market-count').textContent = `${items.length} of ${liveProducts.length} listings`;
    renderGrid(items);
}

// ── PRODUCT DETAIL ───────────────────────────────────────
async function renderDetail(id) {
    // ✅ Fetch single product from backend — this also increments view count
    let p;
    try {
        const res = await fetch(`${API}/api/products/${id}`);
        if (res.ok) {
            p = await res.json();
            // Update liveProducts so view count is fresh
            const idx = liveProducts.findIndex(x => x.id === id);
            if (idx !== -1) liveProducts[idx] = p;
        } else {
            p = liveProducts.find(x => x.id === id);
        }
    } catch {
        p = liveProducts.find(x => x.id === id);
    }

    if (!p) return;
    showView('view-product-detail');

    const sellerName  = p.sellername  || 'Unknown';
    const sellerPhone = p.sellerphone || '';
    const sellerYear  = p.selleryear  || '';
    const college     = p.college     || '';
    const isVerified  = p.isverified  || false;
    const imgSrc      = p.image
        ? (p.image.startsWith('http') ? p.image : `${API}/uploads/${p.image}`)
        : 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600';

    const isOwner = currentUser && currentUser.phone === sellerPhone;

    // Label badge in detail
    const labelHtml = p.label ? `
        <span style="font-size:11px;font-weight:700;padding:4px 10px;border-radius:4px;${labelStyle(p.label)};margin-left:8px;">
            ${p.label === 'HOT' ? '🔥' : p.label === 'NEW' ? '✨' : p.label === 'DEAL' ? '💰' : ''} ${p.label}
        </span>` : '';

    document.getElementById('detail-content').innerHTML = `
    <div style="background:#fff;border:1px solid #DDE3EE;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(13,27,62,0.08);">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0;">

            <div style="background:#F8F9FC;display:flex;align-items:center;justify-content:center;min-height:400px;padding:24px;border-right:1px solid #DDE3EE;">
                <img src="${imgSrc}" alt="${p.title}"
                    style="max-height:420px;max-width:100%;object-fit:contain;border-radius:8px;"
                    onerror="this.src='https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600'">
            </div>

            <div style="padding:28px;display:flex;flex-direction:column;gap:14px;">
                <div>
                    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                        <span style="font-size:12px;color:#4A90D9;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">${p.category}</span>
                        ${labelHtml}
                        <span style="font-size:11px;color:#8A98B4;">👁 ${p.views || 0} views</span>
                    </div>
                    <h2 style="font-size:22px;font-weight:800;color:#0D1B3E !important;line-height:1.3;margin-top:8px;">${p.title}</h2>
                </div>

                <div style="border-top:1px solid #EEF2F7;border-bottom:1px solid #EEF2F7;padding:14px 0;">
                    <div style="font-size:32px;font-weight:900;color:#0D1B3E;">₹${Number(p.price).toLocaleString('en-IN')}</div>
                    <div style="font-size:13px;color:#2E7D32;font-weight:600;margin-top:4px;">✓ Free Campus Pickup · No Hidden Charges</div>
                </div>

                <div style="background:#F8F9FC;border:1px solid #DDE3EE;border-radius:8px;padding:14px;">
                    <div style="font-size:11px;font-weight:700;color:#8A98B4;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">Seller Profile</div>
                    <div style="display:flex;align-items:center;gap:10px;">
                        <div style="width:40px;height:40px;border-radius:50%;background:#0D1B3E;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:16px;flex-shrink:0;">${sellerName.charAt(0).toUpperCase()}</div>
                        <div>
                            <div style="font-weight:700;color:#0D1B3E;font-size:15px;">${sellerName}</div>
                            <div style="font-size:12px;color:#8A98B4;">${sellerYear}${sellerYear && college ? ' • ' : ''}${college}</div>
                        </div>
                        ${isVerified ? '<span style="margin-left:auto;background:#E8F5E9;color:#2E7D32;font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;border:1px solid rgba(46,125,50,0.2);">VERIFIED ✔</span>' : ''}
                    </div>
                </div>

                <p style="font-size:14px;color:#2C3A5A !important;line-height:1.7;">${p.description || 'No description provided.'}</p>

                <div style="display:flex;flex-direction:column;gap:10px;">
                    <button onclick="buyNow('${sellerPhone}','${p.title.replace(/'/g,"\\'")}',${p.price})"
                        style="background:#FF6D00;color:#fff;border:none;padding:14px;border-radius:6px;font-weight:700;font-size:15px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;"
                        onmouseover="this.style.background='#E65100'" onmouseout="this.style.background='#FF6D00'">
                        🛒 Buy Now — Contact Seller
                    </button>
                    <button onclick="openOfferModal('${sellerPhone}','${p.title.replace(/'/g,"\\'")}',${p.price})"
                        style="background:#fff;color:#0D1B3E;border:2px solid #0D1B3E;padding:12px;border-radius:6px;font-weight:700;font-size:15px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;"
                        onmouseover="this.style.background='#F4F6F9'" onmouseout="this.style.background='#fff'">
                        💬 Make an Offer
                    </button>
                    <button onclick="openNegotiationChat(${p.id})"
                        style="background:linear-gradient(135deg,#0D1B3E,#1E3260);color:#fff;border:none;padding:12px;border-radius:6px;font-weight:700;font-size:15px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 3px 12px rgba(13,27,62,0.3);"
                        onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                        🤖 Negotiate with AI
                    </button>
                </div>

                ${isOwner ? `
                <button onclick="handleDeleteItem(${p.id})"
                    style="background:#FFF5F5;color:#C62828;border:1.5px solid #FFCDD2;padding:11px;border-radius:6px;font-weight:700;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;"
                    onmouseover="this.style.background='#FFEBEE'" onmouseout="this.style.background='#FFF5F5'">
                    🗑️ Delete My Listing
                </button>` : ''}
            </div>
        </div>
    </div>`;
}

// ── BUY NOW ──────────────────────────────────────────────
function buyNow(phone, title, price) {
    if (!currentUser) { alert('Please log in to contact the seller.'); showView('view-login'); return; }
    const msg = encodeURIComponent(`Hi! I'm interested in buying your "${title}" listed for ₹${price} on Grovance. Is it still available?`);
    window.open(`https://wa.me/91${phone}?text=${msg}`, '_blank');
}

function quickBuyNow(id) {
    const p = liveProducts.find(x => x.id === id);
    if (!p) return;
    if (!currentUser) { showView('view-login'); return; }
    buyNow(p.sellerphone || '', p.title, p.price);
}

// ── MAKE OFFER ───────────────────────────────────────────
let offerPhone = '', offerTitle = '', offerListedPrice = 0;

function openOfferModal(phone, title, price) {
    if (!currentUser) { alert('Please log in to make an offer.'); showView('view-login'); return; }
    offerPhone = phone; offerTitle = title; offerListedPrice = price;
    document.getElementById('modal-listed-price').textContent = '₹' + Number(price).toLocaleString('en-IN');
    document.getElementById('offer-amount').value = '';
    document.getElementById('offer-message').value = '';
    document.getElementById('offer-modal').style.display = 'flex';
}

function closeOfferModal(e) {
    if (!e || e.target === document.getElementById('offer-modal')) {
        document.getElementById('offer-modal').style.display = 'none';
    }
}

function sendOffer() {
    const amount  = document.getElementById('offer-amount').value.trim();
    const message = document.getElementById('offer-message').value.trim();
    if (!amount || isNaN(amount) || Number(amount) <= 0) { alert('Please enter a valid offer amount.'); return; }
    const offerMsg = message
        ? `Hi! I'd like to offer ₹${Number(amount).toLocaleString('en-IN')} for your "${offerTitle}" (listed at ₹${Number(offerListedPrice).toLocaleString('en-IN')}) on Grovance. ${message}`
        : `Hi! I'd like to offer ₹${Number(amount).toLocaleString('en-IN')} for your "${offerTitle}" (listed at ₹${Number(offerListedPrice).toLocaleString('en-IN')}) on Grovance. Is that okay?`;
    window.open(`https://wa.me/91${offerPhone}?text=${encodeURIComponent(offerMsg)}`, '_blank');
    document.getElementById('offer-modal').style.display = 'none';
}

// ── DELETE ITEM ──────────────────────────────────────────
async function handleDeleteItem(id) {
    if (!currentUser) return;
    if (!confirm('Delete this listing? This cannot be undone.')) return;
    try {
        const res = await fetch(`${API}/api/products/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sellerphone: currentUser.phone })
        });
        if (!res.ok) { alert('Failed to delete: ' + await res.text()); return; }
        alert('Listing deleted.');
        showView('view-marketplace');
    } catch { alert('Could not connect to server.'); }
}

// ── POST ITEM ────────────────────────────────────────────
async function handlePostItem(e) {
    e.preventDefault();
    if (!currentUser) { showView('view-login'); return; }
    const title       = document.getElementById('post-title').value.trim();
    const minPrice    = document.getElementById('post-min-price')?.value || '';
    const price       = document.getElementById('post-price').value;
    const category    = document.getElementById('post-category').value;
    const description = document.getElementById('post-desc').value.trim();
    const imageFile   = document.getElementById('post-image').files[0];

    const formData = new FormData();
    formData.append('title',       title);
    formData.append('price',       price);
    formData.append('category',    category);
    formData.append('description', description);
    formData.append('college',     currentUser.college);
    formData.append('sellername',  currentUser.name);
    if (minPrice) formData.append('min_price', minPrice);
    formData.append('sellerphone', currentUser.phone);
    if (imageFile) formData.append('image', imageFile);

    try {
        const res = await fetch(`${API}/api/products`, { method: 'POST', body: formData });
        if (!res.ok) { alert('Failed to post: ' + await res.text()); return; }
        alert('Item listed successfully! 🎉');
        document.getElementById('post-item-form').reset();
        document.getElementById('image-preview-wrap').innerHTML = `
            <div style="font-size:36px;margin-bottom:8px;">📷</div>
            <div style="font-size:14px;font-weight:600;color:#4A90D9;">Click to upload product photo</div>
            <div style="font-size:12px;color:#8A98B4;margin-top:4px;">JPG, PNG — max 5MB</div>`;
        showView('view-marketplace');
    } catch { alert('Could not connect to server.'); }
}

// ── IMAGE PREVIEW ────────────────────────────────────────
function previewImage(input) {
    if (!input.files || !input.files[0]) return;
    const reader = new FileReader();
    reader.onload = e => {
        document.getElementById('image-preview-wrap').innerHTML = `
            <img src="${e.target.result}" style="max-height:160px;border-radius:6px;object-fit:contain;">
            <div style="font-size:12px;color:#2E7D32;font-weight:600;margin-top:8px;">✓ Photo selected</div>`;
    };
    reader.readAsDataURL(input.files[0]);
}

// ── WANTED SECTION ───────────────────────────────────────
async function renderWanted() {
    const grid = document.getElementById('wanted-grid');
    if (!grid) return;
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:#8A98B4;">Loading wanted posts...</div>`;

    const college = currentUser ? encodeURIComponent(currentUser.college) : '';
    const url     = college ? `${API}/api/products/wanted/all?college=${college}` : `${API}/api/products/wanted/all`;

    try {
        const res   = await fetch(url);
        const items = res.ok ? await res.json() : [];

        if (!items.length) {
            grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:48px;">
                <div style="font-size:36px;margin-bottom:12px;">🔍</div>
                <div style="font-size:15px;font-weight:600;color:#0D1B3E;">No wanted posts yet</div>
                <div style="font-size:13px;color:#8A98B4;margin-top:6px;">Be the first to post what you're looking for!</div>
            </div>`;
            return;
        }

        grid.innerHTML = items.map(w => `
            <div style="background:#fff;border:1px solid #DDE3EE;border-radius:8px;padding:18px;transition:box-shadow 0.2s;"
                onmouseover="this.style.boxShadow='0 6px 20px rgba(13,27,62,0.1)'"
                onmouseout="this.style.boxShadow='none'">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">
                    <span style="background:#EBF4FF;color:#1565C0;font-size:11px;font-weight:700;padding:3px 10px;border-radius:4px;">WANTED</span>
                    <span style="font-size:11px;color:#8A98B4;">${new Date(w.created_at).toLocaleDateString('en-IN')}</span>
                </div>
                <div style="font-size:15px;font-weight:700;color:#0D1B3E;margin-bottom:6px;">${w.title}</div>
                ${w.description ? `<div style="font-size:13px;color:#5A6A8A;margin-bottom:8px;line-height:1.5;">${w.description}</div>` : ''}
                <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px;">
                    ${w.budget ? `<span style="font-size:13px;font-weight:700;color:#0D1B3E;">Budget: ₹${Number(w.budget).toLocaleString('en-IN')}</span>` : ''}
                    ${w.category ? `<span style="font-size:12px;color:#4A90D9;font-weight:600;">${w.category}</span>` : ''}
                </div>
                <div style="display:flex;align-items:center;justify-content:space-between;padding-top:10px;border-top:1px solid #EEF2F7;">
                    <div style="display:flex;align-items:center;gap:8px;">
                        <div style="width:28px;height:28px;border-radius:50%;background:#0D1B3E;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:700;">${w.buyername.charAt(0).toUpperCase()}</div>
                        <span style="font-size:12px;color:#5A6A8A;font-weight:500;">${w.buyername}</span>
                    </div>
                    <button onclick="contactBuyer('${w.buyerphone}','${w.title.replace(/'/g,"\\'")}',${w.budget || 0})"
                        style="background:#25D366;color:#fff;border:none;padding:7px 14px;border-radius:4px;font-size:12px;font-weight:700;cursor:pointer;">
                        I Have This →
                    </button>
                </div>
            </div>`).join('');
    } catch (err) {
        grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:#C62828;">Could not load wanted posts.</div>`;
    }
}

function contactBuyer(phone, title, budget) {
    if (!currentUser) { showView('view-login'); return; }
    const msg = budget
        ? `Hi! I saw your WANTED post for "${title}" (budget ₹${Number(budget).toLocaleString('en-IN')}) on Grovance. I have this item — interested?`
        : `Hi! I saw your WANTED post for "${title}" on Grovance. I have this item — interested?`;
    window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`, '_blank');
}

async function handlePostWanted(e) {
    e.preventDefault();
    if (!currentUser) { showView('view-login'); return; }

    const title       = document.getElementById('wanted-title').value.trim();
    const description = document.getElementById('wanted-desc').value.trim();
    const budget      = document.getElementById('wanted-budget').value;
    const category    = document.getElementById('wanted-category').value;

    try {
        const res = await fetch(`${API}/api/products/wanted`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title, description, budget, category,
                college:    currentUser.college,
                buyername:  currentUser.name,
                buyerphone: currentUser.phone
            })
        });
        if (!res.ok) { alert('Failed to post: ' + await res.text()); return; }
        alert('Wanted post created! Sellers will reach out on WhatsApp 🎉');
        document.getElementById('wanted-form').reset();
        renderWanted();
    } catch { alert('Could not connect to server.'); }
}

// ── INIT ─────────────────────────────────────────────────
updateAuthUI();


// ── AI NEGOTIATION CHAT ──────────────────────────────────

let chatHistory    = [];   // Anthropic messages array
let chatProduct    = null; // current product being negotiated
let chatAgreedPrice = null;

function openNegotiationChat(productId) {
    if (!currentUser) {
        alert('Please log in to negotiate.');
        showView('view-login');
        return;
    }

    chatProduct    = liveProducts.find(x => x.id === productId);
    chatHistory    = [];
    chatAgreedPrice = null;
    if (!chatProduct) return;

    // Build chat modal
    const modal = document.getElementById('chat-modal');
    modal.style.display = 'flex';

    document.getElementById('chat-item-name').textContent  = chatProduct.title;
    document.getElementById('chat-item-price').textContent = '₹' + Number(chatProduct.price).toLocaleString('en-IN');
    document.getElementById('chat-messages').innerHTML     = '';
    document.getElementById('chat-input').value            = '';
    document.getElementById('chat-deal-banner').style.display = 'none';
    document.getElementById('chat-send-btn').disabled      = false;

    // Opening message from AI
    const openingMsg = `Hi! I'm the AI assistant representing ${chatProduct.sellername || 'the seller'} for "${chatProduct.title}". The listed price is ₹${Number(chatProduct.price).toLocaleString('en-IN')}. What offer did you have in mind?`;
    appendMessage('ai', openingMsg);
    chatHistory.push({ role: 'assistant', content: openingMsg });
}

function closeChatModal(e) {
    if (!e || e.target === document.getElementById('chat-modal')) {
        document.getElementById('chat-modal').style.display = 'none';
        chatHistory = [];
        chatProduct = null;
    }
}

function appendMessage(type, text) {
    const box = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = `msg ${type}`;
    div.textContent = text;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

function showTyping() {
    const box = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = 'msg ai';
    div.id = 'typing-msg';
    div.innerHTML = `<div class="typing-indicator"><span></span><span></span><span></span></div>`;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

function hideTyping() {
    const t = document.getElementById('typing-msg');
    if (t) t.remove();
}

async function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const text  = input.value.trim();
    if (!text || !chatProduct) return;

    const btn = document.getElementById('chat-send-btn');
    btn.disabled = true;
    input.value  = '';

    // Add user message
    appendMessage('user', text);
    chatHistory.push({ role: 'user', content: text });

    showTyping();

    try {
        const res = await fetch(`${API}/api/products/negotiate`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages:    chatHistory,
                itemTitle:   chatProduct.title,
                listedPrice: chatProduct.price,
                minPrice:    chatProduct.min_price || Math.round(chatProduct.price * 0.8),
                sellerName:  chatProduct.sellername || 'the seller'
            })
        });

        hideTyping();

        if (!res.ok) {
            appendMessage('system', '⚠️ AI is unavailable. Please try again shortly.');
            btn.disabled = false;
            return;
        }

        const data = await res.json();
        appendMessage('ai', data.reply);
        chatHistory.push({ role: 'assistant', content: data.reply });

        // Deal reached!
        if (data.dealAgreed && data.agreedPrice) {
            chatAgreedPrice = data.agreedPrice;
            showDealBanner(data.agreedPrice);
            btn.disabled = true;
            appendMessage('deal', `🎉 Deal agreed at ₹${Number(data.agreedPrice).toLocaleString('en-IN')}! Send this to the seller for final approval.`);
        } else {
            btn.disabled = false;
        }

    } catch (err) {
        hideTyping();
        appendMessage('system', '⚠️ Connection error. Please try again.');
        btn.disabled = false;
    }
}

function showDealBanner(price) {
    const banner = document.getElementById('chat-deal-banner');
    banner.style.display = 'flex';
    document.getElementById('chat-agreed-price').textContent = '₹' + Number(price).toLocaleString('en-IN');
}

function sendDealToSeller() {
    if (!chatProduct || !chatAgreedPrice) return;
    const phone = chatProduct.sellerphone || '';
    const msg   = encodeURIComponent(
        `Hi ${chatProduct.sellername || ''}! I negotiated with your AI assistant on Grovance for "${chatProduct.title}".\n\n` +
        `Listed price: ₹${Number(chatProduct.price).toLocaleString('en-IN')}\n` +
        `Agreed price: ₹${Number(chatAgreedPrice).toLocaleString('en-IN')}\n\n` +
        `Do you approve this deal? I'm ready to pick it up!`
    );
    window.open(`https://wa.me/91${phone}?text=${msg}`, '_blank');
    document.getElementById('chat-modal').style.display = 'none';
}

// Allow Enter key to send
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('chat-input');
    if (input) {
        input.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendChatMessage();
            }
        });
    }
});


// ── MY LISTINGS ──────────────────────────────────────────
async function renderMyListings() {
    const container = document.getElementById('my-listings-grid');
    if (!container) return;

    if (!currentUser) {
        container.innerHTML = `
            <div style="text-align:center;padding:60px;">
                <div style="font-size:40px;margin-bottom:12px;">🔒</div>
                <div style="font-size:16px;font-weight:600;color:#0D1B3E;">Please log in to view your listings</div>
                <button onclick="showView('view-login')" style="margin-top:16px;background:#0D1B3E;color:#fff;border:none;padding:10px 24px;border-radius:6px;font-weight:600;cursor:pointer;">Login →</button>
            </div>`;
        return;
    }

    container.innerHTML = `<div style="text-align:center;padding:40px;color:#8A98B4;">Loading your listings...</div>`;

    try {
        // Fetch all products for user's college then filter by their phone
        const college = encodeURIComponent(currentUser.college);
        const res     = await fetch(`${API}/api/products?college=${college}`);
        const all     = res.ok ? await res.json() : [];

        // Filter to only this user's listings by matching phone
        const mine = all.filter(p => p.sellerphone === currentUser.phone);

        if (!mine.length) {
            container.innerHTML = `
                <div style="text-align:center;padding:60px;background:#fff;border:1px solid #DDE3EE;border-radius:12px;">
                    <div style="font-size:48px;margin-bottom:14px;">📦</div>
                    <div style="font-size:17px;font-weight:700;color:#0D1B3E;">You haven't listed anything yet</div>
                    <p style="color:#8A98B4;font-size:14px;margin-top:6px !important;">Items you list will appear here so you can manage or delete them.</p>
                    <button onclick="showView('view-post')"
                        style="margin-top:20px;background:#FF6D00;color:#fff;border:none;padding:12px 28px;border-radius:6px;font-weight:700;font-size:14px;cursor:pointer;">
                        List Your First Item →
                    </button>
                </div>`;
            return;
        }

        container.innerHTML = mine.map(p => {
            const imgSrc = p.image
                ? (p.image.startsWith('http') ? p.image : `${API}/uploads/${p.image}`)
                : 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600';

            const labelColor = p.label === 'HOT' ? '#FF3D00' : p.label === 'NEW' ? '#2E7D32' : p.label === 'DEAL' ? '#1565C0' : '#FF6D00';

            // Time since posted
            const posted  = p.created_at ? new Date(p.created_at) : null;
            const timeAgo = posted ? getTimeAgo(posted) : 'Recently';

            return `
            <div style="background:#fff;border:1px solid #DDE3EE;border-radius:10px;overflow:hidden;display:flex;align-items:stretch;transition:box-shadow 0.2s;"
                onmouseover="this.style.boxShadow='0 4px 16px rgba(13,27,62,0.1)'"
                onmouseout="this.style.boxShadow='none'">

                <!-- Image -->
                <div style="width:120px;flex-shrink:0;background:#F8F9FC;position:relative;cursor:pointer;" onclick="renderDetail(${p.id})">
                    <img src="${imgSrc}" alt="${p.title}"
                        style="width:100%;height:100%;object-fit:cover;"
                        onerror="this.src='https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600'">
                    ${p.label ? `<span style="position:absolute;top:6px;left:6px;background:${labelColor};color:#fff;font-size:9px;font-weight:700;padding:2px 7px;border-radius:3px;">${p.label}</span>` : ''}
                </div>

                <!-- Details -->
                <div style="flex:1;padding:14px 18px;display:flex;flex-direction:column;justify-content:space-between;gap:8px;cursor:pointer;" onclick="renderDetail(${p.id})">
                    <div>
                        <div style="font-size:15px;font-weight:700;color:#0D1B3E;line-height:1.3;">${p.title}</div>
                        <div style="display:flex;align-items:center;gap:12px;margin-top:6px;flex-wrap:wrap;">
                            <span style="font-size:18px;font-weight:900;color:#0D1B3E;">₹${Number(p.price).toLocaleString('en-IN')}</span>
                            <span style="font-size:12px;background:#EEF2F7;color:#5A6A8A;padding:3px 10px;border-radius:4px;font-weight:500;">${p.category}</span>
                            <span style="font-size:12px;color:#8A98B4;">👁 ${p.views || 0} views</span>
                            <span style="font-size:12px;color:#8A98B4;">🕐 ${timeAgo}</span>
                        </div>
                        ${p.description ? `<div style="font-size:12px;color:#8A98B4;margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:400px;">${p.description}</div>` : ''}
                    </div>
                </div>

                <!-- Actions -->
                <div style="display:flex;flex-direction:column;justify-content:center;gap:8px;padding:14px 16px;border-left:1px solid #EEF2F7;flex-shrink:0;">
                    <button onclick="renderDetail(${p.id})"
                        style="background:#EBF4FF;color:#1565C0;border:none;padding:8px 16px;border-radius:6px;font-weight:600;font-size:12px;cursor:pointer;white-space:nowrap;transition:background 0.15s;"
                        onmouseover="this.style.background='#DBEAFE'" onmouseout="this.style.background='#EBF4FF'">
                        View Listing
                    </button>
                    <button onclick="confirmDelete(${p.id}, '${p.title.replace(/'/g, "\\'")}')"
                        style="background:#FFF5F5;color:#C62828;border:1.5px solid #FFCDD2;padding:8px 16px;border-radius:6px;font-weight:600;font-size:12px;cursor:pointer;white-space:nowrap;transition:all 0.15s;"
                        onmouseover="this.style.background='#FFEBEE';this.style.borderColor='#EF9A9A'"
                        onmouseout="this.style.background='#FFF5F5';this.style.borderColor='#FFCDD2'">
                        🗑 Delete
                    </button>
                </div>
            </div>`;
        }).join('');

        // Summary count
        const summary = document.createElement('div');
        summary.style.cssText = 'font-size:13px;color:#8A98B4;text-align:center;padding:12px;';
        summary.textContent   = `${mine.length} active listing${mine.length !== 1 ? 's' : ''}`;
        container.appendChild(summary);

    } catch (err) {
        container.innerHTML = `<div style="text-align:center;padding:40px;color:#C62828;">Could not load your listings. Is the server running?</div>`;
        console.error(err);
    }
}

// ── CONFIRM & DELETE ─────────────────────────────────────
function confirmDelete(id, title) {
    // Custom confirm dialog — cleaner than browser alert
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(13,27,62,0.6);z-index:20000;display:flex;align-items:center;justify-content:center;';

    overlay.innerHTML = `
        <div style="background:#fff;border-radius:12px;padding:28px;max-width:380px;width:90%;box-shadow:0 20px 60px rgba(13,27,62,0.25);">
            <div style="font-size:32px;text-align:center;margin-bottom:12px;">🗑️</div>
            <h3 style="font-size:17px;font-weight:800;color:#0D1B3E;text-align:center;margin-bottom:8px;">Delete this listing?</h3>
            <p style="font-size:13px;color:#8A98B4;text-align:center;line-height:1.5;margin-bottom:22px;">"${title}"<br>This cannot be undone.</p>
            <div style="display:flex;gap:10px;">
                <button onclick="this.closest('.delete-overlay').remove()"
                    style="flex:1;background:#F4F6F9;color:#5A6A8A;border:none;padding:12px;border-radius:6px;font-weight:600;font-size:14px;cursor:pointer;">
                    Cancel
                </button>
                <button onclick="executeDelete(${id});this.closest('.delete-overlay').remove()"
                    style="flex:1;background:#C62828;color:#fff;border:none;padding:12px;border-radius:6px;font-weight:700;font-size:14px;cursor:pointer;">
                    Yes, Delete
                </button>
            </div>
        </div>`;

    overlay.classList.add('delete-overlay');
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
}

async function executeDelete(id) {
    if (!currentUser) return;
    try {
        const res = await fetch(`${API}/api/products/${id}`, {
            method:  'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ sellerphone: currentUser.phone })
        });

        if (!res.ok) {
            alert('Failed to delete: ' + await res.text());
            return;
        }

        // Remove from liveProducts cache
        liveProducts = liveProducts.filter(p => p.id !== id);

        // Show success toast
        showToast('✅ Listing deleted successfully');

        // Refresh my listings view
        renderMyListings();

    } catch {
        alert('Could not connect to server.');
    }
}

// ── TOAST NOTIFICATION ───────────────────────────────────
function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
        background:#0D1B3E;color:#fff;padding:12px 24px;border-radius:8px;
        font-size:14px;font-weight:600;z-index:99999;
        box-shadow:0 8px 24px rgba(13,27,62,0.3);
        animation:slideUpToast 0.3s ease;
    `;
    toast.textContent = message;

    // Add animation
    const style = document.createElement('style');
    style.textContent = `@keyframes slideUpToast { from { opacity:0; transform:translateX(-50%) translateY(20px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`;
    document.head.appendChild(style);

    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ── TIME AGO HELPER ──────────────────────────────────────
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60)   return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString('en-IN');
}
