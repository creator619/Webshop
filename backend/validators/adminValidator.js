
const { isValidProfileSync } = require("./profileValidator");
const { isValidStatus, isValidTotalPrice, isValidId, isValidImage, isValidDescription, isValidEmail, isValidName} = require("./commonValidator");


function validateOrderEditsSync(data) {
    if (!isValidEmail(data.email)) return "Az email formátuma nem megfelelő!";
    if (data.email.length > 100) return "Az email túl hosszú!";

    if (!isValidTotalPrice(data.total_price)) return "Az összeg értéke csak is szám lehet!";

    if(!isValidStatus(data.status)) return "Státusz formátuma és mérete nem megfelelő!";

    if (!isValidId(data.id)) return "Az azonosító nem megfelelő!";

    const shipping = isValidProfileSync(data);
    if (shipping) {
        return shipping;
    }
    return null;
}

function isValidStock(size_stocks, allowedSizes) {
    if (typeof size_stocks !== "object" || size_stocks === null) return false;

    for (const [size, value] of Object.entries(size_stocks)) {
        if (!allowedSizes.includes(size)) return false;
        if (!Number.isInteger(value) || value < 0) return false;
    }
    return true;
}

function validateProductPostSync(data, porductId) {
    if (!data.name) return "A név megadása kötelező!";
    if (!data.image) return "A kép megadása kötelező!";
    if (!data.description) return "A leírás megadása kötelező!";

    if (!isValidName(data.name)) return "A név nem megfelelő!";
    if (data.name.length > 100) return "A megadott név túl hosszú!";
    if (!isValidTotalPrice(data.total_price)) return "Az összeg értéke csak is szám lehet!";
    if (!isValidImage(data.image)) return "A kép fájlneve nem megfelelő!";
    if (data.image.length > 100) return "A kép fájlneve túl hosszú!";
    if (!isValidId(data.id)) return "Az azonosító nem megfelelő!";
    if (!isValidId(porductId)) return "Az azonosító nem megfelelő!";
    if (!isValidDescription(data.description)) return "A leírás nem megfelelő!";

    if (!isValidStock(data.size_stocks, data.allowedSizes)) return "A méretek nem megfelelőek!";
  

    return null;
}

function validateProductDeleteSync(data) {
    if (!isValidId(data.id)) return "Az azonosító nem megfelelő!";

    return null;
}

function validateCategoriesPostSync(data) {
    if (!isValidName(data.name)) return "A név nem megfelelő!";

    return null;
}

function validateCategoriesUpdateSync(data) {
    if (!isValidName(data.name)) return "A név nem megfelelő!";
    if (!isValidId(data.id)) return "Az azonosító nem megfelelő!";
    return null;
}

function validateCategoriesDeleteSync(data) {
    if (!isValidId(data.id)) return "Az azonosító nem megfelelő!";

    return null;
}

function validateContactDeleteSync(data) {
    if (!isValidId(data.id)) return "Az azonosító nem megfelelő!";

    return null;
}

module.exports = {
    validateOrderEditsSync,
    validateProductPostSync,
    validateProductDeleteSync,
    validateCategoriesPostSync,
    validateCategoriesUpdateSync,
    validateCategoriesDeleteSync,
    validateContactDeleteSync
}