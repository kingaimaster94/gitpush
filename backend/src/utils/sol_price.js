
const axios = require('axios');


const requestInterval = 0;


let solPrice;


const getSOLPrice = async () => {
    try {
        const response = await axios.get('https://api.coinbase.com/v2/prices/SOL-USD/spot');
        const newSolPrice = Number(response.data.data.amount);
        solPrice = newSolPrice;
        // console.log('SOL Price in USD:', solPrice, Date.now() / 1000);
    } catch (err) {
        console.error('Error fetching SOL price:', err.message);
    } finally {
        setTimeout(getSOLPrice, requestInterval);
    }
};
getSOLPrice();

const fetchSOLPrice = () => {
    return solPrice;
};


module.exports = fetchSOLPrice;
