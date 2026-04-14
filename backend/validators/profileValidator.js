const db = require("../db/database");
const { isValidName } = require("./registerValidator");

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


function isValidPhone(phone) {
    const regex = /^\+?\d{6,15}$/;
    return regex.test(phone);
}
function isValidZip(zip) {
    const regex = /^[\d]+$/;
    return regex.test(zip);
}
function isValidCity(city) {
    const regex = /^[A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű\s]{4,}$/;
    return regex.test(city);
}

function isValidAddress(address) {
    const regex = /^[A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű\s\d._,-]{4,}$/;
    return regex.test(address);
}

function isValidProfileSync(data) {
    if (!data.phone || !data.zip || !data.city || !data.address || !data.name) return "Minden mező kitöltése kötelező!";
    if (!isValidPhone(data.phone)) return "Nem megfelelő telefonszám!";
    if (!isValidZip(data.zip)) return "Az irányítószám csak is szám lehet!";
    if (data.zip.length !== 4) return "Az irányítószámnak 4 karakterből kell állnia!";
    if (!isValidCity(data.city)) return "A város nem tartalmazhat számokat/karaktereket!";
    if (data.city.length > 50) return "A város neve túl hosszú!";
    if(!isValidAddress(data.address)) return "A cím formátuma nem megfelelő!";
    if (data.address.length > 100) return "A cím túl hosszú!";
    if(!isValidName(data.name)) return "A név nem megfelelő!";
    if (data.name.length > 100) return "A név túl hosszú!";

    return null;
}

async function updateProfile(data) {
    const updatedName = await updateUserName(data);
    const updatedProfile = await updateUserProfile(data);

    if (updatedName === 0) {
        return "Felhasználó nem található";
    }

    if (updatedProfile === 0) {
        return "Felhasználó nem található";
    }
    return null;
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




module.exports = {
    getUserProfile,
    isValidPhone,
    isValidZip,
    isValidCity,
    isValidAddress,
    isValidProfileSync,
    updateProfile,
    updateUserName,
    updateUserProfile
}