const express = require("express");
const router = express.Router();
const db = require("../db/database"); // SQLite connection
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../Middleware/authMiddleware");

const {validateRegisterSync, validateRegisterAsync, isValidEmail} = require("../validators/registerValidator");
const getUserByEmail = require("../validators/loignValidator")
const {getUserProfile, isValidProfileSync, updateProfile} = require("../validators/profileValidator")

router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const syncError = validateRegisterSync({ name, email, password });
        if (syncError) {
            return res.status(400).json({ message: syncError });
        }
        const asyncError = await validateRegisterAsync({ name, email, password });
        if (asyncError) {
            return res.status(400).json({ message: asyncError});
        }
        const hashed = await bcrypt.hash(password, 10);
        const role = "user";

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

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const syncError = isValidEmail(email);
        
        if (!syncError) {
            return res.status(400).json({ message: "Hibás email vagy jelszó!" })
        }
        if (!email || !password) {
            return res.status(400).json({ message: "Minden mező kitöltése kötelező!" });
        }
        if (email.length > 100 || password.length > 100) {
            return res.status(400).json({ message: "Hibás email vagy jelszó!" });
        }

        const user = await getUserByEmail(email);
        if (!user) {
            return res.status(400).json({ message: "Hibás email vagy jelszó!" });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(400).json({ message: "Hibás email vagy jelszó!" });
        }

        const token = jwt.sign(
            { 
              id: user.id, 
              email: user.email,
              role: user.role
            },
            process.env.JWT_SECRET,
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
    } catch (err) {
        res.status(500).json({ message: "Hiba"});
    }
});

router.get("/profile", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const profile = await getUserProfile(userId);

        res.json(profile);
    } catch (err) {
        res.status(500).json({ message:"Hiba a profil adatainak lekérésekor!" });
    }
});


router.put("/profile", authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const { phone, zip, city, address, name} = req.body;

    const syncError = await isValidProfileSync({ phone, zip, city, address, name});
    if (syncError) {
        return res.status(400).json({ message: syncError });
    }

    try {
        const profileChanges = await updateProfile({phone, zip, city, address, name, userId});

        if (profileChanges === 0) {
            return res.status(404).json({ message:"Felhasználü nem található!"});
        }
        res.json({
            success: true,
            message:"Profil frissítve"
        });
    } catch (err) {
        res.status(500).json({ message:"Szerver hiba"});
    }
});

module.exports = router;
