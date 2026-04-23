
const { getItems, checkStock } = require("../db/orderDB");

const { isValidZip, isValidCity, isValidAddress, isValidPhone } = require("./profileValidator");
const { isValidEmail, isValidName } = require("./commonValidator");

function validateOrderPostSync(data) {
    if (!data.email || !data.phone || !data.zip || !data.city || !data.address || !data.name) return "Minden mező kitöltése kötelező!";
    
    if (data.email.length > 50) return "Az email túl hosszú!";
    if (!isValidEmail(data.email)) return "Az email formátuma nem megfelelő!";

    if (!isValidName(data.name)) return "A név nem megfelelő!";
    if (data.name.length > 50) return "A név túl hosszú!";
   
    const phoneError = isValidPhone(data.phone);
    if (phoneError) return phoneError;

    if (data.city.length < 3) return "A városnév csak is 3-50 karakterből állhat!";
    if (!isValidZip(data.zip)) return "Az irányítószám csak is szám lehet!";
    if (data.zip.length !== 4) return "Az irányítószámnak 4 karakterből kell állnia!";
    const cityError = isValidCity(data.city);
    if (cityError) return cityError;
    if (data.city.length > 50) return "A város neve túl hosszú!";

    const addressError = isValidAddress(data.address);
    if (addressError) return addressError;

    if (!Array.isArray(data.items) || data.items.length === 0) return "Hiányzó kosár tartalom.";
    
    return null;
}

async function prepareOrderItems(items) {
    const validItems = await getItems(items);

    const total_price = validItems.reduce((sum, item) => {
        return sum + item.price * item.quantity;
    }, 0 );

    await checkStock(validItems);

    return {
        validItems,
        total_price
    };
}

module.exports = {
    validateOrderPostSync,
    prepareOrderItems
}