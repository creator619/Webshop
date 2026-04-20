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
        //foreing key bekapcsolása
        db.run("PRAGMA foreign_keys = ON");
        
        // Users tábla
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT,
            role TEXT
        )`);


        // User_profiles tábla
        db.run(`CREATE TABLE IF NOT EXISTS user_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE,
            phone TEXT,
            zip TEXT,
            city TEXT,
            address TEXT
        )`);

        // Category tábla
        
        db.run(`CREATE TABLE IF NOT EXISTS category (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT
        )`);

        // Contact tábla
        
        db.run(`CREATE TABLE IF NOT EXISTS contact (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            name TEXT,
            email TEXT,
            category_id INTEGER,
            message TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES category(id)
        )`);
        db.run(`CREATE TABLE IF NOT EXISTS product_categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            size_type TEXT
            )`);

        db.get("SELECT count(*) as count FROM product_categories", (err, row) => {
            if (err) {
                console.error("Hiba a kategóriák ellenőrzésekor:", err.message);
                return;
            }
            if (row.count === 0) {
                const categories = [{name: "Ing", size_type: "clothing"}, {name: "Zakó", size_type: "clothing"}, {name: "Nadrág", size_type: "clothing"}, {name: "Cipő", size_type: "shoes"}];
                const upload = db.prepare("INSERT INTO product_categories (name, size_type) VALUES (?, ?)");
                categories.forEach(category => {
                    upload.run(category.name, category.size_type);
                });
                upload.finalize((err) => {
                    if(err) {
                        console.error("Hiba a kategóriák feltöltésekor:", err.message);
                    } else {
                        console.log("Kategóriák sikeresen feltöltve.");
                    }
                });
            }
        });
        // Products tábla

        // Módosítás nem volt méret oszlop és így a frontend nem működött, ezért bele raktam.
        db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            price INTEGER,
            image TEXT,
            category_id INTEGER,
            description TEXT,
            sizes TEXT,
            stock TEXT
        )`, (err) => {
            if (err) {
                console.error("Hiba a products tábla létrehozásakor:", err);
                return;
            }

            // Vendég email mező hozzáadva
            // Orders tábla
            db.run(`CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NULL,
            user_email TEXT,
            guest_email TEXT NULL,
            total_price INTEGER,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            shipping_name TEXT,
            shipping_phone TEXT,
            shipping_address TEXT,
            shipping_city TEXT,
            shipping_zip TEXT
            )`);

            // Order Items tábla
            db.run(`CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER,
            product_name TEXT,
            price INTEGER,
            quantity INTEGER,
            size TEXT,
            FOREIGN KEY(order_id) REFERENCES orders(id)
            )`);

            // Product Stock tábla
            db.run(`CREATE TABLE IF NOT EXISTS product_stock (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id INTEGER,
                size TEXT,
                stock INTEGER,
                FOREIGN KEY(product_id) REFERENCES products(id)
            )`);

            // Ha üres a products tábla, töltsük fel
            db.get("SELECT count(*) as count FROM products", (err, row) => {
                if (row.count === 0) {
                    console.log("Termékek feltöltése...");
                    const products = [
                        // Ingek (Category 1)
                        { name: "Fehér elegáns ing", price: 9990, image: "shirt1.jpg", category_id: 1, description: "Prémium minőségű pamut ing, alkalmi és hétköznapi viseletre is.", sizes: "S,M,L,XL,XXL", stock: JSON.stringify({S: 5, M: 3, L:8, XL: 2, XXL: 1}) },
                        { name: "Kék lezser ing", price: 7990, image: "shirt2.jpg", category_id: 1, description: "Kényelmes viselet, ideális hétvégi programokhoz.", sizes: "S,M,L,XL,XXL", stock: JSON.stringify({S: 5, M: 3, L:8, XL: 2, XXL: 1}) },
                        { name: "Kockás flanel ing", price: 9990, image: "shirt3.jpg", category_id: 1, description: "Meleg és stílusos, tökéletes választás hűvösebb napokra.", sizes: "S,M,L,XL,XXL", stock: JSON.stringify({S: 5, M: 3, L:8, XL: 2, XXL: 1}) },

                        // Zakók (Category 2)
                        { name: "Fekete zakó", price: 24990, image: "jacket1.jpg", category_id: 2, description: "Modern szabású, karcsúsított zakó elegáns eseményekre.", sizes: "S,M,L,XL,XXL", stock: JSON.stringify({S: 5, M: 3, L:8, XL: 2, XXL: 1}) },
                        { name: "Szürke sportzakó", price: 21990, image: "jacket2.jpg", category_id: 2, description: "Elegáns, mégis könnyed megjelenést biztosít.", sizes: "S,M,L,XL,XXL", stock: JSON.stringify({S: 5, M: 3, L:8, XL: 2, XXL: 1}) },
                        { name: "Sötétkék blézer", price: 26990, image: "jacket3.jpg", category_id: 2, description: "Klasszikus darab, amely minden ruhatár alapja.", sizes: "S,M,L,XL,XXL", stock: JSON.stringify({S: 5, M: 3, L:8, XL: 2, XXL: 1}) },

                        // Nadrágok (Category 3)
                        { name: "Kék farmer nadrág", price: 12990, image: "pants1.jpg", category_id: 3, description: "Kényelmes, strapabíró farmer nadrág mindennapi használatra.", sizes: "S,M,L,XL,XXL", stock: JSON.stringify({S: 5, M: 3, L:8, XL: 2, XXL: 1})  },
                        { name: "Bézs chino nadrág", price: 11990, image: "pants2.jpg", category_id: 3, description: "Elegáns és kényelmes, tökéletes irodai viselet.", sizes: "S,M,L,XL,XXL", stock: JSON.stringify({S: 5, M: 3, L:8, XL: 2, XXL: 1}) },
                        { name: "Fekete szövetnadrág", price: 14990, image: "pants3.jpg", category_id: 3, description: "Hivatalos eseményekre ajánlott, prémium anyagból.", sizes: "S,M,L,XL,XXL", stock: JSON.stringify({S: 5, M: 3, L:8, XL: 2, XXL: 1})  },

                        // Cipők (Category 4)
                        { name: "Férfi bőr cipő", price: 19990, image: "shoes1.jpg", category_id: 4, description: "Valódi bőrből készült, kényelmes talpbetéttel rendelkező cipő.",  sizes: "40,41,42,43,44,45", stock: JSON.stringify({"40": 4, "41": 3, "42":8, "43": 2, "44": 1}) },
                        { name: "Fehér sportcipő", price: 15990, image: "shoes2.jpg", category_id: 4, description: "Trendi és kényelmes, mindennapi rohangáláshoz.",  sizes: "40,41,42,43,44,45", stock: JSON.stringify({"40": 4, "41": 3, "42":8, "43": 2, "44": 1}) },
                        { name: "Futócipő", price: 18990, image: "shoes3.jpg", category_id: 4, description: "Könnyű szerkezet, kiváló ütéscsillapítás sportoláshoz.",  sizes: "40,41,42,43,44,45", stock: JSON.stringify({"40": 4, "41": 3, "42":8, "43": 2, "44": 1}) }
                    ];

                    const stmt = db.prepare("INSERT INTO products (name, price, image, category_id, description, sizes, stock) VALUES (?, ?, ?, ?, ?, ?, ?)");
                    const stockStmt = db.prepare("INSERT INTO product_stock (product_id, size, stock) VALUES (?, ?, ?)");

                    let completed = 0;
                    products.forEach(p => {
                        stmt.run(p.name, p.price, p.image, p.category_id, p.description, p.sizes, p.stock, function(err) {
                            if (err) {
                                console.error(err.message);
                            } else {
                                const productId = this.lastID;
                                const sizeList = p.sizes.split(",");
                                sizeList.forEach(size => {
                                    const randomStock = Math.floor(Math.random() * 20) + 1;
                                    stockStmt.run(productId, size.trim(), randomStock);
                                });
                            }
                            
                            completed++;
                            if (completed === products.length) {
                                stmt.finalize();
                                stockStmt.finalize();
                                console.log("Termékek és készlet adatok sikeresen feltöltve!");
                            }
                        });
                    });
                }
            });
        });
    });
}

module.exports = db;
