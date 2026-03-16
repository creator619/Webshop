const express = require("express");
const router = express.Router();
const db = require("../db/database"); // SQLite connection
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const sqlite3 = require('sqlite3').verbose();



const authMiddleware = require("../Middleware/authMiddleware");
const adminMiddleware = require("../Middleware/adminMiddleware");



// Nekem testek törölhetőek, ha kell maradhat

router.get("/test", authMiddleware, adminMiddleware, (req, res) => {
    db.all("SELECT * FROM products", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

router.post("/test1", authMiddleware, (req, res) => {
    const { id, role} = req.body;

    const sql = `
        UPDATE users
        SET role = ?
        WHERE id = ?
    `;    
    db.run(sql, [role, id], function(err) {

        if (err) {
            return res.status(500).json({ message:"Adatbázis hiba" });
        }
        res.json({
            message: "Jogosultság megadva!"
        });
    });
});



//Product hozzáadása

router.post("/product", authMiddleware, adminMiddleware, (req, res) => {

    const { name, price, image, category_id, description } = req.body;

    const sql = `
        INSERT INTO products (name, price, image, category_id, description)
        VALUES (?, ?, ?, ?, ?)
    `;
    db.run(sql, [name, price, image, category_id, description], function(err) {

        if (err) {
            return res.status(500).json({ message: "Adatbázis hiba" });
        }
        res.json({
            message: "Termék hozzáadva"
        }); 
    });
});

//Product frissítése

router.put("/:id", authMiddleware, adminMiddleware, (req, res) => {

    const { id } = req.params;
    const { name, price, image, category_id, description } = req.body;

    const sql = `
        UPDATE products
        SET name = ?, price = ?, image = ?, category_id = ?, description = ?
        WHERE id = ?
    `;    
    db.run(sql, [name, price, image, category_id, description, id], function(err) {

        if (err) {
            return res.status(500).json({ message:"Adatbázis hiba" });
        }
        if (this.changes === 0) {

            return res.status(404).json({
                message: "Azonosítóval nem található termék!"
            });
        }
        res.json({
            message: "Termék adatai frissítve"
        });
    });
});

//termék törlése

router.delete("/:id", authMiddleware, adminMiddleware, (req, res) => {

    const { id } = req.params;
    
    const sql = `
        DELETE FROM products WHERE id = ?
    `;

    db.run(sql, [id], function(err) {
    
        if (err) {
            return res.status(500).json({ message:"Adatbázis hiba" });
        }
        if (this.changes === 0) {

            return res.status(404).json({
                message: "Azonosítóval nem található termék!"
            });
        }
        res.json({
            message: "Termék törölve"
        });
    });
});


module.exports = router;

