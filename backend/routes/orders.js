const express = require("express");
const router = express.Router();
const authMiddleware = require("../Middleware/authMiddleware");
const optionalAuth = require("../Middleware/optionalAuth");
const adminMiddleware = require("../Middleware/adminMiddleware");
const rateLimit = require("express-rate-limit");

const orderLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 perc
    max: 5, // max 5 request
    message: { message:"Túl sok próbálkozás, próbáld újra később!"}
});


const { serviceOrder, serviceCategoriesGet, serviceCategoriesGetMy } = require("../service/orderService");

router.post("/", optionalAuth, orderLimiter, async (req, res) => {
    try {
        const result = await serviceOrder(req.user, req.body);
        res.json({
            success:true,
            data: result,
            message: "Rendelés leadva!"
        });
    } catch (err) {
        res.status(400).json({
             message: err.message
        });
    }
});

router.get("/", authMiddleware, adminMiddleware, async (req,res) => {
    try {
        const result = await serviceCategoriesGet(req.user);
        res.json({
            success:true,
            data: result
        });
    } catch (err) {
        res.status(400).json({
             message: err.message
        });
    }
});

router.get("/my", authMiddleware, async (req, res) => {
    try {
        const result = await serviceCategoriesGetMy(req.user);
        res.json({
            success:true,
            data: result
        });
    } catch (err) {
        res.status(400).json({
            message: err.message
        });
    }
});

module.exports = router;
