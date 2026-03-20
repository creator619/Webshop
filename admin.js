document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
    loadOrders();
    setupTabs();
});

function setupTabs() {
    const tabs = document.querySelectorAll(".tab");
    const contents = document.querySelectorAll(".tab-content");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            contents.forEach(c => c.style.display = "none");

            tab.classList.add("active");
            document.getElementById(tab.dataset.tab + "-tab").style.display = "block";
        });
    });
}

function loadProducts() {
    fetch(BASE_URL + "/products", {
         headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        }
    })
        .then(res => res.json())
        .then(data => {
            const tbody = document.querySelector("#admin-products-table tbody");
            tbody.innerHTML = "";

            data.forEach(p => {
                tbody.innerHTML += `
                    <tr>
                        <td><img src="${BASE_URL}/images/${p.image}" width="50"></td>
                        <td>${p.name}</td>
                        <td>${p.price} Ft</td>
                        <td>${p.category_id}</td>
                        <td>
                            <button onclick="editProduct(${p.id})">✏️</button>
                            <button onclick="deleteProduct(${p.id})">🗑️</button>
                        </td>
                    </tr>
                `;
            });
        });
}

function showProductForm() {
    document.getElementById("product-form").style.display = "block";
}

function hideProductForm() {
    document.getElementById("product-form").style.display = "none";
}

function saveProduct() {
    const id = document.getElementById("p-id").value;

    const product = {
        name: document.getElementById("p-name").value,
        price: document.getElementById("p-price").value,
        image: document.getElementById("p-image").value,
        category_id: document.getElementById("p-category").value,
        description: document.getElementById("p-desc").value,
        sizes: document.getElementById("p-sizes").value
    };

    if (id) {
        // UPDATE
        fetch(BASE_URL + "/admin/product/" + id, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
             },
            body: JSON.stringify(product)
        }).then(() => {
            loadProducts();
            hideProductForm();
        });
    } else {
        // CREATE
        fetch(BASE_URL + "/admin/product", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
             },
            body: JSON.stringify(product)
        }).then(() => {
            loadProducts();
            hideProductForm();
        });
    }
}

function editProduct(id) {
    fetch(BASE_URL + "/products/" + id, {
         headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        }
    })
        .then(res => res.json())
        .then(p => {
            showProductForm();

            document.getElementById("p-id").value = p.id;
            document.getElementById("p-name").value = p.name;
            document.getElementById("p-price").value = p.price;
            document.getElementById("p-image").value = p.image;
            document.getElementById("p-category").value = p.category_id;
            document.getElementById("p-desc").value = p.description;
            document.getElementById("p-sizes").value = p.sizes;
        });
}

function deleteProduct(id) {
    if (!confirm("Biztos törlöd?")) return;

    fetch(BASE_URL + "/admin/product/" + id, {
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        method: "DELETE"
    }).then(() => loadProducts());
}

function loadOrders() {
    fetch(BASE_URL + "/admin/orders/", {
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        }
    })
        .then(res => res.json())
        .then(data => {
            const tbody = document.querySelector("#admin-orders-table tbody");
            tbody.innerHTML = "";

            data.forEach(o => {
                tbody.innerHTML += `
                    <tr>
                        <td>${o.id}</td>
                        <td>${o.user_name}</td>
                        <td>${o.total_price} Ft</td>
                        <td>${new Date(o.created_at).toLocaleDateString()}</td>
                        <td>${o.status || "pending"}</td>
                        <td>-</td>
                    </tr>
                `;
            });
        });
}
