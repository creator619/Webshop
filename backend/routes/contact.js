const express = require("express");
const router = express.Router();
const db = require("../db/database"); // SQLite connection
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const sqlite3 = require('sqlite3').verbose();


const authMiddleware = require("../Middleware/authMiddleware");
const adminMiddleware = require("../Middleware/adminMiddleware");
const optionalAuth = require("../Middleware/optionalAuth")


router.post("/", optionalAuth, (req, res) => {

    let userId = null;

    if (req.user) {
        userId = req.user.id;
    } 

    const { name, email, category_id, message } = req.body;

    if (!name || !email || !category_id || !message ) {
        console.log("első hiba");
        return res.status(400).json({
            message: "Minden mező kitöltése kötelező!"
        });
    }
    if (email.length > 100 || name.length > 100) {
        console.log("masodik hiba");
        return res.status(400).json({ 
            message: "Az email és/vagy a név túl hosszú!"
        });
    }

    const sql = `
        INSERT INTO contact (user_id, name, email, category_id, message)
        VALUES (?, ?, ?, ?, ?) 
    `;
    db.run(sql, [userId, name, email, category_id, message], function(err) {

        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Adatbázis hiba" });
        }
        res.json({
            success: true,
            message: "Termék hozzáadva"
        });
    });
});


module.exports = router;

