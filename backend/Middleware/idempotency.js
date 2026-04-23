
const recentRequests = new Map();


function isDuplicateRequest(key) {

    const now = Date.now();

    const existing = recentRequests.get(key);

    if (existing && now - existing < 5000) {
        return true;
    }

    recentRequests.set(key, now);

    return false;
}

module.exports = { isDuplicateRequest };