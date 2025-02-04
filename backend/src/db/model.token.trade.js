
const { Schema, model } = require('mongoose');


const tokenTradeSchema = new Schema({
    tokenId: { type: Schema.Types.ObjectId, ref: 'Token', required: true },
    traderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isBuy: { type: Boolean, default: false },
    baseAmount: { type: Number, default: 0 },
    quoteAmount: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now() },
    txhash: { type: String, default: null }
});

const TokenTrade = model('TokenTrade', tokenTradeSchema);


module.exports = TokenTrade;
