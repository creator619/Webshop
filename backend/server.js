const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// Statikus fájlok kiszolgálása (pl. képek a frontend mappából, ha szükséges, de itt frontend külön van)
// Mivel a frontend a gyökérben van és a backend külön, most csak az API-t csináljuk.

// Routes
app.use("/auth", require("./routes/auth"));
app.use("/products", require("./routes/products"));
app.use("/orders", require("./routes/orders"));
app.use("/admin", require("./routes/admin"));


app.get("/", (req, res) => {
    res.send("Backend működik SQLite adatbázissal!");
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
