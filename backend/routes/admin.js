const express = require("express");
const router = express.Router();

const authMiddleware = require("../Middleware/authMiddleware");
const adminMiddleware = require("../Middleware/adminMiddleware");

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
router.put("/orders/:id", authMiddleware, adminMiddleware, async (req, res) =>{
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
router.delete("/orders/:id", async (req, res) => {
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

router.post("/product", authMiddleware, adminMiddleware, async (req, res) => {
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

router.put("/product/:id", async (req, res) => {
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

router.delete("/product/:id", async (req, res) => {
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

// nincs használva
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
// nincs használva
router.post("/categories", authMiddleware, adminMiddleware, async (req, res) => {
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
// nincs használva
router.put("/categories/:id", async (req, res) => {
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
// nincs használva
router.delete("/categories/:id", async (req, res) => {
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


router.get("/contact",async (req,res) => {
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

router.delete("/contact/:id", async (req, res) => {
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

// nincs használva
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
// nincs használva
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
// nincs használva
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

