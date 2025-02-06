const axios = require('axios');
const requestInterval = 0;
let omaxPrice;
const getOMAXPPrice = async () => {
    try {
        const response = await axios.get('https://api.coinbase.com/v2/prices/OMAX-USD/spot');
        const newOmaxPrice = Number(response.data.data.amount);
        omaxPrice = newOmaxPrice;
        // console.log('OMAX Price in USD:', omaxPrice, Date.now() / 1000);
    } catch (err) {
        console.error('Error fetching OMAX price:', err.message);
    } finally {
        setTimeout(getOMAXPPrice, requestInterval);
    }
};
getOMAXPPrice();

const fetchOMAXPrice = () => {
    return omaxPrice;
};


module.exports = fetchOMAXPrice;
