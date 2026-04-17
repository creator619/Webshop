const db = require("../db/database");

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

function deleteOrder(id) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run("BEGIN TRANSACTION");
            db.run(
                "DELETE FROM order_items WHERE order_id = ?",
                [id],
                function(err) {
                    if (err) {
                        db.run("ROLLBACK");
                        return reject(err);
                    }
                }
            );
            db.run(
                "DELETE FROM orders WHERE id = ?",
                [id],
                function (err) {
                    if (err) {
                        db.run("ROLLBACK");
                        return reject(err);
                    }
                    if (this.changes === 0) {
                        db.run("ROLLBACK");
                        return resolve(0);
                    }
                    db.run("COMMIT", (err) => {
                        if (err) return reject(err);
                        resolve(this.changes);
                    });
                }
            );
        });
    });
}

function addProductWithStocks(params, size_stock) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run("BEGIN TRANSACTION");
            db.run(`
                INSERT INTO products 
                (name, price, image, category_id, description, sizes, stock)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                `, params, function(err) {
                if (err) {
                    db.run("ROLLBACK");
                    return reject(err);
                }

                const productId = this.lastID;

                const entries = Object.entries(size_stock);

                let done = 0;

                for (const [size, stock] of entries) {

                    db. run(`
                        INSERT INTO product_stock
                        (product_id, size, stock)
                        VALUES (?,?,?)
                        `, [productId, size, stock], function(err) {

                            if (err) {
                                db.run("ROLLBACK");
                                return reject(err);
                            }
                            done++;

                            if (done === entries.length) {
                                db.run("COMMIT", (err) => {
                                    if (err) reject(err);

                                    resolve(productId);
                                });
                            }
                        });
                }
            });
        });
    });
}

function updateProductWithStocks(params, size_stock, productId) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
        
            db.run("BEGIN TRANSACTION");

            db.run(`
                UPDATE products
                SET name=?, price=?, image=?, category_id=?, description=?, stock=?
                WHERE id=?
            `, [...params, productId], function(err) {

                if (err) {
                    db.run("ROLLBACK");
                    return reject(err);
                }

                db.run(`
                    DELETE FROM product_stock
                    WHERE product_id = ?
                `, [productId], function(err) {

                    if (err) {
                        db.run("ROLLBACK");
                        return reject(err);
                    }

                    const entries = Object.entries(size_stock);

                    let done = 0;

                    if (entries.length === 0) {
                        db.run("COMMIT");
                        return resolve(productId);
                    }

                    for (const [size, stock] of entries) {

                        db.run(`
                            INSERT INTO product_stock (product_id, size, stock)
                            VALUES (?, ?, ?)
                        `, [productId, size, stock], function(err) {

                            if (err) {
                                db.run("ROLLBACK");
                                return reject(err);
                            }

                            done++;
                            
                            if (done === entries.length) {
                                db.run("COMMIT", function(err) {
                                    if (err) return reject(err);
                                    
                                    resolve(productId);
                                });
                            }
                        });
                    }
                });
            });
        });
    });
}

function getProductCategories() {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT * FROM product_categories
        `, [],
        (err, orders) => {
            if (err) reject(err);
            else resolve(orders);
        });
    });
}

function deleteProduct(id) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run("BEGIN TRANSACTION");
            db.run(
                "DELETE FROM product_stock WHERE product_id = ?",
                [id],
                function(err) {
                    if (err) {
                        db.run("ROLLBACK");
                        return reject(err);
                    }
                }
            );
            db.run(
                "DELETE FROM products WHERE id = ?",
                [id],
                function (err) {
                    if (err) {
                        db.run("ROLLBACK");
                        return reject(err);
                    }
                    if (this.changes === 0) {
                        db.run("ROLLBACK");
                        return resolve(0);
                    }
                    db.run("COMMIT", (err) => {
                        if (err) return reject(err);
                        resolve(this.changes);
                    });
                }
            );
        });
    });
}

function getCategories() {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM category", 
            [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
       });
    });    
}

function getUsers() {
   return new Promise((resolve, reject) => {
        db.all("SELECT * FROM users", 
            [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
       });
    });    
}

function getUserProfiles() {
   return new Promise((resolve, reject) => {
        db.all("SELECT * FROM user_profiles", 
            [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
       });
    });    
}

function addCategories(params) {
    return new Promise((resolve, reject) => {
        db.run(`
            INSERT INTO category 
            (name)
            VALUES (?)
            `, params, function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
       });
    });    
}

function updateCategories(params, id) {
    return new Promise((resolve, reject) => {
        db.run(`
            UPDATE category
            SET name = ?
            WHERE id = ?
            `, [...params, id], function(err) {
            if (err) reject(err);
            else resolve(this.changes);
       });
    });    
} 

function deleteCategories(id) {
    return new Promise((resolve, reject) => {
        db.run(`
            DELETE FROM category
            WHERE id = ?
            `, [id], function (err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
    });
}

function getContact() {
   return new Promise((resolve, reject) => {
        db.all("SELECT * FROM contact", 
            [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
       });
    });    
}

function deleteContact(id) {
    return new Promise((resolve, reject) => {
        db.run(`
            DELETE FROM contact
            WHERE id = ?
            `, [id], function (err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
    });
}

module.exports = { 
    updateOrders, 
    getOrderItems,
    getOrders,
    deleteOrder,
    getProductCategories,
    addProductWithStocks,
    updateProductWithStocks,
    deleteProduct,
    getCategories,
    getUsers,
    getUserProfiles,
    addCategories,
    updateCategories,
    deleteCategories,
    getContact,
    deleteContact
};