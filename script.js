const API_URL = "http://localhost:3000";

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

// Termékek lekérése backendről
async function fetchProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        const products = await response.json();

        // Termékek mentése globálisan a szűréshez
        window.allProducts = products;

        renderProducts(products);
    } catch (error) {
        console.error("Hiba a termékek betöltésekor:", error);
        alert("Nem sikerült betölteni a termékeket! Lehet, hogy a szerver nem elérhető.");
    }
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
            // Ha már ott vagyunk, reset
            renderProducts(window.allProducts);
        }
    });
});


function openProduct(id) {
    // Ha van betöltve terméklista, keressük abban, ha nincs, fetch-elni kéne, 
    // de egyszerűbb ha az ID-t visszük át URL paraméterben vagy localStorage-ban mentjük a kiválasztottat.
    // A mostani logikád localStorage-t használ, tartsuk meg, de fetch-ből nyerjük ki.

    const product = window.allProducts.find(p => p.id === id);
    localStorage.setItem("selectedProduct", JSON.stringify(product));
    window.location.href = "product.html";
}


// --- TERMÉK OLDAL ---
if (window.location.pathname.includes("product.html")) {
    const product = JSON.parse(localStorage.getItem("selectedProduct"));

    if (product) {
        document.getElementById("product-img").src = product.image;
        document.getElementById("product-name").textContent = product.name;
        document.getElementById("product-price").textContent = product.price.toLocaleString() + " Ft";
        document.getElementById("product-desc").textContent = product.description;
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

// Oldal betöltésekor frissítjük a számlálót
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
            addToCart(product);
        });
    }
}

// Kosár oldal betöltése
if (window.location.pathname.includes("cart.html")) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const container = document.getElementById("cart-items");
    let total = 0;

    container.innerHTML = ""; // Törlés újrarajzolás előtt

    if (cart.length === 0) {
        container.innerHTML = "<p>A kosár üres.</p>";
    } else {
        cart.forEach((item, index) => {
            total += item.price;

            container.innerHTML += `
                <div class="cart-item">
                    <img src="${item.image}">
                    <div>
                        <h3>${item.name}</h3>
                        <p>${item.price.toLocaleString()} Ft</p>
                    </div>
                    <button class="remove-btn" onclick="removeItem(${index})">Törlés</button>
                </div>
            `;
        });
    }

    document.getElementById("cart-total").textContent = total.toLocaleString() + " Ft";

    // Tovább a rendeléshez gomb
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

// Termék törlése a kosárból
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
                <span>${item.name}</span>
                <span>${item.price.toLocaleString()} Ft</span>
            </div>
        `;
    });

    document.getElementById("checkout-total").textContent = total.toLocaleString() + " Ft";

    // Rendelés leadása
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

            // Rendelés küldése a backendnek
            fetch(`${API_URL}/orders`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_email: email, // Most csak az emailt küldjük vendégként
                    items: cart,
                    total_price: total
                })
            })
                .then(response => {
                    if (response.ok) {
                        alert("Rendelés sikeresen leadva!");
                        localStorage.removeItem("cart");
                        window.location.href = "index.html";
                    } else {
                        alert("Hiba a rendelés leadásakor!");
                    }
                })
                .catch(err => {
                    console.error("Hiba:", err);
                    alert("Szerver hiba történt!");
                });
        });
    }
}


// --- BACKEND AUTH (Regisztráció / Login) ---
// Regisztráció
if (window.location.pathname.includes("register.html")) {
    document.getElementById("register-btn").addEventListener("click", async () => {
        const name = document.getElementById("reg-name").value;
        const email = document.getElementById("reg-email").value;
        const password = document.getElementById("reg-password").value;

        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();
            alert(data.message);

            if (response.ok) {
                window.location.href = "login.html";
            }
        } catch (error) {
            console.error("Hiba:", error);
            alert("Szerver hiba történt!");
        }
    });
}


// Bejelentkezés
if (window.location.pathname.includes("login.html")) {
    document.getElementById("login-btn").addEventListener("click", async () => {
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            alert(data.message);

            if (response.ok) {
                // Token és user mentése
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));

                window.location.href = "index.html";
            }
        } catch (error) {
            console.error("Hiba:", error);
            alert("Szerver hiba történt!");
        }
    });
}
