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

    db.serialize(() => {
            db.exec("BEGIN TRANSACTION");

            const stmt = db.prepare(`
                INSERT INTO orders (user_id, user_email, guest_email, total_price) 
                VALUES (?, ?, ?, ?)
            `);

            stmt.run(user_id, user_email, guest_email, total_price, function (err) {
                if (err) {
                     db.exec("ROLLBACK");
                    return res.status(500).json({ message: "Hiba a rendelés mentésekor.", error: err.message });
                }

            const orderId = this.lastID; // Az új rendelés ID-ja

             // 2. Tételek beszúrása
            const itemStmt = db.prepare(`
                INSERT INTO order_items (order_id, product_name, price, quantity) 
                VALUES (?, ?, ?, ?)
                `);

            items.forEach(item => {
                // Quantity-t most 1-nek vesszük, mert a frontend nem kezel mennyiséget külön (még)
                itemStmt.run(orderId, item.name, item.price, 1);
            });

            db.exec("COMMIT", (commitErr) => {
                if (commitErr) {
                    db.exec("ROLLBACK");
                    return res.status(500).json({ message: "Hiba a rendelés véglegesítésekor." });
                }

                stmt.finalize();
                itemStmt.finalize();

                res.status(201).json({ 
                    message: "Rendelés sikeresen leadva!", 
                    orderId: orderId 
                });
            });
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
