const express = require("express");
const router = express.Router();
<<<<<<< HEAD
const db = require("../db/database");

router.post("/", (req, res) => {
    console.log("Rendelés érkezett:", req.body);
    const { user_email, items, total_price } = req.body;

    if (!user_email || !items || items.length === 0) {
        console.log("Hiányzó adatok!", { user_email, items_length: items ? items.length : "undefined" });
        return res.status(400).json({ message: "Hiányzó adatok: email vagy kosár tartalom." });
    }

    // 1. Rendelés beszúrása
    const stmt = db.prepare("INSERT INTO orders (user_email, total_price) VALUES (?, ?)");
    stmt.run(user_email, total_price, function (err) {
        if (err) {
            return res.status(500).json({ message: "Hiba a rendelés mentésekor.", error: err.message });
        }

        const orderId = this.lastID; // Az új rendelés ID-ja

        // 2. Tételek beszúrása
        const itemStmt = db.prepare("INSERT INTO order_items (order_id, product_name, price, quantity) VALUES (?, ?, ?, ?)");

        // Aszinkron működés miatt trükkös lehet a ciklusban hibakezelés, 
        // de SQLite Node.js driverben a serialize segít, vagy transaction.
        // Egyszerűsítve:
        db.serialize(() => {
            db.exec("BEGIN TRANSACTION");

            items.forEach(item => {
                // Quantity-t most 1-nek vesszük, mert a frontend nem kezel mennyiséget külön (még)
                itemStmt.run(orderId, item.name, item.price, 1);
            });

            db.exec("COMMIT", (commitErr) => {
                if (commitErr) {
                    return res.status(500).json({ message: "Hiba a rendelés véglegesítésekor." });
                }

                res.status(201).json({ message: "Rendelés sikeresen leadva!", orderId: orderId });
            });
        });

        stmt.finalize();
        itemStmt.finalize();
    });
=======
const authMiddleware = require("../Middleware/authMiddleware");
const optionalAuth = require("../Middleware/optionalAuth");
const adminMiddleware = require("../Middleware/adminMiddleware");
const rateLimit = require("express-rate-limit");

const orderLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 perc
    max: 5, // max 5 request
    message: { message:"Túl sok próbálkozás, próbáld újra később!"}
});


const { serviceOrder, serviceCategoriesGet, serviceCategoriesGetMy } = require("../service/orderService");

router.post("/", optionalAuth, orderLimiter, async (req, res) => {
    try {
        const result = await serviceOrder(req.user, req.body);
        res.json({
            success:true,
            data: result,
            message: "Rendelés leadva!"
        });
    } catch (err) {
        res.status(400).json({
             message: err.message
        });
    }
});

router.get("/", authMiddleware, adminMiddleware, async (req,res) => {
    try {
        const result = await serviceCategoriesGet(req.user);
        res.json({
            success:true,
            data: result
        });
    } catch (err) {
        res.status(400).json({
             message: err.message
        });
    }
});

router.get("/my", authMiddleware, async (req, res) => {
    try {
        const result = await serviceCategoriesGetMy(req.user);
        res.json({
            success:true,
            data: result
        });
    } catch (err) {
        res.status(400).json({
            message: err.message
        });
    }
>>>>>>> webshop-backend-update
});

module.exports = router;
