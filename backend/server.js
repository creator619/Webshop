const express = require("express");
const cors = require("cors");
const app = express();
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 perc
    max: 50, // max 50 request
    message: "Túl sok kérés, próbáld később"
});

app.use(cors());
app.use(express.json());

// Statikus fájlok kiszolgálása (pl. képek a frontend mappából, ha szükséges, de itt frontend külön van)
// Mivel a frontend a gyökérben van és a backend külön, most csak az API-t csináljuk.

// CORS policy Megmondja, hogy ki híchatja a backendet böngészőből

//app.use(cors({ origin: "http://localhost3000", 'frontend címe }));    

// Routes
app.use("/auth", require("./routes/auth"), limiter);
app.use("/products", require("./routes/products"), limiter);
app.use("/orders", require("./routes/orders"), limiter);
app.use("/admin", require("./routes/admin"));
//A képfájlokat a backend statikus kiszolgálással (Express static middleware) szolgálja ki, az adatbázis csak a fáljnevet tárolja
app.use("/images", express.static("./images"));


app.get("/", (req, res) => {
    res.send("Backend működik SQLite adatbázissal!");
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
