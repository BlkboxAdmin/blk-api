const Utils = require('../../helpers/utils');
const TimeStories = require('../models/time_stories.model');

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
    updateStory,
    deleteStory
};
