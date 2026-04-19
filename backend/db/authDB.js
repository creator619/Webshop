const db = require("../db/database"); // SQLite connection

function postRegister(params) {
 return new Promise((resolve, reject) => {
    db.serialize(() => {
        db.run("BEGIN IMMEDIATE TRANSACTION", (err) => {
            if (err) return reject(err);
        });
        db.run(`
            INSERT INTO users
            (name, email, password, role)
            VALUES (?, ?, ?, ?)
        `,params,
        function(err) {
        if(err) {        
        db.run("ROLLBACK");
        return reject(err);
        }
        const userId = this.lastID;
        db.run(`
            INSERT INTO user_profiles (user_id)
            VALUES (?)
        `,[userId],
        function(err) {
            if(err) {
                db.run("ROLLBACK");
                return reject(err);
            }
            else {
                db.run("COMMIT", (err) => {
                    if (err) reject(err);
                    resolve(userId);
                });
            }
        });
    });
    });
 });
}

function isEmailTaken(email) {
    return new Promise((resolve, reject) => {
        db.get(
            "SELECT * FROM users WHERE email = ?",
            [email],
            (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(!!row); // true ha van, false ha nincs
                }
            }
        );
    });
}

function getUserByEmail(email) {
    return new Promise((resolve, reject) => {
        db.get(
            "SELECT * FROM users WHERE email = ?",
            [email], 
            (err, row) => {
                if (err) reject(err);
                else resolve(row);
            }
        );
    });
}

function getUserProfile(userId) {
    return new Promise((resolve, reject) => {
        db.get(`
            SELECT u.name, u.email, p.phone, p.zip, p.city, p.address
            FROM users u
            LEFT JOIN user_profiles p ON u.id = p.user_id
            WHERE u.id = ?    
            `, [userId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
        });
    });
}


function updateUserName(data) {
    return new Promise((resolve, reject) => {
        db.run(`
            UPDATE users
            SET name = ?
            WHERE id = ?
            `,
            [data.name, data.userId], 
            function (err) {
                if (err) reject(err);
                else resolve(this.changes);
            }
        );
    });
}

function updateUserProfile(data) {
    return new Promise((resolve, reject) => {
        db.run(`
            INSERT INTO user_profiles (user_id, phone, zip, city, address)
            VALUES(?, ?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                phone = excluded.phone,
                zip = excluded.zip,
                city = excluded.city,
                address = excluded.address
            WHERE
                phone IS NOT excluded.phone OR
                zip IS NOT excluded.zip OR
                city IS NOT excluded.city OR
                address IS NOT excluded.address
            `,[data.userId, data.phone, data.zip, data.city, data.address], 
            function (err) {
            if (err) reject(err)
            else resolve(this.changes)
            } 
        );
    });
}

module.exports = {postRegister, isEmailTaken, getUserByEmail, getUserProfile, updateUserName, updateUserProfile};