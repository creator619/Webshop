const http = require('http');

const orderData = JSON.stringify({
    user_email: "test@example.com",
    total_price: 15000,
    items: [
        { name: "Teszt Termék 1", price: 5000, quantity: 1 },
        { name: "Teszt Termék 2", price: 10000, quantity: 1 }
    ]
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/orders',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(orderData)
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('BODY:', data);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(orderData);
req.end();
