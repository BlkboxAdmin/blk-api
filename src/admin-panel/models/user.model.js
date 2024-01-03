const Model = require('../../models/model');
const bcrypt = require("bcrypt");
const date = require('date-and-time');
const { explode, whereInStr } = require('../../helpers/utils');
const { consumers } = require('nodemailer/lib/xoauth2');
const e = require('express');

class User extends Model {
    constructor() {
        super(true);
        this.tableName = 'users';
    }

    async list(page, args) {

        this.requiredCols = {
            status: 'required',
            verification_status: 'required',
            email_verified: 'required'
        };
        this.validate(args);

        if (this.isError) return this.output.response();

        const data = await this.getPageData(page, 'get_users_count', args, 10);
        args.offset = data.offset;
        args.perPage = data.perPage;
        data.rows = await this.runQuery('get_users', args);

        this.output.okRequest('', data);
        return this.output.response();
    }

    async find(sqlParam) {

        this.requiredCols = {
            userId: 'required'
        };
        this.validate(sqlParam);

        const data = await this.getOneQuery('get_admin_user_by_id', sqlParam);

        if (!data) return this.output.createBadRequest('User not found');

        const connectionArr = explode(data.followed_books, ',');
        data.connectionCount = connectionArr.length;
        data.friendsCount = await this.getCount('get_friends_count', sqlParam);

        this.output.okRequest('', data);
        return this.output.response();
    }

    async add(sqlParam) {

        this.requiredCols = {
            email: 'email',
            password: 'password'
        }

        this.validate(sqlParam);

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

        await this.updateQuery(this.tableName, sqlParam, id);

        return this.output.response();
    }

    async findByIdAndUpdateCol(id, sqlParam) {

        const settingColumns = ['show_online', 'push_notification', 'sms_notification', 'email_notification'];

        if (!this.sanitizeRequest(settingColumns, sqlParam)) return this.output.response();

        await this.updateQuery(this.tableName, sqlParam, id);

        return this.output.response();
    }

    async updatePassword(userId, param) {
        this.requiredCols = {
            old_password: 'required',
            password: 'password',
            confirm_password: 'password'
        }
        this.validate(param);

        if (this.isError) return this.output.response();

        if (param.password != param.confirm_password) return this.output.createBadRequest("New password and confirm password don't match");

        const rows = await this.checkUserId(this.tableName, userId);

        if (rows.length == 0) return this.output.createBadRequest('User not found.');

        const userData = rows[0];

        if (userData.status != 'Active') {
            this.output.badRequest('Your account is inactive. Please contact support.');
            return this.output.response();
        }

        if (!await bcrypt.compare(param.old_password, userData.password)) {
            return this.output.createBadRequest('Password incorrect.');
        }

        param.password = await bcrypt.hash(param.password, 10);

        const args = {
            password: param.password
        };
        await this.updateQuery(this.tableName, args, userData.id);

        //if (this.isError) return this.output.response();
        // TODO: Send email to user about password change

        return this.output.response();
    }

    async blockList(userId) {

        const sqlParam = {
            userId: userId
        };

        const userData = await this.getOneQuery('get_admin_user_by_id', sqlParam);

        if (!userData) return this.output.createBadRequest('User not found');

        if (userData.blocked_user_ids == '') return this.output.createOkResponse("No blocks", {});

        const params = {
            userIds: whereInStr(userData.blocked_user_ids)
        };
        const data = await this.runQuery('get_users_where_in', params);

        this.output.okRequest('', data);
        return this.output.response();
    }

    async updateFollowedBooks(bookId, userId) {

        if (!bookId) return this.output.createBadRequest('Book ID missing');

        const sqlParam = {
            userId: userId
        };
        const row = await this.getOneQuery('get_admin_user_by_id', sqlParam);

        if (!row) return this.output.createBadRequest("Record not found");

        const booksArr = explode(row.followed_books, ',');
        const booksIdx = booksArr.indexOf(bookId);
        const isAlreadyFollowed = booksIdx > -1;

        if (isAlreadyFollowed) {
            booksArr.splice(booksIdx, 1);
        }
        else {
            booksArr.push(bookId);
        }

        if (!this.isError) {
            const params = {
                followed_books: booksArr.join(',')
            };
            await this.updateQuery(this.tableName, params, userId);
        }

        return this.output.response();
    }

    async block(userId, args) {

        this.requiredCols = {
            blockedUserId: 'required'
        }

        this.validate(args);

        if (this.isError) return this.output.response();

        const sqlParam = {
            userId: userId
        };
        const row = await this.getOneQuery('get_admin_user_by_id', sqlParam);

        if (!row) return this.output.createBadRequest("Record not found");

        const blockedUserArr = explode(row.blocked_user_ids, ',');
        const blockedUserIdx = blockedUserArr.indexOf(args.blockedUserId);
        const isAlreadyBlocked = blockedUserIdx > -1;

        if (isAlreadyBlocked) return this.output.createBadRequest('This user is already blocked');

        blockedUserArr.push(args.blockedUserId);

        if (!this.isError) {
            const params = {
                blocked_user_ids: blockedUserArr.join(',')
            };
            await this.updateQuery(this.tableName, params, userId);
        }

        return this.output.response();
    }

    async removeBlock(userId, args) {

        this.requiredCols = {
            blockedUserId: 'required'
        }

        this.validate(args);

        if (this.isError) return this.output.response();

        const sqlParam = {
            userId: userId
        };
        const row = await this.getOneQuery('get_admin_user_by_id', sqlParam);

        if (!row) return this.output.createBadRequest("Record not found");

        const blockedUserArr = explode(row.blocked_user_ids, ',');
        const blockedUserIdx = blockedUserArr.indexOf(args.blockedUserId);
        const isAlreadyBlocked = blockedUserIdx > -1;

        if (!isAlreadyBlocked) return this.output.createBadRequest('This user is not blocked');

        blockedUserArr.splice(blockedUserIdx, 1);

        if (!this.isError) {
            const params = {
                blocked_user_ids: blockedUserArr.join(',')
            };
            await this.updateQuery(this.tableName, params, userId);
        }

        return this.output.response();
    }

    async deleteById(id) {

        await this.updateQuery(this.tableName, { status: 'Deleted' }, id);
        return this.output.response();
    }
}

module.exports = User;
