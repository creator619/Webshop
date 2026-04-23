const db = require("../db/database");
const { isValidName } = require("./commonValidator");

const {updateUserName, updateUserProfile}  = require("../db/authDB")




function isValidPhone(phone) {
    const regex = /^\+?\d+$/;
    if (!regex.test(phone)) return `A telefonszám csak számokat és "+" jelet tartalmazhat!`;

    if (!phone.startsWith('06') && !phone.startsWith("+36")) return "A telefonszámnak +36-tal vagy 06-tal kell kezdődnie!";
    if (phone.length < 10 || phone.length > 12) return "A telefonszám hossza nem megfelelő! (10-12 karakter)!";
    
    return null;
}
function isValidZip(zip) {
    const regex = /^[\d]+$/;
    return regex.test(zip);
}
function isValidCity(city) {
    const regex = /^[A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű\s]{2,}$/;
    
    if (!regex.test(city)) return "A város nem tartalmazhat számokat/karaktereket!";

    if (city.includes("  ")) return "A város nem tartalmazhat dupla szóközt!";

    
    return null;
}

function isValidAddress(address) {
    const regex = /^[A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű\s\d._,-]{3,}$/;
    if (!regex.test(address)) return "A cím csak betükből, számokból és [._,-]-karakterekből állhat!";

    if (address.includes("..") || address.includes("__") || address.includes(",,") || address.includes("--")) return "Különleges karakter csakis önállóan használható!";

    if (address.length < 4) return "A cím túl rövid!";
    if (address.length > 50) return "A cím túl hosszú!";

    return null;
}

function isValidProfileSync(data) {
    if (!data.phone || !data.zip || !data.city || !data.address || !data.name) return "Minden mező kitöltése kötelező!";
    if (data.name.length < 4) return "A névnek minimum 4 karakterből kell állnia!";
    if(!isValidName(data.name)) return "A név csak is betűkből állhat!";
    if (data.name.includes("  ")) return "A név nem tartalmazhat dupla szóközt!";
    if (data.name.length > 50) return "A név túl hosszú!";
    const phoneError = isValidPhone(data.phone);
    if (phoneError) return phoneError;
    if (!isValidZip(data.zip)) return "Az irányítószám csak is szám lehet!";
    if (data.zip.length !== 4) return "Az irányítószámnak 4 karakterből kell állnia!";
    if (data.city.length < 3) return "A városnév csak is 3-50 karakterből állhat!";
    const cityError = isValidCity(data.city);
    if (cityError) return cityError;
    if (data.city.length > 50) return "A város neve túl hosszú!";
    
    const addressError = isValidAddress(data.address);
    if (addressError) return addressError;



    return null;
}

async function updateProfile(data) {
    const updatedName = await updateUserName(data);
    const updatedProfile = await updateUserProfile(data);

    if (updatedName === 0) {
        return "Felhasználó nem található";
    }

    if (updatedProfile === 0) {
        return "Felhasználó nem található";
    }
    return null;
}



module.exports = {
    isValidPhone,
    isValidZip,
    isValidCity,
    isValidAddress,
    isValidProfileSync,
    updateProfile,
}