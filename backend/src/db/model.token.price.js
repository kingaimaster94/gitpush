
const { Schema, model } = require('mongoose');


const tokenPriceSchema = new Schema({
    tokenId: { type: Schema.Types.ObjectId, ref: 'Token', required: true },
    baseReserve: { type: Number, default: 0 },
    quoteReserve: { type: Number, default: 0 },
    price: { type: Number, default: 0 }, // price in SOL
    timestamp: { type: Date, default: Date.now() },
});

const TokenPrice = model('TokenPrice', tokenPriceSchema);


module.exports = TokenPrice;
