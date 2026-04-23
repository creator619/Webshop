require('dotenv').config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const app = express();
const rateLimit = require("express-rate-limit");

const PORT = 3000;


const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 perc
    max: 50, // max 50 request
    message: { message:"Túl sok kérés, próbáld később!"}
});

const os = require("os");

function getLocalIP() {
    const interfaces = os.networkInterfaces();

    for (const name in interfaces) {
        for (const net of interfaces[name]) {
            if (net.family === "IPv4" && !net.internal) {
                return net.address;
            }
        }
    }

    return null;
}

const LOCAL_IP = getLocalIP();

console.log("IP:", LOCAL_IP);

app.get("/config", (req, res) => {
    res.json({
        ip: LOCAL_IP,
        port: 3000
    });
});

app.use(cors({
    origin: `http://${LOCAL_IP}:${PORT}` // frontend címe
}));
app.use(express.json());
app.use("/static", express.static(path.join(__dirname, "../frontend")));


app.use("/auth", limiter, require("./routes/auth"));
app.use("/products", limiter, require("./routes/products"));
app.use("/orders", limiter, require("./routes/orders"));
app.use("/contact", limiter, require("./routes/contact"));
app.use("/admin", limiter, require("./routes/admin"));
app.use("/images", express.static("./images"));
app.use("/", limiter, require("./routes/pages"))


if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET nincs beállítva!");
}

app.get("/:page", (req, res) => {
    const page = req.params.page;
    res.sendFile(path.join(__dirname, `../frontend/html/${page}`));
});

app.listen(PORT, LOCAL_IP, () => {
    console.log(`Server running on http://${LOCAL_IP}:${PORT}`);
});