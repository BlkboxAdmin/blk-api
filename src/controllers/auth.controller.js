var jwt = require('jsonwebtoken');
const Utils = require('../helpers/utils');
const Response = require('../helpers/response');
const Auth = require('../models/auth.model');

const output = new Response();

const login = async (req, res) => {
    try {
        const model = new Auth();
        const response = await model.auth(req.body);

        res.json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json(Utils.internalServerError());
    }
};

const forgotPassword = async (req, res) => {
    try {
        const model = new Auth();
        const response = await model.forgotPassword(req.body);

        res.json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json(Utils.internalServerError());
    }
};

const resetPassword = async (req, res) => {
    try {
        const model = new Auth();
        const response = await model.resetPassword(req.body);

        res.json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json(Utils.internalServerError());
    }
};

const emailVerification = async (req, res) => {
    try {
        const model = new Auth();
        const response = await model.verifyEmail(req.body);

        res.json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json(Utils.internalServerError());
    }
};

function validateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const isAuthHeader = (authHeader !== undefined);
    const token = isAuthHeader ? authHeader.split(" ")[1] : null;

    if (token == null) res.status(400).json(output.createBadRequest("Token not present"));

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
        if (err) {
            res.status(403).json(output.createBadRequest("Token invalid"));
        }
        else {
            req.user = user;

            const model = new Auth();
            const userData = await model.runQuery('get_user_by_id', { userId: user.userId });

            if (userData.length == 0) {
                res.status(403).json(output.createBadRequest("Invalid User"));
            }
            else if (userData[0].status != 'Active') {
                res.status(403).json(output.createBadRequest("Inactive User. Contact Support"));
            }
            else {
                next();
            }
        }
    })
}

module.exports = {
    login,
    forgotPassword,
    resetPassword,
    emailVerification,
    validateToken
};