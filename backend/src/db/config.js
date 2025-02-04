
const dotenv = require('dotenv');
dotenv.config();


exports.url = (process.env.TEST_MODE === 'true') 
    ? 'mongodb://127.0.0.1:27017/pump_fun_test' 
    : 'mongodb://127.0.0.1:27017/pump_fun';
