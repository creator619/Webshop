
const { getItems, checkStock } = require("../db/orderDB");

const { isValidZip, isValidCity, isValidAddress, isValidPhone } = require("./profileValidator");
const { isValidEmail, isValidName } = require("./commonValidator");

function validateOrderPostSync(data) {
    if (!data.email || !data.phone || !data.zip || !data.city || !data.address || !data.name) return "Minden mező kitöltése kötelező!";
    
    if (!isValidEmail(data.email)) return "Az email formátuma nem megfelelő!";

    if (!isValidName(data.name)) return "A név nem megfelelő!";
    if (data.name.length > 100) return "A név túl hosszú!";
   
    if (!isValidPhone(data.phone)) return "Nem megfelelő telefonszám!";
    if (!isValidZip(data.zip)) return "Az irányítószám csak is szám lehet!";
    if (data.zip.length !== 4) return "Az irányítószámnak 4 karakterből kell állnia!";
    if (!isValidCity(data.city)) return "A város nem tartalmazhat számokat/karaktereket!";
    if (data.city.length > 50) return "A város neve túl hosszú!";
    if(!isValidAddress(data.address)) return "A cím formátuma nem megfelelő!";
    if (data.address.length > 100) return "A cím túl hosszú!";
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