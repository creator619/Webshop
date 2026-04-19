const {validateRegisterSync, validateRegisterAsync} = require("../validators/registerValidator");
const {validateLoginAsync, validateLogin} = require("../validators/loignValidator");
const { isValidProfileSync, updateProfile} = require("../validators/profileValidator");
const { postRegister, getUserByEmail, getUserProfile} = require("../db/authDB");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


async function serviceRegisterPost({name, email, password}) {

    const syncError = validateRegisterSync({ name, email, password });
    if (syncError) {
        throw new Error(syncError);
        
    }
    const asyncError = await validateRegisterAsync({ name, email, password });
    if (asyncError) {
        throw new Error(asyncError);
    }
    const hashed = await bcrypt.hash(password, 10);

    const params = [name, email, hashed, "user"];
   
    const result = await postRegister(params);

    return result;
}

async function serviceLogin({email, password}) {
    const validationData = {email, password}
    const syncError = validateLogin(validationData);
    if (syncError) {
       throw new Error(syncError);
    }
    const asyncError = await validateLoginAsync(validationData);
    if (asyncError) {

        throw new Error(asyncError);
    }
    const user = await getUserByEmail(email);
    const token = jwt.sign(
        { 
            id: user.id, 
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
    );
   return {
        message: "Sikeres bejelentkezés!",
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    };
}

async function serviceProfileGet(data) {
    const userId = data.id;
    const profile = await getUserProfile(userId);

    return profile;
}

async function serviceProfilePut(userData, {phone, zip, city, address, name}) {
    const userId = userData.id;
    const validationData = { phone, zip, city, address, name};
    const syncError = await isValidProfileSync(validationData);
    if (syncError) {
        throw new Error(syncError);
    }
    const profileChanges = await updateProfile({phone, zip, city, address, name, userId});

    if (profileChanges === 0) {
       throw new Error("Felhasználó nem található!");
    }

    return{
        success: true,
        message:"Profil frissítve"
    };
}

module.exports = {serviceRegisterPost, serviceLogin, serviceProfileGet, serviceProfilePut};