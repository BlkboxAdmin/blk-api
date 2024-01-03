const Utils = require('../../helpers/utils');
const Templates = require('../models/templates.model');

const getTemplates = async (req, res) => {
    try {
        const page = req.params.page ?? 1;
        const model = new Templates();
        const response = await model.list(page, req.body);

        res.json(response);
    } catch (err) {
        res.status(500).json(Utils.internalServerError());
    }
};

const singleTemplate = async (req, res) => {
    try {
        const model = new Templates();
        const response = await model.find(req.params);

        res.json(response);
    } catch (err) {
        res.status(500).json(Utils.internalServerError());
    }
};

const addTemplate = async (req, res) => {
    try {
        const model = new Templates();
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

const updateTemplate = async (req, res) => {
    const id = req.params.id;

    try {
        const model = new Templates();
        const response = await model.findByIdAndUpdate(id, req.body);

        return res.status(response.statusCode).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json(Utils.internalServerError());
    }
};

const deleteTemplate = async (req, res) => {
    const id = req.params.id;

    try {
        const model = new Templates();
        const response = await model.deleteById(id);

        res.json(response);
    } catch (err) {
        res.status(500).json(Utils.internalServerError());
    }
};

module.exports = {
    getTemplates,
    singleTemplate,
    addTemplate,
    updateTemplate,
    deleteTemplate,
};
