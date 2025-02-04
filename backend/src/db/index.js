
const mongoose = require('mongoose');

const dbConfig = require('./config');
const User = require('./model.user');
const UserFollow = require('./model.user.follow');
const Token = require('./model.token');
const TokenReplyMention = require('./model.token.replymention');
const TokenReplyMentionLike = require('./model.token.replymention.like');
const TokenPrice = require('./model.token.price');
const TokenTrade = require('./model.token.trade');


const connect = () => {
    const dbUri = dbConfig.url;

    try {
        mongoose.set('strictQuery', false);
        mongoose.connect(dbUri, {
            retryWrites: true, w: 'majority'
        });
        console.log('Connected to Db');
    } catch (err) {
        console.error("Couldn't connect to Db:", err);
        process.exit(1);
    }
};


module.exports = { connect, 
    User, 
    UserFollow, 
    Token, 
    TokenReplyMention, 
    TokenReplyMentionLike, 
    TokenPrice, 
    TokenTrade
};
