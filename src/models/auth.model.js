const Model = require('../models/model');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Utils = require('../helpers/utils');
const { explode } = require('../helpers/utils');

class Auth extends Model {
    constructor() {
        super();
    }

    async auth(sqlArgs) {

        var deviceToken = '';
        if (sqlArgs.device_token) {
            deviceToken = sqlArgs.device_token;
            delete sqlArgs.device_token;
        }
        const sqlParam = sqlArgs;
        const rows = await this.checkUsername('users', sqlParam.email);

        if (rows.length == 0) {
            this.output.badRequest('Username or Password incorrect.');
            return this.output.response();
        }

        const userData = rows[0];

        if (userData.status != 'Active') {
            this.output.badRequest('Your account is inactive. Please contact support.');
            return this.output.response();
        }

        if (!await bcrypt.compare(sqlParam.password, userData.password)) {
            this.output.badRequest('Password incorrect.');
            return this.output.response();
        }

        await this.addDevice(deviceToken, userData.id);

        const token = this.generateAccessToken({ userId: userData.id })

        const uArgs = {
            last_activity_on: Utils.mysqlDate(),
            last_login: Utils.mysqlDate()
        };
        await this.updateQuery('users', uArgs, userData.id);

        if (this.isError) return this.output.response();

        const args = {
            userId: userData.id
        };
        const data = await this.getOneQuery('get_user_by_id', args);

        const connectionArr = explode(data.followed_books, ',');
        data.connectionCount = connectionArr.length;
        data.friendsCount = await this.getCount('get_friends_count', args);

        this.output.okRequest('Login success.', { accessToken: token, user: data });
        return this.output.response();
    }

    async forgotPassword(param) {

        this.requiredCols = {
            email: 'email'
        }
        this.validate(param);

        if (this.isError) return this.output.response();

        const rows = await this.checkUsername('users', param.email);

        if (rows.length == 0) {
            this.output.badRequest('Username not found');
            return this.output.response();
        }

        const userData = rows[0];

        // Update user table with activation_key
        const activation_key = Utils.randomStr();
        const sqlParam = {
            reset_password_key: activation_key,
            reset_password_request_on: Utils.mysqlDate()
        };
        await this.updateQuery('users', sqlParam, userData.id);

        if (this.isError) return this.output.response();

        // create reset password link
        const tags = {
            name: userData.fullname ?? '',
            action_url: `${process.env.SITE_URL}/reset-password?email=${userData.email}&activation_key=${activation_key}`
        };
        try {
            // send email with reset password link //userData.email
            const sendEmail = await Utils.sendEmail("chknabeel@hotmail.com", "You have requested a password reset", tags, 'reset_password');
            this.output.okRequest('Reset password link sent to your email address', null);
        } catch (err) {
            console.log(err);
            this.output.badRequest('Email not sent');
        }

        return this.output.response();
    }

    async resetPassword(param) {
        this.requiredCols = {
            password: 'password',
            confirm_password: 'password',
            reset_password_key: 'required'
        }
        this.validate(param);

        if (this.isError) return this.output.response();

        const rows = await this.checkResetPasswordKey('users', param.reset_password_key);

        if (rows.length == 0) {
            this.output.badRequest('Link expired. Please resend the request.');
            return this.output.response();
        }

        const userData = rows[0];

        param.password = await bcrypt.hash(param.password, 10);

        const args = {
            password: param.password,
            reset_password_key: ''
        };
        await this.updateQuery('users', args, userData.id);

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

    async verifyEmail(param) {
        this.requiredCols = {
            email: 'required',
            email_verification_key: 'required'
        }
        this.validate(param);

        if (this.isError) return this.output.response();

        const rows = await this.checkEmailVerificationKey('users', param.email, param.email_verification_key);

        if (rows.length == 0) {
            this.output.badRequest('Invalid link. Please resend the request.');
            return this.output.response();
        }

        const userData = rows[0];

        const args = {
            email_verified: 'Verified',
            email_verification_key: ''
        };
        await this.updateQuery('users', args, userData.id);

        if (this.isError) return this.output.response();

        return this.output.createOkResponse('email verified', null);
    }

    generateAccessToken(userId) {
        return jwt.sign(userId, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 86400 });
    }
}

module.exports = Auth;