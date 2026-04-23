
const { isEmailTaken } = require("../db/authDB")
const { isValidEmail, isValidName } = require("../validators/commonValidator");


function isValidPassword(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,100}$/;
    return regex.test(password);
}


function validateRegisterSync(data) {
    if (!data.email || !data.name || !data.password) return "Minden mező kitöltése kötelező!";
    if (data.name.length < 4) return "A név túl rövid!";
    if (data.name.length > 50) return "A név túl hosszú!";
    if (data.email.length > 50) return "Az email túl hosszú!";
    if (data.password.length > 50) return "A jelszó túl hosszú!";
    if (!isValidEmail(data.email)) return "Hibás email!";
    if (!isValidName(data.name)) return "A név nem megfelelő!";
    if (!isValidPassword(data.password)) return "A jelszónak tartalmaznia kell kis és nagy betűket, számokat és karaktereket!";

    return null;
}

async function validateRegisterAsync(data) {
    const taken = await isEmailTaken(data.email);

    if (taken) {
        return "Az email már létezik!";
    }
    return null;
}

module.exports = {
    isEmailTaken,
    isValidPassword,
    validateRegisterSync,
    validateRegisterAsync
};