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
    if (name.length > 100 || email.length > 100 || password.length > 100) {
        return res.status(400).json({ message: "Név, az email vagy a jelszó túl hosszú!" });
    }
    if (name.includes("<")) {
        return res.status(400).json({ message: "Nem megfelelő név!" });
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

                    const userId = this.lastID;

                    //profil létrehozása
                    db.run(
                        "INSERT INTO user_profiles (user_id) VALUES (?)",
                        [userId],
                        (err) => {
                        if (err) return res.status(500).json({ message: "Profil létrehozási hiba"});

                        res.json({ success: true });
                        }
                    );
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
    if (email.length > 100 || password.length > 100) {
        return res.status(400).json({ message: "Hibás email vagy jelszó!" });
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

//Nincs kész tokenből kell hogy kérje a profil id-t, majd javítom
// tesztelni kell még nem lett tesztelve
// frontend részét meg kell hozzá csinálni


router.get("/profile", authMiddleware, (req, res) => {
    const userId = req.user.id;
    
    db.get(`
    SELECT u.name, u.email, p.phone, p.zip, p.city, p.address
    FROM users u
    LEFT JOIN user_profiles p ON u.id = p.user_id
    WHERE u.id = ?    
    `, [userId], (err, row) => {
        if (err) return res.status(500).json({ message: "Hiba a profil adatainak lekérdezésekor!" });
    
        res.json(row);
        });
    });

router.put("/profile", authMiddleware, (req, res) => {
    const userId = req.user.id;
    const { phone, zip, city, address } = req.body;

    db.run(`
        INSERT INTO user_profiles (user_id, phone, zip, city, address)
        VALUES(?, ?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
            phone = excluded.phone,
            zip = excluded.zip,
            city = excluded.city,
            address = excluded.address
        WHERE
            phone IS NOT excluded.phone OR
            zip IS NOT excluded.zip OR
            city IS NOT excluded.city OR
           address IS NOT excluded.address
    `,
    [userId, phone, zip, city, address], function (err) {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Hiba mentés közben" });
        }
        if (this.changes === 0) {
            return res.json({
                success: true,
                message: "Nem történt változás"
            });
        }
        res.json({
            success: true,
            message:"Profil frissítve"
        });
    });
});

module.exports = router;
