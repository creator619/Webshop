const express = require("express");
const router = express.Router();
const db = require("../db/database");
const authMiddleware = require("../Middleware/authMiddleware");
const optionalAuth = require("../Middleware/optionalAuth");


router.post("/", optionalAuth, (req, res) => {
    console.log("Rendelés érkezett:", req.body);

    let user_email = null;
    let guest_email = null;
    let user_id = null;

    if (req.user) {
        user_email = req.user.email;
        user_id = req.user.id;
    } else {
        // vendég
        guest_email = req.body.email;

        if (!guest_email) {
            return res.status(400).json({
                message: "Vendég rendeléshez email kötelező!"
            });
        }
    }

    const { items } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({
            message: "Hiányzó kosár tartalom."
        });
    }

    // 🔹 1. Termékek lekérése DB-ből (név + ár)
    const productPromises = items.map(item => {
        return new Promise((resolve, reject) => {
            const qty = item.quantity || 1;

            db.get(
                `SELECT name, price FROM products WHERE id = ?`,
                [item.id],
                (err, row) => {
                    if (err) return reject(new Error("Adatbázis hiba"));
                    if (!row) return reject(new Error(`Termék nem található (ID: ${item.id})`));

                    resolve({
                        id: item.id,
                        size: item.size,
                        quantity: qty,
                        name: row.name,
                        price: row.price
                    });
                }
            );
        });
    });

    Promise.all(productPromises)
        .then(validItems => {

            // 🔹 2. Végösszeg számítás (backend!)
            const total_price = validItems.reduce((sum, item) => {
                return sum + item.price * item.quantity;
            }, 0);

            console.log("Backend által számolt végösszeg:", total_price);

            // 🔹 3. Készlet ellenőrzés
            const stockPromises = validItems.map(item => {
                return new Promise((resolve, reject) => {
                    db.get(
                        `SELECT stock FROM product_stock WHERE product_id = ? AND size = ?`,
                        [item.id, item.size],
                        (err, row) => {
                            if (err) return reject(new Error("Adatbázis hiba készlet ellenőrzésnél"));

                            if (!row) {
                                return reject(new Error(`${item.name} (${item.size}) nem található.`));
                            }

                            if (row.stock < item.quantity) {
                                return reject(new Error(
                                    `Nincs elég készlet: ${item.name} (${item.size}) - elérhető: ${row.stock}`
                                ));
                            }

                            resolve(true);
                        }
                    );
                });
            });

            return Promise.all(stockPromises)
                .then(() => ({ validItems, total_price }));
        })
        .then(({ validItems, total_price }) => {

            // 🔹 4. Mentés tranzakcióval
            db.serialize(() => {
                db.exec("BEGIN TRANSACTION");

                const orderStmt = db.prepare(`
                    INSERT INTO orders (user_id, user_email, guest_email, total_price)
                    VALUES (?, ?, ?, ?)
                `);

                orderStmt.run(user_id, user_email, guest_email, total_price, function (err) {
                    if (err) {
                        db.exec("ROLLBACK");
                        return res.status(500).json({
                            message: "Hiba a rendelés mentésekor",
                            error: err.message
                        });
                    }

                    const orderId = this.lastID;

                    // 📦 3. Tételek + készlet csökkentés
                    const itemStmt = db.prepare(`
                        INSERT INTO order_items (order_id, product_name, price, quantity)
                        VALUES (?, ?, ?, ?)
                    `);

                    const stockStmt = db.prepare(`
                        UPDATE product_stock
                        SET stock = stock - ?
                        WHERE product_id = ? AND size = ?
                    `);

                    for (const item of validItems) {
                        itemStmt.run(orderId, item.name, item.price, item.quantity);
                        stockStmt.run(item.quantity, item.id, item.size);
                    }

                    // 🔹 5. COMMIT
                    db.exec("COMMIT", (commitErr) => {
                        if (commitErr) {
                            db.exec("ROLLBACK");
                            return res.status(500).json({
                                message: "Hiba a rendelés véglegesítésekor"
                            });
                        }

                        orderStmt.finalize();
                        itemStmt.finalize();
                        stockStmt.finalize();

                        res.status(201).json({
                            message: "Rendelés sikeresen leadva!",
                            orderId: orderId
                        });
                    });
                });
            });
        })
        .catch(err => {
            return res.status(400).json({
                message: err.message
            });
        });
});

router.get("/", authMiddleware, (req, res) => {
    const userEmail = req.user.email;

    db.all(
        "SELECT * FROM orders WHERE user_email = ?",
        [userEmail],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ message: "Hiba", error: err.message });
            }

            res.json(rows);
        }
    );
});

router.get("/my", authMiddleware, (req, res) => {
    const user_id = req.user.id;

    db.all(
        "SELECT * FROM orders WHERE user_id = ?",
        [user_id],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ message: "Hiba", error: err.message });
            }

            res.json(rows);
        }
    );
});


module.exports = router;
