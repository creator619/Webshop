const express = require("express");
const router = express.Router();

const authMiddleware = require("../Middleware/authMiddleware");
const adminMiddleware = require("../Middleware/adminMiddleware");
const rateLimit = require("express-rate-limit");

const adminLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 perc
    max: 5, // max 5 request
    message: { message:"Túl sok admin folyamatot hajtottál végre! Próbáld újra később!"}
});

const { serviceOrdersUpdate, serviceOrders, serviceOrdersDelete, serviceProductPost, serviceProductPut, serviceProductDelete, serviceCategoriesGet, serviceUsersGet, serviceUsersProfilesGet, serviceProductCategoriesGet, serviceCategoriesPost, serviceCategoriesUpdate, serviceCategoriesDeleteSync, serviceContactGet, serviceContactDeleteSync} = require("../service/adminService");
const { getProductCategories } = require("../db/adminDB");

router.get("/teszt", async (req, res) => {

    const result = await getProductCategories();
    res.json(result);
});


router.get("/orders/", authMiddleware, adminMiddleware, async (req, res) => {
    try {
    const result = await serviceOrders();
    res.json(result);
    } catch (err) {
        res.status(400).json({
            message: err.message
        });
    } 
});
// nincs használva
router.put("/orders/:id", authMiddleware, adminMiddleware,adminLimiter, async (req, res) =>{
    try {
        const result = await serviceOrdersUpdate(req.params, req.body, req.user);
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
// nincs használva
router.delete("/orders/:id", authMiddleware, adminMiddleware, adminLimiter, async (req, res) => {
    try {
        const result = await serviceOrdersDelete( req.params.id);
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

router.post("/product", authMiddleware, adminMiddleware, adminLimiter,async (req, res) => {
    try {
        const result = await serviceProductPost(req.body);
        res.json({
            success:true,
            data:result,
            message:"Termék hozzáadva!"
        });
    } catch (err) {
        res.status(400).json({
            message: err.message
        });
    }
});

router.put("/product/:id", authMiddleware, adminMiddleware, adminLimiter, async (req, res) => {
    try {
        const result = await serviceProductPut(req.body, req.params);
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

router.delete("/product/:id", authMiddleware, adminMiddleware, adminLimiter, async (req, res) => {
    try {
        const result = await serviceProductDelete(req.params);
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


router.get("/categories", authMiddleware, adminMiddleware,async (req,res) => {
    try {
        const result = await serviceCategoriesGet();
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

router.post("/categories", authMiddleware, adminMiddleware, adminLimiter, async (req, res) => {
    try {
        const result = await serviceCategoriesPost(req.body);
        res.json({
            success: true,
            data: result,
            message: "Kategória hozzáadva!"
        });
    } catch (err) {
        res.status(400).json({
            message: err.message
        });
    }
});

router.put("/categories/:id", authMiddleware, adminMiddleware, adminLimiter, async (req, res) => {
    try {
        const result = await serviceCategoriesUpdate(req.body, req.params);
        res.json({
            success:true,
            data: result,
            message: "Kategória frissítve!"
        });
    } catch (err) {
        res.status(400).json({
            message: err.message
        });
    }
});

router.delete("/categories/:id", authMiddleware, adminMiddleware, adminLimiter,  async (req, res) => {
    try {
        const result = await serviceCategoriesDeleteSync(req.params);
        res.json({
            success:true,
            data: result,
            message: "Kategória sikeresen törölve!"
        });
    } catch (err) {
        res.status(400).json({
            message: err.message
        });
    }
});


router.get("/contact", authMiddleware, adminMiddleware, async (req,res) => {
    try {
        const result = await serviceContactGet();
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

router.delete("/contact/:id", authMiddleware, adminMiddleware, adminLimiter, async (req, res) => {
    try {
        const result = await serviceContactDeleteSync(req.params);
        res.json({
            success:true,
            data: result,
            message: "Üzenet sikeresen törölve!"
        });
    } catch (err) {
        res.status(400).json({
            message: err.message
        });
    }
});


router.get("/users", authMiddleware, adminMiddleware, async (req,res) => {
    try {
        const result = await serviceUsersGet();
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

router.get("/profiles", authMiddleware, adminMiddleware, async (req,res) => {
    try {
        const result = await serviceUsersProfilesGet();
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

router.get("/product_categories", authMiddleware, adminMiddleware, async (req,res) => {
    try {
        const result = await serviceProductCategoriesGet();
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

