# Ruházati Webshop - Teljes Webalkalmazás

Ez egy komplett ruházati webáruház projekt, amely egy Node.js alapú backend szolgáltatásból és egy modern, reszponzív frontend felületből áll. Az alkalmazás modern technológiákat használ a biztonságos és gyors vásárlási élmény érdekében.

## Funkciók

- **Felhasználói Kezelés**: Regisztráció, biztonságos bejelentkezés (JWT), és profil adatok szerkesztése.
- **Termékkatalógus**: Termékek böngészése, keresés és kategóriák szerinti szűrés.
- **Kosárkezelés**: Termékek kosárba helyezése, mennyiségek módosítása.
- **Rendelési Rendszer**: Rendelések leadása, korábbi rendelések megtekintése.
- **Admin Felület**: Termékek, kategóriák és rendelések kezelése az adminisztrátorok számára.
- **Biztonság**: Jelszó hashelés (bcrypt), JWT-alapú hitelesítés, és kérésszám-korlátozás (rate limiting).

## Technológiai Stack

- **Backend**: Node.js, Express.js
- **Adatbázis**: SQLite3 (helyi fájl alapú adatbázis)
- **Hitelesítés**: JSON Web Token (JWT)
- **Frontend**: HTML5, Vanilla CSS, Modern JavaScript
- **Biztonság**: Bcrypt (jelszó titkosítás), Express Rate Limit

## Telepítés és Futtatás

### 1. Előfeltételek
Győződj meg róla, hogy a [Node.js](https://nodejs.org/) telepítve van a gépeden.

### 2. Backend beállítása
1. Lépj be a `backend` mappába:
   ```bash
   cd backend
   ```
2. Telepítsd a szükséges csomagokat:
   ```bash
   npm install
   ```
3. Ellenőrizd a `.env` fájlt, amely tartalmazza a `JWT_SECRET` kulcsot.

### 3. Futtatás
Indítsd el a szervert a `backend` mappából:
```bash
npm start
```
A szerver automatikusan detektálja a helyi IP-címedet, és kiírja, hogy hol érhető el (pl. `http://192.168.x.x:3000`).

### 4. Frontend elérése
A frontendet a backend szerver szolgálja ki statikusan. A böngészőben nyisd meg a szerver által kiírt címet.

## Projekt Felépítése

- `/backend`: Az API szerver, útvonalak (routes), adatbázis kapcsolat és logika.
- `/frontend`: A felhasználói felület (HTML, CSS, JS fájlok).
- `/export.sql`: Az adatbázis sémája és kezdő adatai.
- `/images`: A termékekhez tartozó képfájlok tárolóhelye.

## Dokumentáció
A projekt részletes dokumentációit a gyökérkönyvtárban található `.docx` fájlokban találod:
- `webshop_vizsgaremek.docx`: Általános leírás és követelmények.
- `ER_diagram_webshop.docx`: Adatbázis szerkezeti terve.
- `Tesztelési jegyzőkönyv.docx`: Részletes tesztelési eredmények.

---
Készítette: Gáspár Benjámin, Szentes Attila, Simon Ernő

