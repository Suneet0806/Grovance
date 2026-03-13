// --- 1. DATA & CONFIGURATION ---
const ALLOWED_DOMAINS = ['vit.edu.in', 'iitm.ac.in', 'srmist.edu.in', 'mit.edu'];
let currentUser = JSON.parse(localStorage.getItem("grovanceUser")) || null;

// Expanded mock database with premium images and variety
let allProducts = JSON.parse(localStorage.getItem("grovanceProducts")) || [
    { 
        id: 1, title: "Sony WH-1000XM4 Headphones", price: 12000, category: "Electronics", college: "VIT Chennai", 
        sellerName: "Aarav P.", sellerYear: "3rd Year", sellerPhone: "9876543210", 
        description: "Barely used, perfect condition with active noise cancellation. Original box included. Upgrading to XM5.", 
        image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=600", 
        isVerified: true, label: 'HOT' 
    },
    { 
        id: 2, title: "Engineering Physics Textbook (8th Ed)", price: 450, category: "Books", college: "VIT Chennai", 
        sellerName: "Joseph K.", sellerYear: "2nd Year", sellerPhone: "9123456789", 
        description: "Standard text for 1st-year physics. No torn pages, some highlighting in chapter 3.", 
        image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600", 
        isVerified: true, label: 'NEW' 
    },
    { 
        id: 3, title: "Casio FX-991EX ClassWiz", price: 850, category: "Electronics", college: "IIT Madras", 
        sellerName: "Priya S.", sellerYear: "4th Year", sellerPhone: "9988776655", 
        description: "The best scientific calculator for engineering exams. Working flawlessly.", 
        image: "https://images.unsplash.com/photo-1580211323048-d30922e96495?auto=format&fit=crop&q=80&w=600", 
        isVerified: true, label: '' 
    },
    { 
        id: 4, title: "Haier 53L Mini Refrigerator", price: 4500, category: "Hostel Essentials", college: "SRM University", 
        sellerName: "Rohan D.", sellerYear: "Graduating", sellerPhone: "9876512345", 
        description: "Perfect size for a dorm room. Chills fast, runs quietly. Must pick up from hostel block B.", 
        image: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&q=80&w=600", 
        isVerified: true, label: 'DEAL' 
    },
    { 
        id: 5, title: "A1 Size Drafting Board & Mini Drafter", price: 600, category: "Other", college: "IIT Madras", 
        sellerName: "Karthik V.", sellerYear: "2nd Year", sellerPhone: "9001122334", 
        description: "Used only for one semester in Engineering Graphics. Drafter is fully calibrated.", 
        image: "https://images.unsplash.com/photo-1585408436575-b3a19eb1287c?auto=format&fit=crop&q=80&w=600", 
        isVerified: false, label: '' 
    },
    { 
        id: 6, title: "Pigeon 1.5L Electric Kettle", price: 350, category: "Hostel Essentials", college: "VIT Chennai", 
        sellerName: "Neha M.", sellerYear: "3rd Year", sellerPhone: "9887766554", 
        description: "Lifesaver for Maggie and coffee during late-night study sessions. Works perfectly.", 
        image: "https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&q=80&w=600", 
        isVerified: true, label: 'WANTED' 
    },
    { 
        id: 7, title: "Arduino Uno Ultimate Starter Kit", price: 1500, category: "Electronics", college: "SRM University", 
        sellerName: "Vikram R.", sellerYear: "1st Year", sellerPhone: "9112233445", 
        description: "Complete kit with breadboard, jumper wires, resistors, and sensors. Excellent for basic robotics.", 
        image: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=600", 
        isVerified: true, label: 'NEW' 
    },
    { 
        id: 8, title: "Hercules Roadeo Bicycle", price: 3000, category: "Other", college: "IIT Madras", 
        sellerName: "Sam K.", sellerYear: "4th Year", sellerPhone: "9445566778", 
        description: "Great for getting around the massive campus. Just serviced, new brake pads installed.", 
        image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=600", 
        isVerified: true, label: '' 
    }
];

// --- 2. NAVIGATION LOGIC ---
function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    if(viewId === 'view-marketplace') renderMarketplace();
    window.scrollTo(0,0);
}

// --- 3. AUTHENTICATION LOGIC ---
function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const college = document.getElementById('reg-college').value;
    const phone = document.getElementById('reg-phone').value;

    const domain = email.split('@')[1];
    if (!ALLOWED_DOMAINS.includes(domain)) {
        alert("Please use a valid college email address. Personal emails are not allowed.");
        return;
    }

    const otp = prompt("A verification code was sent to " + email + ". Enter '1234' to verify:");
    if (otp !== '1234') {
        alert("Incorrect OTP. Verification failed.");
        return;
    }

    const user = { uid: Date.now(), name, email, phone, college, verified: true };
    currentUser = user;
    localStorage.setItem("grovanceUser", JSON.stringify(user));
    updateAuthUI();
    showView('view-home');
}

function updateAuthUI() {
    const authDiv = document.getElementById('auth-links');
    if (currentUser) {
        authDiv.innerHTML = `
            <div class="flex items-center gap-4">
                <span class="text-xs bg-white/50 text-[#071F3F] p-2 rounded-lg hidden sm:block border border-white/60 font-bold shadow-sm backdrop-blur-sm">📍 ${currentUser.college}</span>
                <button onclick="logout()" class="text-sm text-red-500 hover:text-red-700 font-bold transition-colors">Logout</button>
            </div>
        `;
    } else {
        authDiv.innerHTML = `
            <button onclick="showView('view-register')" class="text-sm font-bold text-[#071F3F] hover:text-[#2F6FA3] transition-colors mr-4">Login</button>
            <button onclick="showView('view-register')" class="btn-gradient text-white px-6 py-2 rounded-full text-sm font-bold">Join Now</button>
        `;
    }
}

function logout() {
    localStorage.removeItem("grovanceUser");
    currentUser = null;
    location.reload();
}

// --- 4. MARKETPLACE RENDER LOGIC ---
function renderMarketplace() {
    const grid = document.getElementById('product-grid');
    const title = document.getElementById('market-title');
    
    // Filter by user's campus if logged in
    const items = currentUser ? allProducts.filter(p => p.college === currentUser.college) : allProducts;
    title.innerText = currentUser ? `Available at ${currentUser.college}` : "Global Marketplace";

    if (items.length === 0) {
        grid.innerHTML = `<p class="col-span-full text-center text-[#2F6FA3] font-medium py-20 text-lg">No items found in your campus yet. Be the first to post!</p>`;
        return;
    }

    // Modern SaaS Card Injection
    grid.innerHTML = items.map(p => `
        <div class="group glass-card rounded-3xl overflow-hidden hover:-translate-y-4 hover:shadow-[0_20px_40px_rgba(7,31,63,0.15)] hover:border-[#7BB3D4]/50 transition-all duration-500 cursor-pointer flex flex-col" onclick="renderDetail(${p.id})">
            
            <div class="relative h-56 overflow-hidden bg-[#F5F8FC]">
                <img src="${p.image}" class="w-full h-full object-cover transition duration-700 group-hover:scale-105 group-hover:rotate-1">
                
                <div class="absolute top-4 left-4 flex gap-2 z-20">
                    ${p.label ? `<span class="btn-gradient text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-md">${p.label}</span>` : ''}
                </div>
                <p class="absolute bottom-4 left-4 z-20 text-xs text-[#071F3F] font-bold uppercase tracking-wider bg-white/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/50 shadow-sm">${p.category}</p>
            </div>
            
            <div class="p-6 relative flex flex-col flex-grow">
                <h3 class="font-bold text-xl text-[#071F3F] line-clamp-2 group-hover:text-[#2F6FA3] transition-colors">${p.title}</h3>
                <p class="text-3xl font-black mt-2 bg-clip-text text-transparent bg-gradient-to-r from-[#071F3F] to-[#2F6FA3]">₹${p.price}</p>
                
                <div class="mt-auto pt-6">
                    <div class="flex items-center justify-between text-[11px] text-[#2F6FA3] font-bold border-t border-[#7BB3D4]/20 pt-4">
                        <div class="flex items-center gap-2">
                            <div class="w-7 h-7 rounded-full bg-gradient-to-tr from-[#071F3F] to-[#2F6FA3] flex items-center justify-center text-white shadow-sm">${p.sellerName.charAt(0)}</div>
                            <span class="truncate">BY: ${p.sellerName.toUpperCase()}</span>
                            ${p.isVerified ? '<span class="text-[#2F6FA3] drop-shadow-[0_0_2px_rgba(47,111,163,0.3)]">✔</span>' : ''}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// --- 5. PRODUCT DETAIL RENDER LOGIC ---
function renderDetail(id) {
    const p = allProducts.find(x => x.id === id);
    if (!p) return;

    showView('view-product-detail');
    
    // Modern SaaS Detail View Injection
    document.getElementById('detail-content').innerHTML = `
        <div class="grid md:grid-cols-2 gap-10 glass-card p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-white/60">
            
            <div class="overflow-hidden rounded-3xl shadow-lg border border-white/50">
                <img src="${p.image}" class="w-full h-full md:h-[500px] object-cover hover:scale-105 transition-transform duration-700">
            </div>
            
            <div class="flex flex-col justify-center">
                <span class="text-[#2F6FA3] font-black tracking-widest text-sm uppercase mb-2">${p.category}</span>
                <h2 class="text-4xl md:text-5xl font-black mb-4 text-[#071F3F] leading-tight">${p.title}</h2>
                <p class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#071F3F] to-[#2F6FA3] mb-8">₹${p.price}</p>
                
                <div class="bg-white/50 border border-white/60 p-6 rounded-2xl mb-8 shadow-sm backdrop-blur-sm">
                    <p class="text-xs font-black text-[#7BB3D4] uppercase tracking-wider mb-3">Seller Profile</p>
                    <div class="flex items-center gap-3 mb-2">
                        <div class="w-10 h-10 rounded-full btn-gradient flex items-center justify-center text-white font-bold text-lg shadow-sm">${p.sellerName.charAt(0)}</div>
                        <span class="font-bold text-xl text-[#071F3F]">${p.sellerName}</span>
                        ${p.isVerified ? '<span class="bg-[#2F6FA3]/10 border border-[#2F6FA3]/30 text-[#2F6FA3] text-[10px] px-3 py-1 rounded-full font-black tracking-wide">VERIFIED ✔</span>' : ''}
                    </div>
                    <p class="text-sm text-[#2F6FA3] font-medium ml-13">${p.sellerYear} • ${p.college}</p>
                </div>

                <p class="text-[#071F3F] font-medium leading-relaxed mb-10 text-lg opacity-90">${p.description}</p>
                
                <button onclick="contactSeller('${p.sellerPhone}', '${p.title}')" class="btn-gradient text-white py-5 rounded-2xl font-black text-lg shadow-lg hover:shadow-xl transition-all flex justify-center items-center gap-3 group">
                    <svg class="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.347-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                    Chat on WhatsApp
                </button>
            </div>
        </div>
    `;
}

function contactSeller(phone, title) {
    if(!currentUser) {
        alert("Please log in to contact the seller directly.");
        showView('view-register');
        return;
    }
    window.open(`https://wa.me/${phone}?text=Hi, I'm interested in your "${title}" listing on Grovance.`);
}

// --- 6. ITEM POSTING LOGIC ---
function handlePostItem(e) {
    e.preventDefault();
    if(!currentUser) {
        showView('view-register');
        return;
    }

    const title = document.getElementById('post-title').value;
    const price = document.getElementById('post-price').value;
    const category = document.getElementById('post-category').value;
    const description = document.getElementById('post-desc').value;

    const newItem = {
        id: Date.now(),
        title: title,
        price: parseFloat(price),
        category: category,
        description: description,
        college: currentUser.college,
        sellerName: currentUser.name,
        sellerPhone: currentUser.phone,
        sellerYear: "Verified Student",
        // Default generic image if simulating upload
        image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&q=80&w=600",
        isVerified: true,
        label: 'NEW'
    };

    allProducts.unshift(newItem);
    localStorage.setItem("grovanceProducts", JSON.stringify(allProducts));
    
    // Clear form
    document.getElementById('post-item-form').reset();
    
    alert("Success! Your item is now visible to students at " + currentUser.college);
    showView('view-marketplace');
}

// --- 7. INITIALIZATION ---
// Run on load to set correct UI states
updateAuthUI();