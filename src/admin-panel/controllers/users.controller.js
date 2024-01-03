const Utils = require('../../helpers/utils');
const User = require('../models/user.model');

const getUsers = async (req, res) => {
    try {
        const page = req.params.page ?? 1;
        const user = new User();
        const response = await user.list(page, req.body);

        res.json(response);
    } catch (err) {
        res.status(500).json(Utils.internalServerError());
    }
};

const singleUser = async (req, res) => {
    try {
        const model = new User();
        const response = await model.find(req.params);

        res.json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json(Utils.internalServerError());
    }
};

const addUser = async (req, res) => {
    try {
        const user = new User();
        const response = await user.add(req.body);

        res.status(response.statusCode).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).send(Utils.internalServerError());
    }
};

const updateUser = async (req, res) => {

    try {
        const id = req.params.userId;
        const user = new User();
        const response = await user.findByIdAndUpdate(id, req.body);

        return res.status(response.statusCode).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json(Utils.internalServerError());
    }
};

const updateSettings = async (req, res) => {

    const thisUserId = req.user.userId;
    try {
        const user = new User();
        const response = await user.findByIdAndUpdateCol(thisUserId, req.body);

        return res.status(response.statusCode).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json(Utils.internalServerError());
    }
};

const changePassword = async (req, res) => {
    const thisUserId = req.user.userId;
    try {
        const model = new User();
        const response = await model.updatePassword(thisUserId, req.body);

        res.json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json(Utils.internalServerError());
    }
};

const blockedUsers = async (req, res) => {
    try {
        const user = new User();
        const response = await user.blockList(req.user.userId);

        res.json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json(Utils.internalServerError());
    }
};

const blockUser = async (req, res) => {

    const id = req.user.userId;
    try {
        const user = new User();
        const response = await user.block(id, req.body);

        return res.status(response.statusCode).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json(Utils.internalServerError());
    }
};

const removeBlockUser = async (req, res) => {

    const id = req.user.userId;
    try {
        const user = new User();
        const response = await user.removeBlock(id, req.body);

        return res.status(response.statusCode).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json(Utils.internalServerError());
    }
};

const deleteUser = async (req, res) => {
    try {
        const id = req.params.userId;
        const user = new User();
        const response = await user.deleteById(id);

        res.json(response);
    } catch (err) {
        res.status(500).json(Utils.internalServerError());
    }
};

module.exports = {
    getUsers,
    singleUser,
    addUser,
    updateUser,
    updateSettings,
    changePassword,
    blockedUsers,
    blockUser,
    removeBlockUser,
    deleteUser,
};
