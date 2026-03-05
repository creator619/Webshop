// Adatok kezelése szerver nélkül (localStorage-ban)
// A termékek a products_data.js fájlból jönnek

// Segédfüggvény a termékek megjelenítéséhez
function renderProducts(list) {
    const container = document.getElementById("product-list");
    if (!container) return; // Ha nem a főoldalon vagyunk

    container.innerHTML = "";

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
    alert("Hozzáadva a kosárhoz!");
    updateCartCount();
}

if (window.location.pathname.includes("product.html")) {
    const addToCartBtn = document.querySelector(".add-to-cart");
    if (addToCartBtn) {
        addToCartBtn.addEventListener("click", () => {
            const product = JSON.parse(localStorage.getItem("selectedProduct"));
            if (!window.selectedSize) {
                alert("Kérlek válassz méretet!");
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
                alert("A kosár üres!");
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

    const orderBtn = document.querySelector(".place-order-btn");
    if (orderBtn) {
        orderBtn.addEventListener("click", () => {
            const name = document.getElementById("name").value;
            const email = document.getElementById("email").value;
            const address = document.getElementById("address").value;

            if (!name || !email || !address) {
                alert("Kérlek tölts ki minden mezőt!");
                return;
            }

            // Rendelés mentése localStorage-ba (szerver helyett)
            let orders = JSON.parse(localStorage.getItem("orders")) || [];
            orders.push({
                id: Date.now(),
                user_name: name,
                user_email: email,
                address: address,
                items: cart,
                total_price: total,
                date: new Date().toISOString()
            });
            localStorage.setItem("orders", JSON.stringify(orders));

            alert("Rendelés sikeresen leadva!");
            localStorage.removeItem("cart");
            window.location.href = "index.html";
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
            alert("Kérlek tölts ki minden mezőt!");
            return;
        }

        let users = JSON.parse(localStorage.getItem("users")) || [];
        if (users.find(u => u.email === email)) {
            alert("Ez az email cím már regisztrálva van!");
            return;
        }

        users.push({ name, email, password });
        localStorage.setItem("users", JSON.stringify(users));

        alert("Regisztráció sikeres!");
        window.location.href = "login.html";
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
            alert("Sikeres bejelentkezés!");
            window.location.href = "index.html";
        } else {
            alert("Hibás email vagy jelszó!");
        }
    });
}
