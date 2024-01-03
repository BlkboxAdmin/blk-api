const Utils = require('../helpers/utils');
const Frinds = require('../models/friends.model');
const Messages = require('../models/messages.model');
const Thread = require('../models/thread.model');
const { addNotification } = require('./notifications.controller');

const searchRecipients = async (req, res) => {
    try {
        const query = req.query.q ?? '';
        const thisUserId = req.user.userId;
        const model = new Frinds();
        const args = {
            query: query,
            userId: thisUserId
        };
        const response = await model.list(args);

        res.json(response);
    } catch (err) {
        res.status(500).json(Utils.internalServerError());
    }
};

const checkNewMessages = async (req, res) => {
    try {
        const thisUserId = req.user.userId;
        const model = new Messages();
        const response = await model.checkNewMessage(thisUserId, req.body);

        res.json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json(Utils.internalServerError());
    }
};

const messageList = async (req, res) => {
    try {
        const page = req.params.page ?? 1;
        const threadId = req.body.threadId;
        const thisUserId = req.user.userId;
        const model = new Messages();
        const args = {
            threadId: threadId,
            thisUserId: thisUserId
        };
        const response = await model.list(page, args);

        res.json(response);
    } catch (err) {
        res.status(500).json(Utils.internalServerError());
    }
};

const openThread = async (req, res) => {
    try {
        const model = new Thread();
        const thisUserId = req.user.userId;
        const params = req.body;

        params.sender_user_id = thisUserId;

        const response = await model.find(params);

        res.status(response.statusCode).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).send(Utils.internalServerError());
    }
};

const compose = async (req, res) => {
    const params = req.body;
    const thisUserId = req.user.userId;
    params.created_by = thisUserId;

    try {
        const model = new Messages();
        const thread = new Thread();
        var response = await model.add(params);

        if (response.statusCode > 202) return res.status(response.statusCode).json(response);

        const participants = await thread.getRecipients({ id: params.thread_id }, thisUserId);

        var aParams = {
            type: 'NEW_MESSAGE_NOTIFICATION',
            data: response.data,
            user_id: participants.data[0]
        };
        response = await addNotification(aParams);

        return res.status(response.statusCode).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json(Utils.internalServerError());
    }
};

const deleteMessage = async (req, res) => {
    const id = req.params.id;

    try {
        const model = new Books();
        const response = await model.deleteById(id);

        res.json(response);
    } catch (err) {
        res.status(500).json(Utils.internalServerError());
    }
};

module.exports = {
    searchRecipients,
    checkNewMessages,
    messageList,
    openThread,
    compose,
    deleteMessage,
};
