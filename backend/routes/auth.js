const express = require("express");
const router = express.Router();
const db = require("../db/database"); // SQLite connection
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../Middleware/authMiddleware");

// REGISZTRÁCIÓ
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "Minden mező kötelező!" });
    }

    // Email ellenőrzés
    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, row) => {
        if (err) return res.status(500).json({ message: "Adatbázis hiba" });
        if (row) {
            return res.status(400).json({ message: "Ez az email már létezik!" });
        }

        try {
            const hashed = await bcrypt.hash(password, 10);
            const role = "user"

            db.run(
                "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
                [name, email, hashed, role],
                function (err) {
                    if (err) return res.status(500).json({ message: "Hiba a mentés során" });
                    res.json({ success: true });
                }
            );
        } catch (error) {
            res.status(500).json({ message: "Szerver hiba" });
        }
    });
});

// BEJELENTKEZÉS
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Minden mező kötelező!" });
    }

    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
        if (err) return res.status(500).json({ message: "Adatbázis hiba" });

        if (!user) {
            return res.status(400).json({ message: "Hibás email vagy jelszó!" });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(400).json({ message: "Hibás email vagy jelszó!" });
        }

        const token = jwt.sign(
            { id: user.id, 
              email: user.email,
              role: user.role
            },
            "titkoskulcs123",
            { expiresIn: "2h" }
        );

        res.json({
            message: "Sikeres bejelentkezés!",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    });
});


module.exports = router;
