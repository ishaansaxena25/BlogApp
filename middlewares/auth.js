const { validateToken } = require("../services/JWTauth");

function checkforAuthCookie(cookieName) {
  return (req, res, next) => {
    const tokenCookie = req.cookies[cookieName];
    if (!tokenCookie) {
      return next();
    }
    try {
      const userPayload = validateToken(tokenCookie);
      req.user = userPayload;
    } catch (error) {}
    return next();
  };
}

module.exports = { checkforAuthCookie };
