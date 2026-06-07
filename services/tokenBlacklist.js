const blacklistedTokens = new Map();

function blacklistToken(token, expiresAt) {
  blacklistedTokens.set(token, expiresAt);
}

function isTokenBlacklisted(token) {
  const expiresAt = blacklistedTokens.get(token);
  if (!expiresAt) {
    return false;
  }

  if (expiresAt <= Date.now()) {
    blacklistedTokens.delete(token);
    return false;
  }

  return true;
}

module.exports = { blacklistToken, isTokenBlacklisted };
