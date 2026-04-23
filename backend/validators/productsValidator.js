const { isValidId } = require("../validators/commonValidator");


function validateProductGetId(data) {

    if(!isValidId(data.id)) return "Az azonosító nem megfelelő!";

    return null;
}

module.exports = { validateProductGetId };