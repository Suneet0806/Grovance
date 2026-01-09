// Placeholder for Firebase/Auth global variables
window.firebaseApp = null;
window.auth = null;
window.db = null;
window.currentUserId = null;
window.isAuthReady = true;

// --- 1. Product Data ---
const ALL_PRODUCTS = [
    { id: 1, category: 'Textbooks', name: 'Discrete Mathematics and Its Applications (8th Ed.)', price: 700, listedBy: 'Joseph', image: 'https://placehold.co/400x300/F4D03F/000?text=MATH+BOOK', type: 'sell' },
    { id: 2, category: 'Electronics', name: 'HP 24-inch Monitor (Used for 1 semester)', price: 3500, listedBy: 'Mahesh', image: 'https://placehold.co/400x300/5DADE2/000?text=MONITOR', type: 'sell' },
    { id: 3, category: 'Furniture', name: 'Adjustable LED Desk Lamp (Black)', price: 850, listedBy: 'Arnav', image: 'https://placehold.co/400x300/A9CCE3/000?text=DESK+LAMP', type: 'sell' },
    { id: 4, category: 'Electronics', name: 'WANTED: Low-cost Raspberry Pi 4 Model B', price: 0, listedBy: 'Admin', image: 'https://placehold.co/400x300/F08080/fff?text=WANTED', type: 'buy_request' }, 
    { id: 5, category: 'Textbooks', name: 'An Introduction to the Philosophy of Law', price: 300, listedBy: 'Chloe P.', image: 'https://placehold.co/400x300/F1C40F/000?text=LAW+BOOK', type: 'sell' },
    { id: 6, category: 'Project Items', name: 'Arduino Uno Ultimate Starter Kit', price: 1800, listedBy: 'Alex M.', image: 'https://placehold.co/400x300/D7BDE2/000?text=ARDUINO+KIT', type: 'sell' },
    { id: 7, category: 'Furniture', name: 'Single Bed Mattress (6ft x 3ft, Clean)', price: 1200, listedBy: 'Priya S.', image: 'https://placehold.co/400x300/FF5733/fff?text=MATTRESS', type: 'sell' },
    { id: 8, category: 'Project Items', name: 'Solderless Breadboard MB-102 (New)', price: 180, listedBy: 'Ravi T.', image: 'https://placehold.co/400x300/FFC300/333?text=BREADBOARD', type: 'sell' },
    { id: 9, category: 'Furniture', name: 'Compact Folding Study Table', price: 950, listedBy: 'Kiran N.', image: 'https://placehold.co/400x300/DAF7A6/333?text=STUDY+TABLE', type: 'sell' },
    { id: 10, category: 'Electronics', name: 'Adjustable DC Power Supply (0-30V)', price: 4200, listedBy: 'Nitin J.', image: 'https://placehold.co/400x300/4CAF50/fff?text=POWER+SUPPLY', type: 'sell' },
    { id: 11, category: 'Textbooks', name: 'WANTED: Used Linear Algebra Textbook', price: 0, listedBy: 'Admin', image: 'https://placehold.co/400x300/F08080/fff?text=WANTED', type: 'buy_request' }, 
];

// --- 2. Element References & State ---
let allProducts = ALL_PRODUCTS; 
let currentView = 'home';
let currentCategory = 'All';
let marketplaceMode = 'buy'; 
let currentUser = null; 
let itemPostType = 'sell'; 

const views = {
    'home': document.getElementById('home-view'),
    'about': document.getElementById('about-view'),
    'marketplace': document.getElementById('marketplace-view'),
    'post-item': document.getElementById('post-item-view'),
    'partners': document.getElementById('partners-view'),
    'contact': document.getElementById('contact-view'),
    'register': document.getElementById('register-view'),
    'login': document.getElementById('login-view'),
};
const mainCtaButton = document.getElementById('main-cta-btn');
const marketplaceSearchBar = document.getElementById('marketplace-search-bar');
const productGrid = document.getElementById('product-grid');
const itemCountDisplay = document.getElementById('item-count');
const loadingMessage = document.getElementById('loading-message');
const postItemForm = document.getElementById('post-item-form');
const contactForm = document.getElementById('contact-form');
const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');
const searchInput = document.getElementById('search-input');
const postItemFloatBtn = document.getElementById('post-item-float-btn');
const authIcon = document.getElementById('auth-icon');
const loginIcon = document.getElementById('login-icon');
const postItemAuthWarning = document.getElementById('post-item-auth-warning');

// Form specific elements
const postTypeSlider = document.getElementById('post-type-slider');
const postTypeSellLabel = document.getElementById('post-type-sell-label');
const postTypeBuyLabel = document.getElementById('post-type-buy-label');
const itemPostTypeInput = document.getElementById('item-post-type');
const priceInputContainer = document.getElementById('price-input-container');
const priceLabel = document.getElementById('price-label');
const itemPriceInput = document.getElementById('item-price');
const photoUploadContainer = document.getElementById('photo-upload-container');
const descriptionLabel = document.getElementById('description-label');

// --- 3. Authentication UI Updates (SIMULATED) ---

function updateAuthUI(user) {
    if (user) {
        authIcon.innerHTML = '<i class="fas fa-user-check text-xl text-green-600"></i>';
        authIcon.title = 'Sign Out (' + user.email + ')';
        authIcon.onclick = handleSignOut; 
        loginIcon.classList.add('hidden'); 
        if (loadingMessage) loadingMessage.classList.add('hidden');
    } else {
        authIcon.innerHTML = '<i class="fas fa-user-plus text-xl"></i>';
        authIcon.title = 'Register';
        authIcon.onclick = () => switchView('register');
        loginIcon.classList.remove('hidden'); 
    }
}

function handleSignOut() {
    currentUser = null;
    updateAuthUI(null);
    alertMessage("You have been signed out (Simulated).");
    switchView('home');
}

function handleAuthClick() {
    if (currentUser) {
        handleSignOut();
    } else {
        switchView('register');
    }
}

// --- 4. Product Rendering and Filtering Logic ---

function renderProductListings(productsToRender) {
    let htmlContent = '';
    
    itemCountDisplay.textContent = `Showing ${productsToRender.length} items`;
    
    if (productsToRender.length === 0) {
            const message = marketplaceMode === 'buy' 
            ? `No items for sale found matching your filters.`
            : `No active buy requests found.`;
            htmlContent = `<div class="col-span-full text-center py-10 text-gray-500 section-card">${message}</div>`;
    } else {
        productsToRender.forEach(product => {
            const priceValue = typeof product.price === 'number' ? product.price : 0;
            
            let formattedPrice;
            let priceColor;
            let ctaText;
            let itemTag = '';

            if (product.type === 'buy_request') {
                formattedPrice = 'WANTED';
                priceColor = 'text-red-500';
                ctaText = 'Offer To Sell';
                itemTag = `<span class="absolute top-2 right-2 bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">WANTED</span>`;
            } else {
                formattedPrice = new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 0
                }).format(priceValue);
                priceColor = 'text-green-600';
                ctaText = 'View Details';
            }

            htmlContent += `
                <div class="p-4 section-card overflow-hidden hover:shadow-lg transition duration-300 cursor-pointer relative" 
                        onclick="alertMessage('Showing details for: ${product.name}')">
                        ${itemTag}
                    <div class="h-48 bg-gray-200 rounded-xl mb-3 overflow-hidden">
                        <img src="${product.image || 'https://placehold.co/400x300/CCCCCC/333333?text=NO+IMAGE'}" alt="${product.name}" class="product-image" onerror="this.onerror=null;this.src='https://placehold.co/400x300/CCCCCC/333333?text=Image+Error';" />
                    </div>
                    <p class="text-sm text-grovance font-semibold mb-1">${product.category || 'Uncategorized'}</p>
                    <h4 class="font-bold text-gray-900 truncate">${product.name}</h4>
                    <p class="text-2xl font-extrabold ${priceColor} my-2">${formattedPrice}</p>
                    <p class="text-sm text-gray-500">Listed by: ${product.listedBy || 'Anonymous'}</p>
                    <button class="mt-3 w-full bg-grovance text-white py-2 rounded-lg font-semibold hover:bg-grovance/90 transition">${ctaText}</button>
                </div>
            `;
        });
    }

    productGrid.innerHTML = htmlContent;
}

function filterProducts(category, event) {
    if (event) {
        event.preventDefault();
        document.querySelectorAll('.category-link').forEach(link => link.classList.remove('active'));
        event.currentTarget.classList.add('active');
        if (searchInput) searchInput.value = '';
    }

    currentCategory = category;
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

    const filteredProducts = allProducts.filter(product => {
        const productCategory = product.category || '';
        const productName = product.name || '';
        const productType = product.type || 'sell'; 

        const modeMatch = marketplaceMode === 'buy' 
            ? productType === 'sell' 
            : productType === 'buy_request';

        const categoryMatch = currentCategory === 'All' || productCategory === currentCategory;
        const searchMatch = productName.toLowerCase().includes(searchTerm) || productCategory.toLowerCase().includes(searchTerm);
        
        return modeMatch && categoryMatch && searchMatch;
    });

    renderProductListings(filteredProducts);
}

function setMarketplaceMode(mode, event) {
    marketplaceMode = mode;
    
    document.querySelectorAll('.mode-button').forEach(btn => btn.classList.remove('active', 'bg-grovance', 'text-white', 'bg-gray-200', 'text-gray-700', 'hover:bg-gray-300'));

    const buyBtn = document.getElementById('mode-buy');
    const sellBtn = document.getElementById('mode-sell');

    if (mode === 'buy') {
        buyBtn.classList.add('active', 'bg-grovance', 'text-white');
        sellBtn.classList.add('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
    } else {
        sellBtn.classList.add('active', 'bg-grovance', 'text-white');
        buyBtn.classList.add('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
    }

    currentCategory = 'All';
    document.querySelectorAll('.category-link').forEach(link => link.classList.remove('active'));
    document.querySelector('.category-link[data-category="All"]').classList.add('active');

    filterProducts('All');
}

// --- 5. Post Item Type Toggle Logic ---
function setItemPostType(type) {
    itemPostType = type;
    itemPostTypeInput.value = type;

    const slider = document.getElementById('post-type-slider');
    const containerWidth = slider.parentElement.offsetWidth - 8; 
    const labelWidth = containerWidth / 2;

    if (type === 'sell') {
        slider.style.transform = 'translateX(0)';
        slider.style.width = `${labelWidth}px`;
    } else {
        slider.style.transform = `translateX(${labelWidth}px)`;
        slider.style.width = `${labelWidth}px`;
    }

    postTypeSellLabel.classList.toggle('active', type === 'sell');
    postTypeSellLabel.classList.toggle('text-white', type === 'sell');
    postTypeSellLabel.classList.toggle('text-gray-700', type !== 'sell');

    postTypeBuyLabel.classList.toggle('active', type === 'buy_request');
    postTypeBuyLabel.classList.toggle('text-white', type === 'buy_request');
    postTypeBuyLabel.classList.toggle('text-gray-700', type !== 'buy_request');
    
    if (type === 'sell') {
        priceInputContainer.classList.remove('hidden');
        itemPriceInput.required = true;
        itemPriceInput.placeholder = 'e.g., 850';
        priceLabel.textContent = 'Price (₹)';
        photoUploadContainer.classList.remove('hidden');
        descriptionLabel.textContent = 'Description (Condition, usage history, preferred meeting spot)';

    } else { 
        priceInputContainer.classList.add('hidden');
        itemPriceInput.required = false;
        itemPriceInput.value = 0; 
        photoUploadContainer.classList.add('hidden');
        descriptionLabel.textContent = 'Description (What condition are you looking for, preferred budget, any urgency?)';
    }
}

// --- 6. View Switching Logic ---

function handleCtaClick() {
    switchView('register');
}

function handlePostItemClick() {
        if (currentUser) {
            switchView('post-item');
        } else {
            alertMessage("Please log in or register to post an item (Simulated).");
            switchView('register');
        }
    }

function switchView(viewName) {
    currentView = viewName;
    
    Object.keys(views).forEach(key => views[key].classList.add('hidden-view'));
    if(views[viewName]) {
            views[viewName].classList.remove('hidden-view');
    }

    if (viewName === 'post-item') {
            if (currentUser) {
            postItemAuthWarning.classList.add('hidden');
            } else {
            postItemAuthWarning.classList.remove('hidden');
            }
            setItemPostType('sell');
    }
    
    if (viewName === 'marketplace') {
        mainCtaButton.innerHTML = '<i class="fas fa-plus mr-2"></i> List Item';
        mainCtaButton.onclick = handlePostItemClick;
        postItemFloatBtn.classList.remove('hidden');
        
    } else if (viewName === 'register' || viewName === 'login') {
            mainCtaButton.innerHTML = 'Register';
            mainCtaButton.onclick = () => switchView('register');
            postItemFloatBtn.classList.add('hidden');
    } else {
        mainCtaButton.innerHTML = 'Join Now';
        mainCtaButton.onclick = () => switchView('register');
        postItemFloatBtn.classList.add('hidden');
    }
    
    if (viewName === 'marketplace') {
        marketplaceSearchBar.classList.remove('hidden');
    } else {
        marketplaceSearchBar.classList.add('hidden');
    }

    if (viewName === 'marketplace') {
        loadingMessage.classList.add('hidden');
        setMarketplaceMode(marketplaceMode); 
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- 7. Form Submission Handlers ---
function setupFormHandlers() {
    if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('reg-email').value;
                
                currentUser = { email: email, uid: 'simulated_user_123' };
                updateAuthUI(currentUser);

                alertMessage(`Success! Welcome ${email}. You are now verified (Simulated).`);
                registerForm.reset();
                switchView('marketplace');
            });
        }
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('login-email').value;
                
                currentUser = { email: email, uid: 'simulated_user_123' };
                updateAuthUI(currentUser);

                alertMessage("Login successful (Simulated)!");
                loginForm.reset();
                switchView('marketplace');
            });
        }

    if (postItemForm) {
        postItemForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (!currentUser) {
                    alertMessage("Authentication required to post an item (Simulated).");
                    switchView('register');
                    return;
            }

            const type = document.getElementById('item-post-type').value;
            const priceInput = document.getElementById('item-price').value;
            
            let price = type === 'sell' ? parseInt(priceInput) : 0;

            const simulatedImage = type === 'sell' ? 'https://placehold.co/400x300/FF0000/fff?text=NEW+FOR+SALE' : 'https://placehold.co/400x300/800080/fff?text=NEW+WANTED';
            
            const newItem = {
                id: allProducts.length + 1,
                name: document.getElementById('item-title').value,
                category: document.getElementById('item-category').value,
                price: price,
                description: document.getElementById('item-description').value,
                listedBy: currentUser.email || 'Verified User',
                image: simulatedImage, 
                type: type 
            };
            
            allProducts.push(newItem); 
            
            const successMessage = type === 'sell' ? "Your item is now listed for sale!" : "Your 'Want to Buy' request is now active!";
            
            alertMessage(`Success! ${successMessage} (Simulated)`);
            postItemForm.reset();
            switchView('marketplace');
            
            setMarketplaceMode(type === 'sell' ? 'buy' : 'sell');
        });
    }

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alertMessage("Thank thank you, your message has been sent to the Grovance team (Simulated).");
            contactForm.reset();
        });
    }
}

function alertMessage(message) {
    console.log("APP MESSAGE:", message);
    const oldModal = document.getElementById('app-message-modal');
    if (oldModal) oldModal.remove();

    const modal = document.createElement('div');
    modal.id = 'app-message-modal';
    modal.className = 'fixed top-4 right-4 bg-gray-800 text-white p-4 rounded-xl shadow-xl transition-all duration-300 z-[100]';
    modal.textContent = message;
    document.body.appendChild(modal);

    setTimeout(() => {
        modal.classList.add('opacity-0');
        setTimeout(() => modal.remove(), 300);
    }, 3000);
}

// --- 8. Initialization ---
window.appLoaded = false;
window.onload = () => {
        window.appLoaded = true;
        setupFormHandlers();
        
        if (searchInput) {
            searchInput.addEventListener('input', () => filterProducts(currentCategory));
        }
        
        updateAuthUI(currentUser);
        switchView('home'); 
};
