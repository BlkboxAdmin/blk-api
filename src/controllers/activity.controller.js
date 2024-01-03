const Response = require('../helpers/response');
const Utils = require('../helpers/utils');
const Activity = require('../models/activity.model');
const Books = require('../models/books.model');
const Frinds = require('../models/friends.model');
const Stories = require('../models/stories.model');
const Templates = require('../models/templates.model');
const TimeStories = require('../models/time_stories.model');
const { addNotification } = require('./notifications.controller');

const getActivity = async (req, res) => {
    try {
        const page = isNaN(req.params.page) ? 1 : req.params.page;
        const sqlParam = {
            userId: req.body.userId ?? req.user.userId
        };
        const model = new Activity();
        const response = await model.list(page, sqlParam);

        res.json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json(Utils.internalServerError());
    }
};

const addActivity = async (params) => {
    try {

        const output = new Response();
        let modelRes = {};
        const data = params.data;
        const template = new Templates();
        const templateData = await template.find({ type: params.type });
        params.template_id = templateData.data.id

        switch (params.type) {

            case 'NEW_BOOK_LIKE_ACTIVITY':
            case 'NEW_FOLLOW_ACTIVITY':

                const book = new Books();
                modelRes = await book.find({ id: data.id });

                if (modelRes.statusCode > 202) return output.createBadRequest(modelRes.message);

                params.data = modelRes.data;

                var aParams = {
                    type: (params.type == 'NEW_FOLLOW_ACTIVITY') ? 'NEW_FOLLOWER_NOTIFICATION' : 'NEW_BOOK_LIKE_NOTIFICATION',
                    data: { userId: params.user_id },
                    user_id: params.data.created_by
                };
                var res = await addNotification(aParams);

                if (res.statusCode > 202) return output.createBadRequest(res.message);

                break;

            case 'NEW_STORY_LIKE_ACTIVITY':
            case 'NEW_STORY_REPOST_ACTIVITY':

                const story = new Stories();
                modelRes = await story.find({ id: data.id });
                params.data = modelRes.data;

                var aParams = {
                    type: (params.type == 'NEW_STORY_REPOST_ACTIVITY') ? 'NEW_STORY_REPOST_NOTIFICATION' : 'NEW_STORY_LIKE_NOTIFICATION',
                    data: { user: { userId: params.user_id }, story: { id: data.id } },
                    user_id: params.data.created_by
                };
                var res = await addNotification(aParams);

                if (res.statusCode > 202) return output.createBadRequest(res.message);

                break;

            case 'NEW_TIME_STORY_LIKE_ACTIVITY':
            case 'NEW_TIME_STORY_REPOST_ACTIVITY':

                const timeStory = new TimeStories();
                modelRes = await timeStory.find({ id: data.id });
                params.data = modelRes.data;

                var aParams = {
                    type: (params.type == 'NEW_TIME_STORY_REPOST_ACTIVITY') ? 'NEW_TIME_STORY_REPOST_NOTIFICATION' : 'NEW_TIME_STORY_LIKE_NOTIFICATION',
                    data: { user: { userId: params.user_id }, story: { id: data.id } },
                    user_id: params.data.created_by
                };
                var res = await addNotification(aParams);

                if (res.statusCode > 202) return output.createBadRequest(res.message);

                break;

            case 'NEW_FRIEND_REQUEST_ACTIVITY':
            case 'ACCEPTED_FRIEND_REQUEST_ACTIVITY':
            case 'DECLINED_FRIEND_REQUEST_ACTIVITY':

                if (params.type == 'NEW_FRIEND_REQUEST_ACTIVITY') {
                    var aParams = {
                        type: 'NEW_FRIEND_REQUEST_NOTIFICATION',
                        data: params.data,
                        user_id: data.receiver_user_id
                    };
                    var res = await addNotification(aParams);

                    if (res.statusCode > 202) return output.createBadRequest(res.message);

                } else if (params.type == 'ACCEPTED_FRIEND_REQUEST_ACTIVITY') {
                    var aParams = {
                        type: 'ACCEPTED_FRIEND_REQUEST_NOTIFICATION',
                        data: params.data,
                        user_id: data.sender_user_id
                    };
                    var res = await addNotification(aParams);

                    if (res.statusCode > 202) return output.createBadRequest(res.message);
                }

                const friend = new Frinds();
                modelRes = await friend.find({ id: data.id });
                params.data = modelRes.data;
                break;

            default:
                break;
        }

        params.data = JSON.stringify(params.data);

        const model = new Activity();
        const response = await model.add(params);

        return response;
    } catch (err) {
        console.log(err);
        return Utils.internalServerError();
    }
};

const updateActivity = async (req, res) => {
    const id = req.params.id;

    try {
        const model = new Activity();
        const response = await model.findByIdAndUpdate(id, req.body);

        return res.status(response.statusCode).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json(Utils.internalServerError());
    }
};

const deleteActivity = async (req, res) => {
    const id = req.params.id;

    try {
        const model = new Activity();
        const response = await model.deleteById(id);

        res.json(response);
    } catch (err) {
        res.status(500).json(Utils.internalServerError());
    }
};

module.exports = {
    getActivity,
    addActivity,
    updateActivity,
    deleteActivity,
};
