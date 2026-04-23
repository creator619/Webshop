const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'webshop.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Hiba:', err.message);
    } else {
        console.log('Adatbázis megnyitva.');
        deleteTables();
    }
});

function deleteTables() {
    db.serialize(() => {
        db.run("PRAGMA foreign_keys = OFF");

        db.run("DROP TABLE IF EXISTS order_items");
        db.run("DROP TABLE IF EXISTS orders");
        db.run("DROP TABLE IF EXISTS product_stock");
        db.run("DROP TABLE IF EXISTS products");
        db.run("DROP TABLE IF EXISTS contact");
        db.run("DROP TABLE IF EXISTS category");
        db.run("DROP TABLE IF EXISTS user_profiles");
        db.run("DROP TABLE IF EXISTS users");

        console.log("Összes tábla törölve.");

        db.close();
    });
}