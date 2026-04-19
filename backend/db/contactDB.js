const db = require("../db/database"); // SQLite connection

function addContact(params) {
    return new Promise((resolve, reject) => {
        db.run(`
        INSERT INTO contact (user_id, name, email, category_id, message)
        VALUES (?, ?, ?, ?, ?) 
        `, params, function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
        });
    });
}



module.exports = {
    addContact
}