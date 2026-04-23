const express = require("express");
const router = express.Router();
<<<<<<< HEAD
const db = require("../db/database"); // SQLite connection
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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

            db.run(
                "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
                [name, email, hashed],
                function (err) {
                    if (err) return res.status(500).json({ message: "Hiba a mentés során" });
                    res.json({ message: "Sikeres regisztráció!" });
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
            { id: user.id, email: user.email },
            "titkoskulcs123",
            { expiresIn: "2h" }
        );

        res.json({
            message: "Sikeres bejelentkezés!",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    });
=======
const authMiddleware = require("../Middleware/authMiddleware");
const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 perc
    max: 5, // max 5 request
    message: { message:"Túl sok próbálkozás, próbáld újra később!"}
});
const { serviceRegisterPost, serviceLogin, serviceProfileGet, serviceProfilePut} = require("../service/authService")


router.post("/register", loginLimiter, async (req,res) => {
    try {
        const result = await serviceRegisterPost(req.body)
        res.json({
            success:true,
            data: result,
            message:"Sikeres regisztráció! Most már bejelentkezhetsz!"
        });
    } catch (err) {
        res.status(400).json({
            error: err.message
        });
    }
});

router.post("/login", loginLimiter, async (req, res) => {
    try {
        const result = await serviceLogin(req.body);
        res.json(result);
    } catch (err) {
        res.status(400).json({
            err: err.message
        });
    }
});

router.get("/profile", authMiddleware, async (req, res) => {
    try {
        const result = await serviceProfileGet(req.user)
        res.json(result);
    } catch (err) {
        res.status(400).json({ message:"Hiba a profil adatainak lekérésekor!" });
    }
});

router.put("/profile", authMiddleware, loginLimiter, async (req, res) => {
    try {
        const result = await serviceProfilePut(req.user, req.body)
        res.json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
>>>>>>> webshop-backend-update
});

module.exports = router;
