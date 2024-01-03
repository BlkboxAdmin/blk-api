const Model = require('../../models/model');
const bcrypt = require("bcrypt");
const { consumers } = require('nodemailer/lib/xoauth2');
const e = require('express');

class AdminUsers extends Model {
    constructor() {
        super(true);
        this.tableName = 'admin_users';
    }

    async list(page, args) {

        this.requiredCols = {
            status: 'required'
        }

        this.validate(args);

        if (this.isError) return this.output.response();

        const data = await this.getPageData(page, 'get_admin_users_count', args, 10);
        args.offset = data.offset;
        args.perPage = data.perPage;
        data.rows = await this.runQuery('get_admin_users', args);

        this.output.okRequest('', data);
        return this.output.response();
    }

    async find() {
        const args = {
            age: 10,
            query: ''
        };
        const data = await this.runQuery('get_user_by_id', args);

        if (!data) return this.output.createBadRequest("Record not found");

        this.output.okRequest('', data);
        return this.output.response();
    }

    async add(sqlParam) {

        this.requiredCols = {
            email: 'email',
            password: 'password'
        }

        this.validate(sqlParam);

        if (this.isError) return this.output.response();

        const duplicates = await this.checkDuplicates(this.tableName, 'email', sqlParam.email);

        if (duplicates > 0) {
            this.output.badRequest('email already exists.');
        }

        sqlParam.username = sqlParam.email.split("@")[0];
        sqlParam.password = await bcrypt.hash(sqlParam.password, 10);

        if (!this.isError) {
            await this.insertQuery(this.tableName, sqlParam);
            // TODO: send verification email
        }

        return this.output.response();
    }

    async findByIdAndUpdate(id, sqlParam) {

        this.requiredCols = {
            status: 'required'
        }
        this.validate(sqlParam);

        if (this.isError) return this.output.response();

        if (['Active', 'Inactive'].indexOf(sqlParam.status) == -1) return this.output.createBadRequest('Invalid status');

        await this.updateQuery(this.tableName, sqlParam, id);

        return this.output.response();
    }

    async deleteById(id) {

        await this.updateQuery(this.tableName, { status: 'Deleted' }, id);
        return this.output.response();
    }
}

module.exports = AdminUsers;