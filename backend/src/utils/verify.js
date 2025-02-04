const jwt = require('jsonwebtoken');

const keys = require('../config/keys');


// verify JWT token
module.exports = function verify(request, response, next) {
    const bearerToken = request.headers.authorization;
    // console.log('  bearerToken:', bearerToken);
    if (!bearerToken) {
        return response.status(403).json({ message: 'Token not provided' });
    }
    if (bearerToken.substring(0, 7) !== "Bearer ") {
        return response.status(401).json({ message: 'Invalid token' });
    }

    const token = bearerToken.substring(7);
    // console.log('  token:', token);
    jwt.verify(token, keys.JWT_SECKEY, (err, decoded) => {
        if (err) {
            return response.status(401).json({ message: 'Invalid token' });
        }

        request.userId = decoded.userId;
        // console.log('  request.userId:', request.userId);
        next();
    });
};
