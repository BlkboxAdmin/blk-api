const Utils = require('../helpers/utils');
const TimeStories = require('../models/time_stories.model');
const { addActivity } = require('./activity.controller');

const getStories = async (req, res) => {
    try {
        const page = req.params.page ?? 1;
        const model = new TimeStories();
        const response = await model.list(page, req.body);

        res.json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json(Utils.internalServerError());
    }
};

const getMyStories = async (req, res) => {
    try {
        const page = req.params.page ?? 1;
        const model = new TimeStories();
        const response = await model.listByUserId(page, req.body);

        res.json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json(Utils.internalServerError());
    }
};

const singleStory = async (req, res) => {
    try {
        const model = new TimeStories();
        const response = await model.find(req.params);

        res.json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json(Utils.internalServerError());
    }
};

const viewedStory = async (req, res) => {
    const thisUserId = req.user.userId;
    try {
        const model = new TimeStories();
        const response = await model.updateViews(req.params, thisUserId);

        res.json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json(Utils.internalServerError());
    }
};

const addStory = async (req, res) => {
    try {
        const model = new TimeStories();
        const thisUserId = req.user.userId;
        const params = req.body;

        params.created_by = thisUserId;

        const response = await model.add(params);

        res.status(response.statusCode).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).send(Utils.internalServerError());
    }
};

const fav = async (req, res) => {
    const storyId = req.params.storyId;
    const userId = req.user.userId;
    try {
        const model = new TimeStories();
        var response = await model.updateFavs(storyId, userId);

        if (!response.data) return res.status(response.statusCode).json(response);

        const aParams = {
            type: 'NEW_TIME_STORY_LIKE_ACTIVITY',
            data: response.data,
            user_id: userId,
            created_by: userId
        };
        response = await addActivity(aParams);

        return res.status(response.statusCode).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json(Utils.internalServerError());
    }
};

const repost = async (req, res) => {
    const storyId = req.params.storyId;
    const userId = req.user.userId;
    try {
        const model = new TimeStories();
        var response = await model.repost(storyId, req.body, userId);

        if (!response.data) return res.status(response.statusCode).json(response);

        const aParams = {
            type: 'NEW_TIME_STORY_REPOST_ACTIVITY',
            data: response.data,
            user_id: userId,
            created_by: userId
        };
        response = await addActivity(aParams);

        return res.status(response.statusCode).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json(Utils.internalServerError());
    }
};

const updateStory = async (req, res) => {
    const id = req.params.id;
    const thisUserId = req.user.userId;
    try {
        const model = new TimeStories();
        const response = await model.findByIdAndUpdate(id, req.body, thisUserId);

        return res.status(response.statusCode).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json(Utils.internalServerError());
    }
};

const deleteStory = async (req, res) => {
    const id = req.params.id;
    const thisUserId = req.user.userId;
    try {
        const model = new TimeStories();
        const response = await model.deleteById(id, thisUserId);

        res.json(response);
    } catch (err) {
        res.status(500).json(Utils.internalServerError());
    }
};

module.exports = {
    getStories,
    getMyStories,
    singleStory,
    viewedStory,
    addStory,
    fav,
    repost,
    updateStory,
    deleteStory,
};
