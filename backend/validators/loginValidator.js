
const bcrypt = require("bcrypt");
const { getUserByEmail } = require("../db/authDB")

async function validateLoginAsync(data) {
    const user = await getUserByEmail(data.email);

    if (!user) return "Hibás email vagy jelszó!";

    const match = await bcrypt.compare(data.password, user.password);
    if (!match) return "Hibás email vagy jelszó!";

    return null;
}

function validateLogin(data) {
    if (!data.email || !data.password) return "Minden mező kitöltése kötelező!";
    if (data.email.length > 100 || data.password.length > 100) return "Hibás email vagy jelszó!";

    return null;
}


module.exports = { validateLoginAsync, validateLogin};
