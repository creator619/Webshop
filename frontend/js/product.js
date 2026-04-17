// ==========================================
// TERMÉK RÉSZLETEK ÉS HASONLÓ TERMÉKEK
// ==========================================

if (window.location.pathname.includes("/product")) {
    let product = JSON.parse(localStorage.getItem("selectedProduct"));

    if (product) {
        const imgSrc = getProductImage(product.image);
        document.getElementById("product-img").src = imgSrc;
        document.getElementById("product-name").textContent = product.name;
        document.getElementById("product-price").textContent = product.price.toLocaleString() + " Ft";
        document.getElementById("product-desc").textContent = product.description;

        const stockDetail = document.getElementById("product-stock-detail");
        const addToCartBtn = document.querySelector(".add-to-cart");

        // Készletinformáció kezelése
        if (stockDetail) {
            if (product.stock !== undefined && product.stock > 0) {
                stockDetail.textContent = `Készleten: ${product.stock} db`;
                stockDetail.classList.remove("out-of-stock");
                if (addToCartBtn) {
                    addToCartBtn.disabled = false;
                    addToCartBtn.textContent = "Kosárba";
                }
            } else {
                stockDetail.textContent = "Sajnos elfogyott";
                stockDetail.classList.add("out-of-stock");
                if (addToCartBtn) {
                    addToCartBtn.disabled = true;
                    addToCartBtn.textContent = "Elfogyott";
                    addToCartBtn.style.opacity = "0.5";
                    addToCartBtn.style.cursor = "not-allowed";
                }
            }
        }

        // Méretválasztó gombok generálása
        const sizeContainer = document.getElementById("size-options");
        if (sizeContainer && product.sizes) {
            sizeContainer.innerHTML = "";
            
            const sizes = Array.isArray(product.sizes)
                ? product.sizes
                : product.sizes.split(",");

            // Készletelosztás logikája (mivel a db nem tárol bontást, egy determinisztikus elosztást használunk)
            product.sizes.forEach((size, index) => {
                let sizeStock = 0;
                
                if (product.size_stocks && product.size_stocks[size] !== undefined) {
                    // Valódi készletadat a DB-ből
                    sizeStock = product.size_stocks[size];
                } else {
                    // SZIGORÚ LOGIN: Ha a méret nincs benne a JSON-ben, akkor nincs készlet (0 db)
                    sizeStock = 0;
                }

                // (Kiszedtük a demó célú kamu készlethiány generálót)

                const btn = document.createElement("button");
                btn.className = "size-btn";
                btn.innerHTML = `
                    <span style="display:block; font-size: 1.1rem;">${size}</span>
                    <span style="display:block; font-size: 0.75rem; color: #888; margin-top: 3px; font-weight: normal;">
                        ${sizeStock > 0 ? sizeStock + ' db' : 'Elfogyott'}
                    </span>
                `;
                
                if (sizeStock <= 0) {
                    btn.disabled = true;
                    btn.style.opacity = "0.4";
                    btn.style.cursor = "not-allowed";
                    btn.title = "Sajnos ebből a méretből jelenleg nincs készleten.";
                }

                btn.onclick = () => {
                    document.querySelectorAll(".size-btn").forEach(b => b.classList.remove("active"));
                    btn.classList.add("active");
                    window.selectedSize = size; 
                    window.selectedSizeStock = sizeStock; // Eltároljuk a választott méret készletét
                    
                    // Frissítjük a fő készletkijelzést is a választott mérethez
                    if (stockDetail) {
                        stockDetail.textContent = `A kiválasztott méretből készleten: ${sizeStock} db`;
                        stockDetail.classList.remove("out-of-stock");
                    }

                    // Korlátozzuk a mennyiségválasztót
                    const qtyInput = document.getElementById("product-qty");
                    if (qtyInput) {
                        qtyInput.max = sizeStock;
                        if (parseInt(qtyInput.value) > sizeStock) {
                            qtyInput.value = sizeStock;
                        }
                    }
                    
                    if (addToCartBtn) {
                        addToCartBtn.disabled = false;
                        addToCartBtn.textContent = "Kosárba";
                        addToCartBtn.style.opacity = "1";
                        addToCartBtn.style.cursor = "pointer";
                    }
                };
                sizeContainer.appendChild(btn);
            });
        }

        // Mennyiségválasztó mező figyelése (ne lehessen kézzel nagyobbat beírni)
        const qtyInput = document.getElementById("product-qty");
        if (qtyInput) {
            qtyInput.addEventListener("change", () => {
                if (window.selectedSizeStock !== undefined) {
                    const val = parseInt(qtyInput.value);
                    if (val > window.selectedSizeStock) {
                        qtyInput.value = window.selectedSizeStock;
                        showToast(`Ebből a méretből csak ${window.selectedSizeStock} db van készleten.`);
                    }
                }
            });
        }

        // Kosárba rakás eseménykezelő
        if (addToCartBtn) {
            addToCartBtn.addEventListener("click", () => {
                if (!window.selectedSize) {
                    showToast("Kérlek válassz méretet!");
                    return;
                }

                const quantity = qtyInput ? parseInt(qtyInput.value) : 1;

                if (quantity < 1) {
                    showToast("Érvénytelen mennyiség!");
                    return;
                }

                if (window.selectedSizeStock !== undefined && quantity > window.selectedSizeStock) {
                    showToast("Nincs elég készlet!");
                    return;
                }

                // Létrehozzuk a termék objektumot a választott mérettel
                const productWithSize = { ...product, size: window.selectedSize };
                
                // Meghívjuk a közös addToCart függvényt (common.js)
                addToCart(productWithSize, quantity);
            });
        }

        // Kapcsolódó termékek (ugyanabból a kategóriából) megjelenítése
        renderRelatedProducts(product);
    }
}

/**
 * Ugyanolyan kategóriájú termékek keresése és megjelenítése.
 */
function renderRelatedProducts(currentProduct) {
    const container = document.getElementById("related-list");
    if (!container || !window.allProducts) return;

    const related = window.allProducts
        .filter(p => p.category_id === currentProduct.category_id && p.id !== currentProduct.id)
        .slice(0, 4);

    renderProducts(related, "related-list");
}

