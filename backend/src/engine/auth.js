
const jwt = require('jsonwebtoken');

const keys = require('../config/keys');
const { User } = require('../db');


const login = async (req, resp) => {
    const query = req.body;
    console.log('login - query:', query);

    try {
        const walletAddr = query.walletAddr;

        // create/update user
        let user = await User.findOne({ walletAddr });
        if (!user) {
            user = new User({
                username: walletAddr.substr(0, 10), 
                walletAddr, 
                loginAt: Date.now(), 
                status: true, 
                cdate: Date.now(), 
                mdate: Date.now()
            });
        } else {
            user.loginAt = Date.now();
        }
        user.save();

        // Create JWT Payload
        const payload = { userId: user._id, 
            username: user.username, 
            avatar: user.avatar
        };

        // Sign JWT Token
        jwt.sign(
            payload, 
            keys.JWT_SECKEY, 
            { expiresIn: '24h' }, 
            (err, token) => {
                return resp.status(200).json({
                    token: 'Bearer ' + token
                });
            }
        );
    } catch (err) {
        console.error('login error:', err);
        return resp.status(400).json({ error: err.message });
    }
};


module.exports = { login };
