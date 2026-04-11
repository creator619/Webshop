const express = require("express");
const router = express.Router();
const db = require("../db/database"); // SQLite connection
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");

const authMiddleware = require("../Middleware/authMiddleware");
const optionalAuth = require("../Middleware/optionalAuth")

router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../../frontend/html/index.html"));
});


router.get("/register", optionalAuth, (req, res) => {

    if (req.user) {
        console.log(req.user);
        return res.redirect("/");
    }

    res.sendFile(path.join(__dirname, "../../frontend/html/register.html"));
});


router.get("/login", optionalAuth, (req, res) => {

    if (req.user) {
        return res.redirect("/");
    }

    res.sendFile(path.join(__dirname, "../../frontend/html/login.html"));
});

router.get("/cart", (req, res) => {

    res.sendFile(path.join(__dirname, "../../frontend/html/cart.html"));
});

router.get("/contact", (req, res) => {

    res.sendFile(path.join(__dirname, "../../frontend/html/contact.html"));
});


router.get("/admin", optionalAuth, (req, res) => {

    if (req.user) {
        return res.redirect("/");
    }

    res.sendFile(path.join(__dirname, "../../frontend/html/admin.html"));
});

router.get("/checkout", (req, res) => {
    res.sendFile(path.join(__dirname, "../../frontend/html/checkout.html"));
});

router.get("/product", (req, res) => {
    res.sendFile(path.join(__dirname, "../../frontend/html/product.html"));
});

router.get("/profile", optionalAuth, (req, res) => {

    if (req.user) { 
        return res.redirect("/");
    }

    res.sendFile(path.join(__dirname, "../../frontend/html/profile.html"));
});

router.get("/wishlist", optionalAuth, (req, res) => {

    if (req.user) { 
        return res.redirect("/");
    }

    res.sendFile(path.join(__dirname, "../../frontend/html/wishlist.html"));
});


router.get("/order-success", (req, res) => {

    res.sendFile(path.join(__dirname, "../../frontend/html/order-success.html"));
});



module.exports = router;