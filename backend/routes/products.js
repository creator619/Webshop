const express = require("express");
const router = express.Router();

const { serviceProductGet, serviceProductGetId} = require("../service/productsService");
const { isValidId } = require("../validators/commonValidator");


router.get("/", async (req, res) => {
    try {
        const result = await serviceProductGet();
        res.json(result);
    } catch (err) {
        res.status(400).json({
            err: err.message
        });   
    }
});

router.get("/:id", async (req, res) => {
    try {
        const result = await serviceProductGetId(req.params);
        res.json(result);
    } catch (err) {
        res.status(400).json({
            err: err.message
        });   
    }
});

module.exports = router;
