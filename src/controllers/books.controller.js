const { addSlashes } = require('../helpers/utils');
const Utils = require('../helpers/utils');
const Books = require('../models/books.model');
const User = require('../models/user.model');
const { addActivity } = require('./activity.controller');

const getBooks = async (req, res) => {
    try {
        const page = req.params.page ?? 1;
        const model = new Books();
        const response = await model.list(page);

        res.json(response);
    } catch (err) {
        res.status(500).json(Utils.internalServerError());
    }
};

const singleBook = async (req, res) => {
    try {
        const model = new Books();
        const response = await model.find(req.params);

        res.json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json(Utils.internalServerError());
    }
};

const addBook = async (req, res) => {
    try {
        const model = new Books();
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

const like = async (req, res) => {
    const bookId = req.params.bookId;
    const likerId = req.user.userId;
    try {
        const model = new Books();
        let response = await model.updateLikes(bookId, likerId);

        if (!response.data) return res.status(response.statusCode).json(response);

        const aParams = {
            type: 'NEW_BOOK_LIKE_ACTIVITY',
            data: response.data,
            user_id: likerId,
            created_by: likerId
        };
        response = await addActivity(aParams);

        return res.status(response.statusCode).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json(Utils.internalServerError());
    }
};

const disLike = async (req, res) => {
    const bookId = req.params.bookId;
    const disLikerId = req.user.userId;
    try {
        const model = new Books();
        const response = await model.updateDisLikes(bookId, disLikerId);

        return res.status(response.statusCode).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json(Utils.internalServerError());
    }
}

const follow = async (req, res) => {
    const bookId = req.params.bookId;
    const followerId = req.user.userId;
    try {
        const model = new User();
        let response = await model.updateFollowedBooks(bookId, followerId);

        if (!response.data) return res.status(response.statusCode).json(response);

        const aParams = {
            type: 'NEW_FOLLOW_ACTIVITY',
            data: { id: bookId },
            user_id: followerId,
            created_by: followerId
        };
        response = await addActivity(aParams);

        return res.status(response.statusCode).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json(Utils.internalServerError());
    }
};

const updateBook = async (req, res) => {
    const id = req.params.id;
    const thisUserId = req.user.userId;
    try {
        const model = new Books();
        const response = await model.findByIdAndUpdate(id, req.body, thisUserId);

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
        const response = await model.deleteById(id, thisUserId);

        res.json(response);
    } catch (err) {
        res.status(500).json(Utils.internalServerError());
    }
};

module.exports = {
    getBooks,
    singleBook,
    addBook,
    like,
    disLike,
    follow,
    updateBook,
    deleteBook,
};