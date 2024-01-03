const Model = require('../../models/model');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Utils = require('../../helpers/utils');

class Auth extends Model {
    constructor() {
        super(true);
        this.tableName = 'admin_users';
    }

    async auth(sqlParam) {

        const rows = await this.checkUsername(this.tableName, sqlParam.email);

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

        const token = this.generateAccessToken({ userId: userData.id })

        const uArgs = {
            last_login: Utils.mysqlDate()
        };
        await this.updateQuery(this.tableName, uArgs, userData.id);

        if (this.isError) return this.output.response();

        const args = {
            userId: userData.id
        };
        const data = await this.runQuery('get_admin_user_by_id', args);

        this.output.okRequest('Login success.', { accessToken: token, user: data });
        return this.output.response();
    }

    async forgotPassword(param) {

        this.requiredCols = {
            email: 'email'
        }
        this.validate(param);

        if (this.isError) return this.output.response();

        const rows = await this.checkUsername(this.tableName, param.email);

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
        await this.updateQuery(this.tableName, sqlParam, userData.id);

        if (this.isError) return this.output.response();

        // create reset password link
        const tags = {
            name: userData.fullname ?? '',
            action_url: `https://blkbox.com/reset-password?email=${userData.email}&activation_key=${activation_key}`
        };
        try {
            // send email with reset password link
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

        const rows = await this.checkResetPasswordKey(this.tableName, param.reset_password_key);

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
        await this.updateQuery(this.tableName, args, userData.id);

        //if (this.isError) return this.output.response();
        // TODO: Send email to user about password change

        return this.output.response();
    }

    generateAccessToken(userId) {
        return jwt.sign(userId, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 86400 });
    }
}

module.exports = Auth;