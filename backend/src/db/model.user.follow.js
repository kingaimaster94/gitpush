
const { Schema, model } = require('mongoose');


const userFollowSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    followerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: Boolean, default: false }, // FOLLOW/UNFOLLOW
    cdate: { type: Date, default: null },
    mdate: { type: Date, default: null },
});

const UserFollow = model('UserFollow', userFollowSchema);


module.exports = UserFollow;
