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

    const { items, total_price } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ 
            message: "Hiányzó kosár tartalom." 
        });
    }

    //backendnek kellene kiszámolnia az árat, frontend manipulálható
    if (total_price == null) {
    return res.status(400).json({
        message: "Hiányzó végösszeg."
    });
    }

    // készlet ellenőrzés

     const checkStockPromises = items.map(item => {
        return new Promise((resolve, reject) => {
            const qty = item.quantity || 1;

            db.get(
                "SELECT stock FROM product_stock WHERE product_id = ? AND size = ?",
                [item.id, item.size],
                (err, row) => {
                    if (err) {
                        return reject(new Error("Adatbázis hiba a készlet ellenőrzésekor."));
                    }

                    if (!row) {
                        return reject(new Error(`${item.name} (${item.size}) nem található.`));
                    }

                    if (row.stock < qty) {
                        return reject(new Error(`Nincs elég készlet: ${item.name} (${item.size}) - elérhető: ${row.stock}`));
                    }

                    resolve(true);
                }
            );
        });
    });

    Promise.all(checkStockPromises)
        .then(() => {

            db.serialize(() => {
                db.exec("BEGIN TRANSACTION");

                // 🧾 2. Rendelés mentése
                const stmt = db.prepare(`
                    INSERT INTO orders (user_id, user_email, guest_email, total_price) 
                    VALUES (?, ?, ?, ?)
                `);

                stmt.run(user_id, user_email, guest_email, total_price, function (err) {
                    if (err) {
                        db.exec("ROLLBACK");
                        return res.status(500).json({
                            message: "Hiba a rendelés mentésekor.",
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

                    for (const item of items) {
                        const qty = item.quantity || 1;

                        itemStmt.run(orderId, item.name, item.price, qty);
                        stockStmt.run(qty, item.id, item.size);
                    }

                    // ✅ COMMIT
                    db.exec("COMMIT", (commitErr) => {
                        if (commitErr) {
                            db.exec("ROLLBACK");
                            return res.status(500).json({
                                message: "Hiba a rendelés véglegesítésekor."
                            });
                        }

                        stmt.finalize();
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
module.exports = router;
