const Utils = require('../../helpers/utils');
const Books = require('../models/books.model');

const getBooks = async (req, res) => {
    try {
        const page = req.params.page ?? 1;
        const model = new Books();
        const response = await model.list(page, req.body);

        res.json(response);
    } catch (err) {
        res.status(500).json(Utils.internalServerError());
    }
};

const updateBook = async (req, res) => {
    const id = req.params.id;
    const thisUserId = req.user.userId;
    try {
        const model = new Books();
        const response = await model.findByIdAndUpdate(id, req.body);

        return res.status(response.statusCode).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json(Utils.internalServerError());
    }
};

const deleteBook = async (req, res) => {
    const id = req.params.id;
    const thisUserId = req.user.userId;
    try {
        const model = new Books();
        const response = await model.deleteById(id);

        res.json(response);
    } catch (err) {
        res.status(500).json(Utils.internalServerError());
    }
};

module.exports = {
    getBooks,
    updateBook,
    deleteBook,
};