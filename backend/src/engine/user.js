
const fs = require('fs').promises;
const path = require('path');

const { User, 
    UserFollow, 
    Token, 
    TokenPrice, 
    TokenReplyMention, 
    TokenReplyMentionLike
} = require('../db');
const { config } = require('../config');
const { generateSHA } = require('../utils/basic');
const fetchSOLPrice = require('../utils/sol_price');
const { getTokensHeld } = require('../solana/engine');


const getUserProfile = async (req, resp) => {
    const query = req.query;
    console.log('getUserProfile - query:', query);

    try {
        const walletAddr = query.walletAddr;
        const user = await User.findOne({ walletAddr });
        if (!user) {
            throw new Error(`Failed to find user with wallet_addr ${walletAddr}`);
        }
        const followers = await UserFollow.find({ userId: user._id, status: true }).countDocuments();
        const likesReceived = await TokenReplyMentionLike.find({ replierId: user._id, status: true })?.countDocuments();
        const mentionsReceived = await TokenReplyMention.find({ replierId: user._id, mentionerId: {$ne: null} })?.countDocuments();

        // get list of holding tokens
        const tokensHeld = await getTokensHeld(walletAddr);
        let coinsHeld = [];
        for (const tokenInfo of tokensHeld) {
            // console.log('tokenInfo:', tokenInfo);
            if (Number(tokenInfo.balance) === 0) continue;

            const token = await Token.findOne({ mintAddr: tokenInfo.mint });
            if (!token) continue;
            // console.log('token:', token);
            
            const lastPrice = (await TokenPrice.aggregate([
                { $match: {tokenId: token._id} },
                { $sort: {timestamp: -1} },
                { $limit: 1 },
                { $project: {price: 1} }
            ]))[0]?.price;
            // console.log('lastPrice:', lastPrice);

            coinsHeld.push({
                mintAddr: tokenInfo.mint, 
                ticker: token.ticker, 
                balance: Number(tokenInfo.balance), 
                logo: token.logo, 
                lamports: lastPrice * Number(tokenInfo.balance)
            });
        }
        // console.log('coinsHeld:', coinsHeld);

        let replies = [];
        const parsedUserId = JSON.parse(decodeURIComponent(query.userId));
        if (user._id == parsedUserId) {
            replies = await TokenReplyMention.find({ replierId: user._id, mentionerId: null })
                .populate('replierId')
                .find({}, { username: 1, 
                    walletAddr: 1, 
                    ctime: 1, 
                    replyMentionId: 1, 
                    replyMsg: 1
                });
        }
        
        let notifications = {};
        if (user._id == parsedUserId) {
            const replyMentions = await TokenReplyMention.find({ 
                $or: [
                    { replierId: user._id }, 
                    { mentionerId: user._id }
                ]});
            let allLikes = [];
            for (const replyMention of replyMentions) {
                const likes = await TokenReplyMentionLike.find({ replyMentionId: replyMention._id }, { _id: 0, likerId: 1 })
                    .populate('likerId');
                let likes2 = [];
                for (const like of likes)
                    likes2.push(like.likerId.username);
                allLikes.push(likes2);
            }
            const mentions = await TokenReplyMention.find({ replierId: user._id, mentionerId: {$ne: null} })?.populate('mentionerId');
            let mentions2 = [];
            for (const mention of mentions) {
                mentions2.push({
                    username: mention.mentionerId.username,
                    comment: mention.comment
                });
            }
            notifications = { likes: allLikes, mentions: mentions2 };
        }
        
        const tokensCreated = await Token.find({ creatorId: user._id })?.populate('creatorId');
        let coinsCreated = [];
        for (const tokenInfo of tokensCreated) {
            const lastPrice = (await TokenPrice.aggregate([
                { $match: {tokenId: tokenInfo._id} },
                { $sort: {timestamp: -1} },
                { $limit: 1 },
                { $project: {price: 1} }
            ]))[0]?.price;
            let solPrice = fetchSOLPrice();

            coinsCreated.push({
                walletAddr: tokenInfo.creatorId.walletAddr, 
                avatar: tokenInfo.creatorId.avatar, 
                username: tokenInfo.creatorId.username, 
                mintAddr: tokenInfo.mintAddr, 
                logo: tokenInfo.logo, 
                tokenName: tokenInfo.name, 
                ticker: tokenInfo.ticker, 
                desc: tokenInfo.desc, 
                marketCap: (lastPrice * solPrice * config.tokenTotalSupply) / 1000, // unit: K$
                replies: await TokenReplyMention.find({ tokenId: tokenInfo._id, mentionerId: null }).countDocuments()
            });
        }
        // console.log('coinsCreated:', coinsCreated);
        
        const followersList = await UserFollow.find({ userId: user._id, status: true })?.populate('followerId');
        let followersList2 = [];
        for (const followerInfo of followersList) {
            followersList2.push({
                walletAddr: followerInfo.followerId.walletAddr, 
                avatar: followerInfo.followerId.avatar, 
                username: followerInfo.followerId.username, 
                followers: await UserFollow.countDocuments({ userId: followerInfo.followerId, status: true }), 
            });
        }
        // console.log('followersList2:', followersList2);

        const followingsList = await UserFollow.find({ followerId: user._id, status: true })?.populate('userId');
        let followingsList2 = [];
        for (const followingInfo of followingsList) {
            followingsList2.push({
                walletAddr: followingInfo.userId.walletAddr, 
                avatar: followingInfo.userId.avatar, 
                username: followingInfo.userId.username, 
                followers: await UserFollow.countDocuments({ userId: followingInfo.userId, status: true }), 
            });
        }
        // console.log('followingsList2:', followingsList2);

        return resp.status(200).json({ avatar: user.avatar, 
            username: user.username, 
            bio: user.bio, 
            followers, 
            likes: likesReceived, 
            mentions: mentionsReceived, 
            coinsHeld, 
            replies, 
            notifications, 
            coinsCreated, 
            followersList: followersList2, 
            followingsList: followingsList2
        });
    } catch (err) {
        console.error('getUserProfile error:', err);
        return resp.status(400).json({ error: err.message });
    }
};

const updateUserProfile = async (req, resp) => {
    const query = req.body;
    console.log('updateUserProfile - query:', query);

    if (!req.files) {
        throw new Error('Not uploaded avatar');
    }

    try {
        const user = await User.findOne({ _id: req.userId });
        if (!user) {
            throw new Error(`Failed to find user with id ${req.userId}`);
        }

        if (Date.now() < user.mtime + 86400000) {
            throw new Error(`You can update your profile after 1 day from ${user.mtime}`);
        }

        let avatar = req.files.avatar;
        let nameList = avatar.name.split('.');
        let ext = nameList[nameList.length - 1];
        let preHashStr = avatar.name + Date.now();
        const hashStr = generateSHA(preHashStr);
        const newName = hashStr + '.' + ext;
        console.log('newName:', newName);

        // remove previous avatar if exists
        if (user.avatar)
            await fs.unlink(path.resolve('uploads/avatars') + '/' + user.avatar);

        // Use the mv() method to place the file in the upload directory (i.e. "uploads")
        await avatar.mv('./uploads/avatars/' + newName);

        user.avatar = newName;
        user.username = query.username;
        user.bio = query.bio;
        user.mtime = Date.now();
        await user.save();

        return resp.status(200).json({ avatarUrl: user.avatar, 
            mimetype: avatar.mimetype, 
            size: avatar.size
        });
    } catch (err) {
        console.error('updateUserProfile error:', err);
        return resp.status(400).json({ error: err.message });
    }
};


const getPopularUsers = async (userId) => {
    let ret = [];

    const users = await User.find({ _id: {$ne: userId} }, { _id: 1, avatar: 1, username: 1 });
    // console.log('users:', users);
    for (const user of users) {
        ret.push({
            ...user._doc,
            numFollowers: await UserFollow.countDocuments({ userId: user._id, status: true }), 
            followed: await UserFollow.countDocuments({ userId: user._id, followerId: userId, status: true }) === 0 ? false : true
        });
    }

    ret = ret.sort((a, b) => b.numFollowers - a.numFollowers);
    ret = ret.slice(0, 5);
    return ret;
};

const getFollowingUsers = async (req, resp) => {
    const query = req.query;
    console.log('getFollowingUsers - query:', query);

    try {
        const parsedUserId = JSON.parse(decodeURIComponent(query.userId));
        const usersToFollow = await getPopularUsers(parsedUserId);
        // console.log('usersToFollow:', usersToFollow);
        return resp.status(200).json(usersToFollow);
    } catch (err) {
        console.error('getFollowingUsers error:', err);
        return resp.status(400).json({ error: err.message });
    }
};

const followUser = async (req, resp) => {
    const query = req.body;
    console.log('followUser - query:', query);

    if (query.followingId === req.userId)
        return resp.status(200).json({ warning: "Can't follow yourself!" });

    try {
        let follow = await UserFollow.findOne({ userId: query.followingId, followerId: req.userId });
        if (!follow) {
            follow = new UserFollow({
                userId: query.followingId, 
                followerId: req.userId, 
                status: true, 
                cdate: Date.now(), 
                mdate: Date.now()
            });
        } else {
            if (follow.status)
                return resp.status(200).json({ warning: "Already followed!" });
            follow.status = true;
            follow.mdate = Date.now();
        }
        await follow.save();
        
        return resp.status(200).json({});
    } catch (err) {
        console.error('followUser error:', err);
        return resp.status(400).json({ error: err.message });
    }
};

const unfollowUser = async (req, resp) => {
    const query = req.body;
    console.log('unfollowUser - query:', query);

    try {
        let follow = await UserFollow.findOne({ userId: query.followingId, followerId: req.userId });
        if (!follow) {
            console.error('unfollowUser error: Non-existent follow');
            return resp.status(400).json({ error: "Non-existent follow" });
        }
        if (!follow.status) {
            console.warn('unfollowUser warning: Already disliked');
            return resp.status(200).json({ warning: "Already disliked" });
        }

        follow.status = false;
        follow.mdate = Date.now();
        await follow.save();

        return resp.status(200).json({});
    } catch (err) {
        console.error('unfollowUser error:', err);
        return resp.status(400).json({ error: err.message });
    }
};


module.exports = { getUserProfile, 
    updateUserProfile, 
    getFollowingUsers, 
    followUser, 
    unfollowUser
};
