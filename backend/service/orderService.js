const { validateOrderPostSync, prepareOrderItems} = require("../validators/orderValidator")
const { saveOrder, getIdempotencyKey, saveIdempotencyKey, getOrders, getOrdersMy} = require("../db/orderDB");
const {isDuplicateRequest, createRequestKey} = require("../Middleware/idempotency");

async function serviceOrder(userData, body, key) {  
    let user_id = userData ? userData.id : null;
    const requestKey = createRequestKey(user_id, body);


    if (isDuplicateRequest(requestKey)) {
        throw new Error("Dupla rendelés érzékelve (5s védelem)");
    }

    const syncError = validateOrderPostSync(body);
    if (syncError) {
        throw new Error(syncError);
    }

    const { validItems, total_price } = await prepareOrderItems(body.items);

    const saveData = {user_id, email: body.email, total_price, name: body.name, phone: body.phone, address: body.address, city: body.city, zip: body.zip, validItems};

    const orderId = await saveOrder(saveData);

    await saveIdempotencyKey(key, orderId);

    return { orderId };
}

async function serviceCategoriesGet(data) {
    const result = await getOrders(data.email);
    return result;
}

async function serviceCategoriesGetMy(data) {
    const result = await getOrdersMy(data.id);
    return result;
}
module.exports = {
    serviceOrder,
    serviceCategoriesGet,
    serviceCategoriesGetMy
}