
const { Schema, model } = require('mongoose');


const tokenReplyMentionSchema = new Schema({
    tokenId: { type: Schema.Types.ObjectId, ref: 'Token', required: true },
    replierId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    replyId: { type: Schema.Types.ObjectId, ref: 'TokenReplyMention' },
    mentionerId: { type: Schema.Types.ObjectId, ref: 'User' },
    buySell: { type: Number, default: 0 }, // 0: none, 1: buy, 2: sell
    tokenAmount: { type: Number, default: 0 },
    omaxAmount: { type: Number, default: 0 },
    comment: { type: String, default: null },
    image: { type: String, default: null },
    cdate: { type: Date, default: Date.now() },
});

const TokenReplyMention = model('TokenReplyMention', tokenReplyMentionSchema);


module.exports = TokenReplyMention;
