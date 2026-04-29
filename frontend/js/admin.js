/* --- ADMIN --- */
let categoryChartInstance = null;
let revenueChartInstance = null;

const user = JSON.parse(localStorage.getItem("user"));

if (!user || user.role !== "admin") {
    window.location.href="/";
}

/* Az oldal betöltésekor lefutó fő inicializáló rész */
document.addEventListener('DOMContentLoaded', async () => {
    /* Alapszintű ellenőrzés a localStorage-ból (gyors visszajelzés) */
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user) {
        window.location.href = '/login';
        return;
    }

    /* Szerveroldali ellenőrzés a saját backendünkön keresztül */
    try {
        let profile;
        try {
            profile = await apiFetch('/profile');
        } catch (apiErr) {
            console.warn("Profil API nem érhető el, LocalStorage használata:", apiErr.message);
            profile = user;
        }

        /* Az új backend 'role' mezőt használ */
        const isAdmin = profile && (profile.role === 'admin' || profile.is_admin == 1 || profile.is_admin === true);
        
        if (!isAdmin) {
            showToast(`Nincs admin jogosultságod!`, 'error');
            throw new Error(`Jogosultsági hiba`);
        }

        /* Ha a szerver is megerősítette a jogosultságot, betölthetjük az adatokat */
        loadOrders();       // Rendelések
        loadProducts();     // Termékek
        loadCategoriesAdmin(); // Kategóriák
        loadMessages(); // Üzenetek
        setupTabs();        // Fülek közötti navigáció beállítása
    
        
    } catch (err) {
        console.error("Admin inicializálási hiba:", err.message);
        showToast('Hiba az admin felület betöltésekor: ' + err.message, 'error');
        
        /* Ha nem vagyunk bejelentkezve vagy nincs jogunk, irányítsunk vissza */
        if (err.message.includes("jogosultság") || err.message.includes("not defined")) {
            window.location.href = '/';
        }
    }
});

/* A fülek (Irányítópult, Rendelések, Termékek) közötti váltás kezelése */
function setupTabs() {
    document.querySelectorAll('.admin-nav .tab').forEach(tab => {
        tab.addEventListener('click', () => {
            /* Aktív osztály eltávolítása minden fülről és tartalom elrejtése */
            document.querySelectorAll('.admin-nav .tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');

            /* Aktuális fül aktiválása */
            tab.classList.add('active');
            const target = tab.getAttribute('data-tab');
            document.getElementById(`${target}-tab`).style.display = 'block';

            /* Adatok frissítése a fülre kattintáskor */
            if (target === 'dashboard') loadOrders(); 
            if (target === 'orders') loadOrders();
            if (target === 'products') loadProducts();
        });
    });
}

/* Kategóriák betöltése a backendről a termék felvételi legördülő menübe */
async function loadCategoriesAdmin() {
    try {
        const response = await apiFetch('/admin/product_categories');
        const categories = response.data;
        /*lekéri a categories adatokat, de nem írja ki sehol */
        const select = document.getElementById('p-category');
        if (select) {
            select.innerHTML = '<option value="">Válassz kategóriát...</option>';
            categories.forEach(cat => {
                select.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
            });
        }
    } catch (err) {
        console.error("Hiba a kategóriák betöltésekor:", err);
    }
}

/* --- DASHBOARD: Statisztikai adatok számítása a rendelésekből --- */
function calculateStatsFromOrders(orders) {
    try {
        const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total_price) || 0), 0);
        const totalOrders = orders.length;
        const totalCustomers = new Set(orders.map(o => o.user_email)).size;

        /* Alap kártyák frissítése */
        document.getElementById('stat-revenue').textContent = totalRevenue.toLocaleString() + ' Ft';
        document.getElementById('stat-orders').textContent = totalOrders + ' db';
        document.getElementById('stat-customers').textContent = totalCustomers + ' fő';

        /* Mivel az új backend nem ad kategória és trend adatokat, a grafikonokat elrejtjük  */
        /* vagy alapértelmezett értékkel töltjük fel a modern megjelenés érdekében. */
        const chartsContainer = document.querySelector('.charts-grid');
        if (chartsContainer) chartsContainer.style.opacity = "0.5";
    } catch (err) {
        console.error("Hiba a statisztikák számításakor:", err);
    }
}

/* --- RENDELÉSEK: Rendelések listázása és kezelése --- */
async function loadOrders() {
    try {
        const orders = await apiFetch('/admin/orders');
        calculateStatsFromOrders(orders);
        
        const tbody = document.querySelector('#admin-orders-table tbody');
        tbody.innerHTML = '';

        orders.forEach(o => {
            const date = new Date(o.created_at).toLocaleDateString('hu-HU');
            /* Rendelési tételek HTML listája */
            const itemsHtml = o.order_items ? o.order_items.map(item => `
                <div style="font-size: 0.85rem; color: #666; margin-bottom: 2px;">
                    • ${item.product_name} ${item.size ? `<b>(${item.size})</b>` : ''} <span style="color: #444; font-weight: 500;">(${item.quantity} db)</span> — <b>${(item.price * item.quantity).toLocaleString()} Ft</b>
                </div>
            `).join('') : 'Nincs adat';

            /* Sor hozzáadása a táblázathoz */
            const shippingText = o.shipping_method === 'home' ? 'Házhoz' : (o.shipping_method === 'locker' ? 'Automata' : o.shipping_method || '-');
            const paymentText = o.payment_method === 'cod' ? 'Utánvét' : (o.payment_method === 'transfer' ? 'Átutalás' : o.payment_method || '-');

            tbody.innerHTML += `
                <tr>
                    <td>#${o.id}</td>
                    <td>
                        <b>${o.shipping_name || 'Ismeretlen'}</b><br>
                        <span style="font-size: 0.85rem; color: #555;">${o.user_email || o.guest_email}</span><br>
                        <div style="font-size: 0.85rem; color: #777; margin-top: 3px;">
                            📞 ${o.shipping_phone || '-'}<br>
                            🏠 ${o.shipping_zip + " " + o.shipping_city + " " + o.shipping_address || '-'}
                        </div>
                        <div class="order-items-detail" style="margin-top: 5px; border-top: 1px solid #eee; pt-2;">
                            ${itemsHtml}
                        </div>
                    </td>
                    <td>${o.total_price.toLocaleString()} Ft</td>
                    <td>
                        <div style="font-size: 0.85rem;">${shippingText}</div>
                        <div style="font-size: 0.75rem; color: #777;">${paymentText}</div>
                    </td>
                    <td>${date}</td>
                    <td><span class="status-badge status-${o.status}">${o.status}</span></td>
                    <td>
                        <!-- Státusz módosító legördülő menü -->
                        <select onchange="updateOrderStatus(${o.id}, this.value)">
                            <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Függőben</option>
                            <option value="shipped" ${o.status === 'shipped' ? 'selected' : ''}>Szállítva</option>
                            <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>Kézbesítve</option>
                        </select>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error(err);
    }
}

/* Rendelés státuszának frissítése (pl. függőben -> szállítva) */
async function updateOrderStatus(id, newStatus) {
    try {
        /* Az új backend PUT /admin/orders/:id útvonalat vár teljes objektummal */
        const orders = await apiFetch('/admin/orders');
        const order = orders.find(o => o.id === id);
        if (!order) throw new Error("Rendelés nem található");

        await apiFetch(`/admin/orders/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ 
                ...order,
                status: newStatus 
            })
        });
        
        showToast('Státusz frissítve!');
        loadOrders(); // Táblázat frissítése
    } catch (err) {
        console.error(err);
        showToast('Hiba a státusz frissítésekor!');
    }
}

/* Termékek listájának betöltése az admin táblázatba */
async function loadProducts() {
    try {
        const products = await apiFetch('/products');
        window.allProducts = products;

        const tbody = document.querySelector('#admin-products-table tbody');
        tbody.innerHTML = '';

        products.forEach(p => {
            /* Méretbontás szöveges megjelenítése a táblázatban */
            let sizeSummary = '';
            if (p.size_stocks && typeof p.size_stocks === 'object') {
                const parts = Object.entries(p.size_stocks)
                    .filter(([s, q]) => q > 0)
                    .map(([s, q]) => `${s}:${q}`);
                if (parts.length > 0) sizeSummary = `<br><span style="font-size: 0.75rem; color: #888;">(${parts.join(', ')})</span>`;
            }

            tbody.innerHTML += `
                <tr>
                    <td><img src="${getProductImage(p.image)}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" onerror="this.src='${BASE_URL}/images/hatter.jpg'"></td>
                    <td>${p.name}</td>
                    <td>${p.price.toLocaleString()} Ft</td>
                    <td><b>${p.stock} db</b>${sizeSummary}</td>
                    <td>${p.category_id}</td>
                    <td>
                        <!-- Szerkesztés és Törlés gombok -->
                        <button class="action-btn" onclick='editProduct(${JSON.stringify(p)})'>✏️</button>
                        <button class="action-btn" onclick="deleteProduct(${p.id})">🗑️</button>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error(err);
    }
}

/* Termékfelvételi űrlap megjelenítése */
function showProductForm() {
    document.getElementById('product-form').style.display = 'block';
    document.getElementById('form-title').textContent = 'Új termék hozzáadása';
    clearForm();
}

/* Űrlap elrejtése */
function hideProductForm() {
    document.getElementById('product-form').style.display = 'none';
}

/* Űrlap mezőinek kiürítése */
function clearForm() {
    document.getElementById('p-id').value = '';
    document.getElementById('p-name').value = '';
    document.getElementById('p-price').value = '';
    document.getElementById('p-image').value = '';
    document.getElementById('p-category').value = '';
    document.getElementById('admin-size-inputs').innerHTML = '<span style="color: #666; font-size: 0.9rem;">Kérlek válassz először kategóriát!</span>';
    document.getElementById('p-desc').value = '';
}

/* Dinamikus méretmező generátor a kategória alapján */
function generateAdminSizeInputs(productId = null) {
    const category = document.getElementById('p-category').value;
    const container = document.getElementById('admin-size-inputs');
    
    if (!category) {
        container.innerHTML = '<span style="color: #666; font-size: 0.9rem;">Kérlek válassz először kategóriát!</span>';
        return;
    }
    
    /* Kategóriától függő méretlista */
    let sizes = category == '4' ? ["40", "41", "42", "43", "44", "45"] : ["S", "M", "L", "XL", "XXL"];
    
    /* Meglévő adatok kinyerése a termékből (size_stocks oszlop a DB-ben) */
    let customStocks = {};
    const product = window.allProducts?.find(p => p.id == productId);
    if (product && product.size_stocks) {
        customStocks = typeof product.size_stocks === 'string' ? JSON.parse(product.size_stocks) : product.size_stocks;
    }
    
    container.innerHTML = '';
    sizes.forEach(size => {
        /* Alapértelmezett érték: ha új termék, 2-t teszünk bele, ha meglévő, akkor 0, de ha customStocks létezik, azt használjuk */
        let defaultVal = customStocks[size] !== undefined ? customStocks[size] : (productId ? 0 : 2);
        container.innerHTML += `
            <div style="display: flex; flex-direction: column; width: 60px;">
                <label style="font-size: 0.85rem; text-align: center; margin-bottom: 3px;">${size}</label>
                <input type="number" class="size-stock-input" data-size="${size}" value="${defaultVal}" min="0" style="padding: 5px; text-align: center; margin-bottom: 0;">
            </div>
        `;
    });
}

/* Meglévő termék adatainak beöltése az űrlapba szerkesztéshez */
function editProduct(p) {
    document.getElementById('product-form').style.display = 'block';
    document.getElementById('form-title').textContent = 'Termék szerkesztése';

    document.getElementById('p-id').value = p.id;
    document.getElementById('p-name').value = p.name;
    document.getElementById('p-price').value = p.price;
    document.getElementById('p-image').value = p.image;
    document.getElementById('p-category').value = p.category_id;
    
    /* Generáljuk a kategóriának megfelelő inputokat a meglévő termékhez */
    generateAdminSizeInputs(p.id);

    document.getElementById('p-desc').value = p.description;
}

/* Termék mentése (ha van ID, frissít, ha nincs, újat szúr be) */
async function saveProduct() {
    const id = document.getElementById('p-id').value;
    
    /* Összeszeljük a méretenkénti készletet */
    const sizeInputs = document.querySelectorAll('.size-stock-input');
    let totalStock = 0;
    let sizeBreakdown = {};
    sizeInputs.forEach(inp => {
        const val = parseInt(inp.value) || 0;
        totalStock += val;
        sizeBreakdown[inp.dataset.size] = val;
    });

    const product = {
        name: document.getElementById('p-name').value,
        price: parseInt(document.getElementById('p-price').value),
        image: document.getElementById('p-image').value,
        stock: totalStock,
        size_stocks: sizeBreakdown,
        category_id: parseInt(document.getElementById('p-category').value),
        description: document.getElementById('p-desc').value
    };

    try {
        let savedProduct;
        
        if (id) {
            savedProduct = await apiFetch(`/admin/product/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ ...product, sizes: Object.keys(product.size_stocks).join(',') })
            });
        } else {
            savedProduct = await apiFetch('/admin/product', {
                method: 'POST',
                body: JSON.stringify(product)
            });
        }

        const savedId = savedProduct.id;

        if (window.allProducts) {
            const idx = window.allProducts.findIndex(x => x.id == (id || savedId));
            if (idx !== -1) window.allProducts[idx] = savedProduct;
            else window.allProducts.push(savedProduct);
        }

        showToast(id ? 'Termék frissítve!' : 'Termék hozzáadva!');
        hideProductForm();
        loadProducts(); 
    } catch (err) {
        console.error(err);
        showToast('Hiba a mentés során: ' + err.message);
    }
}

/* Termék törlése */
async function deleteProduct(id) {
    if (!confirm('Biztosan törlöd a terméket?')) return;

    try {
        await apiFetch(`/admin/product/${id}`, { method: 'DELETE' });
        
        showToast('Termék törölve!');
        loadProducts(); // Lista frissítése
    } catch (err) {
        console.error(err);
        showToast('Hiba a törlés során!');
    }
}

/* --- ÜZENETEK: Ügyfél üzenetek listázása és kezelése --- */
async function loadMessages() {
    try {
        const response = await apiFetch('/admin/contact');
        const messages = response.data;
        const tbody = document.getElementById('messages-table-body');
        if (!tbody) return;

        tbody.innerHTML = '';
        if (!messages || messages.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">Nincsenek beérkező üzenetek.</td></tr>';
            return;
        }

        messages.forEach(m => {
            const date = new Date(m.created_at).toLocaleDateString('hu-HU') + ' ' + new Date(m.created_at).toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });
            tbody.innerHTML += `
                <tr>
                    <td style="font-size: 0.85rem; color: #666;">${date}</td>
                    <td>${m.name}</td>
                    <td><a href="mailto:${m.email}" style="color: var(--accent);">${m.email}</a></td>
                    <td style="font-weight: 600;">${m.category.name || '-'}</td>
                    <td style="max-width: 300px; font-size: 0.9rem; color: #444;">${m.message}</td>
                    <td>
                        <button class="action-btn" onclick="deleteMessage(${m.id})" title="Üzenet törlése">🗑️</button>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Hiba az üzenetek betöltésekor:", err);
    }
}

async function deleteMessage(id) {
    if (!confirm('Biztosan törölni szeretnéd ezt az üzenetet?')) return;
    
    try {
        await apiFetch(`/admin/contact/${id}`, { method: 'DELETE' });
        showToast('Üzenet törölve!');
        loadMessages();
    } catch (err) {
        console.error("Hiba az üzenet törlésekor:", err);
        showToast('Hiba a törlés során!');
    }
}

