
const crypto = require('crypto');


const generateSHA = (str) => {
    const hash = crypto.createHash("md5"); // sha512, sha256, md5
    const digest = hash.update(str, "utf-8").digest();
    return digest.toString("hex");
};

const sleep = async (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


module.exports = { generateSHA, 
    sleep
};
