
const { config } = require('../config');
const { User,
    Token,
    TokenReplyMention,
    TokenReplyMentionLike,
    TokenPrice,
    TokenTrade
} = require('../db');
const { uploadMetadata } = require('../omax/metadata');
const { getTokenHolderDistribution, getTokenBalance, getCurveInfo } = require('../omax/engine');
const { generateSHA } = require('../utils/basic');
const fetchOMAXPrice = require('../utils/omax_price');
const { broadcastMessage } = require('../utils/socket');


const upload_metadata = async (req, resp) => {
    const query = req.body;
    console.log('upload_metadata - query:', query);

    // if (!req.files) {
    //     console.error('upload_metadata error: No file uploaded');
    //     return resp.status(400).json({ error: 'No file uploaded' });
    // }

    try {
        const { imageUrl } = await uploadMetadata(query.logo);
        console.log('  imageUrl:', imageUrl);
        return resp.status(200).json({ imageUrl });
    } catch (err) {
        console.error('upload_metadata error: ', err);
        return resp.status(400).json({ error: err.message });
    }
};

const updateToken = async (req, resp) => {
    const query = req.body;
    console.log('updateToken - query:', query);

    try {
        // check if tokenAddr info exists
        let token = await Token.findOne({ tokenAddr: query.tokenAddr });
        if (!token) {
            console.log("event monitoring failed");
            token = new Token({ tokenAddr: query.tokenAddr });
        }

        let creator = await User.findOne({ _id: req.userId });
        if (!creator) {
            console.error(`updateToken error: Failed to find the user with id ${req.userId}`);
            return resp.status(400).json({ error: `Failed to find the user with id ${req.userId}` });
        }

        token.name = query.name;
        token.ticker = query.ticker;
        token.desc = query.desc;
        token.creatorId = req.userId;
        token.creator = query.creator;
        token.logo = query.logo;
        token.twitter = query.twitterLink;
        token.telegram = query.tgLink;
        token.website = query.websiteLink;
        token.cdate = new Date(query.timestamp * 1000);
        await token.save();

        broadcastMessage({
            type: config.dataType.lastToken,
            data: {
                walletAddr: query.creator,
                avatar: creator?.avatar,
                username: creator?.username,
                tokenAddr: token.tokenAddr,
                tokenName: token.name,
                logo: token.logo,
                cdate: token.cdate
            }
        });

        return resp.status(200).json({});
    } catch (err) {
        console.error('updateToken error:', err);
        return resp.status(400).json({ error: err.message });
    }
};

const findTokens = async (req, resp) => {
    const query = req.query;
    console.log('findTokens - query:', query);

    try {
        const regex = new RegExp(query.name, 'i');
        const options = {
            $or: [
                { name: { $regex: regex } },
                { ticker: { $regex: regex } },
                { tokenAddr: { $regex: regex } }
            ]
        };

        const tokens = await Token.find(options).populate('creatorId');

        let omaxPrice = fetchOMAXPrice();
        let temp = [];
        let ret = [];

        switch (query.sort_condition) {
            case 'bump order':
                for (const token of tokens) {
                    const bumpOrder = (await TokenPrice.aggregate([
                        { $match: { tokenId: token._id } },
                        { $sort: { timestamp: -1 } },
                        { $limit: 1 },
                        { $project: { _id: 0, timestamp: 1 } }
                    ]))[0].timestamp;
                    // console.log('bumpOrder:', bumpOrder);
                    temp.push({
                        ...token._doc,
                        bumpOrder
                    });
                }
                temp = temp.sort((a, b) =>
                    (query.sort_order === 'desc') ? (b.bumpOrder - a.bumpOrder) : (a.bumpOrder - b.bumpOrder)
                );
                temp = temp.slice(0, 30);
                break;

            case 'last reply':
                for (const token of tokens) {
                    const lastReply = (await TokenReplyMention
                        .aggregate([
                            { $match: { tokenId: token._id } },
                            { $match: { mentionerId: null } },
                            { $sort: { cdate: -1 } },
                            { $limit: 1 },
                            { $project: { _id: 0, cdate: 1 } }
                        ]))[0]?.cdate;
                    // console.log('lastReply:', lastReply);
                    temp.push({
                        ...token._doc,
                        lastReply
                    });
                }
                temp = temp.sort((a, b) =>
                    (query.sort_order === 'desc') ? (b.lastReply - a.lastReply) : (a.lastReply - b.lastReply)
                );
                temp = temp.slice(0, 30);
                break;

            case 'reply count':
                for (const token of tokens) {
                    const replyCount = await TokenReplyMention.countDocuments({ tokenId: token._id, mentionerId: null });
                    console.log('replyCount:', replyCount);
                    temp.push({
                        ...token._doc,
                        replyCount
                    });
                }
                temp = temp.sort((a, b) =>
                    (query.sort_order === 'desc') ? (b.replyCount - a.replyCount) : (a.replyCount - b.replyCount)
                );
                temp = temp.slice(0, 30);
                break;

            case 'market cap':
                for (const token of tokens) {
                    const lastPrice = (await TokenPrice.aggregate([
                        { $match: { tokenId: token._id } },
                        { $sort: { timestamp: -1 } },
                        { $limit: 1 },
                        { $project: { price: 1 } }
                    ]))[0].price;
                    // console.log('lastPrice:', lastPrice);
                    temp.push({
                        ...token._doc,
                        marketCap: lastPrice * config.tokenTotalSupply
                    });
                }
                temp = temp.sort((a, b) =>
                    (query.sort_order === 'desc') ? (b.marketCap - a.marketCap) : (a.marketCap - b.marketCap)
                );
                temp = temp.slice(0, 30);
                break;

            case 'creation time':
                temp = tokens.sort((a, b) =>
                    (query.sort_order === 'desc') ? (b.cdate - a.cdate) : (a.cdate - b.cdate)
                );
                temp = temp.slice(0, 30);
                break;
        }

        // console.log('temp:', temp);
        for (const token of temp) {
            const price = (await TokenPrice.aggregate([
                { $match: { tokenId: token._id } },
                { $sort: { timestamp: -1 } },
                { $limit: 1 },
                { $project: { price: 1 } }
            ]))[0].price;

            ret.push({
                name: token.name,
                ticker: token.ticker,
                desc: token.desc,
                logo: token.logo,
                tokenAddr: token.tokenAddr,
                avatar: token.creatorId?.avatar,
                username: token.creatorId?.username,
                walletAddr: token.creator,
                marketCap: (price * config.tokenTotalSupply * omaxPrice) / 1000,
                replies: await TokenReplyMention.countDocuments({ tokenId: token._id, mentionerId: null })
            });
        }
        // console.log('ret2:', ret);

        return resp.status(200).json(ret);
    } catch (err) {
        console.error('findTokens error:', err);
        return resp.status(400).json({ error: err.message });
    }
};

const getKingOfTheHill = async (req, resp) => {
    const query = req.query;
    console.log('getKingOfTheHill - query:', query);

    try {
        let kingOfTheHill = await Token.findOne({ koth: true })?.populate('creator');
        // console.log('kingOfTheHill:', kingOfTheHill);
        if (!kingOfTheHill) return resp.status(200).json(null);

        const token = (await TokenPrice.aggregate([
            { $match: { tokenId: kingOfTheHill._id } },
            { $sort: { timestamp: -1 } },
            { $limit: 1 },
            { $project: { price: 1 } }
        ]))[0];

        let omaxPrice = fetchOMAXPrice();
        kingOfTheHill = {
            tokenAddr: kingOfTheHill?.tokenAddr,
            name: kingOfTheHill?.name,
            ticker: kingOfTheHill?.ticker,
            logo: kingOfTheHill?.logo,
            username: kingOfTheHill?.creatorId?.username,
            marketCap: (token.price * config.tokenTotalSupply * omaxPrice) / 1000,
            replies: await TokenReplyMention.countDocuments({ tokenId: token.tokenId, mentionerId: null }),
        };
        // console.log('kingOfTheHill:', kingOfTheHill);

        return resp.status(200).json(kingOfTheHill);
    } catch (err) {
        console.error('getKingOfTheHill error:', err);
        return resp.status(400).json({ error: err.message });
    }
};

const getTokenInfo = async (req, resp) => {
    const query = req.query;
    console.log('getTokenInfo - query:', query);

    try {
        const token = await Token.findOne({ tokenAddr: query.tokenAddr }).populate('creatorId');
        if (!token) {
            console.error(`getTokenInfo error: Failed to find the token with tokenAddr ${query.tokenAddr}`);
            return resp.status(400).json({ error: `Failed to find the token with tokenAddr ${query.tokenAddr}` });
        }
        // console.log('token:', token);

        const curveInfo = await getCurveInfo(query.tokenAddr);

        const lastPrice = (await TokenPrice.aggregate([
            { $match: { tokenId: token._id } },
            { $sort: { timestamp: -1 } },
            { $limit: 1 },
            { $project: { price: 1, baseReserve: 1, quoteReserve: 1 } }
        ]))[0];
        // console.log('lastPrice:', lastPrice);
        let omaxPrice = fetchOMAXPrice();

        let tokenBalance = 0;
        let omaxBalance = 0;
        const parsedUserId = JSON.parse(decodeURIComponent(query.userId));
        if (parsedUserId) {
            const selfUser = await User.findOne({ _id: parsedUserId });
            if (selfUser) {
                tokenBalance = await getTokenBalance(selfUser.walletAddr, query.tokenAddr);
                omaxBalance = await getTokenBalance(selfUser.walletAddr);
            }
        }

        const ret = {
            name: token.name,
            ticker: token.ticker,
            desc: token.desc,
            logo: token.logo,
            twitter: token.twitter,
            telegram: token.telegram,
            website: token.website,
            cdate: token.cdate,
            marketCap: lastPrice.price * config.tokenTotalSupply * omaxPrice,
            virtLiq: (Number(curveInfo.vX) + Number(curveInfo.funds)) / (10 ** config.tokenDecimals) * omaxPrice * 2,

            walletAddr: token.creator,
            username: token.creatorId?.username,
            avatar: token.creatorId?.avatar,

            tokenBalance: tokenBalance,
            omaxBalance: omaxBalance,
            replies: await TokenReplyMention.countDocuments({ tokenId: token._id, mentionerId: null }),
            bondingCurveProgress: Math.min(Number(curveInfo.funds) / (10 ** config.tokenDecimals) / config.completeQuoteReserve, 1) * 100,
            kingOfTheHillProgress: Math.min(Number(curveInfo.funds) / (10 ** config.tokenDecimals) / config.kothQuoteReserve, 1) * 100,
            crownDate: token.crownDate,
            tokensAvailableForSale: (Number(curveInfo.vY) - Number(curveInfo.supply)) / (10 ** config.tokenDecimals) - 2_000_000_000,
            realQuoteReserve: Number(curveInfo.funds) / (10 ** config.tokenDecimals),
            tokenHolderDistribution: await getTokenHolderDistribution(query.tokenAddr)
        };
        // console.log('ret:', ret);

        return resp.status(200).json(ret);
    } catch (err) {
        console.error('getTokenInfo error:', err);
        return resp.status(400).json({ error: err.message });
    }
};

const getFeedData = async (req, resp) => {
    const query = req.query;
    console.log('getFeedData - query:', query);
    // console.log('  period:', Number(query.to) - Number(query.from), 's');

    const from = Number(query.from);
    const to = Number(query.to);
    const interval = Number(query.interval) * 60; // min to secs
    let feedData = [];

    try {
        const token = await Token.findOne({ tokenAddr: query.tokenId });
        // console.log('token:', token);
        if (!token) {
            console.error(`getFeedData error: Failed to find the token with tokenAddr ${query.tokenAddr}`);
            return resp.status(400).json({ error: `Failed to find the token with tokenAddr ${query.tokenAddr}` });
        }

        for (x = from; x < to; x += interval) {
            const startTrade = (await TokenPrice.find(
                { tokenId: token._id, timestamp: { $lt: new Date(Number(x) * 1000 + 1) } },
                { price: 1, timestamp: 1 },
                { sort: { timestamp: -1 } }
            ))[0];
            // if (!startTrade)
            //     continue;
            // console.log('startTrade:', startTrade);

            const tokenPrices = await TokenPrice.find({
                tokenId: token._id,
                timestamp: { $gt: new Date(Number(x) * 1000 - 1), $lt: new Date(Number(x + interval) * 1000 + 1) }
            });
            // console.log('tokenPrices:', tokenPrices);

            if (tokenPrices.length > 0) {
                const lowPrice = Math.min(tokenPrices.reduce((low, item) => Math.min(low, item.price), Infinity), startTrade?.price);
                const highPrice = Math.max(tokenPrices.reduce((high, item) => Math.max(high, item.price), -Infinity), startTrade?.price);
                feedData.push({
                    startTimestampSeconds: x,
                    low: lowPrice,
                    high: highPrice,
                    open: startTrade?.price,
                    close: tokenPrices[tokenPrices.length - 1].price,
                    // volumeUsd: tokenPrices[0].price * 1_000_000_000
                });
            } else if (startTrade) {
                feedData.push({
                    startTimestampSeconds: x,
                    low: startTrade?.price,
                    high: startTrade?.price,
                    open: startTrade?.price,
                    close: startTrade?.price,
                    // volumeUsd: tokenPrices[0].price * 1_000_000_000
                });
            }
        }

        // console.log('feedData:', feedData);
        return resp.status(200).json(feedData);
    } catch (err) {
        console.error('getFeedData error:', err);
        return resp.status(400).json([]);
    }
};


const getThreadData = async (req, resp) => {
    const query = req.query;
    console.log('getThreadData - query:', query);

    try {
        let token = await Token.findOne({ tokenAddr: query.tokenAddr }).populate('creatorId');
        if (!token) {
            console.error(`getThreadData error: Failed to find the token with tokenAddr ${query.tokenAddr}`);
            return resp.status(400).json({ error: `Failed to find the token with tokenAddr ${query.tokenAddr}` });
        }

        const replies = await TokenReplyMention.find({ tokenId: token._id }).populate('replierId').populate('mentionerId');
        const parsedUserId = JSON.parse(decodeURIComponent(query.userId));
        let replyData = [];
        for (const reply of replies) {
            replyData = [
                ...replyData,
                {
                    walletAddr: reply.replierId.walletAddr,
                    avatar: reply.replierId.avatar,
                    username: reply.replierId.username,
                    bio: reply.replierId.bio,
                    replyMentionId: reply._id,
                    comment: reply.comment,
                    image: reply.image,
                    cdate: reply.cdate,
                    buySell: reply.buySell,
                    tokenAmount: reply.tokenAmount,
                    omaxAmount: reply.omaxAmount,
                    likes: await TokenReplyMentionLike.countDocuments({ replyMentionId: reply._id, status: true }),
                    liked: await TokenReplyMentionLike.countDocuments({ replyMentionId: reply._id, likerId: parsedUserId, status: true }) > 0 ? true : false,
                    mentions: await TokenReplyMention.find({ replyMentionId: reply._id, mentionerId: { $ne: null } }, { _id: 1 })
                }
            ];
        }

        return resp.status(200).json(replyData);
    } catch (err) {
        console.error('getThreadData error:', err);
        return resp.status(400).json({ error: err.message });
    }
};

const reply = async (req, resp) => {
    const query = req.body;
    console.log('reply - query:', query);

    try {
        const token = await Token.findOne({ tokenAddr: query.tokenAddr });
        if (!token) {
            throw new Error(`Failed to find user with id ${query.tokenAddr}`);
        }

        let newName = null;

        if (req.files) {
            let image = req.files.image;
            let nameList = image.name.split('.');
            let ext = nameList[nameList.length - 1];
            let preHashStr = image.name + Date.now();
            const hashStr = generateSHA(preHashStr);
            newName = hashStr + '.' + ext;
            console.log('newName:', newName);

            // Use the mv() method to place the file in the upload directory (i.e. "uploads")
            await image.mv('./uploads/images/' + newName);
        }

        const tokenReply = new TokenReplyMention({
            tokenId: token._id,
            replierId: req.userId,
            comment: query.comment,
            image: newName,
            cdate: Date.now()
        });
        await tokenReply.save();

        return resp.status(200).json({});
    } catch (err) {
        console.error('reply error:', err);
        return resp.status(400).json({ error: err.message });
    }
};

const likeReply = async (req, resp) => {
    const query = req.body;
    console.log('likeReply - query:', query);

    try {
        let like = await TokenReplyMentionLike.findOne({ replyMentionId: query.replyMentionId, likerId: req.userId });
        if (!like) {
            like = new TokenReplyMentionLike({
                replyMentionId: query.replyMentionId,
                likerId: req.userId,
                status: true,
                cdate: Date.now(),
                mdate: Date.now(),
            });
        } else {
            if (like.status)
                return resp.status(200).json({ warning: "Already liked!" });
            like.status = true;
            like.mdate = Date.now();
        }
        await like.save();

        return resp.status(200).json({});
    } catch (err) {
        console.error('likeReply error:', err);
        return resp.status(400).json({ error: err.message });
    }
};

const dislikeReply = async (req, resp) => {
    const query = req.body;
    console.log('dislikeReply - query:', query);

    try {
        let like = await TokenReplyMentionLike.findOne({ replyMentionId: query.replyMentionId, likerId: req.userId });
        if (!like) {
            console.error('dislikeReply error: Non-existent like');
            return resp.status(400).json({ error: "Non-existent like" });
        }
        if (!like.status) {
            console.warn('dislikeReply warning: Already disliked');
            return resp.status(200).json({ warning: "Already disliked" });
        }

        like.status = false;
        like.mdate = Date.now();
        await like.save();

        return resp.status(200).json({});
    } catch (err) {
        console.error('dislikeReply error:', err);
        return resp.status(400).json({ error: err.message });
    }
};

const mentionReply = async (req, resp) => {
    const query = req.body;
    console.log('mentionReply - query:', query);

    try {
        let newName = null;

        if (req.files) {
            let image = req.files.image;
            let nameList = image.name.split('.');
            let ext = nameList[nameList.length - 1];
            let preHashStr = image.name + Date.now();
            const hashStr = generateSHA(preHashStr);
            newName = hashStr + '.' + ext;
            console.log('newName:', newName);

            // Use the mv() method to place the file in the upload directory (i.e. "uploads")
            await image.mv('./uploads/images/' + newName);
        }

        const replyMention = await TokenReplyMention.findOne({ _id: query.replyMentionId });
        if (!replyMention) {
            console.error(`mentionReply error: Failed to find replyMention with id ${query.replyMentionId}`);
            return resp.status(400).json({ error: `Failed to find replyMention with id ${query.replyMentionId}` });
        }

        const mention = new TokenReplyMention({
            tokenId: replyMention.tokenId,
            replierId: replyMention.replierId,
            replyId: query.replyMentionId,
            mentionerId: req.userId,
            comment: query.message,
            image: newName,
            cdate: Date.now()
        });
        await mention.save();

        return resp.status(200).json({});
    } catch (err) {
        console.error('mentionReply error:', err);
        return resp.status(400).json({ error: err.message });
    }
};


const getTradeHist = async (req, resp) => {
    const query = req.query;
    console.log('getTradeHist - query:', query);

    try {
        const token = await Token.findOne({ tokenAddr: query.tokenAddr });
        if (!token) {
            console.error(`getTradeHist error: Failed to find the token with tokenAddr ${query.tokenAddr}`);
            return resp.status(400).json({ error: `Failed to find the token with tokenAddr ${query.tokenAddr}` });
        }

        const tradeHist = await TokenTrade.find({ tokenId: token._id }).populate('traderId').sort({ timestamp: -1 });
        let histData = [];

        for (const trade of tradeHist) {
            // console.log('  trade:', trade);
            histData.push({
                walletAddr: trade.trader,
                avatar: trade.traderId?.avatar,
                username: trade.traderId?.username,
                isBuy: trade.isBuy,
                tokenAmount: trade.tokenAmount,
                omaxAmount: trade.omaxAmount,
                date: trade.timestamp,
                txhash: trade.txhash
            });
        }
        // console.log('  histData:', histData);

        return resp.status(200).json(histData);
    } catch (err) {
        console.error('getTradeHist error:', err);
        return resp.status(400).json({ error: err.message });
    }
};

const getRecentTrade = async (req, resp) => {
    try {
        const trades = await TokenTrade.find().sort({ timestamp: -1 }); // Ascending order
        let histData = []
        for (let i = 0; i < trades.length; i++) {
            if (trades[i].isBuy == true) {
                const token = await Token.findOne({ _id: trades[i].tokenId });
                histData.push({
                    walletAddr: trades[i].trader,
                    logo: token.logo,
                    omaxAmount: trades[i].omaxAmount,
                });
            }
            if (histData.length == 3) break;
        }
        return resp.status(200).json(histData);
    } catch (error) {
        console.error('getRecentTrade error:', error);
        return resp.status(400).json({ error: error.message });
    }
};

const tradeToken = async (req, resp) => {
    const query = req.body;
    console.log('tradeToken - query:', query);

    try {
        const token = await Token.findOne({ tokenAddr: query.tokenAddr });
        if (!token) {
            console.error(`tradeToken error: Failed to find the token with tokenAddr ${query.tokenAddr}`);
            return resp.status(400).json({ error: `Failed to find the token with tokenAddr ${query.tokenAddr}` });
        }

        let trader = await User.findOne({ _id: req.userId });
        let tokenTradeOld = await TokenTrade.findOne({
            tokenId: token._id,
            isBuy: query.isBuy,
            tokenAmount: query.tokenAmount,
            omaxAmount: query.omaxAmount,
            txhash: query.txhash,
            timestamp: new Date(query.timestamp * 1000)
        });
        if (tokenTradeOld) {
            tokenTradeOld.traderId = req.userId;
            tokenTradeOld.save();
        } else {
            const trade = new TokenTrade({
                tokenId: token._id,
                traderId: req.userId,
                isBuy: query.isBuy,
                tokenAmount: query.tokenAmount,
                omaxAmount: query.omaxAmount,
                timestamp: new Date(query.timestamp * 1000),
                txhash: query.txhash
            });
            await trade.save();
        }

        if (query.comment) {
            const replyMention = new TokenReplyMention({
                tokenId: token._id,
                replierId: req.userId,
                buySell: (query.isBuy ? 0 : 1) + 1,
                comment: query.comment,
                tokenAmount: query.tokenAmount,
                omaxAmount: query.omaxAmount,
                cdate: Date.now()
            });
            await replyMention.save();
        }

        broadcastMessage({
            type: config.dataType.lastTrade,
            data: {
                walletAddr: trader.walletAddr,
                avatar: trader.avatar,
                username: trader.username,
                tokenAddr: token.tokenAddr,
                tokenName: token.name,
                logo: token.logo,
                tokenAmount: query.tokenAmount,
                omaxAmount: query.omaxAmount,
                isBuy: query.isBuy,
                cdate: token.cdate
            }
        });

        return resp.status(200).json({});
    } catch (err) {
        console.error('tradeToken error:', err);
        return resp.status(400).json({ error: err.message });
    }
};

module.exports = {
    upload_metadata,
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
    getRecentTrade,
    tradeToken
};
