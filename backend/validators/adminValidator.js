const { isValidEmail } = require("./registerValidator");


function isValidDatum(datum) {
    const regex = /^\d{4}\.\d{2}\.\d{2}\.$/;
    if (!regex.test(datum)) return "ez fut le";
    const [year, month, day] = datum.split('.').slice(0,3).map(Number);
    const date = new Date(year,month - 1, day);
    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
}

function isValidStatus(status) {
    return typeof status === "string" && status.length > 0 && status.length <= 100;
}
function isValidTotalPrice(total_price) {
    const num = Number(total_price)
    return Number.isInteger(num) && num > 0 && num <= 10000000;
}

function isValidId(id) {
    const num = Number(id);
    return Number.isInteger(num) && num > 0;
}

function validateOrderEditsSync(data) {
    if (!isValidEmail(data.email)) return "Az email formátuma nem megfelelő!";
    if (data.email.length > 100) return "Az email túl hosszú!";

    if (!isValidTotalPrice(data.total_price)) return "Az összeg értéke csak is szám lehet!";

    if(!isValidStatus(data.status)) return "Státusz formátuma és mérete nem megfelelő!";

    if (!isValidId(data.id)) return "Az azonosító nem megfelelő!";

    return null;
}



module.exports = {
    isValidStatus,
    isValidTotalPrice,
    validateOrderEditsSync

}