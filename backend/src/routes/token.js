
const { Router } = require('express');

const verify = require('../utils/verify');
const { upload_metadata, 
    updateToken, 
    findTokens, 
    getKingOfTheHill, 
    getTokenInfo, 
    getFeedData, 
    getThreadData, 
    reply, 
    likeReply, 
    dislikeReply, 
    mentionReply, 
    getTradeHist, 
    tradeToken
} = require('../engine/token');


const router = Router();


router.post('/upload_metadata', upload_metadata);
router.post('/update_token', verify, updateToken);

router.get('/find_tokens', findTokens);
router.get('/get_king_of_the_hill', getKingOfTheHill);

router.get('/get_token_info', getTokenInfo);
router.get('/get_feed_data', getFeedData);

router.get('/get_thread_data', getThreadData);
router.post('/reply', verify, reply);
router.post('/reply_like', verify, likeReply);
router.post('/reply_dislike', verify, dislikeReply);
router.post('/reply_mention', verify, mentionReply);

router.get('/get_trade_hist', getTradeHist);
router.post('/trade', verify, tradeToken);

module.exports = router;
