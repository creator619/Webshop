
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

function isValidImage(image) {
    const regex = /^(?=.{5,}$)[a-zA-Z0-9_]+\.(jpg|jpeg|png)$/
    return regex.test(image);
}

function isValidDescription(description) {
   if (typeof description !== "string") return false;
   if (description.length < 5 || description.length > 1000) return false;
   
   return true;
}

function isValidEmail(email) {
    //const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const regex = /^[A-Za-z0-9._+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return regex.test(email);
}


function isValidName(name) {
    const regex = /^[A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű\s]+$/;
    return regex.test(name);
}

module.exports = { isValidStatus, isValidTotalPrice, isValidId, isValidImage, isValidDescription, isValidEmail, isValidName};