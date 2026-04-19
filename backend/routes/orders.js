const express = require("express");
const router = express.Router();
const authMiddleware = require("../Middleware/authMiddleware");
const optionalAuth = require("../Middleware/optionalAuth");
const adminMiddleware = require("../Middleware/adminMiddleware");


const { serviceOrder, serviceCategoriesGet, serviceCategoriesGetMy } = require("../service/orderService");

router.post("/", optionalAuth, async (req, res) => {
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

// A) Rate limiter
//B) Idempotency key
// 3. 5 mp duplikáció védelem Ha nincs idempotency
// Quantity limit – jól látod
// . Admin stock edit


module.exports = router;
