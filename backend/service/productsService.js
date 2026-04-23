const { getProducts, getProductsId } = require("../db/productsDB");
const { validateProductGetId } = require("../validators/productsValidator");

async function serviceProductGet() {
    const products = await getProducts();
    const productMap = {};
    products.forEach(row => {
        if (!productMap[row.id]) {
            productMap[row.id] = {
                id: row.id,
                name: row.name,
                price: row.price,
                image: row.image,
                category_id: row.category_id,
                description: row.description,
                sizes: row.sizes,
                stock: 0,
                size_stocks: {}
            }
        }
        if (row.size) {
                productMap[row.id].size_stocks[row.size] = row.size_stock;
                productMap[row.id].stock += row.size_stock;
        }
    });
    
    return Object.values(productMap);
}

async function serviceProductGetId(data) {

    const syncError = validateProductGetId(data);
    if(syncError) {
        throw new Error(syncError);
    }
   
    const prodcuts = await getProductsId(data.id);
    if (!prodcuts ||prodcuts.length === 0) {
        throw new Error("Termék nem található!");
    }

    const product = {
            id: prodcuts[0].id,
            name: prodcuts[0].name,
            price: prodcuts[0].price,
            image: prodcuts[0].image,
            category_id: prodcuts[0].category_id,
            description: prodcuts[0].description,
            sizes: prodcuts[0].sizes,
            stock: 0,
            size_stocks: {}
        };
    prodcuts.forEach(row => {
            if (row.size) {
                product.size_stocks[row.size] = row.size_stock;
                product.stock += row.size_stock;
            }
        });
    return product;
}


module.exports = { serviceProductGet, serviceProductGetId };
