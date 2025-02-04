
const { Schema, model } = require('mongoose');


const userSchema = new Schema({
    username: { type: String, required: true },
    walletAddr: { type: String, required: true },
    bio: { type: String, default: null },
    avatar: { type: String, default: null },
    loginAt: { type: Date, default: null },
    status: { type: Boolean, default: false }, // ACTIVE/INACTIVE
    cdate: { type: Date, default: null },
    mdate: { type: Date, default: null },
});

const User = model('User', userSchema);


module.exports = User;
