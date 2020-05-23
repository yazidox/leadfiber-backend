var jwt = require("jsonwebtoken");


const JWT_SIGN_SECRET = "A385ABBF006562BFF3C9F55F83F4A751B64E83BE286D45F3BD9422C800138575";

module.exports = {
    generateTokenForUser: function (userData) {
        return jwt.sign({
                userId: userData.id,
                idAdmin: userData.isAdmin
            },
            JWT_SIGN_SECRET, {
                expiresIn: '1h'
            }
        )
    },
    parseAuthorization: function (authorization) {
        return (authorization != null) ? authorization.replace('Bearer ', '') : null;
    },
    getUserId: function (authorization) {
        var userId = -1;
        var token = module.exports.parseAuthorization(authorization);
        if (token != null) {
            try {
                var jwtToken = jwt.verify(token, JWT_SIGN_SECRET);
                if (jwtToken != null)
                    userId = jwtToken.userId;
            } catch (err) {}
        }
        return userId;
    }
}