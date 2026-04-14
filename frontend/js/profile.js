// ==========================================
// PROFIL ADATOK ÉS RENDELÉSI ELŐZMÉNYEK
// ==========================================

if (window.location.pathname.includes('/profile')) {

    const user = JSON.parse(localStorage.getItem('user'));

    if (!user) {
        showToast('Kérlek jelentkezz be a profilod megtekintéséhez!');
        setTimeout(() => {
            window.location.href = '/login';
        }, 1500);
    } else {
        loadUserProfile();

        // Szerkesztés gomb eseménykezelő
        const editBtn = document.getElementById('edit-profile-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => toggleEditForm(true));
        }

        const ordersList = document.getElementById('orders-list');
        // Rendelések lekérése a backendről
        apiFetch('/orders/my')
            .then(userOrders => {
                if (ordersList) {
                    ordersList.innerHTML = '';
                    if (!userOrders || userOrders.length === 0) {
                        ordersList.innerHTML = '<p>Még nincsenek rendeléseid.</p>';
                    } else {
                        userOrders.forEach(order => {
                            const dateObj = new Date(order.created_at);
                            const formattedDate = dateObj.toLocaleDateString('hu-HU') + ' ' + dateObj.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });

                            let itemsHtml = order.order_items ? order.order_items.map(item => `
                                <li class="order-item">
                                    <span>${item.product_name} ${item.size ? `(${item.size})` : ''} <span style="color: #888; font-size: 0.85rem;">(${item.quantity} db)</span></span>
                                    <span style="font-weight: 600;">${(item.price * item.quantity).toLocaleString()} Ft</span>
                                </li>
                            `).join('') : '';

                            const statusText = order.status === 'pending' ? 'Feldolgozás alatt' :
                                order.status === 'shipped' ? 'Szállítás alatt' :
                                    order.status === 'delivered' ? 'Kézbesítve' : order.status;

                            ordersList.innerHTML += `
                                <div class="order-card">
                                    <div class="order-header">
                                        <div>
                                            <span class="order-id" style="display: block; font-size: 0.8rem; color: #999;">#${order.id}</span>
                                            <span class="order-date">${formattedDate}</span>
                                        </div>
                                        <div class="order-total">${order.total_price.toLocaleString()} Ft</div>
                                    </div>
                                    <ul class="order-item-list" style="list-style: none; padding: 0; margin-bottom: 0;">
                                        ${itemsHtml}
                                    </ul>
                                    <div class="order-footer" style="margin-top: 20px; display: flex; justify-content: space-between; align-items: center;">
                                        <span class="status-badge status-${order.status}" style="font-size: 0.75rem;">${statusText}</span>
                                    </div>
                                </div>
                            `;
                        });
                    }
                }
            })
            .catch(err => {
                console.error(err);
                if (ordersList) ordersList.innerHTML = '<p>Hiba történt a rendelések betöltésekor.</p>';
            });
    }
}

/**
 * Profil szerkesztése űrlap ki/be kapcsolása.
 */
function toggleEditForm(show) {
    const form = document.getElementById('edit-profile-form');
    const user = JSON.parse(localStorage.getItem('user'));

    if (show && user) {
        document.getElementById('edit-name').value = user.name;
        document.getElementById('edit-phone').value = user.phone || "";
        document.getElementById('edit-address').value = user.address || "";
        document.getElementById('edit-zip').value = user.zip || "";
        document.getElementById('edit-city').value = user.city || "";
        form.style.display = 'block';
        window.scrollTo({ top: form.offsetTop - 100, behavior: 'smooth' });
    } else {
        form.style.display = 'none';
    }
}

// Profiladatok betöltése:

async function loadUserProfile() {
    try {
        const data = await apiFetch('/auth/profile');

        const detailsCard = document.getElementById('user-details-card');

        if (detailsCard) {
            detailsCard.innerHTML = `
                <div class="user-data-item">
                    <strong>Név</strong>
                    <span>${data.name}</span>
                </div>
                <div class="user-data-item">
                    <strong>E-mail cím</strong>
                    <span>${data.email}</span>
                </div>
                <div class="user-data-item">
                    <strong>Telefonszám</strong>
                    <span>${data.phone || "<i>Nincs megadva</i>"}</span>
                </div>
                <div class="user-data-item">
                    <strong>Szállítási cím</strong>
                    <span>
                        ${
                            data.zip && data.city && data.address
                                ? `${data.zip}, ${data.city}, ${data.address}`
                                : "<i>Nincs megadva</i>"
                        }
                    </span>
                </div>
            `;
        }

        // 👉 ELTESSZÜK localStorage-be is (frissítjük)
        const user = JSON.parse(localStorage.getItem("user")) || {};
        const updatedUser = { ...user, ...data };
        localStorage.setItem("user", JSON.stringify(updatedUser));

    } catch (err) {
        console.error(err);
        showToast("Hiba a profil betöltésekor!");
    }
}

/**
 * Módosított profiladatok mentése.
 */
async function saveProfileChanges() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    const updatedData = {
        name: document.getElementById('edit-name').value,
        phone: document.getElementById('edit-phone').value,
        zip: document.getElementById('edit-zip').value,
        city: document.getElementById('edit-city').value,
        address: document.getElementById('edit-address').value
    };

    // Irányítószám validáció
    if (!/^\d{4}$/.test(updatedData.zip)) {
        showToast("Hibás irányítószám!");
        return;
    }
    if (!updatedData.name) {
        showToast("A név megadása kötelező!");
        return;
    }

    try {
        const profile = await apiFetch('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(updatedData)
        });

        // Frissítjük a localStorage-t is
        const updatedUser = { ...user, ...profile };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        showToast("Profil sikeresen frissítve!");
        toggleEditForm(false);
        setTimeout(() => location.reload(), 1000);
    } catch (err) {
        console.error(err);

        const message = err.message || "Hiba a profil mentésekor!"
        showToast(message);
    }
}

