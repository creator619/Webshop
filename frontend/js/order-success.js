/* --- SIKERES RENDELÉS VISSZAIGAZOLÁS --- */

document.addEventListener("DOMContentLoaded", () => {
    /* Kiolvassuk az URL-ből a rendelési sorszámot */
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');
    
    const orderIdDisplay = document.getElementById('display-order-id');
    if (orderId && orderIdDisplay) {
        orderIdDisplay.textContent = '#' + orderId;
    } else if (orderIdDisplay) {
        orderIdDisplay.textContent = 'Ismeretlen';
    }
});
