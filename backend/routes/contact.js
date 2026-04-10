const express = require("express");
const router = express.Router();
const db = require("../db/database"); // SQLite connection
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const sqlite3 = require('sqlite3').verbose();


const authMiddleware = require("../Middleware/authMiddleware");
const adminMiddleware = require("../Middleware/adminMiddleware");


router.post("/contact", (req, res) => {
    const userId = req.user ? req.user.id : null;
    const { name, email, category_id, message } = req.body;

    const sql = `
        INSERT INTO contact (user_id, name, email, category_id, message)
        VALUES (?, ?, ?, ?, ?) 
    `;
    db.run(sql, [userId, name, email, category_id, message], function(err) {

        if (err) {
            return res.status(500).json({ message: "Adatbázis hiba" });
        }
        res.json({
            success: true,
            message: "Termék hozzáadva"
        });
    });
});


module.exports = router;

