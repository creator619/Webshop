
const recentRequests = new Map();

function createRequestKey(userId, body) {
    return JSON.stringify({
        userId,
        items: body.items,
        email: body.email,
        total: body.total_price
    });
}

function isDuplicateRequest(key) {

    const now = Date.now();

    const existing = recentRequests.get(key);

    if (existing && now - existing < 5000) {
        return true;
    }

    recentRequests.set(key, now);

    return false;
}

module.exports = { isDuplicateRequest, createRequestKey };