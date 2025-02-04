
const http = require('http');
const WebSocket = require('ws');

const { config } = require('../config');
const { Token, 
    TokenTrade
} = require('../db');


const server = http.createServer();
const globalSocket = new WebSocket.Server({
    server: server
});

const port = config.port.wss || 2102;


let lastToken = {};
let lastTrade = {};


server.listen(port, async () => {
    console.log(`WebSocket server is running on ${port} port as wss`);

    // get lastToken
    const lastTokenDate = (await Token.aggregate([
        { $sort: {cdate: -1} },
        { $limit: 1 },
        { $project: {_id: 0, cdate: 1} }
    ]))[0]?.cdate;
    lastToken = await Token.findOne({ cdate: lastTokenDate }).populate('creatorId');
    lastToken = {
        walletAddr: lastToken?.creatorId?.walletAddr, 
        avatar: lastToken?.creatorId?.avatar, 
        username: lastToken?.creatorId?.username, 
        
        mintAddr: lastToken?.mintAddr, 
        token: lastToken?.name, 
        logo: lastToken?.logo, 
        
        cdate: lastTokenDate
    };
    // console.log('lastToken:', lastToken);

    // get lastTrade
    const lastTradeDate = (await TokenTrade.aggregate([
        { $sort: {timestamp: -1} },
        { $limit: 1 },
        { $project: {_id: 0, timestamp: 1} }
    ]))[0]?.timestamp;
    // console.log('lastTradeDate:', lastTradeDate);
    lastTrade = await TokenTrade.findOne({ timestamp: lastTradeDate }).populate('traderId').populate('tokenId');
    // console.log('lastTrade:', lastTrade);
    lastTrade = {
        walletAddr: lastTrade?.traderId?.walletAddr, 
        username: lastTrade?.traderId?.username, 
        avatar: lastTrade?.traderId?.avatar, 
        
        mintAddr: lastTrade?.tokenId?.mintAddr, 
        tokenName: lastTrade?.tokenId?.name, 
        logo: lastTrade?.tokenId?.logo, 

        baseAmount: lastTrade?.baseAmount,
        quoteAmount: lastTrade?.quoteAmount,
        isBuy: lastTrade?.isBuy, 
        cdate: lastTradeDate
    };
    // console.log('lastTrade:', lastTrade);
});

globalSocket.on('connection', (ws) => {
    console.log('New WSS connection');

    ws.send(btoa(JSON.stringify({
        message: {
            timestamp: Date.now(), 
            type: config.dataType.lastToken, 
            data: lastToken
        }}))
    );
    
    ws.send(btoa(JSON.stringify({
        message: {
            timestamp: Date.now(), 
            type: config.dataType.lastTrade, 
            data: lastTrade
        }}))
    );
});

const sendMessageById = (id, msg) => {
    console.log('sendMessageById:', id, msg);
    globalSocket.clients.forEach(function each(client) {
        if (client.id === id && client.readyState === WebSocket.OPEN) {
            client.send(btoa(JSON.stringify({ message: msg })));
        }
    });
};

const broadcastMessage = (msg) => {
    console.log('broadcastMessage:', msg);

    if (msg.type === config.dataType.lastToken)
        lastToken = msg.data;
    else if (msg.type === config.dataType.lastTrade)
        lastTrade = msg.data;
    
    globalSocket.clients.forEach(function each(client) {
        // console.log('  client.readyState:', client.readyState);
        if (client.readyState === WebSocket.OPEN) {
            // console.log(`  sending mesage to client ${client}`);
            client.send(btoa(JSON.stringify({ message: msg })));
        }
    });
};


module.exports = {
    sendMessageById, 
    broadcastMessage
};
