const db = require("../db/database");

function isValidEmail(email) {
    //const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const regex = /^[A-Za-z0-9._+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return regex.test(email);
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
function isValidPassword(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,100}$/;
    return regex.test(password);
}

function isValidName(name) {
    const regex = /^[A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű\s]+$/;
    return regex.test(name);
}


function validateRegisterSync(data) {
    if (!data.email || !data.name || !data.password) return "Minden mező kitöltése kötelező!";
    if (data.name.length < 4) return "A név túl rövid!";
    if (data.name.length > 100) return "A név túl hosszú!";
    if (data.email.length > 100) return "Az email túl hosszú!";
    if (data.password.length > 100) return "A jelszó túl hosszú!";
    if (!isValidEmail(data.email)) return "Hibás email";
    if (!isValidName(data.name)) return "A név nem megfelelő!";
    if (!isValidPassword(data.password)) return "A jelszónak tartalmaznia kell kis és nagy betűket, számokat és karaktereket!";

    return null;
}

async function validateRegisterAsync(data) {
    const taken = await isEmailTaken(data.email);

    if (taken) {
        return "Az email már létezik";
    }
    return null;
}

module.exports = {
    isValidEmail,
    isEmailTaken,
    isValidPassword,
    isValidName,
    validateRegisterSync,
    validateRegisterAsync
};