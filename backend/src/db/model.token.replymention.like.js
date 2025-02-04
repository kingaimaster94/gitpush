
const { Schema, model } = require('mongoose');


const tokenReplyMentionLikeSchema = new Schema({
    replyMentionId: { type: Schema.Types.ObjectId, ref: 'TokenReplyMention', required: true },
    likerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: Boolean, default: false }, // LIKE/DISLIKE
    cdate: { type: Date, default: Date.now() },
    mdate: { type: Date, default: Date.now() },
});

const TokenReplyMentionLike = model('TokenReplyMentionLike', tokenReplyMentionLikeSchema);


module.exports = TokenReplyMentionLike;
