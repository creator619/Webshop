const db = require("../db/database");

function getProducts() {
    return new Promise((resolve, reject) => {
        db.all(`
        SELECT p.*, ps.size, ps.stock as size_stock 
        FROM products p
        LEFT JOIN product_stock ps ON p.id = ps.product_id    
        `,[], 
        function(err, rows) {
            if(err) reject(err);
            else resolve(rows);
        });
    });
}


function getProductsId(id) {
    return new Promise((resolve, reject) => {
       db.all(`
        SELECT p.*, ps.size, ps.stock as size_stock 
        FROM products p
        LEFT JOIN product_stock ps ON p.id = ps.product_id
        WHERE p.id = ?
        `,[id], 
        function (err, rows) {
            if(err) reject(err);
            else resolve(rows);
        });
    });
}
module.exports = { getProducts, getProductsId};