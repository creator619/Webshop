const db = require("../db/database");


// db-be saját mappába
function getOrders() {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT * FROM orders
        `, [],
        (err, orders) => {
            if (err) reject(err);
            else resolve(orders);
        });
    });
}
// db-be saját mappába
function getOrderItems() {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT * FROM order_items
        `, [],
        (err, items) => {
            if (err) reject(err);
            else resolve(items);
        });
    });
}

function updateOrders(data) {
    return new Promise((resolve, reject) => {
       db.run(
            data.sql, 
            data.params, 
            function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            }
       );
    });
}


module.exports = { 
    updateOrders, 
    getOrderItems,
    getOrders


};