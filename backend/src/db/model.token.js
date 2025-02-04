
const { Schema, model } = require('mongoose');


const tokenSchema = new Schema({
    name: { type: String, default: null },
    ticker: { type: String, default: null },
    desc: { type: String, default: null },
    creatorId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    mintAddr: { type: String, required: true },
    logo: { type: String, default: null },
    twitter: { type: String, default: null },
    telegram: { type: String, default: null },
    website: { type: String, default: null },
    cdate: { type: Date, default: Date.now() },
    koth: { type: Boolean, default: false },
    crownDate: { type: Date, default: null }, // koth crowned date
});

const Token = model('Token', tokenSchema);


module.exports = Token;
