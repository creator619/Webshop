const express = require("express");
const cors = require("cors");
const app = express();
const rateLimit = require("express-rate-limit");

const PORT = 3000;
const HOST = "192.168.0.164";  // a géped IP címe a hálózaton

const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 perc
    max: 50, // max 50 request
    message: "Túl sok kérés, próbáld később"
});

app.use(cors({
    origin: "http://" + HOST + PORT // frontend címe
}));
app.use(express.json());
app.use(express.static("../frontend"));

// Statikus fájlok kiszolgálása (pl. képek a frontend mappából, ha szükséges, de itt frontend külön van)
// Mivel a frontend a gyökérben van és a backend külön, most csak az API-t csináljuk.

// CORS policy Megmondja, hogy ki híchatja a backendet böngészőből

//app.use(cors({ origin: "http://localhost3000", 'frontend címe }));    

// Routes

app.use((req, res, next) => {
    const ip = req.ip;

    if (ip.startsWith("::fffff:")) {
        ip = ip.replace("::ffff:", "");
    }
    
    if (ip.startsWith("192.168.") || ip === ":1") {
        next();
    } else {
        res.status(403).send("Tiltott hozzáférés");
    }
});

app.use("/auth", limiter, require("./routes/auth"));
app.use("/products", limiter, require("./routes/products"));
app.use("/orders", limiter, require("./routes/orders"));
app.use("/admin", require("./routes/admin"));
//A képfájlokat a backend statikus kiszolgálással (Express static middleware) szolgálja ki, az adatbázis csak a fáljnevet tárolja
app.use("/images", express.static("./images"));



//app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
});