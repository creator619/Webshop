const { isValidId, isValidMessage, isValidEmail, isValidName } = require("./commonValidator")

function validateContact(data) {
    if (!data.name ||!data.email || !data.id || !data.message) return "Töltse ki az összes mezőt!";
    
    if (!isValidName(data.name)) return "A név nem megfelelő!";
    if (data.name.length < 4) return "A név túl rövid!";
    if (data.name.length > 50) return "A név túl hosszú!";
    
    if (!isValidEmail(data.email)) return "Az email formátuma nem megfelelő!";
     if (data.email.length > 50) return "Az email túl hosszú!";

    if (!isValidId(data.id)) return "Az azonosító nem megfelelő!"

    const messageError = isValidMessage(data.message);
    if (messageError) return messageError;

    return null;
}

module.exports = {
    validateContact
}