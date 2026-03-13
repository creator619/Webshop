// --- SEGÉDFÜGGVÉNYEK ---

// Toast értesítés megjelenítése
function showToast(message) {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<span>✨</span> ${message}`;

    container.appendChild(toast);

    // Eltüntetés 3 másodperc után
    setTimeout(() => {
        toast.classList.add("hide");
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Felhasználói állapot ellenőrzése és menü frissítése
function updateAuthUI() {
    const user = JSON.parse(localStorage.getItem("user"));
    const userNav = document.getElementById("user-nav");

    if (user && userNav) {
        userNav.innerHTML = `
            <li class="user-status">
                👤 ${user.name}
                <a href="#" class="logout-link" onclick="logout()">Kijelentkezés</a>
            </li>
        `;
    }
}

function logout() {
    localStorage.removeItem("user");
    showToast("Sikeres kijelentkezés!");
    setTimeout(() => {
        window.location.href = "index.html";
    }, 1000);
}

// Funkciók inicializálása
document.addEventListener("DOMContentLoaded", () => {
    updateAuthUI();

    // Mobil menü kapcsoló
    const toggleBtn = document.getElementById("mobile-menu-toggle");
    const menu = document.getElementById("main-menu");
    if (toggleBtn && menu) {
        toggleBtn.addEventListener("click", () => {
            menu.classList.toggle("active");
            toggleBtn.textContent = menu.classList.contains("active") ? "✕" : "☰";
        });
    }

    // Keresés funkció
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const term = e.target.value.toLowerCase();
            if (!window.allProducts) return;

            const filtered = window.allProducts.filter(p =>
                p.name.toLowerCase().includes(term) ||
                p.description.toLowerCase().includes(term)
            );
            renderProducts(filtered);
        });
    }
});


// Segédfüggvény a termékek megjelenítéséhez
function renderProducts(list) {
    const container = document.getElementById("product-list");
    if (!container) return; // Ha nem a főoldalon vagyunk

    container.innerHTML = "";

    if (list.length === 0) {
        container.innerHTML = "<p style='grid-column: 1/-1; text-align: center; padding: 50px;'>Nincs találat a keresésre.</p>";
        return;
    }

    list.forEach(p => {
        container.innerHTML += `
            <div class="product-card" onclick="openProduct(${p.id})">
                <img src="${p.image}" alt="${p.name}">
                <h3>${p.name}</h3>
                <p>${p.price.toLocaleString()} Ft</p>
            </div>
        `;
    });
}

// Termékek lekérése a products_data.js-ből
function fetchProducts() {
    // Termékek mentése globálisan a szűréshez
    window.allProducts = productsData;
    renderProducts(productsData);
}

// Csak akkor hívjuk meg, ha a főoldalon vagyunk
if (document.getElementById("product-list")) {
    fetchProducts();
}


// Kategória szűrés
document.querySelectorAll(".menu li").forEach(item => {
    item.addEventListener("click", () => {
        const cat = item.getAttribute("data-category");
        if (!window.allProducts) return;

        if (cat) {
            const filtered = window.allProducts.filter(p => p.category_id == cat);
            renderProducts(filtered);
            // Mobil menü bezárása kattintás után
            const menu = document.getElementById("main-menu");
            if (menu) menu.classList.remove("active");
        } else if (item.innerText.includes("Főoldal")) {
            renderProducts(window.allProducts);
        }
    });
});


function openProduct(id) {
    const product = window.allProducts.find(p => p.id === id);
    localStorage.setItem("selectedProduct", JSON.stringify(product));
    window.location.href = "product.html";
}


// --- TERMÉK OLDAL ---
if (window.location.pathname.includes("product.html")) {
    let product = JSON.parse(localStorage.getItem("selectedProduct"));

    // Frissítsük a termék adatait a productsData-ból, hogy biztosan meglegyenek a méretek
    if (product && typeof productsData !== 'undefined') {
        const freshProduct = productsData.find(p => p.id === product.id);
        if (freshProduct) {
            product = freshProduct;
        }
    }

    if (product) {
        document.getElementById("product-img").src = product.image;
        document.getElementById("product-name").textContent = product.name;
        document.getElementById("product-price").textContent = product.price.toLocaleString() + " Ft";
        document.getElementById("product-desc").textContent = product.description;

        // Méretek megjelenítése
        const sizeContainer = document.getElementById("size-options");
        if (sizeContainer && product.sizes) {
            sizeContainer.innerHTML = "";
            product.sizes.forEach(size => {
                const btn = document.createElement("button");
                btn.className = "size-btn";
                btn.textContent = size;
                btn.onclick = () => {
                    document.querySelectorAll(".size-btn").forEach(b => b.classList.remove("active"));
                    btn.classList.add("active");
                    window.selectedSize = size;
                };
                sizeContainer.appendChild(btn);
            });
        }
    }
}


// --- KOSÁR KEZELÉS ---
function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const countSpan = document.getElementById("cart-count");
    if (countSpan) {
        countSpan.textContent = `(${cart.length})`;
    }
}

updateCartCount();

function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push(product);
    localStorage.setItem("cart", JSON.stringify(cart));
    showToast("Hozzáadva a kosárhoz!");
    updateCartCount();
}

if (window.location.pathname.includes("product.html")) {
    const addToCartBtn = document.querySelector(".add-to-cart");
    if (addToCartBtn) {
        addToCartBtn.addEventListener("click", () => {
            const product = JSON.parse(localStorage.getItem("selectedProduct"));
            if (!window.selectedSize) {
                showToast("Kérlek válassz méretet!");
                return;
            }
            const productWithSize = { ...product, size: window.selectedSize };
            addToCart(productWithSize);
        });
    }
}

if (window.location.pathname.includes("cart.html")) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const container = document.getElementById("cart-items");
    let total = 0;

    container.innerHTML = "";

    if (cart.length === 0) {
        container.innerHTML = "<p>A kosár üres.</p>";
    } else {
        cart.forEach((item, index) => {
            total += item.price;

            container.innerHTML += `
                <div class="cart-item">
                    <img src="${item.image}">
                    <div>
                        <h3>${item.name} ${item.size ? `(${item.size})` : ''}</h3>
                        <p>${item.price.toLocaleString()} Ft</p>
                    </div>
                    <button class="remove-btn" onclick="removeItem(${index})">Törlés</button>
                </div>
            `;
        });
    }

    document.getElementById("cart-total").textContent = total.toLocaleString() + " Ft";

    const checkoutBtn = document.querySelector(".checkout-btn");
    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", () => {
            if (cart.length === 0) {
                showToast("A kosár üres!");
                return;
            }
            window.location.href = "checkout.html";
        });
    }
}

function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    location.reload();
}


// --- CHECKOUT ---
if (window.location.pathname.includes("checkout.html")) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const container = document.getElementById("checkout-items");
    let total = 0;

    container.innerHTML = "";

    cart.forEach(item => {
        total += item.price;

        container.innerHTML += `
            <div class="checkout-item">
                <span>${item.name} ${item.size ? `(${item.size})` : ''}</span>
                <span>${item.price.toLocaleString()} Ft</span>
            </div>
        `;
    });

    document.getElementById("checkout-total").textContent = total.toLocaleString() + " Ft";

    // Felhasználói adatok automatikus kitöltése, ha be van jelentkezve
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
        if (document.getElementById("name")) document.getElementById("name").value = user.name;
        if (document.getElementById("email")) document.getElementById("email").value = user.email;
    }

    const orderBtn = document.querySelector(".place-order-btn");
    if (orderBtn) {
        orderBtn.addEventListener("click", () => {
            const name = document.getElementById("name").value;
            const email = document.getElementById("email").value;
            const phone = document.getElementById("phone").value;
            const address = document.getElementById("address").value;
            const shippingMethod = document.querySelector('input[name="shipping"]:checked').value;
            const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

            if (!name || !email || !phone || !address) {
                showToast("Kérlek tölts ki minden mezőt!");
                return;
            }

            // Rendelés mentése localStorage-ba (szerver helyett)
            let orders = JSON.parse(localStorage.getItem("orders")) || [];
            orders.push({
                id: Date.now(),
                user_name: name,
                user_email: email,
                user_phone: phone,
                address: address,
                shipping_method: shippingMethod,
                payment_method: paymentMethod,
                items: cart,
                total_price: total,
                date: new Date().toISOString()
            });
            localStorage.setItem("orders", JSON.stringify(orders));

            showToast("Rendelés sikeresen leadva!");
            localStorage.removeItem("cart");
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1500);
        });
    }
}


// --- AUTH (Regisztráció / Login) ---
// Regisztráció
if (window.location.pathname.includes("register.html")) {
    document.getElementById("register-btn").addEventListener("click", () => {
        const name = document.getElementById("reg-name").value;
        const email = document.getElementById("reg-email").value;
        const password = document.getElementById("reg-password").value;

        if (!name || !email || !password) {
            showToast("Kérlek tölts ki minden mezőt!");
            return;
        }

        let users = JSON.parse(localStorage.getItem("users")) || [];
        if (users.find(u => u.email === email)) {
            showToast("Ez az email cím már regisztrálva van!");
            return;
        }

        users.push({ name, email, password });
        localStorage.setItem("users", JSON.stringify(users));

        showToast("Regisztráció sikeres!");
        setTimeout(() => {
            window.location.href = "login.html";
        }, 1500);
    });
}


// Bejelentkezés
if (window.location.pathname.includes("login.html")) {
    document.getElementById("login-btn").addEventListener("click", () => {
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;

        let users = JSON.parse(localStorage.getItem("users")) || [];
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            localStorage.setItem("user", JSON.stringify(user));
            showToast("Sikeres bejelentkezés!");
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1000);
        } else {
            showToast("Hibás email vagy jelszó!");
        }
    });
}
