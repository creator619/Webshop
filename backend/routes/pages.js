const express = require("express");
const router = express.Router();
const db = require("../db/database"); // SQLite connection
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");


router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../../frontend/html/index.html"));
});


router.get("/register", (req, res) => {

    res.sendFile(path.join(__dirname, "../../frontend/html/register.html"));
});


router.get("/login", (req, res) => {

    res.sendFile(path.join(__dirname, "../../frontend/html/login.html"));
});

router.get("/cart", (req, res) => {

    res.sendFile(path.join(__dirname, "../../frontend/html/cart.html"));
});

router.get("/contact", (req, res) => {

    res.sendFile(path.join(__dirname, "../../frontend/html/contact.html"));
});


router.get("/admin", (req, res) => {

    res.sendFile(path.join(__dirname, "../../frontend/html/admin.html"));
});

router.get("/checkout", (req, res) => {
    res.sendFile(path.join(__dirname, "../../frontend/html/checkout.html"));
});

router.get("/product", (req, res) => {
    res.sendFile(path.join(__dirname, "../../frontend/html/product.html"));
});

router.get("/profile", (req, res) => {


    res.sendFile(path.join(__dirname, "../../frontend/html/profile.html"));
});

router.get("/wishlist", (req, res) => {

    res.sendFile(path.join(__dirname, "../../frontend/html/wishlist.html"));
});


router.get("/order-success", (req, res) => {

    res.sendFile(path.join(__dirname, "../../frontend/html/order-success.html"));
});



module.exports = router;