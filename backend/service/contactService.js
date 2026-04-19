const { validateContact } = require("../validators/contactValidator");
const { addContact } =require("../db/contactDB");


async function serviceContact(userData, { name, email, category_id, message }) {
    let userId = null;

    if (userData) {
        userId = userData.id;
    } 
    const validationData = {name, email, id: category_id, message}

    const synnError = validateContact(validationData);
    if (synnError) {
        throw new Error(synnError);
    }
    const params = [userId, name, email, category_id, message]
    const result = await addContact(params);
    
    return result;
}


module.exports = {
    serviceContact
}