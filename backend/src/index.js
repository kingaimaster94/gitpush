
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fileUpload = require('express-fileupload');
const path = require('path');

const { connect } = require('./db');
const { config } = require('./config/');
const routesApi = require('./routes/app.route');
const auth = require('./routes/auth');
const user = require('./routes/user');
const token = require('./routes/token');

const app = express();
dotenv.config();
app.use(cors({origin: '*'}));
app.use(express.json());
app.use(fileUpload({ createParentPath: true }));

app.use('/api/', routesApi);
app.use('/api/auth/', auth);
app.use('/api/user/', user);
app.use('/api/token/', token);

app.use(express.static(path.resolve('uploads/avatars')));
app.use('/avatars', express.static('uploads/avatars'));
app.use(express.static(path.resolve('uploads/images')));
app.use('/images', express.static('uploads/images'));

const port = config.port.https || 2101;
app.listen(port, async () => {
    console.log(`Server is running on PORT ${port}`);
    connect();
});
