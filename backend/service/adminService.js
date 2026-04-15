const { updateOrders, getOrders, getOrderItems } = require("../db/adminDB");
const { validateOrderEditsSync } = require("../validators/adminValidator");

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

async function serviceOrdersUpdate({ id }, {user_email, guest_email, total_price, status}) {
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
            SET guest_email = ?, user_email = NULL, total_price = ?, status = ?
            WHERE id = ?
        `;
        params = [guest_email, total_price, status, id];
      
    } else {
        email = user_email;

        sql = `
            UPDATE orders
            SET user_email = ?, guest_email = NULL, total_price = ?, status = ?
            WHERE id = ?
        `;
        params = [user_email, total_price, status, id];
    }
    const syncError = validateOrderEditsSync({ email, total_price, status, id});
    if (syncError) {
        throw new Error(syncError);
    }


    
    const result = await updateOrders({sql, params});
    if (result === 0) {
        throw new Error("A rendelés nem található!");
    }
    return result;
}


module.exports = {
    serviceOrdersUpdate,
    serviceOrders
};