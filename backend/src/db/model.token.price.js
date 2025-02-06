
const { Schema, model } = require('mongoose');


const tokenPriceSchema = new Schema({
    tokenId: { type: Schema.Types.ObjectId, ref: 'Token', required: true },
    tokenAmount: { type: Number, default: 0 },
    omaxAmount: { type: Number, default: 0 },
    isBuy: { type: Boolean, default: true },
    price: { type: Number, default: 0 }, // price in OMAX
    hash: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now() },
});

const TokenPrice = model('TokenPrice', tokenPriceSchema);


module.exports = TokenPrice;
