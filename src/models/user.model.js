const Model = require('../models/model');
const bcrypt = require("bcrypt");
const date = require('date-and-time');
const { explode, whereInStr } = require('../helpers/utils');
const { consumers } = require('nodemailer/lib/xoauth2');
const e = require('express');
const Utils = require('../helpers/utils');

class User extends Model {
    constructor() {
        super();
        this.tableName = 'users';
    }

    validateAge(age, key, obj) {
        obj.isRequired(age, key);

        if (age < 0) {
            obj.output.badRequest('Invalid age value.');
            return false;
        }
    }

    async find(sqlParam) {

        this.requiredCols = {
            userId: 'required'
        };
        this.validate(sqlParam);

        const data = await this.getOneQuery('get_user_by_id', sqlParam);

        if (!data) return this.output.createBadRequest('User not found');

        const connectionArr = explode(data.followed_books, ',');
        data.connectionCount = connectionArr.length;
        data.friendsCount = await this.getCount('get_friends_count', sqlParam);

        this.output.okRequest('', data);
        return this.output.response();
    }

    async add(sqlArgs) {

        var deviceToken = '';
        if (sqlArgs.device_token) {
            deviceToken = sqlArgs.device_token;
            delete sqlArgs.device_token;
        }
        const sqlParam = sqlArgs;

        this.requiredCols = {
            email: 'email',
            password: 'password',
            phone: 'required',
            dob: 'required'
        }

        this.validate(sqlParam);

        const duplicates = await this.checkDuplicates(this.tableName, 'email', sqlParam.email);

        if (duplicates > 0) {
            this.output.badRequest('email already exists.');
        }

        const activation_key = Utils.randomStr();
        sqlParam.email_verification_key = activation_key;
        sqlParam.email_verification_request_on = Utils.mysqlDate();
        sqlParam.username = sqlParam.email.split("@")[0];
        sqlParam.password = await bcrypt.hash(sqlParam.password, 10);
        sqlParam.dob = date.format((new Date(sqlParam.dob)), 'YYYY/MM/DD HH:mm:ss');

        if (this.isError) return this.output.response();

        await this.insertQuery(this.tableName, sqlParam);
        // send verification email
        const userData = this.output.data

        await this.addDevice(deviceToken, this.output.data.id);

        const tags = {
            name: userData.fullname ?? '',
            email_text: 'We are thrilled to have you on board! Click the button below to verify your email.',
            button_txt: 'Verify',
            action_url: `${process.env.SITE_URL}/email-verification?email=${userData.email}&activation_key=${activation_key}`
        };
        try {
            // send email with reset password link //userData.email
            const sendEmail = await Utils.sendEmail("chknabeel@hotmail.com", "Verify your email address", tags, 'generic');
            this.output.okRequest('Verification link sent to your email address', null);
        } catch (err) {
            console.log(err);
            this.output.badRequest('Email not sent');
        }

        return this.output.response();
    }

    async findByIdAndUpdate(id, sqlParam) {

        this.requiredCols = {
            username: 'required',
            fullname: 'required',
            phone: 'required',
            dob: 'required',
            bio: 'required'
        }

        this.validate(sqlParam);

        const duplicates = await this.checkDuplicatesForExisting(this.tableName, 'username', sqlParam.username, id);

        if (duplicates > 0) {
            this.output.badRequest('username already exists.');
        }

        // TODO: need to check for extra parametter. To block request is there are more than expected parameters
        sqlParam.dob = date.format((new Date(sqlParam.dob)), 'YYYY/MM/DD HH:mm:ss');

        if (!this.isError) {
            await this.updateQuery(this.tableName, sqlParam, id);
        }

        return this.output.response();
    }

    async findByIdAndUpdateCol(id, sqlParam) {

        const settingColumns = ['show_online', 'push_notification', 'sms_notification', 'email_notification'];

        if (!this.sanitizeRequest(settingColumns, sqlParam)) return this.output.response();

        await this.updateQuery(this.tableName, sqlParam, id);

        return this.output.response();
    }

    async report(userId, sqlParam) {

        this.requiredCols = {
            description: 'required'
        }

        this.validate(sqlParam);

        if (this.isError) return this.output.response();

        const userData = await this.getOneQuery('get_user_by_id', { userId: userId });

        if (!userData) return this.output.createBadRequest('User not found');

        const tags = {
            name: 'Admin',
            email_text: `${sqlParam.description}<br><br>User Details:<br>User email address: ${userData.email}<br>Name: ${userData.fullname}`
        };
        try {
            // support@theblkboxapp.com
            const sendEmail = await Utils.sendEmail("chknabeel@hotmail.com", `${userData.fullname} reported an issue from Blk Box app`, tags, 'generic_no_btn');
            this.output.okRequest('Issue reported', null);
        } catch (err) {
            console.log(err);
            this.output.badRequest('Email not sent');
        }

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

        if (this.isError) return this.output.response();

        // Send email to user about password change
        const tags = {
            name: userData.fullname ?? '',
            email_text: 'This message is to confirm that your account password has been successfully changed.<br><br>If you did not request a password change, please contact us immediately. support@blkbox.com'
        };
        try {
            //userData.email
            const sendEmail = await Utils.sendEmail("chknabeel@hotmail.com", "Your account password has been changed", tags, 'generic_no_btn');
            this.output.okRequest('Your account password has been changed', null);
        } catch (err) {
            console.log(err);
            this.output.badRequest('Email not sent');
        }

        return this.output.response();
    }

    async blockList(userId) {

        const sqlParam = {
            userId: userId
        };

        const userData = await this.getOneQuery('get_user_by_id', sqlParam);

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
        const row = await this.getOneQuery('get_user_by_id', sqlParam);

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
        const row = await this.getOneQuery('get_user_by_id', sqlParam);

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
        const row = await this.getOneQuery('get_user_by_id', sqlParam);

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

    async deleteById(id, thisUserId) {

        const data = await this.getOneQuery('get_user_by_id', { id: id });

        if (!data) return this.output.createBadRequest("Record not found");

        if (data.id != thisUserId) return this.output.createBadRequest("Access denied");

        await this.updateQuery(this.tableName, { status: 'Deleted' }, id);
        return this.output.response();
    }
}

module.exports = User;
