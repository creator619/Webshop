const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");

const contactLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 perc
    max: 5, // max 5 request
    message: { message:"Túl sok próbálkozás, próbáld újra később!"}
});
const optionalAuth = require("../Middleware/optionalAuth");

const { serviceContact } = require("../service/contactService");

router.post("/", optionalAuth, contactLimiter, async (req, res) => {
    try {
        const result = await serviceContact(req.user, req.body);
        res.json({
            success:true,
            data: result,
            message: "Üzenet elküldve!"
        });
    } catch (err) {
        res.status(400).json({
             message: err.message
        });
    }
});

module.exports = router;

