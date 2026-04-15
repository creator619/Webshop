const express = require("express");
const router = express.Router();
const db = require("../db/database"); // SQLite connection
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const sqlite3 = require('sqlite3').verbose();



const authMiddleware = require("../Middleware/authMiddleware");
const adminMiddleware = require("../Middleware/adminMiddleware");

const { serviceOrdersUpdate, serviceOrders} = require("../service/adminService");



router.get("/rendeles", authMiddleware, (req, res) => {
    db.run("ALTER TABLE orders ADD COLUMN shipping_zip TEXT;", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ success: true });
    });
});

router.get("/useradat", (req, res) => {
    db.all("SELECT * FROM orders", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

router.get("/categoriateszt", (req, res) => {
    const name = "Rendeléssel kapcsolatos kérdés";
    const name2 = "Szállításról érdeklődnék";
    const name3 = "Termék visszaküldése";
    const name4 = "Egyéb";

    const sql = `
        INSERT INTO category (name)
        VALUES (?)
    `;
    db.run(sql, [name], function(err) {

        if (err) {
            return res.status(500).json({ message: "hiba" });
        }
        db.run(sql, [name2], function(err) {

        if (err) {
            return res.status(500).json({ message: "hiba" });
        }
            db.run(sql, [name3], function(err) {

            if (err) {
             return res.status(500).json({ message: "hiba" });
            }
                db.run(sql, [name4], function(err) {

                if (err) {
                 return res.status(500).json({ message: "hiba" });
                }
              res.json({
                 success: true,
                 message:"Kategória sikeresen hozzáadva!"
                });
              });
            });
        });
    });
});

router.get("/test", authMiddleware, adminMiddleware, (req, res) => {
    db.all("SELECT * FROM user_profiles", [], (err, rows) => {
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

// service mappába.


router.get("/orders/", authMiddleware, adminMiddleware, async (req, res) => {
    const result = await serviceOrders();
    res.json(result);
});



router.put("/orders/:id", authMiddleware, adminMiddleware, async (req, res) =>{
    try {
        const result = await serviceOrdersUpdate(req.params, req.body);
        res.json({
            success:true,
            data: result
        });
    } catch (err) {
        res.status(400).json({
            message: err.message
        });
    }
})


// rendelés törlése

router.delete("/orders/:id", authMiddleware, adminMiddleware, (req, res) => {

    const { id } = req.params;
    
    const sql = `
        DELETE FROM orders WHERE id = ?
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
            message: "Rendelés törölve"
        });
    });
});


//Product hozzáadása

router.post("/product", authMiddleware, adminMiddleware,(req, res) => {

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

router.put("/product/:id", authMiddleware, adminMiddleware, (req, res) => {

    const { id } = req.params;
    const stockString = JSON.stringify(req.body.stock);
    const { name, price, image, category_id, description, sizes } = req.body;


    const sql = `
        UPDATE products
        SET name = ?, price = ?, image = ?, category_id = ?, description = ?, sizes = ?, stock = ?
        WHERE id = ?
    `;    
    db.run(sql, [name, price, image, category_id, description, sizes, stockString, id], function(err) {

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

router.delete("/product/:id", authMiddleware, adminMiddleware,(req, res) => {

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


//Category lekérés

router.get("/categories", authMiddleware, adminMiddleware, (req, res) => {

    db.all("SELECT * FROM category", [], (err, rows) => {

        if (err) {
            return res.status(500).json({message: "Hiba"});
        }
        res.json(rows);
    });
});

router.post("/categories", authMiddleware, adminMiddleware, (req, res) => {

    const { name } = req.body;

    const sql = `
        INSERT INTO category (name)
        VALUES (?)
    `;
    db.run(sql, [name], function(err) {

        if (err) {
            return res.status(500).json({ message: "hiba" });
        }
        res.json({
            success: true,
            message:"Kategória sikeresen hozzáadva!"
        });
    });
});


router.put("/categories", authMiddleware, adminMiddleware, (req, res) => {
    const { name, id } = req.body;
    const sql = `
        UPDATE category
        SET name = ?
        WHERE id = ?
    `;
    db.run(sql, [name, id], function(err) {

        if (err) {
            return res.status(500).json({ message: "hiba" });
        }
        res.json({
            success: true,
            message:"Kategória sikeresen frissítve!"
        });
    });
});

//Contact lekérdezés

router.get("/contact", authMiddleware, adminMiddleware, (req, res) => {
   
 db.all("SELECT * FROM contact", [], (err, contacts) => {
    if (err) return res.status(500).json({ error: err.message });

    db.all("SELECT * FROM category", [], (err2, categories) => {
        if (err2) return res.status(500).json({ error: err2.message });

        const result = contacts.map(contact => {
            return {
                ...contact,
                category: categories.find(c => c.id === contact.category_id) || null 
            };
        });

        res.json(result);
      });
    });
});

//Users lekérdezés

router.get("/users", authMiddleware, adminMiddleware, (req, res) => {

    db.all("SELECT * FROM users", [], (err, rows) => {

        if (err) {
            res.status(500).json({ error: err.message})
        }
        res.json(rows);
    });
});


//user_profiles lekérdezés


router.get("/profiles", authMiddleware, adminMiddleware, (req, res) => {

    db.all("SELECT * FROM user_profiles", [], (err, rows) => {

        if (err) {
            res.status(500).json({ error: err.message})
        }
        res.json(rows);
    });
});


module.exports = router;

