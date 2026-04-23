const express = require("express");
const router = express.Router();
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
});

module.exports = router;
