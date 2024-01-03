const Utils = require('../../helpers/utils');
const AdminUsers = require('../models/admin_users.model');

const getUsers = async (req, res) => {
    try {
        const page = req.params.page ?? 1;
        const model = new AdminUsers();
        const response = await model.list(page, req.body);

        res.json(response);
    } catch (err) {
        res.status(500).json(Utils.internalServerError());
    }
};

const addUser = async (req, res) => {
    try {
        const user = new AdminUsers();
        const response = await user.add(req.body);

        res.status(response.statusCode).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).send(Utils.internalServerError());
    }
};

const updateUser = async (req, res) => {
    const id = req.params.id;

    try {
        const model = new AdminUsers();
        const response = await model.findByIdAndUpdate(id, req.body);

        return res.status(response.statusCode).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json(Utils.internalServerError());
    }
};

const deleteUser = async (req, res) => {
    const id = req.params.id;

    try {
        const model = new AdminUsers();
        const response = await model.deleteById(id);

        res.json(response);
    } catch (err) {
        res.status(500).json(Utils.internalServerError());
    }
};

module.exports = {
    getUsers,
    addUser,
    updateUser,
    deleteUser
};
