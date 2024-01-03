const Utils = require('../helpers/utils');
const User = require('../models/user.model');
const Friends = require('../models/friends.model');
const TimeStories = require('../models/time_stories.model');

const getUsers = async (req, res) => {
    try {
        const user = new User();
        const response = await user.find();

        res.json(response);
    } catch (err) {
        res.status(500).json(Utils.internalServerError());
    }
};

const singleUserVideoProfile = async (req, res) => {
    try {
        const thisUserId = req.user.userId;
        const model = new User();
        const response = await model.find(req.params);

        if (response.statusCode > 202) {
            res.json(response);
            return
        }

        const friends = new Friends();
        const params = {
            sender_user_id: thisUserId,
            receiver_user_id: req.params.userId
        };
        response.data.friendShipData = await friends.getFriendship(params);

        const timeStories = new TimeStories();
        const args = { userId: req.params.userId };
        const metrics = await timeStories.metrics(args);

        response.data.metrics = metrics.data

        res.json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json(Utils.internalServerError());
    }
};

const singleUser = async (req, res) => {
    try {
        const thisUserId = req.user.userId;
        const model = new User();
        const response = await model.find(req.params);

        if (response.statusCode > 202) {
            res.json(response);
            return
        }

        const friends = new Friends();
        const params = {
            sender_user_id: thisUserId,
            receiver_user_id: req.params.userId
        };
        response.data.friendShipData = await friends.getFriendship(params);

        response.data.media = {};
        response.data.media.cf_account_hash = process.env.CF_ACCOUNT_HASH;
        response.data.media.cf_image_host = "https://imagedelivery.net";
        response.data.media.cf_video_host = "https://customer-sontmjltd8tzfbv9.cloudflarestream.com";

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

    const id = req.user.userId;
    try {
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

const reportIssue = async (req, res) => {

    const thisUserId = req.user.userId;
    try {
        const user = new User();
        const response = await user.report(thisUserId, req.body);

        return res.status(response.statusCode).json(response);
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
    const id = req.params.id;
    const thisUserId = req.user.userId;
    try {
        const user = new User();
        const response = await user.deleteById(id, thisUserId);

        res.json(response);
    } catch (err) {
        res.status(500).json(Utils.internalServerError());
    }
};

module.exports = {
    getUsers,
    singleUser,
    singleUserVideoProfile,
    addUser,
    updateUser,
    updateSettings,
    changePassword,
    reportIssue,
    blockedUsers,
    blockUser,
    removeBlockUser,
    deleteUser,
};
