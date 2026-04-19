const express = require("express");
const router = express.Router();

const optionalAuth = require("../Middleware/optionalAuth");

const { serviceContact } = require("../service/contactService");

router.post("/", optionalAuth, async (req, res) => {
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

