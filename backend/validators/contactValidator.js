const { isValidId, isValidDescription, isValidEmail, isValidName } = require("./commonValidator")

function validateContact(data) {
    if (!data.name ||!data.email || !data.id || !data.message) return "Töltse ki az összes mezőt!";
    
    if (!isValidName(data.name)) return "A név nem megfelelő!";
    if (!isValidEmail(data.email)) return "Az email formátuma nem megfelelő!";
    if (!isValidId(data.id)) return "Az azonosító nem megfelelő!"
    if (!isValidDescription(data.message)) return "A leírás nem megfelelő!";

    return null;
}

module.exports = {
    validateContact
}