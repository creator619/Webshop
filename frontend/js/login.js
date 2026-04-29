/* --- BEJELENTKEZÉS --- */

if (localStorage.getItem("user")) {
    window.location.href="/";
}

/* Bejelentkezés logikája */
if (window.location.pathname.includes("/login")) {
    const loginBtn = document.getElementById("login-btn");
    if (loginBtn) {
        loginBtn.addEventListener("click", async () => {
            const email = document.getElementById("login-email").value;
            const password = document.getElementById("login-password").value;

            if (!email || !password) {
                showToast("Kérlek töltsd ki az összes mezőt!");
                return;
            }

            try {
                /* Bejelentkezési adatok küldése a saját backendnek */
                const response = await fetch(`${BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || data.error || "Sikertelen bejelentkezés");
                }

                /* Bejelentkezés után a tokent és a felhasználói adatokat tároljuk */
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                
                showToast("Sikeres bejelentkezés!");
                setTimeout(() => {
                    const isAdmin = data.user.role === 'admin' || data.user.is_admin;
                    window.location.href = isAdmin ? "/admin" : "/";
                }, 1000);
            } catch (error) {
                showToast(error.message || "Hibás email vagy jelszó!");
            }
        });
    }
}
