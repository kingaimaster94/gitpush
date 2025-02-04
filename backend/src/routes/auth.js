
const { Router } = require('express');

const { login } = require('../engine/auth');


const router = Router();


router.post('/login', login);


module.exports = router;
