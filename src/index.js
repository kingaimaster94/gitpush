const { ethers } = require('ethers');
const { createTokenDir } = require('./mkdir');
const { downloadIPFSFile } = require('./download');
const { pushFileToRepo } = require('./gitpush');
const { pumpfunabi } = require('./pumpfun');

const pumpfunAddress = "0x1f53E9893Fa64a9a44EA4EF4b26CFfD1212D40E1";
const rpcUrl = "https://mainapi.omaxscan.com";
// const pumpfunAddress = "0xaF218243096aeb4e37d119ea28F83e1473EcC011";
// const rpcUrl = "https://testapi.omaxray.com";

const provider = new ethers.JsonRpcProvider(rpcUrl);

const addTokenLogo = async (ipfsUri, tokenAddr) => {
    await createTokenDir(tokenAddr);
    if (ipfsUri != '') {
       const filePath = await downloadIPFSFile(ipfsUri, tokenAddr);
       await pushFileToRepo(filePath, 'https://github.com/OMAXCHAIN/omaxfunasset.git', 'main');
    }
}

const onLaunchEvent = async (log) => {
    try {
        console.log("\ngithub push");
        const tokenAddr = ethers.getAddress("0x" + log.topics[1].slice(26));

        let pumpfunContract = null;
        pumpfunContract = new ethers.Contract(pumpfunAddress, pumpfunabi, provider);
        const curveInfo = await pumpfunContract.curveInfo(tokenAddr);
        const ipfsUri = curveInfo.logo;
        await addTokenLogo(ipfsUri, tokenAddr);
        console.log(`new token launched: ${tokenAddr}, github pushed: ${ipfsUri}`)
    } catch (err) {
        console.error('github push error:', err.message);
    }
};

let lastCheckedBlock = 0; //6961915;
const curveLaunchedTopic = ethers.id("CurveLaunched(address)");

const captureEvents = async () => {
    console.log("start");
    const latestBlock = await provider.getBlockNumber();
    if (lastCheckedBlock === 0) {
        lastCheckedBlock = latestBlock - 10; // Start from a few blocks behind
    }
    console.log(`Checking events from block ${lastCheckedBlock} to ${latestBlock}...`);
    const logs = await provider.getLogs({
        fromBlock: lastCheckedBlock,
        toBlock: latestBlock,
        address: pumpfunAddress,
        topics: [[curveLaunchedTopic]],
    });

    console.log("logs length: ", logs.length);
    for (let i = 0; i < logs.length; i++) {
        const log = logs[i];
        const eventTopic = log.topics[0]; // Identify the event type
        if (eventTopic === curveLaunchedTopic) {
            await onLaunchEvent(log);
        }
    }
    lastCheckedBlock = latestBlock + 1; // Move forward
};

setInterval(captureEvents, 10000);