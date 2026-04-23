// ==========================================
// PÉNZTÁR ÉS RENDELÉS LEADÁSA
// ==========================================
function generateIdempotencyKey() {
    if (window.crypto && crypto.randomUUID) {
        return crypto.randomUUID();
    }

    if (window.crypto && crypto.getRandomValues) {
        const arr = new Uint32Array(4);
        crypto.getRandomValues(arr);

        return (
            Date.now() + "-" +
            Array.from(arr).map(n => n.toString(16)).join("")
        );
    }

    return Date.now() + "-" + Math.random().toString(36).slice(2, 12);
}
const idempotencyKey = generateIdempotencyKey();
if (window.location.pathname.includes("/checkout")) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const container = document.getElementById("checkout-items");
    let total = 0;

    // Összegző feltöltése termékekkel
    if (container) {
        container.innerHTML = "";
        cart.forEach(item => {
            const itemQty = item.quantity || 1;
            total += item.price * itemQty;
            container.innerHTML += `
                <div class="checkout-item">
                    <span>${item.name} ${item.size ? `(${item.size})` : ''} <span style="color: #888; font-size: 0.9rem;">(${itemQty} db)</span></span>
                    <span style="font-weight: 500;">${(item.price * itemQty).toLocaleString()} Ft</span>
                </div>
            `;
        });

        const totalLabel = document.getElementById("checkout-total");

        /**
         * Kiszámolja a végösszeget a szállítási díjjal együtt.
         */
        function updateCheckoutTotal() {
            const shippingMethod = document.querySelector('input[name="shipping"]:checked')?.value || 'home';
            let shippingFee = 0;

            // 10.000 Ft alatt szállítási díjat számítunk fel
            if (total < 10000) {
                shippingFee = (shippingMethod === 'home') ? 1500 : 990;
            }

            const finalTotal = total + shippingFee;
            
            // Szállítási díj sor megjelenítése/frissítése
            let shippingDisplay = document.getElementById("shipping-fee-display");
            if (!shippingDisplay) {
                shippingDisplay = document.createElement("div");
                shippingDisplay.id = "shipping-fee-display";
                shippingDisplay.className = "checkout-item shipping-row";
                shippingDisplay.style.borderTop = "1px solid #eee";
                shippingDisplay.style.marginTop = "10px";
                shippingDisplay.style.paddingTop = "10px";
                container.appendChild(shippingDisplay);
            }
            
            shippingDisplay.innerHTML = `
                <span>Szállítási díj:</span>
                <span>${shippingFee > 0 ? shippingFee.toLocaleString() + " Ft" : "Ingyenes"}</span>
            `;

            totalLabel.textContent = finalTotal.toLocaleString() + " Ft";
            return finalTotal;
        }

        updateCheckoutTotal();

        // Szállítási mód váltásakor újraszámoljuk az árat
        document.querySelectorAll('input[name="shipping"]').forEach(input => {
            input.addEventListener('change', updateCheckoutTotal);
        });
    }

    // Alapadatok kitöltése, ha a felhasználó be van jelentkezve
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
        if (document.getElementById("name")) document.getElementById("name").value = user.name;
        if (document.getElementById("email")) document.getElementById("email").value = user.email;
    }

    // Rendelés leadása gomb
    const orderBtn = document.querySelector(".place-order-btn");

    let currentIdempotencyKey = generateIdempotencyKey();
    let orderInProgress = false;

    if (orderBtn) {
        orderBtn.addEventListener("click", async () => {
            if (orderInProgress) {
                return; 
            }
            
          

            const name = document.getElementById("name").value;
            const email = document.getElementById("email").value;
            const phone = document.getElementById("phone").value;
            const address = document.getElementById("address").value;
            const zip = document.getElementById("zip").value;
            const city = document.getElementById("city").value;
            const shippingMethod = document.querySelector('input[name="shipping"]:checked')?.value || 'home';
            const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || 'cod';

            if (!name || !email || !phone || !address || !zip || !city) {
                showToast("Kérlek tölts ki minden mezőt!");
                return;
            }
            orderInProgress = true;
            orderBtn.disabled = true;
            try {
                // Az új backend más adatszerkezetet vár: meglévő nevet és árat is el kell küldeni
                const orderData = {
                    name: name,
                    email: email,
                    phone: phone,
                    address: address,
                    zip: zip,
                    city: city,
                    total_price: updateCheckoutTotal(), // kiszámoljuk a végösszeget
                    items: cart.map(item => ({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity || 1,
                        size: item.size || null
                    })),
                    idempotencyKey: currentIdempotencyKey
                };

                const result = await apiFetch('/orders', {
                    method: 'POST',
                    body: JSON.stringify(orderData)
                });
                showToast("Rendelés sikeresen leadva!");
                localStorage.removeItem("cart"); // Kosár ürítése
                setTimeout(() => {
                    
                    window.location.href = `/order-success?id=${result.data.orderId}`;
                }, 1500);
            } catch (err) {
                console.error(err);

                orderInProgress = false;
                orderBtn.disabled = false;
                currentIdempotencyKey = generateIdempotencyKey();
                showToast("Hiba történt a rendelés leadásakor: " + (err.message || "Ismeretlen hiba"));
            }
        });
    }
}

async function loadCheckoutProfile() {
    try {
        const data = await apiFetch('/auth/profile');

        if (!data) return;

        if (data.phone && document.getElementById("phone")) {
            document.getElementById("phone").value = data.phone;
        }

        if (data.zip && document.getElementById("zip")) {
            document.getElementById("zip").value = data.zip;
        }

        if (data.city && document.getElementById("city")) {
            document.getElementById("city").value = data.city;
        }

        if (data.address && document.getElementById("address")) {
            document.getElementById("address").value = data.address;
        }

    } catch (err) {
        console.error("Profil betöltés hiba:", err);
    }
}

loadCheckoutProfile();