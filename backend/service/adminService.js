const { updateOrders, getOrders, getOrderItems, deleteOrder, getProductCategories, addProductWithStocks, updateProductWithStocks, deleteProduct, getCategories, getUsers, getUserProfiles, addCategories, updateCategories, deleteCategories, getContact, deleteContact, getOrderById} = require("../db/adminDB");
const { validateOrderEditsSync, validateProductPostSync, validateProductDeleteSync, validateCategoriesPostSync, validateCategoriesUpdateSync, validateCategoriesDeleteSync, validateContactDeleteSync} = require("../validators/adminValidator");
const {isValidId} = require("../validators/commonValidator");


async function serviceOrders() {
    const orders = await getOrders();
    const items = await getOrderItems();
    const result = orders.map(order => {
        return {
            ...order,   
            order_items: items.filter(i => i.order_id === order.id)
        }
    })
    return result;
}

async function serviceOrdersUpdate({ id }, {user_email, guest_email, total_price, status, shipping_name, shipping_phone, shipping_address, shipping_city, shipping_zip}, user) {
    if (guest_email && user_email) {
        throw new Error("Nem lehet egyszerre guest és user email!");
    }
    if (!guest_email && !user_email) {
        throw new Error( "Email megadása kötelező!");
    }

    let sql;
    let params;
    let email;
    if (guest_email) {
        email = guest_email;
        
        sql = `
            UPDATE orders
            SET guest_email = ?, user_email = NULL, total_price = ?, status = ?, shipping_name = ?, hipping_phone = ?, shipping_address = ?, shipping_city = ?, shipping_zip = ?
            WHERE id = ?
        `;
        params = [guest_email, total_price, status, shipping_name, shipping_phone, shipping_address, shipping_city, shipping_zip, id];
      
    } else {
        email = user_email;

        sql = `
            UPDATE orders
            SET user_email = ?, guest_email = NULL, total_price = ?, status = ?, shipping_name = ?, shipping_phone = ?, shipping_address = ?, shipping_city = ?, shipping_zip = ?
            WHERE id = ?
        `;
        params = [user_email, total_price, status, shipping_name, shipping_phone, shipping_address, shipping_city, shipping_zip, id];
    }
    const validationData = {
        email,
        total_price,
        status,
        id,
        name: shipping_name,
        phone: shipping_phone,
        address: shipping_address,
        city: shipping_city,
        zip: shipping_zip
    };
    const syncError = validateOrderEditsSync(validationData);
    if (syncError) {
        throw new Error(syncError);
    }
    const result = await updateOrders({sql, params});
    if (result === 0) {
        throw new Error("A rendelés nem található!");
    }
    return result;
}

async function serviceOrdersDelete(id) {
    if (!isValidId(id)) {
        throw new Error("Az azonosító nem megfelelő!");
    }
    const result = await deleteOrder(id);
    if (result === 0) {
        throw new Error("A rendelés nem található!");
    } 
    return result;
}

async function serviceProductPost({ name, price, image, category_id, description, size_stocks}) {
    const validationData = {name, total_price: price, image, id: category_id, description, size_stocks};
    const syncError = await validateProductPostSync(validationData);
    if (syncError) {
        throw new Error(syncError);
    }
    const categories = await getProductCategories();
    const category = categories.find(c =>  c.id === Number(category_id));
    if (!category) {
        throw new Error("Kategória nem található!");
    }
    let allowedSizes = [];
    if (category.size_type === "clothing") {
        allowedSizes = ["S", "M", "L", "XL","XXL"];
    }
    else if (category.size_type === "shoes") {
        allowedSizes = ["40", "41", "42", "43", "44", "45"];
    }
    else throw new Error("Kategória nincsen tipushoz rendelve!");

    const asyncError = await validateProductPostAsync(validationData, allowedSizes);
    if (asyncError) {
        throw new Error(asyncError);
    }

    const total_stock = Object.values(size_stocks)
        .reduce((sum, val) => sum + val, 0);
    const sizes = Object.keys(size_stocks).join(",");

    const params = [name, price, image, category_id, description, sizes, total_stock];
    const result = await addProductWithStocks(params, size_stocks);
    return result;
}

async function serviceProductPut({ name, price, image, category_id, description, size_stocks }, { id: productId}) {
    const categories = await getProductCategories();
    const category = categories.find(c =>  c.id === Number(category_id));
    if (!category) {
        throw new Error("Kategória nem található!");
    }
    let allowedSizes = [];
    if (category.size_type === "clothing") {
        allowedSizes = ["S", "M", "L", "XL","XXL"];
    }
    else if (category.size_type === "shoes") {
        allowedSizes = ["40", "41", "42", "43", "44", "45"];
    }
    else throw new Error("Kategória nincsen tipushoz rendelve!");

    const validationData = {name, total_price: price, image, id: category_id, description, size_stocks, allowedSizes};
    const syncError = validateProductPostSync(validationData, productId);
    if (syncError) {
        throw new Error(syncError);
    }

    const total_stock = Object.values(size_stocks)
        .reduce((sum, val) => sum + val, 0);

    const params = [name, price, image, category_id, description, total_stock];

    const result = await updateProductWithStocks(params, size_stocks, productId);

    return result;
}

async function serviceProductDelete(data) {
    const syncError = validateProductDeleteSync(data);
    if (syncError) {
        throw new Error(syncError);
    }
    const result = await deleteProduct(data.id);
    if (result === 0) {
        throw new Error("A termék nem található!");
    } 
    return result;
}

async function serviceCategoriesGet() {
    const categories = await getCategories();
    return categories;
}

async function serviceUsersGet() {
    const users = await getUsers();
    return users;
}

async function serviceUsersProfilesGet() {
    const userProfiles = await getUserProfiles();
    return userProfiles;
}

async function serviceProductCategoriesGet() {
    const categories = getProductCategories();
    return categories;
}

async function serviceCategoriesPost({name}) {
    const validationData = { name };
    const syncError = validateCategoriesPostSync(validationData);
    if (syncError) {
        throw new Error(syncError);
    }

    const params = [name];
    const result = await addCategories(params);

    return result;
}

async function serviceCategoriesUpdate({name}, {id}) {
    const validationData = { name, id };
    const syncError = validateCategoriesUpdateSync(validationData);
    if (syncError) {
        throw new Error(syncError);
    }

    const params = [name];
    const result = await updateCategories(params, id);

    return result;
}

async function serviceCategoriesDeleteSync({id}) {
    const validationData = { id };
    const syncError = validateCategoriesDeleteSync(validationData);
    if (syncError) {
        throw new Error(syncError);
    }

    const result = await deleteCategories(id);

    return result;
}

async function serviceContactGet() {
    const contact = await getContact();
    const category = await getCategories();
    const result = contact.map(contact => {
        return {
            ...contact,   
            category: category.find(c => c.id === contact.category_id)
        }
    });
    return result;
}

async function serviceContactDeleteSync({id}) {
    const validationData = { id };
    const syncError = validateContactDeleteSync(validationData);
    if (syncError) {
        throw new Error(syncError);
    }

    const result = await deleteContact(id);

    return result;
}

module.exports = {
    serviceOrdersUpdate,
    serviceOrders,
    serviceOrdersDelete,
    serviceProductPost,
    serviceProductPut,
    serviceProductDelete,
    serviceCategoriesGet,
    serviceUsersGet,
    serviceUsersProfilesGet,
    serviceProductCategoriesGet,
    serviceCategoriesPost,
    serviceCategoriesUpdate,
    serviceCategoriesDeleteSync,
    serviceContactGet,
    serviceContactDeleteSync
};