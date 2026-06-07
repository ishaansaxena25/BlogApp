const { validateToken } = require("../services/JWTauth");
const { isTokenBlacklisted } = require("../services/tokenBlacklist");

function getRequestToken(req, cookieName = "token") {
  const authorization = req.get("authorization");
  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice(7).trim();
  }

  return req.cookies?.[cookieName];
}

function optionalAuth(req, res, next) {
  const token = getRequestToken(req);
  if (!token || isTokenBlacklisted(token)) {
    return next();
  }

  try {
    req.user = validateToken(token);
    req.token = token;
  } catch (error) {
    return next();
  }

  return next();
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  return next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    return next();
  };
}

module.exports = { getRequestToken, optionalAuth, requireAuth, requireRole };
