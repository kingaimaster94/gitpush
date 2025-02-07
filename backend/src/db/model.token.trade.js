
const { Schema, model } = require('mongoose');


const tokenTradeSchema = new Schema({
    tokenId: { type: Schema.Types.ObjectId, ref: 'Token', required: true },
    traderId: { type: Schema.Types.ObjectId, ref: 'User' },
    trader: { type: String, default: null },
    isBuy: { type: Boolean, default: false },
    tokenAmount: { type: Number, default: 0 },
    omaxAmount: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now() },
    txhash: { type: String, default: null }
});

const TokenTrade = model('TokenTrade', tokenTradeSchema);


module.exports = TokenTrade;
