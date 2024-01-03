const express = require('express');
const cors = require('cors');
var path = require('path');

const apiRouter = require('./routers/api.router');
const adminRouter = require('./admin-panel/routers/admin.router');

require('./databases/mysql.db');

const app = express();

app.use(express.json());

const NODE_ENV = process.env.NODE_ENV || 'development';
const whitelist = ['*'];
const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) callback(null, true);
        else callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET, POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
};
app.use(NODE_ENV === 'development' ? cors() : cors()); //cors(corsOptions)

app.get('/', (req, res) => res.send());

app.use('/api', apiRouter);
app.use('/admin-panel/api', adminRouter);

//Angular App Hosting Production Build
app.use(express.static(__dirname + '/admin'));

app.get('/control-center', (req, res) => {
    res.redirect('/control-center/dashboard');
});
// For all GET requests, send back index.html (PathLocationStrategy) (Refresh Error)
app.get('/control-center/*', (req, res) => {
    res.sendFile(path.join(__dirname, '/admin/index.html'));
});

app.get('/reset-password', (req, res) => {
    res.sendFile(path.join(__dirname, '/admin/index.html'));
});

app.get('/email-verification', (req, res) => {
    res.sendFile(path.join(__dirname, '/admin/index.html'));
});

app.get('/error404', (req, res) => {
    res.sendFile(path.join(__dirname, '/admin/index.html'));
});

app.get('*', (req, res) => {
    res.redirect('/error404');
});

module.exports = app;
