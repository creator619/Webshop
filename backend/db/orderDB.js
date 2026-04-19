const db = require("../db/database");

function saveOrder({user_id, email, total_price, name, phone, address, city, zip, validItems}) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.exec("BEGIN TRANSACTION");

            db.run(
                `INSERT INTO orders (user_id, user_email, total_price, shipping_name, shipping_phone, shipping_address, shipping_city, shipping_zip)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [user_id, email, total_price, name, phone, address, city, zip],
                function (err) {
                    if (err) {
                        db.exec("ROLLBACK");
                        return reject(err);
                    }

                    const orderId = this.lastID;

                    const itemStmt = db.prepare(`
                        INSERT INTO order_items (order_id, product_name, price, quantity, size)
                        VALUES (?, ?, ?, ?, ?)
                    `);

                    const stockStmt = db.prepare(`
                        UPDATE product_stock
                        SET stock = stock - ?
                        WHERE product_id = ? AND size = ?
                    `);

                    for (const item of validItems) {
                        itemStmt.run(orderId, item.name, item.price, item.quantity, item.size);
                        stockStmt.run(item.quantity, item.id, item.size);
                    }

                    itemStmt.finalize();
                    stockStmt.finalize();

                    db.exec("COMMIT", (err) => {
                        if (err) {
                            db.exec("ROLLBACK");
                            return reject(err);
                        }

                        resolve(orderId);
                    });
                }
            );
        });
    });
}

function getItems(items) {
    const promises = items.map(item => {
        return new Promise((resolve, reject) => {
            const qty = item.quantity || 1;

            db.get(
                `SELECT name, price FROM products WHERE id = ?`,
                [item.id],
                (err, row) => {
                    if (err) return reject(new Error("DB hiba"));
                    if (!row) return reject(new Error(`Nincs ilyen termék: ${item.id}`));

                    resolve({
                        id: item.id,
                        size: item.size,
                        quantity: qty,
                        name: row.name,
                        price: row.price
                    });
                }
            );
        });
    });

    return Promise.all(promises);
}

function checkStock(validItems) {
    const promises = validItems.map(item => {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT stock FROM product_stock WHERE product_id = ? AND size = ?`,
                [item.id, item.size],
                (err, row) => {
                    if (err) return reject(new Error("DB hiba stock"));

                    if (!row) {
                        return reject(new Error(`${item.name} (${item.size}) nem létezik`));
                    }

                    if (row.stock < item.quantity) {
                        return reject(new Error(
                            `Nincs elég készlet: ${item.name}`
                        ));
                    }

                    resolve();
                }
            );
        });
    });

    return Promise.all(promises);
}

function getIdempotencyKey(key) {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT order_id
             FROM idempotency_keys
             WHERE key_value = ?`,
            [key],
            (err, row) => {
                if (err) return reject(err);
                resolve(row || null);
            }
        );
    });
}

function saveIdempotencyKey(key, orderId) {
    return new Promise((resolve, reject) => {

        db.run(
            `INSERT INTO idempotency_keys
             (key_value, order_id)
             VALUES (?, ?)`,
            [key, orderId],
            function(err) {

                if (err) return reject(err);

                resolve(true);
            }
        );

    });
}

function getOrdersMy(id) {
    return new Promise((resolve, reject ) => {
        db.all(`
            SELECT * FROM orders
            WHERE user_id = ?
        `, [id], function(err, rows) {
            if(err) reject(err);
            return resolve(rows)
        });
    });
}

function getOrders(email) {
    return new Promise((resolve, reject ) => {
        db.all(`
            SELECT * FROM orders
            WHERE user_email = ?
        `, [email], function(err, rows) {
            if(err) reject(err);
            return resolve(rows)
        });
    });
}

module.exports = {
    getItems,
    checkStock,
    saveOrder,
    getIdempotencyKey,
    saveIdempotencyKey,
    getOrdersMy,
    getOrders
}