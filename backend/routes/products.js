const express = require("express");
const router = express.Router();
<<<<<<< HEAD
const db = require("../db/database");

// Összes termék lekérése
router.get("/", (req, res) => {
    db.all("SELECT * FROM products", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Egy termék lekérése ID alapján
router.get("/:id", (req, res) => {
    const id = req.params.id;
    db.get("SELECT * FROM products WHERE id = ?", [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ message: "Termék nem található" });
            return;
        }
        res.json(row);
    });
=======

const { serviceProductGet, serviceProductGetId} = require("../service/productsService");
const { isValidId } = require("../validators/commonValidator");


router.get("/", async (req, res) => {
    try {
        const result = await serviceProductGet();
        res.json(result);
    } catch (err) {
        res.status(400).json({
            err: err.message
        });   
    }
});

router.get("/:id", async (req, res) => {
    try {
        const result = await serviceProductGetId(req.params);
        res.json(result);
    } catch (err) {
        res.status(400).json({
            err: err.message
        });   
    }
>>>>>>> webshop-backend-update
});

module.exports = router;
