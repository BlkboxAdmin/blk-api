const Utils = require('../helpers/utils');
const Friends = require('../models/friends.model');
const { addActivity } = require('./activity.controller');

const getFriends = async (req, res) => {
    try {
        const page = req.params.page ?? 1;
        const model = new Friends();
        const response = await model.list(page);

        res.json(response);
    } catch (err) {
        res.status(500).json(Utils.internalServerError());
    }
};

const singleFriend = async (req, res) => {
    try {
        const model = new Friends();
        const response = await model.find(req.params);

        res.json(response);
    } catch (err) {
        res.status(500).json(Utils.internalServerError());
    }
};

const invite = async (req, res) => {
    try {
        const model = new Friends();
        const thisUserId = req.user.userId;
        const params = req.body;

        params.sender_user_id = thisUserId;
        params.created_by = thisUserId;

        var response = await model.add(params);

        if (!response.data) return res.status(response.statusCode).json(response);

        const aParams = {
            type: 'NEW_FRIEND_REQUEST_ACTIVITY',
            data: response.data,
            user_id: thisUserId,
            created_by: thisUserId
        };
        response = await addActivity(aParams);

        res.status(response.statusCode).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).send(Utils.internalServerError());
    }
};

const answerInvite = async (req, res) => {
    const id = req.params.id;
    const thisUserId = req.user.userId;
    const isAccepted = (req.body.answer == 'Accept');

    try {
        const model = new Friends();
        var response = await model.updateAnswer(id, req.body);

        if (!response.data) return res.status(response.statusCode).json(response);

        const aParams = {
            type: isAccepted ? 'ACCEPTED_FRIEND_REQUEST_ACTIVITY' : 'DECLINED_FRIEND_REQUEST_ACTIVITY',
            data: response.data,
            user_id: thisUserId,
            created_by: thisUserId
        };
        response = await addActivity(aParams);

        return res.status(response.statusCode).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json(Utils.internalServerError());
    }
};

const unFriend = async (req, res) => {

    const args = req.body;
    args.userId = req.user.userId;

    try {
        const model = new Friends();
        const response = await model.unfriend(args);

        res.json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json(Utils.internalServerError());
    }
};

module.exports = {
    getFriends,
    singleFriend,
    invite,
    answerInvite,
    unFriend,
};
