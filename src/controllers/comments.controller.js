const Utils = require('../helpers/utils');
const Comments = require('../models/comments.model');

const getComments = async (req, res) => {
    try {
        const page = req.params.page ?? 1;
        const model = new Comments();
        const response = await model.list(page, req.body);

        res.json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json(Utils.internalServerError());
    }
};

const addComment = async (req, res) => {
    try {
        const model = new Comments();
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

const deleteComment = async (req, res) => {
    const id = req.params.id;
    const thisUserId = req.user.userId;
    try {
        const model = new Comments();
        const response = await model.deleteById(id, thisUserId);

        res.json(response);
    } catch (err) {
        res.status(500).json(Utils.internalServerError());
    }
};

module.exports = {
    getComments,
    addComment,
    deleteComment
};