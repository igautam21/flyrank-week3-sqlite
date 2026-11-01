
const blacklistedTokens = new Set();

function addToken(token) {
    blacklistedTokens.add(token);
}

function isTokenBlacklisted(token) {
    return blacklistedTokens.has(token);
}

module.exports = {
    addToken,
    isTokenBlacklisted
};
