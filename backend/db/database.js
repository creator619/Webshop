const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'webshop.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Hiba az adatbázis megnyitásakor:', err.message);
    } else {
        console.log('Sikeres csatlakozás az SQLite adatbázishoz.');
        initDb();
    }
});

function initDb() {
    db.serialize(() => {
        // Users tábla
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT,
            role TEXT
        )`);

        // Products tábla

        // Módosítás nem volt méret oszlop és így a frontend nem működött, ezért bele raktam.
        db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            price INTEGER,
            image TEXT,
            category_id INTEGER,
            description TEXT,
            sizes TEXT
        )`, (err) => {
            if (err) {
                console.error("Hiba a products tábla létrehozásakor:", err);
                return;
            }

            // Orders tábla
            db.run(`CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_email TEXT,
            total_price INTEGER,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

            // Order Items tábla
            db.run(`CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER,
            product_name TEXT,
            price INTEGER,
            quantity INTEGER,
            FOREIGN KEY(order_id) REFERENCES orders(id)
        )`);

            // Ha üres a products tábla, töltsük fel
            db.get("SELECT count(*) as count FROM products", (err, row) => {
                if (row.count === 0) {
                    console.log("Termékek feltöltése...");
                    const products = [
                        // Ingek (Category 1)
                        { name: "Fehér elegáns ing", price: 8990, image: "shirt1.jpg", category_id: 1, description: "Prémium minőségű pamut ing, alkalmi és hétköznapi viseletre is.", sizes: "S,M,L,XL,XXL" },
                        { name: "Kék lezser ing", price: 7990, image: "shirt2.jpg", category_id: 1, description: "Kényelmes viselet, ideális hétvégi programokhoz.", sizes: "S,M,L,XL,XXL"},
                        { name: "Kockás flanel ing", price: 9990, image: "shirt3.jpg", category_id: 1, description: "Meleg és stílusos, tökéletes választás hűvösebb napokra.", sizes: "S,M,L,XL,XXL" },

                        // Zakók (Category 2)
                        { name: "Fekete zakó", price: 24990, image: "jacket1.jpg", category_id: 2, description: "Modern szabású, karcsúsított zakó elegáns eseményekre.", sizes: "S,M,L,XL,XXL" },
                        { name: "Szürke sportzakó", price: 21990, image: "jacket2.jpg", category_id: 2, description: "Elegáns, mégis könnyed megjelenést biztosít.", sizes: "S,M,L,XL,XXL" },
                        { name: "Sötétkék blézer", price: 26990, image: "jacket3.jpg", category_id: 2, description: "Klasszikus darab, amely minden ruhatár alapja.", sizes: "S,M,L,XL,XXL"},

                        // Nadrágok (Category 3)
                        { name: "Kék farmer nadrág", price: 12990, image: "pants1.jpg", category_id: 3, description: "Kényelmes, strapabíró farmer nadrág mindennapi használatra.", sizes: "S,M,L,XL,XXL" },
                        { name: "Bézs chino nadrág", price: 11990, image: "pants2.jpg", category_id: 3, description: "Elegáns és kényelmes, tökéletes irodai viselet.", sizes: "S,M,L,XL,XXL" },
                        { name: "Fekete szövetnadrág", price: 14990, image: "pants3.jpg", category_id: 3, description: "Hivatalos eseményekre ajánlott, prémium anyagból.", sizes: "S,M,L,XL,XXL" },

                        // Cipők (Category 4)
                        { name: "Férfi bőr cipő", price: 19990, image: "shoes1.jpg", category_id: 4, description: "Valódi bőrből készült, kényelmes talpbetéttel rendelkező cipő.",  sizes: "40,41,42,43,44,45" },
                        { name: "Fehér sportcipő", price: 15990, image: "shoes2.jpg", category_id: 4, description: "Trendi és kényelmes, mindennapi rohangáláshoz.",  sizes: "40,41,42,43,44,45"  },
                        { name: "Futócipő", price: 18990, image: "shoes3.jpg", category_id: 4, description: "Könnyű szerkezet, kiváló ütéscsillapítás sportoláshoz.",  sizes: "40,41,42,43,44,45"  }
                    ];

                    const stmt = db.prepare("INSERT INTO products (name, price, image, category_id, description, sizes) VALUES (?, ?, ?, ?, ?, ?)");
                    products.forEach(p => {
                        stmt.run(p.name, p.price, p.image, p.category_id, p.description, p.sizes);
                    });
                    stmt.finalize();
                    console.log("Termékek sikeresen feltöltve!");
                }
            });
        });
    });
}

module.exports = db;
